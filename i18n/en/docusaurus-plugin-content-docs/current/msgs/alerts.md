---
sidebar_position: 15
---

# alerts/v1

Package: `openember.msgs.alerts.v1`  
Definition: `proto/openember/msgs/alerts/v1/alerts.proto`

Structured alert observations, events, and publisher-scoped full state. Independent of free-text logs and does not prescribe robot response. Full contract: `openember-msgs` `docs/alerts-contract.md`.

## Messages

| Message | Purpose |
|---------|---------|
| `AlertKey` | Alert key (source / device / session / condition) |
| `AlertObservation` | One observation (severity, validity, measurements, thresholds, and so on) |
| `AlertEvent` | Event with a revision |
| `AlertState` | Full condition-set replacement for one publisher instance |

## Enums

| Enum | Purpose |
|------|---------|
| `Severity` | Severity (decoupled from response policy) |
| `Transition` | RAISED / REMINDER / CLEARED / UNKNOWN, and similar |

## Contract summary

- Zero / UNSPECIFIED enums must not be read as healthy.
- Default logical topics: `/alerts/events`, `/alerts/state`; no cross-topic delivery ordering.
- `AlertState` replaces one publisher instance's set; it is not a fleet-wide erase.
- Consumers dedupe by instance + revision; expiry or `online=false` means the source is unavailable, not that every condition cleared.
- C++ bindings may advertise `OPENEMBER_ALERTS_CONTRACT_VERSION=1`.

Runtime component docs: [Alerts](../alerts.md) and [Alerts and Link](../alerts-link.md).
