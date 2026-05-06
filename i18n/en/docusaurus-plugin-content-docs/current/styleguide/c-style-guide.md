---
sidebar_position: 2
---

# EmberLite C Coding Style Guide

## General principles

- Simple beats clever
- Consistency beats personal preference
- Clear interfaces beat implementation tricks
- Design for embedded / SDK / cross-platform use

## Naming conventions

Use **snake_case** consistently in C. This is the core decision.

### Functions

```c
int ember_connect(void);
int ember_send_packet(const uint8_t *data, size_t length);
void ember_disconnect(void);
```

Rules:

- All lowercase
- Separate words with `_`
- **Must use a module prefix (very important)**

Recommended prefixes:

```c
ember_*
eb_*
```

### Variables

```c
int packet_count;
uint8_t buffer_size;
```

- snake_case
- Short and clear

### Global variables

```c
int g_packet_count;
```

- Use the `g_` prefix
- Prefer to avoid globals

### Macros

```c
#define EMBER_MAX_PACKET_SIZE 1024
#define EMBER_TIMEOUT_MS      1000
```

- ALL_CAPS with `_`
- Must include a module prefix

### typedef / struct / enum

For type names, pick **PascalCase** or **snake_case** and stick to one project-wide style.

We recommend **PascalCase** (closer to C++):

```c
typedef struct {
    uint8_t *data;
    size_t length;
} EmberPacket;
```

Enumerations:

```c
typedef enum {
    EMBER_STATE_DISCONNECTED,
    EMBER_STATE_CONNECTING,
    EMBER_STATE_CONNECTED
} EmberState;
```

- Enumerators must be ALL_CAPS
- Include a module prefix

## Module design

C has no namespaces; naming discipline is what keeps large C codebases sane.

**One prefix per module**

| Module    | Prefix           |
| --------- | ---------------- |
| core      | ember_           |
| transport | ember_transport_ |
| protocol  | ember_proto_     |

Example:

```c
int ember_transport_init(void);
int ember_transport_send(const uint8_t *data, size_t len);
```

## File naming

snake_case

```c
ember.c
ember_transport.c
ember_protocol.c
packet_parser.c
```

## Struct design

Do not expose internal details (approximate “encapsulation”)

```c
typedef struct EmberClient EmberClient;
struct EmberClient {
    int socket_fd;
    int state;
};
```

Or, going further (recommended for SDKs):

```c
typedef struct EmberClient EmberClient;

EmberClient* ember_create(void);
void ember_destroy(EmberClient* client);
```

This enables a lightweight “pseudo-OOP” style.

## Function design

### Consistent return values

```c
int ember_connect(void);  // 0 = success, <0 = error
```

Recommended:

- `0` for success
- Negative values for error codes

### Output parameters

```c
int ember_receive(uint8_t *buffer, size_t *length);
```

✔ Use pointers to return data  
✔ Avoid returning large structs by value (better for embedded)

## Booleans

```c
bool is_connected;
bool has_error;
```

Functions:

```c
bool ember_is_connected(void);
```

✔ Prefer `is_`, `has_`, `can_` prefixes

## Naming anti-patterns

Avoid:

```
int Connect();     // ❌ C++-style name
int getCount();    // ❌ camelCase
```

Avoid missing prefixes:

```
int send_packet(); // ❌ pollutes the global namespace
```

Avoid cryptic abbreviations:

```
int pkt_cnt;       // ❌
```

## Header guards

```
#ifndef EMBER_TRANSPORT_H
#define EMBER_TRANSPORT_H

// ...

#endif
```

✔ Guard macro name matches the file name in UPPER_SNAKE_CASE

## Full example

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
