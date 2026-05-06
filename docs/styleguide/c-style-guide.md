---
sidebar_position: 2
---

# EmberLite C 编程风格指南

## 总体原则

- 简单 > 花哨
- 一致性 > 个人习惯
- 接口清晰 > 实现技巧
- 面向嵌入式 / SDK / 跨平台设计

## 命名规范

C 语言建议统一用 **snake_case**，这是核心的关键决策。

### 函数

```c
int ember_connect(void);
int ember_send_packet(const uint8_t *data, size_t length);
void ember_disconnect(void);
```

规则：

- 全部小写
- 单词用 `_` 分隔
- **必须带模块前缀（非常重要）**

推荐前缀：

```c
ember_*
eb_*
```

### 变量

```c
int packet_count;
uint8_t buffer_size;
```

- snake_case
- 简洁明确

### 全局变量

```c
int g_packet_count;
```

- 使用 `g_` 前缀
- 尽量避免

### 宏

```c
#define EMBER_MAX_PACKET_SIZE 1024
#define EMBER_TIMEOUT_MS      1000
```

- 全大写 + `_`
- 必须带模块前缀

### typedef / struct / enum

类型名推荐：**PascalCase** 或 **snake_case** 二选一（建议统一）

我们推荐使用 **PascalCase**（更接近 C++）：

```c
typedef struct {
    uint8_t *data;
    size_t length;
} EmberPacket;
```

枚举：

```c
typedef enum {
    EMBER_STATE_DISCONNECTED,
    EMBER_STATE_CONNECTING,
    EMBER_STATE_CONNECTED
} EmberState;
```

- 枚举值必须全大写
- 带模块前缀

## 模块设计

C 没有命名空间，必须靠命名约束，这是大型 C 项目的关键。

**每个模块一个前缀**

| 模块      | 前缀             |
| --------- | ---------------- |
| core      | ember_           |
| transport | ember_transport_ |
| protocol  | ember_proto_     |

示例：

```c
int ember_transport_init(void);
int ember_transport_send(const uint8_t *data, size_t len);
```

## 文件命名

snake_case

```c
ember.c
ember_transport.c
ember_protocol.c
packet_parser.c
```

## 结构体设计

不暴露内部实现（模拟“封装”）

```c
typedef struct EmberClient EmberClient;
struct EmberClient {
    int socket_fd;
    int state;
};
```

或更进一步（推荐 SDK 用）：

```c
typedef struct EmberClient EmberClient;

EmberClient* ember_create(void);
void ember_destroy(EmberClient* client);
```

实现“伪 OOP”

## 函数设计规范

### 返回值统一

```c
int ember_connect(void);  // 0 = success, <0 = error
```

推荐：

- 0 成功
- 负数错误码

### 输出参数

```c
int ember_receive(uint8_t *buffer, size_t *length);
```

✔ 使用指针返回数据
 ✔ 避免返回结构体（嵌入式友好）

## bool 规范

```c
bool is_connected;
bool has_error;
```

函数：

```c
bool ember_is_connected(void);
```

✔ 使用 `is_ / has_ / can_`

## 命名禁忌

不要这样：

```
int Connect();     // ❌ C++ 风格
int getCount();    // ❌ camelCase
```

不要无前缀：

```
int send_packet(); // ❌ 污染全局命名空间
```

不要缩写：

```
int pkt_cnt;       // ❌
```

## 头文件规范

```
#ifndef EMBER_TRANSPORT_H
#define EMBER_TRANSPORT_H

// ...

#endif
```

✔ 宏名 = 文件名大写

## 完整示例

```c
// ember_client.h

#ifndef EMBER_CLIENT_H
#define EMBER_CLIENT_H

#include <stddef.h>
#include <stdint.h>
#include <stdbool.h>

typedef struct EmberClient EmberClient;

EmberClient* ember_create(void);
void ember_destroy(EmberClient* client);

int ember_connect(EmberClient* client);
int ember_disconnect(EmberClient* client);

int ember_send_packet(EmberClient* client,
                      const uint8_t* data,
                      size_t length);

bool ember_is_connected(const EmberClient* client);

#endif
```