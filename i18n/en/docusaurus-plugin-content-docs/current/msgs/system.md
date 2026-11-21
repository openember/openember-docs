---
sidebar_position: 16
---

# system/v1

Package: `openember.msgs.system.v1`  
Definition: `proto/openember/msgs/system/v1/system.proto`

Robot-morphology-independent whole-robot observation. Full text: `openember-msgs` `docs/system-state-contract.md`.

## Messages

| Message | Purpose |
|---------|---------|
| `SystemState` | Lifecycle phase, health, actuation state, alert counts, and session info |

## Enums

| Enum | Purpose |
|------|---------|
| `LifecyclePhase` | Whole-robot lifecycle phase |
| `Health` | Health level |
| `ActuationState` | Actuator arming-related state |

## Contract summary

- Default logical topic: `/system/state`; read-only snapshot service `/system/state/get` (empty request, `SystemState` reply).
- Compare sequences within `manager_session`; subscribers use local receive time and `stale_after_ms` for expiry.
- Alert counts of zero do not prove the robot has no alerts; non-empty `unavailable_sources` means missing or stale sources.
- This version is observation only; there is no whole-robot transition request or automatic stop / recover semantics.

Product orchestration: [Launch and system state](../launch-and-system-state.md).
