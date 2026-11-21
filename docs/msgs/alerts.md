---
sidebar_position: 15
---

# alerts/v1

包名：`openember.msgs.alerts.v1`  
定义：`proto/openember/msgs/alerts/v1/alerts.proto`

结构化告警观测、事件与发布者作用域的完整状态。独立于自由文本日志，也不规定机器人必须如何响应。完整契约见 `openember-msgs` 仓库 `docs/alerts-contract.md`。

## 消息

| 消息 | 用途 |
|------|------|
| `AlertKey` | 告警键（source / device / session / condition） |
| `AlertObservation` | 单次观测（严重度、有效性、测量与阈值等） |
| `AlertEvent` | 带 revision 的事件 |
| `AlertState` | 某 publisher instance 的完整条件集替换 |

## 枚举

| 枚举 | 用途 |
|------|------|
| `Severity` | 严重度（与响应策略解耦） |
| `Transition` | RAISED / REMINDER / CLEARED / UNKNOWN 等 |

## 契约摘要

- 零 / UNSPECIFIED 枚举不能解释为健康。
- 默认逻辑 topic：`/alerts/events`、`/alerts/state`；无跨 topic 投递顺序保证。
- `AlertState` 是单发布者实例的完整替换，不是机群级擦除。
- 消费者按 instance + revision 去重；过期或 `online=false` 表示来源不可用，不是全部条件已清除。
- C++ 绑定可广告 `OPENEMBER_ALERTS_CONTRACT_VERSION=1`。

运行时组件说明见文档中心 [通用告警组件](../alerts.md) 与 [告警事件与 Link](../alerts-link.md)。
