---
sidebar_position: 3.5
---

# Turtle Demo (host turtlesim)

`apps/turtle_demo` is a **turtlesim-style demo for x86 Linux hosts**. It needs no target board or real hardware. Two processes show OpenEmber **multi-node Link**, **Protobuf messages**, and optional **launch orchestration**. An SDL2 window is the default view; use `--no-gui` when headless.

This lives under the Application layer (`apps/`), not as a tiny API sample in `examples/`. For full runtime supervision (health / device / config), see `smart_device_demo` and `configs/smart_device.launch.yaml`.

## What it demonstrates

| Capability | In this demo |
|------------|--------------|
| Multi-process + Link | `turtle_sim` and `turtle_teleop` as separate processes (router/client) |
| openember-msgs | `geometry/v1` `Twist2D` / `Pose2D` |
| Host-only | Software unicycle integration; no board drivers |
| Visualization | SDL2 window (grid, turtle, trail); ASCII fallback |
| Launch | `configs/turtle.launch.yaml` (`launch_manager` as router) |

## Dependencies and knobs

- Kconfig: `Application Layer` → `OPENEMBER_APP_TURTLE_DEMO` (on by default; needs Link + msgs)
- System package (GUI): `libsdl2-dev` (`sudo apt install libsdl2-dev` on Debian/Ubuntu)
- Binaries: `build/bin/openember_turtle_sim`, `build/bin/openember_turtle_teleop`

See [Build OpenEmber](./build-openember.md). A LOCAL `openember-msgs` tree must include `geometry/v1` ([message protocol](./openember-msgs.md)).

## Topics

| Topic | Type | Direction |
|-------|------|-----------|
| `/turtle/cmd_vel` | `openember.msgs.geometry.v1.Twist2D` | teleop → sim |
| `/turtle/pose` | `openember.msgs.geometry.v1.Pose2D` | sim → (optional observers) |

`Twist2D`: `linear_x` (m/s), `angular_z` (rad/s).  
`Pose2D`: `x` / `y` (m), `theta` (rad); world roughly ±10 m.

## Quick start (two terminals)

```bash
# Terminal 1: sim world (SDL window by default; Link router)
./build/bin/openember_turtle_sim --router

# Terminal 2: teleop (scripted circle)
./build/bin/openember_turtle_teleop --client --demo
```

Keyboard teleop (TTY required):

```bash
./build/bin/openember_turtle_teleop --client
# w/s forward-back, a/d turn, space stop, q quit
```

Close the window or press `Esc` to stop `turtle_sim` in GUI mode.

### Headless / CI

```bash
./build/bin/openember_turtle_sim --router --no-gui
./build/bin/openember_turtle_teleop --client --demo
```

## Using launch_manager

Requires a built `launch_manager`:

```bash
./build/bin/launch_manager --launch configs/turtle.launch.yaml
# also accepted: ./build/bin/launch_manager configs/turtle.launch.yaml
```

`launch_manager` is the Link router; sim and teleop join as `--client`, with teleop `--demo`. The sim still opens SDL unless you change the launch args (needs a working `DISPLAY`).

See the header comments in `configs/turtle.launch.yaml`.

## Common flags

Both processes (same idea as `smart_device_demo`):

| Flag | Meaning |
|------|---------|
| `--router` / `--client` | Fix Link role; default is auto (try router, then client) |
| `--listen <ep>` | Router listen endpoint (default `tcp/127.0.0.1:7447`) |
| `--connect <ep>` | Client connect endpoint |

`turtle_sim` only:

| Flag | Meaning |
|------|---------|
| `--no-gui` / `--headless` | ASCII map instead of SDL |

`turtle_teleop` only:

| Flag | Meaning |
|------|---------|
| `--demo` | Continuous circle-like `cmd_vel` (use this without a TTY) |

## Source layout

```text
apps/turtle_demo/
  turtle_sim.cpp
  turtle_teleop.cpp
  turtle_view_sdl.*
  turtle_common.hpp
configs/turtle.launch.yaml
```

## Related samples

- `examples/core/*`, `hello_node`: API teaching pieces, not a full story.
- `smart_device_demo`: product app + system nodes (parameters, devices, heartbeat).
- **Turtle Demo**: fastest host closed loop for Link + messages + optional launch.

See [OpenEmber Link](./openember-link.md) and [Architecture overview](./architecture-overview.md).
