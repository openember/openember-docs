---
sidebar_position: 13
---

# geometry/v1

Package: `openember.msgs.geometry.v1`  
Definition: `proto/openember/msgs/geometry/v1/geometry.proto`

Planar geometry helpers for demos and simple kinematics.

## Messages

| Message | Purpose |
|---------|---------|
| `Pose2D` | Planar pose (x, y, yaw) |
| `Twist2D` | Planar twist (vx, vy, yaw_rate) |

For high-level motion control, use [motion/v1](./motion.md) `PlanarVelocity` and capability limits. See also [Turtle Demo](../turtle-demo.md).
