---
sidebar_position: 2
---

# OpenEmber 架构概览

OpenEmber 采用清晰的**五层**模型（依赖自上而下），便于扩展与长期维护：

1. **Application Layer** — 可执行入口与编排（产品应用、系统节点、可选服务、示例、工具）
2. **Module Layer** — 插件式功能扩展（传输后端、驱动、桥接、应用模块等）
3. **Component Layer** — 跨模块复用组件（日志、算法、序列化、容器、配置解析等）
4. **Core Layer** — 中间件运行时（节点生命周期、调度、话题、参数、服务等）
5. **Platform Layer** — 操作系统抽象与 **HAL**（线程、定时器、socket、UART、GPIO、I2C 等）

Application 在逻辑上是一层；仓库里按职责拆成多个顶层目录，而不是额外架构层：

| 目录 | 角色 |
|------|------|
| `apps/` | 产品或用户项目入口（框架自带节点不放这里） |
| `system/` | OpenEmber 自带、偏必需的系统节点 |
| `services/` | 可选 runtime 服务 |
| `examples/` | 示例与参考实现 |
| `tools/` | 开发、调试、运维工具 |

其下各层目录大致对应 `modules/`、`components/`、`core/`、`platform/`。另有 `third_party/`、`configs/` 等工程辅助目录。

## 依赖方向

```
Application（apps / system / services / examples / tools）
  ↓
modules
  ↓
components
  ↓
core
  ↓
platform
  ↓
操作系统（Linux 等）
```

上层可依赖下层，避免反向依赖，便于单独测试与替换实现（例如更换传输后端或 HAL 后端）。

组件层常用能力包括日志（[Logging](./openember-logging.md)）、[Algorithm](./openember-algorithm.md)、[Thread Pool](./openember-thread-pool.md) 等；通信层见 [OpenEmber Link](./openember-link.md)。

## 设计思想（摘要）

- **可扩展**：插件化模块与 Kconfig 裁剪，适配不同产品与算力。
- **依赖管理**：`OPENEMBER_THIRD_PARTY_MODE` 等选项支持 FETCH / VENDOR / SYSTEM，兼顾离线与企业构建。
- **通信抽象**：OpenEmber Link 提供稳定的 Topic、Service、Liveliness 和消息编解码语义，底层传输实现对应用隐藏。

更完整的分层说明见上游 [分层设计文档](https://github.com/openember/openember/blob/main/docs/architecture/layered-architecture-design-guide.md) 与 [Application 层设计指导](https://github.com/openember/openember/blob/main/docs/architecture/application-layer-design-guide.md)；通信层见 [OpenEmber Link](./openember-link.md)。
