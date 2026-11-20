---
sidebar_position: 2.6
---

# Shared alerts component

OpenEmber core `components/alerts` provides in-process alert state, an event queue, and async log dispatch. CMake target `openember::alerts`, header `<openember/alerts/manager.hpp>`. Toggle with Kconfig/CMake `OPENEMBER_COMPONENT_ALERTS` (on by default). Detection algorithms, threshold hysteresis/debounce, and reminder periods belong to detectors; the alerts component does not take control authority and does not stop, latch, or recover.

## Events and state

`Event.key` identifies a condition via source module, device, session, and alert code. `Raised`, `Reminder`, `Cleared`, and `Unknown` record condition active, sustained reminder, clear, and cannot-judge. Severity is independently `Severity::Warning` or `Severity::Error`—severity does not imply a whole-machine action. `Snapshot()` returns the last accepted event per condition; `Reminder` means still active; `Unknown` is not healthy. Snapshots keep original sample times; consumers check freshness. Stopping detection does not auto-claim conditions cleared.

Events carry sample sequence, source time and clock domain, duration, measurement, thresholds, clear threshold, unit, frame, context, and notes. Within a key, only increasing sequences, non-rewinding times, and the same clock domain are accepted—do not mix host and simulation clocks. New sessions need a new session id; after stopping an old producer call `ForgetSession(source, session)` to drop old state. That does not forge clear events; already queued history still logs. The component does not decide which sessions are dead—callers must stop old producers.

Fields are capped at 256 bytes and reject control characters; key ids and clock domain are non-empty; values must be finite. Invalid observations use `Unknown`, `valid=false`, and finite placeholders. Logs use quoted fields so free text cannot forge new log lines. In-process types optionally map through a Link adapter to `openember-msgs` `alerts/v1`. There is not yet app ack, durable state, or a central alert service.

## Integration with logging

Each accepted event is logged on a dispatch thread via existing `openember::logging::Logger`. The spdlog backend still reuses stdout, rolling files, syslog, and log topics; builtin backend writes stderr. Lifecycle events use at least `warn`; severe events use `error`. Clear events also use `warn` with `edge=CLEARED`, so counting warning lines alone cannot tell which alerts are still active.

The manager holds its own logger instance and sets that instance (and its topic filter) to `warn`, so a process-wide error-only filter does not drop alerts. It does not change ordinary process log levels or replace the default spdlog instance. Names append an in-process instance number, e.g. `quadruped-sim-alerts-1`; rolling files follow that name. Destinations, directories, and rotation come from the passed `LoggerConfig`. File-create failures follow logging fallbacks—no guarantee of disk or remote delivery; topic rate limits and availability still apply.

Queue and state table default to 128 entries each; capacity is set in `Options` up to 65536. `Publish()` only validates, briefly locks, copies metadata, and enqueues—no log I/O and no wait on slow logs/observers. It still allocates and takes a mutex, so it is not a hard real-time API. Full queue/table returns `Full` without changing the snapshot; bad data, duplicate/stale events, and post-stop submits return `Invalid`, `Stale`, and `Stopped`. All rejects are counted; the live dispatch thread periodically warns with reject totals. Callers must check the result or watch `Stats()`—do not treat rejects as successful reports. Submits after stop only increment counters; the dispatch thread has already ended.

`Options.observer` receives events after the log call, on the dispatch thread, for local subscribers. The dedicated Link adapter uses a bounded event history and does not depend on this callback. Callbacks must return in bounded time and must not call `Stop()` or destroy the same manager. Callback exceptions are isolated into `dispatch_errors` and do not kill the dispatch thread. `Stats().delivered` is completed dispatch *attempts*, not storage/network ack; `dispatch_errors` counts exceptions thrown back to the caller; errors handled inside logging still follow logging rules.

## Usage and lifecycle

```cpp
openember::alerts::Options options;
options.logging = openember::logging::LoggerConfig::from_build_defaults("robot-alerts");
openember::alerts::Manager alerts(std::move(options));
openember::alerts::Event event;
event.key = {"motion", "robot-1", "session-1", "tilt"};
event.sequence = 1;
event.time_ns = 1000000000;
event.clock_domain = "simulation";
event.value = 0.8;
event.threshold = 0.7;
event.clear_threshold = 0.6;
event.unit = "rad";
event.context = "locomotion";
const auto result = alerts.Publish(std::move(event));
// Consume result / Stats(); the product decides motion response separately.
// Stop producers first, then drain and join outside the control loop.
alerts.Stop();
```

Construction starts the dispatch thread; failure to init the log backend fails construction. `Stop()` closes intake, drains accepted events, and joins; it is idempotent and also runs from the destructor. Slow logs/callbacks can extend drain time—stop/destroy outside control threads. v1 is bounded in-process dispatch only; the queue is not durable across crash or power loss.

## Quadruped integration

The quadruped pure-threshold detector stays in `quadruped_policy` and emits tilt / low-root-height events from YAML. The runner maps them to `openember::alerts::Event` with source `quadruped.policy`, keeping sim time, session, units, and action context for the core log thread. The window still shows `TILT WARNING` or `LOW HEIGHT WARNING`; the product explicitly uses `report_only`. On R reset, stop the old control session, drop that session’s alert snapshot, and create a new session; alerts do not affect independent physics stepping.

## Verification

Core tests `alerts_lifecycle`, `alerts_validation`, `alerts_capacity`, and `alerts_async` cover lifecycle, sample order, clock domains, invalid data, capacity, slow consumers, callback exceptions, and stop drain. With the spdlog backend, `alerts_logging` checks warning/error file records, clear markers, sample metadata, and that an error-only input config does not swallow warning alerts.

Structured alert publishing, topics, heartbeats, and whole-machine consumer rules: [Alert events and Link](./alerts-link).
