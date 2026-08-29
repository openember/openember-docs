---
sidebar_position: 9
sidebar_label: RBU Specification
description: RBU（Robot Bundle Update）是面向机器人及复杂智能设备的多组件 Release 描述与升级包格式，负责聚合、描述、校验与编排升级产物，不代替 Debian、Linux Image 或 MCU 固件格式。
---

# RBU Specification 1.0

:::caution 状态：Draft / Experimental

**规范版本：** 1.0  
**RBU：** Robot Bundle Update

:::

RBU（Robot Bundle Update）是一种面向机器人及复杂智能设备的**多组件 Release 描述与升级包格式**。

一台机器人通常不只有一个软件版本，而是由 Linux 系统、业务应用、系统服务、PMU、BMS、电机、传感器等多个可独立升级的组件共同组成。RBU 的目标，是用一个简单、透明、可验证的格式描述：

> **一个产品 Release 最终应该处于什么软件状态，以及将设备更新到该状态所需要携带哪些 Artifact。**

RBU 1.0 有意保持克制。它不试图定义所有设备的升级协议，也不替代 RAUC、SWUpdate、Mender 或厂商自己的 Bootloader / Firmware Updater。RBU 只定义机器人级别的 **Release Contract + Bundle Format**。

---

## 1. 设计目标

RBU 1.0 遵循以下原则：

- **Simple**：格式足够简单，开发者可以快速实现 Reader、Builder 和 Verifier。
- **Transparent**：升级包不是黑盒，可以直接解包并查看 `manifest.json` 和 Artifact。
- **Offline First**：RBU 不依赖云平台，可以通过本地文件、USB、Web Console、局域网等方式交付。
- **Multi-component**：一个 Release 可以同时描述 Linux、应用程序、服务和多个 MCU / 外设固件。
- **Desired State**：Release 描述目标设备最终应该达到的完整软件状态。
- **Extensible**：RBU 1.0 只定义最小核心，后续版本可以扩展签名、实例模型、依赖关系和事务能力。
- **Implementation Independent**：RBU 不要求使用特定语言、数据库、GUI、OTA Agent 或云平台。

---

## 2. 规范性术语

本文使用以下关键词描述规范要求：

- **MUST / 必须**：实现必须满足，否则不符合 RBU 1.0。
- **MUST NOT / 禁止**：实现不得采用该行为。
- **SHOULD / 应当**：强烈推荐，只有在明确理解影响时才应偏离。
- **SHOULD NOT / 不应**：通常不推荐。
- **MAY / 可以**：可选能力。

---

## 3. 核心概念

RBU 的完整架构可以从七个层次理解，但 **RBU 1.0 并不要求用户直接操作七套模型**。

| 英文 | 中文 | RBU 1.0 |
| --- | --- | --- |
| Release Model | 发布模型 / 整机发布模型 | 核心 |
| Component Model | 组件模型 | 核心 |
| Instance Model | 实例模型 / 设备实例模型 | 暂不标准化 |
| Artifact Model | 制品模型 / 构建制品模型 | 核心 |
| Bundle Model | 升级包模型 | 核心 |
| Execution Model | 升级执行模型 | 最小定义 |
| Security Model | 安全模型 | 完整性校验 |

对于普通 RBU 使用者，第一版真正需要理解的关系只有：

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

## 4. Release Model（发布模型）

Release 表示一个产品完整的目标软件状态，即 **Desired State**。

例如：

```text
D50_HW1C1 Release 1.0.0
│
├── Linux Image         1.0.0
├── OpenEmber           1.0.0
├── PMU Firmware        1.0.0
├── BMS Firmware        1.0.0
└── Motor Firmware      1.0.0
```

这里：

- `1.0.0` 是**整机 Product Release Version**；
- 各 Component 也有自己的版本（上例恰好同为 `1.0.0`，实际产品中可以是 `0.8.2`、`2.0.1` 等）；
- 二者属于不同层级，不能混为一谈。

RBU 1.0 的一个重要原则是：

> **Release 永远描述完整 Desired State，而不是“这次刚好要升级哪些文件”。**

因此，即使 Incremental RBU 中只携带一个 BMS 固件，Manifest 仍然应描述目标 Release 的全部 Component Version。

---

## 5. Component Model（组件模型）

Component 是一个具有独立版本生命周期的逻辑软件或固件单元。

例如：

```text
system
openember
pmu
bms
motor
```

Component 与文件不是同一个概念：

```text
Component: bms
Version:   1.0.1
Artifact:  bms_app_v1001.bin
```

下一次升级后可能变成：

```text
Component: bms
Version:   1.0.2
Artifact:  bms_app_v1002.bin
```

Component ID 仍然保持为 `bms`。

### 5.1 Component ID

`id`：

- MUST 是稳定的逻辑标识；
- MUST 在一个 Manifest 中唯一；
- SHOULD 使用简短、机器可读的字符串；
- SHOULD 避免将易变化的版本号、文件名或硬件地址编码进 ID。

推荐：

```text
system
openember
pmu
motor
```

不推荐：

```text
pmu-v1000
motor-can0-node3
```

### 5.2 Component Version

`version` MUST 是非空字符串。

RBU 1.0 **不强制要求 Semantic Versioning**。实现 SHOULD 在条件允许时使用 SemVer，例如：

```text
1.0.0
2.1.3
0.8.2
```

但 RBU Reader 不应假定所有厂商版本都一定满足 SemVer。

---

## 6. Instance Model（实例模型）

机器人中可能存在多个同类真实设备实例，例如四足机器人可能拥有 12 个 Motor：

```text
motor
├── FL-Hip
├── FL-Thigh
├── FL-Calf
├── FR-Hip
├── ...
└── RR-Calf
```

RBU 1.0 **不标准化通用 Instance Topology**。

如果一组设备：

- 使用相同 Firmware；
- 使用相同升级策略；
- Update Handler 能自行枚举和升级这些实例；

则可以只定义一个 Component：

```text
motor 1.0.0
```

由对应 Handler 负责将固件更新到所有目标电机。

未来如果实际项目出现不同实例需要不同 Firmware、不同 Hardware Revision 或独立 Target Selection 的需求，RBU 后续版本可以再引入通用 Instance Model。

---

## 7. Artifact Model（制品模型）

Artifact 是实际被 RBU Bundle 携带和交付的文件。

例如：

```text
OpenEmber_D50_1.0.0.zip
openember-1.0.0-arm64-D50_HW1C1.tar.gz
pmu_app_v1000.bin
bms_app_v1000.bin
motor_app_v1000.bin
```

RBU 将 Artifact 视为**不透明制品（Opaque Artifact）**。

例如 `OpenEmber_D50_1.0.0.zip` 内部可能包含：

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

对于 RBU 来说，整个 ZIP 仍然只是一个 Artifact：

```text
Component: system
Artifact:  OpenEmber_D50_1.0.0.zip
```

RBU **不定义**：

- `boot.img` 如何烧写；
- `rootfs.img` 对应哪个分区；
- `uboot.img` 如何升级；
- ZIP 内部自己的 `manifest.json` 如何解释。

这些都属于具体 System Update Handler 或底层 OTA 系统的职责。

### 7.1 Artifact Metadata

被 Bundle 实际携带的 Artifact MUST 包含：

```json
{
  "path": "artifacts/bms_app_v1001.bin",
  "size": 262144,
  "sha256": "..."
}
```

字段定义：

| 字段 | 类型 | 必须 | 说明 |
| --- | --- | --- | --- |
| `path` | string | MUST | Artifact 在 RBU 内的相对路径 |
| `size` | integer | MUST | 文件的精确字节数 |
| `sha256` | string | MUST | 文件内容 SHA-256，64 个十六进制字符 |

`path`：

- MUST 位于 `artifacts/` 下；
- MUST 使用相对路径；
- MUST NOT 包含 `..` 路径穿越；
- MUST NOT 是绝对路径。

---

## 8. Bundle Model（升级包模型）

RBU 1.0 定义两种 Bundle：

```text
full
incremental
```

### 8.1 文件格式

`.rbu` MUST 是：

> **USTAR archive + Zstandard compression**

推荐扩展名：

```text
.rbu
```

RBU 不使用私有二进制容器格式，目的是保持透明和易于实现。

### 8.2 Bundle Layout

标准目录结构：

```text
bundle.rbu
├── manifest.json
└── artifacts/
    ├── component-a.bin
    └── component-b.tar.gz
```

要求：

- `manifest.json` MUST 位于归档根目录；
- 所有被携带的 Artifact MUST 位于 `artifacts/`；
- Manifest 中引用的每个 Artifact MUST 实际存在；
- `artifacts/` 下 SHOULD NOT 存在 Manifest 未引用的文件。

---

## 9. Manifest

RBU 1.0 的 Manifest 使用 UTF-8 JSON。

顶层结构：

```json
{
  "spec": "rbu/1.0",
  "release": {},
  "bundle": {},
  "components": []
}
```

### 9.1 `spec`

MUST 为：

```json
"rbu/1.0"
```

Consumer MUST 拒绝自己不支持的 RBU Major Version。

### 9.2 `release`

```json
{
  "product": "D50_HW1C1",
  "version": "1.0.0"
}
```

| 字段 | 必须 | 说明 |
| --- | --- | --- |
| `product` | MUST | 目标产品或 SKU 的稳定标识 |
| `version` | MUST | 目标 Product Release Version |

`release` 表达完整 Desired State 的身份，不表示 Bundle 的传输方式。

### 9.3 `bundle`

Full Bundle：

```json
{
  "type": "full"
}
```

Incremental Bundle：

```json
{
  "type": "incremental",
  "from_release": "1.0.0"
}
```

| 字段 | 必须 | 说明 |
| --- | --- | --- |
| `type` | MUST | `full` 或 `incremental` |
| `from_release` | Incremental MUST | 增量包允许升级的 Base Release |
| `created_at` | MAY | Bundle 构建时间，建议 ISO 8601 UTC |
| `tool` | MAY | Builder 名称和版本等信息 |

### 9.4 `components`

每一个 Component MUST 至少包含：

```json
{
  "id": "bms",
  "version": "1.0.1",
  "handler": "openember.bms",
  "order": 400
}
```

字段定义：

| 字段 | 类型 | 必须 | 说明 |
| --- | --- | --- | --- |
| `id` | string | MUST | 稳定的 Component ID |
| `version` | string | MUST | Target Release 中的目标版本 |
| `handler` | string | MUST | Update Handler 标识 |
| `order` | integer | MUST | 最小执行顺序提示，数值越小越先执行 |
| `artifact` | object | 条件必须 | 当前 Bundle 实际携带该组件时提供 |

`order` SHOULD 在一个 Manifest 内保持唯一。实现不应依赖相同 `order` 值之间的隐式执行顺序。

---

## 10. Full Bundle

Full Bundle 表示目标 Release 的完整 Artifact 集合。

例如：

```text
D50_HW1C1_1.0.0_full.rbu
```

对于 Full Bundle：

- `bundle.type` MUST 为 `full`；
- Manifest MUST 描述完整目标 Component State；
- 每一个 Manifest 中列出的 Component MUST 包含 `artifact`；
- 对应 Artifact 文件 MUST 存在于 `artifacts/`。

Full Bundle 通常适用于：

- 工厂安装；
- 售后恢复；
- 跨版本升级；
- 降级；
- 当前设备软件状态未知的情况。

是否真的允许升级或降级，仍由具体 Handler 和产品策略决定。

---

## 11. Incremental Bundle

RBU 1.0 的 Incremental Bundle 是**组件级增量包（Component-level Delta）**，不是 Binary Delta。

例如：

```text
D50_HW1C1
1.0.0 → 1.0.1

Only changed:
BMS 1.0.0 → 1.0.1
```

此时 `.rbu` 实际只需要携带：

```text
manifest.json
artifacts/
└── bms_app_v1001.bin
```

但 Manifest 仍然 MUST 描述 `1.0.1` 的完整 Desired State。

对于 Incremental Bundle：

- `bundle.type` MUST 为 `incremental`；
- `bundle.from_release` MUST 存在；
- Manifest MUST 描述目标 Release 的全部 Component；
- Added / Changed Component MUST 携带 Artifact；
- Unchanged Component SHOULD 不携带 Artifact；
- Agent MUST NOT 将该 Bundle 应用于不满足 `from_release` 要求的设备。

这种设计将两个概念明确分开：

```text
Release     = 完整 Desired State
Bundle      = 将设备带到 Desired State 所需的交付内容
```

---

## 12. Execution Model（升级执行模型）

RBU 1.0 只定义最小执行元数据：

```text
handler
order
```

### 12.1 Handler

`handler` 是实现相关的 Update Handler 标识，例如：

```text
openember.system-image
openember.package
openember.pmu
openember.bms
openember.motor
```

RBU 1.0 **不建立全局 Handler Registry，也不规定具体 Handler 的内部行为**。

Handler 负责具体升级机制，例如：

- Linux A/B 或分区烧写；
- Debian Package 安装；
- tar / zip 软件包安装；
- CAN / CAN FD；
- UART；
- RS485；
- Ethernet；
- Bootloader Protocol；
- Component Version Probe；
- 安装后校验；
- Reboot；
- Rollback。

因此：

> `RS485` 是 Transport，而不是完整的 Handler。

即使 PMU 和 BMS 都通过 RS485 升级，它们仍然可能使用完全不同的 Bootloader 和升级协议。

### 12.2 Order

`order` 是一个整数执行顺序提示：

```text
100  System
200  OpenEmber
300  PMU
400  BMS
500  Motor
```

数值较小的 Component SHOULD 先执行。

RBU 1.0 不定义：

```text
depends_on
before / after
transaction_group
phase graph
```

如果未来实际项目证明单一 `order` 无法表达真实依赖，再在后续规范中扩展。

---

## 13. Security Model（安全模型）

RBU 1.0 的最小安全能力是 **Artifact Integrity Verification**。

### 13.1 SHA-256

对于每一个被 Bundle 携带的 Artifact：

- `size` MUST 与实际文件字节长度一致；
- `sha256` MUST 与文件实际 SHA-256 一致；
- Agent / Verifier MUST 在安装前完成完整性验证。

Verifier MUST 拒绝：

- `manifest.json` 缺失；
- Manifest JSON 无法解析；
- 不支持的 `spec`；
- Artifact 缺失；
- Artifact Size 不一致；
- Artifact SHA-256 不一致；
- 非法 Artifact Path；
- 明显违反 Full / Incremental Bundle 语义的 Manifest。

### 13.2 SHA-256 不等于身份认证

SHA-256 可以检测文件内容是否被意外损坏或与 Manifest 不一致，但**不能证明 Bundle 是由可信发布者签发的**。

如果攻击者可以同时修改：

```text
Artifact
+
manifest.json
```

并重新计算 SHA-256，单纯 Hash 无法阻止这种攻击。

因此数字签名属于 RBU 后续版本的重要安全能力。

RBU 1.0 Draft 暂不定义：

- Ed25519 / ECDSA 签名格式；
- Public Key Distribution；
- Certificate；
- Key Rotation；
- TPM / HSM；
- Online Authorization。

未来可以在保持现有 Bundle Layout 兼容的前提下增加，例如：

```text
bundle.rbu
├── manifest.json
├── manifest.sig
└── artifacts/
```

---

## 14. 同版本 Artifact 不可静默替换

RBU 本身依赖 Version + Artifact 建立可追踪的软件状态。

Builder / Release Tool SHOULD 防止下面这种情况：

```text
BMS 1.0.1
SHA256 = AAAA...
```

随后又出现：

```text
BMS 1.0.1
SHA256 = BBBB...
```

如果 Component Version 不变而 Artifact Content 已变化，发布工具 SHOULD 拒绝正式构建，并要求提升 Component Version。

推荐规则：

```text
Version same + SHA same
→ Same Artifact

Version changed + SHA changed
→ Normal Change

Version same + SHA changed
→ Error
```

这条规则主要属于 Release Tool / Builder 的一致性检查，但强烈建议所有 RBU 工具实现。

---

## 15. OpenEmber Reference Example

下面以 OpenEmber 示例产品 `D50_HW1C1` 为 RBU 1.0 Reference Example。

本例中，OpenEmber 运行时相关软件（应用、Web Console、OTA Agent 等）打包为一个统一的产品软件包 Component `openember`，而不是拆成多个独立 deb / tar。

### 15.1 输入 Artifact

```text
OpenEmber_D50_1.0.0.zip
openember-1.0.0-arm64-D50_HW1C1.tar.gz
pmu_app_v1000.bin
bms_app_v1000.bin
motor_app_v1000.bin
```

对应 Desired State：

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

推荐文件名：

```text
D50_HW1C1_1.0.0_full.rbu
```

目录：

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

示例 Manifest：

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

> 示例中的 `size: 0` 和 `<sha256>` 仅作为文档占位。正式 Builder MUST 使用 Artifact 的实际字节数和 SHA-256。

### 15.3 Incremental Bundle

假设：

```text
Robot Release: 1.0.0 → 1.0.1
BMS:           1.0.0 → 1.0.1
```

其他 Component 不变。

推荐文件名：

```text
D50_HW1C1_1.0.0_to_1.0.1.rbu
```

Bundle 实际内容：

```text
D50_HW1C1_1.0.0_to_1.0.1.rbu
├── manifest.json
└── artifacts/
    └── bms_app_v1001.bin
```

但 Manifest 仍然描述完整 Desired State：

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
      "order": 100
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

## 16. Builder 与 Agent 的职责边界

RBU Specification 定义的是格式和语义，不规定具体产品必须如何实现工具链。

典型架构可以是：

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

### Builder SHOULD 负责

- 收集 Component Artifact；
- 维护完整 Release Desired State；
- 比较 Base / Target Release；
- 计算 Artifact Size；
- 计算 SHA-256；
- 生成 `manifest.json`；
- 构建 Full / Incremental RBU；
- 构建完成后重新读取并 Verify Bundle。

### Agent SHOULD 负责

- 读取 Manifest；
- 检查 Product / Release Compatibility；
- 校验 Artifact Size / SHA-256；
- 根据 `handler` 查找 Update Handler；
- 根据 `order` 创建最小执行计划；
- 调用 Handler 完成具体升级。

---

## 17. RBU 1.0 明确不定义的内容

为了保持规范简单，以下内容**不属于 RBU 1.0 核心范围**：

- Linux System Artifact 内部格式；
- Partition Layout；
- PMU / BMS Bootloader Protocol；
- CAN / CAN FD Firmware Protocol；
- UART / RS485 Firmware Protocol；
- Device Instance Topology；
- Fleet Management；
- Cloud OTA；
- Device Registry；
- SQLite / Database Schema；
- Builder GUI；
- Binary Delta；
- Dependency Graph；
- Distributed Transaction；
- 完整 Rollback Model；
- Digital Signature / PKI。

这些能力可以由具体实现自行提供，也可以在未来 RBU 版本中根据真实需求逐步标准化。

---

## 18. 向后兼容与规范演进

RBU Manifest MUST 使用：

```json
"spec": "rbu/1.0"
```

作为格式版本标识。

RBU Reader：

- MUST 检查 `spec`；
- MUST 拒绝自己无法安全理解的 Major Version；
- SHOULD 忽略自己不认识但明确属于可选扩展的字段，而不是因为新增可选字段直接失败。

RBU 的演进原则是：

> **先由真实项目验证问题，再将确有通用价值的能力加入规范。**

未来可能演进的能力包括：

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

这些方向只是扩展预留，不属于 RBU 1.0 的强制能力。

---

## 19. RBU 1.0 核心摘要

RBU 1.0 可以浓缩为一句话：

> **RBU = Release Manifest + Component Artifacts + Handler Contract + Integrity Verification.**

其最核心的数据关系是：

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
               handler + order + hash
                          │
                          ▼
                    Desired State
```

RBU 1.0 不追求一次解决机器人 OTA 的全部问题，而是先建立一个足够小、足够清晰、可以真正被实现和使用的共同契约。
