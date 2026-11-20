---
sidebar_position: 1
---

# What is OpenEmber?

**OpenEmber** is a runtime framework for robotics and intelligent devices on **Linux**. It provides a unified communication backbone, a **hardware abstraction layer (HAL)**, and a node execution model for building distributed embedded systems.

Highlights:

- **Distributed architecture**: similar in spirit to ROS2, nodes can communicate via **pub/sub** and run across heterogeneous hardware (including heterogeneous multicore).
- **Layered design**: Application → middleware (communication and core runtime) → components → platform (OS abstraction and I/O), easy to trim and extend.
- **Build system**: **Kconfig + CMake + FetchContent**, with FETCH / VENDOR / SYSTEM strategies for third-party code.
- **Language strategy**: modern **C++** for the core, with a stable **C ABI** boundary where targeted C access is needed.

## Engineering modes

You can maintain your project starting from OpenEmber source, or soft-link the framework into an independent product and build together—the latter is recommended today. A third mode—install an OpenEmber SDK and develop nodes/products against headers and libraries—is planned and not implemented yet.

How to choose among the three modes, current steps, and SDK plans: [Create your first product](./product-quickstart.md).

## EmberLite

**EmberLite** is a **pure C**, lightweight companion framework for more resource-constrained embedded Linux. It also supports multi-node pub/sub messaging with a smaller runtime and dependency footprint—suited to industrial control, high-determinism, or MISRA-oriented projects (without claiming MISRA compliance).

## ember toolchain

OpenEmber ships in-tree `scripts/ember`; the **openember-cli** repo also provides a standalone **`ember`** CLI shared by OpenEmber, EmberLite, and similar trees. It drives each project’s **Kconfig / CMake entry scripts** for `menuconfig`, `genconfig`, `build`, and related workflows; feature toggles live in each repo’s `Kconfig` and `CMakeLists.txt`.

Typical usage from the **project root**:

```bash
./scripts/ember build
```

Independent products use `./openember/scripts/ember`. Prefer the framework’s in-tree CLI for product create and multi-model workflows—older standalone CLIs may lack support.

Build steps: [Build OpenEmber](./build-openember.md) and [Build EmberLite](./build-emberlite.md). Command reference: [ember CLI](./cli-ember.md).

## Repositories

| Repo | Role |
|------|------|
| [openember](https://github.com/openember/openember) | Main framework (C++ core, modules, examples) |
| [emberlite](https://github.com/openember/emberlite) | Pure C lightweight framework + HAL samples |
| [openember-msgs](https://github.com/openember/openember-msgs) | Shared Protobuf message contracts for OpenEmber and EmberLite |
| [openember-cli](https://github.com/openember/openember-cli) | `ember` CLI and Bash completion |
| [openember-docs](https://github.com/openember/openember-docs) | Source for this documentation site |

## Next steps

- Layered structure: [Architecture overview](./architecture-overview.md)
- Create your project: [Create your first product](./product-quickstart.md)
- Build the main repo: [Build OpenEmber](./build-openember.md)
- Host turtle bring-up: [Turtle Demo](./turtle-demo.md)
- Rover (planned): [Rover Demo](./rover-demo.md)
- Agri station (planned): [Agri Station Demo](./agri-station-demo.md)
- Build the lightweight repo: [Build EmberLite](./build-emberlite.md)
