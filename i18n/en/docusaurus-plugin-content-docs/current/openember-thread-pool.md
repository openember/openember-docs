---
sidebar_position: 7
---

# OpenEmber Thread Pool

`components/thread_pool` is OpenEmber's fixed-size thread pool. Use it to run short tasks asynchronously inside a node (for example parsing inside a message callback, or non-real-time post-processing) without blocking the main loop or a communication thread.

It is a **lightweight concurrency utility**. It is not a process-level actor scheduler, and it does not schedule real-time periodic work.

## Design principles

- **RAII**: workers are created in the constructor. The destructor stops them cooperatively and `join`s them. It does not use `pthread_cancel`.
- **Not copyable**: the pool object owns the thread lifetime. It is neither copyable nor movable.
- **Standard library first**: built on `std::thread`, `std::mutex`, `std::condition_variable`, and `std::future`, with no extra third-party dependency.
- **Optional priority**: FIFO by default. A task can be given a higher priority when needed.
- **Exception isolation**: an exception thrown by one task does not take down the worker. The `std::future` returned by `submit` carries the result or the exception.

## Relationship to EmberLite `ppool`

| Project | Component | Language | Notes |
|---------|-----------|----------|-------|
| OpenEmber | `components/thread_pool` | C++ | `openember::thread_pool::ThreadPool` |
| EmberLite | `components/ppool` | C | `ember_ppool` (historical pthread implementation) |

The two are similar (a fixed thread count plus a task queue), but the API and lifetime model differ. New OpenEmber code should use the C++ `ThreadPool`. C code continues to use EmberLite's `ember/ppool.h`.

## Current API

Public header:

```bash
components/thread_pool/include/openember/thread_pool/thread_pool.hpp
```

CMake target: `openember_thread_pool`.

Kconfig (Component → Thread Pool):

```
OPENEMBER_COMPONENT_THREAD_POOL=y   # on by default
```

When enabled, `genconfig` writes `OPENEMBER_COMPONENT_THREAD_POOL` and adds the library to the framework's internal library list.

Main API:

| Method | Description |
|--------|-------------|
| `ThreadPool(n)` | Create `n` workers (`n > 0`) |
| `submit(f, args...)` | Submit a callable and return a `std::future` |
| `submit(priority, f, args...)` | Submit with a priority; a larger value runs first |
| `post(task, priority=0)` | Submit without a return value (fire-and-forget) |
| `wait_idle()` | Wait until the queue is empty and no task is in flight |
| `shutdown(drain=true)` | Stop accepting work; when `drain` is set, empty the queue before exiting |
| `size()` / `is_running()` | Query the worker count and running state |

Tasks with the same priority run FIFO in submission order.

## Examples

Basic use:

```cpp
#include "openember/thread_pool/thread_pool.hpp"

openember::thread_pool::ThreadPool pool(4);

auto fut = pool.submit([](int x) { return x * 2; }, 21);
int result = fut.get();  // 42

pool.post([] {
    // fire-and-forget
});

pool.wait_idle();
// destructor calls shutdown(true) when leaving scope
```

With priority:

```cpp
pool.post([] { /* normal task */ }, 0);
pool.post([] { /* more urgent */ }, 10);
```

Handle a message off the subscription callback so the callback itself does not block:

```cpp
#include <memory>
#include <string>

#include "openember/thread_pool/thread_pool.hpp"

static std::unique_ptr<openember::thread_pool::ThreadPool> g_pool;

void on_message(const char* payload)
{
    if (!g_pool) {
        return;
    }
    std::string body(payload);
    g_pool->post([body = std::move(body)] {
        // parse / handle body on a worker
    });
}

int main()
{
    g_pool = std::make_unique<openember::thread_pool::ThreadPool>(5);
    // ... subscribe and run the main loop ...
    g_pool->wait_idle();
    g_pool.reset();
}
```

Reference example: `examples/hello_node/main.cpp`.

## Notes

- **Do not** put long blocking work or a hard real-time control loop on the pool. Periodic control and RT scheduling belong on a dedicated thread, or on a later runtime facility.
- `post` and `submit` throw after shutdown.
- If a task fails, `get()` on the `future` returned by `submit` rethrows the task exception.
- Tasks must own the lifetime of captured objects (prefer capture by value, or `shared_ptr`) so they do not hold dangling references.

## Extension boundary

Reasonable additions:

- A bounded queue and backpressure (block, drop, or fail when the queue is full)
- Worker thread names and affinity (through OSAL)
- Simple metrics (queue length, completion count)

Do not put these in this component:

- Actor lifetime and mode (`group`) switching
- Periodic pipelines driven by an external tick or trigger
- A process-level control plane (command services, heartbeat, liveliness)

Those belong to a runtime orchestration layer, designed beside `thread_pool`, not inside the pool itself.
