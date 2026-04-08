# Parts Sales Canonical Execution Matrix

## Purpose

This is the canonical execution matrix for `Parts Sales`.

It turns the working parts-sales spec into one clean operating backbone so the lane can be automated, staffed, and reasoned about without confusion.

## Operating Truth

`Parts Sales` is not just buying parts.

It is a controlled margin lane:

1. identify the exact part
2. verify fitment and condition
3. establish market value
4. source below value
5. quote clearly
6. collect payment
7. deliver or mark unavailable

The business wins when every parts request resolves to one of two clear outcomes:

- the part is sourced, quoted, paid, and delivered
- the part is explicitly unavailable with a documented no-source trail

## End-To-End Matrix

| Layer | Canonical shape |
| --- | --- |
| Public surface | parts-facing site or experiment lane, customer inquiry, supplier inquiry, parts support entry |
| Capture surface | parts inquiry form, fitment brief, photo/VIN upload, vendor lead, customer callback |
| Intake shell | `p242835887_service_requests` |
| Commercial shell | `deals` in `Expert Parts Acquisition and Sourcing` |
| Execution shell | `tickets` in `Expert Parts Acquisition and Sourcing` |
| Micro-follow-through shell | `tasks` |
| Quote/payment shell | `quotes` and payment artifacts |
| Memory shell | BigQuery + NotebookLM |
| Worker spine | `google_run_brain_ingestion`, `pushingcap_orchestrator`, `google_run_pc_paygate_bridge`, `pushingcap_sick_memory_dude` |
| External software | OEM catalogs, vendor portals, VIN decoders, supplier sites, email, SMS, payment systems |
| Return to public | part identified, quote returned, order placed, delivered, or unavailable |

## Namespace Reality

- `pushingPsales.json` exists in the live export
- it is empty
- `pushing-parts` exists as a dedicated app constellation entry, but its production role still needs sharper mapping

So `Parts Sales` should be treated as a real lane backed by A relations management platform and workflow records, with the app surface as a satellite rather than the system of record.

## Object Stack

### 1. Intake shell

Primary object:
- `p242835887_service_requests`

Best live examples:
- `178899945188` = `Hany! Parts Complete`
- `163625935582` = `Mechanical/Parts - AMG GT (Gas Cap)`
- `163625935586` = `Ronald Stone - Equipment Sales`

Purpose:
- capture the request before procurement starts

### 2. Commercial shell

Primary object:
- `deals`

Best live example:
- `156444835576` = `2022 BMW X5M Parts`

Pipeline:
- `Expert Parts Acquisition and Sourcing`
- pipeline id `1078181571`

Purpose:
- own pricing, quote logic, margin, and approval

### 3. Execution shell

Primary object:
- `tickets`

Best live examples:
- `235362213592` = `Expert Parts Acquisition and Sourcing: 2022 BMW X5M Parts`
- `235401712325` = `Expert Parts Acquisition and Sourcing: Pamela - Lexus Repair`
- `253906669273` = `Expert Parts Acquisition and Sourcing - Finance: Open the programs`

Pipeline:
- `Expert Parts Acquisition and Sourcing`
- pipeline id `1427939015`

Purpose:
- own operational control, sourcing, vendor follow-through, and exception handling

### 4. Micro-follow-through shell

Primary object:
- `tasks`

Best live example:
- `T-1773025481618-ELTPMU` = `John J Parts listing`

Purpose:
- carry fitment follow-up, vendor chase, missing photo/VIN chase, invoice chase, delivery chase

### 5. Quote and payment shell

Primary object:
- `quotes`

Strong live artifacts:
- `138463708883` with BMW X5 front-end assembly pricing breakdown
- `106288839391` with new parts quote/payment language

Purpose:
- create transparent customer-facing quote and payment truth

## Canonical Workflow

`Parts Sales` should run as one reusable workflow:

1. `ingest`
2. `bind`
3. `identify`
4. `inspect`
5. `quote`
6. `approve`
7. `order`
8. `deliver`
9. `close`
10. `writeback`

### 1. `ingest`

Purpose:
- capture the parts request and normalize the request shell

Primary owner:
- `google_run_brain_ingestion`

Required outputs:
- parts request exists
- vehicle or asset context exists
- customer intent is clear enough to pursue fitment

### 2. `bind`

Purpose:
- attach the intake shell to a commercial deal and execution ticket

Primary owner:
- `pushingcap_orchestrator`

Required outputs:
- deal exists in the parts pipeline
- execution ticket exists and is tied to the deal

### 3. `identify`

Purpose:
- determine the exact part target

Primary owner:
- `pushingcap_orchestrator`

Required outputs:
- exact part is identified
- fitment risk is low enough to continue

### 4. `inspect`

Purpose:
- determine condition path and sourcing path

Primary owner:
- `pushingcap_orchestrator`

Required outputs:
- new / used / refurbished path is chosen
- market value is known
- buy path is known

### 5. `quote`

Purpose:
- create the customer-facing quote and payment path

Primary owner:
- `google_run_pc_paygate_bridge`

Required outputs:
- quote exists
- customer understands scope
- payment state is ready for approval

### 6. `approve`

Purpose:
- confirm client approval and supplier path

Primary owner:
- `pushingcap_orchestrator`

Required outputs:
- client approved
- supplier path is selected
- expected margin is acceptable

### 7. `order`

Purpose:
- place the order with the chosen vendor

Primary owner:
- `pushingcap_orchestrator`

Required outputs:
- order is placed
- expected delivery path is known

### 8. `deliver`

Purpose:
- confirm receipt and fulfillment

Primary owner:
- `pushingcap_orchestrator`

Required outputs:
- delivery is confirmed
- fulfillment proof exists

### 9. `close`

Purpose:
- either close the sale or close out the no-source outcome

Primary owner:
- `pushingcap_orchestrator`

Required outputs:
- delivered part is confirmed
- or unavailable decision is documented cleanly

### 10. `writeback`

Purpose:
- preserve sourcing logic, vendor pattern, and fitment lessons

Primary owner:
- `pushingcap_sick_memory_dude`

Required outputs:
- route memory logged
- future fitment logic is reusable

## Mini Deliverables

Parts Sales should be driven by small deliverables, not by vague progress.

### Intake mini deliverables

- `parts_request_received`
- `fitment_brief_captured`
- `vehicle_context_normalized`
- `vendor_source_hint_logged`
- `request_owner_assigned`

### Identification mini deliverables

- `exact_part_target_identified`
- `fitment_risk_reduced`
- `alternate_part_paths_considered`
- `part_number_or_equivalent_found`

### Inspection mini deliverables

- `condition_path_decided`
- `market_value_established`
- `buy_target_established`
- `sourcing_window_defined`

### Quote mini deliverables

- `customer_quote_built`
- `quote_explained`
- `payment_request_prepared`
- `quote_sent`

### Approval mini deliverables

- `client_approved`
- `supplier_selected`
- `expected_margin_accepted`
- `order_allowed`

### Order mini deliverables

- `vendor_order_placed`
- `delivery_expectation_known`
- `order_followup_created`

### Delivery mini deliverables

- `part_received`
- `customer_confirmed`
- `proof_of_fulfillment_captured`

### No-source mini deliverables

- `no_source_decision_documented`
- `client_notified_clearly`
- `alternate_option_or_closeout_recorded`

### Writeback mini deliverables

- `sourcing_logic_written_back`
- `vendor_pattern_written_back`
- `fitment_lesson_written_back`

## Worker Ownership

| Mini deliverable type | Primary worker owner | Supporting workers |
| --- | --- | --- |
| Intake normalization | `google_run_brain_ingestion` | `pushingcap_orchestrator` |
| Fitment control | `pushingcap_orchestrator` | `postman_api` |
| Market value / margin | `pushingcap_orchestrator` | `google_run_pc_paygate_bridge` |
| Quote and payment | `google_run_pc_paygate_bridge` | `pushingcap_orchestrator` |
| Vendor routing | `pushingcap_orchestrator` | `ops_health` |
| Memory writeback | `pushingcap_sick_memory_dude` | `bigquery_memory_hub` |

## External Software Map

| External platform | What it should own |
| --- | --- |
| OEM catalogs | exact part lookup and compatibility truth |
| VIN decoders | vehicle context and fitment narrowing |
| Vendor portals | sourcing, stock, and buy availability |
| Supplier phone/email | procurement follow-through |
| Payment systems | quote, invoice, paid state |
| Shipping / tracking | delivery confirmation |
| BigQuery / NotebookLM | fitment precedent and sourcing memory |

## Public And Field Surfaces

### Public-facing

- parts inquiry page
- parts request form
- quote return surface
- no-source / unavailable return surface

### Field / operational-facing

- supplier portal or phone workflow
- parts pickup / delivery follow-through
- photo and condition evidence capture
- vendor confirmation surface

### App constellation anchor

- [`pushing-parts`](/Users/emmanuelhaddad/pushing-parts)
- current role: dedicated parts-facing surface or experiment lane

## What Gets Created Automatically

Once this lane is wired properly, the automation should create:

1. intake shell from the public request
2. commercial deal from the intake shell
3. execution ticket from the commercial deal
4. task pack for fitment, vendor chase, and payment
5. quote artifact when price truth is ready
6. memory writeback when the lane closes

## What To Stop Doing

Do not:

- treat parts requests as random chat threads
- let fitment remain unstructured
- quote before the exact part target is clear
- place orders before money is verified
- let delivery or no-source outcomes remain ambiguous
- create new namespace objects before the A relations management platform graph is stable

## Best Next Build Move

The best next build move is to turn this matrix into:

1. a formal parts workflow definition
2. a formal parts pipeline definition
3. a parent control ticket for the lane
4. stage-specific task pack templates for fitment, sourcing, quoting, ordering, and delivery
5. a worker profile payload for the future `Fitment Auditor` identity

## Bottom Line

Parts Sales should always answer:

- what exact part is needed
- what it should cost
- where it can be sourced
- whether the client approved
- whether the part actually delivered

If it cannot answer those five questions, the lane is not finished yet.
