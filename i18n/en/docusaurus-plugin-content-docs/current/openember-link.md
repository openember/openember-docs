---
sidebar_position: 6
---

# OpenEmber Link

OpenEmber Link is the stable communication layer for nodes, tools, system services, and device management. Upward it provides topics, services, liveliness, node discovery, and diagnostics. Downward it hides the concrete middleware. Application code should program against OpenEmber communication semantics, not against Zenoh mode, endpoint, key expression, or session details.

## Design goals

- **Simple defaults**: an ordinary node only needs a device or robot identity to be created and to communicate.
- **Stable API**: user code depends on `openember::link` and `openember::core::Node`. The middleware underneath can evolve.
- **Protocol first**: business payloads default to Protobuf messages defined in `openember-msgs`.
- **RAII resource management**: Publisher, Subscriber, Service, Client, and Liveliness token are resource handles. Object ownership expresses lifetime.
- **Observable and reliable**: the communication layer owns connection state, reconnect policy, liveliness, diagnostic events, and error propagation.
- **Advanced configuration remains reachable**: the default API stays small, while advanced users can still set a transport profile, listen address, connect address, and QoS explicitly.

## Kconfig location

OpenEmber Link lives in the top-level communication menu:

```text
Communication / Link
```

Core option:

```kconfig
config OPENEMBER_ENABLE_LINK
    bool "Enable OpenEmber Link"
    default y
    depends on OPENEMBER_COMPONENT_TRANSPORT
```

`OPENEMBER_ENABLE_LINK` is on by default. It selects whether to build the stable user-facing communication layer. Node communication APIs in `openember::core` are carried by Link, so enabling Link also builds `openember::core`. Link depends on `components/transport`, but application code should not depend on a concrete transport backend.

Message protocol options live under:

```text
Communication / Messages
```

`OPENEMBER_ENABLE_MSGS` is on by default. It generates and links the Protobuf bindings from `openember-msgs`. Link can carry plain `std::string` and `ByteBuffer` messages. Full node discovery, heartbeat, diagnostics, and the parameter service should enable Messages.

## Layering

Recommended stack:

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

Responsibilities:

| Layer | Responsibility |
|-------|----------------|
| `openember::core` | Node model, lifecycle, parameters, diagnostics, scheduling, and the user-facing node API |
| `openember::link` | Stable communication semantics: Topic, Service, Liveliness, message codec, key rules, connection policy |
| `components/transport` | Concrete transport adapters: session, publisher, subscriber, query/reply, and low-level error translation |
| `openember-msgs` | Language-neutral message definitions. It does not implement runtime communication |

`components/transport` can keep Zenoh as its primary backend, but Zenoh should stay below Link. Ordinary applications should not set `zenoh_mode`, `zenoh_listen`, or `zenoh_connect` directly.

## User-facing API sketch

Initializing an ordinary node should stay short:

```cpp
openember::Init("robot_001");

auto node = openember::CreateNode("talker");
```

Publish a Protobuf message:

```cpp
auto pub = node->Advertise<openember::msgs::node::v1::NodeHeartbeat>(
    "/nodes/talker/heartbeat");

openember::msgs::node::v1::NodeHeartbeat heartbeat;
heartbeat.set_node_name("talker");

pub.Publish(heartbeat);
```

Subscribe to a Protobuf message:

```cpp
auto sub = node->Subscribe<openember::msgs::node::v1::NodeHeartbeat>(
    "/nodes/talker/heartbeat",
    [](const auto& heartbeat) {
        // use heartbeat
    });
```

Service call:

```cpp
auto client = node->CreateClient<GetParameterRequest, GetParameterResponse>(
    "/parameter/get");

auto response = client.Call(request, std::chrono::milliseconds(500));
```

Service server:

```cpp
auto service = node->CreateService<GetParameterRequest, GetParameterResponse>(
    "/parameter/get",
    [](const auto& request) {
        GetParameterResponse response;
        return response;
    });
```

Liveliness:

```cpp
auto token = node->AnnounceLiveliness();

auto watcher = node->WatchLiveliness(
    "/nodes/**",
    [](const openember::link::LivelinessEvent& event) {
        // node online/offline
    });
```

These APIs are the target shape and guide later implementation. Existing `CreatePublisher<T>()` and `CreateSubscriber<T>()` can move toward the clearer `Advertise<T>()` and `Subscribe<T>()`, or stay available as compatibility aliases.

## Default initialization

A short entry point is recommended:

```cpp
openember::Init("robot_001");
```

That is equivalent to the default runtime configuration:

- Pick a communication profile suitable for local development.
- Use the OpenEmber default endpoints.
- Create the global runtime context.
- Initialize the Link session, the node registry, and the basic diagnostics channel.
- Enable the default connection retry policy.

Advanced users can configure it explicitly:

```cpp
openember::RuntimeOptions options;
options.robot_id = "robot_001";
options.namespace_name = "lab";
options.link.profile = openember::link::Profile::Router;
options.link.listen = "tcp/0.0.0.0:7447";
options.link.connect = {};

openember::Init(options);
```

Keep transport details inside the `link` configuration instead of scattering them across the top level of `ContextOptions`:

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

## Message codec

Link supports `openember-msgs` Protobuf types by default:

- On publish, call `SerializeToString()` and send the result as a binary payload.
- On subscribe, call `ParseFromArray()`. On failure, drop the message and record a diagnostic event.
- The type name comes from the Protobuf descriptor, for example `openember.msgs.node.v1.NodeHeartbeat`.
- The Zenoh key only routes the message. Message semantics live in the Protobuf payload.

A generic message-traits hook is recommended:

```cpp
template <typename T>
struct MessageTraits;
```

Protobuf messages are supported automatically:

```cpp
template <typename T>
concept ProtobufMessage =
    requires(T msg, std::string* out, const void* data, int size) {
        { msg.SerializeToString(out) } -> std::same_as<bool>;
        { msg.ParseFromArray(data, size) } -> std::same_as<bool>;
    };
```

Users then do not hand-write `ByteBuffer` conversions. A raw-bytes API can still remain for debug tools, bridges, and non-Protobuf payloads.

## Key naming

Link should generate and validate keys in one place, so business code does not concatenate low-level key expressions.

Recommended logical topics:

```text
/nodes/<node>/heartbeat
/nodes/<node>/info
/diagnostics/<node>
/logs/<node>
/parameter/<node>/get
/parameter/<node>/set
```

Link maps those names onto the underlying key from the runtime context:

```text
openember/<robot_id>/<namespace>/nodes/<node>/heartbeat
```

The application only cares about the logical name. Differences across robots, namespaces, and deployments stay inside Link.

## Reliability and observability

Link should provide the following built in:

- Retry failed connections, and let the application inject an exit condition.
- Return a clear error when publish, subscribe, or service registration fails.
- Keep callback exceptions from escaping onto the transport thread.
- When subscribe parsing fails, record the message type, payload size, and topic.
- Use liveliness for node online and offline detection.
- Publish `NodeHeartbeat` periodically.
- Publish `NodeInfo` when a node starts.
- Emit diagnostic events as `openember.msgs.diagnostics.v1` messages.

## Evolution path

Implement this in stages:

1. **Wrap initialization**: add `openember::Init(robot_id)` and `RuntimeOptions`, and fold Zenoh settings into `link::Options`.
2. **Protobuf traits**: let `Publisher<T>` and `Subscriber<T>` accept `openember-msgs` Protobuf types automatically.
3. **Link API names**: introduce `Advertise<T>()`, `Subscribe<T>()`, `CreateService<Req, Resp>()`, and `CreateClient<Req, Resp>()`.
4. **Liveliness**: add `AnnounceLiveliness()` and `WatchLiveliness()`.
5. **Node registry**: build runtime node discovery from `NodeInfo`, `NodeHeartbeat`, and liveliness.
6. **Diagnostics loop**: feed connection, parse, service-timeout, and node-offline events into diagnostics.

Direct `components/transport` samples can stay for a while as low-level debug tools. User-facing core examples should move to the Link API. On a host, [Turtle Demo](./turtle-demo) (`Twist2D` / `Pose2D`, multi-process loop) is the first place to exercise Link together with msgs.
