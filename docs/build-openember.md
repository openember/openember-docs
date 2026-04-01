---
sidebar_position: 3
---

# 构建 OpenEmber

OpenEmber 使用 **Kconfig** 生成 `build/.config`，再经脚本生成 `build/config.cmake`，由 **CMake** 读取并完成编译。推荐在 Linux 上使用 GCC/G++，CMake 版本需满足仓库要求（当前最小版本以仓库 `CMakeLists.txt` 为准）。

## 前置条件

- Linux  
- CMake（参见主仓库声明）  
- 编译器与基础构建工具  
- 可选：`sudo apt install libssl-dev`（部分依赖需要）

:::tip

Kconfig 工具链使用 **kconfig-frontends**；工程脚本可自动下载 **kconfig-frontends-nox** 到仓库本地目录（如 `.kconfig-frontends/`），无需 root 安装。

:::

## 推荐流程（脚本 + ember）

在 **openember 仓库根目录**：

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

说明：

- 顶层 `CMakeLists.txt` 会 `include` 构建目录下的 `config.cmake`（若存在），以 Kconfig 为主驱动选项。

### 使用 Makefile 包装

```bash
make menuconfig   # 退出后通常会执行 genconfig
make genconfig
make update
make build
# 或：make all
```

### 使用 ember（推荐）

```bash
./scripts/ember menuconfig
./scripts/ember genconfig
./scripts/ember update    # 等价于 cmake -S . -B build
./scripts/ember build
```

`./scripts/ember build` 会在缺少 `.config` / `config.cmake` 时尽量自动补齐默认配置与 `genconfig`，再执行配置与编译。

## 产物位置

构建成功后，可执行文件通常位于 **`build/bin/`**（具体目标取决于 Kconfig 中启用的模块与示例）。

## 常见问题

- **Missing `build/.config`**：先运行 `menuconfig.sh` 或 `OPENEMBER_KCONFIG_NONINTERACTIVE=1` 生成默认配置。  
- **权限**：若运行脚本报权限问题，请用 `bash scripts/...` 显式调用。  

更多选项与 Kconfig 项说明见上游 [构建文档](https://github.com/openember/openember/blob/main/docs/build.md)。
