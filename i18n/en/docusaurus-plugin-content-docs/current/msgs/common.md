---
sidebar_position: 1
---

# common/v1

Package: `openember.msgs.common.v1`  
Definition: `proto/openember/msgs/common/v1/common.proto`

Shared foundation types used across almost every domain message.

## Messages

| Message | Purpose |
|---------|---------|
| `Header` | Common header: timestamp, sequence, source instance, and related fields |
| `KeyValue` | String key/value pair |
| `Version` | Semantic version |
| `Status` | Operation result and message |
| `QosProfile` | Reliability / durability QoS description |
| `Metric` | Named metric (name, value, unit) |
| `BoolStamped` | Boolean with a `Header` (e-stop, enable switch, and similar) |

## Enums

| Enum | Purpose |
|------|---------|
| `HealthState` | Health state |
| `Reliability` | QoS reliability |
| `Durability` | QoS durability |

Field authority is the `.proto` in the `openember-msgs` repository.
