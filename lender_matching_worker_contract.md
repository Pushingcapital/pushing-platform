# Lender Matching Worker Contract

## Why This Worker Should Exist

After underwriting, the system needs a worker that operationalizes the match.

That is not the same as underwriting.

The `lender_matching_worker` should own:

- lender-rule filtering
- reverse-auction initialization
- offer intake
- offer comparison preparation

It should not own:

- source validation
- underwriting decisioning

---

## Worker Name

Recommended worker profile:

- `lender_matching_worker`

Alternative names:

- `reverse_auction_worker`
- `capital_match_worker`
- `lender_route_worker`

My recommendation is:

- `lender_matching_worker`

because it is the clearest business name.

---

## Worker Purpose

Match an underwritten, validated package to the correct lender set and initialize the reverse-auction path.

This worker should:

1. take an underwritten package
2. compare it to lender stipulations
3. identify eligible lenders or products
4. create the initial reverse-auction rows
5. capture incoming offer state
6. route the file to offer ranking / selection / packaging

---

## Inputs

### Underwriting inputs

- underwriting decision
- exception state
- `is_auction_eligible`
- stipulation requirements

### Financial inputs

- representative score
- DTI
- PTI
- LTV
- vehicle or collateral context
- entity and readiness state

### Structured inputs

- `pc_credit_profiles`
- `pc_income_profiles`
- `pc_bank_stipulations`
- `pc_reverse_auction_matches`
- `pc_auction_rate_submissions`
- `pc_vehicle_valuations`

### Workflow inputs

- deal
- ticket
- task
- stage
- next action

---

## Outputs

### Core outputs

- `eligible_lender_set`
- `matching_exclusions`
- `match_status`
- `auction_initialized`
- `auction_match_count`
- `offer_summary`
- `selected_offer_candidate`
- `match_next_action`

### A relations management platform and workflow outputs

- create rows in `pc_reverse_auction_matches`
- write lender-match status back into the controlling record
- create follow-up tasks for stipulations or missing lender conditions
- route active matches toward offer review and deal structuring

---

## Decision Gates It Owns

This worker owns matching and auction-init gates.

### Its gates

- `is_matchable`
- `has_eligible_lenders`
- `is_auction_initialized`
- `is_offer_collection_active`
- `is_ready_for_offer_selection`

### Gates it should not own

- validation of source artifacts
- underwriting approval itself
- final acceptance of the winning commercial offer

---

## Subscription and Automation Shape

### Recommended worker metadata

- `worker_type`
  - `control_plane_router`

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
  - `orchestrator_agent_registry`
  - `manual_seed`

- `automation_control_surface`
  - `worker_actions`
  - `worker_handoffs`
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
- `pc_bank_stipulations`
- `pc_reverse_auction_matches`
- `pc_auction_rate_submissions`
- `pc_vehicle_valuations`

### Control-plane objects

- deal
- task
- ticket
- worker actions
- worker handoffs
- orchestration log

### Most likely workflow lane

- `Financial Preparation & Lender Matching`

---

## Proposed Matching Logic

### Precondition

Only proceed if:

- profile is complete enough
- validation passed
- underwriting passed or conditionally passed
- `is_auction_eligible = true`

### Lender filtering

Use:

- score band
- DTI
- PTI
- LTV
- product type
- collateral type
- business vs consumer path
- exception state

against:

- `pc_bank_stipulations`

### Auction initialization

For each eligible lender path:

- insert a row into `pc_reverse_auction_matches`
- set initial `match_status`
- attach core package summary

### Offer intake

As responses or submissions return:

- insert / update `pc_auction_rate_submissions`
- capture rate, payment, and conditions

---

## Recommended Derived Properties

- `fin_match_status`
- `fin_eligible_lender_count`
- `fin_eligible_lenders_json`
- `fin_matching_exclusions_json`
- `fin_auction_initialized`
- `fin_offer_count`
- `fin_selected_offer_candidate_json`
- `fin_last_matched_at`
- `fin_last_matched_by_worker`

---

## Relationship To The Other Workers

The sequence should be:

1. `incomplete_profile_worker`
2. `validator_worker`
3. `underwriting_worker`
4. `lender_matching_worker`

That gives the business a clear route from:

- intake
- to readiness
- to decision
- to capital routing
