# PushingTransport Bundle Contract

Date: 2026-04-03
Owner: Manny + Codex
Scope: Exact first-pass contract for the bundle:

- `PushingTransport`
- `PushingForms`
- `PushingPipelines`
- `PushingTasks`
- `PushingWorkers`
- `PushingPay`

Execution companion:

- `/Users/emmanuelhaddad/pushing_transport_canary_seed_pack.md`
- `/Users/emmanuelhaddad/pushing_transport_workflow_pipeline_spec.md`

## Core Rule

The `Pushing*` namespace shells are not yet the canonical source of truth for this bundle.

The local live exports show:

- `pushingTransport.json` -> empty
- `pushingPipelines.json` -> empty
- `pushingTasks.json` -> empty
- `pushingWorkers.json` -> empty
- `pushingPay.json` -> empty
- `pushingPaygates.json` -> empty

So this contract must bind each namespace to the real backing objects that already carry live state.

## Namespace To Canonical Backing Objects

| namespace | role | canonical backing objects | status | key evidence |
|---|---|---|---|---|
| `PushingTransport` | transport domain surface | `p242835887_service_requests`, `deals` in `Auto Transport`, `p242835887_transport`, `tickets`, `tasks` | live under backing objects, empty in namespace shell | `/Users/emmanuelhaddad/output/playwright/pushingcap-takeout/live-export/data/p242835887_service_requests.json`, `/Users/emmanuelhaddad/LLM_Materials_Organized/databases normalization and consolidation/notebooklm_upload_ready/platform_schema_packet_2026-03-19/object-properties/p242835887_transport.csv`, `/Users/emmanuelhaddad/deals_properties.tsv` |
| `PushingForms` | intake and public-return contract | fallback intake page, portal login/forms, message composer, blueprint intake forms | partially live, partially blueprint | `/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/app/start-intake/page.tsx`, `/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/app/clientportal/login/page.tsx`, `/Users/emmanuelhaddad/PushingStandby/src/App.jsx` |
| `PushingPipelines` | stage routing and execution order | `Auto Transport`, `Service Request Pipeline`, `Subcontractor Task Management`, `Master Customer Journey`, generic `workflow_pipelines` / `workflow_stages` | live under pipeline objects, empty in namespace shell | `/Users/emmanuelhaddad/deals_properties.tsv`, `/Users/emmanuelhaddad/output/playwright/pushingcap-takeout/live-export/data/workflow_pipelines.json`, `/Users/emmanuelhaddad/output/playwright/pushingcap-takeout/live-export/data/workflow_stages.json` |
| `PushingTasks` | actionable work and blockers | `tasks`, `tickets` | live under real task/ticket objects, empty in namespace shell | `/Users/emmanuelhaddad/output/playwright/pushingcap-takeout/live-export/data/tasks.json`, `/Users/emmanuelhaddad/output/playwright/pushingcap-takeout/live-export/data/tickets.json` |
| `PushingWorkers` | owning workers and runtime executors | `worker_profiles`, subcontractor portal execution lane | live under `worker_profiles`, empty in namespace shell | `/Users/emmanuelhaddad/output/playwright/pushingcap-takeout/live-export/data/worker_profiles.json`, `/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/components/subcontractor/SubcontractorConsole.tsx` |
| `PushingPay` | quote, payment, payout, and paygate lane | `quotes`, `invoices` API/store, `p242835887_payouts`, transport/payment fields on `deals`, subcontractor payout fields on `p242835887_service_requests` | live under real payment objects, empty in namespace shell | `/Users/emmanuelhaddad/output/playwright/pushingcap-takeout/live-export/data/quotes.json`, `/Users/emmanuelhaddad/output/playwright/pushingcap-takeout/live-export/data/p242835887_payouts.json`, `/Users/emmanuelhaddad/Downloads/internal-crm/backend/app/push_p.py` |

## Canonical End-To-End Route

| phase | namespace owner | primary object written first | primary route | required follow-on objects |
|---|---|---|---|---|
| public intake | `PushingForms` | `p242835887_service_requests` or intake ticket/task | fallback intake, client portal, or future transport form | `contact`, `company`, `deal` |
| transport qualification | `PushingTransport` | `deals` in `Auto Transport` | quote and transport qualification | `p242835887_transport`, `tasks`, `tickets` |
| dispatch orchestration | `PushingPipelines` | `p242835887_transport` | dispatch and carrier matching | `p242835887_subcontractor_job`, `tasks`, `tickets` |
| worker execution | `PushingWorkers` | `worker_profiles` ownership plus subcontractor job state | orchestration and portal execution | stage updates, logistics notes, status evidence |
| quote and payment | `PushingPay` | `quotes` / `invoices` plus deal payment fields | quote link, payment link, paid state | payout, service completion, closeout |
| delivery and memory | `PushingTransport` + `PushingTasks` | transport status, BOL, post-trip evidence, closeout tasks | support, customer success, payout complete | memory writeback and audit trail |

## Exact Transport Stage Contract

### Auto Transport stage sequence

Backed by `deals` / transport-linked commercial routing:

1. `Form Submitted`
2. `Central Dispatch Quote`
3. `Collect Quote`
4. `Send Quote for Authorization`
5. `Negotiate & Close Driver`
6. `Connect Driver to Client`
7. `Post Job`
8. `Customer Success Check In`
9. `Support`
10. `Closed Won`
11. `Payout Completed`

Primary evidence:

- `/Users/emmanuelhaddad/deals_properties.tsv`
- `/Users/emmanuelhaddad/LLM_Materials_Organized/databases normalization and consolidation/notebooklm_upload_ready/platform_schema_packet_2026-03-19/object-properties/deals.csv`

### Transport object status sequence

Backed by `p242835887_transport.transport_status`:

1. `new_lead`
2. `quoted`
3. `booked`
4. `dispatched`
5. `in_transit`
6. `delivered`
7. `on_hold`
8. `canceled`
9. `completed`

Primary evidence:

- `/Users/emmanuelhaddad/LLM_Materials_Organized/databases normalization and consolidation/notebooklm_upload_ready/platform_schema_packet_2026-03-19/object-properties/p242835887_transport.csv`

### Adjacent pipeline contract

These are the supporting lanes that feed or consume transport work:

- `Service Request Pipeline`
  - `New Inquiry`
  - `Needs Assesment`
  - `Quote Sent`
  - `Subcontractor Matching`
  - `Service In Progress`
  - `Payment Recieved`
  - `Service Complete`
  - `Closed Won`
- `Subcontractor Task Management`
  - `Awaiting Review`
  - `In Progress`
  - `Task Assigned`
  - `Task Completed`
  - `Task Closed`
- `Master Customer Journey`
  - `New Lead / Intake`
  - `Qualification & Validation`
  - `Quote Review & Client Approval`
  - `Service Dispatch`
  - `Service in Progress`
  - `Service Completed / Awaiting Payment`
  - `Closed Won`

## Exact Object Contract

### `PushingTransport`

Canonical objects:

- `p242835887_service_requests`
- `deals`
- `p242835887_transport`
- `tickets`
- `tasks`

Required minimum fields:

- service request:
  - `service_type`
  - intake metadata
  - `subcontractor_payout_amount` when external work is involved
- deal:
  - `pipeline`
  - `dealstage`
  - `cd_listing_id`
  - `cd_dispatch_status`
  - `cd_transport_status`
  - `accepted_transport_fee`
  - `transport_load_id`
  - `transport_paid`
  - carrier fields
- transport object:
  - `transport_job_name`
  - `transport_status`
  - `transport_type`
  - pickup and delivery fields
  - `dispatch_date`
  - `carrier_driver_assigned`
  - `quote_amount`
  - `deposit_amount`
  - `carrier_pay`
  - `remaining_balance`
  - `bill_of_lading`

### `PushingForms`

Canonical intake surfaces:

- `/Users/emmanuelhaddad/pushing-transport/index.html`
  - currently only branded CTAs, no live submission wiring
- `/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/app/start-intake/page.tsx`
  - live fallback intake
- `/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/app/clientportal/login/page.tsx`
- `/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/app/subcontractor/page.tsx`
- `/Users/emmanuelhaddad/PushingStandby/src/App.jsx`
  - blueprint forms only

Contract:

- do not treat the standalone transport page as a live intake form until CTA wiring exists
- use fallback intake or authenticated portal flows as the real current intake contract
- when transport-specific forms are built, they should write first into `p242835887_service_requests` or directly into an intake ticket + service request shell

### `PushingPipelines`

Canonical pipeline anchors:

- `Auto Transport`
- `Service Request Pipeline`
- `Subcontractor Task Management`
- `Master Customer Journey`
- generic platform overlays:
  - `workflow_pipelines`
  - `workflow_stages`

Contract:

- `Auto Transport` is the commercial and dispatch lane
- `Service Request Pipeline` is the upstream request shell
- `Subcontractor Task Management` is the execution-side vendor lane
- `Master Customer Journey` is the customer-facing umbrella lane

### `PushingTasks`

Canonical objects:

- `tasks`
- `tickets`

Known live transport work:

- ticket `235912606402` -> `Workflow: Transport phases -> Tickets + Tasks`
- ticket `235951861480` -> `Tooling: Transport Request intake -> HubSpot objects`
- ticket `235401700037` -> `Auto Transport: Aston Vantage Black one`
- task `290833799923` -> `Follow up on BOL`
- task `292869757668` -> `📌 +14804339606: access to transport`

Contract:

- use tasks for active work items and follow-through
- use tickets for blockers, routing issues, and workflow/program definition
- transport tasks/tickets should never float without a routed pipeline and owning worker

### `PushingWorkers`

Canonical worker anchors:

- `pushingcap_orchestrator`
- `google_run_brain_ingestion`
- `pushingcap_sick_memory_dude`
- `google_run_pc_paygate_bridge`

Execution-side human/external lane:

- `p242835887_subcontractor_job`
- `p242835887_subcontractors`
- subcontractor portal UI

Contract:

- `pushingcap_orchestrator` owns routing, contracts, and stage movement
- `google_run_brain_ingestion` owns intake normalization and shell creation
- `google_run_pc_paygate_bridge` owns payment bridge duties
- `pushingcap_sick_memory_dude` owns memory writeback and research context
- subcontractor execution is not modeled as a first-class `worker_profiles` transport worker yet; it is modeled through subcontractor jobs and the portal

### `PushingPay`

Canonical pay objects:

- `quotes`
- `invoices` API/store
- `p242835887_payouts`
- payment fields on `deals`
- `subcontractor_payout` and `subcontractor_payout_amount` on `p242835887_service_requests`

Contract:

- customer quote/payment side:
  - quote or invoice document
  - payment link
  - paid state written back to the deal
- subcontractor payout side:
  - payout record or payout amount on service request
  - payout completion closes the transport lane financially
- `PushingPay` namespace shell should be treated as a view over these real objects until seeded

## Exact Association Contract

### Confirmed association labels already used in code

From `/Users/emmanuelhaddad/Downloads/internal-crm/web/src/pages/PushingDebateStudioPage.tsx`:

- `tasks -> tickets` = `blocked_by`
- `tasks -> workflow_definitions` = `implements`
- `tasks -> workflow_definitions` = `derived_from`
- `tasks -> workflow_pipelines` = `routed_through`
- `tasks -> tool_definitions` = `uses_tool`
- `tasks -> worker_profiles` = `owned_by`
- `tickets -> workflow_definitions` = `supports`
- `tickets -> workflow_definitions` = `originated_from`
- `tickets -> tool_definitions` = `unblocks`
- `tickets -> worker_profiles` = `assigned_to`

From `/Users/emmanuelhaddad/Downloads/internal-crm/backend/app/push_p.py`:

- `deals -> invoices` = `quote`
- `contacts -> invoices` = `quote_recipient`

### Transport bundle association contract to implement

Use these edges as the exact first-pass contract:

| from | to | label | status |
|---|---|---|---|
| `p242835887_service_requests` | `deals` | `converted_to` | proposed |
| `p242835887_service_requests` | `p242835887_transport` | `requests_transport` | proposed |
| `deals` | `p242835887_transport` | `fulfilled_by_transport` | proposed |
| `p242835887_transport` | `workflow_pipelines` | `routed_through` | proposed |
| `p242835887_transport` | `tasks` | `tracked_by` | proposed |
| `p242835887_transport` | `tickets` | `blocked_by` | proposed |
| `p242835887_transport` | `p242835887_subcontractor_job` | `assigned_job` | proposed |
| `p242835887_subcontractor_job` | `p242835887_subcontractors` | `assigned_to` | proposed |
| `tasks` | `worker_profiles` | `owned_by` | confirmed label |
| `tickets` | `worker_profiles` | `assigned_to` | confirmed label |
| `deals` | `invoices` | `quote` | confirmed label |
| `contacts` | `invoices` | `quote_recipient` | confirmed label |
| `p242835887_service_requests` | `p242835887_payouts` | `pays_out` | proposed |

## Worker Binding For The Bundle

| bundle namespace | primary worker or executor | responsibility |
|---|---|---|
| `PushingTransport` | `pushingcap_orchestrator` | route the transport lane and advance it through contract stages |
| `PushingForms` | `google_run_brain_ingestion` | normalize intake into shells and route them into A relations management platform |
| `PushingPipelines` | `pushingcap_orchestrator` | own stage order, transitions, and workflow wiring |
| `PushingTasks` | `pushingcap_orchestrator` | assign and route tasks/tickets |
| `PushingWorkers` | `worker_profiles` plus subcontractor job lane | bind internal workers and external execution operators |
| `PushingPay` | `google_run_pc_paygate_bridge` | generate and reconcile payment bridge state |
| memory sidecar | `pushingcap_sick_memory_dude` | write back durable route memory and research context |

## Implementation Order

1. Stop writing into the empty namespace shells as if they are the live data plane.
2. Treat the bundle as a view over the backing objects named above.
3. Wire the first real public transport intake into:
   - `p242835887_service_requests`
   - then `deals`
   - then `p242835887_transport`
4. Add the proposed association edges for service request -> deal -> transport -> subcontractor job -> payout.
5. Bind all transport tasks/tickets to:
   - one pipeline
   - one stage
   - one owner worker
6. Let `PushingTransport`, `PushingForms`, `PushingPipelines`, `PushingTasks`, `PushingWorkers`, and `PushingPay` remain namespace/view layers until their studio tables are intentionally seeded.

## Bottom Line

The exact contract is:

- `PushingTransport` is the transport bundle view
- `PushingForms` is the intake and return surface view
- `PushingPipelines` is the routing and stage view
- `PushingTasks` is the work-item and blocker view
- `PushingWorkers` is the internal worker plus subcontractor execution view
- `PushingPay` is the quote, payment, payout, and paygate view

But the real live storage today is:

- `p242835887_service_requests`
- `deals`
- `p242835887_transport`
- `tasks`
- `tickets`
- `worker_profiles`
- `quotes` / `invoices`
- `p242835887_payouts`
- `p242835887_subcontractor_job`
- `p242835887_subcontractors`

That is the contract to build against.
