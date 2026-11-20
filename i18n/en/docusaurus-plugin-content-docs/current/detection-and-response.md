---
sidebar_position: 2.5
---

# Detection, response, and recovery

Robots and smart devices often need to detect tilt, temperature, collision, tracking error, input loss, or communication loss. The same phenomenon may require different responses across tasks: a large tilt angle may mean a tip-over—or a planned climb/flip. Keep fact detection, response decisions, and action execution separate so detectors never hard-bind whole-machine stop, fault latch, or process exit.

This page defines those responsibility boundaries. Core already ships an in-process [shared alerts component](./alerts) for alert state, event queues, and warning/error logging. Detection algorithms, behavior response, and recovery state machines stay in the owning modules/products. The full event semantics below include later design goals—not everything is already a public message contract.

## Responsibilities and data flow

Feedback enters detectors and becomes state snapshots plus change events. Product response policy combines the current action and control context, then control arbitration and action execution handle the request. Logs, telemetry, and diagnostics subscribe independently to detection and execution results.

| Role | Inputs / outputs | Decisions owned |
| --- | --- | --- |
| Detector | Valid feedback in; measurements, condition state, and change events out | Whether a condition holds; whether data is enough to judge |
| Response policy | Detection results, current action, capability, and control ownership in; response requests out | Continue, notify, degrade, stop current action, recover, or request fault latch |
| Action execution & arbitration | Validated requests in; execution state and results out | Sole output ownership, ordering, cancel, and end conditions |
| Logging & diagnostics | Consume state, events, and handling results | Record, display, report—do not take execution authority |

Detectors should depend mainly on input data and detection parameters—not teleop buttons, a specific motion policy, a sim window, or process management. Response policy may vary by product, model, action, and run state. Handlers must not rewrite detection results as “did not happen” to fit an action.

## Conditions, events, and faults

Express sustained conditions, condition-change events, control faults, and action outcomes separately. For example “tilt above threshold” is a condition, “started exceeding” is an event, “request tip-over recovery” is a handling decision, and “recovery failed into passive” is an outcome—do not collapse them into a single `fault=true`.

Define severity, actual response, latching, and clear conditions separately. Log level must not imply the same stop action for every product. Condition clear can emit a recovery event, but that does not auto-restore control authority or clear an already latched fault.

When designing detection outputs, at least consider:

| Information | Purpose |
| --- | --- |
| Device/robot, source module, session, detector, and condition ids | Avoid mixing devices, stale processes, and old control sessions |
| Sample sequence, sample time, receive time, clock domain | Freshness, dedupe, replay—do not mix clock domains in one arithmetic |
| Measurement, unit, reference frame, thresholds, detector config version | Explain triggers and reproduce experiments |
| Validity and ACTIVE / CLEARED / UNKNOWN (etc.) | Separate invalid data from “OK”; unknown ≠ under threshold |
| Enter time, duration, post hysteresis/debounce state changes | Distinguish brief crossings from sustained anomalies |
| Event referenced by a decision, context version, response request, execution result | Trace detection → decision → actual execution |

Pair edge events with sustained state snapshots so reconnecting subscribers are not left with only lost edges. Log with rate limits, edge records, and short sustained summaries—avoid spamming every control cycle. Expired data or unavailable sensors should report unknown / availability conditions explicitly; policy then chooses the response.

## Action context and independent constraints

One detection result can map to different responses. Large tilt while walking may request tip-over classification and recovery; an admitted flip action may pass through inverted poses while still bound by its own duration, trajectory, capability, and end conditions. Allowing large tilt ≠ disabling detection ≠ ignoring anomalies indefinitely.

Run response policy inside a defined control owner with consistent detection snapshots, action phase, control session, and capability info. Concurrent log subscribers and multiple detectors must not each write motors directly. When actions switch, define when response rules take effect—old recovery requests must not keep running in a new session. Blocked reporting or network loss must not prevent local decisions that need to run.

Joint/motor capability, illegal or non-finite commands, control authorization, feedback freshness, comms loss, and e-stop still validate under their own rules. Removing “tilt over threshold ⇒ hard lock” does not turn those mechanisms into log-only checks. Local constraints that need low latency must not wait for async event reporting to finish.

## Recovery and clear conditions

Recovery is a managed action with entry conditions, required policy/trajectory, output capability, valid control ownership, timeout, retry budget, success criteria, cancel, and failure fallback. Keep detecting during recovery; stop and e-stop requests still win. New commands, condition clear, or process restart must not silently restore revoked control authority.

Products should define what may auto-recover, what needs an operator request, and when a true fault latch is required. Without a usable recovery action, report insufficient capability and enter a clear wait/passive state—do not keep a walking policy unfit for the current pose just because a model can still infer, and do not claim autonomous stand-up capability you do not have.

In simulation, stopping control output and stopping physical time are different. After a control fault you may still simulate gravity and contact; only an explicit pause freezes physics. Errors that prevent the physics engine itself from running follow the simulator lifecycle.

## Ownership and parameters

OpenEmber core should provide stable reusable I/O conventions, event metadata, time/session semantics, plus logging, config, and communication basics. Concrete detectors live in reusable components or product modules; behavior response, model actions, recovery policy, and whole-machine state machines are product-owned. Validate with real product scenarios before extracting shared capabilities—do not require a universal safety service or event bus on day one.

Public diagnostic state can map to existing `diagnostics/v1`; use existing logging. Model node lifecycle separately from robot motion state. Domain conditions, action requests, and recovery results that must cross processes should be reviewed and versioned in `openember-msgs`—do not let products copy protocols ad hoc. Existing messages do not automatically provide the full semantics above. See [Public message contracts](./openember-msgs) and [Architecture overview](./architecture-overview).

Split config per [Build configuration and runtime parameters](./configuration): Kconfig decides whether detection, event adapters, or recovery capabilities are built; module YAML defines thresholds, windows, hysteresis, debounce, action-context responses, and recovery budgets. Configure detection thresholds separately from handling policy; put config versions into diagnostics. Startup load and online update are different capabilities—online update needs explicit apply timing and validation rules.

## Rollout and acceptance

Start from existing product tilt detection: keep measurement and diagnostics, decouple detection output from response, and let the product choose report-only, end current action, wait for recovery, or request latch. Then add tip-over confirmation and explicit recovery actions; only after models and capability exist open auto-recovery and flip action contexts. Extract shared interfaces and public messages after several real reuse cases.

Acceptance should cover different responses for the same detection under different actions, plus threshold edges, hysteresis/debounce, sensor loss, duplicate/stale-session events, blocked reporting, action cancel, recovery timeout, and exhausted retries. Especially verify that “over threshold without hard lock” does not silently enable the device, that “event cleared” does not auto-clear an existing control fault, and that a control fault does not freeze simulated physics time.

## Product progress

The quadruped product finished phase one: a pure-threshold detector without I/O in product `quadruped_policy`. Tilt and effective low root height support hysteresis, debounce, sustained reminders, unknown state, and session isolation; response is explicitly `report_only`. Over-limit poses only record local events and UI warnings—they do not revoke output or require reset. Valid initial-state admission and lower-level feedback, capability, and control-ownership checks remain. Product detection events now map into core `openember::alerts`, with an independent dispatch thread writing warning logs through the logging module; the UI still shows alerts. Events and periodic state snapshots are also published on a [dedicated Link channel](./alerts-link) as public `alerts/v1` for later whole-machine managers. Central services, tip-over confirmation, action context, and stand-up recovery remain TODO.
