# PushingTransport Workflow And Pipeline Spec

Date: 2026-04-03
Owner: Manny + Codex
Status: Working operator spec
Purpose: Define how transport should actually run in PCRM when Pushing Capital orchestrates the deal, owns the software and platform, and does not need to be physically in the field.

## Core Principle

PushingTransport is not a "go drive the truck" business process.

It is an orchestration business process.

That means the platform must control:

- intake
- qualification
- pricing
- client authorization
- dispatch
- subcontractor or carrier coordination
- document collection
- status communication
- payout and closeout
- memory and audit trail

The field leg can be executed by a carrier, tower, dispatcher, subcontractor, or partner.
The control leg stays inside PCRM.

## What Makes It Work Without Being Out There

We do not need to be on site if the control plane is tighter than the field chaos.

That means every transport deal must have:

- a normalized intake shell
- a single commercial record
- a single execution ticket
- micro-tasks for missing artifacts and follow-through
- clear worker ownership at each stage
- external platform touchpoints recorded, not implied
- a rule for what must be true before the next stage opens

If that structure is present, the platform orchestrates the job even when the actual vehicle movement is performed elsewhere.

## Recommended Object Stack

### 1. Intake shell

Primary object:
- `p242835887_service_requests`

Purpose:
- capture the request before we know if it is dispatchable

Best live examples:
- `187341444847` = `C300 transport NY-OC`
- `163625935584` = `Transport - Audi Q5`

### 2. Commercial shell

Primary object:
- `deals`

Purpose:
- price the job, move the client through authorization, carry the commercial state

Best live example:
- `126036980423` = `Aston Vantage Black one`

Auto Transport deal pipeline:
- pipeline id `1010023152`

### 3. Execution shell

Primary object:
- `tickets`

Purpose:
- carry the active transport execution route

Best live example:
- `235401700037` = `Auto Transport: Aston Vantage Black one`

Auto Transport ticket pipeline:
- pipeline id `1427939004`

### 4. Micro-follow-through lane

Primary object:
- `tasks`

Purpose:
- handle one-off document chases, callbacks, and missing artifacts

Best live example:
- `290833799923` = `Follow up on BOL`

### 5. Payment and payout lane

Primary objects:
- `quotes`
- `p242835887_payouts`
- payment fields on `deals`

Best live example:
- `138662677194` = transport quote artifact

### 6. Future dispatch object

Primary object:
- `p242835887_transport`

Purpose:
- eventually become the explicit dispatch-state object

Current reality:
- it exists, but is still too skeletal to be the primary control object today

## Best First Workflow Shape

Use one workflow with three linked pipelines instead of one giant object trying to do everything.

Workflow name:
- `transport_deal_orchestration_v1`

Workflow intent:
- take a transport request from intake to paid closeout while the platform owns control and the field execution may happen through outside carriers or subcontractors

Pipeline stack:

1. `Service Request Pipeline`
   - owns request capture and intake normalization
2. `Auto Transport` on `deals`
   - owns pricing, authorization, and commercial progression
3. `Auto Transport` on `tickets`
   - owns operational execution and dispatch control
4. generic task pipeline
   - owns document chases, callback follow-through, and exceptions

## Deal Mini Steps

These are the mini steps to the deal, not just the big labels.

| macro stage | mini step | primary object | owner | external touch | done signal |
|---|---|---|---|---|---|
| `Form Submitted` | capture request shell | `p242835887_service_requests` | `google_run_brain_ingestion` | public page, intake form, chat, call, SMS, email | request exists with service type, request name, request date |
| `Form Submitted` | normalize transport lane | `p242835887_service_requests` | `pushingcap_orchestrator` | PCRM only | `current_phase`, `service_status`, owner, basic route intent are set |
| `Form Submitted` | create commercial shell | `deals` | `pushingcap_orchestrator` | PCRM only | deal exists in Auto Transport pipeline |
| `Form Submitted` | create execution shell | `tickets` | `pushingcap_orchestrator` | PCRM only | transport execution ticket exists and is tied to the deal |
| `Central Dispatch Quote` | verify route and vehicle facts | `deals` + `ticket` | `pushingcap_orchestrator` | phone, SMS, email, client portal | pickup, dropoff, vehicle, timing, and client contact are confirmed |
| `Central Dispatch Quote` | price the lane | `deals` | `pushingcap_orchestrator` | Central Dispatch, optional Super Dispatch, Google Maps / distance research | target buy rate and target sell rate are known |
| `Collect Quote` | build quote package | `quotes` + `deals` | `google_run_pc_paygate_bridge` | quote engine, payment-link lane | quote amount and terms are generated |
| `Collect Quote` | gather required docs | `tasks` | `pushingcap_orchestrator` | email, SMS, upload path, client portal | missing ID, vehicle docs, or dispatch info are resolved |
| `Send Quote for Authorization` | send quote and approval ask | `quotes` + `deals` | `google_run_pc_paygate_bridge` | email, quote link, portal | quote sent and client response is pending |
| `Send Quote for Authorization` | confirm dispatch readiness | `deals` + `ticket` | `pushingcap_orchestrator` | client call, SMS, email | client approved price and job is dispatchable |
| `Negotiate & Close Driver` | post and compare carrier options | `ticket` | `pushingcap_orchestrator` | Central Dispatch, subcontractor lane, phone, SMS | at least one viable carrier option exists |
| `Negotiate & Close Driver` | verify carrier package | `ticket` + `tasks` | `pushingcap_orchestrator` | carrier docs, insurance, identity, references | selected carrier is trusted enough to assign |
| `Negotiate & Close Driver` | lock economics | `deals` | `pushingcap_orchestrator` | Central Dispatch, direct negotiation | carrier pay, margin, and schedule are agreed |
| `Connect Driver to Client` | make the introduction | `ticket` | `pushingcap_orchestrator` | SMS, call, email | client and driver/carrier have the same pickup plan |
| `Connect Driver to Client` | prepare dispatch packet | `ticket` + `tasks` | `pushingcap_orchestrator` | BOL, route notes, contact sheet | driver packet is complete |
| `Post Job` | release job live | `ticket` | `pushingcap_orchestrator` | Central Dispatch or direct carrier comms | job is live with assigned carrier and schedule |
| `Post Job` | mark transport shell | `p242835887_transport` when mature, otherwise `ticket` + `deal` | `pushingcap_orchestrator` | PCRM only | dispatch state is visible in-platform |
| `Customer Success Check In` | confirm pickup | `ticket` | `pushingcap_orchestrator` | driver update, client update | pickup happened or exception is logged |
| `Customer Success Check In` | run movement updates | `tasks` | `pushingcap_orchestrator` | phone, SMS, GPS/location, maps | ETA/status updates are captured |
| `Support` | collect BOL and delivery proof | `tasks` + `ticket` | `pushingcap_orchestrator` | BOL upload, photos, email, portal | BOL or delivery evidence is attached |
| `Support` | resolve damage, delay, or payment issues | `tickets` + `tasks` | `pushingcap_orchestrator` | customer support, carrier support | every exception has an explicit route |
| `Closed Won` | confirm service completion | `deals` | `pushingcap_orchestrator` | client confirmation | transport completed and client accepted outcome |
| `Closed Won` | lock final economics | `deals` + `quotes` | `google_run_pc_paygate_bridge` | payment systems | revenue and payment state are final |
| `Payout Completed` | pay subcontractor or carrier | `p242835887_payouts` or payout fields | `google_run_pc_paygate_bridge` | payout rail | payout is recorded |
| `Payout Completed` | write operational memory | memory lane | `pushingcap_sick_memory_dude` | BigQuery, NotebookLM | route, exception, and outcome are durable |

## Worker Owner By Mini Step

### Primary owner model

- `pushingcap_orchestrator`
  - owns route control, transitions, dispatch logic, and exception handling
- `google_run_brain_ingestion`
  - owns intake normalization and first shell creation
- `google_run_pc_paygate_bridge`
  - owns quote, payment-link, and payout steps
- `pushingcap_sick_memory_dude`
  - owns memory writeback, pattern capture, and reusable route intelligence

### Important reality

There is not yet a clean dedicated `transport_dispatcher` worker profile in live PCRM.

Until that exists:
- `pushingcap_orchestrator` is the true control worker
- subcontractors and carriers are execution participants, not control-plane owners

## External Platform Touches By Mini Step

| step cluster | external platform or channel |
|---|---|
| intake | transport website, client portal, call, SMS, email |
| route and pricing | Central Dispatch, optional Super Dispatch, Google Maps / distance research |
| quote and authorization | quote link, email, payment-link lane |
| carrier negotiation | Central Dispatch, direct phone/SMS with carrier or tower, subcontractor lane |
| dispatch packet | BOL / paperwork path, client/carrier communications |
| movement tracking | phone, SMS, optional GPS/location doctrine, map lookup |
| closeout | quote/payment system, payout records, client communication |
| memory | BigQuery, NotebookLM |

## Stage Gates

This is the part that actually makes remote orchestration work.

### Before a deal can leave `Form Submitted`

All must be true:
- request type is clearly transport-related
- pickup intent and dropoff intent are known
- vehicle identity is known enough to price
- a deal shell exists
- an execution ticket exists

### Before a deal can leave `Central Dispatch Quote`

All must be true:
- route and vehicle are confirmed enough to search
- baseline lane economics are known
- at least one viable dispatch path exists

### Before a deal can leave `Collect Quote`

All must be true:
- customer-facing price is defined
- internal margin logic is acceptable
- missing docs are either collected or explicitly tracked

### Before a deal can leave `Send Quote for Authorization`

All must be true:
- quote reached the client
- approval or intent to proceed is received
- timing is still valid

### Before a deal can leave `Negotiate & Close Driver`

All must be true:
- carrier is selected
- carrier economics are locked
- trust and paperwork threshold is met

### Before a deal can leave `Connect Driver to Client`

All must be true:
- both sides know who the other side is
- pickup window is aligned
- dispatch packet is complete enough to move

### Before a deal can leave `Post Job`

All must be true:
- job is actually live
- operational owner can identify the active carrier and current schedule

### Before a deal can leave `Customer Success Check In`

All must be true:
- pickup has happened or the exception path is explicit
- live movement status exists

### Before a deal can leave `Support`

All must be true:
- BOL or equivalent delivery proof exists
- unresolved damage, delay, or paperwork issues are closed or escalated cleanly

### Before a deal can leave `Closed Won`

All must be true:
- delivery is accepted
- commercial closeout is correct

### Before a deal can leave `Payout Completed`

All must be true:
- payout is recorded
- the route memory is written back

## Exact Pipeline Shape To Control In PCRM

### A. Intake pipeline

Object:
- `p242835887_service_requests`

Purpose:
- hold raw request state until it deserves a deal

First control actions:
- normalize `current_phase`
- normalize `service_status`
- assign owner
- associate to downstream deal once created

### B. Commercial pipeline

Object:
- `deals`

Pipeline:
- `Auto Transport`
- pipeline id `1010023152`

Use this pipeline for:
- pricing
- authorization
- commercial progression
- closed-won and payout-complete macro states

Known deal stage ids:
- `Form Submitted` = `1560258245`
- `Central Dispatch Quote` = `1552146125`
- `Collect Quote` = `1552146127`
- `Send Quote for Authorization` = `1552146126`
- `Negotiate & Close Driver` = `1552146128`
- `Connect Driver to Client` = `1552146129`
- `Post Job` = `1560258246`
- `Customer Success Check In` = `1560258248`
- `Support` = `1560258247`
- `Closed Won` = `2317418225`
- `Payout Completed` = `2317418226`

### C. Execution pipeline

Object:
- `tickets`

Pipeline:
- `Auto Transport`
- pipeline id `1427939004`

Use this pipeline for:
- operational control
- dispatch
- carrier and document execution
- support and exception ownership

Known ticket stage ids:
- `Form Submitted` = `2300136158`
- `Central Dispatch Quote` = `2300136159`
- `Send Quote for Authorization` = `2300136160`
- `Collect Quote` = `2300136161`
- `Post Job` = `2300136162`
- `Negotiate & Close Driver` = `2300136163`
- `Connect Driver to Client` = `2300136164`
- `Support` = `2300136165`
- `Customer Success Check In` = `2300136166`

Important note:
- the ticket execution pipeline appears to stop before `Closed Won` and `Payout Completed`
- that is good
- it means the ticket is the execution controller, while the deal remains the commercial truth

### D. Micro-task pipeline

Object:
- `tasks`

Use this lane for:
- BOL follow-up
- driver packet completion
- callback tasks
- proof collection
- one-off blockers

## Best First Implementation

If we want this to work now, not later:

1. keep `p242835887_service_requests` as the intake shell
2. keep `deals` as the commercial truth
3. keep `tickets` as the execution truth
4. keep `tasks` as the missing-artifact and follow-through lane
5. do not force `p242835887_transport` to become the master object yet
6. let `p242835887_transport` mature as a dispatch-state object after the graph is stable

## P Stepfinder Contract

When P is asked for "the next step" on a transport deal, the order should be:

1. inspect the service request
2. inspect the linked deal
3. inspect the linked execution ticket
4. inspect open tasks
5. inspect quote / payment state
6. name the blocked or missing mini step
7. recommend the smallest A relations management platform move that advances the deal safely

Golden heuristic:

- deal tells us commercial truth
- ticket tells us execution truth
- task tells us what is missing
- quote tells us whether money is ready
- memory tells us what went wrong last time

## The Prize

The goal is not to "have a transport object."

The goal is to have a transport route where:

- intake lands cleanly
- the deal progresses visibly
- the execution ticket always shows where the job stands
- tasks absorb the micro-chaos
- payment and payout close the loop
- P can always tell you the next mini step without guessing
