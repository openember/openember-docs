---
sidebar_position: 1
---

# common/v1

包名：`openember.msgs.common.v1`  
定义：`proto/openember/msgs/common/v1/common.proto`

跨域共享的基础类型，几乎所有业务消息都会引用其中一部分。

## 消息

| 消息 | 用途 |
|------|------|
| `Header` | 通用消息头：时间戳、序号、来源实例等 |
| `KeyValue` | 字符串键值对 |
| `Version` | 语义化版本 |
| `Status` | 操作结果与说明 |
| `QosProfile` | 可靠性 / 持久性等 QoS 描述 |
| `Metric` | 命名指标（名称、数值、单位） |
| `BoolStamped` | 带 `Header` 的布尔值（急停、使能开关等） |

## 枚举

| 枚举 | 用途 |
|------|------|
| `HealthState` | 健康状态 |
| `Reliability` | QoS 可靠性 |
| `Durability` | QoS 持久性 |

权威字段以 `openember-msgs` 仓库中的 `.proto` 为准。
