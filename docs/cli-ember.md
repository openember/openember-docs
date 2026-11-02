---
sidebar_position: 5
---

# ember CLI 命令行工具

`ember` 来自 **openember-cli** 仓库，用于编排 **Kconfig** 与 **CMake**，本身不绑定某一业务工程；具体工程需在根目录提供 `CMakeLists.txt` 以及 `scripts/kconfig/menuconfig.sh`、`scripts/kconfig/genconfig.sh` 等约定入口。

## 在工程根目录使用

```bash
/path/to/<project>/scripts/ember build
```

OpenEmber 与 EmberLite 均提供 `scripts/ember` 脚本，具体选项取决于所用版本。

## 环境变量

| 变量 | 含义 |
|------|------|
| `OPENEMBER_ROOT` | 显式指定工程根目录（优先级最高） |
| `OPENEMBER_BUILD_DIR` | 默认构建目录名（默认 `build`） |
| `OPENEMBER_JOBS` | 并行编译任务数；默认取可用逻辑 CPU 数的一半，向下取整，至少 1、最多 8；可被 `-j` / `--jobs` 覆盖 |
| `CARGO_BUILD_JOBS` | Cargo 专用并行任务数；未设置时跟随所选构建并行度，也可单独覆盖 |
| `OPENEMBER_KCONFIG_NONINTERACTIVE=1` | menuconfig 以非交互方式生成默认 `.config` |
| `OPENEMBER_KCONFIG_FRONTENDS_DIR` | 覆盖 kconfig-frontends 解压目录 |

## 并行任务数 {#parallel-build-jobs}

`ember build` 与 `ember all` 默认采用保守并行度：

```text
jobs = min(8, max(1, floor(可用逻辑 CPU 数 / 2)))
```

例如，4、8、32 个可用逻辑 CPU 分别默认使用 2、4、8 个任务。选择优先级为
**命令行 `-j` / `--jobs` > `OPENEMBER_JOBS` > 自动默认值**。

```bash
ember build                     # 自动选择并行度
ember build -j 4                 # 指定 4 个任务
ember build -j4                  # 等价写法
ember all --jobs 4               # all 同样支持
ember build out/build --jobs=4   # 可与构建目录一起使用
OPENEMBER_JOBS=4 ember build     # 通过环境变量指定
```

显式设置可以超过自动默认值的上限 8。任务数必须是正整数；零、负数、非整数
或缺失的参数值会在配置/构建前报错，不能用裸 `-j` 表示无限并行。

CLI 会把所选值传递给 CMake，并导出 `CMAKE_BUILD_PARALLEL_LEVEL`，使嵌套的
CMake 构建也继承该值。Zenoh 等 Rust 依赖使用的 `CARGO_BUILD_JOBS` 默认跟随，
但尊重用户显式指定的 Cargo 专用值，例如：

```bash
CARGO_BUILD_JOBS=2 ember build -j 4
```

构建开始时会打印有效值，例如：

```text
[ember] build jobs=4 (command-line); cargo jobs=2
```

这些是各构建工具的并行任务限制，**不是整个进程树总线程数或 CPU 使用率的硬配额**。
并行度属于开发机器设置，不写入 Kconfig 或产品 `defconfig`。

:::note 版本范围

上述策略适用于已更新的 OpenEmber 内置 CLI 和独立 `openember-cli`。
旧版脚本可能仍默认使用 `nproc`，且不支持 `-j` / `--jobs`；先查看
`ember help` 确认实际入口，必要时更新。EmberLite 内置脚本是否支持这些选项，
也以其版本为准。

:::

## 环境管理（`ember add` / `use` / `list`）

在不在工程目录时，可先注册环境：

```bash
ember add emberlite /path/to/emberlite
ember add openember /path/to/openember
ember use emberlite
ember list
```

注册信息默认在 `~/.openember/ember/` 下。

## 常用子命令（摘要）

| 子命令 | 作用 |
|--------|------|
| `menuconfig [build_dir]` | 交互式 Kconfig，生成 `.config` 并触发 genconfig |
| `genconfig [build_dir]` | `.config` → `config.cmake` |
| `update` / `configure` | `cmake -S . -B <build_dir>` |
| `build [build_dir] [-j N]` | 必要时补齐配置后完整编译；支持 `--jobs N` |
| `all [build_dir] [-j N]` | menuconfig + update + build；支持 `--jobs N` |
| `clean [build_dir]` | 删除构建目录 |
| `completion bash` | 输出 Bash 补全脚本 |
| `install` / `uninstall` | 将 `ember` 链到 PATH（默认 `~/.local/bin`） |

完整手册见上游 [openember-cli README](https://github.com/openember/openember-cli/blob/main/README.md)。
