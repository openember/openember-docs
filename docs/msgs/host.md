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

快照扩展了主机标识、系统启动标识、服务实例、源单调采样时间、online、stale_after_ms 和各指标有效性。旧消息缺少有效性字段时，新页面显示未知。CPU 的 core_ids 与 core_usage_ratio/core_usage_valid 一一对应，保留真实核心编号。设备时间和时区来自目标主机；操作系统 uptime 与服务运行时间区分。

CPU 首次采样、无计数进展或拓扑改变时不显示为 0%；内存使用量为 MemTotal − MemAvailable，回退估算会明确标记。接收方按本地单调时钟检查到达年龄和序号进展。资源消息只用于观测，不授予设备控制权限。
