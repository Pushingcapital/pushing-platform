# UI Offer Catalog And Inspection Packet Map

Date: 2026-04-03
Owner: Manny + Codex
Status: Working offer map
Purpose: Define the different UIs Pushing Capital should offer, the products and services behind them, and the inspection forms and packet surfaces that should be visible to operators and the public.

## Big Picture

Pushing Capital should not present itself as one generic portal.

It should present a family of connected UIs, each with a clear job:

- public narrative and service entry
- authenticated execution and next-step routing
- subcontractor and field participation
- operator control and internal orchestration
- domain-specific intake and evidence capture
- asset and packet generation
- training and filtration

The main rule is:

`UI -> service lane -> workflow -> ticket/task pack -> memory`

That keeps the front-end offer tied to the real execution model.

## The UI Families To Offer

## 1. Public narrative and entry UIs

These are the public-facing pages that explain the business and start the right lane.

Best live anchors:

- [public-site.ts](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/lib/public-site.ts#L220)
- [public-site.ts](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/lib/public-site.ts#L283)

Current offer surfaces:

- `Platform`
- `Services Hub`
- `For Dealers`
- `For Lenders`
- `Finance`
- `Automotive`
- `Business`
- `About`
- `Insights`
- `Press`

What these UIs should do:

- explain the lane
- explain the outcome
- explain the workflow
- route the visitor into the right intake or portal

## 2. Authenticated execution UIs

These are the surfaces where the customer or internal user sees the next step.

Best live anchors:

- [clientportal/page.tsx](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/app/clientportal/page.tsx#L1)
- [ClientPortal.tsx](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/components/portal/ClientPortal.tsx#L428)

Current offer surfaces:

- `PushingP / clientportal`
- payment-link and quote view
- workflow snapshot
- next required action

What these UIs should do:

- show the workflow snapshot
- show missing docs
- show quote or payment state
- show next required action
- preserve the execution trail

## 3. Subcontractor and field UIs

These are the execution-side interfaces for people doing field work, transport, shop work, inspections, or supporting actions.

Best live anchor:

- [public-site.ts](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/lib/public-site.ts#L225)

Current offer surface:

- `subcontractorPortal`

What this UI should do:

- receive assigned work
- show packet requirements
- upload evidence
- confirm progress
- close steps back into the control plane

## 4. Internal operator UIs

These are the command surfaces used to steer the system.

Best live anchors:

- [PushingFormsPage.tsx](/Users/emmanuelhaddad/pc-data-platform/ui/internal-crm/web/src/pages/PushingFormsPage.tsx#L34)
- [PushingInspectionsPage.tsx](/Users/emmanuelhaddad/pc-data-platform/ui/internal-crm/web/src/pages/PushingInspectionsPage.tsx#L240)
- [page.tsx](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/app/clientportal/settings/control/page.tsx#L10)

Current offer surfaces:

- `PushingForms`
- `PushingInspections`
- company control console / `PushingAutomations`
- internal A relations management platform routes

What these UIs should do:

- create or normalize intake
- manage forms and packets
- build automations
- monitor worker actions
- review blockers and callbacks

## 5. Asset and media UIs

These are the surfaces that create assets and publish-ready deliverables.

Best live anchors:

- [wrangler.jsonc](/Users/emmanuelhaddad/projects/pushingcap-web-v2/workers/assets-gate/wrangler.jsonc#L9)
- [context-v3.js](/Users/emmanuelhaddad/projects/pc-ops-hub/workers/pushingcap-orchestrator/src/context-v3.js#L25)

Current offer surfaces:

- `PushingAssets`
- `assets.pushingcap.com`
- `Assets Multimedia`

What these UIs should do:

- intake asset requests
- create design and marketing packets
- track asset lineage
- return publish-ready outputs

## 6. Training and filtration UIs

These are the UIs that teach operators and filter the right people into the right roles.

Best live anchor:

- [userone-courses/page.tsx](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/app/userone-courses/page.tsx#L1)

Current offer surface:

- `userOne Courses`

What this UI should do:

- deliver training
- filter and qualify users
- prepare operators, subcontractors, and deal architects

## Recommended UI Product Stack

This is the clean product lineup to present:

| UI family | primary brand or route | main job |
|---|---|---|
| Public site | `pushingcapital.com` | explain services and route users into the right lane |
| PushingSecurity | secure onboarding program | onboard customers, workers, partners, and route them into the right workflow |
| Push P | `clientportal` | show workflow truth and the next required action |
| Subcontractor portal | `subcontractorPortal` | receive work, upload evidence, confirm execution |
| PushingForms | internal A relations management platform / intake matrix | create form-led intake logic and packet-ready records behind onboarding |
| PushingInspections | inspection UI | capture evidence, findings, and inspection packets |
| PushingAssets | `assets.pushingcap.com` | generate asset, design, and packet outputs |
| PushingAutomations | control console | build playbooks and triggers |
| userOne Courses | learner platform | train and qualify people into the system |

## Products And Services We Offer

High-confidence business inventory comes from:

- [pushing_capital_products_services_context_2026-03-10.md](/Users/emmanuelhaddad/pushing_capital_products_services_context_2026-03-10.md#L13)

## Automotive

Main service groups:

- vehicle sales
- inspections and appraisals
- DMV
- transport
- glass
- body work
- repair
- tires and wheels
- keys
- mobile services
- parts
- labor

High-signal automotive offers:

- `Body Inspection`
- `Complete Vehicle Scan`
- `Pre-purchase Inspection`
- `Safety Inspection`
- `Vehicle Appraisal`
- `Standalone Inspection Package`
- `Standalone Appraisal Package`
- `Title & Registration`
- `VIN/Odometer Verification`
- `Notary Services`
- `Standalone DMV Package`
- `Emergency Towing`
- `Scheduled Transport`
- `Standalone Transport Package`
- `Parts (New / Used / Refurbished)`
- `Standalone Parts Package`

## Finance

Main service groups:

- credit services
- auto finance
- business formation
- bookkeeping and tax

High-signal finance offers:

- `Credit Strategy Discovery`
- `Credit Strategy`
- `Tradeline Validation`
- `Loan Acquisition`
- `Funding Options Review`
- `Rate & Term Review`
- `Curated Lender Introductions`
- `Readiness Checklist`
- `Standalone Auto Finance Package`

## Business formation and readiness

High-signal business offers:

- `LLC Formation`
- `Corporation (C/S-Corp)`
- `DBA Registration`
- `Nonprofit Formation`
- `EIN Registration`
- `Business Credit Setup`
- `Monthly Reconciliation`
- `Invoices & Bills Tracking`
- `Profit & Loss (P&L)`
- `Balance Sheet`
- `Tax Summary`
- `Document Gathering`
- `Audit Packet Preparation`

## The Inspection Offer Layer

The inspection business should not be offered as one vague “inspection.”

It should be offered as a menu of inspection modules and packet outputs.

Best live anchors:

- [PushingInspectionsPage.tsx](/Users/emmanuelhaddad/pc-data-platform/ui/internal-crm/web/src/pages/PushingInspectionsPage.tsx#L264)
- [PushingInspectionsPage.tsx](/Users/emmanuelhaddad/pc-data-platform/ui/internal-crm/web/src/pages/PushingInspectionsPage.tsx#L377)

Current module families already implied in the UI:

- `Exterior Geometry`
- `Mechanical Heart`
- `Interior Cabin`
- `Title & Documents`

Current inspection components already implied in the UI:

- full exterior walk
- windshield and glass
- paint depth test
- cold start analysis
- tire and brake telemetry
- undercarriage scan
- cabin optics
- OBD-II diagnostics
- electronic systems
- state title clearance
- VIN verification
- lien and hold check

The current pricing signal in the UI is:

- `$149 / inspection`

The current promise language in the UI implies packetized output:

- structural analysis
- VIN decoding
- title-check parsing
- instant cloud PDF delivery
- escrow-ready structuring

## Inspection Forms To Offer

The forms layer should be split by purpose.

Best doctrinal anchor:

- [pushing_forms_dmv_courses_map.md](/Users/emmanuelhaddad/pushing_forms_dmv_courses_map.md#L13)

Recommended form stack:

### 1. `Inspection Intake Form`

Purpose:

- open the inspection lane

Should collect:

- customer identity
- vehicle identity
- VIN
- address
- issue summary
- urgency
- target outcome

Creates:

- `service_request`
- parent inspection control ticket

### 2. `First Through The Door Inspection Form`

Purpose:

- normalize the first evidence state

Should collect:

- first photos
- condition notes
- signature or consent
- inspection fee consent
- access constraints

Creates:

- inspection shell
- initial tasks
- readiness gate

### 3. `Inspection Evidence Upload Form`

Purpose:

- feed the packet with proof

Should collect:

- photos
- scan outputs
- OBD results
- title docs
- lien docs
- supporting uploads

Creates:

- attachments
- findings tasks
- packet update

### 4. `Inspection Closeout / Next-Step Form`

Purpose:

- route the inspection outcome into the next lane

Should collect:

- findings summary
- recommended route
- client approval
- downstream request

Creates:

- repair handoff
- parts request
- transport request
- DMV packet
- finance packet

## Inspection Packets To Offer

Packets are the real productized outputs.

Recommended packet lineup:

### `Condition Packet`

Purpose:

- summarize the current state of the asset

Contains:

- photos
- damage notes
- scan notes
- findings summary

### `Title And Document Packet`

Purpose:

- confirm ownership and paperwork readiness

Contains:

- VIN verification
- title status
- lien status
- document gaps

### `Repair Handoff Packet`

Purpose:

- move the asset into repair cleanly

Contains:

- inspection findings
- itemized repair needs
- required parts
- estimate notes

### `Transport Readiness Packet`

Purpose:

- move the asset into logistics cleanly

Contains:

- pickup and delivery facts
- drivable or non-drivable state
- carrier notes
- title and access notes

### `Sales Packet`

Purpose:

- make the asset market-ready

Contains:

- condition summary
- photo set
- title state
- repair recommendations
- pricing context

### `Finance Or Insurance Packet`

Purpose:

- support valuation, risk, or underwriting questions

Contains:

- asset identity
- condition evidence
- title status
- issue list
- supporting documents

## The Dedicated Forms UI Opportunity

There is also a standalone forms app that already thinks in ingestion modules.

Best live anchor:

- [App.jsx](/Users/emmanuelhaddad/pushingcap-forms/src/App.jsx#L1)

It already models:

- `VEHICLE_CONDITION`
- `OCR_DL_PARSE`
- `CUSTOMER_INTENT_EXTRACTION`
- `CUSTOM_OBJECT_SYNTHESIS`
- `ALGORITHMIC_COMPUTATION`

And it already expects downstream writes into:

- inspections
- finance studies
- associations
- tasks
- tickets
- workflows
- pipelines
- workers
- products
- services
- payments
- deliverables

That means the forms layer can become more than intake.
It can become the packet-generation and truth-synthesis engine.

## Best Offer Architecture

The cleanest offer architecture is:

1. public site explains the lane
2. form captures the intake
3. Push P shows the workflow snapshot
4. internal A relations management platform manages the control ticket and task pack
5. subcontractor portal handles field execution if needed
6. PushingAssets produces the packet, PDF, media, or presentation output
7. memory and BigQuery keep the lane teachable

## What To Build Next

The strongest next UI product bundles are:

1. `Inspection Intake + Packet UI`
   - inspection form
   - evidence uploader
   - condition packet
   - repair / transport / sales handoff buttons

2. `DMV Forms And Packet UI`
   - title and registration intake
   - identity and doc upload
   - DMV readiness packet

3. `Finance Readiness UI`
   - missing-doc form
   - validated profile view
   - underwriting packet
   - lender packet

4. `PushingAssets Workpack UI`
   - design brief
   - asset request
   - packet generator
   - publish-ready outputs

## Operating Rule

Every UI offer should answer four questions clearly:

- what service is being requested?
- what packet will be produced?
- what workflow record will be created?
- what is the next required action after submission?

If a UI does not answer those four, it is still branding rather than infrastructure.
