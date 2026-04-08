# Worker Labeling Framework

## Purpose

This is the first clean labeling framework for workers.

The goal is to label each worker across five dimensions:

1. `worker_type`
2. `subscription_mode`
3. `network_family`
4. `association_role`
5. `involvement_tier`

This keeps worker profiles from becoming a flat list of names.

## Strongest Inventory Sources

- [worker-db-inventory-20260326.json](/Users/emmanuelhaddad/worker-db-inventory-20260326.json)
- [worker-db-inventory-strict-by-worker-20260326.json](/Users/emmanuelhaddad/worker-db-inventory-strict-by-worker-20260326.json)
- [worker-db-inventory-harddb-20260326.json](/Users/emmanuelhaddad/worker-db-inventory-harddb-20260326.json)
- [worker_surface_snapshot.md](/Users/emmanuelhaddad/projects/worker-pulse-console/worker_surface_snapshot.md)

## What The Data Says

There are `80` workers in the raw inventory.

The strongest worker families by name and access shape are:

- `29` `cloudflare_*` edge workers
- `17` `retool_*` operator UI workers
- `15` `google_run_*` runtime services
- `6` `bigquery_*` warehouse readers
- a small central nucleus:
  - `pushingcap_orchestrator`
  - `mac_messages_listener`
  - `postman_api`
  - `ops_health`
  - `codex_design`
  - `runpod_media`

The raw self-report inventory also shows three universal write surfaces:

- `current_state`
- `worker_profiles`
- `chat_messages`

All `80` workers write those three.

That means every worker already participates in:

- state advertisement
- worker-registry presence
- chat/control-plane logging

## The Five Label Dimensions

## 1. `worker_type`

Recommended enum set:

- `control_plane_router`
- `ingress_listener`
- `warehouse_reader`
- `edge_worker`
- `runtime_service`
- `operator_ui_worker`
- `memory_augmented_specialist`
- `asset_generator`
- `channel_operator`
- `registry_or_api_specialist`

## 2. `subscription_mode`

Recommended enum set:

- `omnibus_listener`
- `primary_surface_listener`
- `event_listener`
- `polling_reader`
- `request_driven`
- `interactive_operator`
- `attachment_listener`
- `message_feed_listener`

## 3. `network_family`

Recommended enum set:

- `platform_api`
- `cloudflare`
- `gcp`
- `retool`
- `local_machine`
- `security_vault`
- `postman`
- `runpod_media`
- `social_platform`

## 4. `association_role`

Recommended enum set:

- `state_presence_writer`
- `memory_lineage_writer`
- `business_record_mutator`
- `task_ticket_mutator`
- `asset_mutator`
- `worker_registry_reader`
- `payment_lane_support`
- `api_contract_reader`
- `channel_identity_operator`

## 5. `involvement_tier`

Recommended enum set:

- `core`
- `high`
- `medium`
- `specialist`
- `support`

## Listener / Subscription Truth

The cleanest subscription map comes from the strict by-worker inventory:

- [worker-db-inventory-strict-by-worker-20260326.json](/Users/emmanuelhaddad/worker-db-inventory-strict-by-worker-20260326.json)

Workers with explicit listener subscriptions:

- `bigquery_memory_hub`
  - listens to `brain-481809.gold`
  - listens to `brain-481809.worker_pulse_memory_v1`
- `bigquery_message_backfill`
  - listens to `brain-481809.pcrm_backfill_v2`
- `bigquery_schema_warehouse`
  - listens to `brain-481809.pushing_capital_warehouse`
- `codex_design`
  - listens to `security.db`
- `mac_messages_listener`
  - listens to `~/Library/Messages/chat.db`
- `ops_health`
  - listens to `agent_trace_log`
- `postman_api`
  - listens to `postman_action_registry`
- `pushingcap_orchestrator`
  - listens to `chat_messages`
  - listens to `chats`
  - listens to `pc-orchestration`
  - listens to `worker_actions`
  - listens to `worker_handoffs`
  - listens to `worker_sessions`
- `runpod_media`
  - listens to `attachments_index`

This is the cleanest split between:

- workers that must stay subscribed to a feed
- workers that mostly respond to routed requests

## Network Families

Derived from actual read surfaces in [worker-db-inventory-20260326.json](/Users/emmanuelhaddad/worker-db-inventory-20260326.json):

- `platform_api`: `74` workers
  - strongest shared network plane
  - mainly `pc-orchestration` and `platform.pushingcap.com`
- `cloudflare`: `29` workers
- `gcp`: `21` workers
- `retool`: `17` workers
- `security_vault`: `5` workers
- `runpod_media`: `2` workers
- `local_machine`: `1` worker
- `postman`: `1` worker

This means the actual worker network hierarchy is:

1. `platform_api` is the shared spine
2. `cloudflare` and `gcp` are the dominant runtime families
3. `retool` is the operator worker layer
4. everything else is specialist networking

## Association Roles

The cleanest association pattern is:

### Universal state association

All `80` workers write:

- `current_state`
- `worker_profiles`
- `chat_messages`

That makes every worker at least a:

- `state_presence_writer`

### Memory association cluster

`13` workers also write:

- `ai_commitment`
- `ai_conversation`
- `ai_memory`
- `attributes`
- `pc_company_vision`
- `pc_relationship`
- `principals`
- `referral_partners`
- `memory_route_lineage`
- `memory_ingest_batch`

This cluster includes:

- `pushingcap_orchestrator`
- `mac_messages_listener`
- `postman_api`
- `ops_health`
- `codex_design`
- `google_presence`
- `meta_business`
- `instagram_platform`
- `linkedin_bing_profile`
- `tiktok_platform`
- `x_platform`
- `youtube_channel`
- `runpod_media`

These are the real:

- `memory_lineage_writer`

workers.

### Business record mutators

Very few workers directly touch business records in the raw self-report:

- `mac_messages_listener`
  - writes `contacts`
  - writes `deals`
- `pushingcap_orchestrator`
  - writes `tasks`
  - writes `tickets`
- `codex_design`
  - writes `generated_assets`
- `runpod_media`
  - writes `generated_assets`

This is important.

Most workers are not business record mutators.
Most workers are state, memory, or network participants.

## Recommended Seed Labels By Worker Cluster

## A. `pushingcap_orchestrator`

Evidence:

- [worker-db-inventory-20260326.json](/Users/emmanuelhaddad/worker-db-inventory-20260326.json)

Observed role:

- reads `current_state`, `pc-orchestration`, `worker_sessions`, `worker_handoffs`, `worker_actions`
- writes `tasks`, `tickets`, memory surfaces, and state surfaces
- listens to the broadest control-plane set

Recommended labels:

- `worker_type = control_plane_router`
- `subscription_mode = omnibus_listener`
- `network_family = platform_api`
- `association_role = task_ticket_mutator`
- `involvement_tier = core`

## B. `mac_messages_listener`

Observed role:

- listens to `~/Library/Messages/chat.db`
- reads local message logs plus orchestration
- writes `contacts`, `deals`, memory surfaces, and state surfaces

Recommended labels:

- `worker_type = ingress_listener`
- `subscription_mode = message_feed_listener`
- `network_family = local_machine`
- `association_role = business_record_mutator`
- `involvement_tier = core`

## C. `postman_api`

Observed role:

- listens to `postman_action_registry`
- reads `security.db`, `postman_action_registry`, `pc-orchestration`
- writes memory and state surfaces

Recommended labels:

- `worker_type = registry_or_api_specialist`
- `subscription_mode = primary_surface_listener`
- `network_family = postman`
- `association_role = api_contract_reader`
- `involvement_tier = high`

## D. `ops_health`

Observed role:

- listens to `agent_trace_log`
- reads `worker_actions`
- writes memory and state surfaces

Recommended labels:

- `worker_type = memory_augmented_specialist`
- `subscription_mode = event_listener`
- `network_family = platform_api`
- `association_role = worker_registry_reader`
- `involvement_tier = high`

## E. `codex_design`

Observed role:

- listens to `security.db`
- reads `generated_assets`
- writes `generated_assets` plus memory/state surfaces

Recommended labels:

- `worker_type = asset_generator`
- `subscription_mode = primary_surface_listener`
- `network_family = runpod_media`
- `association_role = asset_mutator`
- `involvement_tier = high`

## F. `runpod_media`

Observed role:

- listens to `attachments_index`
- reads `generated_assets` and orchestration
- writes `generated_assets` plus memory/state surfaces

Recommended labels:

- `worker_type = asset_generator`
- `subscription_mode = attachment_listener`
- `network_family = runpod_media`
- `association_role = asset_mutator`
- `involvement_tier = high`

## G. `bigquery_*`

Observed role:

- read warehouse datasets
- only write `chat_messages`, `worker_profiles`, `current_state`
- several hold primary listener responsibility for warehouse surfaces

Recommended labels:

- `worker_type = warehouse_reader`
- `subscription_mode = primary_surface_listener` for `bigquery_memory_hub`, `bigquery_message_backfill`, `bigquery_schema_warehouse`
- `subscription_mode = polling_reader` for the others
- `network_family = gcp`
- `association_role = state_presence_writer`
- `involvement_tier = specialist`

## H. `cloudflare_*`

Observed role:

- dominant edge runtime family
- almost all read `pc-orchestration`, `current_state`, and `cloudflare-account`
- mostly write only state surfaces

Recommended labels:

- `worker_type = edge_worker`
- `subscription_mode = request_driven`
- `network_family = cloudflare`
- `association_role = state_presence_writer`
- `involvement_tier = medium`

## I. `google_run_*`

Observed role:

- read `pc-orchestration`, `brain-481809`, and `cloud-run`
- mostly write only state surfaces

Recommended labels:

- `worker_type = runtime_service`
- `subscription_mode = request_driven`
- `network_family = gcp`
- `association_role = state_presence_writer`
- `involvement_tier = medium`

Special note:

- `google_run_pc_paygate_bridge`
  - add `association_role = payment_lane_support`
- `google_run_userone_courses_mvp`
  - course / learner runtime

## J. `retool_*`

Observed role:

- `17` workers
- read `retool-workflows`, `platform.pushingcap.com`, and `pc-orchestration`
- write state surfaces

Recommended labels:

- `worker_type = operator_ui_worker`
- `subscription_mode = interactive_operator`
- `network_family = retool`
- `association_role = state_presence_writer`
- `involvement_tier = medium`

## K. social / presence workers

Workers:

- `meta_business`
- `instagram_platform`
- `youtube_channel`
- `tiktok_platform`
- `x_platform`
- `google_presence`
- `linkedin_bing_profile`

Observed role:

- memory-heavy
- channel / identity oriented
- read `security.db` or orchestration
- write memory lineage surfaces

Recommended labels:

- `worker_type = channel_operator`
- `subscription_mode = request_driven`
- `network_family = social_platform`
- `association_role = channel_identity_operator`
- `involvement_tier = medium`

## Involvement Tiers

Recommended first-pass tiering:

### `core`

- `pushingcap_orchestrator`
- `mac_messages_listener`

### `high`

- `postman_api`
- `ops_health`
- `codex_design`
- `runpod_media`
- `bigquery_memory_hub`

### `medium`

- all `cloudflare_*`
- all `google_run_*`
- all `retool_*`
- social / presence workers

### `specialist`

- most remaining `bigquery_*`
- narrow connector workers

## Proposed Worker Profile Fields

Each `worker_profile` should eventually carry:

- `worker_type`
- `subscription_mode`
- `subscription_surfaces[]`
- `network_family[]`
- `association_role[]`
- `involvement_tier`
- `primary_reads[]`
- `primary_writes[]`
- `primary_listener_surface`
- `commercial_impact_level`
- `memory_writeback_enabled`
- `record_mutation_scope`

## Bottom Line

The swarm is not one homogeneous worker pool.

The real structure is:

- one central router
- one ingress mutator
- a handful of registry / memory / asset specialists
- large runtime families in Cloudflare, GCP, and Retool
- a small number of true listener subscriptions
- very few workers with direct business-record mutation power

That is the structure we should encode into `worker_profiles` before we try to use the swarm like a disciplined operating network.
