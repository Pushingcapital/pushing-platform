# Pushing Namespace Layer Map

Date: 2026-04-03
Source: Manny namespace list
Purpose: Group the `Pushing*` vocabulary into end-to-end system layers so public surfaces, A relations management platform control-plane objects, finance modules, and reasoning modules are not mixed together.

## 1. Public Surfaces And External-Facing Channels

- `PushingForms`
- `PushingPictures`
- `PushingVideos`
- `PushingMail`
- `PushingMarketing`
- `PushingPrint`
- `PushingYou`
- `PushingLocation`
- `PushingUber`
- `PushingUPS`
- `PushingTransport`
- `PushingOnboardingsubcontractors`

Role:
- what the outside world touches first
- portals, intake surfaces, uploads, delivery channels, movement surfaces

## 2. A relations management platform Control Plane And Workflow Orchestration

- `PushingWorkflows`
- `PushingPipelines`
- `PushingTasks`
- `PushingWorkers`
- `PushingWorkflowDebate`
- `PushingWorkflowDesign`
- `PushingSettings`
- `PushingTools`
- `PushingTriggers`
- `PushingAutomations`
- `PushingSpawns`
- `PushingAPI`
- `PushingServers`
- `PushingCapabilities`
- `PushingConnections`
- `PushingConnectionTypes`

Role:
- how work is routed, staged, assigned, debated, and executed
- the operational backbone inside PCRM

## 3. Identity, Contracts, And Trust

- `PushingIdentity`
- `PushingAgentcontracts`
- `PushingDealContracts`
- `PushingTokens`
- `PushingSecrets`
- `PushingWarnings`
- `PushingLawsuits`

Role:
- identity, permissions, contract surfaces, risk, security, and trust boundaries

## 4. Finance, Commercial, And Revenue Logic

- `PushingFinancnialProffiles`
- `PushingFinance`
- `PushingPsales`
- `PushingProfit`
- `PushingPay`
- `PushingPaygates`
- `PushingNegotiations`
- `PushingMoneyCurrentBalances`
- `PushingSubscriptionHeartbeats`

Role:
- money movement, commercial negotiation, balances, payouts, revenue, and payment state

## 5. Reasoning, Research, And Decision Layer

- `PushingDecisions`
- `PushingFear`
- `PushingTime`
- `PushingResearch`
- `PushingDictionary`
- `PushingFormulas`
- `PushingExperiments`
- `PushingLove`
- `PushingLast`
- `PushingDistance`
- `PushingSpeed`

Role:
- how the system interprets tradeoffs, timing, meaning, risk, and optimization

## 6. Core Operator / Runtime Internal Layer

- `PushingP`
- `PushingBack`

Role:
- operator core, fallback lane, or internal runtime/control namespace
- should stay internal until clearly mapped

## Transport Touchpoints Across The Namespace Layers

`PushingTransport` is not a standalone isolated domain.
It cuts across all layers:

- public surface:
  - `PushingTransport`
  - `PushingForms`
  - `PushingMail`
  - `PushingLocation`
- A relations management platform control plane:
  - `PushingWorkflows`
  - `PushingPipelines`
  - `PushingTasks`
  - `PushingWorkers`
  - `PushingAutomations`
- trust and contracts:
  - `PushingIdentity`
  - `PushingDealContracts`
  - `PushingAgentcontracts`
- finance:
  - `PushingFinance`
  - `PushingProfit`
  - `PushingPay`
  - `PushingMoneyCurrentBalances`
- reasoning:
  - `PushingResearch`
  - `PushingFormulas`
  - `PushingDistance`
  - `PushingSpeed`

## Important Rule

Do not map these all as peer records.
Each namespace should be tagged as one of:

- `public_surface`
- `workflow_control`
- `identity_contract`
- `finance_commercial`
- `reasoning_memory`
- `runtime_internal`

That tag should determine:

- whether it is public or internal
- whether it creates A relations management platform records
- whether it owns workflows or only supports them
- whether it can mutate money, contracts, or identity
- whether it belongs in NotebookLM memory, BigQuery analytics, or direct platform execution
