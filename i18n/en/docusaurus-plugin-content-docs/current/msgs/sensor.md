---
sidebar_position: 9
---

# sensor/v1

Package: `openember.msgs.sensor.v1`  
Definition: `proto/openember/msgs/sensor/v1/sensor.proto`

Sensor samples and status. IMU includes a compatible field extension; use `ScalarSample` for generic scalars.

## Messages

| Message | Purpose |
|---------|---------|
| `Vector3` / `Quaternion` | 3D vector and quaternion |
| `ImuSample` | IMU sample (acceleration, angular rate, magnetometer, orientation, and so on) |
| `TemperatureSample` | Temperature sample |
| `ScalarSample` | Generic scalar: `quantity` + `value` + `unit` |
| `GnssFix` | GNSS fix |
| `SensorStatus` | Sensor availability / status |

## Enums

| Enum | Purpose |
|------|---------|
| `SensorType` | Sensor type |
| `SensorAvailability` | Availability |
| `GnssFixType` | GNSS fix type |

## Contract notes (IMU)

Full rules are in `openember-msgs` `docs/imu-contract.md`. Summary:

- Fields 1–9 stay; fields 10–19 are appended (orientation validity, frames, receive clock domain, and so on) without bumping the package version.
- Numeric zero is not the same as valid; each measurement channel has its own `*_valid` flag.
- `receive_time_monotonic_ns` is the producer receive time; republishing must not refresh it.
- Do not subtract monotonic clocks across hosts; use local timeouts and sequence progress.
- CMake capability `OPENEMBER_IMU_CONTRACT_VERSION=1` means this extension is present.
