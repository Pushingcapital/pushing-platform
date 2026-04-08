# Worker Subscription / API / Capability Property Pack

## Purpose

These are the exact worker-profile property names to use if we attach the new automation metadata into PCRM.

They line up directly with:

- [worker_subscription_api_capability_automation_framework.md](/Users/emmanuelhaddad/worker_subscription_api_capability_automation_framework.md)
- [worker_subscription_api_capability_seed.csv](/Users/emmanuelhaddad/worker_subscription_api_capability_seed.csv)

## Recommended Property Names

### Core subscription properties

- `wk_subscription_contract_type`
  - single select
  - values:
    - `feed_listener`
    - `webhook_listener`
    - `queue_listener`
    - `polling_reader`
    - `request_response_service`
    - `interactive_operator_surface`
    - `scheduled_runner`
    - `hybrid`

- `wk_trigger_types`
  - multi select
  - values:
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

- `wk_subscription_surfaces`
  - text or long text
  - semicolon-separated list or JSON array

### API properties

- `wk_api_surface_type`
  - multi select
  - values:
    - `registry_api`
    - `action_catalog_api`
    - `integration_api`
    - `finance_api`
    - `webhook_api`
    - `worker_control_api`
    - `internal_cron_api`
    - `none_visible`

- `wk_api_routes`
  - long text
  - semicolon-separated list of verified routes

- `wk_auth_scope`
  - single select
  - values:
    - `public`
    - `viewer`
    - `operator`
    - `admin`
    - `internal_only`
    - `mixed`

### Capability properties

- `wk_capability_registry_source`
  - multi select
  - values:
    - `worker_sessions`
    - `orchestrator_agent_registry`
    - `backend_capability_registry`
    - `backend_actions_catalog`
    - `postman_action_registry`
    - `company_automation_playbooks`
    - `worker_surface_inventory`
    - `manual_seed`

- `wk_automation_control_surface`
  - multi select
  - values:
    - `company_automation_playbooks`
    - `company_automation_runs`
    - `worker_actions`
    - `worker_handoffs`
    - `orchestration_log`
    - `current_state`
    - `agent_trace_log`
    - `webhook_events`
    - `none_visible`

### Heartbeat properties

- `wk_heartbeat_required`
  - boolean

- `wk_heartbeat_surface`
  - multi select
  - values:
    - `current_state`
    - `worker_sessions`
    - `orchestration_log`
    - `agent_trace_log`
    - `company_automation_runs`
    - `webhook_events`
    - `none_visible`

### Notes

- `wk_automation_notes`
  - long text

## Best Current Use

If Manny wants the smallest useful property set first, start with:

1. `wk_subscription_contract_type`
2. `wk_trigger_types`
3. `wk_api_routes`
4. `wk_capability_registry_source`
5. `wk_heartbeat_required`
6. `wk_heartbeat_surface`

That is enough to answer:

- what wakes this worker up
- what API truth it has
- where its capability truth comes from
- how we know it is alive
