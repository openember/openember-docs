---
sidebar_position: 3.7
---

# Agri Station Demo

:::info Planned
Third product demo: a **greenhouse / field-edge Linux monitoring station**. Product code should live in a separate `openember-demo-agri-station` project. The main repository keeps `smart_device_demo` as a minimal entry-point reference. Design: openember `docs/design/agri-station-demo.md`.
:::

OpenEmber is a Linux multi-node runtime—a fit for **always-on edge stations**, not MCU smartwatches. This demo uses **smart agriculture** so the product story matches the stack: multi-sensor, thresholds, config, and ops UI.

## Product choice

**Choice: agri monitoring station** (air temp/humidity + light + soil moisture; optional greenhouse CO₂).

- Split from [Rover Demo](./rover-demo.md): no motion here.  
- Plug-in SBC + purchasable modules; a potted plant is enough for a desk demo.  
- Shows config thresholds, health degrade, web_console, and Product App policy.

## Recommended sensors

| Module | Quantity | Bus | Topics |
|--------|----------|-----|--------|
| **AHT20** (or SHT30) | air T/H | I2C | `/agri/air/temperature`, `.../humidity` |
| **BH1750** | illuminance | I2C | `/agri/light/illuminance` |
| **Capacitive soil probe + ADS1115** | soil moisture | I2C ADC | `/agri/soil/moisture` |

Optional: **SCD40** (CO₂), **DS18B20** (soil temperature).  
Minimum hardware: at least two real sensors. Details in the main-repo design doc.

## Architecture sketch

```text
launch_manager
  ├── agri_station_app      # policy/alerts + optional system Qt console (--no-gui)
  ├── agri_mock_* / HI
  ├── health_monitor / config_service / device_manager
  └── web_console / host_monitor (optional ops surface)
```

The field UI lives in `agri_station_app` (not web): top nav + chart cards using system `qt6-base-dev` and `qt6-charts-dev` (or Qt5 equivalents), gated by `OPENEMBER_AGRI_STATION_GUI`. v1 is monitor + alert; driving pumps/fans can come later.

## Related demos

| Demo | Relation |
|------|----------|
| [Turtle Demo](./turtle-demo.md) | Messaging on-ramp |
| [Rover Demo](./rover-demo.md) | Mobile robot |
| Former Env Station naming | Replaced by agri station so the product is not “too light / watch-like” |

See [Architecture overview](./architecture-overview.md).
