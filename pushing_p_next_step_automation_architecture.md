# Pushing P Next-Step Automation Architecture

## Core Point

`Pushing P` should not guess the next move from scratch every turn.

It should:

1. `grab` the current workflow truth
2. `evaluate` the blocking gate or missing artifact
3. `push` the smallest safe next record move
4. `write back` the handoff, trace, and memory

That is the clean automation model.

## What Already Exists

The current checked-in web layer already expects a derived next-step contract.

See:

- [portal.ts](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/types/portal.ts#L162)

The important fields are:

- `service_key`
- `stage`
- `stage_label`
- `documents`
- `quote`
- `next_required_action`

That means the UI is already built to consume a decision, not invent it.

## Where Pushing P Gets the Truth

The current clientportal stack pulls truth from orchestration and Push P backend endpoints.

See:

- [clientportal/page.tsx](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/app/clientportal/page.tsx#L23)
- [orchestration.ts](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/lib/orchestration.ts#L138)

Today the key reads are:

1. `/orchestration/clients/{userId}`
   - pipeline items
   - current stage
   - truth gates
   - work queue progress
2. `/orchestration/backend/push-p/clientportal/bootstrap`
   - workflow snapshot
   - missing profile fields
   - notebook context
   - next required action
3. `/orchestration/backend/push-p/messages/mirror`
   - mirrors the live message turn back into the control plane

So the real model is already:

`Pushing P grabs workflow truth from orchestration, not just from chat text`

## Where “Next Step” Shows Up Today

The UI prioritizes:

1. `workflow.next_required_action`
2. fallback to `currentStage`

That’s visible in:

- [ClientPortal.tsx](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/components/portal/ClientPortal.tsx#L428)

The memory worker also builds reply context from:

- active lane
- current stage
- next required action
- missing profile fields
- notebook facts

See:

- [memory-worker.ts](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/lib/memory-worker.ts#L119)
- [memory-worker.ts](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/lib/memory-worker.ts#L405)

So the current system already believes the next step should be derived from:

`workflow truth + missing information + memory context`

## The Orchestrator Contract

The strongest worker-side contract I found is in the orchestrator.

See:

- [context-v3.js](/Users/emmanuelhaddad/projects/pc-ops-hub/workers/pushingcap-orchestrator/src/context-v3.js#L120)
- [schema.sql](/Users/emmanuelhaddad/projects/pc-ops-hub/workers/pushingcap-orchestrator/schema.sql#L1)
- [index.js](/Users/emmanuelhaddad/projects/pc-ops-hub/workers/pushingcap-orchestrator/src/index.js#L115)

The orchestration loop is already described as:

`READ whiteboard -> READ orchestration -> WRITE tickets -> WRITE tasks -> WRITE dispatch -> READ audit trail -> WRITE assets -> READ chat`

And the worker persistence model already supports:

- `worker_handoffs`
  - `from_worker`
  - `summary`
  - `next_steps`
  - `artifacts`
- `worker_actions`
- `orchestration_log`

Every worker action also fans out a trace to:

- `/orchestration/backend/a2a/traces`

That means the automation spine is not missing. It is partially present and underused.

## The Right Next-Step Engine

Once tasks, tickets, pipelines, workflows, and forms are mapped, the correct next-step engine should be:

### 1. Ingress

Source comes from one of:

- public form
- clientportal message
- subcontractor portal action
- course enrollment / learner event
- operator-created ticket or task

### 2. Record Binding

Bind the event to the control stack:

- `service_request`
- `deal`
- `ticket`
- `task`
- domain object like `transport`, `inspection`, `parts`, `dmv`

### 3. Workflow Snapshot

Build or refresh:

- `service_key`
- `stage`
- `stage_label`
- `truth_gates`
- `documents outstanding`
- `quote/payment state`
- `missing profile fields`
- `next_required_action`

### 4. Gate Evaluation

Determine what kind of next step is needed:

- missing info
- missing document
- missing payment
- internal routing
- external platform action
- callback review
- memory writeback

### 5. Smallest Safe Push

Push exactly one safe move:

- create task
- create ticket
- update stage
- request document
- issue quote
- dispatch to worker
- hold in callback review

### 6. Handoff + Trace

Write:

- worker handoff
- worker action log
- A2A trace
- notebook or memory update if the move changes durable understanding

## P Stepfinder Contract

Your local lane specs already describe the right pattern.

See:

- [pushing_transport_workflow_pipeline_spec.md](/Users/emmanuelhaddad/pushing_transport_workflow_pipeline_spec.md#L383)
- [pushing_parts_sales_workflow_pipeline_spec.md](/Users/emmanuelhaddad/pushing_parts_sales_workflow_pipeline_spec.md#L86)
- [pushing_inspections_workflow_pipeline_spec.md](/Users/emmanuelhaddad/pushing_inspections_workflow_pipeline_spec.md#L81)

The best reusable rule is:

1. inspect the active `service_request`
2. inspect the `deal`
3. inspect the execution `ticket`
4. inspect open `tasks`
5. inspect `quote/payment`
6. name the blocked mini-step
7. recommend the smallest safe A relations management platform move

That is how `P` should determine the next move across lanes.

## Command and Callback System

The most explicit live registry I found is in:

- [pushing-debate-live.md](/Users/emmanuelhaddad/pushing-debate-live.md#L1338)

Important command shapes already exist:

- `cmd.task.create`
- `cmd.ticket.create`
- `cmd.assoc.link`
- `cmd.route.a2a.dispatch`
- `cmd.current_state.advertise`

Important callback / failure routes already exist:

- `cb.records.created`
- `cb.associations.wired`
- `cb.trigger.completed_or_timed_out`
- `cb.next_route.suggested`
- `route.record.callback_review`

See:

- [pushing-debate-live.md](/Users/emmanuelhaddad/pushing-debate-live.md#L1909)

This is the missing automation answer:

`next` should not be a human-only judgment call. It should be a callback result.

## How Pushing P Should Push and Grab Information

### Grab

`Pushing P` should read in this order:

1. current workflow snapshot
2. truth gates
3. missing docs / missing profile fields
4. open tasks and blocker tickets
5. notebook memory for prior precedent
6. external platform state if the lane depends on it

### Push

Then `Pushing P` should write only one of:

1. `request_information`
2. `request_document`
3. `advance_stage`
4. `create_blocker_ticket`
5. `create_execution_task`
6. `dispatch_worker`
7. `route_callback_review`
8. `commit_memory_writeback`

That write should always include:

- why this move now
- what mini-step it resolves
- what condition must be true before the next move

## What This Means For PushingForms, DMV, and Courses

### PushingForms

`PushingForms` should become the intake and consent trigger layer.

Each form should produce:

- a bound record
- a service key
- an initial stage
- a required next action

### DMV

`DMV` is already the strongest live candidate for this model because:

- Push P defaults to `dmv_license_recovery`
- truth gates already include `dmv`
- the public site already treats DMV as a first-class automotive compliance lane

### Courses

`Courses` should not be mixed with live operational fulfillment.

The cleaner role is:

- training lane
- filtration lane
- onboarding / knowledge lane
- possibly workflow unlock lane

Meaning:

`Courses teach the route`

while

`PushingForms + Push P execute the route`

## The Best Automation Shape

If we express it simply:

`public action -> record bind -> workflow snapshot -> gate evaluation -> smallest safe write -> callback -> next route suggestion`

That is the durable pattern.

## Best Immediate Build Order

1. lock one lane with full mini-steps
   - DMV is the best candidate
2. make every ingress create a bound `service_key`
3. derive `next_required_action` from the mini-step + gate state
4. make every worker write `handoff + next_steps + artifacts`
5. make callback failures reopen `callback_review` instead of going silent

## Bottom Line

The system does not need a brand-new philosophy.

It needs one reliable rule:

`Pushing P grabs truth from the workflow stack, then pushes the smallest safe next move, then records why.`

That is how mapped tasks, tickets, pipelines, forms, and worker actions become actual automation instead of static architecture.
