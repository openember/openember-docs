---
sidebar_position: 3.7
---

# Agri Station Demo（智慧农业监测站）

:::info 规划中
第三档产品 Demo：**温室 / 田边 Linux 边缘监测站**。应用拟由 `smart_device_demo` 演进为 `apps/agri_station_demo`。设计见 openember `docs/design/agri-station-demo.md`。
:::

OpenEmber 面向 Linux 多节点运行时，适合**常驻边缘站**，不适合做成智能手表一类 MCU 产品。本 Demo 用**智慧农业**把故事落在棚内/田间监测：多传感、阈值告警、配置与运维面，而不是袖珍消费电子。

## 产品选型

**选定：智慧农业监测站**（空气温湿 + 光照 + 土壤墒情；可选温室 CO₂）。

- 与 [Rover Demo](./rover-demo.md) 分工：本站不运动，Rover 不管田。  
- 插电 SBC + 可采购模块即可桌面用花盆演示。  
- 发挥：`config` 调阈值、`health` 降级、`web_console` 看棚况、Product App 做策略。

## 推荐传感器（可购买）

| 模块 | 物理量 | 接口 | 话题 |
|------|--------|------|------|
| **AHT20**（或 SHT30） | 空气温湿度 | I2C | `/agri/air/temperature`、`.../humidity` |
| **BH1750** | 光照 | I2C | `/agri/light/illuminance` |
| **电容土壤探针 + ADS1115** | 土壤湿度 | I2C ADC | `/agri/soil/moisture` |

可选：**SCD40**（CO₂）、**DS18B20**（土壤温度）。  
真机最低：至少两路实物。细节见主仓设计文档。

## 架构要点

```text
launch_manager
  ├── agri_station_app      # 策略/告警 + 可选系统 Qt 现场台（--no-gui 无头）
  ├── agri_mock_* / HI
  ├── health_monitor / config_service / device_manager
  └── web_console / host_monitor（可选运维面）
```

现场界面做在 `agri_station_app` 内（非 Web）：顶栏菜单 + 卡片图表（系统 `qt6-base-dev`、`qt6-charts-dev` 或 Qt5 等价包），由 `OPENEMBER_AGRI_STATION_GUI` 控制。第一版以监测与告警为主；实驱水泵/风机可后置。

## 与其它 Demo

| Demo | 关系 |
|------|------|
| [Turtle Demo](./turtle-demo.md) | 通信入门 |
| [Rover Demo](./rover-demo.md) | 移动机器人 |
| 曾用 Env Station 叙事 | 已改为农业站，避免「过轻/像手表」的产品错位 |

见 [架构概览](./architecture-overview.md)。
