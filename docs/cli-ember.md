---
sidebar_position: 5
---

# ember CLI 命令行工具

OpenEmber 内置 `scripts/ember`，独立 **openember-cli** 仓库也提供 `ember`。两者的功能取决于版本；产品创建和型号工作流优先使用框架内置版本。框架根目录提供 `scripts/kconfig/`，独立产品则通过 `openember/` 依赖访问这些脚本，不需要复制工具链。

创建、构建和扩展产品的完整步骤见 [创建你的第一个产品](./product-quickstart.md)。

## 在工程根目录使用

```bash
/path/to/<project>/scripts/ember build
```

独立产品根目录使用 `./openember/scripts/ember build --product <model>`；可运行 `./openember/scripts/ember install` 将该版本链接到 PATH。安装会更新用户命令链接与 Bash 补全。

OpenEmber 与 EmberLite 均提供 `scripts/ember` 脚本，具体选项取决于所用版本。

## 产品工程命令

以下为 OpenEmber 内置 CLI 的当前入口；在框架根使用 `./scripts/ember`，在产品根使用 `./openember/scripts/ember`。

| 命令 | 作用 |
|------|------|
| `new <name> --model <model>` | 生成独立产品工程，默认软链到框架源码 |
| `new <name> --no-symlink` | 生成工程后由用户添加框架依赖，例如 submodule |
| `menuconfig --product <model>` | 选择型号并修改配置 |
| `genconfig --product <model>` | 非交互生成或刷新型号配置 |
| `update --product <model>` | 解析配置并刷新 CMake，不拉取 Git 源码 |
| `savedefconfig --product <model>` | 将工作配置相对共用基线的差异保存到型号默认文件 |
| `build --product <model> -j 4` | 构建到 `build/<architecture>/<model>/` |
| `run --product <model> --dry-run` | 展示 launch 启动命令，不启动进程 |
| `run --product <model>` | 通过 launch_manager 启动型号配置 |
| `defconfig --product <model>` | 重置型号工作配置，备份 `.config.pre-defconfig` |

`new` 还支持 `--path DIR`、`--openember PATH`；以 `ember help` 和 `ember new --help` 为准。`--product` 是型号名称，不是产品仓路径。修改配置后需要重新构建；后续省略 `--product` 时会复用已选型号。

## 保存配置：菜单 Save、savedefconfig 与 defconfig

菜单 **Save** 保存完整的工作配置。保留默认文件名并正常退出后，配置写入 `build/<architecture>/<model>/.config`，后续构建使用该文件；选择其他文件名则导出完整副本。菜单顶部的临时路径属于编辑过程，正常退出后由工具写回正式文件。

`ember savedefconfig --product DEMO_A` 将该型号已有工作配置相对于工程公共基线的差异保存到 `products/DEMO_A/product.defconfig`，用于版本管理。`ember defconfig --product DEMO_A` 执行反方向的重置：用公共基线与型号默认配置重新生成工作配置，并将原文件备份为 `.config.pre-defconfig`。

`savedefconfig` 要求型号默认文件和工作配置已存在，不能直接创建未知型号。菜单 Save 另存文件也不会自动注册型号或修改型号标识。新增型号的步骤及完整保存流程见[型号构建配置的保存与恢复](./configuration#型号构建配置的保存与恢复)。

## 环境变量

| 变量 | 含义 |
|------|------|
| `OPENEMBER_ROOT` | 显式指定工程根目录（优先级最高） |
| `OPENEMBER_BUILD_DIR` | 覆盖自动选择的构建目录 |
| `OPENEMBER_CMAKE_LOCAL` | 本机 CMake 初始缓存；默认工程根 .ember-local.cmake，管理 SDK/工具链路径 |
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

## 按架构隔离构建目录

原生构建默认使用产品工程的 `build/<architecture>/<model>/`，例如 `build/x86_64/DEMO_A/` 和 `build/aarch64/DEMO_A/`；框架独立构建默认使用 `build/<architecture>/`。架构通过执行机器的 `uname -m` 识别，`amd64` 和 `arm64` 分别规范为 `x86_64` 和 `aarch64`。

最近使用的型号和自定义目录记录在 `build/<architecture>/.ember-active`，适用于通过 NFS 共享源码的开发机与目标板。旧的 `build/.ember-active` 不再自动加载。`--build-dir`、位置参数和 `OPENEMBER_BUILD_DIR` 仍可以指定已有目录，已有目录不会自动搬迁或删除。CMake 构建缓存包含绝对路径，不应通过移动目录来迁移缓存。

目录命名本身不选择编译器，也不保证 ABI 兼容。交叉编译时须显式准备目标工具链，并使用对应的构建目录；默认架构识别目前用于原生构建。不同架构可以在同一个产品工程中维护不同的 `.config`，依赖路径通过各自的 `OPENEMBER_CMAKE_LOCAL` 初始缓存提供。
