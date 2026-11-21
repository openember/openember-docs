---
sidebar_position: 14
---

# host/v1

包名：`openember.msgs.host.v1`  
定义：`proto/openember/msgs/host/v1/host.proto`

主机资源观测快照，供监控与诊断使用。

## 消息

| 消息 | 用途 |
|------|------|
| `CpuStats` | CPU 使用率等 |
| `MemoryStats` | 内存统计 |
| `DiskUsage` | 磁盘用量 |
| `HostResourceSnapshot` | 汇总快照（含负载等） |

OpenEmber 中由 `services/host_monitor` 发布到逻辑 topic `/host/resources`（实际前缀由 Link / robot namespace 添加）。
