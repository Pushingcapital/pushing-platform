# PushingTransport Canonical Execution Matrix

## Purpose

This is the cleaned transport backbone.

It replaces loose transport discussion with one route:

`public surface -> capture -> A relations management platform object -> workflow -> pipeline -> mini steps -> worker owner -> external software -> callback -> memory`

## Operating Truth

`PushingTransport` is not one object.
It is one orchestration lane.

The system works best when transport is split into:

1. intake shell
2. commercial shell
3. execution shell
4. micro-follow-through shell
5. payout shell

That lets the business orchestrate everything without physically being in the field.

## Canonical End-To-End Matrix

| Layer | Canonical shape |
| --- | --- |
| Public surface | `PushingTransport` site, intake page, buyer-facing intake, worker/mobile field surface |
| Capture surface | transport request form, buyer follow-up form, BOL/document upload, GPS/location update, carrier/subcontractor confirmation |
| First A relations management platform shell | `p242835887_service_requests` |
| Commercial shell | `deals` in Auto Transport |
| Execution shell | transport execution `tickets` |
| Micro-follow-through shell | `tasks` |
| Domain object | `p242835887_transport` |
| Payment shell | `quotes`, `invoices`, `p242835887_payouts` |
| Worker spine | `pushingcap_orchestrator`, `google_run_brain_ingestion`, `postman_api`, `pushingcap_sick_memory_dude`, `google_run_pc_paygate_bridge`, transport-specific field/mobile worker lane |
| External platforms | `Central Dispatch`, `Super Dispatch`, Google Maps, GPS/location, SMS, email, docs, payment surfaces |
| Return to public | quote, dispatch confirmation, driver/client connection, BOL/proof, delivery status, payout confirmation |
| Memory | NotebookLM writeback, BigQuery trace, A relations management platform stage update |

## Object Stack

### 1. Intake shell

Primary object:
- `p242835887_service_requests`

Job:
- capture the first public or operator-visible transport request
- hold raw intake truth before commercial qualification

Core fields:
- route
- vehicle info
- pickup and dropoff timing
- customer identity
- source channel
- urgency

### 2. Commercial shell

Primary object:
- `deals`

Job:
- own quote, authorization, negotiation, and close logic

Confirmed stage family:
- `Form Submitted`
- `Central Dispatch Quote`
- `Collect Quote`
- `Send Quote for Authorization`
- `Negotiate & Close Driver`
- `Connect Driver to Client`
- `Post Job`
- `Customer Success Check In`
- `Support`
- `Closed Won`
- `Payout Completed`

### 3. Execution shell

Primary object:
- `tickets`

Job:
- own active execution control and exceptions
- represent dispatch and coordination control, not just commercial intent

### 4. Micro-follow-through shell

Primary object:
- `tasks`

Job:
- carry the smallest executable unit
- create route-level training for workers

Examples:
- request route quote
- verify buyer authorization
- confirm carrier availability
- collect BOL
- chase GPS update
- confirm delivery
- confirm payout

### 5. Domain shell

Primary object:
- `p242835887_transport`

Job:
- store transport-specific facts that do not fit cleanly in generic deals, tasks, or tickets

Confirmed schema themes:
- carrier and driver assignment
- dispatch
- pickup and delivery addresses
- estimated and actual delivery
- quote, deposit, carrier pay, remaining balance
- Bill of Lading

### 6. Payment shell

Primary objects:
- `quotes`
- `invoices`
- `p242835887_payouts`

Job:
- own customer-facing money and carrier/subcontractor payout completion

## Canonical Workflow

### A. Intake workflow

Route:
- public request
- service request capture
- intake normalization
- transport classification
- commercial handoff

Primary owner:
- `google_run_brain_ingestion`
- `pushingcap_orchestrator`

### B. Commercial workflow

Route:
- deal created
- quote gathered
- authorization requested
- driver/carrier negotiation
- close intent confirmed

Primary owner:
- `pushingcap_orchestrator`

### C. Execution workflow

Route:
- execution ticket created
- dispatch packet assembled
- carrier/client linked
- route monitored
- documents and exceptions handled

Primary owner:
- transport execution lane
- `pushingcap_orchestrator`

### D. Completion workflow

Route:
- proof of delivery
- support or closeout
- payout completed
- memory writeback

Primary owner:
- `google_run_pc_paygate_bridge`
- `pushingcap_sick_memory_dude`

## Mini Deliverables

This is how transport should be mapped: by mini deliverables, not by broad categories.

### Intake mini deliverables

- `transport_request_received`
- `route_normalized`
- `vehicle_identity_normalized`
- `buyer_identity_confirmed`
- `source_channel_logged`

### Quote mini deliverables

- `dispatch_market_checked`
- `central_dispatch_quote_recorded`
- `internal_quote_compiled`
- `authorization_sent`
- `authorization_response_recorded`

### Carrier mini deliverables

- `carrier_candidate_identified`
- `carrier_terms_confirmed`
- `driver_assigned`
- `buyer_driver_connection_created`

### Execution mini deliverables

- `job_posted`
- `pickup_window_confirmed`
- `location_update_logged`
- `bol_captured`
- `delivery_confirmed`

### Payout mini deliverables

- `customer_charge_confirmed`
- `carrier_pay_confirmed`
- `payout_record_closed`
- `memory_writeback_completed`

## Worker Ownership By Mini Deliverable

| Mini deliverable type | Primary worker owner | Supporting workers |
| --- | --- | --- |
| Intake normalization | `google_run_brain_ingestion` | `pushingcap_orchestrator` |
| Commercial routing | `pushingcap_orchestrator` | `postman_api` |
| External contract / payload truth | `postman_api` | `pushingcap_orchestrator` |
| Memory / precedent / writeback | `pushingcap_sick_memory_dude` | `bigquery_memory_hub` |
| Payment / payout close | `google_run_pc_paygate_bridge` | finance lane |
| Execution health / blockers | `ops_health` | `pushingcap_orchestrator` |
| Mobile field updates | transport mobile worker lane | `pushingcap_orchestrator` |

## External Software Map

| External platform | What it should own |
| --- | --- |
| `Central Dispatch` | dispatch market signal, listing ids, quote context, transport status |
| `Super Dispatch` | optional dispatch / logistics support |
| Google Maps | routes, distance, geocoding, ETA context |
| GPS / location stack | in-transit updates and active location interpretation |
| SMS / email | client and carrier coordination |
| Document storage | BOL, title docs, inspection docs, proof of delivery |
| Payment surfaces | quote, charge, payout, reconciliation |

## Public And Field Surfaces

### Customer-facing

- transport landing page
- intake form
- quote / authorization return surface
- status / callback surface

### Worker-facing

- mobile subcontractor / field app
- driver or carrier update surface
- BOL / evidence capture surface
- route status update surface

## Stage Gates

Do not let the workflow advance just because a human wants to.
The stage should move only when the mini deliverable for that stage is satisfied.

Examples:

- do not leave `Form Submitted` until route, vehicle, and customer identity are normalized
- do not leave `Collect Quote` until market quote and internal quote are both logged
- do not leave `Negotiate & Close Driver` until carrier terms and assignment are real
- do not leave `Post Job` until the execution ticket and field packet exist
- do not leave `Closed Won` until delivery proof is present
- do not leave `Payout Completed` until payout record and memory writeback are complete

## What Gets Created Automatically

Once this lane is operationalized, the automation/builder layer should generate:

1. one parent control ticket for the transport lane
2. one workflow definition record
3. one pipeline definition record per shell
4. one mini task pack per stage
5. one memory writeback playbook
6. one blocker / exception ticket pattern

## What To Stop Doing

Do not:

- treat `PushingTransport` as only a website
- treat `PushingTransport` as only a A relations management platform object
- treat the deal as the only source of truth
- train workers on contextless callback shells
- skip mini deliverables and jump straight from intake to dispatch

## Best Next Build Move

The next implementation move should be:

1. define the formal transport workflow record from this matrix
2. define the formal transport pipeline records from this matrix
3. define the builder-generated mini task pack by stage
4. connect the public intake surface to the first service request shell

That is the cleanest path from messy research into an autonomous transport lane.
