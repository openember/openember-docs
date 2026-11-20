---
sidebar_position: 2.5
---

# Create your first product

OpenEmber supports three engineering modes: maintain the framework source tree directly, integrate the framework source into an independent product and build together, and—planned—develop against an installed SDK. The first two already have entry points; the third is for later SDK delivery.

This page uses the in-tree `scripts/ember` from the OpenEmber repo; commands follow the current scaffold. Prepare [build dependencies](./build-openember) first (Linux, C/C++ compiler, CMake, Protobuf). Building Zenoh from source also needs Rust/Cargo. The first build may download dependencies.

## Choosing a mode

| | Mode 1: maintain framework source | Mode 2: product source integration | Mode 3: develop with installed SDK |
|---|---|---|---|
| Status | Available | Available (recommended today) | Planned, not implemented yet |
| Project root | Fork or copy of OpenEmber | Your product repo | Your node or product repo |
| Framework access | Source belongs to your tree; you can edit it | Soft-link or submodule the source | Install libs, headers, and CMake package |
| Build | Framework and business built together | Product uses `add_subdirectory(openember)` | `find_package(OpenEmber)`, business builds alone |
| Product code | Apps/services/modules inside the tree | Under product `apps/`, `packages/`, `modules/` | In your project, linking public SDK interfaces |
| Upgrades | Merge upstream yourself and resolve conflicts | Bump dependency source, then re-verify | Update installed SDK, check compatibility |
| Fit for | Deep customization, learning, full-source delivery | Current products, multi-model, framework co-debug | Later shared SDK, independent nodes, binary delivery |

**Recommended today: Mode 2—soft-link OpenEmber core into the product and build framework + product together.** Focus on project layout and public interfaces first; do not require packaging the framework as a standalone SDK yet. Use a submodule when you need a pinned revision or shared repos.

In all three modes the product team owns business code; scaffold output is not auto-updated. Current `ember new` maps to Mode 2; `ember new --standalone` and `ember dist` remain future capabilities.

## Mode 1: start from OpenEmber source

From your fork or source copy, at that repo root:

```bash
./scripts/ember menuconfig
./scripts/ember build -j 4
```

You can also run `./scripts/ember build -j 4` non-interactively for a default config. Validate the environment with existing samples—see [Turtle Demo](./turtle-demo).

When building your own product:

1. Add a product entry and `CMakeLists.txt` under `apps/my_device/`; shared business libs can live in `modules/`.
2. `add_subdirectory(my_device)` in `apps/CMakeLists.txt`, add a `PRODUCT_*` switch in `apps/Kconfig` (e.g. `PRODUCT_BUILD_MY_DEVICE`), and gate the build with the generated CMake option.
3. Optional services can live under `services/` with the same Kconfig/CMake wiring.
4. Add `configs/my_device.launch.yaml` for processes, args, and restart policy.
5. Build with `launch_manager` enabled and start your config explicitly:

```bash
./build/bin/launch_manager --launch configs/my_device.launch.yaml
```

Product nodes join the launch router as Link clients. Prefer `apps/smart_device_demo/` and `configs/smart_device.launch.yaml` as references; do not rely only on default launch discovery to pick your product.

Keep original copyright and license notices. After editing framework and business in one tree, upstream upgrades need your own merge/rebase and verification of affected interfaces and configs.

## Mode 2: create an independent product

### 1. Create the project

With `openember/` already in the workspace, from its parent directory:

```bash
./openember/scripts/ember new my-robot --model host
cd my-robot
```

The scaffold soft-links `openember/` to the framework tree used to run the command; it does not copy the whole framework. Layout:

```bash
my-robot/
├── CMakeLists.txt              # product is the real top-level CMake project
├── Kconfig
├── kconfig/applications.Kconfig
├── apps/product_app/           # initial product node
├── modules/                    # your modules
├── products/host/
│   ├── product.defconfig       # model default build options
│   ├── hardware.yaml          # hardware placeholder—fill real endpoints
│   └── launch.yaml            # process runtime config
├── product.default            # default model: host
├── scripts/build.sh
└── openember/                 # framework dependency
```

Product `Kconfig` includes the framework’s shared `kconfig/workspace.Kconfig`; the config tools bind the framework path and compose product fragments—you do not copy that file or the full Kconfig script set into the product repo.

### 2. Configure and build

From `my-robot/`:

```bash
./openember/scripts/ember genconfig --product host
./openember/scripts/ember build --product host -j 4
```

For interactive selection, replace the first command with:

```bash
./openember/scripts/ember menuconfig --product host
```

Artifacts land in `build/host/bin/`; the working model config is `build/host/.config`. The product root CMake builds the framework via `add_subdirectory(openember)`, then your apps—no separate framework-only build first.

### 3. Check and run

```bash
./openember/scripts/ember run --product host --dry-run
./openember/scripts/ember run --product host
```

The first only prints the start command; the second runs `launch_manager`, which brings up a local router and then product nodes. Default endpoint is `tcp/127.0.0.1:7447`—ensure no conflicting instance is running.

You should see the product app start and heartbeat logs. The initial binary is `build/host/bin/openember_my_robot_app`, heartbeat topic `/nodes/my_robot_app/heartbeat`. That only proves wiring and process liveness; the template has no robot control logic or real hardware endpoints.

Ctrl+C ends the run. Your nodes should handle SIGINT/SIGTERM, stop workers, release devices, and call `openember::Shutdown()` in the main loop; forced kill by the supervisor is not a substitute for business cleanup.

### 4. Pin the framework dependency

Soft-links are fine for co-debug on one machine; changing the link target immediately affects the product build. For shared repos or delivery, prefer a pinned submodule. Example from the workspace parent:

```bash
./openember/scripts/ember new my-device --model host --no-symlink
cd my-device
# --no-symlink leaves an access note only; remove it, then add the submodule
rm openember/README.md
rmdir openember
git init
git submodule add https://github.com/openember/openember.git openember
```

Check out the framework commit already validated for the product, then commit the submodule pointer. Teammates should `git clone --recurse-submodules`. Do not record one revision text while still compiling another source tree.

Beyond the framework, also record `openember-msgs`, third-party libs, external SDKs, and toolchain versions; message-source options are covered in [Build OpenEmber](./build-openember). After bumping deps, rebuild and run product tests.

## Mode 3: develop against an installed SDK (planned)

The goal is to install OpenEmber core first, then develop nodes or products against installed headers, libraries, and CMake package config—without embedding or rebuilding framework source in the app workspace. The experience is similar to a ROS install env plus an app workspace, but that does **not** mean ROS compatibility or adopting its full package/build system.

Illustrative target usage—**a complete installable SDK workflow is not available yet**:

```cmake
cmake_minimum_required(VERSION 3.16)
project(my_node LANGUAGES CXX)

find_package(OpenEmber CONFIG REQUIRED)
add_executable(my_node main.cpp)
target_link_libraries(my_node PRIVATE openember::core)
```

The SDK should export CMake targets that carry public include paths, compile requirements, and link deps so developers do not hand-stitch internal framework paths. Product-specific messages and drivers stay in the product project.

Later delivery should distinguish:

- **Dev SDK**: public headers, libraries, generated headers, public message bindings, CMake package config, and required transitive deps.
- **Runtime components**: libraries needed to run apps, plus optional `launch_manager` and system services. Starting a node connects to a configured runtime/router; installing the SDK does not auto-start them.

Shipping this mode still needs install/export rules, a discoverable `OpenEmberConfig.cmake`, version/ABI policy, dependency version management, and build/run verification outside the framework source tree. The SDK must match target arch and toolchain. For now only record the mode and boundaries; keep using Mode 2 for product work without changing the current build flow.

## Adding features in an independent product

### Apps and services

Add `apps/my_service/` and `add_subdirectory(apps/my_service)` from the product root CMake. Minimal build:

```cmake
add_executable(my_service main.cpp)
target_link_libraries(my_service PRIVATE openember::core)
set_target_properties(my_service PROPERTIES
    RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/bin")
add_dependencies(openember_product my_service)
```

`main.cpp` uses `openember::Init`, `CreateNode`, and Node pub/sub, Service/Client APIs. Initial `apps/product_app/main.cpp` is a wiring reference; communication concepts are in [OpenEmber Link](./openember-link).

Append the process under `nodes` in `products/host/launch.yaml`:

```yaml
  - name: my_service
    kind: service
    command: ${openember.bin}/my_service
    args: ["--client"]
    restart: on-failure
    restart_limit: 3
    shutdown_timeout_ms: 3000
    heartbeat_timeout_ms: 5000
```

`--client` must be parsed by the program. Publish `/nodes/my_service/heartbeat` with `node_name` matching launch. Tools without heartbeat can set `heartbeat_timeout_ms: 0` to disable supervision for that process. When a build switch disables a node, remove it from launch as well.

### Product messages

Create `packages/my_interfaces/` at the product root and add it from top-level CMake. Inside the package you can use:

```cmake
openember_add_proto_library(
    TARGET my_interfaces
    ALIAS my_robot::interfaces
    PROTOS proto/status.proto)
```

Consumers link `my_robot::interfaces` for generated headers and Protobuf. To import public messages, take `OPENEMBER_PROTO_ROOT` from `openember::msgs_proto`, pass it as `IMPORT_DIRS`, and link `openember::msgs_cpp`. Keep product-specific messages in the product repo; promote shared protocols to the public message repo when ready.

### Hardware drivers and endpoints

Enable Hardware Interface and required components, implement adapters in a product package, register factories via `EndpointRegistry`, and pass the registry to `HardwareInterfaceApp`. Link `openember::hardware_interface` so the framework publishes device state and diagnostics.

Existing `IImu` implementations can reuse the shared IMU endpoint through public `MakeImuEndpoint`. Model protocols, vendor SDKs, calibration, and device paths belong to the product; new product drivers must not require editing built-in framework factory branches. Steps and contracts: upstream [hardware endpoint extension](https://github.com/openember/openember/blob/main/docs/design/hardware-endpoint-extension.md).

Generated `hardware.yaml` is only a placeholder—filling device paths does not auto-load drivers; the program must read config, register, and start endpoints.

## Managing multiple models

Add model dirs under `products/`, each with its own `product.defconfig`, `hardware.yaml`, and `launch.yaml`, then select and build:

```bash
./openember/scripts/ember menuconfig --product robot-a
./openember/scripts/ember build --product robot-a -j 4
./openember/scripts/ember run --product robot-a --dry-run
```

Share business code, keep config per model, isolate artifacts under `build/<model>/`. Explicit `--product` is the clearest; without it tools reuse the selected model, initially from `product.default`.

Full split between build options and module runtime parameters: [Build configuration and runtime parameters](./configuration).

- **Kconfig** decides which capabilities participate in the build; product options use `PRODUCT_*` (often in `kconfig/applications.Kconfig`) and export as same-named CMake variables.
- **launch YAML** decides which processes run, args, and supervision.
- **hardware YAML** is interpreted by the hardware program for device instances and endpoints.

Rebuild after config changes. `ember defconfig --product host` resets that model’s working config (backed up as `.config.pre-defconfig`); editing an existing model’s default file does not automatically overwrite its working `.config`.

## Next steps

Finish no-hardware bring-up, messaging, exit, and fault tests before real devices. Whole-machine state machines, cyclic control, safety, policy, and deployment stay on the product side—framework process heartbeats do not replace device readiness or control authorization.

More boundaries: upstream [product scaffold and variants](https://github.com/openember/openember/blob/main/docs/design/product-scaffold-and-variants.md) and [runtime supervision and product app](https://github.com/openember/openember/blob/main/docs/architecture/runtime-supervision-and-product-app-design.md).
