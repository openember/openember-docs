---
sidebar_position: 3.6
---

# Rover Demo（巡游小车）

:::info 规划中
本页描述 **计划中的** 第二档产品 Demo：差速巡游小车。应用目录拟为 `apps/rover_demo`，设计细节见 openember 仓库 `docs/design/rover-demo.md`。代码与 launch 落地后，将在此补充构建与运行步骤。
:::

`rover_demo` 面向 **可仿真、可 DIY 真机** 的完整移动机器人故事：在 Turtle Demo 的 Link / 消息 / launch 基础上，增加执行与安全、里程计、可选激光测距，并与 `system/`、`services/`（含 Hardware Interface、web_console 等）共用同一套中间能力。

预算目标：单机物料 **¥3000 以内**（含 2D 激光或深度相机之一），避免为压价过度砍传感导致 Demo 束手束脚。

## 在三档 Demo 中的位置

| Demo | 角色 |
|------|------|
| [Turtle Demo](./turtle-demo.md) | 平面小车运动学入门，练多节点通信 |
| **Rover Demo** | 差速底盘 + 传感 + 急停/失联保护，仿真与真机同一话题契约 |
| [Agri Station Demo](./agri-station-demo.md)（规划中） | 智慧农业监测站：弱实时传感、告警/降级、运维面 |

同一 OpenEmber 工程通过 Kconfig 与不同 `*.launch.yaml` 打出不同产品软件包；**不按产品复制** system / services。

## 命名

使用 **`rover_demo`（巡游小车）**，不用泛化的 `robot_demo`，以便与双足/机械臂等其它形态区分。

## 计划能力

| 能力 | 说明 |
|------|------|
| 差速控制 | `/rover/cmd_vel`（`Twist2D` 或等价消息） |
| 位姿 / 里程计 | `/rover/odom` 或 `/rover/pose` |
| 安全 | 急停优先；命令失联本地停车 |
| 测距（推荐） | `/rover/scan` 等；无硬件时用 Mock |
| 编排 | `configs/rover.launch.yaml` + `launch_manager` |
| 运维（可选） | 与现有 health / web_console / host_monitor 组合 |

第一版 **不做** 完整 SLAM / 导航发行；激光用于展示与简易避障即可。

## 真机 BOM（量级）

| 类别 | 方向 | 量级（¥） |
|------|------|-----------|
| SBC + 存储 | 树莓派 / Radxa / 香橙派等同档 | 200–500 |
| 差速底盘套件 | 含电机与驱动更省事 | 150–400 |
| IMU / 编码器 | 里程计与姿态 | 30–250 |
| 2D 激光或深度相机（择一） | RPLIDAR A1 类或同类 | 400–1200 |
| 电源与结构 | 电池、线材、支架/打印 | 150–450 |
| **合计** | | **≤ 3000** |

推荐默认：**底盘 + 编码器 + IMU + 2D 激光 + SBC**。详细分期与非目标见主仓设计文档。

## 仿真

- 默认：宿主机软件差速积分（低依赖，便于 CI / 无显示器环境）。
- 可选：Gazebo 等 + 许可清晰的差速 URDF（Apache/BSD 等）；不引入不可商用再分发的商业外观网格。

## 与 Turtle 的关系

Turtle 是平面通信最小闭环；Rover 是同一中间件上的 **产品级移动底座**。不熟悉 OpenEmber 时建议先跑通 [Turtle Demo](./turtle-demo.md)。

分层位置见 [架构概览](./architecture-overview.md)；通信见 [OpenEmber Link](./openember-link.md)。
