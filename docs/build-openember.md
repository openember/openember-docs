---
sidebar_position: 3
---

# 构建 OpenEmber

OpenEmber 使用 **Kconfig** 生成 `build/.config`，再经脚本生成 `build/config.cmake`，由 **CMake** 读取并完成编译。推荐在 Linux 上使用 GCC/G++，CMake 版本需满足仓库要求（当前最小版本以仓库 `CMakeLists.txt` 为准）。

## 前置条件

- Linux  
- CMake（参见主仓库声明）  
- 编译器与基础构建工具  
- `protoc` 与 Protobuf C++ 开发库（默认启用 `openember-msgs`）
- 可选：`sudo apt install libssl-dev`（部分依赖需要）

:::tip

Kconfig 工具链使用 **kconfig-frontends**；工程脚本可自动下载 **kconfig-frontends-nox** 到仓库本地目录（如 `.kconfig-frontends/`），无需 root 安装。

:::

## 推荐：`ember` 一键构建

在 **openember 仓库根目录**：

```bash
chmod +x ./scripts/ember   # 仅需一次
./scripts/ember build
```

若已通过 [openember-cli](./cli-ember.md) 将 `ember` 安装到 PATH，也可在工程根目录直接执行：

```bash
ember build
```

行为概要：

- 若不存在 **`build/.config`**，会以非交互方式生成默认配置，并生成 **`build/config.cmake`**。  
- 再执行 `cmake -S . -B build` 与 `cmake --build`。  
- 首次涉及 menuconfig 时，可能下载 **kconfig-frontends-nox** 到 **`.kconfig-frontends/`**（需 `curl`、`dpkg-deb` 等；该目录通常已 `.gitignore`）。

常用子命令：

| 命令 | 说明 |
|------|------|
| `./scripts/ember menuconfig [build_dir]` | 交互式菜单，写入 `.config` 并刷新 `config.cmake` |
| `./scripts/ember genconfig [build_dir]` | 仅根据 `.config` 重写 `config.cmake` |
| `./scripts/ember update [build_dir]` | `cmake -S . -B <dir>`（别名：`configure`） |
| `./scripts/ember build [build_dir]` | 必要时补齐配置后完整编译 |
| `./scripts/ember all [build_dir]` | menuconfig + update + build |
| `./scripts/ember clean [build_dir]` | 删除构建目录 |

并行任务数由环境变量 **`OPENEMBER_JOBS`** 控制，**默认等于 `nproc`（本机逻辑 CPU 数）**。机器核数较多、链接体积较大时，建议显式降低并行度，例如：

```bash
OPENEMBER_JOBS=4 ./scripts/ember build
```

更多安装方式、环境管理（`ember add` / `use`）与完整子命令说明见 [ember CLI 命令行工具](./cli-ember.md)。

说明：顶层 `CMakeLists.txt` 会 `include` 构建目录下的 `config.cmake`（若存在），以 Kconfig 为主驱动选项。

## 脚本 + CMake（手动）

不使用 `ember` 时，可逐步调用仓库脚本：

```bash
# 1) 交互式菜单配置（生成 build/.config）
bash scripts/kconfig/menuconfig.sh build

# 无 TTY / CI 可用默认配置：
# OPENEMBER_KCONFIG_NONINTERACTIVE=1 bash scripts/kconfig/menuconfig.sh build

# 2) 由 .config 生成 build/config.cmake
bash scripts/kconfig/genconfig.sh build

# 3) CMake 配置与编译
cmake -S . -B build
cmake --build build -j"$(nproc)"
```

### 使用 Makefile 包装

```bash
make menuconfig   # 退出后通常会执行 genconfig
make genconfig
make update
make build
# 或：make all
```

## 消息协议依赖

OpenEmber 默认启用 `OPENEMBER_ENABLE_MSGS=ON`，构建时会生成并链接 `openember-msgs` 的 C++ Protobuf 绑定。Kconfig 中该配置位于顶层 `Communication / Messages` 菜单。

生成产物位于构建目录的 `generated/openember/msgs/` 下，包含 `*.pb.h` 和 `*.pb.cc`。这些 `*.pb.cc` 会被编译为 `openember_msgs_cpp` 静态库，并通过 `openember::msgs_cpp` target 链接到 OpenEmber 中。

推荐本地开发目录结构：

```text
Projects/OpenEmber/
├── openember/
└── openember-msgs/
```

如果 `openember-msgs` 不在同级目录，可以显式指定：

```bash
cmake -S . -B build \
  -DOPENEMBER_MSGS_SOURCE=LOCAL \
  -DOPENEMBER_MSGS_LOCAL_SOURCE=/path/to/openember-msgs
```

默认配置为 `OPENEMBER_MSGS_SOURCE=FETCH`，会在配置阶段拉取 `openember-msgs` 的 `latest`（当前映射为 `main` 分支）archive。工程不会自动使用相邻的 `../openember-msgs`，除非显式选择 `LOCAL`。

若当前构建暂时不需要协议绑定，可以关闭：

```bash
cmake -S . -B build -DOPENEMBER_ENABLE_MSGS=OFF
```

常见 Debian/Ubuntu 依赖：

```bash
sudo apt install protobuf-compiler libprotobuf-dev
```

更多协议设计与 OpenEmber / EmberLite 共用方式见 [openember-msgs 消息协议](./openember-msgs.md)。

## 产物位置

构建成功后，可执行文件通常位于 **`build/bin/`**（具体目标取决于 Kconfig 中启用的模块与示例）。

## 常见问题

- **Missing `build/.config`**：先运行 `./scripts/ember menuconfig`、`menuconfig.sh`，或使用 `OPENEMBER_KCONFIG_NONINTERACTIVE=1` 生成默认配置。  
- **编译时内存吃紧 / 终端异常退出**：默认 `-j$(nproc)` 并行度可能过高；请设置更小的 `OPENEMBER_JOBS` 后重试。  
- **权限**：若运行脚本报权限问题，请用 `bash scripts/...` 显式调用；**不要用 root/`sudo` 编译**，否则 `build/` 产物属主异常、可执行位可能丢失。  
- **`Permission denied` 运行 `build/bin/...`**：检查文件是否为空、是否缺少可执行位（`ls -l`），以及 `build/` 是否被 root 拥有。

更多选项与 Kconfig 项说明见上游 [构建文档](https://github.com/openember/openember/blob/main/docs/build.md)。
