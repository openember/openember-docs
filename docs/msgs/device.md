---
sidebar_position: 7
---

# device/v1

包名：`openember.msgs.device.v1`  
定义：`proto/openember/msgs/device/v1/device.proto`

面向设备清单与状态查询（如 LPIO 侧设备管理）。

## 消息

| 消息 | 用途 |
|------|------|
| `DeviceInfo` | 设备静态信息 |
| `DeviceState` | 设备当前状态 / 可用性 |
| `DeviceQuery` / `DeviceQueryResponse` | 设备查询请求与响应 |

## 枚举

| 枚举 | 用途 |
|------|------|
| `DeviceCategory` | 设备类别 |
| `DeviceAvailability` | 可用性 |

典型 key：`.../devices/<device>`。
