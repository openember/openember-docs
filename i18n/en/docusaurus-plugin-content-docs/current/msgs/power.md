---
sidebar_position: 12
---

# power/v1

Package: `openember.msgs.power.v1`  
Definition: `proto/openember/msgs/power/v1/power.proto`

Battery / power observation and typed resource control. Full contract: `openember-msgs` `docs/power-contract.md`.

## Messages

| Message | Purpose |
|---------|---------|
| `BatteryState` | Battery measurements with per-field validity |
| `PowerState` | Power state and metrics |
| `PowerCommand` | Legacy string envelope (not a raw hardware escape hatch) |
| `PowerResourceCapability` / `PowerCapabilities` | Channel / fan / light / battery capabilities |
| `PowerResourceState` | Observed resource level with validity |
| `PowerControlRequest` / `PowerControlResult` | Typed control request and result |

## Enums

`PowerAvailability`, `PowerResourceKind`, `PowerControlOutcome`, `PowerControlReason`.

## Contract summary

- Numeric zero can be valid; missing validity flags mean unknown, not a trusted zero.
- `receive_fresh` is the producer's assessment at publish time; consumers still need their own arrival deadline; duplicate sample sequences must not renew measurement age.
- Control requests bind power ID, service session, clock domain, request_id, and deadline.
- Outcomes distinguish Rejected / Accepted / Confirmed / Unknown; an ACK alone is at most Accepted; Confirmed needs actual feedback.
- Enable and disable authorization are independent; `enable_requires_ready` and `disable_requires_ready` describe capability, not proof of authorization.
