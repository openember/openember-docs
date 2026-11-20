---
sidebar_position: 2.7
---

# Alert events and Link

Alerts and logs use two independent output paths: `alerts → logging → spdlog TopicSink → log topic` for troubleshooting; `alerts → LinkPublisher → structured alert topics` for whole-machine state managers, UIs, and ops subscribers. `TopicSink` publishes logs only—it is not an alert protocol. Detection, whole-machine response, and execution arbitration stay separate; subscribers must not derive a fixed stop action from log level.

## Build and protocol

Enable `OPENEMBER_COMPONENT_ALERTS_LINK` for target `openember::alerts_link` and header `<openember/alerts/link_publisher.hpp>`. It depends on `OPENEMBER_COMPONENT_ALERTS`, Link, and the `openember-msgs` `alerts/v1` contract. Core leaves this optional adapter off by default; the quadruped host product enables it explicitly. Missing message support fails configure—you need a message repo with `OPENEMBER_ALERTS_CONTRACT_VERSION=1`. Pure in-process alerts do not require Link or protobuf.

Public protos live in `openember-msgs/proto/openember/msgs/alerts/v1/alerts.proto`: `AlertEvent` is one accepted condition change or reminder; `AlertState` is a full snapshot for one publisher instance. Payloads are protobuf on OpenEmber `Node` typed pub/sub—independent of the JSON log topic.

| Logical topic | Message | Content |
| --- | --- | --- |
| `/alerts/events` | `openember.msgs.alerts.v1.AlertEvent` | Raise, reminder, clear, unknown + sample metadata |
| `/alerts/state` | `openember.msgs.alerts.v1.AlertState` | Full condition table, revision, heartbeat, online flag, dispatch stats |
| `/openember/log` | Existing JSON logs | warning/error text from logging TopicSink |

The first two topics are in the Node’s communication scope. With an empty default namespace and robot_id `P05W_C0_HW1D0`, underlying keys are `openember/P05W_C0_HW1D0/topics/alerts/events` and `.../alerts/state`. Subscribers must use the same robot_id and namespace; `LinkOptions.robot_id` also fills the protocol Header—keep it consistent with Context. Existing log TopicSink keeps its own Context, robot_id `openember`, and fixed local connect options; adding the alert adapter does not migrate that scope.

## Dispatch and lifecycle

When Manager accepts an event it synchronously updates the log queue, bounded event history, and state table—no network or log I/O. History defaults to 128 entries via `Options.history_capacity`, independent of the log queue. `ReadSince(revision)` returns a consistent delta history, current state, stats, and revision under a short lock. Each accepted event bumps a global revision; `ForgetSession` also bumps revision when state is actually removed, without forging clears. Snapshots include all last observations, including cleared conditions; `REMINDER` means still active; `UNKNOWN` is not healthy.

`LinkPublisher` runs its own thread: by default check history every 20 ms, publish a full snapshot every 1 s, and also publish immediately on state change. It does not call the log sink and does not use `Options.observer`, so blocked log writes/topics/observers do not block Link dispatch of already-accepted events. When the log queue or state table is full, Manager may still reject new submits—rejected events enter neither channel; monitor reject counts.

Pass a live Manager, Node, and LinkOptions into the adapter; failure to create communication resources fails construction. Stop order: stop event producers → `LinkPublisher::Stop()` → `Manager::Stop()` → close Context. Before the adapter stops it reads current state once and tries to publish `online=false`; destruction also Stop()s. Manager, Node, and Context must outlive the adapter—do not destroy them from the publisher thread. Link send failures only increment counters and do not change control authority; periodic snapshots keep retrying.

```cpp
openember::alerts::Manager alerts;
// context already Init; runtime.robot_id matches link_options.robot_id.
auto node = std::make_shared<openember::Node>(context, "motion_alerts");
openember::alerts::LinkOptions link_options;
link_options.robot_id = "robot-1";
openember::alerts::LinkPublisher publisher(alerts, node, link_options);
// Detectors call alerts.Publish(event); logging and Link dispatch separately.
// After stopping detectors:
publisher.Stop();
alerts.Stop();
```

## Consumer rules for whole-machine state

Each adapter lifetime creates a new `publisher_instance`. Within one instance, revision is monotonic. Event sample sequences still belong to the original detection condition—do not mix them with revision. Header Unix time is when the network message was produced; `observation.sample_time_ns` belongs to an explicit `clock_domain`. Simulation pause does not advance source time, but Link heartbeats still follow host time. Publisher heartbeat only proves the state publisher is online—not that every detector is still sampling. Consumers must also use source sample time, detector lifetime, and motion mode.

Consumers key data by robot, publisher instance, and condition key. A state snapshot replaces only that publisher instance’s condition set (including empty sets)—never wipe other instances. Older-revision snapshots must not overwrite newer state; a new heartbeat at the same revision may refresh online time. Event revisions ≤ the applied snapshot may be kept for audit but must not mutate current state. Dedupe by instance + revision; unknown enums are treated as cannot-judge.

New or reconnecting subscribers wait for the next periodic snapshot—do not rely on prior edges. Do not assume order across topics; a snapshot may cover events not yet received. `heartbeat_sequence` increases monotonically; default `stale_after_ms=3000` should be at least 3× the snapshot period. On receiver monotonic-clock timeout or `online=false`, mark that source unavailable/unknown—never interpret as “all alerts cleared”. Abnormal exit relies on heartbeat timeout; the final offline state of a clean exit may still be lost.

After history overflow the adapter keeps sending remaining events and full snapshots and accumulates `history_gaps`. `publish_failures` counts local send failures—not remote delivery. The protocol has no durable events, app ack, offline replay, or exactly-once. Current state can recover via periodic snapshots; lost history may be unrecoverable. `rejected_events` comes from Manager—zero active conditions ≠ a healthy event path.

## Quadruped wiring and tests

`quadruped_sim_remote` creates a Manager and dedicated LinkPublisher for `quadruped.policy` pose events using the model robot_id. Default Link peer mode discovers same-scope subscribers; use `--link-connect tcp/127.0.0.1:7447` to join an existing router. Link init failure logs a warning and keeps local control/logging; that run does not auto-rebuild a failed adapter. R only rotates the control session and drops old session state—the publisher instance stays. On runner exit it tries to publish offline.

Diagnostic tool: `openember_alert_monitor` (built explicitly when alert Link is enabled). When core disables ordinary tools it can still be built alone and is not in default ALL.

```bash
cmake --build build/quadruped-host --target quadruped_sim_remote openember_alert_monitor -j4
./build/quadruped-host/bin/openember_alert_monitor --robot P05W_C0_HW1D0
```

The tool prints `ALERT_EVENT` and periodic `ALERT_STATE` (condition totals, active, unknown, heartbeat, dispatch stats). On observed-source heartbeat expiry it prints `ALERT_STALE ... state=unknown`. When connecting to a router explicitly, both simulator and tool need the connect flags (`--connect` on the tool). It is read-only—no control ownership or action requests. Future whole-machine managers should use typed subscriptions and the consumer rules above, combining task, action phase, and other feedback.

Core tests cover real router/client pub/sub, all event types and metadata, session removal, offline snapshots, late-subscriber recovery, publisher-instance restart, bounded history overflow, and independent Link dispatch while log dispatch is blocked. The message repo provides `alerts_wire_contract` serialization and unknown-field tests. Quadruped keeps pose-event, stop, pause, and control-fault sim regressions; pose response can stay report_only without stand-up actions. The new read-only whole-machine state aggregation service is in [Launch orchestration and system state](./launch-and-system-state); it does not auto-dispatch handling actions yet.
