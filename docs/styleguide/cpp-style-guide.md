---
sidebar_position: 1
---

# OpenEmber C++ 编程风格指南

## 总体原则

- 风格统一优先于个人习惯
- API 可读性优先
- 命名应清晰表达语义，而不是实现细节

## 命名规范

### 类型（类 / struct / enum）

使用 **PascalCase** 大驼峰命名法，例如：

```cpp
class EmberClient;
struct PacketHeader;
enum class ConnectionState;
```

### 函数（统一规则）

**lowerCamelCase**（小驼峰命名法，类似 Qt）

```cpp
void connectToServer();
void sendPacket();
int calculateChecksum();
```

- 不区分 public / private
- 不使用 PascalCase（避免 Google 风格复杂性）

### getter / setter（统一 camelCase）

```cpp
int packetCount() const;
void setPacketCount(int count);

bool isConnected() const;
```

- 和函数完全一致
- 避免 Google 那种“例外规则”

### 变量

#### 局部变量 / 参数

```cpp
int packetCount;
std::string deviceName;
```

#### 成员变量

**m_ 前缀 + camelCase**

```cpp
class Client {
private:
    int m_packetCount;
    bool m_connected;
};
```

#### 全局变量

```cpp
int g_packetCount;
```

### 常量

**PascalCase（不使用 k 前缀）**

```cpp
const int MaxPacketSize = 1024;
```

### 宏（仅限必要场景）

```cpp
#define EMBER_MAX_BUFFER 1024
```

## 文件命名

**snake_case**（蛇形命名法）

```cpp
ember_client.h
packet_parser.cpp
connection_manager.h
```

原因：

- 跨平台（Linux / Windows）
- 避免大小写问题

## 类设计规范

### 一个类只做一件事

```cpp
class PacketParser;   // 只负责解析
class Connection;     // 只负责连接
```

### API 命名要“像句子”

```cpp
client.connectToServer();
client.sendPacket(data);
client.disconnect();
```

避免：

```cpp
client.DoConnect();
client.HandlePacket();
```

## bool 命名规则（非常重要）

```cpp
bool isConnected();
bool hasError();
bool canRetry();
```

不要：

```cpp
bool connected();   // 不清晰
```

## 枚举

```cpp
enum class ConnectionState {
    Disconnected,
    Connecting,
    Connected,
};
```

- PascalCase
- 不加前缀（避免 `STATE_CONNECTED`）

## 命名禁忌

不要混用风格：

```cpp
get_packet_count()   // ❌
GetPacketCount()     // ❌
packetCount()        // ✅
```

不要使用无意义缩写：

```cpp
pktCnt   // ❌
```

不要用类型前缀（老式匈牙利）：

```cpp
int iCount;   // ❌
```