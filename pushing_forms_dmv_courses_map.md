# PushingForms, DMV, and Courses Map

## Current Reality

`PushingForms` is currently more of a control-plane doctrine than a fully productized public form suite.

The live public surfaces I found are:

- `clientportal`
- `subcontractorPortal`
- `userOne Courses`
- hidden fallback intake at `/start-intake`

I did **not** find a standalone public DMV form page in the current `pushingcap-web-v2` app.

## PushingForms Doctrine

The clearest definition of `PushingForms` currently lives in the standby architecture page:

- [App.jsx](/Users/emmanuelhaddad/PushingStandby/src/App.jsx#L114)

It defines `PushingForms` as the ingestion vector with three forms:

1. `Intake & Normalization Form`
   - goes to `DMV / KSR Oracle`
   - contains raw identity data and unverified VIN
2. `First Through The Door Contract`
   - goes to `Master Registry & Subcontractor PM`
   - contains normalized VIN, address confirmation, and initial inspection fee consent
3. `Exit Vector / Renewal Form`
   - goes to automated client offering / renewal logic
   - contains final yield, address re-confirmation, and upsell paths like transport or maintenance

This is the strongest current statement of what `PushingForms` is supposed to do.

## Internal A relations management platform Reality

`PushingForms` also exists as a real internal A relations management platform route.

See:

- [App.tsx](/Users/emmanuelhaddad/pc-data-platform/ui/internal-crm/web/src/App.tsx#L127)
- [PushingFormsPage.tsx](/Users/emmanuelhaddad/pc-data-platform/ui/internal-crm/web/src/pages/PushingFormsPage.tsx#L34)

The current internal implementation is branded as:

- `PUSHINGFORMS`
- `PUBLIC INTAKE MATRIX`

So the clean interpretation is:

- `PushingForms` is not only a doctrine layer
- it is also an internal operator-managed intake surface

Right now it appears more like a branded intake shell than a deeply wired multi-step execution console, but it is definitely a real maintained page in the internal A relations management platform.

## DMV Findings

DMV is already treated as a first-class automotive compliance lane in the live public site.

- [automotive/page.tsx](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/app/automotive/page.tsx#L9)
- [public-site.ts](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/lib/public-site.ts#L108)

The automotive public narrative explicitly includes:

- title
- lien
- DMV
- logistics
- condition
- delivery

The automotive catalog also explicitly exposes:

- `Title and Lien Resolution`
- `DMV Compliance`

See:

- [public-site.ts](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/lib/public-site.ts#L252)

## DMV Workflow Signal Behind Push P

The strongest backend signal is that Push P currently defaults into a DMV-oriented workflow.

- [clientportal/page.tsx](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/app/clientportal/page.tsx#L59)
- [orchestration.ts](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/lib/orchestration.ts#L217)

The default `serviceKey` is:

- `dmv_license_recovery`

The orchestration layer also has explicit `truth_gates` for:

- `identity`
- `finance`
- `dmv`

See:

- [orchestration.ts](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/lib/orchestration.ts#L25)
- [orchestration.ts](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/lib/orchestration.ts#L122)

There are also dedicated Push P endpoints for DMV quote and payment webhook handling:

- [orchestration.ts](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/lib/orchestration.ts#L313)
- [orchestration.ts](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/lib/orchestration.ts#L332)

## Courses Findings

The live public course surface is:

- [userone-courses/page.tsx](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/app/userone-courses/page.tsx#L1)

It is not just a placeholder. It is a real handoff page for:

- `userOne Courses`
- `Retail Dealer 101`
- the live Cloud Run learner app

Key facts:

- it opens `userOneCoursesPlatformUrl`
- default target is `https://userone-courses-mvp-660085746842.us-central1.run.app`
- it presents course landing, checkout/enrollment, and learner platform/library as the course stack

See:

- [public-site.ts](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/lib/public-site.ts#L17)
- [userone-courses/page.tsx](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/app/userone-courses/page.tsx#L53)

The site inspection manifest also treats `userOne Courses` as one of the three main ingress points:

- [site-inspection.json/route.ts](/Users/emmanuelhaddad/projects/pushingcap-web-v2/src/app/site-inspection.json/route.ts#L8)

## Recovered Workflow Evidence

In recovered app logic, I found explicit workflow slugs showing both DMV and courses already existed as pipeline concepts:

- `dmv-concierge`
- `course-discovery-enrollment`

Recovered ids:

- `dmv-concierge`
  - deal pipeline `1078181570`
  - ticket pipeline `1427939014`
- `course-discovery-enrollment`
  - pipeline `1504342776`

Evidence:

- [worker.js](/Users/emmanuelhaddad/projects/pushingcap-web-v2/legacy-recovered/worker.js#L85452)
- [worker.js](/Users/emmanuelhaddad/projects/pushingcap-web-v2/legacy-recovered/worker.js#L85456)

These are recovered artifacts, not yet confirmed as the current live public app routing layer.

## What This Means

`PushingForms` currently spans three different levels:

1. doctrine
   - strongest in `PushingStandby`
2. public ingress
   - `clientportal`, `subcontractorPortal`, `userOne Courses`, fallback intake
3. execution wiring
   - Push P orchestration with DMV truth gates and DMV default service key

The important gap is this:

- DMV is real as a workflow and compliance lane
- courses are real as a learner ingress lane
- `PushingForms` exists internally as a real intake surface
- but `PushingForms` is not yet a fully explicit public app surface with named public form pages for each step

## Best Current Working Interpretation

For now, the cleanest control-plane interpretation is:

- `PushingSecurity` = the universal public onboarding application program
- `PushingForms` = the cross-lane intake and consent matrix behind that onboarding program, with a real internal A relations management platform intake shell
- `DMV` = a live automotive compliance workflow and default Push P onboarding vector
- `Courses` = the training and filtration lane, currently surfaced through `userOne Courses`

## Next Mapping Move

Before building new forms, the next clean mapping step is:

1. define which `PushingSecurity` onboarding classifications map to which form packets
2. define which create `service_requests`
3. define which create `deals`
4. keep `PushingForms` as the intake-matrix engine instead of a competing public app
4. define which create `tickets/tasks`
5. define which are only training / learner surfaces

That is the step that will keep `PushingForms`, DMV, and Courses from getting mixed together.
