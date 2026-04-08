# userOne Folder And Section Taxonomy

Date: 2026-04-03
Status: Canonical
Owner: Manny + Codex

This is the folder and section structure for `userOne`.

The goal is to make `userOne` feel valuable, organized, and clearly connected to Pushing Capital.

The user should feel like they are getting a big bang for their buck:

- training
- enablement
- packet preparation
- platform access
- operational support
- business launch support

## Top-Level Structure

Use this hierarchy:

1. `Pushing Capital`
2. `userOne`
3. `Courses`
4. `Professional Platform`
5. `Services And Support`

That keeps the training lane visible, but makes it clear that the courses feed into a larger operating system.

## Folder Structure

### `userOne`

This is the parent brand and professional ecosystem.

Primary sections inside `userOne`:

- `Start Here`
- `Courses`
- `Application`
- `Professional Platform`
- `Services And Support`
- `My Progress`

## Section Definitions

### 1. `Start Here`

Purpose:

- explain the professional path
- explain the Pushing Capital tie-in
- explain what the student gets beyond a course

Suggested content:

- the opportunity
- the path
- what support exists
- how the platform carries operational weight

### 2. `Courses`

Purpose:

- hold the training modules
- let the user choose a lane
- clearly show this is the beginning of the bigger platform

Recommended course sections from the current workflow inventory:

- `Deal Architect`
- `Appraisal`
- `Parts`
- `Transport`
- `Mobile Services`
- `Inspections`
- `Auto Finance`
- `DMV Products`
- `Retail Auto`
- `Wholesale Vehicle`
- `Labor`

These are grounded by the live option list in:

- [/Users/emmanuelhaddad/workflow-studio-live.md](/Users/emmanuelhaddad/workflow-studio-live.md#L455)

### 3. `Application`

Purpose:

- hold `userOne Application`
- collect readiness data
- move the person from training into qualification

This is where the user says:

`I am ready to be evaluated for the real platform.`

### 4. `Professional Platform`

Purpose:

- open the real licensed-professional workspace
- expose deal and workflow tools
- connect training to live operations

Suggested subsections:

- `Dashboard`
- `Deal Workspace`
- `Packets`
- `Contracts`
- `Movement`
- `Clients`
- `Payments`

### 5. `Services And Support`

Purpose:

- show what Pushing Capital carries for the user
- make the value obvious

Suggested subsections:

- `Business Setup`
- `Website Setup`
- `Packet Preparation`
- `Contracts And Compliance`
- `Transport And Movement`
- `Autonomous Support`

This is where the user understands they are not just buying education.

### 6. `My Progress`

Purpose:

- show training progress
- show qualification status
- show readiness status
- show what unlocks next

Suggested subsections:

- `Training Progress`
- `Qualification`
- `Required Documents`
- `Activation Status`

## Naming Rules

### Keep

- `userOne`
- `Deal Architect`
- strong lane names like `Transport`, `Inspections`, `Auto Finance`, `DMV Products`

### Reduce

- overly academic language
- language that makes the person feel like a passive student
- generic “course catalog” framing

### Increase

- professional path
- operator
- platform
- launch
- support
- readiness
- activation

## BigQuery Reality Check

BigQuery does contain the main notebook-curated datasets:

- `notebooklm_curated_v1`
- `notebook_registry`
- `notebook_source_bundles`

But a clean top-level `userOne` table or obvious course registry row did not surface immediately from table names or quick keyword queries.

So the strongest structured source for the section names right now is:

- the workflow option inventory in [/Users/emmanuelhaddad/workflow-studio-live.md](/Users/emmanuelhaddad/workflow-studio-live.md#L455)

That means we can still use BigQuery later for:

- course enrollment analytics
- conversion analytics
- module usage
- progression scoring
- qualification signals

But the naming spine should be locked now from the workflow inventory and the `userOne` brand model.

## Immediate Build Rule

If we build the next `userOne` UI, the folder navigation should read something close to:

- `Start Here`
- `Courses`
- `Application`
- `Professional Platform`
- `Services And Support`
- `My Progress`

And inside `Courses`, the first featured offer should be:

- `Deal Architect`

That gives the user a clean first identity without shrinking the larger platform.
