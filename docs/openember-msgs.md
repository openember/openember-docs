---
sidebar_position: 5
---

# openember-msgs 消息协议

`openember-msgs` 是 OpenEmber 与 EmberLite 共用的消息协议仓库。它只保存 `.proto` 定义、Nanopb 约束和必要的生成入口，不直接实现 OpenEmber 或 EmberLite 的运行时。

核心原则：

- **协议单独版本化**：消息定义由 `openember-msgs` 统一维护并打 tag 发布。
- **运行时各自实现**：OpenEmber 使用 C++ Protobuf，EmberLite 使用 Nanopb C。
- **Zenoh 负责路由**：Zenoh key 决定消息发布到哪里，Protobuf message 决定 payload 结构。
- **不复制协议文件**：OpenEmber 和 EmberLite 不应各自维护一份 `.proto` 副本。

## 当前状态

目前 `openember-msgs` 已定义第一组核心运行时消息：

| 包 | 用途 |
|----|------|
| `common/v1` | `Header`、`Status`、`QosProfile`、`Metric` 等通用类型 |
| `node/v1` | 节点信息、心跳、节点查询、节点注册表快照 |
| `lifecycle/v1` | 生命周期状态、状态切换命令与事件 |
| `diagnostics/v1` | 诊断状态与健康信息 |
| `parameter/v1` | 参数获取、设置和事件通知 |
| `log/v1` | 结构化日志 |
| `device/v1` | 设备信息、设备状态、设备查询 |
| `runtime/v1` | 进程启动、停止和进程事件 |

OpenEmber 已接入 `openember-msgs` 的 C++ Protobuf 生成目标，默认通过 `FETCH` 拉取 `main` archive，也可显式选择 `LOCAL` 使用本地 checkout。EmberLite 已接入 Nanopb C 生成目标。两个工程都通过 `OPENEMBER_ENABLE_MSGS` 管理消息协议是否启用。

## Kconfig 管理方案

消息协议是 OpenEmber 生态的一等通信契约，影响节点、工具、设备管理、诊断、参数和运行时服务。它不应归入 `Core`、`Component` 或纯 `Third party` 菜单，而应放在通信层统一管理：

```text
Communication / Messages
```

OpenEmber 当前采用如下结构；EmberLite 后续也可以对齐同一语义：

```kconfig
menu "Communication"

menu "Link"

config OPENEMBER_ENABLE_LINK
    bool "Enable OpenEmber Link"
    default y
    depends on OPENEMBER_COMPONENT_TRANSPORT
    help
      Build the stable OpenEmber communication layer for Topic, Service,
      Liveliness, node discovery, diagnostics, and message serialization.

endmenu

menu "Messages"

config OPENEMBER_ENABLE_MSGS
    bool "Enable openember-msgs protocol bindings"
    default y
    help
      Build generated protocol bindings from openember-msgs.
      OpenEmber uses C++ Protobuf bindings; EmberLite uses Nanopb C bindings.

choice OPENEMBER_MSGS_SOURCE_CHOICE
    prompt "openember-msgs source"
    depends on OPENEMBER_ENABLE_MSGS
    default OPENEMBER_MSGS_SOURCE_FETCH

config OPENEMBER_MSGS_SOURCE_FETCH
    bool "FETCH"
    help
      Download the selected openember-msgs ref during CMake configure.

config OPENEMBER_MSGS_SOURCE_LOCAL
    bool "LOCAL"
    help
      Use a local openember-msgs checkout. OPENEMBER_MSGS_LOCAL_SOURCE must be
      an absolute path.

endchoice

config OPENEMBER_MSGS_LOCAL_SOURCE
    string "openember-msgs local source path"
    depends on OPENEMBER_ENABLE_MSGS && OPENEMBER_MSGS_SOURCE_LOCAL
    default ""

choice OPENEMBER_MSGS_REF_CHOICE
    prompt "openember-msgs version"
    depends on OPENEMBER_ENABLE_MSGS && OPENEMBER_MSGS_SOURCE_FETCH
    default OPENEMBER_MSGS_REF_LATEST

config OPENEMBER_MSGS_REF_LATEST
    bool "latest"

endchoice

endmenu

endmenu
```

Kconfig 到 CMake 的推荐映射：

| Kconfig | CMake | 说明 |
|---------|-------|------|
| `OPENEMBER_ENABLE_MSGS=y` | `OPENEMBER_ENABLE_MSGS=ON` | 生成并链接消息协议绑定 |
| `OPENEMBER_MSGS_SOURCE_FETCH=y` | `OPENEMBER_MSGS_SOURCE=FETCH` | 从远端获取 `openember-msgs` |
| `OPENEMBER_MSGS_SOURCE_LOCAL=y` | `OPENEMBER_MSGS_SOURCE=LOCAL` | 使用本地 `openember-msgs` checkout |
| `OPENEMBER_MSGS_LOCAL_SOURCE="/abs/path"` | `OPENEMBER_MSGS_LOCAL_SOURCE=/abs/path` | 本地 checkout 的绝对路径 |
| `OPENEMBER_MSGS_REF_LATEST=y` | `OPENEMBER_MSGS_REF=main` | 使用 `openember-msgs` 主分支最新代码 |

`Third party` 中可以保留 `OPENEMBER_THIRD_PARTY_BUNDLE_OPENEMBER_MSGS`，但它只表示源码获取策略，例如是否下载、缓存或使用 vendor archive。它不表示“是否启用消息协议”。

`OPENEMBER_MSGS_SOURCE` 必须由用户明确选择：

- `FETCH`：默认值。构建配置阶段从 `openember-msgs` 的 `main` 分支 archive 获取最新代码，缓存名为 `openember-msgs-main`。
- `LOCAL`：使用用户填写的 `OPENEMBER_MSGS_LOCAL_SOURCE`，该路径必须是绝对路径，并且目录下必须存在 `CMakeLists.txt`。

工程不会再因为相邻目录中存在 `../openember-msgs` 而自动切换到本地源码；只有选择 `LOCAL` 时才使用本地 checkout。

推荐关系：

```kconfig
config OPENEMBER_THIRD_PARTY_BUNDLE_OPENEMBER_MSGS
    bool "Bundle: openember-msgs"

config OPENEMBER_TP_LINK_OPENEMBER_MSGS
    bool
    default y if OPENEMBER_ENABLE_MSGS
    select OPENEMBER_THIRD_PARTY_BUNDLE_OPENEMBER_MSGS
```

EmberLite 使用 Nanopb，因此启用消息协议时还应确保 Nanopb bundle 可用：

```kconfig
config OPENEMBER_TP_LINK_NANOPB
    bool
    default y if OPENEMBER_ENABLE_MSGS
    select OPENEMBER_THIRD_PARTY_BUNDLE_NANOPB
```

这样菜单职责保持清晰：

- `Communication / Link`：是否启用 OpenEmber Link 通信层。
- `Communication / Messages`：是否启用协议绑定、选择 `openember-msgs` 版本。
- `Third party`：源码下载、缓存、vendor archive、系统包等获取策略。
- `Core` / `Component`：只表达运行时库和功能模块，不承载协议版本选择。

## 推荐依赖方式

建议把 `openember-msgs` 作为独立第三方协议依赖，而不是复制到各仓库中。

推荐优先级：

1. **日常开发 / CI 跟进主线**：使用默认 `OPENEMBER_MSGS_SOURCE=FETCH` 和 `OPENEMBER_MSGS_REF=main`。
2. **本地协议开发**：设置 `OPENEMBER_MSGS_SOURCE=LOCAL`，并通过 `OPENEMBER_MSGS_LOCAL_SOURCE=/abs/path/to/openember-msgs` 指向本地 checkout。
3. **离线构建**：使用 `FETCH` / `VENDOR` 的 archive 缓存机制，将 `openember-msgs-main.tar.gz` 放入各仓库 `third_party/` 缓存。
4. **产品发布**：后续增加 tag/commit 选项后，固定到明确的 `openember-msgs` tag 或 commit。

不建议：

- 在 OpenEmber 和 EmberLite 中分别手写一套消息结构。
- 在 OpenEmber 主仓库提交由 Protobuf 生成的 C++ 源码。
- 让 `openember-msgs` 反向依赖 OpenEmber、EmberLite 或 Zenoh runtime。

## 构建产物与链接

Protobuf / Nanopb 生成的不只是头文件。`.pb.h` 声明消息类型和序列化接口，`.pb.cc` 或 `.pb.c` 包含这些接口的实现，因此需要被编译并链接到最终程序中。

OpenEmber 使用 C++ Protobuf，构建目录中会生成 `generated/openember/msgs/.../*.pb.h` 和 `*.pb.cc`，并编译为 `openember_msgs_cpp` 静态库，对外导出 CMake target `openember::msgs_cpp`。OpenEmber 的 `core`、transport、节点或工具链接这个 target 后，就可以直接包含生成的 `.pb.h` 并使用消息类型。

EmberLite 使用 Nanopb C，构建目录中会生成 `*.pb.h` 和 `*.pb.c`，并编译为 `emberlite_msgs` 静态库。EmberLite 的 runtime、Zenoh-pico 适配层或示例节点按需链接该库。

## FETCH / LOCAL 切换行为

`OPENEMBER_MSGS_SOURCE=FETCH` 和 `OPENEMBER_MSGS_SOURCE=LOCAL` 可以在同一个构建目录中来回切换，但需要理解构建目录中几个路径的职责。

FETCH 模式下，CMake 配置阶段会使用 `third_party/openember-msgs-main.tar.gz` 作为 archive 缓存，并将源码解压到：

```text
build/_deps/openember-msgs-main
```

重新配置时，当前实现会先删除 `build/_deps/openember-msgs-main`，再重新解压 archive。这样可以避免 FETCH 模式继续使用旧的解压源码。

LOCAL 模式下，CMake 不会使用 `build/_deps/openember-msgs-main` 作为源码，而是直接使用：

```text
OPENEMBER_MSGS_LOCAL_SOURCE=/abs/path/to/openember-msgs
```

因此从 FETCH 切换到 LOCAL 后，旧的 `build/_deps/openember-msgs-main` 目录即使仍然存在，也不会参与当前构建。从 LOCAL 切回 FETCH 后，配置阶段会重新删除并解压 `build/_deps/openember-msgs-main`。

OpenEmber 的 C++ Protobuf 子工程使用独立构建目录：

```text
build/_deps/openember-msgs-main-build
```

当前实现会在重新配置时删除这个目录，再重新 `add_subdirectory()` 协议子工程，因此 OpenEmber 在 FETCH / LOCAL 之间切换时，C++ 生成和链接目标会重新建立。

EmberLite 的 Nanopb 生成目录为：

```text
build/generated/openember-msgs
```

当前实现不会因为 FETCH / LOCAL 切换而主动删除该目录，而是依赖 CMake custom command 的依赖关系触发重新生成。通常这已经足够；后续如果需要更强的一致性，可以增加 source stamp 机制：记录当前使用的协议来源，例如 `FETCH:main` 或 `LOCAL:/abs/path/to/openember-msgs`，当来源变化时主动删除 `build/generated/openember-msgs` 并重新生成。

后续如果其他依赖也需要类似 `FETCH` / `LOCAL` 的显式来源选择，可以再抽象一层通用 source resolver。它可以统一处理来源校验、绝对路径检查、archive 缓存、`build/_deps` 暂存目录、marker 文件校验和可选的切换清理策略。现阶段只有 `openember-msgs` 明确需要这套语义，因此暂不提前抽象，避免为单一用例引入过重的公共接口。

## OpenEmber 中的使用流程

OpenEmber 是 C++ 主线，推荐使用标准 Protobuf C++ runtime。

构建流程建议：

1. CMake 通过 `cmake/GetOpenEmberMsgs.cmake` 获取或定位 `openember-msgs`。
2. OpenEmber 默认启用 `OPENEMBER_ENABLE_MSGS=ON`，并在协议子工程中设置 `OPENEMBER_MSGS_BUILD_CPP=ON`。
3. 由 `protoc` 在构建目录生成 `.pb.cc` / `.pb.h`。
4. 编译生成 `openember_msgs_cpp` 静态库。
5. OpenEmber 的 `core`、`transport`、系统节点或工具按需链接该库。

示意：

```cmake
target_link_libraries(openember_core
    PUBLIC
        openember::msgs_cpp
)
```

运行时建议：

- 节点上线时发布 `openember.msgs.node.v1.NodeInfo`。
- 节点周期性发布 `openember.msgs.node.v1.NodeHeartbeat`。
- 生命周期控制使用 `LifecycleCommand` / `LifecycleCommandResponse`。
- 参数服务使用 `GetParameterRequest`、`SetParameterRequest` 等消息。

典型 Zenoh key：

```text
openember/<robot_id>/<namespace>/nodes/<node>/info
openember/<robot_id>/<namespace>/nodes/<node>/heartbeat
openember/<robot_id>/<namespace>/nodes/<node>/lifecycle
openember/<robot_id>/<namespace>/diagnostics/<node>
openember/<robot_id>/<namespace>/logs/<node>
```

payload 直接使用对应 Protobuf message 的二进制编码。类型信息可以由节点注册表记录，也可以在工具层约定 MIME/encoding，例如：

```text
application/x-protobuf;type=openember.msgs.node.v1.NodeInfo
```

## EmberLite 中的使用流程

EmberLite 是纯 C 项目，不建议链接 Google Protobuf C++ runtime。推荐使用 Nanopb。目标配置中 `OPENEMBER_ENABLE_MSGS` 默认开启；资源特别受限或只构建基础库时可以关闭。

构建流程建议：

1. CMake 通过 `cmake/GetOpenEmberMsgs.cmake` 获取或定位 `openember-msgs`。
2. 使用 `openember-msgs/nanopb/openember_msgs.options` 作为 Nanopb 约束。
3. 由 `protoc` + `nanopb_generator.py` 生成 `.pb.c` / `.pb.h`。
4. 将生成的 C 文件编译为 `emberlite_msgs` 静态库。
5. EmberLite 的 runtime、Zenoh-pico 适配层或示例节点按需链接该库。

当前 CMake 入口：

```bash
cmake -S . -B build -DOPENEMBER_ENABLE_MSGS=ON
cmake --build build --target emberlite_msgs
```

构建环境需要：

- `protoc` 在 `PATH` 中可用。
- Nanopb 源码，可由 EmberLite third-party 缓存获取，也可通过 `OPENEMBER_NANOPB_LOCAL_SOURCE` 指定。
- 一个能 `import google.protobuf` 的 Python。CMake 会自动尝试 `Python3_EXECUTABLE`、`/usr/bin/python3` 和 `PATH` 中的 `python3`；必要时可显式设置 `OPENEMBER_PROTOBUF_PYTHON=/path/to/python3`。

手动生成示意：

```bash
python3 nanopb/generator/nanopb_generator.py \
  -I openember-msgs/proto \
  -f openember-msgs/nanopb/openember_msgs.options \
  openember-msgs/proto/openember/msgs/node/v1/node.proto
```

对 EmberLite，建议同时支持两种模式：

| 模式 | 说明 |
|------|------|
| 开发模式 | 本机安装 `protoc` 和 Nanopb generator，构建时自动生成 `.pb.c` / `.pb.h` |
| 发布模式 | 使用 `openember-msgs` release 中预生成的 Nanopb C 源码，减少工具链依赖 |

发布模式对工业项目更友好，因为目标 SDK 或交叉编译环境不一定适合安装 Python、Protobuf compiler 和 Nanopb generator。

Nanopb 约束策略：

- 字符串、小型 labels、metrics、参数名列表等字段使用 `max_size` / `max_count`，方便 C 端直接静态承载。
- 节点列表、设备列表、诊断数组、日志批次、参数批量响应、节点 endpoints 等大集合使用 `FT_CALLBACK`，避免在 EmberLite 上为一次查询响应预分配过大的结构体。
- 使用 callback 字段时，具体编码/解码由上层节点或适配层提供 `pb_callback_t`，可以按需流式处理。

## 协议开发流程

推荐按照下面的顺序修改协议：

1. 在 `openember-msgs/proto/openember/msgs/<domain>/v1/` 修改或新增 `.proto`。
2. 同步更新 `nanopb/openember_msgs.options`，为新字段设置 `max_size`、`max_count` 或 `type:FT_CALLBACK`。
3. 运行 Protobuf descriptor 校验：

```bash
protoc -I proto --include_imports \
  --descriptor_set_out=/tmp/openember-msgs.desc \
  $(find proto -name '*.proto' -print | sort)
```

4. 运行 C++ 生成与编译：

```bash
cmake -S . -B build -DOPENEMBER_MSGS_BUILD_CPP=ON
cmake --build build
```

5. 如本机安装了 Nanopb，再生成 C 代码并编译 EmberLite 示例。
6. 通过后给 `openember-msgs` 打 tag。
7. OpenEmber 和 EmberLite 更新到同一个协议 tag。

## 版本策略

兼容变更：

- 只新增字段。
- 新字段使用新的 field number。
- 保持已有字段语义不变。

不兼容变更：

- 重命名字段或消息。
- 修改字段类型。
- 删除字段且未保留字段号。
- 改变已有字段语义。

不兼容变更应创建新的 package 版本，例如：

```text
openember.msgs.node.v2
```

## 建议的下一步

OpenEmber：

- 将 `core::Node` 的 `TypeName` 与序列化机制接入生成的 Protobuf 类型。
- 用 `NodeInfo` 和 `NodeHeartbeat` 打通最小节点发现流程。
- 在 `node_registry` 中记录 topic/service 与消息类型之间的关系。

EmberLite：

- 在启用 `OPENEMBER_ENABLE_MSGS` 后，用 `NodeInfo` 和 `NodeHeartbeat` 打通最小节点发现流程。
- 将 `emberlite::msgs` 与 Zenoh-pico 适配层连接起来。
- 评估是否在 release 中附带预生成的 Nanopb C 源码，降低交叉编译环境要求。

完成这些之后，`openember-msgs` 就成为 OpenEmber 生态的协议源头；OpenEmber 和 EmberLite 只负责各自运行时、传输和工具链集成。
