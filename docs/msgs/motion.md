---
sidebar_position: 11
---

# motion/v1

包名：`openember.msgs.motion.v1`  
定义：`proto/openember/msgs/motion/v1/motion.proto`

机器人高层运动意图：平面速度、模式、具名动作与控制权。不包含腿数、关节拓扑或策略内部状态名。完整契约见 `openember-msgs` 仓库 `docs/motion-control-contract.md`。

## 主要消息

| 消息 | 用途 |
|------|------|
| `MotionCommand` | 物理单位平面速度目标（不获取控制权、不使能） |
| `MotionRequest` / `MotionResult` | 管理 / 模式 / 动作 / 取消意图与结果 |
| `MotionCapabilities` | 支持的模式、动作、速度限值与超时 |
| `MotionState` | 当前模式、授权、使能、拒绝原因与心跳 |
| `PlanarVelocity` / `AxisLimits` | 平面速度与轴限值 |
| `CommandContext` / `MotionLease` | 身份、时钟、期限与租约 |

意图 oneof：`ControlIntent`、`ModeIntent`、`ActionIntent`、`CancelIntent`。

## 枚举（节选）

`MotionMode`、`Availability`、`Readiness`、`ActuationState`、`ControlOperation`、`ResultStatus`、`RejectionReason`、`CommandLossResponse`。

## 契约摘要

- `PlanarVelocity`：vx/vy 为 m/s，yaw_rate 为 rad/s；坐标系由能力公布的 `body_heading_frame_id` 固定。
- 速度命令三个轴始终齐全；缺少 velocity 子消息非法，全零是合法零速目标。
- 高层租约与 actuator/v2 低层租约不可互换；外部客户端不能绕过仲裁直接发关节目标。
- 可请求模式仅限能力声明的 PASSIVE / HOLD / LOCOMOTION；动作必须 `action_id` 逐字匹配。
- Protobuf 解码成功 ≠ 通过契约校验。产品侧实现见四足仓库相关 Link 控制文档。
