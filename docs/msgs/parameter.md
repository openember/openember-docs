---
sidebar_position: 5
---

# parameter/v1

包名：`openember.msgs.parameter.v1`  
定义：`proto/openember/msgs/parameter/v1/parameter.proto`

运行时参数的描述、读写与变更事件。

## 消息

| 消息 | 用途 |
|------|------|
| `ParameterValue` | 参数值载体 |
| `NumericRange` | 数值合法区间 |
| `ParameterDescriptor` | 参数元数据（类型、范围、只读等） |
| `Parameter` | 名称 + 值 + 可选描述 |
| `GetParameterRequest` / `GetParameterResponse` | 读取参数 |
| `SetParameterRequest` / `SetParameterResponse` | 写入参数 |
| `ParameterEvent` | 参数变更通知 |

## 枚举

| 枚举 | 用途 |
|------|------|
| `ParameterType` | 布尔 / 整型 / 浮点 / 字符串等 |
