# Transport End-to-End Map

Date: 2026-04-03
Owner: Manny + Codex + P swarm
Scope: First-pass canonical map for PushingTransport from public surface to A relations management platform truth, workflow execution, external platforms, and memory writeback.

Companion contract:

- `/Users/emmanuelhaddad/pushing_transport_bundle_contract.md`
- `/Users/emmanuelhaddad/pushing_transport_canary_seed_pack.md`
- `/Users/emmanuelhaddad/pushing_transport_workflow_pipeline_spec.md`

## Confirmed Public Surfaces

- Standalone site: `/Users/emmanuelhaddad/pushing-transport`
- Primary public entry labels:
  - `I am Shipping`
  - `I am Towing`
- Broader ecosystem surface:
  - `/Users/emmanuelhaddad/PushingStandby/src/App.jsx`
- Dealer/public site narrative:
  - `/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/lib/public-site.ts`
- Main-site gateway surfaces:
  - `clientportal`
  - `subcontractorPortal`
  - `userOne Courses`
- Hidden fallback intake:
  - `/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/app/start-intake/page.tsx`
- Important constraint:
  - the standalone `PushingTransport` page has CTA labels but no live form action, navigation, or fetch wiring yet

## Confirmed Core Objects

- A relations management platform custom object: `p242835887_transport`
- Related object families:
  - `deals`
  - `contacts`
  - `companies`
  - `p242835887_service_requests`
  - `p242835887_subcontractors`
  - `p242835887_subcontractor_job`
- Known live entities:
  - Vicasso Motorsports
  - Central Dispatch
  - Ioniq Buyer

## Confirmed Workflow Spine

- Transport schema includes:
  - pickup and delivery contact/address fields
  - quote, deposit, carrier pay, remaining balance
  - transport status and type
  - vehicle data
  - pre-trip and post-trip photos
  - bill of lading
- Deal transport stages include:
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
- Adjacent workflow lanes confirmed in exports:
  - `Service Request Pipeline`
  - `Master Customer Journey`
  - `Subcontractor Task Management`
- Confirmed transport workflow doctrine from memory exports:
  - `Initial Processing`
  - `Intelligence Gathering`
  - `Dynamic Pricing`
  - `Trucker Matching`
  - `Central Dispatch`
  - `Communication`
  - `Tracking`
  - `Profit Optimization`

## First-Pass Canonical Route

| public_surface | form_or_action | crm_objects_created | workflow | pipeline | stage_sequence | worker_owner | external_software | callback_or_public_return | memory_writeback |
|---|---|---|---|---|---|---|---|---|---|
| `PushingTransport` site, dealer narrative, or fallback intake | mailto intake, transport request, or initial digital ticket creation | `p242835887_service_requests`, `contact`, `company`, `deal`, `task`, `ticket`, `p242835887_transport` | intake and qualification | `auto-transport` plus service request intake | `Form Submitted -> Collect Quote -> Send Quote for Authorization` | `pushingcap_orchestrator` plus intake worker | HubSpot/PCRM, intake mail route, quote sources | quote receipt, callback, route summary | intake summary, route evidence, pricing rationale |
| transport ops / dispatcher lane | dispatch post, carrier search, driver assignment, subcontractor matching | update `deal`, update `p242835887_transport`, dispatch ticket/task, `p242835887_subcontractor_job` | dispatch and carrier lock | `auto-transport` plus subcontractor task management | `Central Dispatch Quote -> Negotiate & Close Driver -> Connect Driver to Client -> Post Job` | transport dispatcher lane, subcontractor lane | Central Dispatch, Super Dispatch, subcontractor API, document capture | carrier confirmation, pickup window, client update | carrier selection, dispatch lineage, exceptions |
| in-transit and closeout | BOL upload, delivery proof, status update, payout close | update `transport_status`, BOL fields, photo fields, financial fields, subcontractor payout fields | fulfillment and closeout | `auto-transport` | `Customer Success Check In -> Support -> Closed Won -> Payout Completed` | transport dispatcher lane plus finance/recovery lane | document storage, payment systems, GPS/location doctrine | delivery update, BOL/proof, payout notice | delivery evidence, payout outcome, reusable route memory |

## Swarm Findings

- Confirmed CTA labels on the standalone transport site:
  - `Find a Tower`
  - `View Load Board`
- Confirmed current limitation:
  - `/Users/emmanuelhaddad/pushing-transport/app.js` only animates stats and hover states
  - no click handlers, route wiring, or form submission are present
- Confirmed public authenticated operating surfaces:
  - `clientportal`
  - `subcontractor portal`
- Confirmed blueprint intake/public-return model in `/Users/emmanuelhaddad/PushingStandby/src/App.jsx`:
  - `The Intake & Normalization Form`
  - `The First Through The Door Contract`
  - `The Exit Vector / Renewal Form`
- Confirmed live transport work references:
  - ticket `235912606402` = `Workflow: Transport phases -> Tickets + Tasks`
  - ticket `235951861480` = `Tooling: Transport Request intake -> HubSpot objects`
  - ticket `235401700037` = `Auto Transport: Aston Vantage Black one`
  - task `290833799923` = `Follow up on BOL`
  - task `292869757668` = `📌 +14804339606: access to transport`

## Confirmed External Platform Layer

- HubSpot / PCRM as transport system-of-record
- Central Dispatch
- Super Dispatch
- Google Maps Routes API
- Google Maps Geocoding / Places API
- Google Maps Aerial View API
- Google Vision API for transport documents
- GPS / text-to-location mapping doctrine

## External Platform Notes

- `Central Dispatch` is strongly confirmed in schema, stage design, and pricing/listing fields.
- `Super Dispatch` is only weakly confirmed as a company/platform mention, not as a fully wired execution path.
- `Vicasso Motorsports` is confirmed as a transport-side company/customer, not as a software platform.
- `BOL` and pre/post-trip photos are confirmed as tracked transport artifacts.
- `GPS` and Google Maps are confirmed in doctrine, but not yet confirmed as a fully wired live integration in local code.

## Open Mapping Gaps

- Exact public form path that creates the first transport record
- Exact worker profile that owns transport dispatch day to day
- Exact association rules between buyer, carrier, Vicasso, Central Dispatch, deal, and transport object
- Exact buyer and carrier object strategy, since no dedicated buyer or carrier-assignment object surfaced cleanly
- Exact BOL upload and document storage callback path
- Exact subcontractor job linkage from transport dispatch into fulfillment
- Exact public-facing return messages for quote, dispatch, in-transit, and delivered states

## Seed Evidence Files

- `/Users/emmanuelhaddad/pushing-transport/index.html`
- `/Users/emmanuelhaddad/pushing-transport/app.js`
- `/Users/emmanuelhaddad/PushingStandby/src/App.jsx`
- `/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/lib/public-site.ts`
- `/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/components/subcontractor/SubcontractorConsole.tsx`
- `/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/app/start-intake/page.tsx`
- `/Users/emmanuelhaddad/Downloads/internal-crm/web/src/pages/OrchestrationPage.tsx`
- `/Users/emmanuelhaddad/Downloads/internal-crm/web/src/lib/platformNarrative.ts`
- `/Users/emmanuelhaddad/deals_properties.tsv`
- `/Users/emmanuelhaddad/LLM_Materials_Organized/databases normalization and consolidation/notebooklm_upload_ready/platform_schema_packet_2026-03-19/object-properties/p242835887_transport.csv`
- `/Users/emmanuelhaddad/output/playwright/pushingcap-takeout/live-export/data/p242835887_service_requests.json`
- `/Users/emmanuelhaddad/output/playwright/pushingcap-takeout/live-export/data/tickets.json`
- `/Users/emmanuelhaddad/output/playwright/pushingcap-takeout/live-export/data/tasks.json`
- `/Users/emmanuelhaddad/output/playwright/pushingcap-takeout/live-export/data/ai_memory.json`
