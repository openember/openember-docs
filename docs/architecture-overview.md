---
sidebar_position: 2
---

# OpenEmber 架构概览

OpenEmber 当前采用清晰的**四层**模型（依赖自上而下），便于扩展与长期维护：

1. **Application Layer** — 可执行入口与编排（产品应用、系统节点、可选服务、示例、工具）
2. **Middleware Layer** — 通信与核心运行时（Link、消息协议、节点生命周期、调度、参数、服务等）
3. **Components Layer** — 跨模块复用组件（日志、算法、序列化、容器、配置解析等）
4. **Platform Layer** — 操作系统抽象与平台 I/O（线程、定时器、socket、UART、GPIO、I2C 等）

Application 在逻辑上是一层；仓库里按职责拆成多个顶层目录，而不是额外架构层：

| 目录 | 角色 |
|------|------|
| `apps/` | 产品或用户项目入口（框架自带节点不放这里；`turtle_demo` 见 [Turtle Demo](./turtle-demo.md)；规划中的巡游小车 / 智慧农业站见 [Rover Demo](./rover-demo.md)、[Agri Station Demo](./agri-station-demo.md)；`smart_device_demo` 保留为最小产品入口参考） |
| `system/` | OpenEmber 自带、偏必需的系统节点 |
| `services/` | 可选 runtime 服务 |
| `examples/` | 示例与参考实现 |
| `tools/` | 开发、调试、运维工具 |

其下各层目录大致对应 `communication/`、`core/`、`components/`、`platform/`。另有 `third_party/`、`configs/` 等工程辅助目录。

在 `menuconfig` 中，顶层菜单按工程使用体验做了收敛：

```text
Build / Toolchain
Application Layer
Middleware Layer
Components Layer
Platform Layer
Third party
Tests
```

其中 `Application Layer` 聚合 `apps/`、`system/`、`services/`、`examples/`、`tools/`。
`Middleware Layer` 聚合通信与核心运行时配置，例如 `Communication`、`Core Runtime`。

## 产品工程与框架的边界

可以直接在 OpenEmber 源码树中开发，也可以由独立产品仓拥有顶层 CMake、Kconfig、应用、服务与型号配置，通过 `add_subdirectory(openember)` 引用框架。独立模式下，上表目录描述框架仓本身，产品拥有自己的 `apps/`、`packages/`、`modules/` 和 `products/`。依赖方向为产品 → 框架公开接口，框架不依赖某个产品的驱动或业务。

第三种规划模式为安装 SDK 后开发：产品通过 `find_package(OpenEmber)` 使用已安装的公共头文件和库，独立构建，无需嵌入框架源码。当前继续推荐软链加源码一起编译；SDK 安装与导出能力暂不实施。

选择方式与操作步骤见 [创建你的第一个产品](./product-quickstart.md)。

## 依赖方向

```
Application（apps / system / services / examples / tools）
  ↓
middleware（communication / core）
  ↓
components
  ↓
platform
  ↓
操作系统（Linux 等）
```

上层可依赖下层，避免反向依赖，便于单独测试与替换实现（例如更换传输后端或 HAL 后端）。

组件层常用能力包括日志（[Logging](./openember-logging.md)）、[Algorithm](./openember-algorithm.md)、[Thread Pool](./openember-thread-pool.md) 等；通信层见 [OpenEmber Link](./openember-link.md)。

## 检测与响应的职责

设备反馈检测、行为响应和动作执行分别建模。检测模块报告可解释的状态与事件，产品策略根据当前动作、控制权和能力决定提示、降级、恢复或请求故障锁存；单一倾角、温度或误差阈值不直接绑定所有产品的统一响应。底层能力与授权等独立约束继续执行，详见[检测、响应与恢复](./detection-and-response)。

## 设计思想（摘要）

- **可扩展**：插件化模块与 Kconfig 裁剪，适配不同产品与算力。
- **依赖管理**：`OPENEMBER_THIRD_PARTY_MODE` 等选项支持 FETCH / VENDOR / SYSTEM，兼顾离线与企业构建。
- **通信抽象**：OpenEmber Link 提供稳定的 Topic、Service、Liveliness 和消息编解码语义，底层传输实现对应用隐藏。

更完整的分层说明见上游 [分层设计文档](https://github.com/openember/openember/blob/main/docs/architecture/layered-architecture-design-guide.md) 与 [Application 层设计指导](https://github.com/openember/openember/blob/main/docs/architecture/application-layer-design-guide.md)；通信层见 [OpenEmber Link](./openember-link.md)。

启动编排、统一 Link router 和整机状态服务的职责与当前边界见[启动编排与整机状态](launch-and-system-state.md)。
