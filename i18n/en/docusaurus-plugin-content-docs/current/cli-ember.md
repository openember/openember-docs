---
sidebar_position: 5
---

# ember CLI tool

The `ember` command comes from **openember-cli**. It orchestrates **Kconfig** and **CMake** only; each target project must ship `CMakeLists.txt` and `scripts/kconfig/menuconfig.sh` / `genconfig.sh` at the expected paths.

## From the project root

```bash
/path/to/<project>/scripts/ember build
```

Both OpenEmber and EmberLite ship `scripts/ember`; supported options depend on the version in use.

## Environment variables

| Variable | Meaning |
|----------|---------|
| `OPENEMBER_ROOT` | Force project root (highest priority) |
| `OPENEMBER_BUILD_DIR` | Default build directory name (`build`) |
| `OPENEMBER_JOBS` | Parallel build jobs; defaults to half the available logical CPUs, rounded down, minimum 1 / maximum 8; overridden by `-j` / `--jobs` |
| `CARGO_BUILD_JOBS` | Cargo-specific job count; follows the selected build jobs unless explicitly overridden |
| `OPENEMBER_KCONFIG_NONINTERACTIVE=1` | Non-interactive default `.config` |
| `OPENEMBER_KCONFIG_FRONTENDS_DIR` | Override kconfig-frontends location |

## Parallel build jobs {#parallel-build-jobs}

`ember build` and `ember all` use a conservative default:

```text
jobs = min(8, max(1, floor(available logical CPUs / 2)))
```

For example, 4, 8, and 32 available logical CPUs default to 2, 4, and 8 jobs.
Precedence is **command-line `-j` / `--jobs` > `OPENEMBER_JOBS` > automatic default**.

```bash
ember build                     # Automatic job count
ember build -j 4                 # Use 4 jobs
ember build -j4                  # Equivalent syntax
ember all --jobs 4               # Also supported by all
ember build out/build --jobs=4   # Combine with a build directory
OPENEMBER_JOBS=4 ember build     # Environment override
```

Explicit values may exceed the automatic default's cap of 8. Job counts must be
positive integers; zero, negative numbers, non-integers, and missing option values
are rejected before configure/build. A bare `-j` does not mean unlimited parallelism.

The CLI passes the selected count to CMake and exports `CMAKE_BUILD_PARALLEL_LEVEL`
for nested CMake builds. `CARGO_BUILD_JOBS`, used by Rust dependencies such as Zenoh,
defaults to the same value, but an explicit Cargo-specific override is respected:

```bash
CARGO_BUILD_JOBS=2 ember build -j 4
```

The effective counts are printed when the build starts, for example:

```text
[ember] build jobs=4 (command-line); cargo jobs=2
```

These are per-tool job limits, **not a hard limit on CPU usage or total threads
across the process tree**. Parallelism is a development-machine setting, not a
Kconfig or product `defconfig` option.

:::note Version scope

This policy applies to the updated CLI bundled with OpenEmber and the updated
standalone `openember-cli`. Older scripts may still default to `nproc` and lack
`-j` / `--jobs`; check `ember help` for the entry point you are using and update it
if needed. Support in EmberLite's bundled script also depends on its version.

:::

## Environment registry (`ember add` / `use` / `list`)

```bash
ember add emberlite /path/to/emberlite
ember add openember /path/to/openember
ember use emberlite
ember list
```

Data defaults to `~/.openember/ember/`.

## Commands (summary)

| Command | Role |
|---------|------|
| `menuconfig [build_dir]` | Interactive Kconfig; writes `.config` and runs genconfig |
| `genconfig [build_dir]` | `.config` → `config.cmake` |
| `update` / `configure` | `cmake -S . -B <build_dir>` |
| `build [build_dir] [-j N]` | Full pipeline when needed; also accepts `--jobs N` |
| `all [build_dir] [-j N]` | menuconfig + update + build; also accepts `--jobs N` |
| `clean [build_dir]` | Remove build tree |
| `completion bash` | Print Bash completion |
| `install` / `uninstall` | Symlink `ember` into PATH (`~/.local/bin` by default) |

Full manual: [openember-cli README](https://github.com/openember/openember-cli/blob/main/README.md).
