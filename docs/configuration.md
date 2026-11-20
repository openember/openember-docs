---
sidebar_position: 3.5
---

# 构建配置与运行参数

OpenEmber 将构建能力与设备运行参数分开管理。Kconfig 配合 CMake 决定程序包含什么，YAML 决定已构建模块以什么参数运行。产品既可以源码集成框架，也可以在框架源码树中开发，这项分工不随工程方式改变。

## 职责边界

| 内容 | 配置位置 | 生效时机 |
| --- | --- | --- |
| 启用哪些应用、服务、驱动或推理后端 | Kconfig / 产品 defconfig | 重新构建 |
| 编译选项、平台与架构、链接哪些库 | Kconfig + CMake / 工具链 | 重新构建 |
| 依赖版本与源码基线 | CMake 依赖清单、revision / 锁定记录；可选 Kconfig 选择项 | 重新获取依赖并构建 |
| 启动哪些进程、命令行参数、监督策略 | launch YAML，由 launch_manager 解释 | 重新启动编排 |
| 设备实例、端点、采样频率 | hardware YAML，由硬件程序解释 | 按该模块的加载方式生效 |
| 关节增益、目标姿态、轨迹约束、策略路径、遥控映射 | 产品拥有的模块参数 YAML | 首版在节点启动时加载，修改后重启节点 |

Kconfig 不适合承担需要频繁调试的逐关节增益、标定或动作轨迹。YAML 也不能启用未编译的驱动、安装缺失的依赖，或覆盖构建时确定的 ABI。依赖版本的唯一来源仍是实际构建使用的依赖清单；不能仅修改运行参数就切换库版本。

运行参数不等于热加载。通用配置组件首版提供启动加载与校验，**没有自动重载、参数服务或远程改参**。控制过程中的在线调参，需要模块另行定义可调整字段、控制状态、完整校验、原子应用和失败回退。

## 参数属于哪个工程

核心 `openember::config` 提供通用 YAML 文件加载、只读节点访问、类型转换和错误定位。模块定义自己的参数结构、默认值、字段范围与交叉约束。框架不预置某款机器人的关节名称或增益。

产品可以按型号组织参数，例如：

```text
products/DEMO_A/
  product.defconfig
  launch.yaml
  hardware.yaml
  motion-control.yaml
```

这是组织示例，框架不会自动查找或合并这些文件。实际模块应通过显式的命令行参数或启动配置接收路径。产品已有 `robots/<robot_id>/` 等资源目录时，可以继续沿用，避免重复维护。逐关节参数应按关节名称映射；从已有机器人配置迁移时同时记录来源、坐标、单位和版本。能力上限来自硬件/模型能力，运行配置不能绕过这些上限。

检测类模块应将“检测什么”和“如何处理”分别配置：阈值、时间窗、滞回与去抖属于检测参数；动作上下文下的响应、恢复预算和解除条件属于产品策略参数。二者按一致的版本快照校验和应用，详见[检测、响应与恢复](./detection-and-response)。这是参数组织原则，通用 YAML 组件不会自动提供检测器或响应状态机。

## 在 C++ 模块中加载

在 Kconfig 的 Components Layer 中启用 `OPENEMBER_COMPONENT_CONFIG`，它依赖已有的 `OPENEMBER_USE_YAMLCPP`。CMake 目标链接：

```cmake
target_link_libraries(my_node PRIVATE openember::config)
```

配置示例：

```yaml
schema_version: 1
controller:
  kp: 80.0
  kd: 2.0
  max_effort_nm: 30.0
```

程序读取并完成检查后，再创建有副作用的设备或启动控制循环：

```cpp
#include <openember/config/yaml.hpp>

const auto root = openember::config::LoadYamlFile(config_path);
root.CheckKeys({"schema_version", "controller"});
root.At("schema_version").Require(
    root.Get<int>("schema_version") == 1, "unsupported schema version");
const auto controller = root.At("controller");
controller.CheckKeys({"kp", "kd", "max_effort_nm"});
const double kp = controller.At("kp").AsInRange<double>(0.0, 1000.0);
const double kd = controller.At("kd").AsInRange<double>(0.0, 100.0);
const double effort = controller.At("max_effort_nm").AsInRange<double>(0.0, 30.0);
controller.At("max_effort_nm").Require(effort > 0, "must be positive");
```

示例范围用于说明 API。实际范围由模块与设备能力共同确定，配置结构也由模块拥有。`CheckKeys` 拒绝未声明字段；必填字段通过 `At` / `Get` 检查。`GetOr` 仅在字段缺失时使用默认值，字段显式为 null 或类型错误仍报错。

模块应先构造完整的强类型参数对象，再将其交给运行实例。通用读取器不会保存全局参数，不会一边解析一边更新正在运行的控制器。已有 launch / hardware 解析器保持各自文件格式，本组件不会自动接管或转换它们。

## 格式与错误约定

- 公开 API 不暴露 yaml-cpp 类型；返回值是不可变配置快照，可以在加载完成后共享读取。
- 错误包含来源、字段路径、可用时的行列号；缺失字段使用父节点位置。
- 整数仅接受十进制，布尔仅接受 `true` / `false`，浮点数必须有限。按请求类型转换标量，引号不影响该约定。
- 拒绝重复键、非字符串形式的复杂键、`<<` 合并键、自定义标签、多个 YAML document。
- 普通别名可用，但展开同样受层深与节点数限制；循环别名会因层深限制被拒绝。
- 默认输入最大 1 MiB、展开深度 32、节点数 65536；这些是读取保护，不是面向恶意输入的隔离边界。
- 不自动展开环境变量、不执行 include、不合并默认/机型/本机文件。若模块需要资源路径解析，应明确相对基准。

相关工程入口见 [创建你的第一个产品](./product-quickstart)，构建流程见 [构建 OpenEmber](./build-openember)。

## 型号构建配置的保存与恢复

同一个产品工程可以包含多个型号。`products/<model>/product.defconfig` 是纳入版本管理的型号默认配置，`build/<model>/.config` 是该型号当前使用的完整构建配置。首次配置时，工具合并工程公共基线 `openember.defconfig`（若存在）与型号默认配置，并解析 Kconfig 默认值及依赖；已有 `.config` 时，`menuconfig` 继续使用它，不会每次重新加载型号默认配置。下文使用 `DEMO_A`、`DEMO_B` 作为示例型号。

| 操作 | 读取与保存方向 | 用途 |
| --- | --- | --- |
| `ember menuconfig --product DEMO_A` | 打开当前型号工作配置，保存并正常退出后更新 `build/DEMO_A/.config` | 调整本次构建使用的功能 |
| 菜单 **Save**（保留默认文件名） | 在菜单编辑文件中保存完整配置，正常退出后写回该型号的 `.config` | 保存菜单中的修改 |
| 菜单 **Save**（指定其他文件名） | 将完整配置另存为指定文件 | 导出配置副本，不自动注册新型号 |
| `ember savedefconfig --product DEMO_A` | `build/DEMO_A/.config` → `products/DEMO_A/product.defconfig` | 将验证后的选择保存为可提交的型号默认配置 |
| `ember defconfig --product DEMO_A` | 公共基线 + 型号默认配置 → `build/DEMO_A/.config` | 恢复型号默认配置；已有 `.config` 先备份到 `.config.pre-defconfig` |

菜单中的 Save 与 Linux 内核 menuconfig 类似，可以保存完整配置或另存文件。当前封装先在临时目录中编辑，顶部可能显示 `build/<model>/.kconfig.XXXXXX/.config`；保留默认保存路径并正常退出后，工具才会将配置写回正式 `.config` 并刷新 `config.cmake`。不要将临时目录路径作为长期配置位置。另存文件只负责导出，不能替代默认路径的保存，也不会自动更改 `CONFIG_PRODUCT_MODEL`。

`savedefconfig` 保存的是相对于**解析后的工程公共基线**的差异，并保留型号标识；它不是完整 `.config` 的直接复制，也不只是与原始 Kconfig 默认值比较。生成的 `product.defconfig` 用于 Git 提交、其他开发者复现，以及清理构建目录后重新生成配置。它不会创建新的产品工程，不会切换到另一个型号，也不会自动生成启动和硬件配置。

典型操作顺序：

```bash
ember menuconfig --product DEMO_A
# 在菜单中调整选项，使用默认文件名 Save，然后正常退出。
ember build --product DEMO_A
# 验证通过后，更新版本管理中的型号默认配置。
ember savedefconfig --product DEMO_A
```

下次执行 `ember menuconfig --product DEMO_A` 会继续使用现有工作配置；若要用已保存的默认配置重置它，执行 `ember defconfig --product DEMO_A`。重置会替换当前工作配置，不应将其当作普通刷新操作。

### 在现有产品工程中新增型号

当前 CLI 要求型号的 `products/<model>/product.defconfig` 已存在，`savedefconfig --product <model>` 不能直接创建未知型号。可以复制相近型号的默认文件，修改其中的型号标识，再打开菜单调整：

```bash
mkdir -p products/DEMO_B
cp products/DEMO_A/product.defconfig products/DEMO_B/product.defconfig
sed -i 's/^CONFIG_PRODUCT_MODEL=.*/CONFIG_PRODUCT_MODEL="DEMO_B"/' \
  products/DEMO_B/product.defconfig
ember menuconfig --product DEMO_B
ember savedefconfig --product DEMO_B
```

此时配置读写均属于 `DEMO_B`，默认构建目录为 `build/DEMO_B/`。复制前提是工程已有可参考的 `DEMO_A` 型号；复制后还应检查型号相关的 Kconfig 条件与能力选择。菜单 Save 即使将文件另存到新目录，也不会完成这些适配步骤。

上述步骤只建立构建配置。需要通过 `ember run` 启动时，还应准备该型号的 `launch.yaml`、按需提供 `hardware.yaml` 及各模块运行参数，并校验其中的型号、设备和资源路径。创建全新的产品仓库使用 `ember new <name> --model <model>`，与在已有工程中新增型号是两项不同操作。

### 本机构建环境

本机 SDK、工具链和依赖源码路径可以写入忽略的 `.ember-local.cmake`，`update` / `build` 每次加载；也可通过 `OPENEMBER_CMAKE_LOCAL` 选择另一份。依赖源码版本仍由依赖清单及实际源码基线决定。不能依赖旧 `CMakeCache.txt` 中未被型号配置记录的功能开关。
