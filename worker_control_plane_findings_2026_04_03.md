# Worker Control Plane Findings

Date: 2026-04-03

## Purpose

This brief re-ingests the current control-plane findings for the worker ecosystem, Push P, intake surfaces, and the `Pushing*` namespace map.

The goal is to preserve the current state of understanding in NotebookLM so the next mapping moves stay grounded.

## Core Operating Rule

The strongest reusable operating rule is:

- `BigQuery for evidence`
- `NotebookLM for meaning`
- `A relations management platform for action`

This should remain the default next-step heuristic for workers.

## Push P Next-Step Model

`Pushing P` should not guess from raw chat each turn.

It should:

1. grab the current workflow truth
2. evaluate the blocking gate or missing artifact
3. push the smallest safe record move
4. write back the handoff, trace, and memory

The current checked-in stack already expects this.

Important workflow snapshot fields already exist:

- `service_key`
- `stage`
- `stage_label`
- `documents`
- `quote`
- `next_required_action`

The client portal and memory worker already assume that next steps come from:

- workflow truth
- missing information
- notebook context
- current stage

## Worker Labeling Framework

The worker ecosystem now has a clean labeling frame with five axes:

1. `worker_type`
2. `subscription_mode`
3. `network_family`
4. `association_role`
5. `involvement_tier`

### Inventory summary

- `80` workers in the raw inventory
- strongest families:
  - `29` `cloudflare_*`
  - `17` `retool_*`
  - `15` `google_run_*`
  - `6` `bigquery_*`
- small central nucleus:
  - `pushingcap_orchestrator`
  - `mac_messages_listener`
  - `postman_api`
  - `ops_health`
  - `codex_design`
  - `runpod_media`

### Universal write surfaces

All workers currently write:

- `current_state`
- `worker_profiles`
- `chat_messages`

That means every worker already participates in:

- state advertisement
- worker registry presence
- control-plane chat logging

### Explicit listener truth

Workers with the clearest listener subscriptions:

- `bigquery_memory_hub`
  - `brain-481809.gold`
  - `brain-481809.worker_pulse_memory_v1`
- `bigquery_message_backfill`
  - `brain-481809.pcrm_backfill_v2`
- `bigquery_schema_warehouse`
  - `brain-481809.pushing_capital_warehouse`
- `codex_design`
  - `security.db`
- `mac_messages_listener`
  - `~/Library/Messages/chat.db`
- `ops_health`
  - `agent_trace_log`
- `postman_api`
  - `postman_action_registry`
- `pushingcap_orchestrator`
  - `chat_messages`
  - `chats`
  - `pc-orchestration`
  - `worker_actions`
  - `worker_handoffs`
  - `worker_sessions`
- `runpod_media`
  - `attachments_index`

### Recommended canonical labels

- `pushingcap_orchestrator`
  - `worker_type`: `control_plane_router`
  - `subscription_mode`: `omnibus_listener`
  - `network_family`: `platform_api`
  - `association_role`: `task_ticket_mutator`
  - `involvement_tier`: `core`
- `mac_messages_listener`
  - `worker_type`: `ingress_listener`
  - `subscription_mode`: `message_feed_listener`
  - `network_family`: `local_machine + platform_api`
  - `association_role`: `business_record_mutator`
  - `involvement_tier`: `core`
- `postman_api`
  - `worker_type`: `registry_or_api_specialist`
  - `subscription_mode`: `primary_surface_listener`
  - `network_family`: `postman + platform_api`
  - `association_role`: `api_contract_reader`
  - `involvement_tier`: `high`

## PushingForms, DMV, and Courses

The current reality is:

- `PushingForms` is strongest as doctrine plus an internal A relations management platform intake surface
- DMV is a real live workflow and compliance lane
- courses are a real learner ingress lane

### Strongest current findings

- `PushingForms` exists as an internal route branded as `PUBLIC INTAKE MATRIX`
- the doctrinal three-form model is:
  - Intake and Normalization Form
  - First Through The Door Contract
  - Exit Vector / Renewal Form
- DMV is already treated as a first-class automotive lane
- Push P currently defaults to `dmv_license_recovery`
- orchestration truth gates explicitly include:
  - `identity`
  - `finance`
  - `dmv`
- `userOne Courses` is a real public learner surface, not just a placeholder

### Control-plane interpretation

- `PushingForms` = cross-lane intake and consent system
- `DMV` = live automotive compliance and onboarding lane
- `Courses` = training and filtration lane

## Pushing Operator Control Plane

The operator-side namespaces that actually move work are:

- `PushingP`
- `PushingAutomations`
- `PushingConnections`
- `PushingAPI`
- `PushingWorkers`
- `PushingPay`
- `PushingPaygates`

### Current readings

- `PushingP`
  - live authenticated client execution surface
  - loads workflow snapshot and message mirror
- `PushingAutomations`
  - strongest maintained analogue is the internal company control console
  - already supports:
    - vault secret creation
    - automation playbook creation
    - dry-run and live queueing
    - playbook status changes
- `PushingConnections`
  - public connectivity and identity/governance wrapper
- `PushingAPI`
  - real registry layer for agent discovery, backend discovery, and action catalog discovery
- `PushingWorkers`
  - real worker identity, handoff, action, and orchestration-log plane
- `PushingPay`
  - already operational inside Push P through quote and payment-link flow
- `PushingPaygates`
  - best anchored to payment-event and lifecycle context behind execution

## Pushing Namespace Registry Seed

The current registry now has anchored or verified readings for:

- `PushingForms`
- `PushingTransport`
- `PushingInspections`
- `PushingAutomations`
- `PushingConnections`
- `PushingAPI`
- `PushingWorkers`
- `PushingSettings`
- `PushingSecrets`
- `PushingTokens`
- `PushingIdentity`
- `PushingCapabilities`
- `PushingAgentContracts`
- `PushingServers`
- `PushingSecurity`
- `PushingCourses`
- `PushingP`
- `PushingPay`
- `PushingPaygates`
- `PushingTools`
- `PushingWorkflowDebate`
- `PushingWorkflowDesign`
- `PushingLocation`
- `PushingMail`
- `PushingMarketing`

Important interpretation:

- these names are not one flat class
- some are public routes
- some are internal control surfaces
- some are embedded execution surfaces
- some are doctrine that still need formal runtime placement

## Best Current Control-Plane Picture

The platform is converging on a clear architecture:

1. Public and assisted ingress
   - `clientportal`
   - `subcontractorPortal`
   - `userOne Courses`
   - fallback intake
2. Workflow truth and gate evaluation
   - Push P snapshot
   - orchestration backend
   - notebook context
3. Worker execution layer
   - orchestrator
   - ingress listeners
   - warehouse readers
   - specialists
4. Durable control-plane memory
   - NotebookLM
   - BigQuery
   - worker traces and handoffs
5. A relations management platform action surface
   - stage updates
   - task and ticket moves
   - domain-object state changes

## Recommended Ongoing Rule

Do not let workers guess blindly.

For each next-step decision:

1. inspect workflow truth
2. inspect missing gate or artifact
3. inspect notebook context
4. recommend the smallest safe move
5. write back handoff, trace, and memory

## Source Artifacts

This brief synthesizes:

- `/Users/emmanuelhaddad/worker_labeling_framework.md`
- `/Users/emmanuelhaddad/worker_label_seed.csv`
- `/Users/emmanuelhaddad/pushing_forms_dmv_courses_map.md`
- `/Users/emmanuelhaddad/pushing_p_next_step_automation_architecture.md`
- `/Users/emmanuelhaddad/pushing_operator_control_plane_map.md`
- `/Users/emmanuelhaddad/pushing_namespace_registry_seed.md`
