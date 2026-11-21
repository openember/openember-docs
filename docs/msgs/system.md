---
sidebar_position: 16
---

# system/v1

包名：`openember.msgs.system.v1`  
定义：`proto/openember/msgs/system/v1/system.proto`

与机器人形态无关的整机观测协议。完整说明见 `openember-msgs` 仓库 `docs/system-state-contract.md`。

## 消息

| 消息 | 用途 |
|------|------|
| `SystemState` | 生命周期阶段、健康、执行器状态、告警计数与会话信息 |

## 枚举

| 枚举 | 用途 |
|------|------|
| `LifecyclePhase` | 整机生命周期阶段 |
| `Health` | 健康程度 |
| `ActuationState` | 执行器使能相关状态 |

## 契约摘要

- 默认逻辑 topic：`/system/state`；只读快照服务 `/system/state/get`（请求体空，回复 `SystemState`）。
- `manager_session` 内比较序号；订阅方用本地接收时间与 `stale_after_ms` 判断过期。
- 告警计数为零 ≠ 整机无告警；`unavailable_sources` 非空表示有缺失或过期来源。
- 本版只有观测，没有整机状态转换请求或自动停机 / 恢复语义。

产品侧编排见 [启动编排与整机状态](../launch-and-system-state.md)。
