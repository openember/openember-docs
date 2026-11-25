---
title: 主机监测与网络管理
sidebar_position: 24
---

OpenEmber 将主机资源监测与网络管理作为可裁剪的公共系统服务。产品通过构建配置与 launch 编排选择服务，Web、CLI 和整机管理通过 Link 消费消息。

| 模块 | 职责 |
| --- | --- |
| host_monitor | 发布主机运行时间、设备时间、CPU、内存、系统信息等只读事实 |
| network_manager（规划） | 网络状态查询、授权配置和异步结果；优先适配 Linux NetworkManager D-Bus |
| launch_manager | 启动、依赖、就绪、存活与退出管理 |
| alerts | 结构化告警事件与日志 |
| system_manager | 聚合事实和告警，按产品策略管理整机状态和处置 |

主机监测复用 `openember/services/host_monitor`，不依赖 Web 或实时运控。网络操作采用独立服务，避免扫描、重连与权限问题影响基础监测。底层 core 维持通信及运行时基础。已有 `components/netdev` 提供 Linux 接口辅助操作，未来网络服务可复用合适的查询能力；受 NetworkManager 管理的连接统一经该后端配置，避免多个管理者竞争。

## 数据口径

- 首页运行时间指主机操作系统 uptime，服务重启不归零。
- 设备时间与时区由目标主机提供，不能以浏览器时间代替。
- CPU 使用率用相邻采样差值计算，首帧或计数异常显示未知；分核心保持实际 CPU ID。
- 内存使用量以总量减 MemAvailable 计算，不能把缓存全部当作已占用。
- 采集默认 1 Hz。不同指标独立标记有效性，读取失败不能显示为正常的 0%。

通过 `/host/resources` 发布 host/v1/HostResourceSnapshot。host_id、boot_id 和服务实例分别标识主机、系统启动与采集进程启动；接收方使用自己的单调时间检测消息过期和序号停滞。Web 后端只订阅、校验与缓存消息，不直接采集主机指标。

第一阶段已实现主机监测及产品首页接入，支持 x86_64 和 ARM64；网络管理后续先提供只读列表，再加入以太网、Wi-Fi 和热点配置。网络变更需有权限、请求标识、执行结果和配置回读，并区分临时应用与持久化。修改当前管理链路时应支持超时回滚，避免远程配置失败后失联。

完整实现设计见 openember 仓库 `docs/design/host-and-network-services.md`。
