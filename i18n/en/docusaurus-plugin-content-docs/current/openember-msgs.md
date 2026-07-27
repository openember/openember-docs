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
| `common/v1` | Shared types (`Header`, `Status`, …) |
| `node/v1` | Node info, heartbeat, registry |
| `lifecycle/v1` | Lifecycle state and transitions |
| `diagnostics/v1` | Health / diagnostics |
| `parameter/v1` | Parameter get/set/events |
| `log/v1` | Structured logs |
| `device/v1` | Device info and status |
| `runtime/v1` | Process start/stop events |

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
