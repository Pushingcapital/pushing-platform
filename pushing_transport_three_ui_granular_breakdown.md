# PushingTransport Three-UI Granular Breakdown

## Core Finding

`PushingTransportPage.tsx` contains `13` screen states, but they collapse into `3` real UI families.

Those three UI families are:

1. `Gateway and Onboarding UI`
2. `Client Control UI`
3. `Driver / Field Execution UI`

The strongest production worker-side anchor for the third family is still:

- [subcontractorPortal](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/app/subcontractor/page.tsx)

The strongest transport-specific prototype for all three families is:

- [PushingTransportPage.tsx](/Users/emmanuelhaddad/pc-data-platform/ui/internal-crm/web/src/pages/PushingTransportPage.tsx)

## Why This Matters

This means transport should not be modeled as one giant app.

It should be modeled as:

- `entry and normalization`
- `customer control surface`
- `driver / field execution surface`

That maps cleanly to the formal transport workflow:

- `ingest`
- `bind`
- `qualify`
- `execute`
- `verify`
- `writeback`

Reference:

- [pushing_transport_formal_workflow_definition.md](/Users/emmanuelhaddad/pushing_transport_formal_workflow_definition.md)

## UI Family 1: Gateway and Onboarding UI

### Purpose

Bring either side of the market into the lane and normalize the first shell.

### Audience

- customer / shipper / buyer
- carrier / driver / subcontractor

### Screen states in code

- `GATEWAY`
- `CLIENT_REGISTER`
- `DRIVER_REGISTER`

Reference:

- [PushingTransportPage.tsx:3](/Users/emmanuelhaddad/pc-data-platform/ui/internal-crm/web/src/pages/PushingTransportPage.tsx#L3)
- [PushingTransportPage.tsx:57](/Users/emmanuelhaddad/pc-data-platform/ui/internal-crm/web/src/pages/PushingTransportPage.tsx#L57)
- [PushingTransportPage.tsx:80](/Users/emmanuelhaddad/pc-data-platform/ui/internal-crm/web/src/pages/PushingTransportPage.tsx#L80)
- [PushingTransportPage.tsx:457](/Users/emmanuelhaddad/pc-data-platform/ui/internal-crm/web/src/pages/PushingTransportPage.tsx#L457)

### What the user sees

- entry gateway
- choice between `CLIENT DESKTOP LOGIN` and `DRIVER DESKTOP LOGIN`
- direct jump to simulated driver mobile view
- client onboarding form
- carrier onboarding form

### What it captures

- customer identity
- carrier identity
- dispatch email
- dispatch mobile
- carrier document uploads
- biometric / liveness signals

### Forms and packet logic surfaced here

- `Carrier Onboarding Validation Matrix`
- `Client Brokerage Master Agreement`
- `Carrier Dispatch SLA Agreement`
- future `eBOL` path is declared but not executed yet

Reference:

- [PushingTransportPage.tsx:26](/Users/emmanuelhaddad/pc-data-platform/ui/internal-crm/web/src/pages/PushingTransportPage.tsx#L26)

### Best PCRM / workflow mapping

- `entry_record_type`: `p242835887_service_requests`
- possible carrier-side shell: subcontractor / carrier profile lane
- workflow phases:
  - `ingest`
  - start of `bind`

Reference:

- [pushing_transport_formal_workflow_definition.md:22](/Users/emmanuelhaddad/pushing_transport_formal_workflow_definition.md#L22)
- [pushing_transport_formal_workflow_definition.md:45](/Users/emmanuelhaddad/pushing_transport_formal_workflow_definition.md#L45)

### Exit condition

The transport request or carrier identity is normalized enough to open the real workspace.

## UI Family 2: Client Control UI

### Purpose

Give the customer the commercial and status-control surface for the transport job.

### Audience

- customer
- buyer
- shipper

### Screen states in code

- `CLIENT_DASH`
- `CLIENT_MATCHED`
- `CLIENT_APP_HOME`

Reference:

- [PushingTransportPage.tsx:110](/Users/emmanuelhaddad/pc-data-platform/ui/internal-crm/web/src/pages/PushingTransportPage.tsx#L110)
- [PushingTransportPage.tsx:311](/Users/emmanuelhaddad/pc-data-platform/ui/internal-crm/web/src/pages/PushingTransportPage.tsx#L311)
- [PushingTransportPage.tsx:322](/Users/emmanuelhaddad/pc-data-platform/ui/internal-crm/web/src/pages/PushingTransportPage.tsx#L322)

### What the user sees

- quote engine
- optional inspection add-on
- escrow / rate lock call-to-action
- payment secured state
- assigned driver state
- mobile status device
- live route telemetry
- maps / chat / escrow controls

### Commercial actions

- review live quote
- add inspection
- lock rate
- initiate escrow
- see assigned driver
- open customer mobile app

### Operational truth exposed

- `ETA`
- `driver assigned`
- `live geofence`
- `distance remaining`
- no-human-interaction-required system messaging

### Best PCRM / workflow mapping

- `service_request`
- `deal`
- `quote`
- `ticket`
- `p242835887_transport`

This UI spans:

- late `bind`
- `qualify`
- customer-facing portions of `execute`
- customer-facing portions of `verify`

Reference:

- [pushing_transport_formal_workflow_definition.md:71](/Users/emmanuelhaddad/pushing_transport_formal_workflow_definition.md#L71)
- [pushing_transport_formal_workflow_definition.md:98](/Users/emmanuelhaddad/pushing_transport_formal_workflow_definition.md#L98)
- [pushing_transport_formal_workflow_definition.md:125](/Users/emmanuelhaddad/pushing_transport_formal_workflow_definition.md#L125)
- [pushing_transport_formal_workflow_definition.md:155](/Users/emmanuelhaddad/pushing_transport_formal_workflow_definition.md#L155)

### Core deliverables it reflects

- `internal_quote_compiled`
- `authorization_sent`
- `authorization_response_recorded`
- `driver_assigned`
- `buyer_driver_connection_created`
- `location_update_logged`

## UI Family 3: Driver / Field Execution UI

### Purpose

Give the carrier / driver / subcontractor the execution, compliance, and payout surface.

### Audience

- carrier
- driver
- subcontractor
- mobile field worker

### Screen states in code

- `DRIVER_DASH`
- `WALKAROUND_TEMPLATE`
- `DRIVER_APP_HOME`

Reference:

- [PushingTransportPage.tsx:192](/Users/emmanuelhaddad/pc-data-platform/ui/internal-crm/web/src/pages/PushingTransportPage.tsx#L192)
- [PushingTransportPage.tsx:300](/Users/emmanuelhaddad/pc-data-platform/ui/internal-crm/web/src/pages/PushingTransportPage.tsx#L300)
- [PushingTransportPage.tsx:389](/Users/emmanuelhaddad/pc-data-platform/ui/internal-crm/web/src/pages/PushingTransportPage.tsx#L389)

### What the user sees

- route manifest
- carrier payout view
- forms and permissions registry
- walkaround / capture step
- eBOL camera
- engine chat
- funds view
- route telemetry
- extra nearby vehicle intelligence

### Compliance and packet logic surfaced here

- carrier onboarding validation
- dispatch SLA
- `FMCSA 360° Walkaround Liability Document (eBOL)`
- signed-document state
- normalization-task state for forms not yet complete

### Operational actions

- submit verification
- enter dispatch dash
- view next payload
- complete capture
- execute pay
- add route-adjacent vehicles to manifest
- capture eBOL
- chat with engine
- view funds state

### Best PCRM / workflow mapping

- `tickets`
- `tasks`
- `p242835887_transport`
- `p242835887_payouts`
- subcontractor job state in the live worker app

This UI spans:

- `execute`
- `verify`
- start of `writeback`

Reference:

- [pushing_transport_formal_workflow_definition.md:125](/Users/emmanuelhaddad/pushing_transport_formal_workflow_definition.md#L125)
- [pushing_transport_formal_workflow_definition.md:155](/Users/emmanuelhaddad/pushing_transport_formal_workflow_definition.md#L155)
- [pushing_transport_formal_workflow_definition.md:184](/Users/emmanuelhaddad/pushing_transport_formal_workflow_definition.md#L184)

### Worker ownership

- transport execution lane
- mobile worker lane
- `pushingcap_orchestrator`
- `google_run_pc_paygate_bridge`

Reference:

- [pushing_transport_formal_workflow_definition.md:147](/Users/emmanuelhaddad/pushing_transport_formal_workflow_definition.md#L147)
- [pushing_transport_canonical_execution_matrix.md:232](/Users/emmanuelhaddad/pushing_transport_canonical_execution_matrix.md#L232)

### Live production anchor

The strongest real worker-side production surface for this family is not the prototype itself. It is:

- [subcontractorPortal](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/app/subcontractor/page.tsx)
- [SubcontractorConsole.tsx](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/components/subcontractor/SubcontractorConsole.tsx)

That live surface already reads and updates:

- assigned jobs
- quoted fees
- paid totals
- assigned / started / completed timestamps
- job status transitions

Reference:

- [subcontractor/page.tsx:13](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/app/subcontractor/page.tsx#L13)
- [subcontractor/page.tsx:58](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/app/subcontractor/page.tsx#L58)
- [SubcontractorConsole.tsx:5](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/components/subcontractor/SubcontractorConsole.tsx#L5)
- [SubcontractorConsole.tsx:108](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/components/subcontractor/SubcontractorConsole.tsx#L108)

## The Clean Model

The clean model is not:

- one transport app
- one customer app
- one driver app
- plus random mobile prototypes

The clean model is:

1. `Gateway and Onboarding UI`
2. `Client Control UI`
3. `Driver / Field Execution UI`

And the production-grade worker anchor under the third family is:

- `subcontractorPortal`

## Record And Ownership Summary

| UI family | Primary audience | Main records | Workflow phases | Best owner |
| --- | --- | --- | --- | --- |
| `Gateway and Onboarding UI` | customer and carrier | `p242835887_service_requests`, onboarding packets | `ingest`, early `bind` | `google_run_brain_ingestion` |
| `Client Control UI` | customer / shipper | `service_request`, `deal`, `quote`, `ticket`, `p242835887_transport` | late `bind`, `qualify`, customer-facing `execute` and `verify` | `pushingcap_orchestrator` |
| `Driver / Field Execution UI` | carrier / driver / subcontractor | `tickets`, `tasks`, `p242835887_transport`, `p242835887_payouts`, subcontractor job state | `execute`, `verify`, early `writeback` | transport mobile worker lane + `pushingcap_orchestrator` |

## Best Naming To Keep

If we want this to stay clean in A relations management platform and site language, the names should be:

- `Transport Gateway`
- `Transport Client Workspace`
- `Transport Driver Workspace`

And then underneath the driver workspace:

- `mobile field execution`
- `eBOL capture`
- `funds and payout`
- `route telemetry`

