---
sidebar_position: 8
---

# OpenEmber Logging

`components/logging` is OpenEmber's in-process logging component. The C++ API is `openember::logging::Logger`. Application code keeps using the `LOG_*` and `OE_LOG_*` macros.

EmberLite has a separate lightweight C implementation: `ember/log.h` (builtin stderr, no spdlog).

## Design points

- **C++ first**: `Logger` and `LoggerConfig` are the in-process API. The component name stays `logging`.
- **Macro compatible**: `LOG_I` and the rest still work. They go through the process default `Logger`.
- **Sinks**: stdout, rotating file, syslog, and an optional Link topic.
- **Not a Platform dependency**: OSAL and LPIO do not call this component. The C ABI (`oe_log_*`) is kept only for legacy C translation units.
- **Separate from `services/logger`**: that service reads log files and exposes an HTTP API. It is not this library.

## Headers

```bash
components/logging/include/openember/logging/logger.hpp
components/logging/include/openember/logging/log.hpp      # C++ entry (LOG_* + Logger)
components/logging/include/openember/logging/log_c.h      # C translation units only
```

`openember.h` includes `log.hpp` for C++ and `log_c.h` for C. Do not use the removed `core/inc/openember/log.h`, `log_c.h`, or `log_wrapper.h`.

## Usage

```cpp
#include "openember/logging/log.hpp"

openember::logging::init("my_node");
LOG_I("hello %d", 42);

auto& log = openember::logging::default_logger();
log.info("structured path");

openember::logging::deinit();
```

Custom configuration:

```cpp
auto cfg = openember::logging::LoggerConfig::from_build_defaults("my_node");
cfg.enable_topic = false;
cfg.log_level = "debug";
openember::logging::init(std::move(cfg));
```

The `OPENEMBER_SPDLOG_*` Kconfig symbols remain the compile-time defaults for `from_build_defaults()`.

## EmberLite

```c
#include "ember/log.h"

#define EMBER_LOG_TAG "hal"
ember_log_init("demo");
EMBER_LOGI("ready");
ember_log_deinit();
```

Library target: `ember_logging` (`OPENEMBER_ENABLE_LOGGING`).
