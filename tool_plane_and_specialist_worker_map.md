# Tool Plane and Specialist Worker Map

## Purpose

The worker system needs a proper tool plane above the worker plane.

Right now, workers exist.
But Manny is asking for something more operational:

- tools for form packs
- onboarding forms
- inspection-sales-from-forms
- marketing
- assets and design hub that can create work
- specialist workers that act as website designers and database engineers

This file turns that into a clean structure.

---

## Core Principle

Tools should not be treated as the same thing as workers.

### Tools

Tools should:

- structure work
- generate briefs
- generate intake shells
- normalize requests
- create task packs
- hand work to the right specialist

### Workers

Workers should:

- execute the work
- review outputs
- mutate systems
- hand results back into A relations management platform / current_state / generated_assets / workflows

So the right stack is:

`public request -> tool -> work pack -> specialist worker -> output -> workflow writeback`

---

## Existing Real Anchors

### `PushingForms`

Already real as:

- internal A relations management platform route `PushingFormsPage`
- branded as `PUBLIC INTAKE MATRIX`

Current role:

- intake shell
- consent / parameter collection
- route-starting surface

### `PushingAssets` and the asset/design hub

Already real enough to anchor on:

- `assets.pushingcap.com`
- `pushingcap-assets-gate`
- `generated_assets`
- `codex_design`
- `runpod_media`
- `Assets Multimedia`

This means `PushingAssets` is part of the Pushing Capital public constellation, while the internal asset/design hub is the work-pack engine behind it.

Together they should become the main work-pack generator for:

- marketing assets
- form visuals
- landing pages
- inspection media bundles
- design briefs

### Specialist workers already in the system

- `retool_ui_ux_designer`
- `retool_data_engineer`
- `retool_full_stack_developer`
- `retool_product_manager`
- `codex_design`
- `runpod_media`
- `pushingcap_orchestrator`
- `google_run_brain_ingestion`

That means we do not need to invent a whole second workforce.
We need a cleaner role map and tool handoff logic.

---

## Tool Families Manny Needs

## 1. `form_pack_tool`

Purpose:

- generate a structured pack of forms for a business lane

Examples:

- transport form pack
- DMV form pack
- business onboarding form pack
- lender-readiness form pack

Inputs:

- lane or service key
- target persona
- required facts
- target workflow

Outputs:

- form pack spec
- field list
- file/upload requirements
- consent requirements
- destination A relations management platform objects
- next worker

Primary owner workers:

- `pushingcap_orchestrator`
- `google_run_brain_ingestion`

Support workers:

- `retool_product_manager`
- `retool_ui_ux_designer`

---

## 2. `onboarding_forms_tool`

Purpose:

- create or normalize onboarding forms for client, worker, subcontractor, or business intake

Examples:

- client onboarding
- subcontractor onboarding
- business capital onboarding
- employee / contractor onboarding

Outputs:

- onboarding form brief
- required docs
- identity / KYB/KYC gates
- workflow stages
- handoff triggers

Primary owner workers:

- `pushingcap_orchestrator`
- `google_run_brain_ingestion`

Support workers:

- `retool_ui_ux_designer`
- `retool_full_stack_developer`

---

## 3. `inspection_sales_forms_tool`

Purpose:

- turn inspection-driven workflows into form-led intake and sales conversion routes

Examples:

- vehicle inspection lead intake
- inspection-to-repair
- inspection-to-transport
- inspection-to-sale / consignment

Outputs:

- inspection intake form spec
- inspection findings schema
- conversion actions
- deal / ticket / task creation plan

Primary owner workers:

- `pushingcap_orchestrator`
- `google_run_brain_ingestion`

Support workers:

- `retool_product_manager`
- `retool_ui_ux_designer`
- `retool_data_engineer`

---

## 4. `marketing_workpack_tool`

Purpose:

- convert a business ask into a marketing work pack

Examples:

- campaign brief
- landing page brief
- content calendar seed
- ad creative brief
- sales deck or announcement pack

Outputs:

- structured brief
- target audience
- message hierarchy
- required assets
- publishing surface
- owning design / media worker

Primary owner workers:

- `codex_design`
- `pushingcap_orchestrator`

Support workers:

- `runpod_media`
- `retool_brand_designer`
- `retool_motion_designer`

---

## 5. `asset_design_hub_tool`

Purpose:

- create the work itself for design and asset production

This is the one Manny explicitly asked for.

The asset/design hub should not only store outputs.
It should generate:

- creative briefs
- asset requests
- page comps
- image/video shot lists
- revision tasks

Outputs:

- `generated_assets` requests
- design briefs
- asset lineage
- downstream tasks for specialists

Primary owner workers:

- `codex_design`
- `runpod_media`

Support workers:

- `pushingcap_orchestrator`
- `retool_product_manager`

---

## 6. `website_design_tool`

Purpose:

- convert product or marketing asks into website work packs

Outputs:

- page objective
- route target
- content blocks
- UX requirements
- accessibility requirements
- implementation notes

Primary specialist worker:

- `retool_ui_ux_designer`

Support workers:

- `retool_full_stack_developer`
- `codex_design`
- `retool_product_manager`

---

## 7. `database_engineering_tool`

Purpose:

- convert workflow, form, or product requirements into database work packs

Outputs:

- schema changes
- property definitions
- object associations
- backfill plans
- validation rules
- write/read contract

Primary specialist worker:

- `retool_data_engineer`

Support workers:

- `retool_the_architect`
- `retool_full_stack_developer`
- `pushingcap_orchestrator`

---

## 8. `workflow_pipeline_builder_tool`

Purpose:

- convert a business lane into a durable workflow and mini-pipeline package

Outputs:

- workflow definition
- pipeline stack
- stage map
- stage gates
- owner matrix
- task/ticket spawn rules

Primary specialist worker:

- `pushingcap_orchestrator`

Support workers:

- `retool_product_manager`
- `retool_data_engineer`
- `postman_api`

---

## 9. `automation_builder_tool`

Purpose:

- convert the workflow package into repeatable playbooks, triggers, and next-step automation

Outputs:

- automation playbook brief
- trigger map
- halt rules
- rollback rules
- heartbeat contract
- dry-run and live-run conditions

Primary specialist worker:

- `pushingcap_orchestrator`

Support workers:

- `ops_health`
- `postman_api`
- `retool_full_stack_developer`

---

## 10. `agentic_worker_builder_tool`

Purpose:

- create or refine the worker identities that keep the lane autonomous

Outputs:

- worker contract
- subscription profile
- API and capability notes
- handoff contract
- current_state expectations
- worker-profile mutation pack

Primary specialist worker:

- `pushingcap_orchestrator`

Support workers:

- `postman_api`
- `ops_health`
- `retool_data_engineer`

---

## Specialist Worker Role Map

## Website design lane

Canonical role:

- `website_design_worker`

Best current real worker:

- `retool_ui_ux_designer`

Support:

- `codex_design`
- `retool_full_stack_developer`
- `retool_product_manager`

Role:

- page architecture
- layout and flow design
- UX mapping
- public and portal interface design

## Database engineering lane

Canonical role:

- `database_engineering_worker`

Best current real worker:

- `retool_data_engineer`

Support:

- `retool_the_architect`
- `retool_full_stack_developer`
- `bigquery_schema_warehouse`

Role:

- schema design
- object-property mapping
- association planning
- BigQuery / warehouse model design
- backfill / normalization planning

## Design and asset lane

Canonical role:

- `asset_design_worker`

Best current real workers:

- `codex_design`
- `runpod_media`

Support:

- `retool_brand_designer`
- `retool_motion_designer`

Role:

- visual system
- creative output
- asset creation
- generated asset packaging

## Builder lane

Canonical roles:

- `workflow_builder_worker`
- `pipeline_builder_worker`
- `task_ticket_builder_worker`
- `automation_builder_worker`
- `agentic_worker_builder_worker`

Best current real workers:

- `pushingcap_orchestrator`
- `postman_api`
- `ops_health`
- `retool_product_manager`
- `retool_data_engineer`

Role:

- convert business logic into stage logic
- convert stage logic into tickets and tasks
- convert route logic into automation playbooks
- convert capability gaps into worker contracts

---

## How The Tool Plane Should Create Work

This is the most important operating rule.

The tools should create the work pack.
The workers should execute it.

### Example: onboarding

1. `onboarding_forms_tool`
   - builds the intake and required-doc pack
2. `incomplete_profile_worker`
   - finds missing facts
3. `workflow_pipeline_builder_tool`
   - creates the lane workflow, stage gates, and task/ticket spawn rules
4. `automation_builder_tool`
   - binds the lane to triggers, callbacks, heartbeat checks, and halt rules
5. `agentic_worker_builder_tool`
   - creates the worker contract pack that keeps the lane alive without manual babysitting
3. `validator_worker`
   - confirms truth gates
4. `website_design_worker`
   - improves the form UX if intake quality is weak
5. `database_engineering_worker`
   - fixes schema or property gaps if the form cannot land cleanly

### Example: inspection sales

1. `inspection_sales_forms_tool`
   - builds the intake structure
2. `database_engineering_tool`
   - maps inspection outputs to objects
3. `asset_design_hub_tool`
   - creates the customer-facing work pack or media pack
4. specialist workers execute

### Example: marketing

1. `marketing_workpack_tool`
   - builds the campaign brief
2. `asset_design_hub_tool`
   - generates design and media work packets
3. `website_design_tool`
   - creates landing-page or public-site work
4. specialist workers execute

---

## Best Next Move

The cleanest implementation path is:

1. keep the four finance workers
2. add the tool plane above them
3. map canonical specialist roles onto existing workers
4. let tools create work packets before workers mutate systems

That gives Manny a cleaner machine:

`tool creates the work -> specialist worker does the work -> orchestrator routes the result`
