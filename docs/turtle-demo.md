---
sidebar_position: 3.5
---

# Turtle Demo（宿主机小乌龟）

`apps/turtle_demo` 是面向 **x86 Linux 开发机** 的 turtlesim 风格示例：不需要目标板或真实硬件，用两个进程演示 OpenEmber **Link 多节点通信**、**Protobuf 消息** 与可选的 **launch 编排**。默认用 SDL2 打开图形窗口；无显示器时可用 `--no-gui`。

它对应应用层中的产品/演示入口（`apps/`），不是 `examples/` 里的 API 碎片示例。若要看完整系统监督（health / device / config），可继续参考 `smart_device_demo` 与 `configs/smart_device.launch.yaml`。

## 能展示什么

| 能力 | 本示例中的体现 |
|------|----------------|
| 多进程 + Link | `turtle_sim` 与 `turtle_teleop` 分进程，经 router/client 通信 |
| openember-msgs | `geometry/v1` 的 `Twist2D` / `Pose2D` |
| 宿主机可运行 | 纯软件积分运动学，无板级驱动 |
| 可视化 | SDL2 窗口（网格、小龟、轨迹）；ASCII 回退 |
| launch | `configs/turtle.launch.yaml`（`launch_manager` 作 router） |

## 依赖与开关

- Kconfig：`Application Layer` → `OPENEMBER_APP_TURTLE_DEMO`（默认开启，依赖 Link + msgs）
- 系统包（GUI）：`libsdl2-dev`（Debian/Ubuntu：`sudo apt install libsdl2-dev`）
- 构建产物：`build/bin/openember_turtle_sim`、`build/bin/openember_turtle_teleop`

构建步骤见 [构建 OpenEmber](./build-openember.md)。若使用本地 `openember-msgs`，需包含 `geometry/v1`（见 [消息协议](./openember-msgs.md)）。

## 话题约定

| Topic | 类型 | 方向 |
|-------|------|------|
| `/turtle/cmd_vel` | `openember.msgs.geometry.v1.Twist2D` | teleop → sim |
| `/turtle/pose` | `openember.msgs.geometry.v1.Pose2D` | sim →（可订阅观察） |

`Twist2D`：`linear_x`（m/s）、`angular_z`（rad/s）。  
`Pose2D`：`x` / `y`（m）、`theta`（rad），世界范围约 ±10 m。

## 快速运行（双终端）

```bash
# 终端 1：仿真世界（默认弹 SDL 窗口，并作为 Link router）
./build/bin/openember_turtle_sim --router

# 终端 2：遥控（脚本绕圈，适合无键盘关注窗口时）
./build/bin/openember_turtle_teleop --client --demo
```

键盘遥控（终端 2 需 TTY）：

```bash
./build/bin/openember_turtle_teleop --client
# w/s 前进后退，a/d 转向，空格停止，q 退出
```

GUI 下关闭窗口或按 `Esc` 结束 `turtle_sim`。

### 无界面 / CI

```bash
./build/bin/openember_turtle_sim --router --no-gui
./build/bin/openember_turtle_teleop --client --demo
```

## 使用 launch_manager

需已启用并构建 `launch_manager`：

```bash
./build/bin/launch_manager configs/turtle.launch.yaml
```

该配置里：`launch_manager` 作为 Link router；`turtle_sim` / `turtle_teleop` 以 `--client` 接入，teleop 带 `--demo`。sim 默认仍开 SDL 窗口（需要可用的 `DISPLAY`）。

手动等价关系见配置文件头注释：`configs/turtle.launch.yaml`。

## 常用参数

两个进程都支持（与 `smart_device_demo` 类似）：

| 参数 | 含义 |
|------|------|
| `--router` / `--client` | 固定 Link 角色；默认 `auto`（先试 router，失败再 client） |
| `--listen <ep>` | router 监听，默认 `tcp/127.0.0.1:7447` |
| `--connect <ep>` | client 连接，默认同上 |

仅 `turtle_sim`：

| 参数 | 含义 |
|------|------|
| `--no-gui` / `--headless` | 不用 SDL，改打 ASCII 地图 |

仅 `turtle_teleop`：

| 参数 | 含义 |
|------|------|
| `--demo` | 持续发布圆周类速度指令（无 TTY 时请用此模式） |

## 源码位置

```text
apps/turtle_demo/
  turtle_sim.cpp          # 订 cmd_vel、积分离散、发 pose、SDL/ASCII
  turtle_teleop.cpp       # 键盘或 --demo 发 cmd_vel
  turtle_view_sdl.*       # Linux SDL2 视图
  turtle_common.hpp       # Link 初始化与消息填充
configs/turtle.launch.yaml
```

## 与其它示例的关系

- `examples/core/*`、`hello_node`：单能力 / API 教学，不是整机故事。
- `smart_device_demo`：产品应用 + 系统节点（参数、设备、心跳）骨架，默认不跑仿真小车。
- **Turtle Demo**：宿主机上最快看到「多节点 Link + 消息 +（可选）launch」闭环；后续可再挂 Mock Hardware Interface 或 system 节点，而不改话题故事。

通信语义详见 [OpenEmber Link](./openember-link.md)；分层位置见 [架构概览](./architecture-overview.md)。
