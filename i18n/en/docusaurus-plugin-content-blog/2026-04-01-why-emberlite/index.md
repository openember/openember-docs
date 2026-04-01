---
slug: why-emberlite
title: Why EmberLite?
authors: [luhuadong]
tags: [emberlite, openember]
---

Even with OpenEmber (C++-first), we still need **EmberLite** in **pure C**: industrial, medical, and aerospace projects often prioritize **determinism**, **static memory**, and **certifiability** over language features. C keeps call graphs and resource usage easier to reason about and aligns well with MISRA-style rules.

<!-- truncate -->

EmberLite is not meant to replace ROS2 or OpenEmber—it gives resource-constrained embedded Linux devices a lightweight node model and pub/sub messaging while staying on the same **Kconfig + CMake** and **`ember` CLI** workflow, so teams can switch repos without relearning tooling.

Read more in the [Introduction](/docs/intro).
