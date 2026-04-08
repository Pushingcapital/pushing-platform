# PushingTransport Formal Workflow Definition

## Purpose

This is the formal workflow definition for the `PushingTransport` lane.

It turns the transport research into one durable control workflow that `P`, operators, and workers can follow without guessing.

## Workflow Record

| Field | Value |
| --- | --- |
| workflow_name | `PushingTransport Lane Orchestration` |
| workflow_key | `workflow_transport_lane_orchestration_default` |
| lane_key | `pushing_transport` |
| business_domain | `automotive_logistics` |
| primary_public_surface | `PushingTransport` |
| primary_operator_surface | `internal_crm` |
| primary_mobile_surface | `subcontractorPortal` |
| controlling_worker | `pushingcap_orchestrator` |
| supporting_workers | `google_run_brain_ingestion`, `postman_api`, `pushingcap_sick_memory_dude`, `google_run_pc_paygate_bridge`, `ops_health` |
| entry_record_type | `p242835887_service_requests` |
| commercial_record_type | `deals` |
| execution_record_type | `tickets` |
| micro_record_type | `tasks` |
| domain_record_type | `p242835887_transport` |
| payment_record_types | `quotes`, `invoices`, `p242835887_payouts` |
| final_outcome | `delivered_and_written_back` |

## Core Rule

Transport should move through six reusable phases:

1. `ingest`
2. `bind`
3. `qualify`
4. `execute`
5. `verify`
6. `writeback`

Each phase should advance only when the mini deliverables for that phase are satisfied.

## Workflow Phases

### 1. `ingest`

Purpose:
- capture the request
- normalize route and identity
- establish transport intent

Primary record:
- `p242835887_service_requests`

Required outputs:
- `transport_request_received`
- `route_normalized`
- `vehicle_identity_normalized`
- `buyer_identity_confirmed`
- `source_channel_logged`

Primary owner:
- `google_run_brain_ingestion`

Supporting owner:
- `pushingcap_orchestrator`

Exit gate:
- the intake shell is normalized enough to justify downstream binding

### 2. `bind`

Purpose:
- attach the right execution shells
- turn raw intake into a coherent transport bundle

Primary records:
- `p242835887_service_requests`
- `deals`
- `tickets`
- `p242835887_transport`

Required outputs:
- service request linked to deal
- execution ticket created or linked
- transport domain object created or linked
- customer and company associations normalized

Primary owner:
- `pushingcap_orchestrator`

Supporting owner:
- `postman_api`

Exit gate:
- the transport bundle has all required parent-child links

### 3. `qualify`

Purpose:
- decide whether the transport job is ready for live movement

Primary records:
- `deals`
- `quotes`
- `tasks`

Required outputs:
- `dispatch_market_checked`
- `central_dispatch_quote_recorded`
- `internal_quote_compiled`
- `authorization_sent`
- `authorization_response_recorded`

Primary owner:
- `pushingcap_orchestrator`

Supporting owners:
- `postman_api`
- quote and finance support lanes

Exit gate:
- commercial truth is sufficient to move into execution

### 4. `execute`

Purpose:
- run the transport job through dispatch, carrier coordination, and live control

Primary records:
- `tickets`
- `tasks`
- `p242835887_transport`

Required outputs:
- `carrier_candidate_identified`
- `carrier_terms_confirmed`
- `driver_assigned`
- `buyer_driver_connection_created`
- `job_posted`
- `pickup_window_confirmed`
- `location_update_logged`

Primary owner:
- `pushingcap_orchestrator`

Supporting owners:
- transport execution lane
- mobile worker lane
- `ops_health`

Exit gate:
- the route has either completed or reached a supported exception state

### 5. `verify`

Purpose:
- confirm the execution result and make sure proof and closeout artifacts exist

Primary records:
- `tickets`
- `tasks`
- `p242835887_transport`
- `quotes`
- `p242835887_payouts`

Required outputs:
- `bol_captured`
- `delivery_confirmed`
- `customer_charge_confirmed`
- `carrier_pay_confirmed`
- `payout_record_closed`

Primary owner:
- `google_run_pc_paygate_bridge`

Supporting owners:
- `pushingcap_orchestrator`
- `ops_health`

Exit gate:
- commercial and execution truth agree that the job is complete

### 6. `writeback`

Purpose:
- preserve route truth
- record what happened
- train the system

Required outputs:
- `memory_writeback_completed`
- outcome written to A relations management platform
- route memory logged
- blockers and exceptions preserved

Primary owner:
- `pushingcap_sick_memory_dude`

Supporting owners:
- `bigquery_memory_hub`
- `pushingcap_orchestrator`

Exit gate:
- the transport lane is fully closed and reusable as precedent

## Workflow Handoffs

| From phase | To phase | Handoff condition | Owning worker |
| --- | --- | --- | --- |
| `ingest` | `bind` | route, vehicle, buyer, and channel are normalized | `google_run_brain_ingestion` |
| `bind` | `qualify` | service request, deal, ticket, and transport object are linked | `pushingcap_orchestrator` |
| `qualify` | `execute` | quote and authorization truth are sufficient | `pushingcap_orchestrator` |
| `execute` | `verify` | dispatch and delivery sequence reached terminal or supportable state | `pushingcap_orchestrator` |
| `verify` | `writeback` | proof, payout, and completion truth align | `google_run_pc_paygate_bridge` |

## Workflow Snapshot Contract

Every active transport lane should be representable as one readable snapshot.

Required outputs:
- `active_phase`
- `active_pipeline_stage`
- `current_blocking_gate`
- `next_required_action`
- `linked_service_request`
- `linked_deal`
- `linked_execution_ticket`
- `open_tasks`
- `quote_payment_state`
- `memory_writeback_required`
- `recommended_smallest_safe_move`

## Control Ticket Contract

The transport lane should maintain one parent control ticket with these required fields:

- `lane_key = pushing_transport`
- `current_phase`
- `next_required_action`
- `controlling_worker = pushingcap_orchestrator`
- `blocking_gate`
- `callback_due_at`
- `writeback_required`
- `linked_primary_deal`
- `linked_primary_ticket`
- `linked_primary_transport_object`

## Automation Playbook Contract

Transport automation should not improvise.

For each phase it must know:
- trigger source
- dry-run vs live-run
- guardrails
- smallest safe move
- rollback rule
- heartbeat expectation

Default trigger sources:
- public intake submission
- operator stage move
- ticket or task callback due
- payment update
- delivery proof upload
- scheduled reconciliation

## External System Dependencies

| System | Workflow role |
| --- | --- |
| `Central Dispatch` | quote and dispatch market truth |
| `Super Dispatch` | optional dispatch coordination |
| Google Maps | route and distance truth |
| GPS and location stack | live in-transit signals |
| SMS and email | buyer and carrier coordination |
| document storage | BOL, proof, and supporting documents |
| payment surfaces | quote, charge, payout |

## Hard Gates

- do not leave `ingest` without normalized route and customer identity
- do not leave `bind` without linked commercial and execution shells
- do not leave `qualify` without quote and authorization truth
- do not leave `execute` without a clear delivery or support condition
- do not leave `verify` without proof and payout truth
- do not leave `writeback` until the route memory is durable

## Failure And Exception Rule

If a transport job is blocked:

1. keep the parent control ticket active
2. keep the deal as commercial truth
3. keep the ticket as operational truth
4. push blockers into tasks instead of vague notes
5. let `ops_health` or support lanes own the exception choreography

## Companion Records

- [pushing_transport_formal_pipeline_definition.md](/Users/emmanuelhaddad/pushing_transport_formal_pipeline_definition.md)
- [pushing_transport_canonical_execution_matrix.md](/Users/emmanuelhaddad/pushing_transport_canonical_execution_matrix.md)
- [pushing_transport_bundle_contract.md](/Users/emmanuelhaddad/pushing_transport_bundle_contract.md)
