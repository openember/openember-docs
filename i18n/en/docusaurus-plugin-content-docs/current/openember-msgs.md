---
sidebar_position: 5
---

# openember-msgs protocol

`openember-msgs` is the message-protocol repository shared by OpenEmber and EmberLite. It stores `.proto` definitions, Nanopb constraints, and the generation entry points. It does not implement the OpenEmber or EmberLite runtime.

Core principles:

- **Versioned on its own**: message definitions are maintained and tagged in `openember-msgs`.
- **Each runtime binds itself**: OpenEmber uses C++ Protobuf. EmberLite uses Nanopb C.
- **Zenoh routes**: a Zenoh key decides where a message is published. The Protobuf message decides the payload layout.
- **Do not copy protocol files**: OpenEmber and EmberLite should not each keep a private `.proto` tree.

## Current status

`openember-msgs` currently defines the first set of core runtime messages:

| Package | Purpose |
|---------|---------|
| `common/v1` | Shared types such as `Header`, `Status`, `QosProfile`, `Metric`, and `BoolStamped` |
| `node/v1` | Node info, heartbeat, node queries, and node-registry snapshots |
| `lifecycle/v1` | Lifecycle state, transition commands, and events |
| `diagnostics/v1` | Diagnostic status and health |
| `parameter/v1` | Parameter get, set, and event notification |
| `log/v1` | Structured logs |
| `device/v1` | Device info, device status, and device queries |
| `runtime/v1` | Process start, stop, and process events |
| `sensor/v1` | IMU, temperature, and GNSS samples and status; generic scalar sample `ScalarSample` |
| `actuator/v1` | Joint commands, state, and actuator health |
| `power/v1` | Battery and power status and control |
| `geometry/v1` | Planar pose and velocity (`Pose2D`, `Twist2D`; see [Turtle Demo](./turtle-demo.md)) |
| `host/v1` | Host resource snapshot (`HostResourceSnapshot`: CPU / memory / load / disk; published by `services/host_monitor` on `/host/resources`) |

### Shared helper types

| Type | Package | Purpose |
|------|---------|---------|
| `BoolStamped` | `common/v1` | Boolean with a `Header` (for example e-stop or an enable switch) |
| `ScalarSample` | `sensor/v1` | Single scalar reading with a `Header`: `quantity` + `value` + `unit` (humidity, illuminance, soil moisture, CO₂, and similar quantities that do not have a dedicated type yet) |

Both are generic messages reused across products. They are not tied to one demo. The authority is the corresponding `.proto` in the `openember-msgs` repository.

OpenEmber already consumes the C++ Protobuf generation target. By default it `FETCH`es a `main` archive, or you can select `LOCAL` and use a local checkout. EmberLite already consumes the Nanopb C generation target. Both projects gate the protocol with `OPENEMBER_ENABLE_MSGS`.

## Kconfig layout

The message protocol is a first-class communication contract for the OpenEmber ecosystem. It affects nodes, tools, device management, diagnostics, parameters, and runtime services. It should not sit under `Core Runtime`, `Components Layer`, or a pure `Third party` menu. Manage it with the communication layer of `Middleware Layer`:

```text
Communication / Messages
```

OpenEmber uses the structure below. EmberLite can align to the same semantics later:

```kconfig
menu "Communication"

menu "Link"

config OPENEMBER_ENABLE_LINK
    bool "Enable OpenEmber Link"
    default y
    depends on OPENEMBER_COMPONENT_TRANSPORT
    help
      Build the stable OpenEmber communication layer for Topic, Service,
      Liveliness, node discovery, diagnostics, and message serialization.

endmenu

menu "Messages"

config OPENEMBER_ENABLE_MSGS
    bool "Enable openember-msgs protocol bindings"
    default y
    help
      Build generated protocol bindings from openember-msgs.
      OpenEmber uses C++ Protobuf bindings; EmberLite uses Nanopb C bindings.

choice OPENEMBER_MSGS_SOURCE_CHOICE
    prompt "openember-msgs source"
    depends on OPENEMBER_ENABLE_MSGS
    default OPENEMBER_MSGS_SOURCE_FETCH

config OPENEMBER_MSGS_SOURCE_FETCH
    bool "FETCH"
    help
      Download the selected openember-msgs ref during CMake configure.

config OPENEMBER_MSGS_SOURCE_LOCAL
    bool "LOCAL"
    help
      Use a local openember-msgs checkout. OPENEMBER_MSGS_LOCAL_SOURCE must be
      an absolute path.

endchoice

config OPENEMBER_MSGS_LOCAL_SOURCE
    string "openember-msgs local source path"
    depends on OPENEMBER_ENABLE_MSGS && OPENEMBER_MSGS_SOURCE_LOCAL
    default ""

choice OPENEMBER_MSGS_REF_CHOICE
    prompt "openember-msgs version"
    depends on OPENEMBER_ENABLE_MSGS && OPENEMBER_MSGS_SOURCE_FETCH
    default OPENEMBER_MSGS_REF_LATEST

config OPENEMBER_MSGS_REF_LATEST
    bool "latest"

endchoice

endmenu

endmenu
```

Recommended Kconfig to CMake mapping:

| Kconfig | CMake | Meaning |
|---------|-------|---------|
| `OPENEMBER_ENABLE_MSGS=y` | `OPENEMBER_ENABLE_MSGS=ON` | Generate and link protocol bindings |
| `OPENEMBER_MSGS_SOURCE_FETCH=y` | `OPENEMBER_MSGS_SOURCE=FETCH` | Fetch `openember-msgs` remotely |
| `OPENEMBER_MSGS_SOURCE_LOCAL=y` | `OPENEMBER_MSGS_SOURCE=LOCAL` | Use a local `openember-msgs` checkout |
| `OPENEMBER_MSGS_LOCAL_SOURCE="/abs/path"` | `OPENEMBER_MSGS_LOCAL_SOURCE=/abs/path` | Absolute path of the local checkout |
| `OPENEMBER_MSGS_REF_LATEST=y` | `OPENEMBER_MSGS_REF=main` | Use the latest code on the `openember-msgs` main branch |

`Third party` may still contain `OPENEMBER_THIRD_PARTY_BUNDLE_OPENEMBER_MSGS`. That symbol only describes source acquisition, such as whether to download, cache, or use a vendor archive. It does not mean "enable the message protocol".

The user must choose `OPENEMBER_MSGS_SOURCE` explicitly:

- `FETCH`: the default. Configure downloads the latest archive of the `openember-msgs` `main` branch. The cache name is `openember-msgs-main`.
- `LOCAL`: use the path in `OPENEMBER_MSGS_LOCAL_SOURCE`. The path must be absolute, and the directory must contain `CMakeLists.txt`.

The build no longer switches to local sources just because `../openember-msgs` exists next door. A local checkout is used only when `LOCAL` is selected.

Recommended relationship:

```kconfig
config OPENEMBER_THIRD_PARTY_BUNDLE_OPENEMBER_MSGS
    bool "Bundle: openember-msgs"

config OPENEMBER_TP_LINK_OPENEMBER_MSGS
    bool
    default y if OPENEMBER_ENABLE_MSGS
    select OPENEMBER_THIRD_PARTY_BUNDLE_OPENEMBER_MSGS
```

EmberLite uses Nanopb, so enabling the protocol should also make the Nanopb bundle available:

```kconfig
config OPENEMBER_TP_LINK_NANOPB
    bool
    default y if OPENEMBER_ENABLE_MSGS
    select OPENEMBER_THIRD_PARTY_BUNDLE_NANOPB
```

Menu responsibilities then stay clear:

- `Communication / Link`: whether to enable the OpenEmber Link communication layer.
- `Communication / Messages`: whether to enable protocol bindings, and which `openember-msgs` version to use.
- `Third party`: how sources are obtained — download, cache, vendor archive, system packages.
- `Core` / `Component`: runtime libraries and feature modules only. They do not select a protocol version.

## Recommended dependency style

Treat `openember-msgs` as an independent third-party protocol dependency. Do not copy it into each repository.

Preferred order:

1. **Day-to-day development and CI tracking main**: use the defaults `OPENEMBER_MSGS_SOURCE=FETCH` and `OPENEMBER_MSGS_REF=main`.
2. **Local protocol development**: set `OPENEMBER_MSGS_SOURCE=LOCAL` and point `OPENEMBER_MSGS_LOCAL_SOURCE=/abs/path/to/openember-msgs` at a local checkout.
3. **Offline builds**: use the `FETCH` / `VENDOR` archive cache and place `openember-msgs-main.tar.gz` in each repository's `third_party/` cache.
4. **Product releases**: once tag and commit options exist, pin a specific `openember-msgs` tag or commit.

Avoid:

- Hand-writing a separate message layout in OpenEmber and another in EmberLite.
- Committing Protobuf-generated C++ sources into the OpenEmber main repository.
- Making `openember-msgs` depend back on OpenEmber, EmberLite, or the Zenoh runtime.

## Build outputs and linking

Protobuf and Nanopb generate more than headers. `.pb.h` declares message types and serialization APIs. `.pb.cc` or `.pb.c` contains the implementations, so those files must be compiled and linked into the final program.

OpenEmber uses C++ Protobuf. The build directory gets `generated/openember/msgs/.../*.pb.h` and `*.pb.cc`, compiled into the `openember_msgs_cpp` static library and exported as the CMake target `openember::msgs_cpp`. After `core`, transport, a node, or a tool links that target, it can include the generated `.pb.h` and use the message types directly.

EmberLite uses Nanopb C. The build directory gets `*.pb.h` and `*.pb.c`, compiled into the `emberlite_msgs` static library. The EmberLite runtime, the Zenoh-pico adapter, or an example node links that library as needed.

## FETCH / LOCAL switching

`OPENEMBER_MSGS_SOURCE=FETCH` and `OPENEMBER_MSGS_SOURCE=LOCAL` can be switched back and forth in the same build directory, but the roles of a few paths in that directory matter.

In `FETCH` mode, CMake configure uses `third_party/openember-msgs-main.tar.gz` as the archive cache and unpacks sources to:

```text
build/_deps/openember-msgs-main
```

On reconfigure, the current implementation deletes `build/_deps/openember-msgs-main` and unpacks the archive again. That keeps `FETCH` mode from continuing to use a stale unpacked tree.

In `LOCAL` mode, CMake does not use `build/_deps/openember-msgs-main` as the source. It uses:

```text
OPENEMBER_MSGS_LOCAL_SOURCE=/abs/path/to/openember-msgs
```

After switching from `FETCH` to `LOCAL`, an old `build/_deps/openember-msgs-main` directory is ignored even if it is still present. Switching back to `FETCH` deletes and unpacks `build/_deps/openember-msgs-main` again during configure.

OpenEmber's C++ Protobuf subproject uses a separate build directory:

```text
build/_deps/openember-msgs-main-build
```

The current implementation deletes that directory on reconfigure, then calls `add_subdirectory()` on the protocol subproject again. Switching OpenEmber between `FETCH` and `LOCAL` therefore rebuilds the C++ generation and link targets.

EmberLite's Nanopb output directory is:

```text
build/generated/openember-msgs
```

The current implementation does not delete that directory when `FETCH` and `LOCAL` switch. It relies on CMake custom-command dependencies to regenerate. That is usually enough. If stronger consistency is needed later, add a source stamp that records the protocol source in use, for example `FETCH:main` or `LOCAL:/abs/path/to/openember-msgs`, and delete `build/generated/openember-msgs` when the source changes so generation runs again.

If other dependencies later need the same explicit `FETCH` / `LOCAL` choice, a shared source resolver can centralize source checks, absolute-path checks, archive caching, the `build/_deps` staging directory, marker-file checks, and optional cleanup on switch. Today only `openember-msgs` needs this behavior, so it is not abstracted yet. A heavy shared interface for a single user would be premature.

## Usage in OpenEmber

OpenEmber is the C++ line. Use the standard Protobuf C++ runtime.

Suggested build flow:

1. CMake obtains or locates `openember-msgs` through `cmake/GetOpenEmberMsgs.cmake`.
2. OpenEmber defaults to `OPENEMBER_ENABLE_MSGS=ON` and sets `OPENEMBER_MSGS_BUILD_CPP=ON` in the protocol subproject.
3. `protoc` generates `.pb.cc` and `.pb.h` in the build directory.
4. Those sources compile into the `openember_msgs_cpp` static library.
5. OpenEmber `core`, `transport`, system nodes, or tools link that library as needed.

Sketch:

```cmake
target_link_libraries(openember_core
    PUBLIC
        openember::msgs_cpp
)
```

Runtime conventions:

- Publish `openember.msgs.node.v1.NodeInfo` when a node comes online.
- Publish `openember.msgs.node.v1.NodeHeartbeat` periodically.
- Lifecycle control uses `LifecycleCommand` and `LifecycleCommandResponse`.
- The parameter service uses messages such as `GetParameterRequest` and `SetParameterRequest`.

Typical Zenoh keys:

```text
openember/<robot_id>/<namespace>/nodes/<node>/info
openember/<robot_id>/<namespace>/nodes/<node>/heartbeat
openember/<robot_id>/<namespace>/nodes/<node>/lifecycle
openember/<robot_id>/<namespace>/diagnostics/<node>
openember/<robot_id>/<namespace>/logs/<node>
```

The payload is the binary encoding of the corresponding Protobuf message. Type information can be recorded in the node registry, or agreed at the tool layer as a MIME type or encoding, for example:

```text
application/x-protobuf;type=openember.msgs.node.v1.NodeInfo
```

## Usage in EmberLite

EmberLite is pure C. Do not link the Google Protobuf C++ runtime. Use Nanopb. `OPENEMBER_ENABLE_MSGS` is on by default in the target configuration. Turn it off when resources are very tight, or when you are building only the base libraries.

Suggested build flow:

1. CMake obtains or locates `openember-msgs` through `cmake/GetOpenEmberMsgs.cmake`.
2. Use `openember-msgs/nanopb/openember_msgs.options` as the Nanopb constraints.
3. `protoc` plus `nanopb_generator.py` generate `.pb.c` and `.pb.h`.
4. Compile the generated C files into the `emberlite_msgs` static library.
5. The EmberLite runtime, the Zenoh-pico adapter, or an example node links that library as needed.

Current CMake entry points:

```bash
cmake -S . -B build -DOPENEMBER_ENABLE_MSGS=ON
cmake --build build --target emberlite_msgs
```

The build environment needs:

- `protoc` on `PATH`.
- Nanopb sources, from the EmberLite third-party cache or from `OPENEMBER_NANOPB_LOCAL_SOURCE`.
- A Python that can `import google.protobuf`. CMake tries `Python3_EXECUTABLE`, `/usr/bin/python3`, and `python3` on `PATH`. If needed, set `OPENEMBER_PROTOBUF_PYTHON=/path/to/python3` explicitly.

Manual generation sketch:

```bash
python3 nanopb/generator/nanopb_generator.py \
  -I openember-msgs/proto \
  -f openember-msgs/nanopb/openember_msgs.options \
  openember-msgs/proto/openember/msgs/node/v1/node.proto
```

EmberLite should support both modes:

| Mode | Description |
|------|-------------|
| Development | `protoc` and the Nanopb generator are installed on the machine. The build generates `.pb.c` and `.pb.h` automatically |
| Release | Use Nanopb C sources pre-generated in an `openember-msgs` release, so the toolchain dependency is smaller |

Release mode is friendlier for industrial projects. A target SDK or cross-compile environment is not always a good place to install Python, the Protobuf compiler, and the Nanopb generator.

Nanopb constraint policy:

- Strings, small labels, metrics, parameter-name lists, and similar fields use `max_size` or `max_count`, so the C side can hold them statically.
- Large collections — node lists, device lists, diagnostic arrays, log batches, batched parameter responses, node endpoints — use `FT_CALLBACK`, so EmberLite does not preallocate a huge struct for one query response.
- For a callback field, the upper node or adapter supplies a `pb_callback_t` for encode and decode, and can stream the data as needed.

## Protocol development flow

Change the protocol in this order:

1. Edit or add a `.proto` under `openember-msgs/proto/openember/msgs/<domain>/v1/`.
2. Update `nanopb/openember_msgs.options` and set `max_size`, `max_count`, or `type:FT_CALLBACK` for new fields.
3. Validate Protobuf descriptors:

```bash
protoc -I proto --include_imports \
  --descriptor_set_out=/tmp/openember-msgs.desc \
  $(find proto -name '*.proto' -print | sort)
```

4. Generate and compile C++:

```bash
cmake -S . -B build -DOPENEMBER_MSGS_BUILD_CPP=ON
cmake --build build
```

5. If Nanopb is installed locally, generate the C code and compile an EmberLite example.
6. After that passes, tag `openember-msgs`.
7. Move OpenEmber and EmberLite to the same protocol tag.

## Version policy

Compatible changes:

- Add fields only.
- Give new fields new field numbers.
- Keep the meaning of existing fields.

Incompatible changes:

- Rename a field or a message.
- Change a field type.
- Delete a field without reserving its field number.
- Change the meaning of an existing field.

An incompatible change should create a new package version, for example:

```text
openember.msgs.node.v2
```

## Suggested next steps

OpenEmber:

- Connect `core::Node` `TypeName` and serialization to the generated Protobuf types.
- Use `NodeInfo` and `NodeHeartbeat` for a minimal node-discovery path.
- Record the relationship between topics, services, and message types in `node_registry`.

EmberLite:

- With `OPENEMBER_ENABLE_MSGS` enabled, use `NodeInfo` and `NodeHeartbeat` for a minimal node-discovery path.
- Connect `emberlite::msgs` to the Zenoh-pico adapter.
- Decide whether a release should ship pre-generated Nanopb C sources, to lower the bar for cross compilation.

After that, `openember-msgs` is the protocol source for the OpenEmber ecosystem. OpenEmber and EmberLite only own their own runtime, transport, and toolchain integration.
