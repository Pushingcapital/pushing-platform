# Autonomous Control Bootstrap Kit

Date: 2026-04-03
Owner: Manny + Codex
Status: Starter kit
Purpose: Turn any Pushing Capital business lane into a durable autonomous control loop using mini workflows, mini pipelines, mini tickets, mini tasks, automation playbooks, and builder workers.

## Core Rule

Autonomy does not come from one giant worker.

It comes from a repeatable control stack:

1. one clear lane
2. one workflow definition
3. one mini-pipeline stack
4. one parent control ticket
5. a generated task pack
6. one automation playbook
7. one builder-worker contract pack
8. one memory writeback rule

If those eight things exist, the lane can keep moving without constant manual orchestration.

## Reusable Mini-Pipeline Shape

Every lane should be decomposed like this:

| layer | purpose | primary record |
|---|---|---|
| `intake` | capture and normalize the ask | `service_request` or equivalent |
| `commercial` | carry price, consent, scope, or approval | `deal` or quote shell |
| `execution` | own the live doing of the work | `ticket` |
| `micro-follow-through` | chase missing facts, docs, callbacks, blockers | `task` |
| `automation` | evaluate next step and push the smallest safe move | playbook + worker action |
| `memory` | preserve route lessons, blockers, and outcomes | BigQuery + NotebookLM |

This is the default mini-pipeline for:

- `PushingTransport`
- `PushingInspections`
- `Parts Sales`
- finance / lender readiness
- DMV
- onboarding
- marketing and asset creation

## Mini Workflow Template

Each lane should have a mini workflow made of six reusable phases:

1. `ingest`
   - create the intake shell
   - normalize the lane
2. `bind`
   - attach the right deal, ticket, and domain object
3. `qualify`
   - check stage gates and missing facts
4. `execute`
   - dispatch the live work through the control ticket and task pack
5. `verify`
   - confirm outcome, callback status, payment status, or document truth
6. `writeback`
   - update memory, trace, and durable route logic

## The Four Control Records

Every autonomous lane should maintain four control records:

### 1. Parent control ticket

Purpose:

- own the execution lane
- hold the current phase
- name the controlling worker
- keep the route visible to operators

Required fields:

- `lane_key`
- `current_phase`
- `next_required_action`
- `controlling_worker`
- `blocking_gate`
- `callback_due_at`
- `writeback_required`

### 2. Stage task pack

Purpose:

- hold the granular next moves for the active phase

Task types:

- missing fact chase
- document request
- platform sync
- callback review
- exception recovery
- payment follow-up
- memory writeback

### 3. Workflow snapshot

Purpose:

- give `Pushing P` and the workers one readable truth object

Required outputs:

- active stage
- truth gates
- missing artifacts
- quote/payment state
- recommended next step

### 4. Automation playbook

Purpose:

- define when the system moves on its own and when it must halt

Required outputs:

- trigger source
- guardrails
- smallest safe move
- dry-run/live-run mode
- rollback rule
- heartbeat expectation

## Builder Worker Stack

Autonomy should be started by a builder swarm, not by random manual edits.

### `workflow_builder_worker`

Owns:

- workflow definition
- macro phase naming
- stage-gate logic

Best current real anchors:

- `pushingcap_orchestrator`
- `retool_product_manager`

### `pipeline_builder_worker`

Owns:

- pipeline stack
- stage order
- parent-child record shape

Best current real anchors:

- `pushingcap_orchestrator`
- `retool_data_engineer`

### `task_ticket_builder_worker`

Owns:

- parent control ticket
- child task pack
- blocker and callback patterns

Best current real anchors:

- `pushingcap_orchestrator`
- `ops_health`

### `automation_builder_worker`

Owns:

- playbook creation
- trigger mapping
- halt rules
- heartbeat checks

Best current real anchors:

- `pushingcap_orchestrator`
- `ops_health`
- `postman_api`

### `agentic_worker_builder_worker`

Owns:

- worker contracts
- subscription profile
- API / capability mapping
- handoff contracts

Best current real anchors:

- `pushingcap_orchestrator`
- `postman_api`
- `retool_data_engineer`

### Supporting specialists

- `website_design_worker`
- `database_engineering_worker`
- `asset_design_worker`

These do not own the control loop.
They build the surfaces and schema that the control loop needs.

## What The Automation Must Do

The automation loop for any lane should be:

1. read the workflow snapshot
2. inspect the parent control ticket
3. inspect open child tasks
4. inspect blockers and callbacks
5. choose the smallest safe next move
6. update one record or create one record
7. write a worker handoff
8. verify heartbeat or callback expectation
9. write memory if the move changes durable understanding

## Minimal Autonomy Contract For A Lane

Before a lane is considered autonomous, it should have:

- a workflow name
- a pipeline stack
- a parent control ticket pattern
- a child task pack pattern
- at least one automation playbook
- at least one worker handoff contract
- a halt rule
- a rollback rule
- a writeback rule

If any of those are missing, the lane is still operator-assisted rather than autonomous.

## Starter Deployment Order

When bootstrapping a new lane, do it in this order:

1. `workflow_pipeline_builder_tool`
   - define the lane and stage map
2. `database_engineering_tool`
   - lock the object and property shape
3. `task_ticket_builder_worker`
   - create the parent/child control pattern
4. `automation_builder_tool`
   - define the trigger and next-step loop
5. `agentic_worker_builder_tool`
   - create the worker contracts and handoff rules
6. `website_design_tool` or `asset_design_hub_tool`
   - only if a public or operator-facing surface is required

## First Autonomy Targets

The strongest first places to use this kit are:

- `PushingTransport`
- `PushingInspections`
- `Parts Sales`
- finance readiness
- DMV forms and onboarding
- `PushingAssets` request-to-asset work packs

## Practical Rule For Manny And P

When a lane feels messy, do not ask:

- "what worker should I wake up?"

Ask:

- "what is the parent control ticket?"
- "what are the child tasks?"
- "what stage gate is blocking the next move?"
- "what automation playbook should push it forward?"
- "which builder worker owns the missing contract?"

That is how the lane becomes autonomous instead of theatrical.
