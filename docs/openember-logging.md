---
sidebar_position: 8
---

# OpenEmber Logging

`components/logging` 是 OpenEmber 的进程内日志组件。C++ 主线 API 为 `openember::logging::Logger`；业务代码继续使用 `LOG_*` / `OE_LOG_*` 宏。

EmberLite 另有独立的轻量 C 实现：`ember/log.h`（builtin stderr，无 spdlog）。

## 设计要点

- **C++ 优先**：`Logger` + `LoggerConfig` 为进程内主 API，组件名保持 `logging`。
- **宏兼容**：`LOG_I` 等仍可用，底层走进程默认 `Logger`。
- **Sinks**：stdout、滚动文件、syslog、Link topic（可选）。
- **不作为 Platform 依赖**：OSAL/LPIO 不调用本组件；C ABI（`oe_log_*`）仅为遗留 C 翻译单元保留。
- **与 `services/logger` 分离**：后者是读日志文件并提供 HTTP API 的服务进程，不是本库。

## 头文件

```bash
components/logging/include/openember/logging/logger.hpp
components/logging/include/openember/logging/log.hpp      # C++ 主入口（LOG_* + Logger）
components/logging/include/openember/logging/log_c.h      # 仅 C 翻译单元
```

`openember.h` 在 C++ 下包含 `log.hpp`，在 C 下包含 `log_c.h`。请勿再使用已删除的 `core/inc/openember/log.h` / `log_c.h` / `log_wrapper.h`。

## 用法

```cpp
#include "openember/logging/log.hpp"

openember::logging::init("my_node");
LOG_I("hello %d", 42);

auto& log = openember::logging::default_logger();
log.info("structured path");

openember::logging::deinit();
```

自定义配置：

```cpp
auto cfg = openember::logging::LoggerConfig::from_build_defaults("my_node");
cfg.enable_topic = false;
cfg.log_level = "debug";
openember::logging::init(std::move(cfg));
```

Kconfig 中的 `OPENEMBER_SPDLOG_*` 仍作为 `from_build_defaults()` 的编译期默认值。

## EmberLite

```c
#include "ember/log.h"

#define EMBER_LOG_TAG "hal"
ember_log_init("demo");
EMBER_LOGI("ready");
ember_log_deinit();
```

目标库：`ember_logging`（`OPENEMBER_ENABLE_LOGGING`）。
