---
sidebar_position: 14
---

# host/v1

Package: `openember.msgs.host.v1`  
Definition: `proto/openember/msgs/host/v1/host.proto`

Host resource observation snapshots for monitoring and diagnostics.

## Messages

| Message | Purpose |
|---------|---------|
| `CpuStats` | CPU utilization and related stats |
| `MemoryStats` | Memory statistics |
| `DiskUsage` | Disk usage |
| `HostResourceSnapshot` | Aggregated snapshot (including load) |

In OpenEmber, `services/host_monitor` publishes to logical topic `/host/resources` (Link / robot namespace adds the real prefix).
