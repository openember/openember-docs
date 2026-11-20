---
sidebar_position: 6
---

# OpenEmber Algorithm

`components/algorithm` is OpenEmber's lightweight general-purpose algorithm library for the high-frequency primitives used in intelligent devices, robots, and edge runtimes.

It is a basic toolbox for sensor processing, control helpers, diagnostic statistics, and protocol checks. It is not a large, general algorithm platform.

## Design principles

- **Lightweight, no extra dependencies**: C++ standard library only. No Eigen, OpenCV, PCL, or similar heavy libraries.
- **Fit for a real-time loop**: filters and statistics keep internal state. The `update()` path avoids unnecessary dynamic allocation.
- **Templates first**: generic filters and sliding statistics are templates over `float`, `double`, integers, and `std::array<T, N>`.
- **Component-level scope**: only primitives reused across nodes and modules belong here. Domain algorithms such as SLAM, path planning, and vision belong in a module or the application.
- **Small API**: prefer small objects and pure functions that node code can compose directly.

## Current API

Public headers:

```bash
components/algorithm/include/openember/algorithm/
```

Main headers:

```bash
algorithm.hpp   # umbrella header
filter.hpp      # filters: MovingAverage / ExponentialMovingAverage / LowPassFilter / MedianFilter / OutlierRejector / Hysteresis
statistics.hpp  # statistics: SlidingWindow / MinMax / MeanVariance / RateCounter / FrequencyEstimator
control.hpp     # control helpers: clamp / Saturation / Deadband / SlewRateLimiter / PID
signal.hpp      # signal helpers: map_range / normalize / rescale / threshold / EdgeDetector
checksum.hpp    # checks: XOR / SUM8 / CRC8 / CRC16-MODBUS / CRC16-CCITT-FALSE / CRC32
```

## Examples

```cpp
#include "openember/algorithm/algorithm.hpp"

openember::algorithm::MovingAverage<float, 8> filter;
float filtered = filter.update(raw_value);
```

`std::array<T, N>` fits fixed-dimension sensor data:

```cpp
openember::algorithm::MovingAverage<std::array<double, 3>, 4> accel_filter;
auto accel = accel_filter.update({0.1, 0.0, 9.8});
```

Helpers in a control loop:

```cpp
openember::algorithm::PID<double> pid({1.0, 0.02, 0.01}, -10.0, 10.0);
double output = pid.update(target, measured, dt_s);

openember::algorithm::SlewRateLimiter<double> limiter(0.5);
double command = limiter.update(target_command, dt_s);
```

Protocol check:

```cpp
auto crc = openember::algorithm::crc16_modbus(frame.data(), frame.size());
```

## CRC and MD5

CRC belongs in OpenEmber Algorithm. It is common on UART, RS485, CAN, sensor frames, and firmware metadata. The library currently provides CRC8, CRC16/MODBUS, CRC16/CCITT-FALSE, and CRC32.

MD5 is not part of `components/algorithm` for now. It is closer to a hash or digest, and it is a poor integrity scheme for a new system. If file digests or security checks are needed later, put modern algorithms such as SHA-256 in a separate `crypto` or `hash` component.

## Extension boundary

A good fit for Algorithm:

- Sensor front-end: filtering, outlier rejection, debounce, hysteresis
- Control helpers: PID, saturation, deadband, slew limiting, soft start
- Runtime statistics: sliding mean, variance, frequency estimate, rate counters
- Protocol basics: CRC, XOR, SUM, and other lightweight checks

A poor fit for Algorithm:

- SLAM, navigation planning, point-cloud registration
- Image processing and machine vision
- Machine-learning inference
- Device algorithms tightly bound to one product

Those belong in `modules/`, a dedicated component, or the user application.
