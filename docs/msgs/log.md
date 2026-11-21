---
sidebar_position: 6
---

# log/v1

包名：`openember.msgs.log.v1`  
定义：`proto/openember/msgs/log/v1/log.proto`

结构化日志记录，便于跨节点汇聚与检索。

## 消息

| 消息 | 用途 |
|------|------|
| `LogRecord` | 单条日志（级别、时间、来源、正文、键值） |
| `LogBatch` | 一批日志记录 |

## 枚举

| 枚举 | 用途 |
|------|------|
| `LogLevel` | DEBUG / INFO / WARN / ERROR 等 |

典型 key：`.../logs/<node>`。告警语义见 [alerts/v1](./alerts.md)，不要把告警逻辑塞进自由文本日志。
