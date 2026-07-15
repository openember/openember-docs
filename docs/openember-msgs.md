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

OpenEmber 已接入 `openember-msgs` 的 C++ Protobuf 生成目标，默认通过相邻 checkout 或 third-party 缓存解析协议仓库。EmberLite 已接入可选的 Nanopb C 生成目标，默认关闭，需要时启用 `OPENEMBER_ENABLE_MSGS`。

## 推荐依赖方式

建议把 `openember-msgs` 作为独立第三方协议依赖，而不是复制到各仓库中。

推荐优先级：

1. **产品/CI 构建**：固定到 `openember-msgs` 的 tag 或 commit。
2. **离线构建**：将 `openember-msgs` 的 release archive 放入各仓库 `third_party/` 缓存。
3. **本地开发**：允许通过 CMake cache 变量指向本地源码目录，例如 `OPENEMBER_MSGS_LOCAL_SOURCE=/path/to/openember-msgs`。

不建议：

- 在 OpenEmber 和 EmberLite 中分别手写一套消息结构。
- 在 OpenEmber 主仓库提交由 Protobuf 生成的 C++ 源码。
- 让 `openember-msgs` 反向依赖 OpenEmber、EmberLite 或 Zenoh runtime。

## OpenEmber 中的使用流程

OpenEmber 是 C++ 主线，推荐使用标准 Protobuf C++ runtime。

构建流程建议：

1. CMake 通过 `cmake/GetOpenEmberMsgs.cmake` 获取或定位 `openember-msgs`。
2. OpenEmber 默认启用 `OPENEMBER_WITH_MSGS=ON`，并在协议子工程中设置 `OPENEMBER_MSGS_BUILD_CPP=ON`。
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

EmberLite 是纯 C 项目，不建议链接 Google Protobuf C++ runtime。推荐使用 Nanopb。

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
