---
sidebar_position: 6
---

# OpenEmber Algorithm

`components/algorithm` 是 OpenEmber 的轻量通用算法库，面向智能设备、机器人和边缘运行时中的高频基础算法需求。

它的定位不是“大而全”的算法平台，而是传感器数据处理、控制辅助、诊断统计和协议校验所需的基础工具箱。

## 设计原则

- **轻量无依赖**：只依赖 C++ 标准库，不引入 Eigen、OpenCV、PCL 等重型库。
- **适合实时循环**：滤波器和统计器保存内部状态，`update()` 路径避免不必要的动态分配。
- **模板优先**：通用滤波与滑动统计通过模板支持 `float`、`double`、整数和 `std::array<T, N>`。
- **组件级能力**：只放跨节点、跨模块可复用的基础算法；SLAM、路径规划、视觉识别等业务算法应放在模块或应用层。
- **API 简洁**：优先提供小对象和纯函数，让节点代码可以直接组合使用。

## 当前能力

公开头文件位于：

```bash
components/algorithm/include/openember/algorithm/
```

主要 API：

```bash
algorithm.hpp   # 聚合头文件
filter.hpp      # 滤波：MovingAverage / ExponentialMovingAverage / LowPassFilter / MedianFilter / OutlierRejector / Hysteresis
statistics.hpp  # 统计：SlidingWindow / MinMax / MeanVariance / RateCounter / FrequencyEstimator
control.hpp     # 控制辅助：clamp / Saturation / Deadband / SlewRateLimiter / PID
signal.hpp      # 信号工具：map_range / normalize / rescale / threshold / EdgeDetector
checksum.hpp    # 校验：XOR / SUM8 / CRC8 / CRC16-MODBUS / CRC16-CCITT-FALSE / CRC32
```

## 使用示例

```cpp
#include "openember/algorithm/algorithm.hpp"

openember::algorithm::MovingAverage<float, 8> filter;
float filtered = filter.update(raw_value);
```

`std::array<T, N>` 可用于固定维度传感器数据：

```cpp
openember::algorithm::MovingAverage<std::array<double, 3>, 4> accel_filter;
auto accel = accel_filter.update({0.1, 0.0, 9.8});
```

控制循环中的辅助工具：

```cpp
openember::algorithm::PID<double> pid({1.0, 0.02, 0.01}, -10.0, 10.0);
double output = pid.update(target, measured, dt_s);

openember::algorithm::SlewRateLimiter<double> limiter(0.5);
double command = limiter.update(target_command, dt_s);
```

协议校验：

```cpp
auto crc = openember::algorithm::crc16_modbus(frame.data(), frame.size());
```

## CRC 与 MD5

CRC 属于 OpenEmber Algorithm 的合理范围，因为它常用于 UART、RS485、CAN、传感器帧、固件元数据等设备通信场景。当前提供 CRC8、CRC16/MODBUS、CRC16/CCITT-FALSE 和 CRC32。

MD5 暂不放入 `components/algorithm`。它更接近 hash/摘要算法，且不适合作为新系统的安全完整性方案。如果后续需要文件摘要或安全校验，更建议在独立的 `crypto` 或 `hash` 组件中提供 SHA-256 等现代算法。

## 扩展边界

适合继续放入 Algorithm 的能力：

- 传感器前处理：滤波、异常值拒绝、去抖、滞回
- 控制辅助：PID、限幅、死区、斜率限制、软启动
- 运行时统计：滑动均值、方差、频率估计、速率统计
- 协议基础：CRC、XOR、SUM 等轻量校验

不建议放入 Algorithm 的能力：

- SLAM、导航规划、点云配准
- 图像处理和机器视觉
- 机器学习推理
- 强业务绑定的设备算法

这些能力更适合放在 `modules/`、独立组件或用户应用中。
