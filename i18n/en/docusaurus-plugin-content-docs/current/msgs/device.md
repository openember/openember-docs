---
sidebar_position: 7
---

# device/v1

Package: `openember.msgs.device.v1`  
Definition: `proto/openember/msgs/device/v1/device.proto`

Device inventory and status queries (for example LPIO-side device management).

## Messages

| Message | Purpose |
|---------|---------|
| `DeviceInfo` | Static device info |
| `DeviceState` | Current device state / availability |
| `DeviceQuery` / `DeviceQueryResponse` | Device query request and response |

## Enums

| Enum | Purpose |
|------|---------|
| `DeviceCategory` | Device category |
| `DeviceAvailability` | Availability |

Typical key: `.../devices/<device>`.
