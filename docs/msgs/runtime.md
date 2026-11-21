---
sidebar_position: 8
---

# runtime/v1

包名：`openember.msgs.runtime.v1`  
定义：`proto/openember/msgs/runtime/v1/runtime.proto`

进程启动管理：规格、启停请求与进程事件。

## 消息

| 消息 | 用途 |
|------|------|
| `ProcessSpec` | 进程启动规格 |
| `ProcessInfo` | 进程当前信息 |
| `StartProcessRequest` / `StartProcessResponse` | 启动进程 |
| `StopProcessRequest` / `StopProcessResponse` | 停止进程 |
| `ProcessEvent` | 进程生命周期事件 |
| `ProcessStateSnapshot` | 进程状态快照 |

## 枚举

| 枚举 | 用途 |
|------|------|
| `ProcessState` | 进程状态 |

典型 key：`.../runtime/processes/<process>`。整机编排与状态汇总见文档中心 [启动编排与整机状态](../launch-and-system-state.md)。
