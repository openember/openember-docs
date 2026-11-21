---
sidebar_position: 11
---

# motion/v1

Package: `openember.msgs.motion.v1`  
Definition: `proto/openember/msgs/motion/v1/motion.proto`

High-level motion intent: planar velocity, modes, named actions, and control ownership. It does not encode leg count, joint topology, or internal policy state names. Full contract: `openember-msgs` `docs/motion-control-contract.md`.

## Main messages

| Message | Purpose |
|---------|---------|
| `MotionCommand` | Physical planar velocity target (does not acquire control or arm) |
| `MotionRequest` / `MotionResult` | Management / mode / action / cancel intent and result |
| `MotionCapabilities` | Supported modes, actions, velocity limits, and timeouts |
| `MotionState` | Current mode, lease, arming, rejection reasons, and heartbeat |
| `PlanarVelocity` / `AxisLimits` | Planar velocity and per-axis limits |
| `CommandContext` / `MotionLease` | Identity, clock, deadline, and lease |

Intent oneof: `ControlIntent`, `ModeIntent`, `ActionIntent`, `CancelIntent`.

## Enums (selected)

`MotionMode`, `Availability`, `Readiness`, `ActuationState`, `ControlOperation`, `ResultStatus`, `RejectionReason`, `CommandLossResponse`.

## Contract summary

- `PlanarVelocity`: vx/vy in m/s, yaw_rate in rad/s; frame fixed by the advertised `body_heading_frame_id`.
- Velocity commands always carry all three axes; a missing velocity submessage is illegal; all zeros is a valid zero-speed target.
- High-level leases are not interchangeable with actuator/v2 low-level leases; clients must not bypass arbitration with joint targets.
- Requestable modes are only PASSIVE / HOLD / LOCOMOTION when declared by capabilities; actions require an exact `action_id` match.
- Successful Protobuf decode is not the same as passing contract checks. Product Link control docs live in the quadruped repository.
