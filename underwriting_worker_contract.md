# Underwriting Worker Contract

## Why This Worker Should Exist

Once the profile is:

- complete enough
- and validated

the system still needs a worker that actually applies underwriting doctrine.

That is the `underwriting_worker`.

This worker should not gather missing facts.
It should not prove source truth.
It should make the underwriting decision from the validated package.

---

## Worker Name

Recommended worker profile:

- `underwriting_worker`

Alternative names:

- `auto_underwriting_worker`
- `credit_decision_worker`
- `underwriting_decision_worker`

My recommendation is:

- `underwriting_worker`

because it stays broad enough for consumer and business lending paths.

---

## Worker Purpose

Apply underwriting policy to a validated finance package and return the correct decision state.

This worker should:

1. read the validated credit, income, collateral, and readiness package
2. apply score, DTI, PTI, LTV, and doctrine rules
3. determine auto-approve, manual review, counter, conditional decline, or decline
4. identify exception level when policy thresholds are exceeded
5. mark whether the file is eligible for lender matching / reverse auction
6. route the record to the correct next worker or review lane

---

## Inputs

### Validated financial inputs

- validated representative score
- validated DTI
- validated PTI
- validated LTV
- validated income package
- validated identity package

### Doctrine inputs

- underwriting thresholds
- exception authority rules
- `pc_bank_stipulations`
- score tier and lender cutoffs

### Structured inputs

- `pc_credit_profiles`
- `pc_income_profiles`
- `pc_golden_records`
- `pc_vehicle_valuations`
- `pc_bank_stipulations`

### Workflow inputs

- service request
- deal
- task
- ticket
- stage
- readiness state

---

## Outputs

### Core outputs

- `underwriting_status`
- `underwriting_decision`
- `underwriting_tier`
- `exception_required`
- `exception_level`
- `decision_reasons`
- `stipulations_required`
- `counter_terms`
- `is_auction_eligible`
- `next_worker`

### A relations management platform and workflow outputs

- write underwriting decision fields
- create exception-review task if needed
- create senior-review or manager-review ticket when doctrine requires it
- advance approved packages toward lender matching
- route declined packages toward repair or advisory lanes

---

## Decision Gates It Owns

This worker owns the decision gate after validation.

### Its gates

- `is_auto_approved`
- `is_manual_review`
- `is_counter_offer_required`
- `is_conditionally_declined`
- `is_declined`
- `is_auction_eligible`

### Gates it should not own

- source-document validation
- profile completeness
- final lender selection
- post-auction offer ranking

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
  - `scheduled`

- `api_surface_type`
  - `worker_control_api`

- `capability_registry_source`
  - `backend_actions_catalog`
  - `company_automation_playbooks`
  - `manual_seed`

- `automation_control_surface`
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

- deal
- task
- ticket
- worker actions
- worker handoffs

### Most likely workflow lanes

- `Financial Preparation & Lender Matching`
- `Credit Strategy Personal`
- `Credit Strategy Business`

---

## Proposed Underwriting Logic

### Auto-approve path

Use validated doctrine such as:

- score `>= 680`
- DTI `<= 45%`
- PTI `<= 15%`
- LTV `<= 120%`

plus:

- verified income
- acceptable stability
- no disqualifying bankruptcy / repo conditions

### Manual-review path

Examples:

- score below prime threshold
- DTI above doctrine band
- LTV above doctrine band
- first-time buyer
- self-employed or unusual income
- fraud alert

### Exception routing

Examples:

- `LTV +10%` -> senior underwriter review
- `LTV +20%` -> credit manager review
- `DTI +5%` -> senior underwriter review
- `DTI +10%` -> credit manager review

### Auction eligibility

This worker should set:

- `is_auction_eligible = true`

only when the package satisfies the lender-match prerequisites.

---

## Recommended Derived Properties

- `fin_underwriting_status`
- `fin_underwriting_decision`
- `fin_underwriting_tier`
- `fin_exception_required`
- `fin_exception_level`
- `fin_stipulations_required_json`
- `fin_counter_terms_json`
- `fin_is_auction_eligible`
- `fin_last_underwritten_at`
- `fin_last_underwritten_by_worker`

---

## Relationship To The Other Workers

The sequence should be:

1. `incomplete_profile_worker`
   - what is missing?

2. `validator_worker`
   - is what is present actually valid?

3. `underwriting_worker`
   - what is the decision?

4. `lender_matching_worker`
   - who should receive the package?

That is the right stack.
