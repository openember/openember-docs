---
sidebar_position: 13
---

# geometry/v1

包名：`openember.msgs.geometry.v1`  
定义：`proto/openember/msgs/geometry/v1/geometry.proto`

平面几何辅助类型，供 Demo 与简单运动学使用。

## 消息

| 消息 | 用途 |
|------|------|
| `Pose2D` | 平面位姿（x, y, yaw） |
| `Twist2D` | 平面速度（vx, vy, yaw_rate） |

高层运动控制请使用 [motion/v1](./motion.md) 的 `PlanarVelocity` 与能力约束。示例见 [Turtle Demo](../turtle-demo.md)。
