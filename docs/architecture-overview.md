---
sidebar_position: 2
---

# 架构概览

OpenEmber 采用清晰的**五层**模型（依赖自上而下），便于扩展与长期维护：

1. **Application Layer** — 应用、启动脚本、示例与工具  
2. **Module Layer** — 插件式功能扩展（传输后端、驱动、算法、桥接等）  
3. **Component Layer** — 跨模块复用组件（日志、序列化、容器、配置解析等）  
4. **Core Layer** — 中间件运行时（节点生命周期、调度、话题、参数、服务等）  
5. **Platform Layer** — 操作系统抽象与 **HAL**（线程、定时器、socket、UART、GPIO、I2C 等）

目录上大致对应 `openember` 仓库中的 `apps/`、`modules/`、`components/`、`core/`、`platform/` 等（另含 `third_party/`、`configs/`、`tools/` 等工程辅助目录）。

## 依赖方向

```
apps
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

## 设计思想（摘要）

- **可扩展**：插件化模块与 Kconfig 裁剪，适配不同产品与算力。  
- **依赖管理**：`OPENEMBER_THIRD_PARTY_MODE` 等选项支持 FETCH / VENDOR / SYSTEM，兼顾离线与企业构建。  
- **通信抽象**：发布-订阅等 API 稳定，底层可切换 NNG、LCM、ZeroMQ 等实现（以项目配置为准）。

更完整的分层说明与规范见上游仓库中的 [架构设计文档](https://github.com/openember/openember/blob/main/docs/architecture/layered-architecture-design-guide.md)。
