# PushingForms DMV Public Intake Matrix

## Purpose

This is the canonical public-intake-to-A relations management platform matrix for the `PushingForms` and `DMV` lane.

It keeps the public surfaces, internal intake logic, workflow routing, packet generation, and memory writeback aligned so the lane can become autonomous without turning into a pile of overlapping pages.

## Operating Truth

`PushingForms` is the intake and consent system.
`DMV` is the compliance and identity-heavy automotive lane.
`Courses` is the training and filtration lane.

The clean model is:

`public surface -> intake packet -> A relations management platform shell -> workflow -> pipeline -> form packet -> worker owner -> public return -> memory`

## Real Surfaces

### Public surfaces

- [public-site.ts](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/lib/public-site.ts#L220)
- [automotive/page.tsx](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/app/automotive/page.tsx#L9)
- [clientportal/page.tsx](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/app/clientportal/page.tsx#L1)
- [userone-courses/page.tsx](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/app/userone-courses/page.tsx#L1)
- `/start-intake`

### Internal operator surfaces

- [PushingFormsPage.tsx](/Users/emmanuelhaddad/pc-data-platform/ui/internal-crm/web/src/pages/PushingFormsPage.tsx#L34)
- [PushingSecurityPage.tsx](/Users/emmanuelhaddad/pc-data-platform/ui/internal-crm/web/src/pages/PushingSecurityPage.tsx#L1)
- [clientportal/settings/control/page.tsx](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/app/clientportal/settings/control/page.tsx#L1)

### Doctrine / reference surfaces

- [App.jsx](/Users/emmanuelhaddad/PushingStandby/src/App.jsx#L114)
- [pushing_forms_dmv_courses_map.md](/Users/emmanuelhaddad/pushing_forms_dmv_courses_map.md)
- [ui_offer_catalog_and_inspection_packet_map.md](/Users/emmanuelhaddad/ui_offer_catalog_and_inspection_packet_map.md)

## Intake Object Stack

### Canonical intake stack

| Layer | Canonical object | Job |
| --- | --- | --- |
| Raw public lead | `service_request` or equivalent | capture the first signal cleanly |
| Normalized intake | `PushingForms` intake shell | normalize consent, identity, and lane selection |
| DMV/compliance shell | DMV-oriented intake record | validate identity, title, registration, and related compliance truth |
| Commercial shell | `deal` | carry pricing, scope, and approval truth |
| Execution shell | `ticket` | own the active work and blockers |
| Micro shell | `task` | chase missing facts, callbacks, proof, or docs |
| Domain shell | inspection / transport / finance record as needed | store lane-specific detail |
| Memory shell | NotebookLM / BigQuery / A relations management platform snapshot | preserve route lessons and precedent |

### Practical interpretation

- `PushingForms` should usually create or normalize the intake shell first
- DMV-heavy intake should bind the right compliance lane next
- if the lane becomes commercial, spawn a deal
- if the lane requires active work, spawn a ticket
- if the lane needs missing facts or callbacks, spawn tasks

## Workflow Route

### Core workflow phases

1. `ingest`
2. `normalize`
3. `bind`
4. `qualify`
5. `execute`
6. `verify`
7. `writeback`

### Phase detail

#### 1. `ingest`

Purpose:
- capture the public request or operator-led intake

Expected outputs:
- raw lead record
- source channel
- contact or identity seed

#### 2. `normalize`

Purpose:
- clean up identity, lane, and required fields

Expected outputs:
- normalized name, phone, email, VIN, address, or learner/account identity
- completeness score
- missing fact list

#### 3. `bind`

Purpose:
- attach the request to the correct downstream shell

Expected outputs:
- deal link if commercial
- ticket link if operational
- DMV/compliance link if identity-heavy
- course/learner link if training-related

#### 4. `qualify`

Purpose:
- check whether the lane is ready to move or must wait

Expected outputs:
- readiness state
- blocker state
- required follow-up

#### 5. `execute`

Purpose:
- perform the actual lane work

Expected outputs:
- form sent
- packet sent
- doc collected
- authority confirmed
- proof captured
- next-step task spawned

#### 6. `verify`

Purpose:
- make sure the work completed and the evidence is real

Expected outputs:
- validated docs
- compliance truth
- commercial truth
- execution truth

#### 7. `writeback`

Purpose:
- preserve the route so the system learns

Expected outputs:
- A relations management platform update
- NotebookLM note
- BigQuery trace
- follow-up logic

## Pipeline Route

### Intake pipeline

Primary object:
- `service_request` or equivalent intake shell

Purpose:
- capture the public request and normalize it

### DMV pipeline

Primary object:
- DMV-oriented compliance record or deal/task shell

Purpose:
- handle title, identity, registration, and compliance truth

### Commercial pipeline

Primary object:
- `deal`

Purpose:
- carry pricing, approval, and scope truth when the lane becomes commercial

### Execution pipeline

Primary object:
- `ticket`

Purpose:
- own active work, blockers, callbacks, and coordination

### Micro-follow-through pipeline

Primary object:
- `task`

Purpose:
- chase missing facts, forms, callbacks, and proof

## Required Form Packets

These are the form packets this lane should be able to produce.

### 1. Intake and normalization packet

Contains:
- raw identity data
- contact seed
- lane selection
- unverified or partially verified details

Typical use:
- first public or operator entry

### 2. DMV / compliance packet

Contains:
- title and registration details
- VIN / odometer / identity confirmation
- lien or compliance truth
- signature and authorization fields

Typical use:
- DMV-heavy automotive workflow

### 3. First-through-the-door contract packet

Contains:
- normalized details
- consent
- initial inspection or compliance fee
- required acknowledgements

Typical use:
- when the lane needs a formal agreement before execution

### 4. Exit / renewal packet

Contains:
- final result
- next offer
- renewal or upsell path
- transport, maintenance, or finance next step

Typical use:
- end-of-lane handoff or follow-on business

### 5. Training / filtration packet

Contains:
- course enrollment
- readiness check
- operator qualification
- learning path

Typical use:
- when the lane is actually a learner or partner qualification surface

## Worker Owners

| Function | Primary worker owner | Supporting workers |
| --- | --- | --- |
| Intake normalization | `google_run_brain_ingestion` | `pushingcap_orchestrator` |
| Workflow routing | `pushingcap_orchestrator` | `postman_api` |
| DMV / compliance truth | Push P DMV truth gate / orchestration lane | `ops_health` |
| Forms / template truth | `PushingForms` internal A relations management platform lane | `pushingcap_orchestrator` |
| Courses / filtration | `userOne Courses` lane | `pushingcap_orchestrator` |
| Memory / precedent | `pushingcap_sick_memory_dude` | `bigquery_memory_hub` |
| Public return / status | `clientportal` / `subcontractorPortal` | `pushingcap_orchestrator` |

## Public Returns

What the user should see after intake:

- confirmation that the request was received
- what lane it entered
- what is missing
- what the next required action is
- whether the request is in DMV, commercial, execution, or training mode

## Memory And Writeback

Every completed or blocked intake should write back:

- the chosen lane
- the missing fields
- the final state
- any blocker or exception
- the precedent for the next time

Recommended memory surfaces:

- A relations management platform snapshot
- NotebookLM writeup
- BigQuery trace / audit record

## Missing Bindings

These are the biggest gaps to close next.

1. Public intake is not yet fully separated into explicit lane-specific forms.
2. DMV is present as a workflow concept, but not yet a standalone public form suite.
3. `PushingForms` exists internally, but it is still more doctrine-heavy than fully packetized on the public side.
4. The path from form submission to `service_request` / `deal` / `ticket` / `task` is not fully explicit for each lane.
5. Courses are real, but they still need a cleaner handoff rule into the intake and qualification system.

## Best Next Build Move

The best next build move is:

1. split the intake lane into explicit public forms
2. attach each form to the correct A relations management platform shell
3. bind DMV forms to the compliance workflow
4. bind courses to the filtration workflow
5. generate one parent control ticket per lane
6. generate one task pack per form packet

## What To Stop Doing

Do not keep treating these as one blended concept:

- `PushingForms`
- DMV
- courses
- public narrative
- execution control

They are connected, but they are not the same thing.

## Bottom Line

`PushingForms` should become the intake and consent system.
`DMV` should become the compliance lane.
`Courses` should become the training and filtration lane.

The public matrix should make it obvious which lane a visitor entered, which shell it created, what is still missing, and what the next safe move is.
