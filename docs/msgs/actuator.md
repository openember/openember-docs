---
sidebar_position: 10
---

# actuator/v1 · v2

## actuator/v1

包名：`openember.msgs.actuator.v1`  
定义：`proto/openember/msgs/actuator/v1/actuator.proto`

早期关节命令 / 状态消息。仍可生成与链接，但**不得**把 v2 载荷发到 v1 topic，也不可自动降级。

| 消息 | 用途 |
|------|------|
| `JointCommandItem` / `JointCommand` | 关节目标命令 |
| `JointStateItem` / `JointState` | 关节反馈状态 |
| `JointControllerStatus` | 控制器健康 / 可用性 |

枚举：`ActuatorAvailability`、`JointControlMode`。

## actuator/v2

包名：`openember.msgs.actuator.v2`  
定义：`proto/openember/msgs/actuator/v2/actuator.proto`

关节控制契约 v2：租约、管理操作、周期目标、能力与反馈。完整验收规则见 `openember-msgs` 仓库 `docs/actuator-control-contract.md`。

### 主要消息

| 消息 | 用途 |
|------|------|
| `CommandContext` | robot / controller / session / 时钟 / 期限 |
| `ControlLease` | 控制权 token 与世代 |
| `JointTarget` / `JointCommand` | 周期关节目标（无 enable 布尔） |
| `ControlRequest` / `ControlResult` | ACQUIRE / ARM / DISARM / 急停等管理操作 |
| `JointCapability` / `ControllerCapabilities` | 关节与控制器能力 |
| `JointFeedback` / `ControllerFeedback` | 反馈与状态心跳 |

枚举：`JointControlMode`、`ControllerState`、`ControlOperation`、`ControlResultCode`、`RejectionReason`。

### 契约摘要

- 建议端点：`<controller>/v2/capabilities`、`command`、`feedback`、`control` 与 `control_result`。
- 能力公布 `contract_version=2` 后才可发目标；无能力或字段缺失一律拒绝。
- 租约排除旧命令，不是用户认证；接入层仍须限制谁能获取控制权。
- 首版同机在线控制：`clock_domain=host-monotonic:<boot-id>`。
- `JointCommand` 必须覆盖能力中全部关节，无 partial update；任一项非法则整条拒绝。
- CMake 属性 `OPENEMBER_ACTUATOR_CONTRACT_VERSION=2` 只证明消息可生成，不证明 HI 已实现端点。

`JointCapability.hardware_effort_limit_supported` 表示后端能否设置设备侧总力矩上限；缺省为 false。MIT 可以在电机内环执行，`max_effort` 作为目标预算仍参与准入和监测，但没有硬件限幅能力时，前馈限幅、发送前合力矩估计及反馈超限停止不能保证内环瞬时总力矩不超预算。需要硬件总力矩保证的应用须根据该能力选择后端。
