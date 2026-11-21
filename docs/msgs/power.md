---
sidebar_position: 12
---

# power/v1

包名：`openember.msgs.power.v1`  
定义：`proto/openember/msgs/power/v1/power.proto`

电池 / 电源观测与类型化资源控制。完整契约见 `openember-msgs` 仓库 `docs/power-contract.md`。

## 消息

| 消息 | 用途 |
|------|------|
| `BatteryState` | 电池测量与逐字段有效性 |
| `PowerState` | 电源状态与指标 |
| `PowerCommand` | 遗留字符串信封（不是裸硬件命令通道） |
| `PowerResourceCapability` / `PowerCapabilities` | 通道 / 风扇 / 灯 / 电池能力 |
| `PowerResourceState` | 资源观测电平与有效性 |
| `PowerControlRequest` / `PowerControlResult` | 类型化控制请求与结果 |

## 枚举

`PowerAvailability`、`PowerResourceKind`、`PowerControlOutcome`、`PowerControlReason`。

## 契约摘要

- 数值零可以合法；缺省有效性标志表示未知，不是可信零。
- `receive_fresh` 是发布时评估，消费者还需自有到达期限；重复 sample sequence 不能刷新测量年龄。
- 控制请求绑定 power ID、service session、clock domain、request_id 与 deadline。
- 结果区分 Rejected / Accepted / Confirmed / Unknown；ACK 最多到 Accepted，Confirmed 需要实际反馈。
- 开启 / 关闭权限独立；`enable_requires_ready` 与 `disable_requires_ready` 是能力描述，不是已获授权证明。
