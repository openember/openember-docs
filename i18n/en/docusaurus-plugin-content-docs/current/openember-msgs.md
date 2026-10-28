---
sidebar_position: 5
---

# openember-msgs protocol

`openember-msgs` is the shared message-protocol repository for OpenEmber and EmberLite. It holds `.proto` definitions, Nanopb options, and generation entry points — not the runtimes themselves.

Core principles:

- **Versioned separately**: message definitions are maintained and tagged in `openember-msgs`.
- **Runtime-specific bindings**: OpenEmber uses C++ Protobuf; EmberLite uses Nanopb C.
- **Zenoh routes, Protobuf shapes**: Zenoh keys decide *where* messages go; Protobuf types define payload layout.
- **No copied protos**: OpenEmber and EmberLite should not each maintain a private `.proto` tree.

## Current packages

| Package | Purpose |
|---------|---------|
| `common/v1` | Shared types (`Header`, `Status`, `QosProfile`, `Metric`, `BoolStamped`, …) |
| `node/v1` | Node info, heartbeat, registry |
| `lifecycle/v1` | Lifecycle state and transitions |
| `diagnostics/v1` | Health / diagnostics |
| `parameter/v1` | Parameter get/set/events |
| `log/v1` | Structured logs |
| `device/v1` | Device info and status |
| `runtime/v1` | Process start/stop events |
| `sensor/v1` | IMU, temperature, GNSS samples and status; generic `ScalarSample` |
| `actuator/v1` | Joint commands, state, actuator health |
| `power/v1` | Battery / power state and control |
| `geometry/v1` | Planar pose and twist (`Pose2D`, `Twist2D`; see [Turtle Demo](./turtle-demo.md)) |
| `host/v1` | Host resource snapshot (`HostResourceSnapshot`: CPU / memory / load / disk; published by `services/host_monitor` on `/host/resources`) |

### Shared helper types

| Type | Package | Purpose |
|------|---------|---------|
| `BoolStamped` | `common/v1` | Header-stamped boolean (e-stop, enable flags, …) |
| `ScalarSample` | `sensor/v1` | Header-stamped scalar: `quantity` + `value` + `unit` (humidity, illuminance, soil moisture, CO₂, … when no dedicated type exists yet) |

These are cross-product helpers, not tied to a single demo. Source of truth: the corresponding `.proto` files in `openember-msgs`.

Both OpenEmber and EmberLite gate protocol generation with `OPENEMBER_ENABLE_MSGS`. Source selection is `FETCH` (default, pulls `main`) or `LOCAL` (path via `OPENEMBER_MSGS_LOCAL_SOURCE`).

## Where to configure

In OpenEmber Kconfig:

```text
Communication / Messages
```

Typical CMake overrides:

```bash
cmake -S . -B build \
  -DOPENEMBER_MSGS_SOURCE=LOCAL \
  -DOPENEMBER_MSGS_LOCAL_SOURCE=/path/to/openember-msgs
```

Disable when unused:

```bash
cmake -S . -B build -DOPENEMBER_ENABLE_MSGS=OFF
```

## Related

- Upstream repo: [openember/openember-msgs](https://github.com/openember/openember-msgs)
- Build integration: [Build OpenEmber](./build-openember.md), [Build EmberLite](./build-emberlite.md)
- Chinese full guide (more detail): switch locale to 简体中文, or see `docs/openember-msgs.md` in this repository
