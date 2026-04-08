# Pushing Capital Website Structure

Date: 2026-04-03
Status: Canonical
Owner: Manny + Codex

This is the clean website structure for Pushing Capital.

The goal is:

- one strong public brand
- one clear infrastructure story
- one obvious path into each audience lane
- one cleaner connection between public pages and authenticated product surfaces

## Brand Position

The public site already says the right kind of thing.

Current live anchors:

- homepage: `Clarity before commitment.`
- platform: `One execution layer for automotive commerce.`
- for dealers: `Dealer workflows, unified.`
- automotive: `Automotive transaction infrastructure.`
- finance: `Financial data orchestration.`

That tone is right:

- calm
- infrastructure-first
- operational
- trustworthy

The site should keep that voice.

## The Core Site Model

The website should have four layers.

### 1. Brand And Narrative Layer

This explains who Pushing Capital is.

Main pages:

- `Home`
- `Platform`
- `Services`
- `About`
- `Insights`

### 2. Audience Layer

This explains how the platform serves specific professional groups.

Main pages:

- `For Dealers`
- `For Lenders`
- later:
  - `For Operators`
  - `For Professionals`

### 3. Domain Layer

This explains the actual execution lanes.

Main pages:

- `Automotive`
- `Finance`
- `Business`

And inside automotive, the domain stack should eventually branch more explicitly into:

- `Inspections`
- `Parts`
- `Transport`
- `Vehicle Sales`
- `DMV`

### 4. Product And Portal Layer

This is where people stop reading and start operating.

Main surfaces:

- `PushingSecurity`
- `clientportal`
- `subcontractorPortal`
- `userOne`

## Recommended Primary Navigation

Keep the top navigation clean:

- `Platform`
- `Services`
- `Automotive`
- `Finance`
- `For Dealers`
- `For Lenders`
- `About`

Secondary action layer:

- `Push P`
- `clientportal`
- `subcontractorPortal`
- `userOne`

This lets the site do two jobs:

- explain the system
- route the person into the right operational surface

## Recommended Sitemap

### Public top-level pages

- `/`
- `/platform`
- `/services`
- `/automotive`
- `/finance`
- `/business`
- `/for-dealers`
- `/for-lenders`
- `/about`
- `/insights`

### Public product entry pages

- `/userone`
- `/userone-courses`
- `/start`
- `/start-intake`

### Guided / authenticated surfaces

- `/clientportal`
- `/subcontractor`
- `/login`
- `PushingSecurity`

## Page Roles

### Home

Job:

- establish the company
- explain the platform in one glance
- route to the major lanes

### Platform

Job:

- explain architecture
- explain execution model
- make the infrastructure credible

### Services

Job:

- translate the platform into concrete lanes
- give people a practical route map

### Automotive

Job:

- explain the automotive operating system
- connect inspections, parts, transport, DMV, condition, and closeout

### Finance

Job:

- explain financial data orchestration
- explain readiness, mapping, verification, and routing

### For Dealers

Job:

- give the dealer-side story
- position the software around real dealer pain

### userOne

Job:

- present the professional enablement story
- connect training to real infrastructure and support

### userOne Courses

Job:

- serve as the first step into the professional path
- feature `Deal Architect`
- show the module stack clearly

## userOne Placement

`userOne` should now sit in the site as a real product line, not a stray course link.

The hierarchy should be:

- `Pushing Capital`
- `userOne`
- `Courses`
- `Professional Platform`
- `Services And Support`

Which means:

- `/userone` becomes the main professional narrative page
- `/userone-courses` becomes the training entry page

## Website Structure For userOne

Recommended `userOne` section structure:

- `Start Here`
- `Courses`
- `Application`
- `Professional Platform`
- `Services And Support`
- `My Progress`

Recommended featured course/module stack:

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

## Relationship Between Pages And Apps

The site should stop feeling like unrelated pages and start feeling like one guided system.

The clean public-to-product map is:

- `Home` -> brand promise
- `Platform` -> technical credibility
- `Services` -> lane map
- `For Dealers` / `For Lenders` -> audience trust
- `Push P` -> conversational intake
- `PushingSecurity` -> controlled onboarding
- `clientportal` -> customer workspace
- `subcontractorPortal` -> worker workspace
- `userOne` -> professional enablement path

## Tooling Workflow

### NotebookLM Enterprise

Use it for:

- source-of-truth canon
- brand doctrine
- page messaging references
- content synthesis
- preserving the evolving site architecture

This is the memory and content system.

### Google Stitch

Use it for:

- visual exploration
- layout experimentation
- fast concept frames
- style and component direction

Do not treat Stitch as the production backend.
Treat it as a design acceleration layer unless a stronger production API path becomes available.

### GitHub

Use it for:

- implementation history
- branch-based design/build work
- PR review
- publishing the site changes in a controlled way

This is the execution and change-management layer.

## Immediate Build Priorities

### Phase 1. Clean the narrative

- keep the calm infrastructure tone
- stop treating `userOne` like only a course page
- make `Push P` a first-class entry action

### Phase 2. Clean the route hierarchy

- create a real `/userone`
- keep `/userone-courses` as the course entry
- make `For Dealers` and `Automotive` connect more clearly into the product layer

### Phase 3. Clean the product gateways

- `Push P`
- `PushingSecurity`
- `clientportal`
- `subcontractorPortal`
- `userOne`

### Phase 4. Expand domain pages

- `Inspections`
- `Parts`
- `Transport`
- `Vehicle Sales`
- `DMV`

## Working Rule

If we are building the site together, use this order:

1. site structure
2. page hierarchy
3. messaging system
4. design system
5. implementation

That keeps the website clean instead of letting it turn into isolated pages with no shared story.
