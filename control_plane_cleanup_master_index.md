# Control Plane Cleanup Master Index

## Purpose

This is the cleanup backbone for the current control-plane work.

The system is no longer missing research.
The problem is sprawl.

So this file does three things:

1. names the canonical docs to use
2. groups the rest as supporting reference material
3. defines the next cleanup order so new work lands in the right place

## Golden Rule

Use one canonical file per lane or control-plane concern.
Everything else is support, evidence, or raw research.

Do not keep making new one-off strategy notes once a canonical file exists.

## Canonical Set

### Global control plane

- [pushing_namespace_registry_seed.md](/Users/emmanuelhaddad/pushing_namespace_registry_seed.md)
  What the `Pushing*` names actually are and where they anchor.

- [pushing_app_constellation_map.md](/Users/emmanuelhaddad/pushing_app_constellation_map.md)
  Which real apps exist, who they serve, and how they fit together.

- [pushing_security_universal_onboarding_program.md](/Users/emmanuelhaddad/pushing_security_universal_onboarding_program.md)
  The canonical decision to use `PushingSecurity` as the universal onboarding application program.

- [pushing_operator_control_plane_map.md](/Users/emmanuelhaddad/pushing_operator_control_plane_map.md)
  The internal operator stack: `PushingP`, automations, workers, API, pay, connections.

- [pushing_p_flagship_operating_model.md](/Users/emmanuelhaddad/pushing_p_flagship_operating_model.md)
  The canonical role of `PushingP` as the flagship conversational glue layer for intake, routing, escalation, and execution.

- [autonomous_control_bootstrap_kit.md](/Users/emmanuelhaddad/autonomous_control_bootstrap_kit.md)
  The repeatable mini-workflow, mini-pipeline, control-ticket, and builder-worker pattern.

- [tool_plane_and_specialist_worker_map.md](/Users/emmanuelhaddad/tool_plane_and_specialist_worker_map.md)
  How tools create work packs and how specialist workers execute them.

- [worker_labeling_framework.md](/Users/emmanuelhaddad/worker_labeling_framework.md)
  The human-readable labeling model for workers.

- [worker_subscription_api_capability_automation_framework.md](/Users/emmanuelhaddad/worker_subscription_api_capability_automation_framework.md)
  The automation-grade metadata model for worker subscriptions, triggers, APIs, and heartbeats.

### Automotive umbrella

- [automotive_control_plane_big_picture_memory.md](/Users/emmanuelhaddad/automotive_control_plane_big_picture_memory.md)
  The big-picture automotive memory layer across inspections, parts, and transport.

### Transport lane

- [pushing_transport_formal_workflow_definition.md](/Users/emmanuelhaddad/pushing_transport_formal_workflow_definition.md)
  The formal workflow record for the transport lane.

- [pushing_transport_formal_pipeline_definition.md](/Users/emmanuelhaddad/pushing_transport_formal_pipeline_definition.md)
  The formal pipeline stack for the transport lane.

- [pushing_transport_workflow_pipeline_spec.md](/Users/emmanuelhaddad/pushing_transport_workflow_pipeline_spec.md)
  The earlier strategy and proof file for transport.

- [pushing_transport_bundle_contract.md](/Users/emmanuelhaddad/pushing_transport_bundle_contract.md)
  The object and association contract for the transport bundle.

- [pushing_transport_canonical_execution_matrix.md](/Users/emmanuelhaddad/pushing_transport_canonical_execution_matrix.md)
  The new canonical end-to-end matrix for `PushingTransport`.

### Sibling automotive lanes

- [pushing_inspections_workflow_pipeline_spec.md](/Users/emmanuelhaddad/pushing_inspections_workflow_pipeline_spec.md)
- [pushing_parts_sales_workflow_pipeline_spec.md](/Users/emmanuelhaddad/pushing_parts_sales_workflow_pipeline_spec.md)
- [pushing_inspections_canonical_execution_matrix.md](/Users/emmanuelhaddad/pushing_inspections_canonical_execution_matrix.md)
- [pushing_parts_sales_canonical_execution_matrix.md](/Users/emmanuelhaddad/pushing_parts_sales_canonical_execution_matrix.md)

### Forms / DMV / courses

- [pushing_forms_dmv_courses_map.md](/Users/emmanuelhaddad/pushing_forms_dmv_courses_map.md)
  The canonical read on `PushingForms`, DMV, and courses.

- [pushing_forms_dmv_public_intake_matrix.md](/Users/emmanuelhaddad/pushing_forms_dmv_public_intake_matrix.md)
  The canonical intake-to-A relations management platform matrix for `PushingForms` and DMV.

### UI / product / offer design

- [ui_offer_catalog_and_inspection_packet_map.md](/Users/emmanuelhaddad/ui_offer_catalog_and_inspection_packet_map.md)
  The canonical UI family, offer, service, and inspection-packet map.

- [ui_surface_count_registry.md](/Users/emmanuelhaddad/ui_surface_count_registry.md)
  The canonical count of live route pages versus primary UI programs.

- [automotive_ui_program_stack.md](/Users/emmanuelhaddad/automotive_ui_program_stack.md)
  The canonical automotive UI split across subcontractor, parts, vehicle sales, mobile workers, and `userOne`.

- [userone_professional_enablement_model.md](/Users/emmanuelhaddad/userone_professional_enablement_model.md)
  The canonical language and staged journey for `userOne` as a Pushing Capital professional enablement platform.

- [userone_folder_section_taxonomy.md](/Users/emmanuelhaddad/userone_folder_section_taxonomy.md)
  The canonical folder and section structure for `userOne`, including `Deal Architect` and the course/module stack.

## Supporting Reference Set

These still matter, but they should support the canonical files instead of competing with them.

### Transport support

- [transport_end_to_end_map.md](/Users/emmanuelhaddad/transport_end_to_end_map.md)
- [pushing_transport_canary_seed_pack.md](/Users/emmanuelhaddad/pushing_transport_canary_seed_pack.md)
- [transport_ticket_235912606402_granular_property_map.md](/Users/emmanuelhaddad/transport_ticket_235912606402_granular_property_map.md)
- [transport_ticket_235912606402_pcrm_payload_pack.md](/Users/emmanuelhaddad/transport_ticket_235912606402_pcrm_payload_pack.md)
- [transport_ticket_235912606402_pcrm_payload_pack.json](/Users/emmanuelhaddad/transport_ticket_235912606402_pcrm_payload_pack.json)

### Worker support

- [worker_label_seed.csv](/Users/emmanuelhaddad/worker_label_seed.csv)
- [worker_subscription_api_capability_seed.csv](/Users/emmanuelhaddad/worker_subscription_api_capability_seed.csv)
- [worker_subscription_api_property_pack.md](/Users/emmanuelhaddad/worker_subscription_api_property_pack.md)
- [worker_control_plane_findings_2026_04_03.md](/Users/emmanuelhaddad/worker_control_plane_findings_2026_04_03.md)

### Builder / autonomy support

- [lane_autonomy_bootstrap_queue.csv](/Users/emmanuelhaddad/lane_autonomy_bootstrap_queue.csv)
- [proposed_tool_plane_seed.csv](/Users/emmanuelhaddad/proposed_tool_plane_seed.csv)
- [proposed_finance_workers_seed.csv](/Users/emmanuelhaddad/proposed_finance_workers_seed.csv)

## Current Mess To Stop Creating

Do not keep producing new files that repeat these already-settled categories:

- another generic namespace note
- another generic transport strategy note
- another generic worker taxonomy note
- another generic app inventory note

When new insight appears, put it into the existing canonical file for that category.

## Cleanup Order

### Phase 1. Stabilize the backbone

Done:
- namespace registry
- app constellation
- operator control plane
- worker labeling
- automation/capability framework
- automotive umbrella
- transport lane cleanup matrix

### Phase 2. Fill the missing canonical matrices

Done:
- `PushingInspections` canonical execution matrix
- `Parts Sales` canonical execution matrix
- `PushingForms / DMV` public-form-to-A relations management platform matrix

Next:
- mobile worker application matrix across transport, inspections, parts, DMV
- automotive UI program split across parts sales, vehicle sales, mobile workers, and `userOne`

### Phase 3. Convert canon into execution records

Then:
- control tickets
- mini task packs
- automation playbooks
- worker profile property payloads

## Immediate Working Rule

If we are discussing:

- names, use [pushing_namespace_registry_seed.md](/Users/emmanuelhaddad/pushing_namespace_registry_seed.md)
- apps, use [pushing_app_constellation_map.md](/Users/emmanuelhaddad/pushing_app_constellation_map.md)
- workers or automation contracts, use [worker_subscription_api_capability_automation_framework.md](/Users/emmanuelhaddad/worker_subscription_api_capability_automation_framework.md)
- tools and specialist work creation, use [tool_plane_and_specialist_worker_map.md](/Users/emmanuelhaddad/tool_plane_and_specialist_worker_map.md)
- transport execution, use [pushing_transport_canonical_execution_matrix.md](/Users/emmanuelhaddad/pushing_transport_canonical_execution_matrix.md)

## The Next Build Move

The next clean implementation move is:

1. use the canonical transport matrix
2. turn that into one formal transport workflow definition
3. turn that into one formal transport pipeline definition
4. generate mini task/ticket builders from the matrix instead of improvising per ticket
