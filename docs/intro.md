---
sidebar_position: 1
---

# OpenEmber 是什么？

**OpenEmber** 是面向机器人与智能设备的运行时（Runtime）软件框架，运行在 Linux 之上，提供统一的通信骨架、硬件抽象层（HAL）与节点运行机制，帮助开发者构建分布式嵌入式智能系统。

核心特点：

- **分布式架构**：与 ROS2 类似，节点之间可通过“发布-订阅”等方式通信，模块可部署在不同硬件（含异构多核）上。
- **分层设计**：应用 → 模块 → 组件 → 核心 → 平台（OS 抽象 + HAL），便于裁剪与扩展。
- **构建体系**：Kconfig + CMake + FetchContent，支持第三方依赖的 FETCH / VENDOR / SYSTEM 等策略。
- **语言策略**：以现代 C++ 为主线实现核心能力，并通过稳定的 C ABI 边界提供有针对性的 C 接入能力。

## EmberLite

**EmberLite** 是与 OpenEmber 相似的纯 C 语言实现的轻量级框架，面向资源更受限的嵌入式 Linux 场景，同样支持多节点与发布-订阅式消息，但运行时与依赖更精简，适合工业控制、高确定性或需符合 MISRA 等规范（虽然我们并不保证）的项目。

## ember 工具链

**openember-cli** 仓库提供独立的 **`ember`** 命令行工具，供 OpenEmber、EmberLite 等工程共用。它负责调用各工程内的 **Kconfig / CMake 入口脚本**，实现 `menuconfig`、`genconfig`、`build` 等统一工作流；具体功能开关由各仓库的 `Kconfig` 与 `CMakeLists.txt` 决定。

典型用法是在**工程根目录**执行：

```bash
./scripts/ember build
```

详细构建步骤见 [构建 OpenEmber](./build-openember.md) 与 [构建 EmberLite](./build-emberlite.md)，命令说明见 [ember CLI](./cli-ember.md)。

## 仓库与文档

| 内容 | 说明 |
|------|------|
| [openember](https://github.com/openember/openember) | 主框架（C++ 核心 + 模块与示例） |
| [emberlite](https://github.com/openember/emberlite) | 纯 C 轻量框架与 HAL 示例 |
| [openember-cli](https://github.com/openember/openember-cli) | `ember` CLI 与 Bash 补全 |
| [openember-docs](https://github.com/openember/openember-docs) | 本站文档源码 |

## 下一步

- 了解分层结构：[架构概览](./architecture-overview.md)
- 构建主仓库：[构建 OpenEmber](./build-openember.md)
- 构建轻量仓库：[构建 EmberLite](./build-emberlite.md)
