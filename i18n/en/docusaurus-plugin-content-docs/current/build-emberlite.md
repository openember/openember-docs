---
sidebar_position: 4
---

# Build EmberLite

EmberLite uses **CMake** (3.16 or newer recommended) and, optionally, the same **Kconfig → `build/.config` → `build/config.cmake`** flow as OpenEmber to manage feature switches.

## Requirements

- Linux (POSIX)
- CMake ≥ 3.16
- GCC or Clang with C11
- `protoc`, Nanopb, and Python protobuf (`openember-msgs` is enabled by default; omit these if the message protocol is disabled)

## Recommended: one-shot `ember` build

From the **EmberLite repository root**:

```bash
chmod +x ./scripts/ember   # once
./scripts/ember build
```

What it does:

- If **`build/.config`** is missing, generates a default config non-interactively.
- Generates **`build/config.cmake`** from `.config`, then runs `cmake -S . -B build` and `cmake --build`.
- The first `menuconfig` may download **kconfig-frontends-nox** into **`.kconfig-frontends/`** (needs `curl`, `dpkg-deb`, and similar tools; that directory is gitignored).

Common subcommands:

| Command | Description |
|---------|-------------|
| `./scripts/ember menuconfig [build_dir]` | Interactive menu; writes `.config` and refreshes `config.cmake` |
| `./scripts/ember genconfig [build_dir]` | Rewrite `config.cmake` from `.config` only |
| `./scripts/ember update [build_dir]` | `cmake -S . -B <dir>` |
| `./scripts/ember clean [build_dir]` | Remove the build directory |

## Plain CMake (no Kconfig)

```bash
mkdir -p build
cmake -S . -B build
cmake --build build -j
```

Outputs:

- Executables: `build/bin/`
- Libraries: `build/lib/`

## Message protocol dependency

EmberLite enables `OPENEMBER_ENABLE_MSGS=ON` by default. In Kconfig this option lives under the top-level `Protocol / Messages` menu. When enabled, EmberLite shares the `openember-msgs` definitions with OpenEmber and generates Nanopb C bindings:

```bash
cmake -S . -B build -DOPENEMBER_ENABLE_MSGS=ON
cmake --build build --target emberlite_msgs -j
```

Generated sources land under `generated/openember/msgs/` in the build directory, as `*.pb.h` and `*.pb.c`. Those `*.pb.c` files are compiled into the `emberlite_msgs` static library for the EmberLite runtime, communication adapters, or example nodes to link.

Suggested local layout:

```text
Projects/OpenEmber/
├── emberlite/
└── openember-msgs/
```

If `openember-msgs` is not a sibling directory, point at it explicitly:

```bash
cmake -S . -B build \
  -DOPENEMBER_ENABLE_MSGS=ON \
  -DOPENEMBER_MSGS_SOURCE=LOCAL \
  -DOPENEMBER_MSGS_LOCAL_SOURCE=/path/to/openember-msgs
```

The default is `OPENEMBER_MSGS_SOURCE=FETCH`. Configure then downloads a `latest` archive of `openember-msgs` (currently mapped to the `main` branch). The build does not automatically use a neighboring `../openember-msgs` unless you select `LOCAL`.

If this build does not need message-protocol bindings yet, turn them off:

```bash
cmake -S . -B build -DOPENEMBER_ENABLE_MSGS=OFF
```

An enabled build needs:

- `protoc` on `PATH`.
- Nanopb sources, either from the third-party cache or from `OPENEMBER_NANOPB_LOCAL_SOURCE=/path/to/nanopb`.
- A Python that can `import google.protobuf`. CMake tries common `python3` paths automatically. If needed, set `OPENEMBER_PROTOBUF_PYTHON=/path/to/python3`.

Common Debian/Ubuntu packages:

```bash
sudo apt install protobuf-compiler python3-protobuf
```

Protocol design and the Nanopb constraint policy are in [openember-msgs](./openember-msgs.md).

## Example: UART terminal

```bash
./build/bin/hal_uart_term -d /dev/ttyUSB0 -b 115200
```

If the serial port is not accessible, add your user to the `dialout` group and log in again.

More detail: upstream [build instructions](https://github.com/openember/emberlite/blob/main/docs/build.md).
