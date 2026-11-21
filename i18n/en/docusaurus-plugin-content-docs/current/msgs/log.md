---
sidebar_position: 6
---

# log/v1

Package: `openember.msgs.log.v1`  
Definition: `proto/openember/msgs/log/v1/log.proto`

Structured log records for cross-node aggregation and search.

## Messages

| Message | Purpose |
|---------|---------|
| `LogRecord` | One log entry (level, time, source, body, key/values) |
| `LogBatch` | A batch of log records |

## Enums

| Enum | Purpose |
|------|---------|
| `LogLevel` | DEBUG / INFO / WARN / ERROR, and similar |

Typical key: `.../logs/<node>`. Alert semantics live in [alerts/v1](./alerts.md); do not encode alert logic in free-text logs.
