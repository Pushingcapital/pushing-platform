# Worker Subscription, API, Capability, and Automation Framework

## Purpose

This is the next layer on top of the worker labeling work.

The earlier framework labeled workers by:

- `worker_type`
- `subscription_mode`
- `network_family`
- `association_role`
- `involvement_tier`

That was useful, but not enough to automate the workers cleanly.

To automate workers safely, each worker also needs explicit metadata for:

- what it subscribes to
- how it is triggered
- what API surface it exposes or depends on
- where its capability contract comes from
- whether it needs heartbeat/state verification

## New Metadata Dimensions

Recommended fields to add to worker profile metadata:

1. `subscription_contract_type`
2. `trigger_types`
3. `api_surface_type`
4. `api_routes`
5. `capability_registry_source`
6. `automation_control_surface`
7. `heartbeat_required`
8. `heartbeat_surface`
9. `auth_scope`
10. `automation_notes`

---

## 1. `subscription_contract_type`

Recommended enum set:

- `feed_listener`
- `webhook_listener`
- `queue_listener`
- `polling_reader`
- `request_response_service`
- `interactive_operator_surface`
- `scheduled_runner`
- `hybrid`

Meaning:

- `feed_listener`
  - subscribes to a live feed, table, or log surface
- `webhook_listener`
  - wakes on provider callbacks
- `queue_listener`
  - wakes on queue/topic/outbox events
- `polling_reader`
  - checks a source periodically
- `request_response_service`
  - acts when called over HTTP/tool/API
- `interactive_operator_surface`
  - expects a human operator to invoke it
- `scheduled_runner`
  - driven by cron or explicit scheduler
- `hybrid`
  - combines two or more of the above

---

## 2. `trigger_types`

Recommended enum set:

- `manual`
- `request`
- `webhook`
- `scheduled`
- `approved_intake`
- `otp_verified`
- `notary_ready`
- `message_arrival`
- `warehouse_change`
- `attachment_arrival`

Verified trigger enum from the company control console:

- `manual`
- `approved_intake`
- `otp_verified`
- `notary_ready`
- `scheduled`

These are already persisted in:

- `company_automation_playbooks`
- `company_automation_runs`

---

## 3. `api_surface_type`

Recommended enum set:

- `registry_api`
- `action_catalog_api`
- `integration_api`
- `finance_api`
- `webhook_api`
- `worker_control_api`
- `internal_cron_api`
- `none_visible`

This separates:

- APIs that expose system capabilities
- APIs that mutate records
- APIs that only receive events
- APIs that only run scheduled internals

---

## 4. `api_routes`

This should be an array of exact routes where known.

Do not guess routes.
If a route is not proven, leave it blank or mark it as `needs discovery`.

### Verified orchestrator capability routes

- `GET /orchestration/agents/discover`
- `GET /orchestration/backend/registry`
- `GET /orchestration/backend/actions/catalog`

### Verified worker-control routes

- `POST /llm/workers/register`
- `POST /llm/workers/handoff`
- `GET /llm/workers/latest`

### Verified finance-core routes

- `GET /api/integrations`
- `GET /api/integrations/quickbooks/status`
- `GET /api/subscriptions`
- `GET /api/bills/upcoming`
- `GET /api/signal-quality`
- `GET /api/expenses`
- `GET /api/budget/overview`
- `POST /api/budget`
- `POST /api/budget/lines`
- `GET /api/email-events`
- `GET /api/raw-events`
- `POST /api/internal/cron`
- `GET /api/ledger/transactions`
- `GET /api/ledger/reconciliation`
- `GET /api/writebacks`
- `POST /api/writebacks/:id/approve`
- `POST /api/writebacks/:id/reject`
- `POST /webhooks/intuit`

---

## 5. `capability_registry_source`

Recommended enum set:

- `worker_sessions`
- `orchestrator_agent_registry`
- `backend_capability_registry`
- `backend_actions_catalog`
- `postman_action_registry`
- `company_automation_playbooks`
- `worker_surface_inventory`
- `manual_seed`

This is crucial.

A worker should never be treated as fully routable unless its capability truth can be traced to one of:

- the orchestrator registries
- the worker session registration flow
- Postman action registry
- automation playbook registry
- worker surface inventory

---

## 6. `automation_control_surface`

Recommended values:

- `company_automation_playbooks`
- `company_automation_runs`
- `worker_actions`
- `worker_handoffs`
- `orchestration_log`
- `current_state`
- `none_visible`

This answers:

- where this worker is actually scheduled or controlled
- where dry-run/live-run state should be checked
- where we should look when a worker appears “up” but is not doing anything

---

## 7. `heartbeat_required`

Boolean:

- `true`
- `false`

Rule of thumb:

- `true` for listeners, cron runners, registries, and control-plane workers
- `false` only for purely human-invoked or static UI surfaces that do not claim autonomous activity

---

## 8. `heartbeat_surface`

Recommended values:

- `current_state`
- `worker_sessions`
- `orchestration_log`
- `agent_trace_log`
- `company_automation_runs`
- `webhook_events`
- `none_visible`

The important operational principle is:

if a worker claims to listen, schedule, or mutate, it should advertise liveness somewhere.

---

## 9. `auth_scope`

Recommended enum set:

- `public`
- `viewer`
- `operator`
- `admin`
- `internal_only`
- `mixed`

Verified finance-core behavior:

- viewer routes:
  - `/api/subscriptions`
  - `/api/integrations`
  - `/api/integrations/quickbooks/status`
  - `/api/ledger/*`
  - `/api/writebacks`
- operator routes:
  - `/auth/intuit/start`
  - `/auth/intuit/disconnect`
  - `/api/budget`
  - `/api/budget/lines`
  - `/api/ledger/reconciliation/:id/match`
  - `/api/writebacks/:id/approve`
  - `/api/writebacks/:id/reject`
- internal-only:
  - `/api/internal/cron`
- webhook:
  - `/webhooks/intuit`

---

## 10. `automation_notes`

Freeform field for:

- missing route details
- inferred but unverified behavior
- dependency on secrets or registries
- whether a worker is safe to auto-arm

---

## Best Current Working Model

The worker control stack now looks like this:

### Listener truth

Captured by:

- `subscription_mode`
- `subscription_surfaces`
- `subscription_contract_type`

### Trigger truth

Captured by:

- `trigger_types`
- `automation_control_surface`

### API truth

Captured by:

- `api_surface_type`
- `api_routes`
- `auth_scope`

### Capability truth

Captured by:

- `capability_registry_source`

### Liveness truth

Captured by:

- `heartbeat_required`
- `heartbeat_surface`

---

## Most Important Verified Contracts

### `pushingcap_orchestrator`

- capability discovery:
  - `GET /orchestration/agents/discover`
  - `GET /orchestration/backend/registry`
  - `GET /orchestration/backend/actions/catalog`
- worker control:
  - `POST /llm/workers/register`
  - `POST /llm/workers/handoff`
  - `GET /llm/workers/latest`
- control data:
  - `worker_sessions`
  - `worker_handoffs`
  - `worker_actions`
  - `orchestration_log`
- heartbeat:
  - `current_state`
  - `worker_sessions`
  - `orchestration_log`

### `cloudflare_pc_finance_core_staging`

- subscription API:
  - `GET /api/subscriptions`
- integration status:
  - `GET /api/integrations`
  - `GET /api/integrations/quickbooks/status`
- webhook:
  - `POST /webhooks/intuit`
- scheduler:
  - `POST /api/internal/cron`
- automation behavior:
  - sync paygate to ledger
  - sync Gmail email events
  - backfill and reconcile email signals
  - refresh QuickBooks tokens
  - process writeback queue
  - retention enforcement

### `PushingAutomations`

- control tables:
  - `company_automation_playbooks`
  - `company_automation_runs`
- trigger types:
  - `manual`
  - `approved_intake`
  - `otp_verified`
  - `notary_ready`
  - `scheduled`

---

## What This Enables

Once this metadata is attached to worker profiles, we can automate:

1. Worker routing
   - choose only workers whose capability source and trigger type match the job

2. Safe auto-arming
   - only arm workers that have a known trigger and a heartbeat

3. Subscription debugging
   - tell whether a worker failed because:
     - no listener
     - wrong trigger
     - missing webhook
     - missing cron
     - missing capability registration

4. Control-plane audits
   - detect workers with:
     - no API contract
     - no capability source
     - no heartbeat
     - no automation control surface

---

## Best Next Move

The clean next implementation step is:

1. Keep the existing five label dimensions.
2. Add the ten fields in this file.
3. Seed them first for:
   - `pushingcap_orchestrator`
   - `cloudflare_pc_finance_core_staging`
   - `postman_api`
   - `ops_health`
   - `mac_messages_listener`
   - `bigquery_memory_hub`
4. Then roll the same shape across the remaining workers.

That gives Manny a worker registry that is not just descriptive.
It becomes automation-grade.
