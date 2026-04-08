# Pushing Capital Granular Product/Service Registry
Date: 2026-04-03
Purpose: Notebook-backed CSV registry of products and services with granular object, ticket, task, and agent mappings.
- CSV path: `/Users/emmanuelhaddad/pushing_capital_granular_product_service_registry_2026-04-03.csv`
- Total rows: **72**
- Domain split: **44 automotive**, **28 finance**

## Lane Counts
- Auto Finance & Lender Match: 9
- Bookkeeping & Tax: 7
- Business Formation: 6
- Credit Strategy: 6
- DMV & Compliance: 4
- Inspections & Appraisals: 7
- Mobile Services: 6
- Parts: 4
- Repair & Field Services: 16
- Transport: 3
- Vehicle Sales: 4

## Columns
- `domain`
- `lane_family`
- `application`
- `product_code`
- `product_name`
- `category`
- `subcategory`
- `catalog_pipeline`
- `intake_object`
- `domain_objects`
- `commercial_objects`
- `ticket_shell`
- `task_shell`
- `primary_agents`
- `notebook_backed_sources`
- `mapping_notes`

## Mapping Rules
- Automotive mappings come from the canonical transport, inspections, parts, DMV, and UI stack documents.
- Finance mappings come from the lender matching / FICO / DTI-LTV / business formation brief plus the product context inventory.
- `catalog_pipeline` preserves the raw service catalog pipeline name. `ticket_shell` reflects the execution ticket or commercial shell that should carry the product operationally.
- Where internal object IDs were not surfaced in reviewed docs, human-readable object labels are used (for example `Vehicles`, `Companies`, `Desired Vehicles`).
