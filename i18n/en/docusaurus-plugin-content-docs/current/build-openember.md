---
sidebar_position: 3
---

# Build OpenEmber

OpenEmber uses **Kconfig** to produce `build/.config`. Scripts then generate `build/config.cmake`, which **CMake** reads to drive the build. Linux with GCC/G++ is recommended. The minimum CMake version is whatever the repository `CMakeLists.txt` currently requires.

This page covers building the framework repository. Creating a standalone product, `build/<model>/` outputs, and the run flow are in [Create your first product](./product-quickstart.md).

Kconfig selects build capabilities. Device parameters that change often during debugging live in YAML. Boundaries and how to read them are in [Build configuration and runtime parameters](./configuration).

## Prerequisites

- Linux
- CMake (see the main repository)
- A compiler and basic build tools
- `protoc` and the Protobuf C++ development libraries (`openember-msgs` is enabled by default)
- Optional: `sudo apt install libssl-dev` (required by some dependencies)

:::tip

The Kconfig toolchain uses **kconfig-frontends**. Project scripts can download **kconfig-frontends-nox** into a local directory (for example `.kconfig-frontends/`) without a root install.

:::

## Recommended: one-shot `ember` build

From the **openember repository root**:

```bash
chmod +x ./scripts/ember   # once
./scripts/ember build
```

If `ember` is already on `PATH` via [openember-cli](./cli-ember.md), you can also run this from the project root:

```bash
ember build
```

What it does:

- If **`build/.config`** is missing, generates a default config non-interactively and writes **`build/config.cmake`**.
- Then runs `cmake -S . -B build` and `cmake --build`.
- The first menuconfig may download **kconfig-frontends-nox** into **`.kconfig-frontends/`** (needs `curl`, `dpkg-deb`, and similar tools; that directory is usually gitignored).

Common subcommands:

| Command | Description |
|---------|-------------|
| `./scripts/ember menuconfig [build_dir]` | Interactive menu; writes `.config` and refreshes `config.cmake` |
| `./scripts/ember genconfig [build_dir]` | Rewrite `config.cmake` from `.config` only |
| `./scripts/ember update [build_dir]` | `cmake -S . -B <dir>` (alias: `configure`) |
| `./scripts/ember build [build_dir] [-j N]` | Completes configuration when needed, then builds; also accepts `--jobs N` |
| `./scripts/ember all [build_dir] [-j N]` | menuconfig + update + build; also accepts `--jobs N` |
| `./scripts/ember clean [build_dir]` | Remove the build directory |

### Parallel build jobs

`build` / `all` default to **half the available logical CPUs, rounded down, with a minimum of 1 and a maximum of 8 jobs**. For example, 32 logical CPUs default to 8 jobs. Precedence is **`-j` / `--jobs` > `OPENEMBER_JOBS` > automatic default**:

```bash
./scripts/ember build -j 4
./scripts/ember all --jobs=4
OPENEMBER_JOBS=4 ./scripts/ember build
# Lower Rust/Cargo parallelism separately if needed
CARGO_BUILD_JOBS=2 ./scripts/ember build -j 4
```

Cargo follows the selected job count by default. An explicit `CARGO_BUILD_JOBS` takes precedence. Nested CMake builds inherit `CMAKE_BUILD_PARALLEL_LEVEL`. An explicit count may exceed the default cap of 8, but it must be a positive integer. Zero, negative numbers, and non-integers are rejected before the build starts.

This is the job parallelism of the build tools, not a process-tree CPU quota, and it is not a product Kconfig option. Option forms, log examples, and older CLI behavior are in [CLI parallel build jobs](./cli-ember.md#parallel-build-jobs).

Install options, environment management (`ember add` / `use`), and the full command set are in [ember CLI](./cli-ember.md).

The top-level `CMakeLists.txt` `include`s `config.cmake` from the build directory when that file exists, so Kconfig remains the primary source of options.

## Scripts + CMake (manual)

Without `ember`, call the repository scripts directly:

```bash
# 1) Interactive menu config (writes build/.config)
bash scripts/kconfig/menuconfig.sh build

# No TTY / CI, use the default config:
# OPENEMBER_KCONFIG_NONINTERACTIVE=1 bash scripts/kconfig/menuconfig.sh build

# 2) Generate build/config.cmake from .config
bash scripts/kconfig/genconfig.sh build

# 3) CMake configure and build
export CMAKE_BUILD_PARALLEL_LEVEL=4
export CARGO_BUILD_JOBS=4
cmake -S . -B build
cmake --build build -j 4
```

A manual CMake invocation does not apply the `ember` parallelism policy. The example above explicitly limits the build to 4 jobs.

### Makefile wrapper

```bash
make menuconfig   # usually runs genconfig after you exit
make genconfig
make update
CARGO_BUILD_JOBS=4 make build JOBS=4
# or: CARGO_BUILD_JOBS=4 make all JOBS=4
```

The Makefile `JOBS` variable is independent of `ember`'s job selection. Setting `OPENEMBER_JOBS` alone does not change the job count for `make build`.

## Message protocol dependency

OpenEmber enables `OPENEMBER_ENABLE_MSGS=ON` by default. The build generates and links the C++ Protobuf bindings from `openember-msgs`. In Kconfig this option lives under the top-level `Communication / Messages` menu.

Generated sources land under `generated/openember/msgs/` in the build directory, as `*.pb.h` and `*.pb.cc`. Those `*.pb.cc` files are compiled into the `openember_msgs_cpp` static library and linked into OpenEmber through the `openember::msgs_cpp` target.

Suggested local layout:

```text
Projects/OpenEmber/
├── openember/
└── openember-msgs/
```

If `openember-msgs` is not a sibling directory, point at it explicitly:

```bash
cmake -S . -B build \
  -DOPENEMBER_MSGS_SOURCE=LOCAL \
  -DOPENEMBER_MSGS_LOCAL_SOURCE=/path/to/openember-msgs
```

The default is `OPENEMBER_MSGS_SOURCE=FETCH`. Configure then downloads a `latest` archive of `openember-msgs` (currently mapped to the `main` branch). The build does not automatically use a neighboring `../openember-msgs` unless you select `LOCAL`.

If this build does not need protocol bindings yet, turn them off:

```bash
cmake -S . -B build -DOPENEMBER_ENABLE_MSGS=OFF
```

Common Debian/Ubuntu packages:

```bash
sudo apt install protobuf-compiler libprotobuf-dev
```

Protocol design and how OpenEmber and EmberLite share it are in [openember-msgs](./openember-msgs.md).

## Outputs

After a successful build, executables are usually under **`build/bin/`**. The exact targets depend on the modules and examples enabled in Kconfig.

With `OPENEMBER_APP_TURTLE_DEMO` enabled you get the host turtlesim binaries `openember_turtle_sim` and `openember_turtle_teleop` (the GUI needs `libsdl2-dev`). How to run them is in [Turtle Demo](./turtle-demo.md).

## Troubleshooting

- **Missing `build/.config`**: run `./scripts/ember menuconfig` or `menuconfig.sh` first, or generate the default config with `OPENEMBER_KCONFIG_NONINTERACTIVE=1`.
- **Build runs out of memory or the terminal exits unexpectedly**: even the updated CLI's default cap of 8 jobs can exceed available memory. Retry with `./scripts/ember build -j 2`. If you set `CARGO_BUILD_JOBS` separately, lower that too. For a manual CMake or Makefile build, adjust `-j` or `JOBS` respectively.
- **Permissions**: if a script fails with a permission error, invoke it explicitly with `bash scripts/...`. **Do not build as root or with `sudo`**. Otherwise files under `build/` end up owned by root and may lose their execute bits.
- **`Permission denied` when running `build/bin/...`**: check whether the file is empty, whether the execute bit is missing (`ls -l`), and whether `build/` is owned by root.

More options and Kconfig symbols: upstream [build.md](https://github.com/openember/openember/blob/main/docs/build.md).
