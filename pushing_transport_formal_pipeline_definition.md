# PushingTransport Formal Pipeline Definition

## Purpose

This is the formal pipeline definition set for the `PushingTransport` lane.

It converts the transport workflow into the actual record stacks and stage sequences that PCRM should control.

## Pipeline Set

Transport should run through four coordinated pipeline shells:

1. intake pipeline
2. commercial pipeline
3. execution pipeline
4. micro-follow-through pipeline

The transport domain object and payment objects remain part of the lane, but they should not try to replace the pipelines themselves.

## Pipeline Registry

| Shell | Primary object | Pipeline name | Pipeline key | Status |
| --- | --- | --- | --- | --- |
| Intake | `p242835887_service_requests` | `Transport Intake` | `workflow_pipeline_service_requests_transport_intake_default` | proposed |
| Commercial | `deals` | `Auto Transport` | `workflow_pipeline_deals_auto_transport_default` | existing |
| Execution | `tickets` | `Auto Transport` | `workflow_pipeline_tickets_auto_transport_default` | existing |
| Micro-follow-through | `tasks` | `Transport Follow-Through` | `workflow_pipeline_tasks_transport_follow_through_default` | proposed |

## A. Intake Pipeline

### Pipeline record

| Field | Value |
| --- | --- |
| pipeline_name | `Transport Intake` |
| pipeline_key | `workflow_pipeline_service_requests_transport_intake_default` |
| primary_object | `p242835887_service_requests` |
| purpose | capture and normalize transport requests before commercial handoff |
| controlling_worker | `google_run_brain_ingestion` |
| support_worker | `pushingcap_orchestrator` |

### Proposed intake stages

| Order | Stage name | Stage key | Purpose | Exit gate |
| --- | --- | --- | --- | --- |
| 10 | `Request Received` | `workflow_stage_service_requests_transport_intake_default_request_received` | create the intake shell | source signal exists |
| 20 | `Route Normalizing` | `workflow_stage_service_requests_transport_intake_default_route_normalizing` | normalize route, vehicle, and identity | route and vehicle truth are structured |
| 30 | `Lane Classified` | `workflow_stage_service_requests_transport_intake_default_lane_classified` | confirm transport intent and subtype | lane is confirmed as transport |
| 40 | `Commercial Handoff Ready` | `workflow_stage_service_requests_transport_intake_default_commercial_handoff_ready` | ready to spawn or bind a deal | minimal gates satisfied |
| 50 | `Bound To Deal` | `workflow_stage_service_requests_transport_intake_default_bound_to_deal` | linked to downstream commercial shell | deal association exists |

### Intake spawn rules

- entering `Commercial Handoff Ready` should prepare deal creation
- entering `Bound To Deal` must associate the service request to the live deal
- missing documents or callbacks should spawn tasks in the micro-follow-through lane

## B. Commercial Pipeline

### Pipeline record

| Field | Value |
| --- | --- |
| pipeline_name | `Auto Transport` |
| pipeline_key | `workflow_pipeline_deals_auto_transport_default` |
| primary_object | `deals` |
| existing_pipeline_id | `1010023152` |
| purpose | own quote, authorization, negotiation, and close logic |
| controlling_worker | `pushingcap_orchestrator` |

### Confirmed commercial stages

| Order | Stage name | Stage id | Control meaning | Exit gate |
| --- | --- | --- | --- | --- |
| 10 | `Form Submitted` | `1560258245` | transport ask exists but is not commercially ready | intake normalized |
| 20 | `Central Dispatch Quote` | `1552146125` | market quote lane is active | dispatch quote captured |
| 30 | `Collect Quote` | `1552146127` | internal commercial quote is being assembled | internal quote logged |
| 40 | `Send Quote for Authorization` | `1552146126` | buyer approval is in flight | authorization response recorded |
| 50 | `Negotiate & Close Driver` | `1552146128` | carrier and pricing terms are being finalized | carrier terms confirmed |
| 60 | `Connect Driver to Client` | `1552146129` | parties are linked and expectation handoff is live | buyer and driver connection complete |
| 70 | `Post Job` | `1560258246` | active job is on the board and underway | execution packet exists |
| 80 | `Customer Success Check In` | `1560258248` | active support or check-in phase | delivery or support truth updated |
| 90 | `Support` | `1560258247` | issue resolution or exception handling | support resolved |
| 100 | `Closed Won` | `2317418225` | commercial result is complete | delivery proof and commercial close align |
| 110 | `Payout Completed` | `2317418226` | money and closeout are done | payout and writeback complete |

### Commercial spawn rules

- on `Form Submitted`: ensure or bind execution ticket shell
- on `Central Dispatch Quote`: create quote-collection tasks
- on `Send Quote for Authorization`: create callback and authorization review tasks
- on `Negotiate & Close Driver`: create carrier verification tasks
- on `Post Job`: ensure transport execution ticket is actively bound
- on `Closed Won`: require delivery proof before final payout close

## C. Execution Pipeline

### Pipeline record

| Field | Value |
| --- | --- |
| pipeline_name | `Auto Transport` |
| pipeline_key | `workflow_pipeline_tickets_auto_transport_default` |
| primary_object | `tickets` |
| existing_pipeline_id | `1427939004` |
| purpose | own operational dispatch, coordination, document capture, and active support |
| controlling_worker | `pushingcap_orchestrator` |

### Confirmed execution stages

| Order | Stage name | Stage id | Control meaning | Exit gate |
| --- | --- | --- | --- | --- |
| 10 | `Form Submitted` | `2300136158` | execution shell exists but is not active yet | dispatch packet forming |
| 20 | `Central Dispatch Quote` | `2300136159` | market and dispatch context are attached | quote context attached |
| 30 | `Send Quote for Authorization` | `2300136160` | execution waiting on commercial consent | consent state known |
| 40 | `Collect Quote` | `2300136161` | execution support tasks are chasing missing info | quote packet complete |
| 50 | `Post Job` | `2300136162` | job is active and dispatchable | carrier assignment or posting exists |
| 60 | `Negotiate & Close Driver` | `2300136163` | carrier and route operations are closing | carrier confirmed |
| 70 | `Connect Driver to Client` | `2300136164` | operational parties are connected | connection confirmed |
| 80 | `Support` | `2300136165` | issue handling and exception resolution | issue cleared or support path set |
| 90 | `Customer Success Check In` | `2300136166` | late-stage fulfillment and delivery follow-through | delivery state updated |

### Execution rule

The execution ticket should stop before `Closed Won` and `Payout Completed`.

The deal owns commercial final truth.
The ticket owns operational truth.

### Execution spawn rules

- on `Post Job`: create pickup, GPS, and BOL task pack
- on `Negotiate & Close Driver`: create carrier confirmation task pack
- on `Connect Driver to Client`: create communication confirmation task pack
- on `Support`: create blocker-recovery tasks and callback tasks
- on `Customer Success Check In`: create delivery-proof and closeout tasks

## D. Micro-Follow-Through Pipeline

### Pipeline record

| Field | Value |
| --- | --- |
| pipeline_name | `Transport Follow-Through` |
| pipeline_key | `workflow_pipeline_tasks_transport_follow_through_default` |
| primary_object | `tasks` |
| purpose | absorb missing artifacts, callbacks, blockers, and proof-chase work |
| controlling_worker | `pushingcap_orchestrator` |
| support_workers | `ops_health`, `pushingcap_sick_memory_dude`, `google_run_pc_paygate_bridge` |

### Proposed task stages

| Order | Stage name | Stage key | Purpose | Exit gate |
| --- | --- | --- | --- | --- |
| 10 | `Queued` | `workflow_stage_tasks_transport_follow_through_default_queued` | task exists but is not yet in motion | owner and scope assigned |
| 20 | `Working` | `workflow_stage_tasks_transport_follow_through_default_working` | active micro-deliverable in progress | outcome or blocker is known |
| 30 | `Waiting` | `workflow_stage_tasks_transport_follow_through_default_waiting` | external response or callback is required | dependency resolved |
| 40 | `Blocked` | `workflow_stage_tasks_transport_follow_through_default_blocked` | explicit blocker prevents movement | blocker resolved or rerouted |
| 50 | `Proof Captured` | `workflow_stage_tasks_transport_follow_through_default_proof_captured` | evidence artifact was obtained | evidence linked upstream |
| 60 | `Complete` | `workflow_stage_tasks_transport_follow_through_default_complete` | micro-deliverable is done | output recorded and upstream updated |

### Canonical task types

- quote chase
- authorization callback
- carrier verification
- pickup confirmation
- GPS or location follow-up
- BOL upload chase
- proof of delivery chase
- payout follow-up
- memory writeback
- exception recovery

## Parent-Child Graph

1. service request is the intake shell
2. deal is the commercial shell
3. ticket is the execution shell
4. tasks are the micro shell
5. transport object stores domain detail
6. quote, invoice, and payout objects close the money loop

## Cross-Pipeline Handoffs

| Trigger | Result |
| --- | --- |
| intake stage reaches `Commercial Handoff Ready` | create or bind a deal |
| deal enters `Form Submitted` | create or bind execution ticket |
| deal or ticket enters active stages | spawn task pack |
| ticket enters support or check-in | spawn blocker or proof task pack |
| deal reaches `Closed Won` | require payout and memory writeback checks |
| payout closes | trigger memory writeback and final completion |

## Stage-Gate Discipline

- stage change is allowed only if the matching mini deliverable is satisfied
- if not satisfied, create or move a task instead of forcing the stage
- if a dependency is external, move the task to `Waiting`
- if a blocker is explicit, move the task to `Blocked`
- if proof exists, link it and promote upstream stage truth

## Companion Records

- [pushing_transport_formal_workflow_definition.md](/Users/emmanuelhaddad/pushing_transport_formal_workflow_definition.md)
- [pushing_transport_canonical_execution_matrix.md](/Users/emmanuelhaddad/pushing_transport_canonical_execution_matrix.md)
- [pushing_transport_bundle_contract.md](/Users/emmanuelhaddad/pushing_transport_bundle_contract.md)
