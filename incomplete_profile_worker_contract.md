# Incomplete Profile Worker Contract

## Why This Worker Should Exist

This is one of the clearest missing workers in the finance lane.

The lender stack already knows how to:

- parse FICO and bureau data
- normalize tradelines
- calculate utilization
- define DTI / PTI / LTV thresholds
- run lender matching as a reverse-auction

But there is still a gap between:

- a person entering the system
- and a profile being truly ready for underwriting or lender matching

That gap is the `Incomplete Profile Worker`.

Its job is not to underwrite.
Its job is to detect what is missing, score readiness, and route the next smallest evidence-gathering move.

---

## Worker Name

Recommended worker profile:

- `incomplete_profile_worker`

Alternative names if Manny wants product flavor:

- `pushingcap_profile_completion`
- `lender_readiness_profile_worker`
- `financial_profile_repair_worker`

My recommendation is still:

- `incomplete_profile_worker`

because it says exactly what it does.

---

## Worker Purpose

Detect incomplete finance and lender-readiness profiles before they hit underwriting or lender matching.

This worker should:

1. inspect a person, business, or deal profile
2. determine which required facts are missing
3. score profile completeness
4. separate blocking gaps from non-blocking gaps
5. write the next required action back into A relations management platform or workflow state
6. spawn the right follow-up task or ticket

---

## Inputs

### Primary profile inputs

- `pc_credit_profiles`
- `pc_income_profiles`
- `pc_golden_records`
- `pc_bank_stipulations`
- `pc_vehicle_valuations`

### Business-readiness inputs

- KYB/KYC state
- EIN state
- LLC / Corp / DBA formation state
- business credit state
- bookkeeping / P&L / balance sheet / tax summary presence

### Workflow inputs

- current service request
- current deal
- current ticket
- current task stack
- pipeline stage
- `next_required_action`

### Document inputs

- credit report artifact presence
- W-2 / 1099 / paystub presence
- bank statement presence
- ID / tax ID presence
- business registration presence
- vehicle collateral docs where applicable

---

## Outputs

### Core outputs

- `profile_completeness_score`
- `blocking_requirements`
- `missing_requirements`
- `missing_document_types`
- `missing_financial_facts`
- `missing_business_readiness_items`
- `ready_for_underwriting`
- `ready_for_lender_match`
- `next_required_action`
- `next_owner_worker`

### A relations management platform and workflow outputs

- update readiness fields on the controlling record
- create follow-up task if evidence can be gathered
- create blocker ticket if the gap is structural or cross-system
- move the record into the correct readiness stage

---

## Decision Gates It Owns

This worker should own only completeness and readiness gates.

It should not own final underwriting.

### Its gates

- `is_profile_complete_for_credit_analysis`
- `is_profile_complete_for_ratio_calculation`
- `is_profile_complete_for_underwriting`
- `is_profile_complete_for_lender_match`
- `is_profile_complete_for_business_capital_readiness`

### Gates it should not own

- final credit approval
- final lender selection
- pricing or rate exception approval
- final legal or tax judgment

---

## Subscription and Automation Shape

### Recommended worker metadata

- `worker_type`
  - `memory_augmented_specialist`

- `subscription_mode`
  - `request_driven`

- `subscription_contract_type`
  - `hybrid`

- `trigger_types`
  - `approved_intake`
  - `request`
  - `scheduled`

- `api_surface_type`
  - `worker_control_api`

- `capability_registry_source`
  - `company_automation_playbooks`
  - `backend_actions_catalog`
  - `manual_seed`

- `automation_control_surface`
  - `company_automation_playbooks`
  - `worker_actions`
  - `orchestration_log`
  - `current_state`

- `heartbeat_required`
  - `true`

- `heartbeat_surface`
  - `current_state`
  - `orchestration_log`

- `auth_scope`
  - `internal_only`

---

## What It Should Touch

### Structured truth

- `pc_credit_profiles`
- `pc_income_profiles`
- `pc_golden_records`
- `pc_vehicle_valuations`
- `pc_bank_stipulations`

### Control-plane objects

- service request
- deal
- task
- ticket
- worker handoff / action log

### Most likely workflow lane

- `Financial Preparation & Lender Matching`

and adjacent lanes:

- `Credit Strategy Personal`
- `Credit Strategy Business`
- `Business Formation & Launch Support`

---

## Proposed Completeness Logic

### Consumer auto-finance completeness

Minimum core:

- at least one usable credit profile
- at least one verified income artifact
- debts or payment obligations available for DTI
- vehicle value or collateral value available for LTV
- identity status present

### Business-capital completeness

Minimum core:

- legal entity type present
- formation evidence present
- EIN present or explicitly missing
- owners / officers verification state
- address / good standing state
- financial statements or tax-summary evidence

### Blocking examples

Blocking:

- missing income evidence
- no usable credit artifact
- no entity formation evidence for business borrower
- no collateral value for collateralized financing

Non-blocking:

- missing secondary bureau
- missing optional bank statements
- missing marketing/profile enrichment

---

## Recommended Derived Properties

These should live on the finance profile, deal, or controlling object, not on the worker itself.

- `fin_profile_completeness_score`
- `fin_profile_blocking_count`
- `fin_profile_missing_items_json`
- `fin_profile_missing_docs_json`
- `fin_profile_missing_business_items_json`
- `fin_ready_for_underwriting`
- `fin_ready_for_lender_match`
- `fin_next_required_action`
- `fin_next_required_worker`
- `fin_last_completeness_reviewed_at`

---

## First Useful Automations

1. On approved intake, run `incomplete_profile_worker`.
2. If score is below threshold, create a profile-completion task.
3. If the missing items are cross-functional, create a blocker ticket.
4. If the profile becomes complete, advance to underwriting-readiness.
5. If underwriting-ready and lender-rule-ready, hand off to lender matching.

---

## Why It Matters

Without this worker, the system jumps too quickly from:

- intake
- to underwriting logic
- to lender matching theory

This worker gives the finance lane a proper middle layer:

`intake -> profile completion -> ratio readiness -> underwriting -> lender match`

That is the right order.
