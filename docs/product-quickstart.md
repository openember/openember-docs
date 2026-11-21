---
sidebar_position: 2.5
---

# 创建你的第一个产品

OpenEmber 的工程使用方式分为三种：直接维护框架源码、独立产品引用框架源码并一起编译，以及规划中的安装 SDK 后独立开发。前两种已有工程入口，第三种用于后续 SDK 交付。

本文使用 OpenEmber 仓库内置的 `scripts/ember`，命令以当前脚手架实现为准。先准备 [构建依赖](./build-openember)，包括 Linux、C/C++ 编译器、CMake、Protobuf；从源码构建 Zenoh 还需要 Rust/Cargo。首次构建可能下载依赖。

## 选择工程方式

| | 方式一：直接维护框架源码 | 方式二：产品源码集成 | 方式三：安装 SDK 后开发 |
|---|---|---|---|
| 当前状态 | 已有入口 | 已有入口，当前推荐 | 规划中，暂不实施 |
| 工程根 | 复制或 fork 后的 OpenEmber | 自己的产品仓 | 自己的节点或产品仓 |
| 框架接入 | 源码属于自己的工程，可直接修改 | 通过软链或 submodule 引入源码 | 安装框架库、头文件和 CMake 配置 |
| 构建方式 | 框架与业务一起编译 | 产品通过 `add_subdirectory(openember)` 一起编译 | 使用 `find_package(OpenEmber)`，独立编译业务 |
| 产品代码 | 在源码树中添加应用、服务和模块 | 放在产品仓的 `apps/`、`packages/`、`modules/` | 放在自己的工程，通过公开接口链接 SDK |
| 框架升级 | 自己合并上游变更、处理冲突 | 更新依赖源码版本，再验证产品 | 更新已安装 SDK，检查兼容性并验证产品 |
| 适用场景 | 深度定制、学习、整体源码交付 | 当前产品开发、多型号开发、框架联调 | 后续多产品共享 SDK、独立节点开发和二进制交付 |

**当前推荐方式二：在产品工程中通过软链引入 OpenEmber 核心，框架与产品一起编译。** 先完善工程和公开接口，暂不要求将框架制作成独立 SDK。准备固定源码版本或共享工程时，也可以使用 submodule。

三种方式均由产品团队维护自己的业务代码；脚手架生成后不会自动更新这些文件。当前 `ember new` 对应方式二；`ember new --standalone` 和 `ember dist` 仍属于后续能力。

## 方式一：以 OpenEmber 源码为起点

从自己的 fork 或源码副本开始，在该工程根目录执行：

```bash
./scripts/ember menuconfig
./scripts/ember build -j 4
```

也可先用 `./scripts/ember build -j 4` 非交互生成默认配置。运行已有示例验证环境，见 [Turtle Demo](./turtle-demo)。

开发自己的产品时：

1. 在 `apps/my_device/` 添加产品入口与 `CMakeLists.txt`；通用业务库可放在 `modules/`。
2. 在 `apps/CMakeLists.txt` 中加入 `add_subdirectory(my_device)`，在 `apps/Kconfig` 添加 `PRODUCT_*` 开关（例如 `PRODUCT_BUILD_MY_DEVICE`），并在 CMake 中使用生成后的选项控制构建。
3. 自有可选服务可放在 `services/`，同样接入该目录的 Kconfig 与 CMake。
4. 添加 `configs/my_device.launch.yaml`，定义进程、参数和重启策略。
5. 启用 `launch_manager` 后构建，显式启动自己的配置：

```bash
./build/bin/launch_manager --launch configs/my_device.launch.yaml
```

产品节点使用 Link client 接入 launch 中的 router。可参考 `apps/smart_device_demo/` 与 `configs/smart_device.launch.yaml`；不要仅依靠默认 launch 查找规则选择自己的产品。

保留原版权与许可证声明。框架和业务在同一源码树中修改后，上游升级需要自行 merge/rebase，并验证受影响的接口与配置。

## 方式二：创建独立产品工程

### 1. 创建工程

假设工作区中已有 `openember/`，从它的上一级目录执行：

```bash
./openember/scripts/ember new my-robot --model host
cd my-robot
```

脚手架默认创建 `openember/` 软链，指向执行该命令的框架源码树；不会复制整个框架。生成结构如下：

```bash
my-robot/
├── CMakeLists.txt              # 产品是真正的顶层 CMake 工程
├── Kconfig
├── kconfig/applications.Kconfig
├── apps/product_app/           # 初始产品节点
├── modules/                    # 自有模块入口
├── products/host/
│   ├── product.defconfig       # 型号默认构建选项
│   ├── hardware.yaml          # 硬件配置占位，需按实际端点完善
│   └── launch.yaml            # 运行进程配置
├── product.default            # 默认型号：host
├── scripts/build.sh
└── openember/                 # 框架依赖
```

产品 `Kconfig` 引用框架提供的共享 `kconfig/workspace.Kconfig`；配置工具绑定框架路径并组合产品片段，不需要在产品仓复制这个文件或整套 Kconfig 脚本。

### 2. 配置和构建

以下命令均在 `my-robot/` 根目录执行：

```bash
./openember/scripts/ember genconfig --product host
./openember/scripts/ember build --product host -j 4
```

需要交互选择功能时，将第一条换为：

```bash
./openember/scripts/ember menuconfig --product host
```

产物位于 `build/host/bin/`，型号工作配置位于 `build/host/.config`。产品根 CMake 通过 `add_subdirectory(openember)` 构建框架，再构建自己的应用；不用先单独编译框架。

### 3. 检查并启动

```bash
./openember/scripts/ember run --product host --dry-run
./openember/scripts/ember run --product host
```

第一条仅展示启动命令；第二条运行 `launch_manager`，由它建立本机 router，再启动产品节点。默认端口为 `tcp/127.0.0.1:7447`，运行前应保证没有冲突实例。

应能看到产品应用启动和心跳日志；初始应用的可执行文件为 `build/host/bin/openember_my_robot_app`，心跳 topic 为 `/nodes/my_robot_app/heartbeat`。这只验证工程接线和进程存活，生成模板不包含机器人控制逻辑或真实硬件端点。

按 Ctrl+C 请求结束本次运行。编写自己的节点时，应处理 SIGINT/SIGTERM，在主循环中停止 worker、释放设备并调用 `openember::Shutdown()`；进程监督器的强制终止不能代替业务清理。

### 4. 固定框架依赖

软链适合同机联调，其目标变化会直接影响产品构建。准备共享仓库或交付时，建议创建固定提交的 submodule。例如在工作区父目录创建另一工程：

```bash
./openember/scripts/ember new my-device --model host --no-symlink
cd my-device
# --no-symlink 生成的目录仅含接入说明，删除说明后添加 submodule
rm openember/README.md
rmdir openember
git init
git submodule add https://github.com/openember/openember.git openember
```

在 submodule 内检出产品已验证的框架提交，再提交产品仓的 submodule 指针。团队拉取时使用 `git clone --recurse-submodules`。不要只记录一个 revision 文本却继续编译另一份源码。

框架版本以外，还需记录 `openember-msgs`、第三方库、外部 SDK 和工具链版本；消息来源的配置见 [构建 OpenEmber](./build-openember)。更新依赖后重新构建并运行产品测试。

## 方式三：安装 SDK 后独立开发（规划中）

目标是先安装 OpenEmber 核心，再通过已安装的头文件、库和 CMake 配置开发自己的节点应用或产品工程，应用工作区无需嵌入或重新编译框架源码。使用体验类似于 ROS 的安装环境与应用工作区，但这不意味着兼容 ROS，也不要求引入其完整的包管理和构建体系。

以下是目标用法示意，**当前尚未提供完整可用的安装 SDK 工作流**：

```cmake
cmake_minimum_required(VERSION 3.16)
project(my_node LANGUAGES CXX)

find_package(OpenEmber CONFIG REQUIRED)
add_executable(my_node main.cpp)
target_link_libraries(my_node PRIVATE openember::core)
```

SDK 应通过导出的 CMake targets 传递公共头文件路径、编译要求和链接依赖，开发者不必手工拼接框架内部路径。产品专用消息与驱动仍由自己的工程维护。

后续交付需要区分：

- **开发 SDK**：公共头文件、库、生成头文件、公共消息绑定、CMake package 配置及必要的传递依赖。
- **运行时组件**：运行应用需要的库，以及按需安装的 `launch_manager` 和系统服务。节点启动后连接配置好的 runtime/router，安装 SDK 本身不会自动启动它们。

实现这种模式还需完善安装与导出规则、可发现的 `OpenEmberConfig.cmake`、版本与 ABI 兼容约定、依赖版本管理，以及脱离框架源码树的构建运行验证。SDK 还需匹配目标架构和工具链。当前只记录模式与边界，继续使用方式二推进产品工程，不改变现有构建流程。

## 在独立工程中添加功能

### 应用与服务

增加 `apps/my_service/`，在产品根 CMake 中加入 `add_subdirectory(apps/my_service)`。最小构建示例：

```cmake
add_executable(my_service main.cpp)
target_link_libraries(my_service PRIVATE openember::core)
set_target_properties(my_service PROPERTIES
    RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/bin")
add_dependencies(openember_product my_service)
```

`main.cpp` 使用 `openember::Init`、`CreateNode` 和 Node 的发布/订阅、Service/Client 接口。初始 `apps/product_app/main.cpp` 可作为接线参考；通信概念见 [OpenEmber Link](./openember-link)。

将进程加入 `products/host/launch.yaml`，例如在已有 `nodes` 列表下追加：

```yaml
  - name: my_service
    kind: service
    command: ${openember.bin}/my_service
    args: ["--client"]
    restart: on-failure
    restart_limit: 3
    shutdown_timeout_ms: 3000
    heartbeat_timeout_ms: 5000
```

这里的 `--client` 必须由程序解析。程序应发布 `/nodes/my_service/heartbeat`，其中 `node_name` 与 launch 中的名称一致。没有心跳的普通工具可以显式设置 `heartbeat_timeout_ms: 0`；这会关闭该进程的心跳监督。构建开关关闭某节点时，也应从 launch 中移除对应进程。

### 产品消息

在产品根创建 `packages/my_interfaces/`，由顶层 CMake 添加该目录。包内可使用框架提供的函数：

```cmake
openember_add_proto_library(
    TARGET my_interfaces
    ALIAS my_robot::interfaces
    PROTOS proto/status.proto)
```

消费方链接 `my_robot::interfaces` 即可获得生成头文件与 Protobuf 依赖。若导入公共消息，需从 `openember::msgs_proto` 的 `OPENEMBER_PROTO_ROOT` 属性获取导入根目录，传入 `IMPORT_DIRS`，并链接 `openember::msgs_cpp`。产品专用消息保留在产品仓，通用协议再考虑进入公共消息仓。

### 硬件驱动与端点

启用框架 Hardware Interface 及所需组件，在产品包中实现适配器，通过 `EndpointRegistry` 注册工厂，再把 registry 传给 `HardwareInterfaceApp`。产品程序链接 `openember::hardware_interface`，由框架统一发布设备状态和诊断。

已有 `IImu` 实现可通过公开 `MakeImuEndpoint` 工厂复用通用 IMU 端点。机型协议、厂商 SDK、标定和设备路径属于产品侧；新增产品驱动不应要求修改框架内置工厂分支。实现步骤与契约见主仓 [硬件端点扩展](https://github.com/openember/openember/blob/main/docs/design/hardware-endpoint-extension.md)。

生成的 `hardware.yaml` 只是占位文件，不会仅因填写设备路径就自动加载驱动；程序必须实际读取配置、注册并启动端点。

## 管理多个型号

在 `products/` 下增加型号目录，每个型号包含自己的 `product.defconfig`、`hardware.yaml` 和 `launch.yaml`，然后选择并构建：

```bash
./openember/scripts/ember menuconfig --product robot-a
./openember/scripts/ember build --product robot-a -j 4
./openember/scripts/ember run --product robot-a --dry-run
```

共用业务代码，按型号维护配置，产物隔离在 `build/<architecture>/<model>/`。显式 `--product` 最容易确认当前操作对象；不传时工具会复用已选择的型号，初始默认值来自 `product.default`。

构建选项与模块运行参数的完整分工见 [构建配置与运行参数](./configuration)。

- **Kconfig** 决定哪些能力参与构建；产品选项使用 `PRODUCT_*` 前缀，可放在 `kconfig/applications.Kconfig`，配置工具会导出为同名 CMake 变量供产品消费。
- **launch YAML** 决定运行哪些进程、参数和监督策略。
- **hardware YAML** 由硬件程序解释，决定设备实例及端点配置。

修改配置后重新构建。`ember defconfig --product host` 会重置该型号工作配置，并备份为 `.config.pre-defconfig`；修改已存在型号的默认文件不会自动覆盖它的工作配置。

## 下一步

先完成无硬件启动、消息收发、退出和故障测试，再接入真实设备。产品需要的整机状态机、周期控制、安全保护、策略和部署由产品侧实现，框架的进程心跳不能替代设备就绪或控制许可。

更多职责边界见主仓 [产品工程与型号方案](https://github.com/openember/openember/blob/main/docs/design/product-scaffold-and-variants.md) 和 [运行时监督与产品应用](https://github.com/openember/openember/blob/main/docs/architecture/runtime-supervision-and-product-app-design.md)。
