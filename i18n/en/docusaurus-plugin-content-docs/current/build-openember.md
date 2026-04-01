---
sidebar_position: 3
---

# Build OpenEmber

OpenEmber uses **Kconfig** to produce `build/.config`, then scripts generate **`build/config.cmake`** for **CMake**. Linux with **GCC/G++** is recommended; check the repo’s `CMakeLists.txt` for the minimum CMake version.

## Prerequisites

- Linux  
- CMake (see main repo)  
- A toolchain and basic build tools  
- Optional: `sudo apt install libssl-dev` for some dependencies  

**kconfig-frontends** can be downloaded automatically (e.g. **kconfig-frontends-nox** under `.kconfig-frontends/`) without root.

## Recommended flow

From the **openember repository root**:

```bash
bash scripts/kconfig/menuconfig.sh build
# CI / no TTY:
# OPENEMBER_KCONFIG_NONINTERACTIVE=1 bash scripts/kconfig/menuconfig.sh build

bash scripts/kconfig/genconfig.sh build

cmake -S . -B build
cmake --build build -j"$(nproc)"
```

The top-level `CMakeLists.txt` includes `config.cmake` from the build directory when present.

### Makefile helpers

```bash
make menuconfig
make genconfig
make update
make build
# or: make all
```

### Using `ember`

```bash
./scripts/ember menuconfig
./scripts/ember genconfig
./scripts/ember update
./scripts/ember build
```

`./scripts/ember build` can bootstrap default `.config` / `config.cmake` when missing, then configure and compile.

## Outputs

Binaries usually land under **`build/bin/`** depending on enabled modules and examples.

## Troubleshooting

- **Missing `build/.config`**: run `menuconfig.sh` or non-interactive generation first.  
- **Script permission issues**: invoke with `bash scripts/...` explicitly.  

More detail: upstream [build.md](https://github.com/openember/openember/blob/main/docs/build.md).
