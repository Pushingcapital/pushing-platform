# Automotive UI Program Stack

Date: 2026-04-03
Status: Canonical
Owner: Manny + Codex

This is the cleaned automotive UI stack.

The point is not to keep thinking of automotive as one giant surface.
It needs a small set of distinct UI programs with clear audiences, handoffs, and outputs.

## Core Rule

`PushingSecurity` is the intake and lifecycle front door.

After that, the automotive stack splits into distinct operational UIs:

- subcontractor onboarding
- subcontractor execution
- parts sales
- vehicle sales
- mobile worker execution
- `userOne` professional platform

## The Stack

### 1. Automotive Intake And Workflow UI

- anchor:
  - `PushingSecurity /onboard?family=automotive`
- audience:
  - automotive-side users entering the system
- job:
  - classify the request
  - create the intake shell
  - route into the right automotive lane
- outputs:
  - `service_request`
  - contact / company shell
  - workflow routing key
  - required-doc and signature expectations

This is the controlled intake surface, not the execution surface.

### 2. Subcontractor Onboarding UI

- anchor:
  - `PushingSecurity /onboard?audience=subcontractor`
- audience:
  - new subcontractors
  - field operators
  - vendor-side workers
- job:
  - intake
  - qualification
  - identity and compliance review
  - move the person into execution access
- outputs:
  - subcontractor shell
  - worker shell
  - qualification status
  - required-doc checklist

### 3. Subcontractor Execution UI

- anchor:
  - [/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/app/subcontractor/page.tsx](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/app/subcontractor/page.tsx)
  - [/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/components/subcontractor/SubcontractorConsole.tsx](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/components/subcontractor/SubcontractorConsole.tsx)
- audience:
  - approved subcontractors
- job:
  - receive assigned jobs
  - update status
  - upload evidence
  - confirm completion
  - see fee state
- outputs:
  - job-state updates
  - evidence uploads
  - payout-adjacent completion data

This is the current strongest live worker-facing automotive execution UI.

### 4. Parts Sales UI

- anchor:
  - [/Users/emmanuelhaddad/pushing-parts/src/App.jsx](/Users/emmanuelhaddad/pushing-parts/src/App.jsx)
- audience:
  - parts buyers
  - operators
  - parts-side staff
- job:
  - search parts
  - attach parts to a vehicle
  - route sourcing, fitment, ordering, and payment
- outputs:
  - parts request shell
  - vehicle-to-parts fitment context
  - parts order / quote / cart state

This should become the real `PushingParts Sales` UI, not just a catalog mockup.

### 5. Vehicle Sales UI

- current anchor:
  - dealer-facing narrative at [/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/app/for-dealers/page.tsx](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/app/for-dealers/page.tsx)
- audience:
  - dealers
  - licensed automotive professionals
  - sales operators
- job:
  - manage vehicle-sale workflows
  - tie condition, documents, transport, parts, finance, and closeout together
- outputs:
  - vehicle sale record
  - dealer-side execution state
  - document and compliance packet progression

This is still underbuilt.
Right now it exists more as a public dealer narrative than a true operator workspace.

### 6. Mobile Worker UI

- current live anchor:
  - `subcontractorPortal`
- current prototype anchor:
  - [/Users/emmanuelhaddad/pc-data-platform/ui/internal-crm/web/src/pages/PushingTransportPage.tsx](/Users/emmanuelhaddad/pc-data-platform/ui/internal-crm/web/src/pages/PushingTransportPage.tsx)
- audience:
  - mobile field workers
  - transport drivers
  - inspectors
  - field collectors
- job:
  - receive field actions
  - capture inspection evidence
  - upload route / GPS / BOL / delivery proof
  - complete in-field micro-steps
- outputs:
  - field evidence
  - inspection packet inputs
  - route and completion signals

This should be treated as its own UI program, not just a synonym for subcontractor access.

### 7. userOne Professional Platform

- current feeder anchor:
  - [/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/app/userone-courses/page.tsx](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/app/userone-courses/page.tsx)
- current public dealer context:
  - `For Dealers`
  - automotive public-site narrative
- audience:
  - licensed automotive professionals
  - dealers
  - dealer-side operators
  - professional entrants who passed filtration
- job:
  - become the professional automotive platform
  - dealer workspace
  - identity + license + lane access
  - transactions, workflows, records, and professional tooling
- outputs:
  - licensed-user workspace
  - dealer-side workflow and execution access
  - professional state and readiness

The critical clarification is:

`userOne Courses` is not the final product.
It is the feeder lane.

`userOne` is the actual professional platform.

## Sequence

The automotive UI order should be:

1. `PushingSecurity`
2. automotive intake routing
3. subcontractor onboarding
4. subcontractor execution
5. parts sales
6. vehicle sales
7. mobile workers
8. `userOne`

## Why This Matters

Without this separation:

- parts gets buried under generic automotive
- field work gets buried under subcontractors
- dealer work gets buried under public marketing
- `userOne` gets mistaken for just a courses page

With this separation:

- each audience gets a real workspace
- each workspace gets a workflow role
- each workflow role gets a defined output packet

## Immediate Build Guidance

Treat these as the next automotive UI programs to formalize:

1. `PushingParts Sales`
2. `Vehicle Sales Workspace`
3. `Mobile Worker App`
4. `userOne Professional Platform`

The subcontractor surfaces already have the strongest live anchors and should be reused as the execution base.
