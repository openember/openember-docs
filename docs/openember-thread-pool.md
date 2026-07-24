---
sidebar_position: 7
---

# OpenEmber Thread Pool

`components/thread_pool` 是 OpenEmber 的固定大小线程池组件，用于在节点内异步执行短任务（例如消息回调里的解析、非实时后处理），而不阻塞主循环或通信线程。

它的定位是**轻量并发工具**，不是进程级 Actor 调度框架，也不承担实时周期任务编排。

## 设计原则

- **RAII**：构造时创建 worker，析构时协作式停机并 `join`，避免 `pthread_cancel`。
- **禁止拷贝**：池对象绑定线程生命周期，不可拷贝、不可移动。
- **标准库优先**：基于 `std::thread` / `std::mutex` / `std::condition_variable` / `std::future`，无额外第三方依赖。
- **可选优先级**：默认 FIFO；需要时可为任务指定更高优先级。
- **异常隔离**：单个任务抛出的异常不会拖垮 worker 线程；通过 `submit` 返回的 `std::future` 可获取结果或异常。

## 与 EmberLite `ppool` 的关系

| 项目 | 组件 | 语言 | 说明 |
|------|------|------|------|
| OpenEmber | `components/thread_pool` | C++ | `openember::thread_pool::ThreadPool` |
| EmberLite | `components/ppool` | C | `ember_ppool`（历史 pthread 实现） |

两者能力相近（固定线程数 + 任务队列），但 API 与生命周期模型不同。新的 OpenEmber 代码应使用 C++ `ThreadPool`；C 场景继续使用 EmberLite 的 `ember/ppool.h`。

## 当前能力

公开头文件：

```bash
components/thread_pool/include/openember/thread_pool/thread_pool.hpp
```

CMake 目标：`openember_thread_pool`（通常已通过框架内部库列表链接）。

主要 API：

| 方法 | 说明 |
|------|------|
| `ThreadPool(n)` | 创建 `n` 个 worker（`n > 0`） |
| `submit(f, args...)` | 提交可调用对象，返回 `std::future` |
| `submit(priority, f, args...)` | 带优先级提交；数值更大者优先 |
| `post(task, priority=0)` | 只提交不拿返回值（fire-and-forget） |
| `wait_idle()` | 等待队列清空且无在飞任务 |
| `shutdown(drain=true)` | 停止接单；`drain` 时先排空队列再退出 |
| `size()` / `is_running()` | 查询 worker 数量与运行状态 |

同优先级任务按提交顺序 FIFO。

## 使用示例

基本用法：

```cpp
#include "openember/thread_pool/thread_pool.hpp"

openember::thread_pool::ThreadPool pool(4);

auto fut = pool.submit([](int x) { return x * 2; }, 21);
int result = fut.get();  // 42

pool.post([] {
    // fire-and-forget
});

pool.wait_idle();
// 离开作用域时析构自动 shutdown(true)
```

带优先级：

```cpp
pool.post([] { /* 普通任务 */ }, 0);
pool.post([] { /* 更紧急 */ }, 10);
```

在消息回调中异步处理（避免阻塞订阅回调）：

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
        // 在 worker 中解析 / 处理 body
    });
}

int main()
{
    g_pool = std::make_unique<openember::thread_pool::ThreadPool>(5);
    // ... 订阅与主循环 ...
    g_pool->wait_idle();
    g_pool.reset();
}
```

参考示例：`examples/hello_node/main.cpp`。

## 注意事项

- **不要**把长阻塞或强实时控制环丢进线程池；周期控制、RT 调度应使用专用线程或后续的 runtime 能力。
- 停机后调用 `post` / `submit` 会抛出异常。
- `submit` 返回的 `future` 在任务失败时，`get()` 会重新抛出任务异常。
- 任务应自己管理捕获对象的生命周期（优先按值捕获或使用 `shared_ptr`），避免悬空引用。

## 扩展边界

适合继续增强的方向：

- 有界队列与背压策略（满队列时阻塞 / 丢弃 / 失败）
- worker 线程命名与亲和性（通过 OSAL）
- 简单指标（排队长度、完成计数）

不建议放入本组件的能力：

- Actor 生命周期、模式（group）切换
- 外部 tick / 触发器驱动的周期流水线
- 进程级控制面（命令服务、心跳、liveliness）

上述能力属于运行时编排框架，应与 `thread_pool` 分层设计，而不是塞进线程池本身。
