# Parts Sales Workflow And Pipeline Spec

Date: 2026-04-03
Owner: Manny + Codex
Status: Working operator spec
Purpose: Define how Parts Sales should run as an operator-owned PCRM lane without placing anything into production yet.

Companion memory:

- `/Users/emmanuelhaddad/automotive_control_plane_big_picture_memory.md`

## Core Principle

`Parts Sales` is not just buying parts.

It is a controlled margin lane:

- identify the correct part
- verify fitment and condition
- establish market value
- source below value
- quote clearly
- collect payment
- deliver or mark unavailable

The value comes from accuracy plus procurement discipline.

## Namespace Reality

- `pushingPsales.json` exists in the live export
- it is empty

So `Parts Sales` is currently not a namespace-backed runtime object.
It is backed by the live automotive records below.

## Real Backing Objects

### Intake shells

- `p242835887_service_requests`

Best live examples:
- `178899945188` = `Hany! Parts Complete`
- `163625935582` = `Mechanical/Parts - AMG GT (Gas Cap)`
- `163625935586` = `Ronald Stone - Equipment Sales`

### Commercial shells

- `deals`

Best live example:
- `156444835576` = `2022 BMW X5M Parts`

Parts deal pipeline:
- `Expert Parts Acquisition and Sourcing`
- pipeline id `1078181571`

### Execution shells

- `tickets`

Best live examples:
- `235362213592` = `Expert Parts Acquisition and Sourcing: 2022 BMW X5M Parts`
- `235401712325` = `Expert Parts Acquisition and Sourcing: Pamela - Lexus Repair`
- `253906669273` = `Expert Parts Acquisition and Sourcing - Finance: Open the programs`

Parts ticket pipeline:
- `Expert Parts Acquisition and Sourcing`
- pipeline id `1427939015`

### Quote / payment artifacts

- `quotes`

Strong live artifacts:
- quote `138463708883` with BMW X5 front-end assembly pricing breakdown
- quote `106288839391` with new parts quote/payment language

### Micro-follow-through

- `tasks`

Strong live example:
- `T-1773025481618-ELTPMU` = `John J Parts listing`

## Best First Workflow Shape

Workflow name:
- `parts_sales_margin_orchestration_v1`

Workflow intent:
- take a parts request from fitment uncertainty to delivered part or explicit unavailable outcome

Pipeline stack:

1. `p242835887_service_requests`
   - intake shell
2. `Expert Parts Acquisition and Sourcing` on `deals`
   - commercial truth
3. `Expert Parts Acquisition and Sourcing` on `tickets`
   - execution truth
4. generic task pipeline
   - photos, VIN, fitment docs, vendor chase, delivery follow-through

## Deal Mini Steps

| macro stage | mini step | primary object | owner | external touch | done signal |
|---|---|---|---|---|---|
| `Customer Inquiry Form` | capture request shell | `p242835887_service_requests` | `google_run_brain_ingestion` | call, SMS, intake, email, portal | request exists with part need and customer intent |
| `Customer Inquiry Form` | normalize fitment brief | `p242835887_service_requests` | `pushingcap_orchestrator` | PCRM only | make/model/year/VIN or equivalent part context is usable |
| `Customer Inquiry Form` | create commercial deal | `deals` | `pushingcap_orchestrator` | PCRM only | parts deal exists in the parts pipeline |
| `Customer Inquiry Form` | create execution ticket | `tickets` | `pushingcap_orchestrator` | PCRM only | execution ticket exists and is tied to the parts deal |
| `Part Identification` | confirm exact part target | `ticket` + `service_request` | `pushingcap_orchestrator` | OEM catalogs, vendor sites, VIN decoders, client photos | precise part target is identified |
| `Part Identification` | gather missing fitment evidence | `tasks` | `pushingcap_orchestrator` | customer photos, VIN, trim/options, existing part number | enough data exists to avoid ordering the wrong part |
| `Part Inspection Process` | assess part condition path | `ticket` | `pushingcap_orchestrator` | salvage/vendor inventory, condition notes, warranty checks | new/used/refurbished path is decided |
| `Part Inspection Process` | establish market value | `deal` | `pushingcap_orchestrator` | vendor comparison, marketplace research | market reference and target buy price are known |
| `Quote Sent` | build customer quote | `quotes` + `deal` | `google_run_pc_paygate_bridge` | quote engine, email, payment link | customer-facing quote exists |
| `Quote Sent` | send and explain quote | `quote` + `ticket` | `pushingcap_orchestrator` | email, SMS, call | client has quote and understands scope |
| `Quote Won` | confirm client approval | `deal` | `pushingcap_orchestrator` | call, SMS, email | client approved and job is ready to order |
| `Quote Won` | select vendor and lock buy | `ticket` + `deal` | `pushingcap_orchestrator` | vendor phone/email/site | supplier choice and landed cost are locked |
| `Invoice Sent` | issue final invoice or payment request | `quote` + `deal` | `google_run_pc_paygate_bridge` | invoice/payment rail | invoice is sent |
| `Invoice Paid` | confirm funds before order | `deal` + `quote` | `google_run_pc_paygate_bridge` | payment systems | money is ready and order can safely be placed |
| `Invoice Paid` | place the order | `ticket` | `pushingcap_orchestrator` | vendor | part is ordered with expected delivery |
| `Part Delivered` | confirm receipt and closeout | `ticket` + `tasks` | `pushingcap_orchestrator` | shipment tracking, local pickup, drop-ship, customer confirmation | delivered part is confirmed |
| `Part Unavailable` | document no-fit / no-source outcome | `ticket` + `deal` | `pushingcap_orchestrator` | vendor research trail | client gets a clean no-source answer instead of limbo |

## Worker Ownership

Current real owners:

- `google_run_brain_ingestion`
  - intake and first shell normalization
- `pushingcap_orchestrator`
  - fitment control, vendor routing, execution, and exceptions
- `google_run_pc_paygate_bridge`
  - quote, invoice, payment-link, and paid-state handling
- `pushingcap_sick_memory_dude`
  - writeback of sourcing logic, vendor patterns, and reusable fitment lessons

Doctrine worth preserving:

- `PushingParts` in `PushingStandby` is the `Fitment Auditor`

Current reality:

- no explicit live `PushingParts` worker profile surfaced in `worker_profiles`

So for now:

- `pushingcap_orchestrator` is the control owner
- `Fitment Auditor` is a future dedicated worker identity

## External Platform Touches

| step cluster | external touch |
|---|---|
| intake | call, SMS, email, customer photos |
| fitment | VIN decoders, OEM catalogs, marketplace/vendor inventory |
| market value | vendor comparison, eBay, supplier websites, internal pricing judgment |
| quoting | quote engine, invoice/payment link |
| ordering | supplier portal, phone, email |
| delivery | shipment tracking, pickup, customer confirmation |
| memory | BigQuery, NotebookLM |

## Stage Gates

### Before leaving `Customer Inquiry Form`

All must be true:
- customer request is real
- vehicle or asset context is known enough to identify the part
- a deal shell exists
- an execution ticket exists

### Before leaving `Part Identification`

All must be true:
- exact part target is identified
- fitment risk is low enough to quote responsibly

### Before leaving `Part Inspection Process`

All must be true:
- new/used/refurbished path is chosen
- market value is known
- target buy path is known

### Before leaving `Quote Sent`

All must be true:
- quote is actually sent
- customer understands what is and is not included

### Before leaving `Quote Won`

All must be true:
- client approved
- supplier path is selected
- expected margin is acceptable

### Before leaving `Invoice Sent`

All must be true:
- payment request is out
- client can actually complete the transaction

### Before leaving `Invoice Paid`

All must be true:
- funds are verified
- order is placed or immediately placeable

### Before leaving `Part Delivered`

All must be true:
- delivery is confirmed
- fulfillment proof exists

### Before leaving `Part Unavailable`

All must be true:
- no-source decision is documented
- client was informed cleanly

## Exact Pipeline Shape

### Deal pipeline

Object:
- `deals`

Pipeline:
- `Expert Parts Acquisition and Sourcing`
- pipeline id `1078181571`

Known deal stage ids:
- `Customer Inquiry Form` = `1690771159`
- `Part Inspection Process` = `1690771160`
- `Part Identification` = `1690771161`
- `Quote Sent` = `1690771163`
- `Quote Won` = `1690771164`
- `Quote Lost` = `1940964067`
- `Invoice Sent` = `1940964068`
- `Invoice Paid` = `1931305698`
- `Part Unavailable` = `1931305697`
- `Part Delivered` = `1931305699`

### Ticket pipeline

Object:
- `tickets`

Pipeline:
- `Expert Parts Acquisition and Sourcing`
- pipeline id `1427939015`

Known ticket stage ids:
- `Customer Inquiry Form` = `2300138218`
- `Part Inspection Process` = `2300138219`
- `Part Identification` = `2300138220`
- `Part Unavailable` = `2300138221`
- `Quote Sent` = `2300138222`
- `Quote Won` = `2300138223`
- `Quote Lost` = `2300138224`
- `Invoice Sent` = `2300138225`
- `Invoice Paid` = `2300138226`
- `Part Delivered` = `2300138227`

## Big-Picture Rule

Parts Sales should be modeled as:

- fitment truth
- procurement truth
- money truth

Not as:

- random one-off parts conversations

The platform wins when every parts request can be answered with:

- what exact part is needed
- what it should cost
- where it can be sourced
- whether the client approved
- whether the part actually delivered
