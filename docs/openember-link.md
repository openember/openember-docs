---
sidebar_position: 6
---

# OpenEmber Link 通信层

OpenEmber Link 是面向节点、工具、系统服务和设备管理的稳定通信层。它向上提供 Topic、Service、Liveliness、节点发现和诊断等能力，向下隐藏具体中间件实现。应用代码应该面向 OpenEmber 的通信语义编程，而不是直接依赖 Zenoh 的 mode、endpoint、key expression 或 session 细节。

## 设计目标

- **简单默认值**：普通节点只需要指定设备或机器人身份，即可创建节点并通信。
- **稳定 API**：用户代码依赖 `openember::link` 和 `openember::core::Node`，底层中间件可以演进。
- **协议优先**：业务 payload 默认使用 `openember-msgs` 定义的 Protobuf 消息。
- **RAII 资源管理**：Publisher、Subscriber、Service、Client、Liveliness token 都是资源句柄，生命周期由对象持有关系表达。
- **可观测与可靠**：通信层负责连接状态、重连策略、liveliness、诊断事件和错误传播。
- **高级配置可达**：默认 API 保持简单，高级用户仍可显式配置传输 profile、监听地址、连接地址和 QoS。

## Kconfig 位置

OpenEmber Link 位于顶层通信菜单：

```text
Communication / Link
```

核心配置：

```kconfig
config OPENEMBER_ENABLE_LINK
    bool "Enable OpenEmber Link"
    default y
    depends on OPENEMBER_COMPONENT_TRANSPORT
```

`OPENEMBER_ENABLE_LINK` 默认开启。它表示是否构建 OpenEmber 面向用户的稳定通信层；当前 `openember::core` 中的节点通信 API 由 Link 承载，因此启用 Link 时会构建 `openember::core`。Link 依赖 `components/transport`，但应用代码不应直接依赖具体传输后端。

消息协议配置位于：

```text
Communication / Messages
```

`OPENEMBER_ENABLE_MSGS` 默认开启，用于生成并链接 `openember-msgs` 的 Protobuf 绑定。Link 可以处理基础 `std::string` / `ByteBuffer` 消息；完整节点发现、心跳、诊断和参数服务推荐启用 Messages。

## 分层关系

推荐分层：

```text
Application / Node
  ↓
openember::core
  ↓
openember::link
  ↓
components/transport
  ↓
Zenoh / future backends
```

职责划分：

| 层 | 职责 |
|----|------|
| `openember::core` | 节点模型、生命周期、参数、诊断、调度和面向用户的节点 API |
| `openember::link` | 稳定通信语义：Topic、Service、Liveliness、消息编解码、key 规范、连接策略 |
| `components/transport` | 具体传输适配：session、publisher、subscriber、query/reply、底层错误转换 |
| `openember-msgs` | 语言无关的消息协议定义，不负责运行时通信 |

`components/transport` 可以继续以 Zenoh 为主要后端，但 Zenoh 应尽量留在 Link 以下。普通应用不应直接配置 `zenoh_mode`、`zenoh_listen` 或 `zenoh_connect`。

## 用户侧 API 草图

普通节点的初始化应该足够短：

```cpp
openember::Init("robot_001");

auto node = openember::CreateNode("talker");
```

发布 Protobuf 消息：

```cpp
auto pub = node->Advertise<openember::msgs::node::v1::NodeHeartbeat>(
    "/nodes/talker/heartbeat");

openember::msgs::node::v1::NodeHeartbeat heartbeat;
heartbeat.set_node_name("talker");

pub.Publish(heartbeat);
```

订阅 Protobuf 消息：

```cpp
auto sub = node->Subscribe<openember::msgs::node::v1::NodeHeartbeat>(
    "/nodes/talker/heartbeat",
    [](const auto& heartbeat) {
        // use heartbeat
    });
```

服务调用：

```cpp
auto client = node->CreateClient<GetParameterRequest, GetParameterResponse>(
    "/parameter/get");

auto response = client.Call(request, std::chrono::milliseconds(500));
```

服务端：

```cpp
auto service = node->CreateService<GetParameterRequest, GetParameterResponse>(
    "/parameter/get",
    [](const auto& request) {
        GetParameterResponse response;
        return response;
    });
```

Liveliness：

```cpp
auto token = node->AnnounceLiveliness();

auto watcher = node->WatchLiveliness(
    "/nodes/**",
    [](const openember::link::LivelinessEvent& event) {
        // node online/offline
    });
```

这些 API 是目标形态，用于指导后续实现。当前已有的 `CreatePublisher<T>()`、`CreateSubscriber<T>()` 可以逐步演进为更清晰的 `Advertise<T>()`、`Subscribe<T>()`，也可以保留兼容别名。

## 默认初始化

推荐提供简洁入口：

```cpp
openember::Init("robot_001");
```

它等价于使用默认运行时配置：

- 自动选择适合本机开发的通信 profile。
- 使用 OpenEmber 默认 endpoint。
- 创建全局 runtime context。
- 初始化 Link session、节点注册表和基础诊断通道。
- 启用默认连接重试策略。

高级用户可以显式配置：

```cpp
openember::RuntimeOptions options;
options.robot_id = "robot_001";
options.namespace_name = "lab";
options.link.profile = openember::link::Profile::Router;
options.link.listen = "tcp/0.0.0.0:7447";
options.link.connect = {};

openember::Init(options);
```

推荐把传输细节收敛到 `link` 配置中，而不是散落在 `ContextOptions` 顶层：

```cpp
struct RuntimeOptions {
    std::string robot_id;
    std::string namespace_name;
    link::Options link;
};

namespace link {

enum class Profile {
    Auto,
    Peer,
    Router,
    Client,
};

struct Options {
    Profile profile = Profile::Auto;
    std::string listen;
    std::string connect;
    std::chrono::milliseconds retry_interval{2000};
};

}  // namespace link
```

## 消息编解码

Link 默认支持 `openember-msgs` Protobuf 类型：

- 发布时调用 `SerializeToString()`，将结果作为二进制 payload。
- 订阅时调用 `ParseFromArray()`，失败时丢弃该消息并记录诊断事件。
- 类型名来自 Protobuf descriptor，例如 `openember.msgs.node.v1.NodeHeartbeat`。
- Zenoh key 只负责路由，消息语义由 Protobuf payload 表达。

建议提供泛型 message traits：

```cpp
template <typename T>
struct MessageTraits;
```

对 Protobuf message 自动支持：

```cpp
template <typename T>
concept ProtobufMessage =
    requires(T msg, std::string* out, const void* data, int size) {
        { msg.SerializeToString(out) } -> std::same_as<bool>;
        { msg.ParseFromArray(data, size) } -> std::same_as<bool>;
    };
```

这样用户不需要手写 `ByteBuffer` 转换。底层仍然可以保留 raw bytes API，供调试工具、桥接器或非 Protobuf payload 使用。

## Key 命名规范

Link 应统一生成和校验 key，避免业务代码拼接底层 key expression。

推荐逻辑 topic：

```text
/nodes/<node>/heartbeat
/nodes/<node>/info
/diagnostics/<node>
/logs/<node>
/parameter/<node>/get
/parameter/<node>/set
```

Link 根据运行时上下文映射到底层 key：

```text
openember/<robot_id>/<namespace>/nodes/<node>/heartbeat
```

这样应用只关心逻辑名，跨机器人、命名空间和部署环境的差异由 Link 处理。

## 可靠性与可观测

Link 应内建以下能力：

- 连接失败重试，并允许应用注入退出条件。
- 发布、订阅、服务注册失败时返回明确错误。
- 回调异常不应逃逸到底层传输线程。
- 订阅解析失败时记录消息类型、payload 大小和 topic。
- Liveliness 用于节点在线/离线感知。
- 节点周期性发布 `NodeHeartbeat`。
- 节点启动时发布 `NodeInfo`。
- 诊断事件使用 `openember.msgs.diagnostics.v1` 消息。

## 演进路径

建议分阶段实现：

1. **封装初始化**：新增 `openember::Init(robot_id)` 和 `RuntimeOptions`，把 Zenoh 配置收敛到 `link::Options`。
2. **Protobuf traits**：让 `Publisher<T>` / `Subscriber<T>` 自动支持 `openember-msgs` Protobuf 类型。
3. **Link API 命名**：引入 `Advertise<T>()`、`Subscribe<T>()`、`CreateService<Req, Resp>()`、`CreateClient<Req, Resp>()`。
4. **Liveliness**：增加 `AnnounceLiveliness()` 和 `WatchLiveliness()`。
5. **节点注册表**：基于 `NodeInfo`、`NodeHeartbeat`、liveliness 建立运行时节点发现。
6. **诊断闭环**：把连接、解析、服务超时、节点离线等事件纳入 diagnostics。

短期内可以保留 `components/transport` 的直接示例作为底层调试工具；面向用户的核心示例应逐步切换到 Link API。
