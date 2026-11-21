---
sidebar_position: 2
---

# node/v1

包名：`openember.msgs.node.v1`  
定义：`proto/openember/msgs/node/v1/node.proto`

节点发现、自省与注册表快照。

## 消息

| 消息 | 用途 |
|------|------|
| `TopicEndpoint` / `ServiceEndpoint` | Topic / Service 端点描述 |
| `NodeInfo` | 节点静态信息（名称、类型、端点列表等） |
| `NodeHeartbeat` | 周期性心跳 |
| `NodeQuery` / `NodeQueryResponse` | 节点查询请求与响应 |
| `NodeRegistrySnapshot` | 节点注册表完整快照 |

## 枚举

| 枚举 | 用途 |
|------|------|
| `NodeKind` | 节点种类 |
| `EndpointDirection` | 端点方向（发布 / 订阅 / 服务等） |

## 典型 Zenoh key

```text
openember/<robot_id>/<namespace>/nodes/<node>/info
openember/<robot_id>/<namespace>/nodes/<node>/heartbeat
```

节点上线时发布 `NodeInfo`，并周期性发布 `NodeHeartbeat`。
