---
sidebar_position: 4
---

# Build EmberLite

EmberLite uses **CMake** (≥ 3.16 recommended) and optionally the same **Kconfig → `build/.config` → `build/config.cmake`** pipeline as OpenEmber.

## Requirements

- Linux (POSIX)  
- CMake ≥ 3.16  
- GCC or Clang with C11  

## Recommended: `ember` one-shot

From the **EmberLite repository root**:

```bash
chmod +x ./scripts/ember   # once
./scripts/ember build
```

Behavior:

- Creates a default non-interactive `.config` if **`build/.config`** is missing.  
- Generates **`build/config.cmake`**, then runs `cmake -S . -B build` and `cmake --build`.  
- First `menuconfig` may download **kconfig-frontends-nox** to **`.kconfig-frontends/`** (needs `curl`, `dpkg-deb`, etc.; directory is gitignored).

Common commands:

| Command | Purpose |
|---------|---------|
| `./scripts/ember menuconfig [build_dir]` | Interactive Kconfig → `.config` + `config.cmake` |
| `./scripts/ember genconfig [build_dir]` | Regenerate `config.cmake` only |
| `./scripts/ember update [build_dir]` | `cmake -S . -B <dir>` |
| `./scripts/ember clean [build_dir]` | Remove build directory |

## Plain CMake (no Kconfig)

```bash
mkdir -p build
cmake -S . -B build
cmake --build build -j
```

Artifacts: binaries in **`build/bin/`**, libraries in **`build/lib/`**.

## Example: UART terminal

```bash
./build/bin/hal_uart_term -d /dev/ttyUSB0 -b 115200
```

If serial access fails, add your user to the `dialout` group and re-login.

More: upstream [build instructions](https://github.com/openember/emberlite/blob/main/docs/build.md).
