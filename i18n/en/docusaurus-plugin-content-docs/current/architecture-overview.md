---
sidebar_position: 2
---

# Architecture overview

OpenEmber currently uses a clear **four-layer** model (dependencies flow downward) for extension and long-term maintenance:

1. **Application Layer** — executable entrypoints and orchestration (product apps, system nodes, optional services, examples, tools)
2. **Middleware Layer** — communication and core runtime (Link, message contracts, node lifecycle, scheduling, parameters, services, …)
3. **Components Layer** — shared building blocks (logging, algorithms, serialization, containers, config parsing, …)
4. **Platform Layer** — OS abstraction and platform I/O (threads, timers, sockets, UART, GPIO, I2C, …)

Application is one logical layer. In the repo it is split by role into several top-level directories—not extra architecture layers:

| Directory | Role |
|-----------|------|
| `apps/` | Product or user-project entrypoints (framework-owned nodes do not live here; `turtle_demo` is [Turtle Demo](./turtle-demo.md); planned rover / agri station are [Rover Demo](./rover-demo.md) and [Agri Station Demo](./agri-station-demo.md); `smart_device_demo` remains a minimal product entry reference) |
| `system/` | Built-in, mostly essential system nodes |
| `services/` | Optional runtime services |
| `examples/` | Samples and reference implementations |
| `tools/` | Dev, debug, and ops utilities |

Lower layers map roughly to `communication/`, `core/`, `components/`, and `platform/`. Helper dirs such as `third_party/` and `configs/` sit alongside.

In `menuconfig`, top-level menus are grouped for engineering UX:

```text
Build / Toolchain
Application Layer
Middleware Layer
Components Layer
Platform Layer
Third party
Tests
```

`Application Layer` aggregates `apps/`, `system/`, `services/`, `examples/`, and `tools/`.
`Middleware Layer` aggregates communication and core runtime settings such as `Communication` and `Core Runtime`.

## Product vs framework boundaries

You can develop inside the OpenEmber source tree, or let an independent product own top-level CMake, Kconfig, apps, services, and model configs while referencing the framework via `add_subdirectory(openember)`. In independent mode the table above describes the framework repo itself; the product owns its own `apps/`, `packages/`, `modules/`, and `products/`. Dependencies flow product → public framework interfaces; the framework must not depend on a product’s drivers or business logic.

A third planned mode is develop-after-SDK-install: products use `find_package(OpenEmber)` against installed public headers and libraries and build independently without embedding framework source. Soft-link + build-together remains recommended today; SDK install/export is not implemented yet.

How to choose and the concrete steps: [Create your first product](./product-quickstart.md).

## Dependency direction

```
Application (apps / system / services / examples / tools)
  ↓
middleware (communication / core)
  ↓
components
  ↓
platform
  ↓
Operating system (Linux, …)
```

Upper layers may depend on lower layers—not the reverse—so you can test and swap implementations (e.g. transport or HAL backends) in isolation.

Common component-layer capabilities include logging ([Logging](./openember-logging.md)), [Algorithm](./openember-algorithm.md), and [Thread Pool](./openember-thread-pool.md). Communication: [OpenEmber Link](./openember-link.md).

## Detection and response responsibilities

Model device-feedback detection, behavior response, and action execution separately. Detectors report interpretable state and events; product policy decides notify, degrade, recover, or request fault latch from the current action, control ownership, and capability. A single tilt/temperature/error threshold must not hard-bind one response for every product. Independent lower-level capability and authorization checks still run—see [Detection, response, and recovery](./detection-and-response).

## Design goals (summary)

- **Extensible**: plugin-style modules and Kconfig trimming for different products and compute budgets.
- **Dependency management**: options such as `OPENEMBER_THIRD_PARTY_MODE` (FETCH / VENDOR / SYSTEM) for offline and enterprise builds.
- **Communication abstraction**: OpenEmber Link exposes stable Topic, Service, Liveliness, and codec semantics while hiding the transport backend.

Full layered specification: upstream [layered design guide](https://github.com/openember/openember/blob/main/docs/architecture/layered-architecture-design-guide.md) and [Application layer design guide](https://github.com/openember/openember/blob/main/docs/architecture/application-layer-design-guide.md). Communication: [OpenEmber Link](./openember-link.md).

Launch orchestration, the shared Link router, and whole-machine state service boundaries: [Launch orchestration and system state](./launch-and-system-state.md).
