# UI Surface Count Registry

Date: 2026-04-03
Owner: Manny + Codex
Status: Canonical working count
Purpose: Count the real UI surfaces we already have, then reduce them into the smaller set of UI programs we should intentionally build and manage.

## The Count

There are two useful counts, not one.

### 1. Raw live route pages

Across the two active web app codebases, there are currently:

- `36` live route-level page surfaces
- `31` in [pushingcap-web-v2/src/app](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/app)
- `5` in [pushingsecurity-control/apps/pushing-capital-web/src/app](/Users/emmanuelhaddad/projects/pushingsecurity-control/apps/pushing-capital-web/src/app)

This count is useful for implementation and cleanup, but it is too noisy for product planning.

### 2. Canonical UI programs

The control-plane count we should actually build against is:

- `20` primary UI programs

That is the count that matters for product design, workflow mapping, and ownership.

## The 20 UI Programs

| # | UI program | status | primary route or host | main audience | main job |
|---|---|---|---|---|---|
| 1 | Main Public Site | live | `pushingcapital.com` | public | explain the company, service lanes, and route users into the correct next surface |
| 2 | PushingSecurity Landing | live | `pushingsecurity-control /` | public | security-led front door into onboarding and lifecycle control |
| 3 | Service-Buyer Onboarding | live mode | `PushingSecurity /onboard?audience=service-buyer` | service buyers | start a service request, classify the lane, and create the first shell |
| 4 | Software-Buyer Onboarding | live mode | `PushingSecurity /onboard?audience=software-buyer` | software or application buyers | route software buyers into the platform-sales and onboarding path |
| 5 | Employee Onboarding | live mode | `PushingSecurity /onboard?audience=employee` | employees | intake, identity review, provisioning, browser bootstrap, lifecycle entry |
| 6 | Subcontractor Onboarding | live mode | `PushingSecurity /onboard?audience=subcontractor` | subcontractors | intake, qualification, and handoff into execution access |
| 7 | Finance Intake And Workflow UI | split-now | `PushingSecurity /onboard?family=finance` -> `/login?portal=finance` | finance-side users | route into lender readiness, underwriting, and finance execution |
| 8 | Automotive Intake And Workflow UI | split-now | `PushingSecurity /onboard?family=automotive` -> `/login?portal=automotive` | automotive-side users | route into DMV, inspections, transport, parts, and automotive execution |
| 9 | Push P Client Portal | live | `/clientportal`, `/p`, `/p/quick` | customers and guided users | show workflow truth, next required action, quote, payment, and handoff state |
| 10 | subcontractorPortal | live | `/subcontractor` | workers in execution | receive work, upload evidence, update status, and close steps back into the control plane |
| 11 | PushingSecurity Dashboard | live | `PushingSecurity /dashboard` | operators | manage vault, playbooks, bundles, and lifecycle control |
| 12 | PushingForms | live anchor | internal A relations management platform `PushingFormsPage` | operators | control intake matrices, packets, and form-led record creation |
| 13 | PushingInspections | live anchor | internal A relations management platform `PushingInspectionsPage` | operators and inspectors | capture inspection evidence, findings, and packet outputs |
| 14 | PushingAssets | partial live | `assets.pushingcap.com` | design, media, and marketing users | generate and deliver asset, packet, and media outputs |
| 15 | PushingTransport | prototype plus live anchor | standalone [pushing-transport](/Users/emmanuelhaddad/pushing-transport) + transport A relations management platform prototype | transport buyers and operators | transport intake, dispatch coordination, and route evidence |
| 16 | PushingParts Sales | prototype plus live anchor | standalone [pushing-parts](/Users/emmanuelhaddad/pushing-parts) | parts buyers and operators | parts intake, sourcing flow, fitment, and parts-side execution routing |
| 17 | Vehicle Sales Workspace | split-now | dealer-facing narrative now, real workspace next | dealers and automotive sales operators | hold vehicle sale workflows, records, compliance, and closeout state |
| 18 | Mobile Worker App | split-now | current base in `/subcontractor`, prototype in transport A relations management platform mobile views | field workers, inspectors, and transport/mobile operators | perform in-field execution, upload evidence, and close micro-steps |
| 19 | userOne Courses | live | `/userone-courses` | learners, operators, and qualified entrants | training, filtration, and readiness |
| 20 | userOne Professional Platform | split-now | `userOne` after filtration and professional access | licensed automotive professionals and dealers | dealer-side automotive platform, professional workspace, and licensed execution access |

## Why 20 Matters

The mistake would be counting every route as its own product.

The better model is:

- `36` route pages for implementation reality
- `20` UI programs for product and workflow reality

That keeps the UI plan understandable and prevents route sprawl from becoming product sprawl.

## The Four UI Clusters

### 1. Entry and onboarding

Count: `8`

- Main Public Site
- PushingSecurity Landing
- Service-Buyer Onboarding
- Software-Buyer Onboarding
- Employee Onboarding
- Subcontractor Onboarding
- Finance Intake And Workflow UI
- Automotive Intake And Workflow UI

### 2. Execution and next-step

Count: `2`

- Push P Client Portal
- subcontractorPortal

### 3. Operator control

Count: `3`

- PushingSecurity Dashboard
- PushingForms
- PushingInspections

### 4. Domain and builder surfaces

Count: `7`

- PushingAssets
- PushingTransport
- PushingParts Sales
- Vehicle Sales Workspace
- Mobile Worker App
- userOne Courses
- userOne Professional Platform

## Immediate Build Rule

When we say “build a new UI,” it should attach to one of these `20` UI programs instead of becoming a random standalone route.

The next useful split is:

1. make the `8` onboarding and entry programs visually distinct
2. keep the `2` execution portals operationally strict
3. keep the `3` operator surfaces internal and tool-heavy
4. treat the domain and builder surfaces as specialized products with distinct audiences

## Counting Rule Going Forward

Use this method:

1. count raw route pages for implementation
2. count primary UI programs for product planning
3. never create a new UI program unless it clearly has:
   - a distinct audience
   - a distinct workflow role
   - a distinct output packet or execution lane
