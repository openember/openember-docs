---
sidebar_position: 1
---

# OpenEmber C++ Coding Style Guide

## General principles

- Project-wide consistency beats individual habit
- API readability comes first
- Names should express meaning, not implementation detail

## Naming conventions

### Types (classes / structs / enums)

Use **PascalCase**, for example:

```cpp
class EmberClient;
struct PacketHeader;
enum class ConnectionState;
```

### Functions (single rule)

**lowerCamelCase** (similar to Qt)

```cpp
void connectToServer();
void sendPacket();
int calculateChecksum();
```

- Do not treat public vs. private differently
- Do not use PascalCase for functions (keeps the style simpler than Google’s mix)

### Getters / setters (same camelCase rule)

```cpp
int packetCount() const;
void setPacketCount(int count);

bool isConnected() const;
```

- Same convention as other member functions
- Avoid Google-style “exception” rules for accessors

### Variables

#### Locals / parameters

```cpp
int packetCount;
std::string deviceName;
```

#### Member variables

**`m_` prefix + camelCase**

```cpp
class Client {
private:
    int m_packetCount;
    bool m_connected;
};
```

#### Global variables

```cpp
int g_packetCount;
```

### Constants

**PascalCase (no `k` prefix)**

```cpp
const int MaxPacketSize = 1024;
```

### Macros (only when necessary)

```cpp
#define EMBER_MAX_BUFFER 1024
```

## File naming

**snake_case**

```cpp
ember_client.h
packet_parser.cpp
connection_manager.h
```

Why:

- Works across platforms (Linux / Windows)
- Avoids case-sensitivity issues

## Class design

### One responsibility per class

```cpp
class PacketParser;   // parsing only
class Connection;     // connection only
```

### APIs should read like sentences

```cpp
client.connectToServer();
client.sendPacket(data);
client.disconnect();
```

Avoid:

```cpp
client.DoConnect();
client.HandlePacket();
```

## Boolean naming (important)

```cpp
bool isConnected();
bool hasError();
bool canRetry();
```

Do not:

```cpp
bool connected();   // ambiguous
```

## Enumerations

```cpp
enum class ConnectionState {
    Disconnected,
    Connecting,
    Connected,
};
```

- PascalCase type name
- Enumerators without redundant prefixes (avoid `STATE_CONNECTED`-style noise)

## Naming anti-patterns

Do not mix styles:

```cpp
get_packet_count()   // ❌
GetPacketCount()     // ❌
packetCount()        // ✅
```

Do not use meaningless abbreviations:

```cpp
pktCnt   // ❌
```

Do not use type-prefix Hungarian notation:

```cpp
int iCount;   // ❌
```
