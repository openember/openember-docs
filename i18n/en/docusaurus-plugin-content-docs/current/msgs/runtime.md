---
sidebar_position: 8
---

# runtime/v1

Package: `openember.msgs.runtime.v1`  
Definition: `proto/openember/msgs/runtime/v1/runtime.proto`

Process launch management: specs, start/stop requests, and process events.

## Messages

| Message | Purpose |
|---------|---------|
| `ProcessSpec` | Process launch specification |
| `ProcessInfo` | Current process info |
| `StartProcessRequest` / `StartProcessResponse` | Start a process |
| `StopProcessRequest` / `StopProcessResponse` | Stop a process |
| `ProcessEvent` | Process lifecycle event |
| `ProcessStateSnapshot` | Process state snapshot |

## Enums

| Enum | Purpose |
|------|---------|
| `ProcessState` | Process state |

Typical key: `.../runtime/processes/<process>`. For whole-robot orchestration, see [Launch and system state](../launch-and-system-state.md).
