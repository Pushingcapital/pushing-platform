# Transport Ticket 235912606402 PCRM Payload Pack

This pack turns the transport workflow anchor ticket into exact field-level PCRM updates.

Companion JSON:

- [transport_ticket_235912606402_pcrm_payload_pack.json](/Users/emmanuelhaddad/transport_ticket_235912606402_pcrm_payload_pack.json)

## Safe Now

These fields already exist in the live `tickets` schema and can be updated immediately:

- `issue_priority_level = p2_high`
- `ticket_type = platform_support`
- `tkt_service_line = vehicle_transport`
- `tkt_category = change_request`
- `tkt_subcategory = vt_dispatch`
- `tkt_source = internal`
- `tkt_impact = high`
- `tkt_urgency = high`
- `content = existing description plus structured attachment block`

Important note:

- the schema does **not** currently expose dedicated transport worker or automation fields on `tickets`
- the safest immediate place to preserve granular worker/automation metadata is the real `content` property

## Needs New Schema

These are the fields needed to make the worker and automation model truly first-class properties:

- `pc_primary_worker_profile`
- `pc_secondary_worker_profiles`
- `pc_automation_family`
- `pc_automation_units`
- `pc_external_platforms`
- `pc_business_dependencies`
- `pc_data_support_programs`
- `pc_source_of_truth_docs`

## Why These Values

`tkt_service_line` is clearly `vehicle_transport`.

`tkt_category` is best modeled as `change_request` because this ticket asks the system to translate phase doctrine into executable workflow structure.

`ticket_type` is best modeled as `platform_support` because it is an internal control-plane workflow-definition ticket, not a customer-side complaint.

`tkt_subcategory` has no perfect workflow-design choice in the existing schema. `vt_dispatch` is the closest transport-native fit because the ticket is ultimately about transport routing and execution handoff.

## Source Grounding

The worker, automation, and business labels in the pack are grounded in:

- [transport_ticket_235912606402_granular_property_map.md](/Users/emmanuelhaddad/transport_ticket_235912606402_granular_property_map.md)
- [pushing_transport_workflow_pipeline_spec.md](/Users/emmanuelhaddad/pushing_transport_workflow_pipeline_spec.md)
- [pushing_transport_bundle_contract.md](/Users/emmanuelhaddad/pushing_transport_bundle_contract.md)
- [transport_end_to_end_map.md](/Users/emmanuelhaddad/transport_end_to_end_map.md)
- [pushing_capital_products_services_context_2026-03-10.md](/Users/emmanuelhaddad/pushing_capital_products_services_context_2026-03-10.md)
- [Pushing_Capital_Book_REDESIGNED.md](/Users/emmanuelhaddad/Library/Group%20Containers/group.com.apple.notes/Accounts/F0092D46-8A8F-471E-905D-C03855BFAB72/Media/27B40DF0-A35E-4723-BE5F-2AE46DF8D019/1_496518F1-F4FF-4B1F-B07B-3BBC23FF70E7/Pushing_Capital_Book_REDESIGNED.md)
- [Pushing_Capital_All_README_Files.md](/Users/emmanuelhaddad/Library/Group%20Containers/group.com.apple.notes/Accounts/F0092D46-8A8F-471E-905D-C03855BFAB72/Media/443C7747-6D4D-4EDB-9A2D-D8966DEC07FC/1_F5C41C40-E251-4800-96F1-F219332AE828/Pushing_Capital_All_README_Files.md)

## Execution Posture

This pack is ready to run field-by-field through `pcrm_update_record`.

No live mutation was executed in this pass.
