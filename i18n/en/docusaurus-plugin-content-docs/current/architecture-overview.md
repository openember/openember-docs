---
sidebar_position: 2
---

# Architecture overview

OpenEmber currently uses a **four-layer** model (dependencies flow downward):

1. **Application layer** — executable entrypoints and orchestration (product apps, system nodes, optional services, examples, tools)
2. **Middleware layer** — communication and core runtime (Link, messages, node lifecycle, scheduling, parameters, services, …)
3. **Components layer** — shared building blocks (logging, algorithms, serialization, containers, config, …)
4. **Platform layer** — OS abstraction and platform I/O (threads, timers, sockets, UART, GPIO, I2C, …)

Application is one logical layer. In the repo it is split by role into several top-level directories—not extra architecture layers:

| Directory | Role |
|-----------|------|
| `apps/` | Product or user-project entrypoints (framework-owned nodes do not live here) |
| `system/` | Built-in, mostly essential system nodes |
| `services/` | Optional runtime services |
| `examples/` | Samples and reference implementations |
| `tools/` | Dev, debug, and ops utilities |

Lower layers map roughly to `communication/`, `core/`, `components/`, and `platform/`. Helper dirs such as `third_party/` and `configs/` sit outside the four-layer stack.

## Dependency direction

```
Application (apps / system / services / examples / tools)
  ↓
middleware (communication / core)
  ↓
components
  ↓
core
  ↓
platform
  ↓
Operating system (Linux, …)
```

Upper layers depend on lower layers, not the reverse—making tests and backend swaps (e.g. transport or HAL) easier.

Component-layer building blocks include `Logging`, `Algorithm`, and `Thread Pool`; `Middleware Layer` groups communication and core runtime settings.

## Design goals (summary)

- **Extensible**: plugin-style modules and Kconfig trimming for different products.
- **Dependency management**: options such as `OPENEMBER_THIRD_PARTY_MODE` (FETCH / VENDOR / SYSTEM) for CI and offline builds.
- **Communication abstraction**: OpenEmber Link exposes stable Topic, Service, Liveliness, and codec semantics while hiding the transport backend.

For the full layered specification, see the upstream [layered design guide](https://github.com/openember/openember/blob/main/docs/architecture/layered-architecture-design-guide.md) and [Application layer design guide](https://github.com/openember/openember/blob/main/docs/architecture/application-layer-design-guide.md).
