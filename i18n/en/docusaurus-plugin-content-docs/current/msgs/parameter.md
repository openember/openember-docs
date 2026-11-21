---
sidebar_position: 5
---

# parameter/v1

Package: `openember.msgs.parameter.v1`  
Definition: `proto/openember/msgs/parameter/v1/parameter.proto`

Runtime parameter description, get/set, and change events.

## Messages

| Message | Purpose |
|---------|---------|
| `ParameterValue` | Parameter value carrier |
| `NumericRange` | Valid numeric range |
| `ParameterDescriptor` | Parameter metadata (type, range, read-only, and so on) |
| `Parameter` | Name + value + optional descriptor |
| `GetParameterRequest` / `GetParameterResponse` | Read parameters |
| `SetParameterRequest` / `SetParameterResponse` | Write parameters |
| `ParameterEvent` | Parameter change notification |

## Enums

| Enum | Purpose |
|------|---------|
| `ParameterType` | Bool / integer / float / string, and similar |
