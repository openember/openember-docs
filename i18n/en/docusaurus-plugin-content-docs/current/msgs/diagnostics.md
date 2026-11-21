---
sidebar_position: 4
---

# diagnostics/v1

Package: `openember.msgs.diagnostics.v1`  
Definition: `proto/openember/msgs/diagnostics/v1/diagnostics.proto`

Diagnostic status and health reports for tooling and operations.

## Messages

| Message | Purpose |
|---------|---------|
| `DiagnosticStatus` | One diagnostic entry (level, name, message, key/values) |
| `DiagnosticArray` | A batch of diagnostic statuses |

## Enums

| Enum | Purpose |
|------|---------|
| `DiagnosticLevel` | OK / WARN / ERROR / STALE, and similar |

Typical key: `.../diagnostics/<node>`.
