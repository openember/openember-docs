---
sidebar_position: 4
---

# diagnostics/v1

包名：`openember.msgs.diagnostics.v1`  
定义：`proto/openember/msgs/diagnostics/v1/diagnostics.proto`

诊断状态与健康报告，供工具与运维侧汇总。

## 消息

| 消息 | 用途 |
|------|------|
| `DiagnosticStatus` | 单条诊断（级别、名称、消息、键值） |
| `DiagnosticArray` | 一组诊断状态 |

## 枚举

| 枚举 | 用途 |
|------|------|
| `DiagnosticLevel` | OK / WARN / ERROR / STALE 等 |

典型 key：`.../diagnostics/<node>`。
