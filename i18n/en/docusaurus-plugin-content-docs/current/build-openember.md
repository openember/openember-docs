---
sidebar_position: 3
---

# Build OpenEmber

OpenEmber uses **Kconfig** to produce `build/.config`, then scripts generate **`build/config.cmake`** for **CMake**. Linux with **GCC/G++** is recommended; check the repo’s `CMakeLists.txt` for the minimum CMake version.

## Prerequisites

- Linux  
- CMake (see main repo)  
- A toolchain and basic build tools  
- `protoc` and Protobuf C++ development libraries (default: `openember-msgs` enabled)  
- Optional: `sudo apt install libssl-dev` for some dependencies  

**kconfig-frontends** can be downloaded automatically (e.g. **kconfig-frontends-nox** under `.kconfig-frontends/`) without root.

## Recommended: `ember` one-shot build

From the **openember repository root**:

```bash
chmod +x ./scripts/ember   # once
./scripts/ember build
```

If `ember` is on your `PATH` via [openember-cli](./cli-ember.md):

```bash
ember build
```

What it does:

- If **`build/.config`** is missing, generates a default config non-interactively and writes **`build/config.cmake`**.  
- Then runs `cmake -S . -B build` and `cmake --build`.  
- The first menuconfig may download **kconfig-frontends-nox** into **`.kconfig-frontends/`**.

Common subcommands:

| Command | Description |
|---------|-------------|
| `./scripts/ember menuconfig [build_dir]` | Interactive Kconfig → `.config` + refresh `config.cmake` |
| `./scripts/ember genconfig [build_dir]` | Rewrite `config.cmake` from `.config` |
| `./scripts/ember update [build_dir]` | `cmake -S . -B <dir>` (alias: `configure`) |
| `./scripts/ember build [build_dir]` | Bootstrap config if needed, then full build |
| `./scripts/ember all [build_dir]` | menuconfig + update + build |
| `./scripts/ember clean [build_dir]` | Remove the build directory |

Parallelism is controlled by **`OPENEMBER_JOBS`** (default: **`nproc`**). On machines with many cores and large link steps, lower it:

```bash
OPENEMBER_JOBS=4 ./scripts/ember build
```

See [ember CLI](./cli-ember.md) for install, env management (`ember add` / `use`), and the full command set.

The top-level `CMakeLists.txt` includes `config.cmake` from the build directory when present.

## Scripts + CMake (manual)

```bash
bash scripts/kconfig/menuconfig.sh build
# CI / no TTY:
# OPENEMBER_KCONFIG_NONINTERACTIVE=1 bash scripts/kconfig/menuconfig.sh build

bash scripts/kconfig/genconfig.sh build

cmake -S . -B build
cmake --build build -j"$(nproc)"
```

### Makefile helpers

```bash
make menuconfig
make genconfig
make update
make build
# or: make all
```

## Message protocol dependency

OpenEmber enables `OPENEMBER_ENABLE_MSGS=ON` by default and builds/links C++ Protobuf bindings from `openember-msgs`. In Kconfig this lives under `Communication / Messages`.

Generated sources land under `generated/openember/msgs/` (`*.pb.h` / `*.pb.cc`), compiled into `openember_msgs_cpp` (`openember::msgs_cpp`).

Suggested layout:

```text
Projects/OpenEmber/
├── openember/
└── openember-msgs/
```

If `openember-msgs` is not a sibling checkout:

```bash
cmake -S . -B build \
  -DOPENEMBER_MSGS_SOURCE=LOCAL \
  -DOPENEMBER_MSGS_LOCAL_SOURCE=/path/to/openember-msgs
```

Default `OPENEMBER_MSGS_SOURCE=FETCH` pulls a `main` archive at configure time. Disable with `-DOPENEMBER_ENABLE_MSGS=OFF` when not needed.

Debian/Ubuntu:

```bash
sudo apt install protobuf-compiler libprotobuf-dev
```

More detail: [openember-msgs](./openember-msgs.md).

## Outputs

Binaries usually land under **`build/bin/`** depending on enabled modules and examples.

## Troubleshooting

- **Missing `build/.config`**: run `./scripts/ember menuconfig`, `menuconfig.sh`, or non-interactive generation first.  
- **OOM / terminal dies during build**: default `-j$(nproc)` may be too high; set a smaller `OPENEMBER_JOBS`.  
- **Script permission issues**: invoke with `bash scripts/...`; **do not build as root/`sudo`**.  
- **`Permission denied` on `build/bin/...`**: check for empty files, missing execute bits (`ls -l`), and whether `build/` is owned by root.

More detail: upstream [build.md](https://github.com/openember/openember/blob/main/docs/build.md).
