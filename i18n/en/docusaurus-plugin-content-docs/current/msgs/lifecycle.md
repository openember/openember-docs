---
sidebar_position: 3
---

# lifecycle/v1

Package: `openember.msgs.lifecycle.v1`  
Definition: `proto/openember/msgs/lifecycle/v1/lifecycle.proto`

Node lifecycle state, transition commands, and events.

## Messages

| Message | Purpose |
|---------|---------|
| `LifecycleCommand` | Request a state transition |
| `LifecycleCommandResponse` | Accept / reject result for a command |
| `LifecycleEvent` | Event for a transition that actually occurred |

## Enums

| Enum | Purpose |
|------|---------|
| `LifecycleState` | Lifecycle state |
| `LifecycleTransition` | Allowed transition type |

Typical key: `.../nodes/<node>/lifecycle`.
