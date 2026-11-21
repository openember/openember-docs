---
sidebar_position: 3
---

# lifecycle/v1

包名：`openember.msgs.lifecycle.v1`  
定义：`proto/openember/msgs/lifecycle/v1/lifecycle.proto`

节点生命周期状态、切换命令与事件。

## 消息

| 消息 | 用途 |
|------|------|
| `LifecycleCommand` | 请求状态转换 |
| `LifecycleCommandResponse` | 命令接受 / 拒绝结果 |
| `LifecycleEvent` | 实际发生的状态转换事件 |

## 枚举

| 枚举 | 用途 |
|------|------|
| `LifecycleState` | 生命周期状态 |
| `LifecycleTransition` | 允许的转换类型 |

典型 key：`.../nodes/<node>/lifecycle`。
