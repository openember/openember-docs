---
sidebar_position: 2
---

# node/v1

Package: `openember.msgs.node.v1`  
Definition: `proto/openember/msgs/node/v1/node.proto`

Node discovery, introspection, and registry snapshots.

## Messages

| Message | Purpose |
|---------|---------|
| `TopicEndpoint` / `ServiceEndpoint` | Topic / service endpoint description |
| `NodeInfo` | Static node info (name, kind, endpoints, and so on) |
| `NodeHeartbeat` | Periodic heartbeat |
| `NodeQuery` / `NodeQueryResponse` | Node query request and response |
| `NodeRegistrySnapshot` | Full node-registry snapshot |

## Enums

| Enum | Purpose |
|------|---------|
| `NodeKind` | Node kind |
| `EndpointDirection` | Endpoint direction (publish / subscribe / service, and so on) |

## Typical Zenoh keys

```text
openember/<robot_id>/<namespace>/nodes/<node>/info
openember/<robot_id>/<namespace>/nodes/<node>/heartbeat
```

Publish `NodeInfo` when a node comes online, and publish `NodeHeartbeat` periodically.
