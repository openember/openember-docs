---
sidebar_position: 9
sidebar_label: RBU Specification
description: RBU (Robot Bundle Update) is a multi-component release description and update-bundle format for robots and complex intelligent devices. It aggregates, describes, verifies, and orchestrates update artifacts. It does not replace Debian packages, a Linux image, or an MCU firmware format.
---

# RBU Specification 1.0

:::caution Status: Draft / Experimental

**Specification version:** 1.0  
**RBU:** Robot Bundle Update

:::

RBU (Robot Bundle Update) is a **multi-component release description and update-bundle format** for robots and complex intelligent devices.

A robot rarely has a single software version. It is a set of independently updatable components: a Linux system, applications, system services, a PMU, a BMS, motors, sensors, and more. RBU describes that set in a format that is simple, transparent, and verifiable:

> **The software state a product Release should finally be in, and which Artifacts are required to bring a device to that state.**

RBU 1.0 is intentionally small. It does not try to define an update protocol for every device, and it does not replace RAUC, SWUpdate, Mender, or a vendor Bootloader or Firmware Updater. RBU defines only the robot-level **Release Contract + Bundle Format**.

---

## 1. Design goals

RBU 1.0 follows these principles:

- **Simple**: the format is small enough that a developer can implement a Reader, a Builder, and a Verifier quickly.
- **Transparent**: an update bundle is not a black box. It can be unpacked and inspected as `manifest.json` plus Artifacts.
- **Offline First**: RBU does not depend on a cloud. It can be delivered as a local file, over USB, through a Web Console, or over a local network.
- **Multi-component**: one Release can describe Linux, applications, services, and several MCU or peripheral firmware images at once.
- **Desired State**: a Release describes the complete software state the target device should reach.
- **Extensible**: RBU 1.0 defines only the minimum core. Later versions can add signatures, an instance model, dependencies, and transactions.
- **Implementation Independent**: RBU does not require a particular language, database, GUI, OTA Agent, or cloud platform.

---

## 2. Normative language

This document uses the following keywords for requirements:

- **MUST**: an implementation has to satisfy this, or it is not RBU 1.0.
- **MUST NOT**: an implementation must not behave this way.
- **SHOULD**: strongly recommended. Depart from it only with a clear understanding of the consequences.
- **SHOULD NOT**: generally not recommended.
- **MAY**: an optional capability.

---

## 3. Core concepts

The full RBU architecture can be read as seven layers, but **RBU 1.0 does not require users to operate seven models directly**.

| Term | Chinese | RBU 1.0 |
| --- | --- | --- |
| Release Model | 发布模型 / 整机发布模型 | Core |
| Component Model | 组件模型 | Core |
| Instance Model | 实例模型 / 设备实例模型 | Not standardized yet |
| Artifact Model | 制品模型 / 构建制品模型 | Core |
| Bundle Model | 升级包模型 | Core |
| Execution Model | 升级执行模型 | handler / order / reboot_after |
| Security Model | 安全模型 | Integrity verification |

For an ordinary RBU user, the only relationship the first version requires is:

```text
Release
   │
   ├── Component A ── Artifact A
   ├── Component B ── Artifact B
   └── Component C ── Artifact C
                  │
                  ▼
             RBU Bundle
```

---

## 4. Release Model

A Release is the complete target software state of a product: the **Desired State**.

For example:

```text
D50_HW1C1 Release 1.0.0
│
├── Linux Image         1.0.0
├── OpenEmber           1.0.0
├── PMU Firmware        1.0.0
├── BMS Firmware        1.0.0
└── Motor Firmware      1.0.0
```

Here:

- `1.0.0` is the **whole-product Product Release Version**;
- each Component also has its own version (they happen to be `1.0.0` above; a real product may use `0.8.2`, `2.0.1`, and so on);
- the two levels are different and must not be conflated.

One important rule of RBU 1.0:

> **A Release always describes the complete Desired State, not "the files this particular update happens to carry".**

So even when an Incremental RBU carries only one BMS firmware image, the Manifest still describes every Component Version of the target Release.

---

## 5. Component Model

A Component is a logical software or firmware unit with its own version lifecycle.

For example:

```text
system
openember
pmu
bms
motor
```

A Component is not the same thing as a file:

```text
Component: bms
Version:   1.0.1
Artifact:  bms_app_v1001.bin
```

The next update may become:

```text
Component: bms
Version:   1.0.2
Artifact:  bms_app_v1002.bin
```

The Component ID stays `bms`.

### 5.1 Component ID

`id`:

- MUST be a stable logical identifier;
- MUST be unique within one Manifest;
- SHOULD be a short, machine-readable string;
- SHOULD NOT encode a version, filename, or hardware address that is likely to change.

Recommended:

```text
system
openember
pmu
motor
```

Not recommended:

```text
pmu-v1000
motor-can0-node3
```

### 5.2 Component Version

`version` MUST be a non-empty string.

RBU 1.0 **does not require Semantic Versioning**. An implementation SHOULD use SemVer when it can, for example:

```text
1.0.0
2.1.3
0.8.2
```

An RBU Reader must not assume that every vendor version is SemVer.

---

## 6. Instance Model

A robot may contain several real device instances of the same kind. A quadruped, for example, may have 12 motors:

```text
motor
├── FL-Hip
├── FL-Thigh
├── FL-Calf
├── FR-Hip
├── ...
└── RR-Calf
```

RBU 1.0 **does not standardize a general Instance Topology**.

If a group of devices:

- uses the same firmware;
- uses the same update strategy;
- and the Update Handler can enumerate and update those instances itself;

then a single Component is enough:

```text
motor 1.0.0
```

The Handler is responsible for applying that firmware to every target motor.

If a later project needs different firmware, a different Hardware Revision, or independent Target Selection per instance, a later RBU version can introduce a general Instance Model.

---

## 7. Artifact Model

An Artifact is a file that an RBU Bundle actually carries and delivers.

For example:

```text
OpenEmber_D50_1.0.0.zip
openember-1.0.0-arm64-D50_HW1C1.tar.gz
pmu_app_v1000.bin
bms_app_v1000.bin
motor_app_v1000.bin
```

RBU treats an Artifact as an **Opaque Artifact**.

`OpenEmber_D50_1.0.0.zip` might contain:

```text
OpenEmber_D50_1.0.0.zip
├── boot.img
├── manifest.json
├── MiniLoaderAll.bin
├── misc.img
├── package-file
├── parameter.txt
├── rootfs.img
├── rootfs.img.sha256
├── uboot.img
└── userdata.img
```

To RBU, the whole ZIP is still one Artifact:

```text
Component: system
Artifact:  OpenEmber_D50_1.0.0.zip
```

RBU **does not define**:

- how `boot.img` is flashed;
- which partition `rootfs.img` maps to;
- how `uboot.img` is updated;
- how the ZIP's own `manifest.json` is interpreted.

Those belong to a concrete System Update Handler or to the underlying OTA system.

### 7.1 Artifact Metadata

An Artifact that the Bundle actually carries MUST include:

```json
{
  "path": "artifacts/bms_app_v1001.bin",
  "size": 262144,
  "sha256": "..."
}
```

Field definitions:

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `path` | string | MUST | Relative path of the Artifact inside the RBU |
| `size` | integer | MUST | Exact size of the file in bytes |
| `sha256` | string | MUST | SHA-256 of the file contents, 64 hexadecimal characters |

`path`:

- MUST be under `artifacts/`;
- MUST be a relative path;
- MUST NOT contain `..` path traversal;
- MUST NOT be an absolute path.

---

## 8. Bundle Model

RBU 1.0 defines two Bundle types:

```text
full
incremental
```

### 8.1 File format

A `.rbu` MUST be:

> **USTAR archive + Zstandard compression**

Recommended extension:

```text
.rbu
```

RBU does not use a private binary container. The point is to stay transparent and easy to implement.

### 8.2 Bundle Layout

Standard layout:

```text
bundle.rbu
├── manifest.json
└── artifacts/
    ├── component-a.bin
    └── component-b.tar.gz
```

Requirements:

- `manifest.json` MUST sit at the archive root;
- every carried Artifact MUST live under `artifacts/`;
- every Artifact referenced by the Manifest MUST exist;
- `artifacts/` SHOULD NOT contain files the Manifest does not reference.

---

## 9. Manifest

An RBU 1.0 Manifest is UTF-8 JSON.

Top-level structure:

```json
{
  "spec": "rbu/1.0",
  "release": {},
  "bundle": {},
  "components": []
}
```

### 9.1 `spec`

MUST be:

```json
"rbu/1.0"
```

A consumer MUST reject an RBU major version it does not support.

### 9.2 `release`

```json
{
  "product": "D50_HW1C1",
  "version": "1.0.0"
}
```

| Field | Required | Description |
| --- | --- | --- |
| `product` | MUST | Stable identifier of the target product or SKU |
| `version` | MUST | Target Product Release Version |

`release` identifies the complete Desired State. It does not describe how the Bundle is transported.

### 9.3 `bundle`

Full Bundle:

```json
{
  "type": "full"
}
```

Incremental Bundle:

```json
{
  "type": "incremental",
  "from_release": "1.0.0"
}
```

| Field | Required | Description |
| --- | --- | --- |
| `type` | MUST | `full` or `incremental` |
| `from_release` | MUST for incremental | Base Release that an incremental bundle is allowed to update |
| `created_at` | MAY | Bundle build time; ISO 8601 UTC is recommended |
| `tool` | MAY | Builder name, version, and similar information |

### 9.4 `components`

Every Component MUST contain at least:

```json
{
  "id": "bms",
  "version": "1.0.1",
  "handler": "openember.bms",
  "order": 400
}
```

Field definitions:

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | string | MUST | Stable Component ID |
| `version` | string | MUST | Target version in the Target Release |
| `handler` | string | MUST | Update Handler identifier |
| `order` | integer | MUST | Minimum execution-order hint; a smaller value runs earlier |
| `reboot_after` | boolean | MAY | Whether a successful install forms a reboot barrier; see section 12.3 |
| `artifact` | object | Conditional | Present when this Bundle actually carries the component |

`order` SHOULD be unique within one Manifest. An implementation must not rely on an implicit order between equal `order` values.

If `reboot_after` is omitted, the meaning is `false`.

---

## 10. Full Bundle

A Full Bundle is the complete Artifact set of the target Release.

For example:

```text
D50_HW1C1_1.0.0_full.rbu
```

For a Full Bundle:

- `bundle.type` MUST be `full`;
- the Manifest MUST describe the complete target Component state;
- every Component listed in the Manifest MUST include `artifact`;
- the corresponding Artifact file MUST exist under `artifacts/`.

A Full Bundle is typically used for:

- factory install;
- field or service recovery;
- a cross-version upgrade;
- a downgrade;
- a device whose current software state is unknown.

Whether an upgrade or a downgrade is actually allowed is still decided by the concrete Handler and by product policy.

---

## 11. Incremental Bundle

An RBU 1.0 Incremental Bundle is a **component-level delta (Component-level Delta)**, not a Binary Delta.

For example:

```text
D50_HW1C1
1.0.0 → 1.0.1

Only changed:
BMS 1.0.0 → 1.0.1
```

The `.rbu` then only needs to carry:

```text
manifest.json
artifacts/
└── bms_app_v1001.bin
```

The Manifest MUST still describe the complete Desired State of `1.0.1`.

For an Incremental Bundle:

- `bundle.type` MUST be `incremental`;
- `bundle.from_release` MUST be present;
- the Manifest MUST describe every Component of the target Release;
- an added or changed Component MUST carry an Artifact;
- an unchanged Component SHOULD NOT carry an Artifact;
- an Agent MUST NOT apply the Bundle to a device that does not satisfy `from_release`.

This split keeps two ideas apart:

```text
Release     = complete Desired State
Bundle      = the payload required to bring the device to that Desired State
```

---

## 12. Execution Model

The minimum execution metadata in RBU 1.0 is:

```text
handler
order
reboot_after
```

Of these:

- `handler` and `order` decide **who installs, and in what order**;
- `reboot_after` decides **whether a successful Component forms a reboot barrier, and whether later Components continue after the reboot**.

### 12.1 Handler

`handler` is an implementation-defined Update Handler identifier, for example:

```text
openember.system-image
openember.package
openember.pmu
openember.bms
openember.motor
```

RBU 1.0 **does not define a global Handler Registry, and it does not specify the internal behavior of a Handler**.

A Handler owns the concrete update mechanism, for example:

- Linux A/B or partition flashing;
- Debian package installation;
- tar or zip package installation;
- CAN / CAN FD;
- UART;
- RS485;
- Ethernet;
- a Bootloader protocol;
- a Component Version Probe;
- post-install verification;
- triggering a reboot;
- Rollback.

Therefore:

> `RS485` is a transport, not a complete Handler.

Even if PMU and BMS are both updated over RS485, they may still use entirely different bootloaders and update protocols.

### 12.2 Order

`order` is an integer execution-order hint:

```text
100  System
200  OpenEmber
300  PMU
400  BMS
500  Motor
```

A Component with a smaller value SHOULD run first.

RBU 1.0 does not define:

```text
depends_on
before / after
transaction_group
phase graph
```

If a later project shows that a single `order` cannot express real dependencies, a later specification can extend it.

### 12.3 Reboot After

Robot updates often reboot after a system image or a critical runtime is updated, then continue installing firmware or other components. RBU 1.0 uses the Component-level boolean `reboot_after` to **declare a reboot barrier**, so a Manifest can express "install this component → reboot → continue with later components".

Allowed values:

| Value | Meaning |
| --- | --- |
| `false` | No reboot barrier (the default; the field may be omitted) |
| `true` | After this Component **completes successfully**, the device MUST reboot before any Component with a larger `order` runs, and execution MUST continue after the reboot |

Example:

```json
{
  "id": "system",
  "version": "1.0.0",
  "handler": "openember.system-image",
  "order": 100,
  "reboot_after": true
}
```

Required semantics:

1. The Agent MUST execute Components that need to be installed in ascending `order`.
2. When an executed Component has `reboot_after` set to `true` and the install succeeds, the Agent MUST treat it as a **reboot barrier** in the execution plan: reboot before continuing to later Components.
3. After the reboot, the Agent MUST resume at the unfinished Components after that barrier. It MUST NOT unconditionally rerun the whole Bundle from the start.
4. If a Component is skipped in this plan (for example an unchanged Component in an Incremental Bundle that was not actually installed), its `reboot_after` SHOULD NOT raise a reboot barrier.
5. One Manifest MAY contain several `reboot_after: true` entries. Each barrier that runs successfully takes effect on its own.

RBU 1.0 **defines only the Manifest semantics above**. It does not specify implementation details such as:

- how the reboot is initiated (Agent, Handler, or Bootloader);
- where progress or checkpoints are stored (a file, a database, A/B metadata, and so on);
- reboot timeout, failure retry, or power-loss recovery;
- how an unfinished Bundle is rediscovered after reboot.

Those are responsibilities of a concrete RBU Agent.

---

## 13. Security Model

The minimum security capability of RBU 1.0 is **Artifact Integrity Verification**.

### 13.1 SHA-256

For every Artifact the Bundle carries:

- `size` MUST match the actual file length in bytes;
- `sha256` MUST match the actual SHA-256 of the file;
- the Agent or Verifier MUST verify integrity before install.

A Verifier MUST reject:

- a missing `manifest.json`;
- a Manifest whose JSON cannot be parsed;
- an unsupported `spec`;
- a missing Artifact;
- an Artifact size mismatch;
- an Artifact SHA-256 mismatch;
- an illegal Artifact path;
- a Manifest that clearly violates Full or Incremental Bundle semantics.

### 13.2 SHA-256 is not authentication

SHA-256 can detect accidental corruption, or a file that does not match the Manifest. It **cannot prove that a trusted publisher signed the Bundle**.

If an attacker can modify both:

```text
Artifact
+
manifest.json
```

and recompute the SHA-256, a hash alone does not stop that attack.

Digital signatures are therefore an important security feature for a later RBU version.

The RBU 1.0 draft does not yet define:

- an Ed25519 or ECDSA signature format;
- Public Key Distribution;
- certificates;
- Key Rotation;
- TPM or HSM;
- Online Authorization.

A later version can add them without breaking the current Bundle Layout, for example:

```text
bundle.rbu
├── manifest.json
├── manifest.sig
└── artifacts/
```

---

## 14. Same-version Artifacts must not be replaced silently

RBU tracks software state through Version plus Artifact.

A Builder or Release Tool SHOULD prevent this:

```text
BMS 1.0.1
SHA256 = AAAA...
```

followed later by:

```text
BMS 1.0.1
SHA256 = BBBB...
```

If the Component Version is unchanged and the Artifact content has changed, the release tool SHOULD reject a formal build and require a Component Version bump.

Recommended rule:

```text
Version same + SHA same
→ Same Artifact

Version changed + SHA changed
→ Normal Change

Version same + SHA changed
→ Error
```

This check belongs mainly to the Release Tool or Builder. Every RBU tool is strongly encouraged to implement it.

---

## 15. OpenEmber Reference Example

The example product `D50_HW1C1` is the RBU 1.0 reference example.

In this example, OpenEmber runtime software (the application, Web Console, OTA Agent, and similar pieces) is packaged as one product-software Component, `openember`, rather than as several independent deb or tar packages.

### 15.1 Input Artifacts

```text
OpenEmber_D50_1.0.0.zip
openember-1.0.0-arm64-D50_HW1C1.tar.gz
pmu_app_v1000.bin
bms_app_v1000.bin
motor_app_v1000.bin
```

Corresponding Desired State:

```text
Product: D50_HW1C1
Release: 1.0.0

Linux Image      1.0.0
OpenEmber        1.0.0
PMU Firmware     1.0.0
BMS Firmware     1.0.0
Motor Firmware   1.0.0
```

### 15.2 Full Bundle

Recommended filename:

```text
D50_HW1C1_1.0.0_full.rbu
```

Layout:

```text
D50_HW1C1_1.0.0_full.rbu
├── manifest.json
└── artifacts/
    ├── OpenEmber_D50_1.0.0.zip
    ├── openember-1.0.0-arm64-D50_HW1C1.tar.gz
    ├── pmu_app_v1000.bin
    ├── bms_app_v1000.bin
    └── motor_app_v1000.bin
```

Example Manifest:

```json
{
  "spec": "rbu/1.0",
  "release": {
    "product": "D50_HW1C1",
    "version": "1.0.0"
  },
  "bundle": {
    "type": "full"
  },
  "components": [
    {
      "id": "system",
      "version": "1.0.0",
      "handler": "openember.system-image",
      "order": 100,
      "reboot_after": true,
      "artifact": {
        "path": "artifacts/OpenEmber_D50_1.0.0.zip",
        "size": 0,
        "sha256": "<sha256>"
      }
    },
    {
      "id": "openember",
      "version": "1.0.0",
      "handler": "openember.package",
      "order": 200,
      "artifact": {
        "path": "artifacts/openember-1.0.0-arm64-D50_HW1C1.tar.gz",
        "size": 0,
        "sha256": "<sha256>"
      }
    },
    {
      "id": "pmu",
      "version": "1.0.0",
      "handler": "openember.pmu",
      "order": 300,
      "artifact": {
        "path": "artifacts/pmu_app_v1000.bin",
        "size": 0,
        "sha256": "<sha256>"
      }
    },
    {
      "id": "bms",
      "version": "1.0.0",
      "handler": "openember.bms",
      "order": 400,
      "artifact": {
        "path": "artifacts/bms_app_v1000.bin",
        "size": 0,
        "sha256": "<sha256>"
      }
    },
    {
      "id": "motor",
      "version": "1.0.0",
      "handler": "openember.motor",
      "order": 500,
      "artifact": {
        "path": "artifacts/motor_app_v1000.bin",
        "size": 0,
        "sha256": "<sha256>"
      }
    }
  ]
}
```

> `size: 0` and `<sha256>` in the example are documentation placeholders. A real Builder MUST use the Artifact's actual byte length and SHA-256.
>
> Here `system` sets `"reboot_after": true`, which means the device reboots after the Linux image installs successfully, then continues with `openember`, firmware, and the remaining components. How the Agent persists progress and resumes after reboot is outside this specification.

### 15.3 Incremental Bundle

Assume:

```text
Robot Release: 1.0.0 → 1.0.1
BMS:           1.0.0 → 1.0.1
```

The other Components are unchanged.

Recommended filename:

```text
D50_HW1C1_1.0.0_to_1.0.1.rbu
```

Actual Bundle contents:

```text
D50_HW1C1_1.0.0_to_1.0.1.rbu
├── manifest.json
└── artifacts/
    └── bms_app_v1001.bin
```

The Manifest still describes the complete Desired State:

```json
{
  "spec": "rbu/1.0",
  "release": {
    "product": "D50_HW1C1",
    "version": "1.0.1"
  },
  "bundle": {
    "type": "incremental",
    "from_release": "1.0.0"
  },
  "components": [
    {
      "id": "system",
      "version": "1.0.0",
      "handler": "openember.system-image",
      "order": 100,
      "reboot_after": true
    },
    {
      "id": "openember",
      "version": "1.0.0",
      "handler": "openember.package",
      "order": 200
    },
    {
      "id": "pmu",
      "version": "1.0.0",
      "handler": "openember.pmu",
      "order": 300
    },
    {
      "id": "bms",
      "version": "1.0.1",
      "handler": "openember.bms",
      "order": 400,
      "artifact": {
        "path": "artifacts/bms_app_v1001.bin",
        "size": 0,
        "sha256": "<sha256>"
      }
    },
    {
      "id": "motor",
      "version": "1.0.0",
      "handler": "openember.motor",
      "order": 500
    }
  ]
}
```

---

## 16. Builder and Agent responsibilities

The RBU specification defines format and semantics. It does not require a product to implement its toolchain in a particular way.

A typical architecture:

```text
               Release Builder
                     │
                     ▼
                  .rbu
                     │
       ┌─────────────┼─────────────┐
       │             │             │
      USB        Web Upload       Cloud
       │             │             │
       └─────────────┼─────────────┘
                     ▼
                 RBU Agent
                     │
             Parse / Verify
                     │
                Create Plan
                     │
          Execute by Handler
```

### A Builder SHOULD

- collect Component Artifacts;
- maintain the complete Release Desired State;
- compare the Base Release and the Target Release;
- compute Artifact size;
- compute SHA-256;
- generate `manifest.json`;
- build Full and Incremental RBUs;
- after the build, read the Bundle back and Verify it.

### An Agent SHOULD

- read the Manifest;
- check Product and Release compatibility;
- verify Artifact size and SHA-256;
- look up an Update Handler from `handler`;
- build a minimal execution plan from `order` and `reboot_after`, including reboot barriers;
- persist execution progress when needed, so work can continue after a reboot;
- call the Handler to perform the actual update.

---

## 17. What RBU 1.0 explicitly does not define

To keep the specification small, the following are **outside the RBU 1.0 core**:

- the internal format of a Linux system Artifact;
- Partition Layout;
- PMU or BMS Bootloader protocols;
- CAN / CAN FD firmware protocols;
- UART / RS485 firmware protocols;
- Device Instance Topology;
- Fleet Management;
- Cloud OTA;
- a Device Registry;
- a SQLite or other database schema;
- a Builder GUI;
- Binary Delta;
- a dependency graph;
- distributed transactions;
- a complete Rollback model;
- digital signatures and PKI;
- how a reboot is triggered, where a progress checkpoint is stored, or how power-loss recovery works (the Manifest only declares `reboot_after` semantics).

A concrete implementation may provide these on its own. A future RBU version may standardize the ones that prove generally useful.

---

## 18. Compatibility and evolution

An RBU Manifest MUST use:

```json
"spec": "rbu/1.0"
```

as its format version.

An RBU Reader:

- MUST check `spec`;
- MUST reject a major version it cannot understand safely;
- SHOULD ignore a field it does not recognize when that field is clearly an optional extension, rather than failing only because an optional field was added.

The evolution rule is:

> **Prove the problem in a real project first, then add a capability to the specification only if it has general value.**

Capabilities that may appear later:

```text
RBU 1.x
├── Digital Signature
├── Rich Compatibility Rules
├── Artifact Metadata Extension
└── Handler Metadata Extension

Future
├── Instance Model
├── Dependency / Phase Model
├── Rollback Capability
├── Health Check Contract
└── Security / Key Model
```

These are reserved extensions. They are not mandatory in RBU 1.0.

---

## 19. RBU 1.0 in one page

RBU 1.0 can be reduced to one sentence:

> **RBU = Release Manifest + Component Artifacts + Handler Contract + Reboot Continue + Integrity Verification.**

The core data relationship is:

```text
                    Product Release
                     Desired State
                          │
          ┌───────────────┼───────────────┐
          │               │               │
      Component       Component       Component
       system         openember          motor
       1.0.0            1.0.0            1.0.0
          │               │               │
       Artifact        Artifact        Artifact
          │               │               │
          └───────────────┼───────────────┘
                          ▼
                     RBU Bundle
                manifest + artifacts
                          │
                          ▼
                       Agent
                          │
               handler + order + reboot_after + hash
                          │
                          ▼
                    Desired State
```

RBU 1.0 does not try to solve every robot OTA problem at once. It establishes a contract that is small enough, clear enough, and concrete enough to implement and use.
