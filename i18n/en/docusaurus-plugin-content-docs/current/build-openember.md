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
| `./scripts/ember build [build_dir] [-j N]` | Bootstrap config if needed, then full build; also accepts `--jobs N` |
| `./scripts/ember all [build_dir] [-j N]` | menuconfig + update + build; also accepts `--jobs N` |
| `./scripts/ember clean [build_dir]` | Remove the build directory |

### Parallel build jobs

`build` / `all` default to **half the available logical CPUs, rounded down, with
a minimum of 1 and a maximum of 8 jobs**. For example, 32 logical CPUs default to
8 jobs. Precedence is **`-j` / `--jobs` > `OPENEMBER_JOBS` > automatic default**:

```bash
./scripts/ember build -j 4
./scripts/ember all --jobs=4
OPENEMBER_JOBS=4 ./scripts/ember build
# Lower Rust/Cargo parallelism separately if needed
CARGO_BUILD_JOBS=2 ./scripts/ember build -j 4
```

Cargo follows the selected count unless `CARGO_BUILD_JOBS` is explicitly set.
Nested CMake builds inherit `CMAKE_BUILD_PARALLEL_LEVEL`. Explicit counts may exceed
the default cap of 8, but must be positive integers; zero, negative numbers, and
non-integers are rejected before building.

These are per-tool job limits, not a process-tree-wide CPU quota or a product
Kconfig setting. See [CLI parallel build jobs](./cli-ember.md#parallel-build-jobs)
for all option forms, log examples, and older CLI behavior.

See [ember CLI](./cli-ember.md) for install, env management (`ember add` / `use`), and the full command set.

The top-level `CMakeLists.txt` includes `config.cmake` from the build directory when present.

## Scripts + CMake (manual)

```bash
bash scripts/kconfig/menuconfig.sh build
# CI / no TTY:
# OPENEMBER_KCONFIG_NONINTERACTIVE=1 bash scripts/kconfig/menuconfig.sh build

bash scripts/kconfig/genconfig.sh build

export CMAKE_BUILD_PARALLEL_LEVEL=4
export CARGO_BUILD_JOBS=4
cmake -S . -B build
cmake --build build -j 4
```

Manual CMake commands do not automatically apply the `ember` parallelism policy;
the example above explicitly selects 4 jobs.

### Makefile helpers

```bash
make menuconfig
make genconfig
make update
CARGO_BUILD_JOBS=4 make build JOBS=4
# or: CARGO_BUILD_JOBS=4 make all JOBS=4
```

The Makefile's `JOBS` setting is independent of `ember`; setting `OPENEMBER_JOBS`
alone does not change the job count for `make build`.

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

More detail: [openember-msgs](./openember-msgs).

## Outputs

Binaries usually land under **`build/bin/`** depending on enabled modules and examples.

With `OPENEMBER_APP_TURTLE_DEMO` enabled you get the host turtlesim binaries `openember_turtle_sim` / `openember_turtle_teleop` (GUI needs `libsdl2-dev`). See [Turtle Demo](./turtle-demo.md).

## Troubleshooting

- **Missing `build/.config`**: run `./scripts/ember menuconfig`, `menuconfig.sh`, or non-interactive generation first.  
- **OOM / terminal dies during build**: even the updated CLI's default cap of 8 jobs may exceed available memory; retry with `./scripts/ember build -j 2`. Also lower `CARGO_BUILD_JOBS` if you set it separately. For manual CMake/Makefile builds, adjust `-j` / `JOBS` respectively.
- **Script permission issues**: invoke with `bash scripts/...`; **do not build as root/`sudo`**.  
- **`Permission denied` on `build/bin/...`**: check for empty files, missing execute bits (`ls -l`), and whether `build/` is owned by root.

More detail: upstream [build.md](https://github.com/openember/openember/blob/main/docs/build.md).
