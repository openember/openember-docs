---
slug: why-emberlite
title: 为什么需要 EmberLite？
authors: [luhuadong]
tags: [emberlite, openember]
---

在已有 OpenEmber（以现代 C++ 为主线）的前提下，我们仍需要 **EmberLite** 这一纯 **C** 实现：在工业控制、医疗与航空航天等场景里，**确定性**、**静态内存**与 **可认证性**往往比语言表现力更重要；C 的调用与资源模型更简单，也更容易通过 MISRA C 等规范审查。

<!-- truncate -->

EmberLite 并非为了替代 ROS2 或 OpenEmber，而是为**资源受限、偏好 C 运行时**的嵌入式 Linux 设备提供轻量的节点模型与发布-订阅式消息，并与同一套 **Kconfig + CMake** 及 **`ember` CLI** 工作流对齐，降低团队在多仓库间切换的成本。

更多设计背景见主仓库说明与站内 [简介](/docs/intro)。
