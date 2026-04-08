# Pushing App Constellation Map

Date: 2026-04-03
Owner: Manny + Codex
Status: Working inventory
Purpose: Map the main Pushing Capital app family, including `PushingSecurity` and the rest of the current app surfaces, so the UI layer, product layer, and workflow layer stay aligned.

## Big Picture

Pushing Capital is not one app.

It is a constellation of connected apps and surfaces:

- public narrative and entry apps
- authenticated workflow apps
- internal operator apps
- domain-specific standalone apps
- security and onboarding apps
- training and filtration apps
- asset and packet-generation apps

The right model is:

`app surface -> service lane -> workflow -> task/ticket/control object -> memory`

## 1. Main Public Site

Primary codebase:

- [pushingcap-web-v2](/Users/emmanuelhaddad/projects/pushingcap-web-v2)

Best route manifest:

- [public-site.ts](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/lib/public-site.ts#L220)
- [site-inspection.json/route.ts](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/app/site-inspection.json/route.ts#L1)

Main public routes:

- `/`
- `/platform`
- `/services`
- `/for-dealers`
- `/for-lenders`
- `/finance`
- `/automotive`
- `/business`
- `/about`
- `/insights`
- `/press`
- `/privacy-policy`
- `/terms`
- `/start-intake`

Main job:

- explain the company
- explain the service lanes
- route the visitor into the right next surface

## 2. Push P And Authenticated Portal Surfaces

Primary codebase:

- [pushingcap-web-v2](/Users/emmanuelhaddad/projects/pushingcap-web-v2)

Key routes:

- [clientportal/page.tsx](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/app/clientportal/page.tsx#L1)
- [clientportal/login/page.tsx](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/app/clientportal/login/page.tsx#L1)
- [p/page.tsx](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/app/p/page.tsx#L1)
- [p/quick/page.tsx](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/app/p/quick/page.tsx#L1)

Main job:

- show workflow truth
- show missing docs and next required action
- show quote and payment state
- give the user one controlled execution lane

## 3. Subcontractor And Execution-Side App

Primary codebase:

- [pushingcap-web-v2](/Users/emmanuelhaddad/projects/pushingcap-web-v2)

Key route:

- [subcontractor/page.tsx](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/app/subcontractor/page.tsx#L1)

Main job:

- receive work
- participate in execution
- upload evidence
- send updates back into the control plane

### Current reading

This is the strongest live anchor for the `mobile worker application`.

Best live execution UI:

- [SubcontractorConsole.tsx](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/components/subcontractor/SubcontractorConsole.tsx#L1)

What it already does:

- reads canonical subcontractor jobs
- filters by status
- shows quoted and paid totals
- shows assigned, started, and completed timestamps
- lets the worker mark jobs `in_progress` or `completed`

So the safest current interpretation is:

- `subcontractorPortal` is the real worker-facing app surface
- it is already the closest thing to the live mobile worker application

### Transport-specific mobile worker prototype

There is also a strong transport-specific mobile worker prototype in the internal A relations management platform:

- [PushingTransportPage.tsx](/Users/emmanuelhaddad/pc-data-platform/ui/internal-crm/web/src/pages/PushingTransportPage.tsx#L317)
- [PushingTransportPage.tsx](/Users/emmanuelhaddad/pc-data-platform/ui/internal-crm/web/src/pages/PushingTransportPage.tsx#L322)
- [PushingTransportPage.tsx](/Users/emmanuelhaddad/pc-data-platform/ui/internal-crm/web/src/pages/PushingTransportPage.tsx#L453)
- [PushingTransportPage.tsx](/Users/emmanuelhaddad/pc-data-platform/ui/internal-crm/web/src/pages/PushingTransportPage.tsx#L491)

That page explicitly includes:

- `ENTER MOBILE APP`
- `CLIENT APP HOME`
- `DRIVER APP HOME`
- mobile-style route telemetry
- eBOL camera
- engine chat
- escrow or funds actions

So the current mobile worker layer is best modeled as:

- live worker console: `subcontractorPortal`
- transport-specific mobile UX prototype: `PushingTransportPage`

## 4. userOne Courses App

Primary codebase:

- [pushingcap-web-v2](/Users/emmanuelhaddad/projects/pushingcap-web-v2)

Key route:

- [userone-courses/page.tsx](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/app/userone-courses/page.tsx#L1)

Main job:

- training
- filtration
- operator or partner qualification

## 5. PushingSecurity

This is now clearly both:

- a recent dedicated app family
- an integrated control route in the main site

### 5A. Dedicated recent app

Primary codebase:

- [pushingsecurity-control](/Users/emmanuelhaddad/projects/pushingsecurity-control)

App workspace:

- [apps/pushing-capital-web](/Users/emmanuelhaddad/projects/pushingsecurity-control/apps/pushing-capital-web)

Key recent files:

- [README.md](/Users/emmanuelhaddad/projects/pushingsecurity-control/apps/pushing-capital-web/README.md#L1)
- [(customer)/page.tsx](/Users/emmanuelhaddad/projects/pushingsecurity-control/apps/pushing-capital-web/src/app/%28customer%29/page.tsx#L1)
- [(customer)/onboard/page.tsx](/Users/emmanuelhaddad/projects/pushingsecurity-control/apps/pushing-capital-web/src/app/%28customer%29/onboard/page.tsx#L1)
- [(employee)/dashboard/page.tsx](/Users/emmanuelhaddad/projects/pushingsecurity-control/apps/pushing-capital-web/src/app/%28employee%29/dashboard/page.tsx#L1)

Observed recent activity:

- repo modified March 28, 2026
- app workspace modified March 29, 2026

Public/customer surfaces:

- `/`
- `/onboard`

Employee/operator surfaces:

- `/login`
- `/dashboard`

Secure/API surfaces:

- `/api/control/*`
- `/api/control/integrations/*/status`
- `/api/document-ai/parse-license`
- `/api/webhooks/docusign`
- `/api/webhooks/stripe`

What it does:

- public lead intake and universal onboarding
- driver-license OCR
- legal document template handling
- encrypted provider-key storage

Best current interpretation:

- `PushingSecurity` should be the universal onboarding application program
- downstream business lanes should branch out after onboarding, not before
- automation playbooks
- managed browser bundles
- operator run queue

### 5B. Integrated main-site control version

Primary route:

- [clientportal/settings/control/page.tsx](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/app/clientportal/settings/control/page.tsx#L1)

Main UI component:

- [CompanyControlConsole.tsx](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/components/control/CompanyControlConsole.tsx#L1)

Backing data layer:

- [company-control-db.ts](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/lib/company-control-db.ts#L1)
- [types/control.ts](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/types/control.ts#L1)

What it does:

- vault secrets
- automation playbooks
- dry-run and live-run queueing
- operator-only control

### 5C. Internal A relations management platform route

Primary page:

- [PushingSecurityPage.tsx](/Users/emmanuelhaddad/pc-data-platform/ui/internal-crm/web/src/pages/PushingSecurityPage.tsx)

Main job:

- internal A relations management platform-facing security/control representation

## 6. Internal A relations management platform App

Primary codebase:

- [internal-crm/web](/Users/emmanuelhaddad/pc-data-platform/ui/internal-crm/web)

Current page family:

- [LandingPage.tsx](/Users/emmanuelhaddad/pc-data-platform/ui/internal-crm/web/src/pages/LandingPage.tsx)
- [OrchestrationPage.tsx](/Users/emmanuelhaddad/pc-data-platform/ui/internal-crm/web/src/pages/OrchestrationPage.tsx)
- [WhiteboardPage.tsx](/Users/emmanuelhaddad/pc-data-platform/ui/internal-crm/web/src/pages/WhiteboardPage.tsx)
- [ObjectToolsPage.tsx](/Users/emmanuelhaddad/pc-data-platform/ui/internal-crm/web/src/pages/ObjectToolsPage.tsx)
- [PushingFormsPage.tsx](/Users/emmanuelhaddad/pc-data-platform/ui/internal-crm/web/src/pages/PushingFormsPage.tsx#L1)
- [PushingInspectionsPage.tsx](/Users/emmanuelhaddad/pc-data-platform/ui/internal-crm/web/src/pages/PushingInspectionsPage.tsx#L1)
- [PushingTransportPage.tsx](/Users/emmanuelhaddad/pc-data-platform/ui/internal-crm/web/src/pages/PushingTransportPage.tsx)
- [PushingQuotesPage.tsx](/Users/emmanuelhaddad/pc-data-platform/ui/internal-crm/web/src/pages/PushingQuotesPage.tsx)
- [VoiceGatewayPage.tsx](/Users/emmanuelhaddad/pc-data-platform/ui/internal-crm/web/src/pages/VoiceGatewayPage.tsx)
- [SettingsPage.tsx](/Users/emmanuelhaddad/pc-data-platform/ui/internal-crm/web/src/pages/SettingsPage.tsx)
- [InvoicesPage.tsx](/Users/emmanuelhaddad/pc-data-platform/ui/internal-crm/web/src/pages/InvoicesPage.tsx)
- [ArchivesPage.tsx](/Users/emmanuelhaddad/pc-data-platform/ui/internal-crm/web/src/pages/ArchivesPage.tsx)

Main job:

- operator control
- workflow inspection
- object inspection
- domain-specific working surfaces

## 7. PushingForms Standalone Logic App

Primary codebase:

- [pushingcap-forms](/Users/emmanuelhaddad/pushingcap-forms)

Key file:

- [App.jsx](/Users/emmanuelhaddad/pushingcap-forms/src/App.jsx#L1)

What it does:

- ingestion modules
- OCR
- customer intent extraction
- relational form synthesis
- algorithmic computation
- downstream writes to inspections, tasks, tickets, workflows, pipelines, workers, products, services, payments, and deliverables

Best current reading:

- not just a pretty form
- a truth-synthesis and packet-seeding app

## 8. PushingTransport Standalone Surface

Primary codebase:

- [pushing-transport](/Users/emmanuelhaddad/pushing-transport)

Key files:

- [index.html](/Users/emmanuelhaddad/pushing-transport/index.html#L1)
- [app.js](/Users/emmanuelhaddad/pushing-transport/app.js#L1)

What it does:

- public transport-facing lane
- shipper and towing entry split
- transport-branded landing surface

## 9. PushingParts Standalone Surface

Primary codebase:

- [pushing-parts](/Users/emmanuelhaddad/pushing-parts)

Main job:

- dedicated parts-facing surface or experiment lane

Current note:

- this should be treated as part of the app constellation even if its production role still needs sharper mapping

## 10. PushingStandby

Primary codebase:

- [PushingStandby](/Users/emmanuelhaddad/PushingStandby)

Main job:

- doctrine-rich design and architecture shell
- namespace and conceptual product framing

Current note:

- not the main system of record
- still extremely valuable as doctrine and UX framing

## 11. PushingAssets

Primary surface:

- [assets.pushingcap.com worker binding](/Users/emmanuelhaddad/projects/pushingcap-web-v2/workers/assets-gate/wrangler.jsonc#L9)

Supporting context:

- [context-v3.js](/Users/emmanuelhaddad/projects/pc-ops-hub/workers/pushingcap-orchestrator/src/context-v3.js#L25)

Main job:

- asset requests
- packet outputs
- design/media generation
- governed asset lineage

## The Clean App Grouping

Here is the clean grouping to keep in mind:

| app family | strongest current surface | job |
|---|---|---|
| main public site | `pushingcap-web-v2` | explain services and route users |
| Push P | `clientportal` | show next step and workflow truth |
| mobile worker / subcontractor app | `subcontractor` | worker-side execution, job updates, and field participation |
| training app | `userOne Courses` | learning and filtration |
| security app | `pushingsecurity-control` + integrated control route | universal onboarding, secrets, automations, browser bundles |
| internal A relations management platform | `pc-data-platform/ui/internal-crm/web` | operator control and domain work |
| forms app | `pushingcap-forms` | truth ingestion and packet seeding |
| transport app | `pushing-transport` | transport-facing intake surface |
| parts app | `pushing-parts` | parts-facing surface |
| asset app | `PushingAssets` | asset and packet generation |
| doctrine shell | `PushingStandby` | namespace and product framing |

## What This Means Operationally

The system now reads like this:

- `pushingcap-web-v2` is the main branded operating shell
- `PushingSecurity` is the universal onboarding and operator-control shell
- internal A relations management platform is the operator workbench
- standalone apps like forms, transport, parts, and assets are domain-specific satellites

That is a strong pattern.
It means the next job is not “invent more apps.”
It is to make sure each app clearly owns:

- a service lane
- a workflow role
- a packet or deliverable
- a writeback contract

## Best Next Mapping Move

The clean next pass is to add these four columns for each app:

- `primary audience`
- `creates which records`
- `reads which workflow snapshot`
- `returns which packet or output`

That turns this from an app list into an execution map.
