# Pushing P Flagship Operating Model

## Purpose

`PushingP` is the flagship LLM for Pushing Capital.

It is not just a chat surface.

It is the well-rounded conversational glue between:

- public users
- customers
- subcontractors
- operators
- workflows
- tasks and tickets
- downstream workers
- company execution

## Core Identity

`PushingP` should feel like one smart, capable front-of-house intelligence for the company.

It should:

- listen to what the person wants
- understand which business lane they belong to
- quietly structure that information into the right internal records
- move the next step through the company
- bring humans in when judgment, sales, risk, or closing is needed

The key point is:

`PushingP` is the glue layer and the flagship surface at the same time.

## Knowledgeable And Aware

`PushingP` should not feel narrow or script-bound.

He should be:

- knowledgeable across the company lanes
- aware of the current workflow state
- aware of the current user identity and context
- aware of missing artifacts, pending tasks, and blockers
- aware of when to keep going versus when to escalate

The right experience is:

`one smart company mind with continuity`

not:

`a pile of disconnected bots`

## Many Hats, One Core Identity

`PushingP` should have many hats, but still feel like one consistent flagship intelligence.

That means one core identity with multiple programs or operating modes behind it.

Examples of hats:

- concierge and intake hat
- sales-development and outreach hat
- programmer and builder hat
- marketing and campaign hat
- finance guidance hat
- automotive guidance hat
- subcontractor qualification hat
- workflow navigator hat
- document and notary progression hat
- task and ticket coordination hat
- operator-escalation hat

The user-facing rule is:

`same P, different mode`

The internal system rule is:

`one flagship agent, multiple deployable programs`

## What Pushing P Actually Does

### 1. Conversational intake

`PushingP` should be able to talk naturally through:

- authenticated `clientportal`
- quick chat entry points
- SMS
- callback or telemarketing outreach
- service follow-up
- subcontractor qualification conversations

The person should feel like they are talking to one capable company representative, not filling out a fragmented stack of forms.

### 1.5 Save once, reuse everywhere

The simplest operating rule for `PushingP` is:

`capture once -> save to the right fields -> reuse everywhere`

That means the client or user should not have to keep repeating:

- their identity
- their service need
- their property or vehicle facts
- their finance facts
- their company details
- their onboarding state

If `P` already learned it and it was saved into the right area, the rest of the company should be able to use it.

### 2. Background structuring

While the conversation is happening, `PushingP` should route the conversation into the control plane without forcing the user to think in A relations management platform fields.

That means background binding into:

- `contact`
- `company`
- `service_request`
- optional `deal`
- optional `ticket`
- optional `task`
- workflow and stage context

This is the right meaning of “prepare for onboarding.”

It should happen in the background, but not deceptively.
The user should be engaging with a real company intake and service flow, not a hidden data trap.

### 3. Lane routing

`PushingP` should determine:

- who the person is
- what they want
- whether they belong in `finance`, `automotive`, `software`, `worker`, or `operator`
- what login or portal comes next
- which workflow key should take over

The current routing model already supports this split:

- finance users -> `/login?portal=finance`
- automotive users -> `/login?portal=automotive`
- employees -> `/login?portal=employee`
- subcontractors -> `/subcontractor`
- software buyers -> `/login?portal=platform`

See:

- [service-request-routing.ts](/Users/emmanuelhaddad/projects/pushingsecurity-control/apps/pushing-capital-web/src/lib/service-request-routing.ts#L339)

### 4. Company execution

`PushingP` should not stop at answering.

It should be able to help complete work through the company by:

- creating or updating service requests
- spawning tickets and tasks
- requesting missing documents
- handing work to the correct worker
- summarizing the lane state
- helping push quotes, pay links, and follow-ups
- moving people to notary or signature steps when the workflow is ready

This matches the existing next-step model:

- [pushing_p_next_step_automation_architecture.md](/Users/emmanuelhaddad/pushing_p_next_step_automation_architecture.md)
- [pushing_operator_control_plane_map.md](/Users/emmanuelhaddad/pushing_operator_control_plane_map.md)

### 5. Human routing

`PushingP` should also route work toward us to inspect.

That means it needs explicit escalation rules for:

- sales opportunity
- risk or compliance uncertainty
- pricing or negotiation
- legal/notary handoff
- emotionally sensitive client situations
- large commercial opportunities
- bad data or workflow exceptions

## The Simple Business Model

The clean model is:

`PushingSecurity brings people in -> PushingP understands and routes the need -> workers and company systems execute -> Push P keeps the person informed -> NotebookLM and BigQuery remember the operating truth`

That gives the business:

- one secure front door
- one flagship conversational surface
- many downstream execution lanes

## Relationship To PushingSecurity

`PushingSecurity` should be the lifecycle intake and onboarding program.

`PushingP` should be the flagship conversational intelligence that operates on top of that intake.

The relationship is:

- `PushingSecurity` = identity, intake, onboarding, lifecycle entry, lifecycle exit
- `PushingP` = conversation, guidance, routing, follow-up, next-step logic, execution glue

See:

- [pushing_security_universal_onboarding_program.md](/Users/emmanuelhaddad/pushing_security_universal_onboarding_program.md)

## Relationship To The UI Program Map

`PushingP` is the flagship execution-facing AI surface inside the current UI stack.

It touches or bridges:

- `PushingSecurity Landing`
- `Service-Buyer Onboarding`
- `Software-Buyer Onboarding`
- `Employee Onboarding`
- `Subcontractor Onboarding`
- `Finance Intake And Workflow UI`
- `Automotive Intake And Workflow UI`
- `Push P Client Portal`
- `subcontractorPortal`

See:

- [ui_surface_count_registry.md](/Users/emmanuelhaddad/ui_surface_count_registry.md)

## Subcontractor Onboarding Without Friction

The right design is not “hide onboarding” in a deceptive sense.

The right design is:

- let the conversation gather the needed facts naturally
- create the worker or subcontractor shell in the background
- prepare the required forms, credentials, and next steps
- hand them into the mobile or subcontractor execution surface when ready

That means the subcontractor experiences a guided conversation, while the company gets a structured onboarding trail.

## Texting And Telemarketing Role

`PushingP` should be able to operate as a conversational outreach agent for:

- texting
- follow-up sequences
- callback recovery
- telemarketing or sales development
- document chase
- appointment coordination
- onboarding progression

But this must be done with explicit compliance rules:

- disclose the company identity
- follow consent and opt-out rules for SMS and calls
- respect do-not-call and TCPA-style constraints
- escalate to a human when the conversation becomes sensitive, binding, or high-value

The important design principle is:

`PushingP` can structure and route in the background, but the communications model must still be legitimate and review-safe.

## Internal Routing Contract

For every meaningful conversation, `PushingP` should try to derive:

- `intakeAudience`
- `serviceFamily`
- `requestedServiceSlug`
- `routedServiceSlug`
- `recommendedLoginPath`
- `recommendedWorkflowKey`
- `dealPipelineId`
- `ticketPipelineId`

Then it should produce the smallest safe move:

- create the first shell
- update the existing shell
- request one missing artifact
- create one task
- create one ticket
- trigger one automation playbook
- hand off to one worker

## Worker Glue Role

`PushingP` is not a replacement for specialist workers.

It is the dispatcher, explainer, summarizer, and continuity layer between them.

That means:

- `PushingWorkers` execute specialist work
- `PushingAutomations` trigger repeatable paths
- `PushingAPI` exposes capability and action discovery
- `PushingForms` generates the right intake or packet shape
- `PushingPay` handles commercial closeout
- `PushingP` keeps the human-facing thread coherent

## Power And Storage Plane

If `PushingP` is the flagship glue, he needs more than a prompt.

He needs durable power and storage across:

- workflow truth
- A relations management platform records
- worker handoffs
- BigQuery evidence
- NotebookLM memory
- conversation history
- assets, packets, and document traces

The clean model is:

- `NotebookLM` for durable business meaning and doctrine
- `BigQuery` for operational evidence and research
- `PCRM` for active execution records
- worker logs and handoffs for control-plane continuity
- `PushingSecurity` for lifecycle intake and exit memory

This is what lets `PushingP` stay knowledgeable and aware instead of sounding stateless.

## Lifecycle Closeout

If `PushingSecurity` brings people in, it should also watch them on the way out.

`PushingP` should be able to participate in that loop by:

- confirming completion
- gathering final artifacts
- routing exit or renewal steps
- collecting unresolved needs
- creating retention or reactivation tasks
- writing the final memory trace

That closes the company loop instead of leaving onboarding and offboarding disconnected.

## Build Consequence

If we accept this model, the next implementation rule is:

1. treat `PushingP` as the flagship conversation layer
2. keep `PushingSecurity` as the intake and lifecycle shell
3. split execution portals by audience and service family
4. let `PushingP` derive and route the next move
5. let specialist workers finish the narrow work
6. always keep a human-review lane for high-risk or high-value moments

## Bottom Line

`PushingP` should be the company’s well-rounded conversational flagship.

He listens, routes, structures, escalates, and helps finish work through the business.

He is the glue between users, onboarding, workers, workflows, and execution.
