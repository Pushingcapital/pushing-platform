# Lender Matching, FICO Parsing, DTI/LTV, Business Formation, Finance, and Tax Brief

## Executive Read

Pushing Capital already has a real finance operating model, not just a sales catalog.

The strongest finance stack visible right now has three layers:

1. Service and workflow doctrine
   - `Financial Preparation & Lender Matching`
   - `Credit Strategy Personal`
   - `Credit Strategy Business`
   - `Business Formation & Launch Support`
   - bookkeeping and tax services

2. Data model and decision doctrine
   - `pc_credit_profiles`
   - `pc_income_profiles`
   - `pc_bank_stipulations`
   - `pc_reverse_auction_matches`
   - `pc_auction_rate_submissions`

3. Actual worker implementation
   - parser-versioned credit report extraction
   - FICO and bureau score normalization
   - representative-score calculation
   - tradeline utilization calculation
   - credit-tier classification

The most important split is this:

- FICO parsing is already concretely implemented in worker code.
- DTI, PTI, LTV, lender routing, and auction eligibility are strongly defined in doctrine and data-model design.
- Business formation, KYB/KYC, tax, and bookkeeping are clearly defined as productized service lanes, but they look more workflow-driven than deeply coded in the finance workers reviewed here.

---

## 1. Finance Service Stack

The finance catalog is broad and intentionally modular.

### Credit Services

- Credit Strategy Discovery
- Credit Strategy
- Tradeline Validation
- MyScoreIQ 7-day trial
- MyScoreIQ Monthly Subscription
- MyScoreIQ On-Demand Pull

### Auto Finance

- Loan Acquisition
- Funding Options Review
- Rate & Term Review
- Refinance / Consolidation Options
- Readiness Checklist
- Curated Lender Introductions
- Standalone Auto Finance Package
- Standalone Retail / Broker Package
- Standalone Wholesale / Broker Package

### Business Formation

- LLC Formation
- Corporation (C-Corp / S-Corp)
- DBA Registration
- Nonprofit Formation
- EIN Registration
- Business Credit Setup

### Bookkeeping and Tax

- Monthly Reconciliation
- Invoices & Bills Tracking
- Profit & Loss (P&L)
- Balance Sheet
- Tax Summary
- Document Gathering
- Audit Packet Preparation

---

## 2. Lender Matching: How It Is Supposed to Work

The lender-matching model is not just "refer client to lender."
It is designed as a reverse-auction or macro-lending engine.

### Core objects

- `pc_credit_profiles`
  - credit score and derogatory truth
- `pc_income_profiles`
  - income and DTI truth
- `pc_bank_stipulations`
  - lender rules and hard cutoffs
- `pc_reverse_auction_matches`
  - active lender-match / auction rows
- `pc_auction_rate_submissions`
  - returned lender bids and payment options

### Canonical lender-match flow

1. Verify the applicant
   - query `pc_credit_profiles` for FICO / score truth
   - query `pc_income_profiles` for DTI truth

2. Check lender rules
   - cross-reference Golden Record data against `pc_bank_stipulations`

3. Open the auction
   - create rows in `pc_reverse_auction_matches`
   - mark them as pending bid

4. Collect lender responses
   - insert lender/API offers into `pc_auction_rate_submissions`
   - track `submitted_rate` and `monthly_payment`

5. Select the winner
   - mark winning submission `selected = true`
   - mark parent reverse-auction row as won

### Strategic meaning

This is zero-commission or low-friction lender matching framed as a controlled decision engine, not a loose handoff process.

It is also tightly connected to:

- `Financial Preparation & Lender Matching`
- `Loan Optimization & Acquisition`
- `Curated Lender Introductions`
- `multi-lender arbitrage / simultaneous lender submissions`

---

## 3. FICO Scores and FICO Parsing

This is where the code is strongest.

### What the credit parser extracts

The credit extraction worker is built to produce structured JSON with:

- `scores`
- `inquiries`
- `tradelines`
- `collections`
- `public_records`

Each score row can carry:

- `bureau`
- `score_model`
- `score_name`
- `score_value`
- `score_date`

The extraction prompt explicitly preserves model names such as:

- `FICO 8`
- `FICO 9`
- `FICO Bankcard 8`
- `VantageScore 3.0`

It also prefers base FICO and common industry scores when many scores are present.

### What the parser normalizes

The processor normalizes:

- bureau names to `experian`, `equifax`, `transunion`
- dates into normalized ISO form
- score values into integers
- tradeline account types
- account statuses
- balances, limits, payments, past due amounts
- utilization percentages

It also de-duplicates extracted score and tradeline records before storage.

### Storage model

The parsing pipeline is versioned.

It stores a parent extraction row in:

- `credit_report_extractions`

and children in:

- `credit_report_scores`
- `credit_report_inquiries`
- `credit_report_tradelines`
- `credit_report_collections`
- `credit_report_public_records`

The schema also keeps:

- `parser_version`
- `model`
- `status`
- raw `extraction_json`
- `error`

That means the system is set up to compare parser revisions over time instead of overwriting everything blindly.

---

## 4. What the Credit Analytics Worker Actually Calculates

The analytics worker is conservative and useful.

### Representative score

When multiple bureau scores exist:

- 1 score: use it
- 2 scores: use the lower score
- 3 scores: use the middle score

That is a classic conservative underwriting posture.

### Credit tiers

The code maps representative score to:

- `>= 720` -> `prime`
- `>= 660` -> `near_prime`
- `>= 600` -> `subprime`
- `< 600` -> `deep_subprime`

### Utilization

The worker calculates utilization as:

- `balance / credit_limit * 100`

It uses a provided utilization value if present; otherwise it derives it from balance and limit.

This happens both at:

- overall balance/limit math
- individual tradeline level

### Semantic retrieval for credit analysis

The worker also searches document chunks using finance-specific prompts such as:

- collections
- charge off
- bankruptcy
- late payment 30 60 90
- credit utilization
- monthly payment
- mortgage rent history

So the finance stack is already doing retrieval-based evidence gathering, not only flat parsing.

---

## 5. DTI, PTI, and LTV

These are defined very clearly in the doctrine.

### Formula definitions

- `DTI` = total debts / gross income
- `PTI` = car payment / gross income
- `LTV` = loan amount / collateral value

### Typical thresholds

#### DTI / PTI bands

- Prime
  - DTI `45%`
  - PTI `15%`
- Near Prime
  - DTI `50%`
  - PTI `18%`
- Subprime
  - DTI `55%`
  - PTI `20%`
- Deep Subprime
  - DTI `60%+`
  - PTI `25%+`

#### LTV bands

- Prime
  - `120%`
- Near Prime
  - `130%`
- Subprime
  - `140%`
- Deep Subprime
  - `150%+`

### Auto-approve doctrine

The current underwriting doctrine says a system decision can auto-approve when:

- credit score `>= 680`
- DTI `<= 45%`
- PTI `<= 15%`
- LTV `<= 120%`
- time on job `>= 2 years`
- time at residence `>= 2 years`
- no bankruptcies in last 4 years
- no repos ever
- verified income present

### Manual-review doctrine

Manual or exception review is triggered by:

- score `< 680`
- score `< 580` for senior review
- DTI `> 50%`
- LTV `> 130%`
- recent bankruptcy
- prior repo
- fraud alert
- first-time buyer
- self-employed income
- cash income

### Exception authority

- `LTV +10%` -> Senior Underwriter
- `LTV +20%` -> Credit Manager
- `DTI +5%` -> Senior Underwriter
- `DTI +10%` -> Credit Manager

### Important implementation note

I found strong DTI/PTI/LTV doctrine and routing logic, but not the same level of concrete executable code for DTI and LTV that exists for FICO parsing and utilization calculation in the reviewed worker files.

So the current state appears to be:

- score parsing: implemented
- utilization: implemented
- DTI/LTV thresholds and routing: clearly specified
- DTI/LTV execution engine: likely partially implemented elsewhere or still meant to be codified more fully

---

## 6. Automated Calculation and Parsing Strategy

The Bronze-to-Gold pipeline gives a strong hint about how finance automation is supposed to behave.

### Bronze -> Silver -> Gold

- Bronze
  - raw files in object storage
- Silver
  - OCR + LLM structured JSON
- Gold
  - relational tables used for decisions

### Financial extraction goals

For W-2s, 1099s, and paystubs, the explicit extraction targets are:

- `wages_paid`
- `employer_name`
- `dti_ratio`

and the destination object is:

- `pc_income_profiles`

### Fail-closed behavior

If the file is junk or cannot be confidently classified:

- do not push it to Gold
- route it to human review
- create a task for manual classification

That is the right architecture for lender and compliance work because it keeps bad or ambiguous financial evidence from silently poisoning underwriting.

---

## 7. Business Formation and KYB/KYC

Business formation is not a side product.
It is treated as its own finance-adjacent lane and also as an enabling gate for commercial lending and business operations.

### Business formation offerings

- LLC formation
- Corporation formation
- DBA registration
- Nonprofit formation
- EIN registration

### Business launch support

- business bank account setup
- operating agreement / bylaws templates
- licenses and permits

### Business verification

- Personal ID verification (`KYC`)
- Company registration check
- Tax ID / EIN check
- Owners and officers check
- Address and good-standing check

### Business credit

- Business Credit Setup
  - explicitly tied to Nav, DNB, and Experian Business

### Strategic meaning

The docs explicitly note that business formation delays can stall commercial lending.
That means this lane is not just legal paperwork.
It is a prerequisite layer for credit, compliance, and readiness.

---

## 8. Finance, Tax, and Reporting

The bookkeeping and tax lane is present as a formal delivery system, not an afterthought.

### Bookkeeping services

- Monthly Reconciliation
- Invoices & Bills Tracking

### Reporting services

- Profit & Loss
- Balance Sheet
- Tax Summary

### Audit and evidence services

- Document Gathering
- Audit Packet Preparation

### Why this matters for lender matching

These services are upstream inputs to better lender matching because they improve:

- verified income quality
- expense visibility
- balance-sheet truth
- documentation quality
- business readiness for lenders and tax authorities

They also feed a more durable evidentiary package for:

- KYB
- underwriter review
- exception handling
- audit defense

---

## 9. Where the Business Plan Energy Actually Is

The operating documents make it clear that finance is central to the business model.

The strongest active or intended finance-related lanes include:

- Credit Strategy Personal
- Credit Strategy Business
- Loan Optimization & Acquisition
- Financial Preparation & Lender Matching
- Accounting & Book Keeping
- Business Formation & Launch Support

The broader business narrative is:

- credit repair and credit readiness generate qualified demand
- lender matching and optimization convert that demand into financing outcomes
- business formation, KYB, tax, and bookkeeping make more complex borrowers fundable

This is much closer to an operating system for financial readiness and lender orchestration than a traditional broker workflow.

---

## 10. Strongest Existing Implementation Artifacts

### Real code

- credit parsing worker
- credit analytics worker
- parser-versioned SQL schema for extracted credit report entities

### Strong doctrine and data model

- reverse auction / lender-match flow
- DTI/PTI/LTV decision bands
- auction eligibility logic
- business formation and KYB/KYC service model
- bookkeeping and tax service model

### Most important tables and concepts

- `pc_credit_profiles`
- `pc_income_profiles`
- `pc_bank_stipulations`
- `pc_reverse_auction_matches`
- `pc_auction_rate_submissions`
- `pc_golden_records`
- `pc_document_parse_log`
- `pc_json_vault`

---

## 11. Gaps and Best Next Build Targets

### Best-documented and most production-ready

- FICO / bureau score parsing
- tradeline normalization
- score rollup and representative-score logic
- utilization calculation

### Most clearly specified but less visibly codified in reviewed workers

- DTI calculation engine
- PTI calculation engine
- LTV calculation engine
- lender rule evaluation against `pc_bank_stipulations`
- auction eligibility flip and downstream auction creation

### Best business-expansion targets

- executable lender-rule engine
- first-class DTI/PTI/LTV calculator service
- incomplete profile worker for pre-underwriting readiness
- validator worker for evidence and ratio truth gates
- business-formation to commercial-lending readiness workflow
- tax-summary and financial-statement package builder
- document-derived readiness scoring for lender introductions

### Best missing worker right now

The cleanest missing worker is:

- `incomplete_profile_worker`

Its job would be to:

- inspect whether the profile is complete enough for underwriting
- score completeness
- identify blocking missing facts or documents
- write the next required action back into A relations management platform
- route the record to the right readiness task or blocker ticket

That worker is the bridge between:

- intake
- parsed data
- underwriting
- lender matching

The next companion worker should be:

- `validator_worker`

Its role is different:

- `incomplete_profile_worker` asks what is missing
- `validator_worker` asks whether what is present is actually valid

The next two workers in the chain should be:

- `underwriting_worker`
- `lender_matching_worker`

That gives the finance lane a clean progression:

- `incomplete_profile_worker`
- `validator_worker`
- `underwriting_worker`
- `lender_matching_worker`

---

## 12. Bottom Line

If you need the short truth:

- lender matching exists as a reverse-auction architecture
- FICO parsing is real and already implemented
- utilization calculation and score-tiering are real and already implemented
- DTI/PTI/LTV are very clearly defined and connected to underwriting policy
- business formation, KYB/KYC, tax, and bookkeeping are formal productized lanes that support lender readiness

The system already knows what it wants to be:

`parse financial truth -> calculate readiness -> match against lender rules -> open auction -> choose best offer -> document the outcome`

The most valuable next step is not more concept work.
It is turning the DTI/LTV doctrine and lender-rule doctrine into the same level of executable rigor that the credit parser already has.
