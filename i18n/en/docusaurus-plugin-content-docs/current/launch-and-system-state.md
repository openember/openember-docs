---
sidebar_position: 2.8
---

# Launch orchestration and system state

OpenEmber separates process lifecycle from product state. By default `launch_manager` creates a local Link router and ordinary nodes join as clients; standalone debug programs may create their own router. Whole-machine state management is a separate service: shared aggregation lives in `components/system_state`, while model rules and execution logic belong to the product.

## Launch and readiness

launch YAML supports process args, environment, working directory, dependency lists, readiness deadline, shutdown deadline, and restart policy. `depends_on` names other nodes; missing, duplicate, and cyclic deps are rejected before start. File declaration order need not match execution order.

```yaml
nodes:
  - name: service
    command: ${openember.bin}/my_service
    readiness: notify
    startup_timeout_ms: 10000
    shutdown_timeout_ms: 5000
    restart: on-failure
    restart_limit: 3
  - name: client
    command: ${openember.bin}/my_client
    depends_on: [service]
    readiness: notify
    startup_timeout_ms: 5000
```

After initializing resources and registering endpoints, apps call `openember::launch::NotifyReady()` from `<openember/launch.hpp>`. The supervisor receives a one-shot notification on a private inherited socket before starting dependents. Without a supervisor the call succeeds immediately. Default `readiness: process` keeps old configs compatible—it only means the process was created, not that app init finished. Ready notify, sustained heartbeat, business health, and motion enable are different concepts.

If a dependency exits abnormally, stop its consumers and recreate them after recovery. On shutdown wait for consumers before closing providers. Restarts use increasing backoff and a retry limit; restoring a process does not restore motion authorization. Timeouts attempt graceful terminate then force-kill after the shutdown deadline. Self-daemonizing programs and grandchild process-group management are out of scope for the current implementation. The OS may supervise `launch_manager`, but should not also directly supervise the children it manages.

Paths support `${openember.bin}`, `${launch.dir}`, and `${env:NAME}`; missing or empty env vars error—no shell is invoked. Config is runtime YAML; which components are built remains Kconfig/CMake—see [configuration](./configuration).

## System state

`OPENEMBER_COMPONENT_SYSTEM_STATE` enables the shared single-thread aggregator `openember::system_state`. It consumes product-adapted observations, depends on neither Link nor a motion model, and does not drive hardware. Public `system/v1/SystemState` splits whole-machine state into three dimensions:

| Dimension | States |
| --- | --- |
| Lifecycle | init, standby, running, suspend, resume, shutdown |
| Health | unknown, ok, warning, degraded, fault |
| Actuator | unknown, disabled, enabled, e-stop |

Running and warning can coexist; healthy does not imply control ownership. The system service subscribes to structured [alert events and snapshots](./alerts-link): full snapshots restore current state, events update promptly. Event gaps, stale snapshots, offline publishers, or unknown conditions must not be inferred as healthy. Publisher restart creates a new instance; late messages from an exited instance must not overwrite the new state.

Product config maps source/code to observe / degrade / fault health. Default WARNING → warning, ERROR → degrade; fault needs explicit rules. In v1 these rules only change the health conclusion—they do not auto-stop. Later whole-machine requests, permissions, action context, stop confirmation, and manual recovery will plug into the product state machine; motion and HI keep local protections.

## Quadruped entry points

In openember-quadruped, `products/quadruped-host/simulation.launch.yaml` orchestrates a unified router, motion, read-only `system_manager`, and F710; the default `launch.yaml` stays unchanged. Enabling `QUADRUPED_BUILD_SYSTEM_MANAGER` provides `quadruped_system_manager` and `quadruped_system_monitor`. The former must use independent observe credentials, query motion read-only, and aggregate alerts.

Logical state topic `/system/state`, snapshot endpoint `/system/state/get`. Consumers must combine `manager_session`, sequence, `online`, and `stale_after_ms`—do not keep the last “ok” forever. There is no cross-network state auth or whole-machine transition protocol yet.

Product build, credential prep, and bring-up steps: product repo `docs/simulation-bringup.md`. Framework contracts: core `docs/design/launch-readiness-and-dependencies.md` and `docs/design/system-state-manager.md`. Local tests cover delayed readiness, dependency failure, reverse-order shutdown, alert gaps and publisher restart, and staying disabled after a real MuJoCo service restart. There are no tests for boot-time autostart or real hardware protection.
