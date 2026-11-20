---
sidebar_position: 2.8
---

# 启动编排与整机状态

OpenEmber 将进程生命周期和产品状态分开管理。默认由 launch_manager 创建本机 Link router，普通节点以 client 接入；独立调试程序可以自行创建 router。整机状态管理是独立服务，通用聚合组件位于 components/system_state，机型规则和执行逻辑由产品工程提供。

## 启动与就绪

launch YAML 支持进程参数、环境变量、工作目录、依赖列表、就绪期限、退出期限和重启策略。`depends_on` 引用节点名称，缺失、重复和循环依赖在启动前拒绝；文件声明顺序无需等同于执行顺序。

```yaml
nodes:
  - name: service
    command: ${openember.bin}/my_service
    readiness: notify
    startup_timeout_ms: 10000
    shutdown_timeout_ms: 5000
    restart: on-failure
    restart_limit: 3
  - name: client
    command: ${openember.bin}/my_client
    depends_on: [service]
    readiness: notify
    startup_timeout_ms: 5000
```

应用初始化资源并注册端点后调用 `<openember/launch.hpp>` 中的 `openember::launch::NotifyReady()`；监督器通过私有继承 socket 接收一次性通知后，才启动依赖者。没有监督器时该函数直接成功。默认 `readiness: process` 兼容旧配置，只表示进程创建，不表示应用初始化完成。就绪通知、持续心跳、业务健康和运动使能是不同概念。

依赖异常退出时停止其消费者，恢复后重新创建消费者；关闭时等待消费者退出再关闭提供者。重启使用递增退避和次数限制，恢复进程不恢复运动授权。超时会优雅终止并在关闭期限后强制结束；程序自行 daemonize 和子孙进程组管理不在当前实现范围内。OS 可负责恢复 launch_manager，但不应同时直接监督它管理的子进程。

路径支持 `${openember.bin}`、`${launch.dir}`、`${env:NAME}`，缺失或空环境变量会报错，不调用 shell。配置属于运行期 YAML；构建哪些组件仍由 Kconfig/CMake 决定，见[配置方式](configuration.md)。

## 整机状态

`OPENEMBER_COMPONENT_SYSTEM_STATE` 启用通用单线程聚合组件 `openember::system_state`。它接收产品适配后的观测，不依赖 Link 或运动模型，也不直接操作硬件。公共 system/v1/SystemState 将整机状态分成三个维度：

| 维度 | 状态 |
| --- | --- |
| 生命周期 | 初始化、待机、运行、挂起、恢复、关闭 |
| 健康程度 | 未知、正常、告警、降级、故障 |
| 执行器状态 | 未知、未使能、已使能、急停 |

运行与告警可以同时存在，健康正常也不代表具有控制权。整机服务订阅结构化[告警事件和快照](alerts-link.md)，完整快照恢复当前状态，事件用于及时更新；事件缺口、快照过期、发布者离线或未知条件都不能推断健康。发布者重启建立新实例，退出实例的迟到消息不能覆盖新状态。

产品配置按 source/code 选择 observe、degrade、fault 健康映射。默认 WARNING 映射告警，ERROR 映射降级；故障需要明确规则。第一版这些规则只改变健康结论，不自动停机。后续整机请求、权限、动作上下文、停止确认和人工恢复会由产品状态机接入；motion 与 HI 继续保留本地保护。

## 四足产品入口

openember-quadruped 的 `products/quadruped-host/simulation.launch.yaml` 编排统一 router、motion、只读 system_manager 与 F710，默认 launch.yaml 保持不变。启用 `QUADRUPED_BUILD_SYSTEM_MANAGER` 后提供 `quadruped_system_manager` 与 `quadruped_system_monitor`，前者必须使用独立 observe 凭据，只读查询 motion 并聚合告警。

状态逻辑 topic 为 `/system/state`，快照端点 `/system/state/get`。消费者必须结合 manager_session、序号、online 与 stale_after_ms，不能永久保留最后一条正常状态。当前没有跨网络的状态认证或整机状态转换协议。

产品构建、凭据准备和启动步骤见产品仓 `docs/simulation-bringup.md`；框架实现契约位于核心仓 `docs/design/launch-readiness-and-dependencies.md` 和 `docs/design/system-state-manager.md`。独立本机测试覆盖延迟就绪、依赖故障、逆序关闭、告警缺口与发布者重启、真实 MuJoCo 服务重启后保持未使能；没有测试开机启动或真实硬件保护。
