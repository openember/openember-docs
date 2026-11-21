---
sidebar_position: 9
---

# sensor/v1

包名：`openember.msgs.sensor.v1`  
定义：`proto/openember/msgs/sensor/v1/sensor.proto`

传感器样本与状态。IMU 含兼容扩展字段；通用标量用 `ScalarSample`。

## 消息

| 消息 | 用途 |
|------|------|
| `Vector3` / `Quaternion` | 三维向量与四元数 |
| `ImuSample` | IMU 样本（加速度、角速度、磁场、姿态等） |
| `TemperatureSample` | 温度样本 |
| `ScalarSample` | 通用单标量：`quantity` + `value` + `unit` |
| `GnssFix` | GNSS 定位解 |
| `SensorStatus` | 传感器可用性 / 状态 |

## 枚举

| 枚举 | 用途 |
|------|------|
| `SensorType` | 传感器类型 |
| `SensorAvailability` | 可用性 |
| `GnssFixType` | GNSS 解类型 |

## 契约要点（IMU）

完整规则见 `openember-msgs` 仓库 `docs/imu-contract.md`。摘要：

- 保留字段 1–9，追加 10–19（姿态有效性、坐标系、接收时钟域等），不递增包版本。
- 数值零 ≠ 有效；各测量通道有独立 `*_valid`。
- `receive_time_monotonic_ns` 是样本进入生产者的接收时间，重复发布不得刷新。
- 跨主机不能直接相减 monotonic；用本机超时与序号进展判断新鲜度。
- CMake 能力标记 `OPENEMBER_IMU_CONTRACT_VERSION=1` 表示包含该扩展。
