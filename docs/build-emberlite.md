---
sidebar_position: 4
---

# 构建 EmberLite

EmberLite 使用 **CMake**（建议 ≥ 3.16），并可选与 OpenEmber 一致的 **Kconfig → `build/.config` → `build/config.cmake`** 流程管理功能开关。

## 依赖

- Linux（POSIX）  
- CMake ≥ 3.16  
- GCC 或 Clang（支持 C11）
- `protoc`、Nanopb、Python protobuf（默认启用 `openember-msgs`；关闭消息协议后可省略）

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

## 消息协议依赖

EmberLite 默认启用 `OPENEMBER_ENABLE_MSGS=ON`，Kconfig 中该配置位于顶层 `Protocol / Messages` 菜单。启用后会与 OpenEmber 共用 `openember-msgs` 消息定义，并生成 Nanopb C 绑定：

```bash
cmake -S . -B build -DOPENEMBER_ENABLE_MSGS=ON
cmake --build build --target emberlite_msgs -j
```

生成产物位于构建目录的 `generated/openember/msgs/` 下，包含 `*.pb.h` 和 `*.pb.c`。这些 `*.pb.c` 会被编译为 `emberlite_msgs` 静态库，供 EmberLite runtime、通信适配层或示例节点链接使用。

推荐本地开发目录结构：

```text
Projects/OpenEmber/
├── emberlite/
└── openember-msgs/
```

如果 `openember-msgs` 不在同级目录，可以显式指定：

```bash
cmake -S . -B build \
  -DOPENEMBER_ENABLE_MSGS=ON \
  -DOPENEMBER_MSGS_SOURCE=LOCAL \
  -DOPENEMBER_MSGS_LOCAL_SOURCE=/path/to/openember-msgs
```

默认配置为 `OPENEMBER_MSGS_SOURCE=FETCH`，会在配置阶段拉取 `openember-msgs` 的 `latest`（当前映射为 `main` 分支）archive。工程不会自动使用相邻的 `../openember-msgs`，除非显式选择 `LOCAL`。

若当前构建暂时不需要消息协议绑定，可以关闭：

```bash
cmake -S . -B build -DOPENEMBER_ENABLE_MSGS=OFF
```

启用后构建环境需要：

- `protoc` 在 `PATH` 中可用。
- Nanopb 源码，可由 third-party 缓存获取，也可通过 `OPENEMBER_NANOPB_LOCAL_SOURCE=/path/to/nanopb` 指定。
- 一个能 `import google.protobuf` 的 Python。CMake 会自动尝试常见 `python3` 路径；必要时可设置 `OPENEMBER_PROTOBUF_PYTHON=/path/to/python3`。

常见 Debian/Ubuntu 依赖：

```bash
sudo apt install protobuf-compiler python3-protobuf
```

更多协议设计与 Nanopb 约束策略见 [openember-msgs 消息协议](./openember-msgs.md)。

## 示例：串口终端

```bash
./build/bin/hal_uart_term -d /dev/ttyUSB0 -b 115200
```

若串口无权限，可将用户加入 `dialout` 组后重新登录。

更多说明见上游 [构建说明](https://github.com/openember/emberlite/blob/main/docs/build.md)。
