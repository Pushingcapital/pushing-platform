# PushingSecurity Universal Onboarding Program

## Purpose

`PushingSecurity` should be the universal onboarding application for the Pushing Capital ecosystem.

That gives the business one secure front door and lets the downstream lanes stay focused on execution instead of inventing separate onboarding apps.

## Core Rule

Use `PushingSecurity` to onboard:

- customers
- leads
- transport clients
- inspection clients
- parts sales prospects
- finance applicants
- DMV / compliance users
- subcontractors
- operators
- partners and vendors

The other lane surfaces should branch after onboarding, not before it.

## Why This Simplifies The System

### 1. One secure front door

`PushingSecurity` already has the right shape:

- public onboarding routes
- operator authentication
- encrypted provider-key storage
- legal document template handling
- OCR and intake metadata scaffolding
- webhook and integration routes

### 2. Cleaner lane separation

With this model:

- `PushingSecurity` = public onboarding program
- `PushingForms` = intake matrix and packet logic layer
- `PushingTransport` = transport execution lane
- `PushingInspections` = evidence and packet lane
- `Parts Sales` = sourcing and sales lane
- `Push P` = workflow truth and next-step lane
- `subcontractorPortal` = worker/mobile execution lane

### 3. Better control

One onboarding program means:

- cleaner A relations management platform creation rules
- one consent and identity layer
- one document and template program
- one operator review model
- one security and secrets posture

## Canonical Intake Flow

`public user -> PushingSecurity onboard -> intake classification -> service request or contact creation -> lane binding -> workflow/pipeline handoff -> Push P / worker execution`

## Onboarding Modes

### Customer / client onboarding

Use for:
- transport requests
- inspection requests
- parts sales requests
- finance readiness or lender matching intake
- DMV and compliance intake

Default outputs:
- `contact`
- `company`
- `p242835887_service_requests`
- optional `deal`
- optional onboarding ticket/task pack

### Worker / subcontractor onboarding

Use for:
- field workers
- subcontractors
- carriers
- service vendors

Default outputs:
- worker or subcontractor shell
- required contracts and credentials
- downstream mobile/field portal routing

### Operator / partner onboarding

Use for:
- internal operators
- channel partners
- tool and platform operators

Default outputs:
- identity and permissions shell
- operator-facing onboarding or access ticket

## Capability Matrix

The onboarding app should be able to load serious API capability without becoming a different product.

### Identity and image intake

- face detection for face presence and image quality checks
- document OCR for licenses and onboarding documents
- barcode / ID extraction
- image quality checks for blur, cropping, glare, and legibility

Rule:
- use face detection for onboarding quality and capture checks
- do not treat it as person-recognition doctrine

### Document and packet intelligence

- legal template binding
- document classification
- packet generation
- checklist completion scoring
- intake metadata extraction

### Voice and communications intake

- speech-to-text for voice onboarding
- call or voicemail transcript ingestion
- message summarization
- callback packet creation

### Workflow and control-plane APIs

- A relations management platform create/update routes
- workflow and pipeline routing
- automation playbook triggering
- webhook and callback handling
- memory writeback hooks

### Lane-routing intelligence

- route the person into `transport`, `inspection`, `parts_sales`, `finance`, `dmv`, `courses`, or `worker`
- create the first service request or onboarding shell
- bind the correct owner worker

## Lane Routing After Onboarding

| Intake classification | Downstream lane |
| --- | --- |
| `transport` | `PushingTransport` workflow and pipelines |
| `inspection` | `PushingInspections` workflow and packet lane |
| `parts_sales` | `Parts Sales` workflow |
| `finance` | finance readiness and lender matching lane |
| `dmv` | DMV workflow and compliance lane |
| `courses` | `userOne Courses` training and filtration lane |
| `worker` | subcontractor/mobile execution lane |

## Relationship To PushingForms

`PushingForms` should not compete with `PushingSecurity` as the public onboarding app.

The cleaner relationship is:

- `PushingSecurity` = public onboarding application program
- `PushingForms` = internal intake matrix, form design system, and form-packet logic layer

## Required Workflow Consequence

Every downstream lane should be able to answer:

1. what onboarding mode entered through `PushingSecurity`?
2. what intake packet was collected?
3. what record was created first?
4. what lane was selected?
5. what worker now owns the next move?

## Best Next Build Move

1. make `PushingSecurity` the official onboarding front door in the canonical docs
2. bind onboarding classifications to service-request creation
3. route each classification into the right workflow and pipeline
4. keep `PushingForms` as the intake-matrix engine behind it
5. let `Push P` read the onboarding result and decide the next step

## Anchors

- [README.md](/Users/emmanuelhaddad/projects/pushingsecurity-control/apps/pushing-capital-web/README.md)
- [(customer)/onboard/page.tsx](/Users/emmanuelhaddad/projects/pushingsecurity-control/apps/pushing-capital-web/src/app/%28customer%29/onboard/page.tsx)
- [pushing_app_constellation_map.md](/Users/emmanuelhaddad/pushing_app_constellation_map.md)
- [pushing_forms_dmv_courses_map.md](/Users/emmanuelhaddad/pushing_forms_dmv_courses_map.md)

## Bottom Line

If the goal is easier onboarding, fewer fragmented apps, and a cleaner route into PCRM, then `PushingSecurity` should be the application program that brings everyone in.
