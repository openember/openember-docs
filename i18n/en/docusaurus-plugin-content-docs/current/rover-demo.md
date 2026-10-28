---
sidebar_position: 3.6
---

# Rover Demo

:::info Planned
This page describes the **planned** second product demo: a differential-drive rover. The app is intended to live at `apps/rover_demo`. Design details are in the openember repo at `docs/design/rover-demo.md`. Build and run steps will be added here once code and launch files land.
:::

`rover_demo` is a **sim-capable, DIY-hardware** mobile-robot story: on top of Turtle Demo’s Link / messages / launch path, it adds actuation and safety, odometry, optional lidar, and shares `system/` and `services/` (Hardware Interface, web_console, and so on).

Budget target: **≤ ¥3000** BOM per vehicle (including either a 2D lidar or a depth camera), so the demo is not starved of sensors.

## Where it sits among demos

| Demo | Role |
|------|------|
| [Turtle Demo](./turtle-demo.md) | Planar kinematics; learn multi-node messaging |
| **Rover Demo** | Diff-drive base + sensing + e-stop / loss-of-command; same topic contract in sim and on hardware |
| [Agri Station Demo](./agri-station-demo.md) (planned) | Smart-agri edge station: soft-real-time sensing, alerts/degrade, ops surface |

One OpenEmber tree builds different product packages via Kconfig and per-product `*.launch.yaml`. Do **not** fork system / services per product.

## Naming

Use **`rover_demo`**, not a generic `robot_demo`, so the wheeled base stays distinct from bipeds, arms, and other morphologies.

## Planned capabilities

| Capability | Notes |
|------------|--------|
| Diff-drive command | `/rover/cmd_vel` (`Twist2D` or equivalent) |
| Pose / odometry | `/rover/odom` or `/rover/pose` |
| Safety | E-stop wins; local stop on command timeout |
| Ranging (recommended) | `/rover/scan`, etc.; Mock without hardware |
| Launch | `configs/rover.launch.yaml` + `launch_manager` |
| Ops (optional) | Compose with existing health / web_console / host_monitor |

v1 does **not** ship a full SLAM / nav stack; lidar is for demos and simple obstacle reaction.

## Hardware BOM (order-of-magnitude)

| Category | Direction | Approx. ¥ |
|----------|-----------|-----------|
| SBC + storage | Pi / Radxa / Orange Pi class | 200–500 |
| Diff-drive chassis kit | Motors + driver included preferred | 150–400 |
| IMU / encoders | Odom and attitude | 30–250 |
| 2D lidar **or** depth camera | RPLIDAR A1 class or similar | 400–1200 |
| Power and structure | Battery, wiring, mounts / prints | 150–450 |
| **Total** | | **≤ 3000** |

Default recommendation: **chassis + encoders + IMU + 2D lidar + SBC**. Phasing and non-goals live in the main-repo design doc.

## Simulation

- Default: host-side software unicycle / diff-drive integration (light deps, CI-friendly).
- Optional: Gazebo (or similar) with a clearly licensed diff-drive URDF (Apache/BSD, etc.); do not vendor non-commercial commercial appearance meshes.

## Relation to Turtle

Turtle is the minimal messaging loop; Rover is the **product-shaped mobile base** on the same middleware. Newcomers should run [Turtle Demo](./turtle-demo.md) first.

See [Architecture overview](./architecture-overview.md) and [OpenEmber Link](./openember-link.md).
