# Validator Worker Contract

## Why This Worker Should Exist

`incomplete_profile_worker` and `validator_worker` should be siblings.

They do different jobs.

### `incomplete_profile_worker`

- finds what is missing
- scores completeness
- routes the next evidence-gathering step

### `validator_worker`

- checks whether the evidence that is present is actually valid
- confirms that calculations, documents, and records satisfy truth gates
- decides whether a profile can safely advance

That distinction matters.

Without a validator worker, the system can confuse:

- `present`

with

- `proven`

and those are not the same.

---

## Worker Name

Recommended worker profile:

- `validator_worker`

Alternative names:

- `financial_truth_validator`
- `lender_readiness_validator`
- `profile_validation_worker`

My recommendation is:

- `validator_worker`

because it is broad enough to apply across consumer finance, business readiness, and lender matching.

---

## Worker Purpose

Validate that the finance profile is internally consistent, document-backed, and safe to advance into underwriting or lender matching.

This worker should:

1. validate parsed profile facts against source artifacts
2. validate DTI / PTI / LTV calculations
3. validate identity and business-readiness truth gates
4. validate that required workflow stage conditions are satisfied
5. mark the record as validated, conditionally validated, or failed validation
6. route exceptions or corrections when the truth does not hold

---

## Inputs

### Structured inputs

- `pc_credit_profiles`
- `pc_income_profiles`
- `pc_golden_records`
- `pc_vehicle_valuations`
- `pc_bank_stipulations`
- reverse-auction eligibility fields

### Source artifact inputs

- credit reports
- W-2s
- 1099s
- paystubs
- bank statements
- tax returns
- driver's license / ID
- business registration documents
- EIN evidence
- P&L / balance sheet / tax summary artifacts

### Workflow inputs

- service request
- deal
- task
- ticket
- stage
- `next_required_action`
- current readiness flags

---

## Outputs

### Core outputs

- `validation_status`
- `validation_confidence`
- `validated_facts`
- `failed_validations`
- `validation_exceptions`
- `validated_dti`
- `validated_pti`
- `validated_ltv`
- `ready_to_advance`
- `validation_next_action`

### A relations management platform and workflow outputs

- update validation fields on the controlling record
- create exception ticket if data conflicts or rules fail
- create correction task if recalculation or re-upload is needed
- advance the record only if validation gates pass

---

## Decision Gates It Owns

This worker should own validation and truth gates.

It should not own final commercial judgment.

### Its gates

- `is_identity_validated`
- `is_income_validated`
- `is_credit_profile_validated`
- `is_ratio_package_validated`
- `is_business_readiness_validated`
- `is_underwriting_package_validated`
- `is_lender_match_package_validated`

### Gates it should not own

- final approval decision
- lender selection
- pricing exception approval
- legal conclusion beyond document-presence and registration truth

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
  - `request`
  - `approved_intake`
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
- lender-readiness status fields

### Control-plane objects

- service request
- deal
- task
- ticket
- worker action and handoff logs

### Most likely workflow lanes

- `Financial Preparation & Lender Matching`
- `Credit Strategy Personal`
- `Credit Strategy Business`
- `Business Formation & Launch Support`

---

## Proposed Validation Logic

### Credit validation

- confirm extracted scores map to real source rows
- confirm representative-score logic was applied correctly
- confirm derogatory flags and utilization were computed from valid source data

### Income validation

- confirm income artifacts are present and legible
- confirm stated gross income matches parsed evidence
- confirm debt obligations used in DTI are not stale or obviously incomplete

### Ratio validation

- recompute `DTI`, `PTI`, and `LTV`
- compare recomputed values against stored values
- flag mismatches beyond tolerance

### Business-readiness validation

- confirm entity type is present
- confirm formation evidence exists
- confirm EIN state
- confirm owners/officers or good-standing evidence where required
- confirm financial-statement presence for business-capital paths

### Workflow validation

- confirm the stage is appropriate for the evidence currently on file
- block advancement if evidence does not support the stage

---

## Validation Outcomes

### `validated`

- source evidence is present
- calculations are consistent
- truth gates pass
- record can advance

### `conditionally_validated`

- core truth holds
- one or more soft gaps remain
- record can advance with notes or conditions

### `failed_validation`

- contradiction, stale evidence, missing required proof, or rule conflict
- record must not advance

---

## Recommended Derived Properties

- `fin_validation_status`
- `fin_validation_confidence`
- `fin_validated_dti`
- `fin_validated_pti`
- `fin_validated_ltv`
- `fin_validation_failed_items_json`
- `fin_validation_exception_notes`
- `fin_ready_to_advance`
- `fin_last_validated_at`
- `fin_last_validated_by_worker`

---

## Relationship To `incomplete_profile_worker`

The clean stack is:

1. `incomplete_profile_worker`
   - what is missing?

2. `validator_worker`
   - is what we have actually valid?

3. `underwriting worker`
   - what is the decision?

4. `lender matching worker`
   - where should it go?

That order is right.

---

## First Useful Automations

1. When intake is complete enough, run `validator_worker`.
2. Recompute and validate DTI / PTI / LTV before underwriting.
3. If validation fails, create correction task or exception ticket.
4. If validation passes, mark the package ready for underwriting.
5. If underwriting-ready and lender-eligible, hand off to lender matching.
