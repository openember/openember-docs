---
sidebar_position: 3.5
---

# Build configuration and runtime parameters

OpenEmber separates build-time capabilities from device runtime parameters. Kconfig with CMake decides what the program includes; YAML decides which parameters already-built modules run with. Products may integrate the framework from source or develop inside the framework tree—this split does not change with the engineering mode.

## Responsibility boundaries

| Content | Where it lives | When it takes effect |
| --- | --- | --- |
| Which apps, services, drivers, or inference backends are enabled | Kconfig / product defconfig | Rebuild |
| Compile options, platform/arch, which libraries to link | Kconfig + CMake / toolchain | Rebuild |
| Dependency versions and source baselines | CMake dependency lists, revision / lock records; optional Kconfig selectors | Re-fetch deps and rebuild |
| Which processes to start, CLI args, supervision policy | launch YAML, interpreted by launch_manager | Restart orchestration |
| Device instances, endpoints, sample rates | hardware YAML, interpreted by the hardware program | Per that module’s load path |
| Joint gains, target poses, trajectory limits, policy paths, teleop mapping | Product-owned module parameter YAML | First version loads at node start; restart the node after edits |

Kconfig is a poor place for frequently tuned per-joint gains, calibration, or motion trajectories. YAML also cannot enable an unbuilt driver, install missing dependencies, or override ABI fixed at build time. The sole source of dependency versions remains the lists actually used by the build; changing runtime parameters alone must not switch library versions.

Runtime parameters are not hot-reload. The first version of the shared config component provides startup load and validation only—**no automatic reload, parameter service, or remote retune**. Online tuning during control needs the module to define adjustable fields, control state, full validation, atomic apply, and failure rollback separately.

## Which project owns parameters

Core `openember::config` provides shared YAML file loading, read-only node access, type conversion, and error locations. Modules define their own parameter structs, defaults, field ranges, and cross constraints. The framework does not ship joint names or gains for a specific robot.

Products may organize parameters by model, for example:

```text
products/DEMO_A/
  product.defconfig
  launch.yaml
  hardware.yaml
  motion-control.yaml
```

This is an organization example—the framework does not auto-discover or merge these files. Modules should receive paths via explicit CLI args or launch config. If the product already has a `robots/<robot_id>/` asset tree, keep using it to avoid duplicate maintenance. Map per-joint parameters by joint name; when migrating existing robot configs, record source, frames, units, and versions together. Capability ceilings come from hardware/model limits; runtime config must not bypass them.

Detection modules should configure “what to detect” and “how to handle” separately: thresholds, windows, hysteresis, and debounce belong to detection parameters; responses under action context, recovery budgets, and clear conditions belong to product policy parameters. Validate and apply both against a consistent version snapshot—see [Detection, response, and recovery](./detection-and-response). That is a parameter-organization rule; the shared YAML component does not automatically provide detectors or response state machines.

## Loading from a C++ module

Enable `OPENEMBER_COMPONENT_CONFIG` under Components Layer in Kconfig (it depends on existing `OPENEMBER_USE_YAMLCPP`). Link the CMake target:

```cmake
target_link_libraries(my_node PRIVATE openember::config)
```

Example config:

```yaml
schema_version: 1
controller:
  kp: 80.0
  kd: 2.0
  max_effort_nm: 30.0
```

Load and validate before creating side-effecting devices or starting control loops:

```cpp
#include <openember/config/yaml.hpp>

const auto root = openember::config::LoadYamlFile(config_path);
root.CheckKeys({"schema_version", "controller"});
root.At("schema_version").Require(
    root.Get<int>("schema_version") == 1, "unsupported schema version");
const auto controller = root.At("controller");
controller.CheckKeys({"kp", "kd", "max_effort_nm"});
const double kp = controller.At("kp").AsInRange<double>(0.0, 1000.0);
const double kd = controller.At("kd").AsInRange<double>(0.0, 100.0);
const double effort = controller.At("max_effort_nm").AsInRange<double>(0.0, 30.0);
controller.At("max_effort_nm").Require(effort > 0, "must be positive");
```

Ranges in the example illustrate the API. Real ranges come from the module and device capability; the config schema is owned by the module. `CheckKeys` rejects undeclared fields; required fields are checked via `At` / `Get`. `GetOr` applies a default only when the field is missing—explicit null or wrong type still errors.

Modules should build a complete strongly typed parameter object first, then hand it to the running instance. The shared reader does not keep a global parameter store and does not parse while updating a live controller. Existing launch / hardware parsers keep their own formats; this component does not automatically take them over or convert them.

## Format and error conventions

- The public API does not expose yaml-cpp types; return values are immutable config snapshots that can be shared for reads after load.
- Errors include source, field path, and line/column when available; missing fields use the parent node location.
- Integers are decimal only; booleans are only `true` / `false`; floats must be finite. Scalars convert by requested type; quoting does not change that rule.
- Reject duplicate keys, non-string complex keys, `<<` merge keys, custom tags, and multiple YAML documents.
- Ordinary aliases are allowed but expansion is still limited by depth and node count; cyclic aliases are rejected by the depth limit.
- Defaults: max input 1 MiB, expand depth 32, node count 65536—these are read protections, not a sandbox against malicious input.
- No automatic env expansion, no include, no merge of default/model/local files. If a module needs resource-path resolution, define the base path explicitly.

Related entry points: [Create your first product](./product-quickstart), build flow: [Build OpenEmber](./build-openember).

## Saving and restoring model build configs

One product tree can contain multiple models. `products/<model>/product.defconfig` is the versioned model default; `build/<model>/.config` is the full working build config for that model. On first configure, tools merge the shared baseline `openember.defconfig` (if present) with the model default, then resolve Kconfig defaults and dependencies. When `.config` already exists, `menuconfig` keeps using it and does not reload the model default every time. Examples below use `DEMO_A` and `DEMO_B`.

| Operation | Read / write direction | Purpose |
| --- | --- | --- |
| `ember menuconfig --product DEMO_A` | Opens the model’s working config; on save + normal exit updates `build/DEMO_A/.config` | Adjust features for this build |
| Menu **Save** (keep default filename) | Saves the full config in the menu editor; on normal exit writes back that model’s `.config` | Persist menu edits |
| Menu **Save** (other filename) | Saves a full config copy elsewhere | Export a copy; does not register a new model |
| `ember savedefconfig --product DEMO_A` | `build/DEMO_A/.config` → `products/DEMO_A/product.defconfig` | Commit a verified selection as the model default |
| `ember defconfig --product DEMO_A` | Shared baseline + model default → `build/DEMO_A/.config` | Reset to model defaults; existing `.config` is backed up as `.config.pre-defconfig` |

Menu Save behaves like Linux kernel menuconfig: save the full config or Save As. The current wrapper edits under a temp dir first, so the header may show `build/<model>/.kconfig.XXXXXX/.config`. Only after keeping the default save path and exiting normally does the tool write the formal `.config` and refresh `config.cmake`. Do not treat the temp path as a long-term config location. Save As only exports; it does not replace saving to the default path and does not automatically change `CONFIG_PRODUCT_MODEL`.

`savedefconfig` stores the delta versus the **resolved shared project baseline**, keeping the model id. It is not a raw copy of `.config`, nor only a diff against raw Kconfig defaults. The resulting `product.defconfig` is for Git, reproduction by other developers, and regenerating config after cleaning the build tree. It does not create a new product repo, switch models, or auto-generate launch/hardware configs.

Typical sequence:

```bash
ember menuconfig --product DEMO_A
# Adjust options, Save with the default filename, then exit normally.
ember build --product DEMO_A
# After verification, update the versioned model default.
ember savedefconfig --product DEMO_A
```

The next `ember menuconfig --product DEMO_A` continues with the working config; to reset from the saved default, run `ember defconfig --product DEMO_A`. Reset replaces the working config—do not treat it as a casual refresh.

### Adding a model to an existing product

The CLI currently requires `products/<model>/product.defconfig` to exist already; `savedefconfig --product <model>` cannot create an unknown model. Copy a nearby model’s default, change the model id, then open the menu:

```bash
mkdir -p products/DEMO_B
cp products/DEMO_A/product.defconfig products/DEMO_B/product.defconfig
sed -i 's/^CONFIG_PRODUCT_MODEL=.*/CONFIG_PRODUCT_MODEL="DEMO_B"/' \
  products/DEMO_B/product.defconfig
ember menuconfig --product DEMO_B
ember savedefconfig --product DEMO_B
```

Reads and writes then belong to `DEMO_B`, with default build dir `build/DEMO_B/`. Copying assumes a usable `DEMO_A` already exists; after copy, still check model-specific Kconfig conditions and capability selections. Menu Save As into a new directory does not finish those adaptations.

These steps only establish build config. To start with `ember run`, also prepare that model’s `launch.yaml`, provide `hardware.yaml` and module runtime parameters as needed, and validate model, device, and resource paths inside them. Creating a brand-new product repo uses `ember new <name> --model <model>`—that is a different operation from adding a model to an existing product.

### Local build environment

Host SDK, toolchain, and dependency source paths may go in an ignored `.ember-local.cmake` (loaded on every `update` / `build`), or another file via `OPENEMBER_CMAKE_LOCAL`. Dependency source versions still come from dependency lists and the actual source baselines. Do not rely on feature toggles left only in an old `CMakeCache.txt` and not recorded in the model config.
