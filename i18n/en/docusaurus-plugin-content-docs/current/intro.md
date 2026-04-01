---
sidebar_position: 1
---

# What is OpenEmber?

**OpenEmber** is a runtime framework for robotics and intelligent devices on **Linux**. It provides a unified communication backbone, a **hardware abstraction layer (HAL)**, and a node execution model for building distributed embedded systems.

Highlights:

- **Distributed architecture**: similar in spirit to ROS2, nodes can communicate via **pub/sub** and run across heterogeneous hardware.
- **Layered design**: Applications → modules → components → core → platform (OS abstraction + HAL).
- **Build system**: **Kconfig + CMake + FetchContent**, with FETCH / VENDOR / SYSTEM strategies for third-party code.
- **Language strategy**: modern **C++** for the core, with a stable **C ABI** boundary where needed.

## EmberLite

**EmberLite** is a **pure C**, lightweight companion framework for resource-constrained embedded Linux. It shares the pub/sub style with OpenEmber but keeps the runtime smaller—ideal for industrial, safety-oriented, or MISRA-style projects.

## Tooling: openember-cli (`ember`)

The **openember-cli** repo ships the standalone **`ember`** CLI used by OpenEmber, EmberLite, and similar trees. It orchestrates **Kconfig** and **CMake** entry scripts (`menuconfig`, `genconfig`, `build`, etc.); feature flags live in each project’s `Kconfig` and `CMakeLists.txt`.

Typical usage from the **project root**:

```bash
./scripts/ember build
```

See [Build OpenEmber](./build-openember.md), [Build EmberLite](./build-emberlite.md), and [ember CLI](./cli-ember.md).

## Repositories

| Repo | Role |
|------|------|
| [openember](https://github.com/openember/openember) | Main framework (C++ core, modules, examples) |
| [emberlite](https://github.com/openember/emberlite) | Pure C lightweight framework + HAL samples |
| [openember-cli](https://github.com/openember/openember-cli) | `ember` CLI and Bash completion |
| [openember-docs](https://github.com/openember/openember-docs) | This documentation site |

## Next steps

- [Architecture overview](./architecture-overview.md)
- [Build OpenEmber](./build-openember.md)
- [Build EmberLite](./build-emberlite.md)
