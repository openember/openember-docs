---
sidebar_position: 5
---

# ember CLI

`ember` 来自 **openember-cli** 仓库，用于编排 **Kconfig** 与 **CMake**，本身不绑定某一业务工程；具体工程需在根目录提供 `CMakeLists.txt` 以及 `scripts/kconfig/menuconfig.sh`、`scripts/kconfig/genconfig.sh` 等约定入口。

## 在工程根目录使用

```bash
/path/to/<project>/scripts/ember build
```

OpenEmber 与 EmberLite 均内置兼容的 `scripts/ember` 脚本。

## 环境变量

| 变量 | 含义 |
|------|------|
| `OPENEMBER_ROOT` | 显式指定工程根目录（优先级最高） |
| `OPENEMBER_BUILD_DIR` | 默认构建目录名（默认 `build`） |
| `OPENEMBER_JOBS` | 并行编译任务数 |
| `OPENEMBER_KCONFIG_NONINTERACTIVE=1` | menuconfig 以非交互方式生成默认 `.config` |
| `OPENEMBER_KCONFIG_FRONTENDS_DIR` | 覆盖 kconfig-frontends 解压目录 |

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
| `build [build_dir]` | 必要时补齐配置后完整编译 |
| `all` | menuconfig + update + build |
| `clean [build_dir]` | 删除构建目录 |
| `completion bash` | 输出 Bash 补全脚本 |
| `install` / `uninstall` | 将 `ember` 链到 PATH（默认 `~/.local/bin`） |

完整手册见上游 [openember-cli README](https://github.com/openember/openember-cli/blob/main/README.md)。
