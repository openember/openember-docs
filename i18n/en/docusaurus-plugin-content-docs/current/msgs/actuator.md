---
sidebar_position: 10
---

# actuator/v1 · v2

## actuator/v1

Package: `openember.msgs.actuator.v1`  
Definition: `proto/openember/msgs/actuator/v1/actuator.proto`

Earlier joint command / state messages. They remain buildable, but **do not** send v2 payloads on v1 topics or auto-downgrade v2 to v1.

| Message | Purpose |
|---------|---------|
| `JointCommandItem` / `JointCommand` | Joint command targets |
| `JointStateItem` / `JointState` | Joint feedback state |
| `JointControllerStatus` | Controller health / availability |

Enums: `ActuatorAvailability`, `JointControlMode`.

## actuator/v2

Package: `openember.msgs.actuator.v2`  
Definition: `proto/openember/msgs/actuator/v2/actuator.proto`

Joint-control contract v2: lease, management operations, cyclic targets, capabilities, and feedback. Full acceptance rules are in `openember-msgs` `docs/actuator-control-contract.md`.

### Main messages

| Message | Purpose |
|---------|---------|
| `CommandContext` | robot / controller / session / clock / deadline |
| `ControlLease` | Control token and generation |
| `JointTarget` / `JointCommand` | Cyclic joint targets (no enable boolean) |
| `ControlRequest` / `ControlResult` | ACQUIRE / ARM / DISARM / e-stop and related ops |
| `JointCapability` / `ControllerCapabilities` | Joint and controller capabilities |
| `JointFeedback` / `ControllerFeedback` | Feedback and status heartbeat |

Enums: `JointControlMode`, `ControllerState`, `ControlOperation`, `ControlResultCode`, `RejectionReason`.

### Contract summary

- Suggested endpoints: `<controller>/v2/capabilities`, `command`, `feedback`, `control`, and `control_result`.
- Send targets only after capabilities advertise `contract_version=2`; missing capability or fields must reject.
- The lease excludes stale commands; it is not user authentication. The access layer still limits who may acquire control.
- First edition is same-host online control: `clock_domain=host-monotonic:<boot-id>`.
- `JointCommand` must cover every joint in capabilities; no partial update; any illegal item rejects the whole command.
- CMake property `OPENEMBER_ACTUATOR_CONTRACT_VERSION=2` only proves generation, not that an HI endpoint exists.
