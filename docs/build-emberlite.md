---
sidebar_position: 4
---

# 构建 EmberLite

EmberLite 使用 **CMake**（建议 ≥ 3.16），并可选与 OpenEmber 一致的 **Kconfig → `build/.config` → `build/config.cmake`** 流程管理功能开关。

## 依赖

- Linux（POSIX）  
- CMake ≥ 3.16  
- GCC 或 Clang（支持 C11）

## 推荐：`ember` 一键构建

在 **EmberLite 仓库根目录**：

```bash
chmod +x ./scripts/ember   # 仅需一次
./scripts/ember build
```

行为概要：

- 若不存在 **`build/.config`**，会以非交互方式生成默认配置。  
- 根据 `.config` 生成 **`build/config.cmake`**，再执行 `cmake -S . -B build` 与 `cmake --build`。  
- 首次 `menuconfig` 可能下载 **kconfig-frontends-nox** 到 **`.kconfig-frontends/`**（需 `curl`、`dpkg-deb` 等；该目录已 `.gitignore`）。

常用子命令：

| 命令 | 说明 |
|------|------|
| `./scripts/ember menuconfig [build_dir]` | 交互式菜单，写入 `.config` 并刷新 `config.cmake` |
| `./scripts/ember genconfig [build_dir]` | 仅根据 `.config` 重写 `config.cmake` |
| `./scripts/ember update [build_dir]` | `cmake -S . -B <dir>` |
| `./scripts/ember clean [build_dir]` | 删除构建目录 |

## 纯 CMake（无 Kconfig）

```bash
mkdir -p build
cmake -S . -B build
cmake --build build -j
```

产物：

- 可执行文件：`build/bin/`  
- 库：`build/lib/`  

## 示例：串口终端

```bash
./build/bin/hal_uart_term -d /dev/ttyUSB0 -b 115200
```

若串口无权限，可将用户加入 `dialout` 组后重新登录。

更多说明见上游 [构建说明](https://github.com/openember/emberlite/blob/main/docs/build.md)。
