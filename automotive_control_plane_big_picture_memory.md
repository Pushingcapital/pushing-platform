# Automotive Control Plane Big Picture Memory

Date: 2026-04-03
Owner: Manny + Codex
Status: Memory note
Purpose: Preserve the big picture before we place anything into PCRM.

## Companion Specs

- `/Users/emmanuelhaddad/pushing_inspections_workflow_pipeline_spec.md`
- `/Users/emmanuelhaddad/pushing_parts_sales_workflow_pipeline_spec.md`
- `/Users/emmanuelhaddad/pushing_transport_workflow_pipeline_spec.md`

## The Big Picture

The automotive side of Pushing Capital should not be modeled as disconnected services.

It is one operator-owned control plane with sibling execution lanes:

- `PushingInspections`
- `Parts Sales`
- `PushingTransport`

These lanes are different expressions of the same business:

- inspections produce evidence and condition truth
- parts sales turn fitment truth into sourcing and margin
- transport turns route truth into movement and delivery

The business does not need to be physically in the field to control the work.
It needs a better control plane than the field chaos.

## Core Operating Rule

We orchestrate everything.
We own the software and the platform.

That means the platform must control:

- intake
- evidence normalization
- commercial routing
- execution routing
- external platform touches
- document collection
- quote and payment state
- closeout and memory

The field leg can happen through subcontractors, carriers, mechanics, shops, inspectors, or outside vendors.
The control leg stays inside PCRM.

## Shared Object Model

Do not force the empty `Pushing*` shells to become the system of record before the real objects are stable.

The real automotive control stack today is:

1. `p242835887_service_requests`
   - intake shell
2. `deals`
   - commercial truth
3. `tickets`
   - execution truth
4. `tasks`
   - micro-chaos, blockers, and follow-through
5. `quotes` and payment objects
   - commercial closeout
6. domain objects where they already exist
   - `p242835887_vehicle_inspections`
   - `p242835887_inspection_items`
   - `p242835887_credit_inspections`
   - `p242835887_transport`

## Namespace Reality

- `pushingTransport.json` exists but is empty
- `pushingPsales.json` exists but is empty
- `pushingInspections.json` does not appear in the live export at all

So:

- `PushingTransport` is currently backed by transport service requests, deals, tickets, tasks, quotes, and the skeletal transport object
- `Parts Sales` is currently backed by parts service requests, parts deals, parts tickets, tasks, and quotes
- `PushingInspections` is currently backed by service requests, vehicle inspection objects, inspection item objects, auto-repair tickets, and related quotes/tasks

## The Three Sibling Lanes

### 1. PushingInspections

Purpose:
- generate condition truth, evidence, and inspection outputs

Current real backing objects:
- `p242835887_vehicle_inspections`
- `p242835887_inspection_items`
- `p242835887_service_requests`
- `tickets` in `Auto Repair`

What it feeds:
- repair
- parts
- transport
- DMV/title/compliance
- finance decisions when condition affects value or risk

### 2. Parts Sales

Purpose:
- turn fitment truth into procurement, pricing, sourcing, and delivery

Current real backing objects:
- `p242835887_service_requests`
- `deals` in `Expert Parts Acquisition and Sourcing`
- `tickets` in the matching execution pipeline
- `quotes`
- `tasks`

What it feeds:
- repairs
- customer margin
- procurement workflows
- invoice/payment closeout

### 3. PushingTransport

Purpose:
- turn route truth into dispatch, movement, and delivery

Current real backing objects:
- `p242835887_service_requests`
- `deals` in `Auto Transport`
- `tickets` in `Auto Transport`
- `tasks`
- `quotes`
- `p242835887_transport`

What it feeds:
- physical delivery
- customer closeout
- payout and proof-of-delivery

## Operator Logic

The right question is not:
- "what object do we create?"

The right question is:
- "what truth are we moving, and what lane owns it?"

Use this guide:

- if the main problem is condition truth: use `PushingInspections`
- if the main problem is fitment, procurement, or margin: use `Parts Sales`
- if the main problem is pickup, dispatch, movement, or delivery: use `PushingTransport`

## Current Control Workers

Confirmed current control workers:

- `pushingcap_orchestrator`
- `google_run_brain_ingestion`
- `google_run_pc_paygate_bridge`
- `pushingcap_sick_memory_dude`

Important reality:

- no explicit live `parts` worker profile surfaced
- no explicit live `inspections` worker profile surfaced
- no explicit live `transport_dispatcher` worker profile surfaced

So today:

- `pushingcap_orchestrator` is the real control owner
- domain-specific worker identities remain doctrinal or future-state

## Public-Site Big Picture

The public site already points in the right direction.

The `Automotive` route on the site groups:

- Vehicle Intake
- Condition Review
- Title and Lien Resolution
- DMV Compliance
- Logistics Coordination
- Parts Sourcing
- Delivery Closeout

That means the public story already treats these as one vehicle-lifecycle control plane.
The A relations management platform should do the same.

## PushingStandby Doctrine To Keep

The doctrine already says:

- `PushingInspections` is the diagnostics/evidence lane
- `PushingParts` is the fitment/procurement lane
- `PushingTransport` is the logistics/dispatch lane
- `PushingSubcontractors` sits under them as the field execution network

That is the right model.
What we are doing now is grounding that doctrine in the real PCRM objects and pipelines.

## What Not To Do Yet

- do not create a bunch of new namespace records just because the names are nice
- do not force empty `Pushing*` shells to hold live business truth
- do not let one object pretend to be intake, commercial, execution, and payment all at once

## What To Do Next

Keep building these as operator specs first:

- `/Users/emmanuelhaddad/pushing_inspections_workflow_pipeline_spec.md`
- `/Users/emmanuelhaddad/pushing_parts_sales_workflow_pipeline_spec.md`
- `/Users/emmanuelhaddad/pushing_transport_workflow_pipeline_spec.md`

The prize is not "more objects."

The prize is:

- one automotive control plane
- three sibling lanes
- clear handoffs between them
- clear stage gates
- a system where P can tell the next step without guessing
