---
sidebar_position: 5
---

# ember CLI

The `ember` command comes from **openember-cli**. It orchestrates **Kconfig** and **CMake** only; each target project must ship `CMakeLists.txt` and `scripts/kconfig/menuconfig.sh` / `genconfig.sh` at the expected paths.

## From the project root

```bash
/path/to/<project>/scripts/ember build
```

Both OpenEmber and EmberLite ship a compatible `scripts/ember`.

## Environment variables

| Variable | Meaning |
|----------|---------|
| `OPENEMBER_ROOT` | Force project root (highest priority) |
| `OPENEMBER_BUILD_DIR` | Default build directory name (`build`) |
| `OPENEMBER_JOBS` | Parallel build jobs |
| `OPENEMBER_KCONFIG_NONINTERACTIVE=1` | Non-interactive default `.config` |
| `OPENEMBER_KCONFIG_FRONTENDS_DIR` | Override kconfig-frontends location |

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
| `build [build_dir]` | Full pipeline when needed |
| `all` | menuconfig + update + build |
| `clean [build_dir]` | Remove build tree |
| `completion bash` | Print Bash completion |
| `install` / `uninstall` | Symlink `ember` into PATH (`~/.local/bin` by default) |

Full manual: [openember-cli README](https://github.com/openember/openember-cli/blob/main/README.md).
