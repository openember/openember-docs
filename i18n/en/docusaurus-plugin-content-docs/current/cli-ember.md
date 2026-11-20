---
sidebar_position: 5
---

# ember CLI

OpenEmber ships `scripts/ember`. The standalone **openember-cli** repository also provides `ember`. Capabilities depend on the version; prefer the copy bundled with the framework for product creation and model workflows. The framework root provides `scripts/kconfig/`. A standalone product reaches those scripts through the `openember/` dependency and does not need its own copy of the toolchain.

The full flow for creating, building, and extending a product is in [Create your first product](./product-quickstart.md).

## From the project root

```bash
/path/to/<project>/scripts/ember build
```

From a standalone product root, use `./openember/scripts/ember build --product <model>`. Run `./openember/scripts/ember install` to link that version onto `PATH`. Install updates the user command link and Bash completion.

Both OpenEmber and EmberLite ship `scripts/ember`; supported options depend on the version in use.

## Product project commands

These are the current entry points of the CLI bundled with OpenEmber. Use `./scripts/ember` from the framework root and `./openember/scripts/ember` from a product root.

| Command | Role |
|---------|------|
| `new <name> --model <model>` | Create a standalone product project, symlinked to the framework sources by default |
| `new <name> --no-symlink` | Create the project and leave the framework dependency for the user to add, for example as a submodule |
| `menuconfig --product <model>` | Select a model and edit its configuration |
| `genconfig --product <model>` | Generate or refresh the model configuration non-interactively |
| `update --product <model>` | Resolve the configuration and refresh CMake without fetching Git sources |
| `savedefconfig --product <model>` | Save the working config's delta against the shared baseline into the model default file |
| `build --product <model> -j 4` | Build into `build/<model>/` |
| `run --product <model> --dry-run` | Print the launch command without starting processes |
| `run --product <model>` | Start the model configuration through launch_manager |
| `defconfig --product <model>` | Reset the model working config and back up `.config.pre-defconfig` |

`new` also accepts `--path DIR` and `--openember PATH`; `ember help` and `ember new --help` are authoritative. `--product` is a model name, not a product repository path. Rebuild after changing configuration. Later commands reuse the selected model when `--product` is omitted.

## Saving configuration: menu Save, savedefconfig, and defconfig

Menu **Save** writes the full working configuration. If you keep the default filename and exit normally, the config is written to `build/<model>/.config` and later builds use that file. Choosing another filename exports a full copy. The temporary path shown at the top of the menu belongs to the editing session; on a normal exit the tool writes the real file.

`ember savedefconfig --product DEMO_A` saves that model's existing working config as a delta against the project's shared baseline, into `products/DEMO_A/product.defconfig`, so it can be versioned. `ember defconfig --product DEMO_A` resets in the other direction: it regenerates the working config from the shared baseline and the model defaults, and backs up the previous file as `.config.pre-defconfig`.

`savedefconfig` requires the model default file and the working config to already exist. It cannot create an unknown model. Saving to another filename from the menu does not register a model or change the model id. Adding a model, and the full save flow, are covered in [Saving and restoring model build configs](./configuration#saving-and-restoring-model-build-configs).

## Environment variables

| Variable | Meaning |
|----------|---------|
| `OPENEMBER_ROOT` | Force the project root (highest priority) |
| `OPENEMBER_BUILD_DIR` | Default build directory name (default `build`) |
| `OPENEMBER_CMAKE_LOCAL` | Local CMake initial cache; defaults to `.ember-local.cmake` at the project root and holds SDK and toolchain paths |
| `OPENEMBER_JOBS` | Parallel build jobs; defaults to half the available logical CPUs, rounded down, minimum 1 and maximum 8; overridden by `-j` / `--jobs` |
| `CARGO_BUILD_JOBS` | Cargo-specific job count; follows the selected build jobs unless explicitly overridden |
| `OPENEMBER_KCONFIG_NONINTERACTIVE=1` | Generate a default `.config` from menuconfig non-interactively |
| `OPENEMBER_KCONFIG_FRONTENDS_DIR` | Override the kconfig-frontends unpack directory |

## Parallel build jobs {#parallel-build-jobs}

`ember build` and `ember all` use a conservative default:

```text
jobs = min(8, max(1, floor(available logical CPUs / 2)))
```

For example, 4, 8, and 32 available logical CPUs default to 2, 4, and 8 jobs. Precedence is **command-line `-j` / `--jobs` > `OPENEMBER_JOBS` > automatic default**.

```bash
ember build                     # Automatic job count
ember build -j 4                 # Use 4 jobs
ember build -j4                  # Equivalent syntax
ember all --jobs 4               # Also supported by all
ember build out/build --jobs=4   # Combine with a build directory
OPENEMBER_JOBS=4 ember build     # Environment override
```

An explicit value may exceed the automatic cap of 8. The job count must be a positive integer. Zero, a negative number, a non-integer, or a missing option value is rejected before configure or build. A bare `-j` does not mean unlimited parallelism.

The CLI passes the selected count to CMake and exports `CMAKE_BUILD_PARALLEL_LEVEL` so nested CMake builds inherit it. `CARGO_BUILD_JOBS`, used by Rust dependencies such as Zenoh, follows the selected count by default, but an explicit Cargo-specific value is respected:

```bash
CARGO_BUILD_JOBS=2 ember build -j 4
```

The effective counts are printed when the build starts, for example:

```text
[ember] build jobs=4 (command-line); cargo jobs=2
```

These are per-tool job limits, **not a hard quota on total threads or CPU usage across the process tree**. Parallelism is a development-machine setting. It is not written into Kconfig or a product `defconfig`.

:::note Version scope

This policy applies to the updated CLI bundled with OpenEmber and the updated standalone `openember-cli`. Older scripts may still default to `nproc` and may not support `-j` / `--jobs`. Check `ember help` for the entry point you are using, and update it if needed. Whether EmberLite's bundled script supports these options also depends on its version.

:::

## Environment registry (`ember add` / `use` / `list`)

When you are outside a project directory, register an environment first:

```bash
ember add emberlite /path/to/emberlite
ember add openember /path/to/openember
ember use emberlite
ember list
```

Registration data defaults to `~/.openember/ember/`.

## Commands (summary)

| Command | Role |
|---------|------|
| `menuconfig [build_dir]` | Interactive Kconfig; writes `.config` and runs genconfig |
| `genconfig [build_dir]` | `.config` → `config.cmake` |
| `update` / `configure` | `cmake -S . -B <build_dir>` |
| `build [build_dir] [-j N]` | Completes configuration when needed, then builds; also accepts `--jobs N` |
| `all [build_dir] [-j N]` | menuconfig + update + build; also accepts `--jobs N` |
| `clean [build_dir]` | Remove the build directory |
| `completion bash` | Print the Bash completion script |
| `install` / `uninstall` | Link `ember` onto `PATH` (default `~/.local/bin`) |

Full manual: [openember-cli README](https://github.com/openember/openember-cli/blob/main/README.md).
