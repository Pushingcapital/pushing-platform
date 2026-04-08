# Transport Ticket 235912606402 Granular Property Map

Date: 2026-04-03
Anchor ticket: `235912606402`
Subject: `Workflow: Transport phases -> Tickets + Tasks`
Status: proposed property model only

## Purpose

This file breaks the transport workflow-design ticket into the granular worker, automation, data, and business-context labels that should eventually become attached properties.

It is not a live mutation.

## Why This Ticket Matters

This ticket is not just a transport note.
It is the workflow-design anchor for translating transport phases into executable ticket and task choreography.

Confirmed references:

- [transport_end_to_end_map.md](/Users/emmanuelhaddad/transport_end_to_end_map.md)
- [pushing_transport_bundle_contract.md](/Users/emmanuelhaddad/pushing_transport_bundle_contract.md)
- [pushing_transport_canary_seed_pack.md](/Users/emmanuelhaddad/pushing_transport_canary_seed_pack.md)
- [output/playwright/pushingcap-takeout/live-export/data/tickets.json](/Users/emmanuelhaddad/output/playwright/pushingcap-takeout/live-export/data/tickets.json)

## Parent Business Frame

The transport ticket sits inside a larger Pushing Capital operating system, not a silo.

Strongest business framing:

- [pushing_capital_products_services_context_2026-03-10.md](/Users/emmanuelhaddad/pushing_capital_products_services_context_2026-03-10.md)
- [Pushing_Capital_Book_REDESIGNED.md](/Users/emmanuelhaddad/Library/Group%20Containers/group.com.apple.notes/Accounts/F0092D46-8A8F-471E-905D-C03855BFAB72/Media/27B40DF0-A35E-4723-BE5F-2AE46DF8D019/1_496518F1-F4FF-4B1F-B07B-3BBC23FF70E7/Pushing_Capital_Book_REDESIGNED.md)
- [Pushing_Capital_All_README_Files.md](/Users/emmanuelhaddad/Library/Group%20Containers/group.com.apple.notes/Accounts/F0092D46-8A8F-471E-905D-C03855BFAB72/Media/443C7747-6D4D-4EDB-9A2D-D8966DEC07FC/1_F5C41C40-E251-4800-96F1-F219332AE828/Pushing_Capital_All_README_Files.md)

What those sources say:

- Pushing Capital is an operating system for high-friction workflows across automotive, finance, and business operations.
- The operating bible feeds:
  - memory
  - programs
  - structures
  - terminals
- The current structured service catalog has `72` services:
  - `44` automotive
  - `28` finance

## Ticket-Level Domain Labels

These are the highest-value top-level properties for this ticket:

- `primary_domain`: `automotive_operations`
- `primary_lane`: `transport_logistics`
- `workflow_role`: `workflow_design_anchor`
- `record_role`: `phase_to_ticket_mapping`
- `control_plane_class`: `task_ticket_pipeline_translation`
- `business_tier`: `core_automotive`
- `memory_priority`: `high`
- `implementation_state`: `design_not_yet_attached`

## Adjacent Business Lines

Transport is directly adjacent to:

- `car_sales`
- `dmv`
- `inspections`
- `parts`
- `finance`
- `subcontractor_ops`
- `payments`

These adjacent labels are grounded in the live product/workflow inventory:

- [workflow-studio-live.md](/Users/emmanuelhaddad/workflow-studio-live.md#L430)
- [pushing_capital_products_services_context_2026-03-10.md](/Users/emmanuelhaddad/pushing_capital_products_services_context_2026-03-10.md#L20)

## Car Sales Labels

Transport should be marked as sales-adjacent because the catalog explicitly includes:

- `Sales: Used Car Sales`
- `Sales: New Car Sales`
- `Consignment`
- `Elite Vehicle Purchase Solutions`

Recommended properties:

- `upstream_sales_dependency`: `true`
- `sales_lane_tags`:
  - `new_car_sales`
  - `used_car_sales`
  - `consignment`
  - `elite_vehicle_purchase_solutions`

## Finance And Taxes Labels

Transport is not itself a finance or tax product, but it touches those lanes operationally.

Finance and tax products explicitly present in the business catalog:

- `Loan Acquisition`
- `Funding Options Review`
- `Rate & Term Review`
- `Refinance / Consolidation Options`
- `Profit & Loss (P&L)`
- `Balance Sheet`
- `Tax Summary`
- `Document Gathering`
- `Audit Packet Preparation`

Workflow studio also exposes:

- `Income Verification (1099, W-2, Tax): Tax Return Summary`
- `Financial Statements & Tax Summary: Tax Summary`
- `Financial Statements & Tax Summary: Balance Sheet`
- `Financial Statements & Tax Summary: Profit & Loss (P&L)`
- `Tax Audit Preparation: Audit Packet Preparation`

Recommended properties:

- `finance_adjacent`: `true`
- `tax_adjacent`: `true`
- `financial_dependency_tags`:
  - `quote_margin`
  - `carrier_pay`
  - `buyer_charge`
  - `payout_closeout`
  - `invoice_or_payment_request`
- `tax_dependency_tags`:
  - `document_gathering`
  - `tax_summary_reference`
  - `audit_packet_reference`

## Granular Worker Labels

These workers are the best current matches for this ticket.

### Primary control workers

- `pushingcap_orchestrator`
  - role: `control_owner`
  - why: main route/stage/task/ticket mutator
- `google_run_brain_ingestion`
  - role: `intake_normalizer`
  - why: first-shell creation and normalization
- `pushingcap_sick_memory_dude`
  - role: `memory_writeback_owner`
  - why: durable workflow and doctrine memory
- `postman_api`
  - role: `api_contract_reader`
  - why: external platform/action registry truth
- `ops_health`
  - role: `exception_route_checker`
  - why: blocker and health lane support

### Financial / execution support workers

- `google_run_pc_paygate_bridge`
  - role: `quote_payment_state_owner`
- `bigquery_memory_hub`
  - role: `warehouse_memory_reader`
- `bigquery_schema_warehouse`
  - role: `schema_truth_reader`
- `bigquery_message_backfill`
  - role: `message_history_backfill`

### Future dedicated worker identities implied by the lane

- `transport_dispatcher`
- `carrier_assignment_worker`
- `bol_document_controller`
- `gps_location_reconciler`

These are not confirmed live worker profiles yet, but they are operationally implied by the workflow.

## Granular Worker Property Set

Recommended worker properties to attach:

- `primary_worker_profile`: `pushingcap_orchestrator`
- `secondary_worker_profiles`:
  - `google_run_brain_ingestion`
  - `pushingcap_sick_memory_dude`
  - `postman_api`
  - `ops_health`
  - `google_run_pc_paygate_bridge`
  - `bigquery_memory_hub`
  - `bigquery_schema_warehouse`
- `worker_control_pattern`: `orchestrator_led_multi_worker`
- `listener_dependency`:
  - `message_feed`
  - `warehouse_memory`
  - `schema_registry`
  - `platform_actions`

## Granular Automation Labels

These are the smallest automation slices that belong to this ticket:

1. `transport_intake_normalization`
2. `transport_phase_to_ticket_translation`
3. `transport_task_spawn_from_phase`
4. `transport_quote_and_authorization_gate`
5. `transport_carrier_assignment_gate`
6. `transport_dispatch_platform_sync`
7. `transport_bol_document_capture`
8. `transport_gps_or_location_update`
9. `transport_delivery_confirmation`
10. `transport_payout_closeout`
11. `transport_memory_writeback`
12. `transport_exception_repair`

## Granular Automation Property Set

Recommended automation properties:

- `automation_family`: `transport_workflow_design`
- `automation_mode`: `phase_driven_orchestration`
- `automation_granularity`: `mini_deliverable`
- `automation_units`:
  - `intake_normalization`
  - `ticket_creation`
  - `task_creation`
  - `quote_request`
  - `carrier_match`
  - `dispatch_sync`
  - `document_capture`
  - `location_update`
  - `callback_followup`
  - `memory_writeback`
  - `exception_repair`
- `human_gate_required`:
  - `carrier_lock`
  - `client_authorization`
  - `payment_confirmation`
  - `final_delivery_confirmation`

## BigQuery, Parsers, And Checkers

The ticket should also be tagged with the data-plane programs that can support it.

### Live BigQuery support paths

- [talk_to_p.py](/Users/emmanuelhaddad/bin/talk_to_p.py)
  - native BigQuery dataset/table/schema/query methods
- [p_tools_impl.py](/Users/emmanuelhaddad/bin/p_tools_impl.py)
  - `_bigquery_query`
  - row decoding and polling logic

### BigQuery-oriented workers

- `bigquery_memory_hub`
- `bigquery_schema_warehouse`
- `bigquery_message_backfill`
- `bigquery_customer_dossiers`
- `bigquery_deal_dossiers`
- `bigquery_message_associations`

### Parser / checker style programs already in the repo

- [pc-credit-processor/src/index.js](/Users/emmanuelhaddad/projects/pc-rag-platform/worker/pc-credit-processor/src/index.js)
  - parser-versioned extraction pipeline
- [pc-credit-analytics/src/index.js](/Users/emmanuelhaddad/projects/pc-rag-platform/worker/pc-credit-analytics/src/index.js)
  - parser-versioned analytical loading
- [mdm_query_gold.py](/Users/emmanuelhaddad/projects/pc-data-platform-code/scripts/mdm_query_gold.py)
  - gold query helper
- [mdm_demo_gold_report.py](/Users/emmanuelhaddad/projects/pc-data-platform-code/scripts/mdm_demo_gold_report.py)
  - demo report runner
- [blitz_run_upload_jobs.py](/Users/emmanuelhaddad/projects/pc-data-platform-code/scripts/blitz_run_upload_jobs.py)
  - explicit `checkers` control for upload jobs

Recommended properties:

- `data_support_family`: `bigquery_plus_parser_checker`
- `data_support_workers`:
  - `bigquery_memory_hub`
  - `bigquery_schema_warehouse`
  - `bigquery_message_backfill`
- `data_support_programs`:
  - `talk_to_p_bigquery_client`
  - `p_tools_impl_query_bigquery`
  - `mdm_query_gold`
  - `mdm_demo_gold_report`
  - `pc_credit_processor_parser`
  - `pc_credit_analytics_parser`

## External Platform Labels

Confirmed or strongly implied external software/platform dependencies:

- `Central Dispatch`
- `Super Dispatch`
- `Google Maps`
- `GPS/location stack`
- `SMS`
- `email`
- `document upload`
- `payment rails`

Recommended properties:

- `external_platforms`:
  - `central_dispatch`
  - `super_dispatch`
  - `google_maps`
  - `gps_location`
  - `sms`
  - `email`
  - `document_storage`
  - `payments`

## Mini Deliverables Hidden Inside This Ticket

This ticket should be understood as a bundle of smaller deliverables:

1. transport intake shell definition
2. stage map definition
3. task spawn rules
4. carrier/subcontractor association rules
5. buyer/client callback rules
6. BOL and document rules
7. GPS/status update rules
8. quote/payment gates
9. memory writeback rules
10. exception route rules

Recommended property:

- `mini_deliverable_count`: `10`

## Best Property Bundle To Attach Later

If this becomes a real ticket-property payload later, the cleanest minimum bundle is:

- `primary_domain`
- `primary_lane`
- `workflow_role`
- `primary_worker_profile`
- `secondary_worker_profiles`
- `automation_family`
- `automation_units`
- `external_platforms`
- `finance_adjacent`
- `tax_adjacent`
- `upstream_sales_dependency`
- `data_support_family`
- `data_support_workers`
- `mini_deliverable_count`
- `memory_priority`

## Source Files

- `/Users/emmanuelhaddad/pushing_transport_workflow_pipeline_spec.md`
- `/Users/emmanuelhaddad/pushing_transport_bundle_contract.md`
- `/Users/emmanuelhaddad/transport_end_to_end_map.md`
- `/Users/emmanuelhaddad/pushing_parts_sales_workflow_pipeline_spec.md`
- `/Users/emmanuelhaddad/pushing_capital_products_services_context_2026-03-10.md`
- `/Users/emmanuelhaddad/workflow-studio-live.md`
- `/Users/emmanuelhaddad/worker_labeling_framework.md`
- `/Users/emmanuelhaddad/worker_label_seed.csv`
- `/Users/emmanuelhaddad/bin/talk_to_p.py`
- `/Users/emmanuelhaddad/bin/p_tools_impl.py`
