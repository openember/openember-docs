---
sidebar_position: 2
---

# Architecture overview

OpenEmber uses a **five-layer** model (dependencies flow downward):

1. **Application layer** — apps, launches, demos, tools  
2. **Module layer** — pluggable features (transports, drivers, algorithms, bridges)  
3. **Component layer** — shared building blocks (logging, serialization, containers, config, …)  
4. **Core layer** — middleware runtime (node lifecycle, scheduling, topics, parameters, services)  
5. **Platform layer** — OS abstraction and **HAL** (threads, timers, sockets, UART, GPIO, I2C, …)

In the `openember` tree this maps roughly to `apps/`, `modules/`, `components/`, `core/`, `platform/`, plus helper dirs such as `third_party/`, `configs/`, `tools/`.

## Dependency direction

```
apps
  ↓
modules
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

## Design goals (summary)

- **Extensible**: plugin-style modules and Kconfig trimming for different products.  
- **Dependency management**: options such as `OPENEMBER_THIRD_PARTY_MODE` (FETCH / VENDOR / SYSTEM) for CI and offline builds.  
- **Stable APIs**: pub/sub style interfaces with swappable implementations (NNG, LCM, ZeroMQ, …) depending on project configuration.

For the full layered specification, see the upstream [design guide](https://github.com/openember/openember/blob/main/docs/architecture/layered-architecture-design-guide.md).
