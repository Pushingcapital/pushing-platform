# Pushing Operator Control Plane Map

## Purpose

This file maps the operator-side namespaces that make `Pushing P` actually move work:

- `PushingP`
- `PushingAutomations`
- `PushingConnections`
- `PushingAPI`
- `PushingWorkers`
- `PushingPay`
- `PushingPaygates`
- adjacent vault / settings surfaces

## PushingP

The live authenticated `Pushing P` surface is:

- [clientportal/page.tsx](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/app/clientportal/page.tsx#L1)

It is the main operator-assisted client execution surface.

What it already does:

- loads pipeline items from orchestration
- loads the Push P bootstrap snapshot
- binds the thread to a `serviceKey`
- defaults to `dmv_license_recovery`

The current workflow snapshot contract is:

- [portal.ts](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/types/portal.ts#L162)

Key fields:

- `service_key`
- `stage`
- `stage_label`
- `documents`
- `quote`
- `next_required_action`

## PushingAutomations

The strongest maintained analogue for `PushingAutomations` is the internal operator control console:

- [page.tsx](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/app/clientportal/settings/control/page.tsx#L10)
- [CompanyControlConsole.tsx](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/components/control/CompanyControlConsole.tsx#L1)

This is not abstract. It already has:

- vault secret creation
- automation playbook creation
- dry-run / live run queueing
- status changes

The backing D1 tables are:

- `company_vault_secrets`
- `company_automation_playbooks`
- `company_automation_runs`

See:

- [company-control-db.ts](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/lib/company-control-db.ts#L81)

Current trigger types:

- `manual`
- `approved_intake`
- `otp_verified`
- `notary_ready`
- `scheduled`

See:

- [types/control.ts](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/types/control.ts#L3)

The studio doctrine also matches this role:

- [visionpro-mode-live.md](/Users/emmanuelhaddad/visionpro-mode-live.md#L3453)

It describes `PushingAutomations` as:

- route design
- stage design
- trigger design
- handoff design
- automation path design

## PushingConnections

The clearest maintained public surface is:

- [page.tsx](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/app/integrations/social-connectivity/page.tsx#L4)

This page frames connectivity as:

- official account linking
- identity verification
- token / governance checks
- not yet publishing or DM automation

So the clean current reading is:

- public `PushingConnections` = connectivity explanation and review-safe surface
- internal `PushingConnections` = part of the operator control stack and worker capability plane

Studio doctrine:

- [visionpro-mode-live.md](/Users/emmanuelhaddad/visionpro-mode-live.md#L3375)

## PushingAPI

`PushingAPI` is strongly present as doctrine and also has real operational endpoints.

Studio definition:

- [visionpro-mode-live.md](/Users/emmanuelhaddad/visionpro-mode-live.md#L3303)

The actual maintained API discovery surfaces are in the orchestrator:

- [index.js](/Users/emmanuelhaddad/projects/pc-ops-hub/workers/pushingcap-orchestrator/src/index.js#L195)

Important live reads:

- `/orchestration/agents/discover`
- `/orchestration/backend/registry`
- `/orchestration/backend/actions/catalog`

This means `PushingAPI` is not just a concept. It is the registry layer for:

- agent discovery
- backend capability discovery
- action catalog discovery

## PushingWorkers

`PushingWorkers` is both a studio concept and a real persisted control surface.

Studio definition:

- [visionpro-mode-live.md](/Users/emmanuelhaddad/visionpro-mode-live.md#L3335)

Live worker identity / handoff model:

- [context-v3.js](/Users/emmanuelhaddad/projects/pc-ops-hub/workers/pushingcap-orchestrator/src/context-v3.js#L114)
- [schema.sql](/Users/emmanuelhaddad/projects/pc-ops-hub/workers/pushingcap-orchestrator/schema.sql#L1)

Current persisted worker tables:

- `worker_sessions`
- `worker_handoffs`
- `worker_actions`
- `orchestration_log`

Current worker contracts:

- `POST /llm/workers/register`
- `POST /llm/workers/handoff`
- `GET /llm/workers/latest`

This is the real backbone for `PushingWorkers`.

## PushingPay

`PushingPay` is not yet a single branded maintained page in active app code, but it is very real in the execution stack.

Studio definition:

- [visionpro-mode-live.md](/Users/emmanuelhaddad/visionpro-mode-live.md#L3637)

Current live payment behavior in Push P:

- quote creation:
  - [orchestration.ts](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/lib/orchestration.ts#L305)
- payment webhook recording:
  - [orchestration.ts](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/lib/orchestration.ts#L323)
- quote rendering and payment-link opening in client UI:
  - [ClientPortal.tsx](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/components/portal/ClientPortal.tsx#L643)

The important execution fields are:

- `quote.amount_due`
- `quote.payment_link`

So the clean interpretation is:

- `PushingPay` currently lives inside the workflow snapshot and clientportal execution surface
- it is already operational even if the standalone branded studio is not yet a maintained route

## PushingPaygates

The best current anchor is still studio doctrine plus orchestrator context.

Studio definition:

- [visionpro-mode-live.md](/Users/emmanuelhaddad/visionpro-mode-live.md#L3650)

Operational support evidence:

- [context-v3.js](/Users/emmanuelhaddad/projects/pc-ops-hub/workers/pushingcap-orchestrator/src/context-v3.js#L54)

The orchestrator context explicitly names the paygate data plane:

- `PAYGATE_DB`
- `webhook_events`
- `notification_deliveries`
- `lifecycle_tracks`
- `notification`
- `outbox`
- `memory_events`

So `PushingPaygates` reads like the payment-event and payment-lifecycle control layer behind `PushingPay`.

## Adjacent Vault / Settings Cluster

The worker-coordinator studio cluster also includes:

- `PushingSettings`
- `PushingSecrets`
- `PushingTokens`
- `PushingIdentity`
- `PushingServers`
- `PushingCapabilities`
- `PushingAgentContracts`

Studio anchors:

- [visionpro-mode-live.md](/Users/emmanuelhaddad/visionpro-mode-live.md#L3349)

The current maintained analogue is the company control console plus worker/orchestrator registry.

## Best Current Working Model

The operator control plane currently looks like this:

`PushingP`
-> active client execution surface

`PushingAutomations`
-> playbook and run control

`PushingConnections`
-> identity and external-account connection governance

`PushingAPI`
-> registry and action-discovery layer

`PushingWorkers`
-> worker identity, handoff, action, and trace layer

`PushingPay`
-> quote and payment execution in the workflow snapshot

`PushingPaygates`
-> payment event / lifecycle / webhook layer

## What This Means

`Pushing P should push and grab information` is already structurally possible.

The pieces are present:

- workflow snapshot
- action catalog
- worker registry
- automation playbooks
- worker handoffs
- payment link execution
- trace fanout

What still needs discipline is the namespace registry and the explicit rule for which surface owns which write.
