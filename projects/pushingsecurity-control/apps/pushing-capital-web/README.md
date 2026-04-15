## Pushing Capital Web

Fresh App Router workspace with a clean split between:

- customer-facing routes under `src/app/(customer)`
- employee-only routes under `src/app/(employee)`
- secure backend routes under `src/app/api`
- reusable UI/forms components under `src/components`
- backend integration logic under `src/lib`

This repo now includes:

- the employee dashboard for encrypted provider-key storage, automation playbooks, and browser bundles
- a customer-facing onboarding surface scaffold
- a Mongo bridge via `src/lib/mongodb.ts`
- local encrypted JSON fallback at `.data/control-store.json` for development when Mongo is not configured

## Bootstrap

Set these environment variables before real use. A sample file now lives at `.env.example`.

Core application settings:

```bash
PUSHINGSECURITY_ADMIN_EMAIL=amssi@pushingcap.com
PUSHINGSECURITY_ADMIN_PASSWORD=replace-me
PUSHINGSECURITY_MASTER_KEY=replace-with-a-long-random-secret
PUSHINGSECURITY_SESSION_SECRET=replace-with-a-different-long-random-secret
MONGODB_URI=replace-with-your-locked-down-mongo-uri
MONGODB_DB_NAME=replace-with-your-database-name
AWS_GATEWAY_BASE_URL=https://your-gateway.example.com
AWS_GATEWAY_ACCESS_TOKEN=replace-with-your-gateway-token
PUSHINGCAP_PLATFORM_CONTACT_SYNC_URL=https://platform.pushingcap.com/integrations/chat/contacts/upsert
PUSHINGCAP_PLATFORM_CONTACT_SYNC_BEARER_TOKEN=replace-with-your-platform-contact-ingest-token
PUSHINGCAP_PLATFORM_SERVICE_REQUEST_SYNC_URL=replace-with-your-platform-service-request-ingest-url
PUSHINGCAP_PLATFORM_SERVICE_REQUEST_SYNC_BEARER_TOKEN=replace-with-your-platform-service-request-ingest-token
HUBSPOT_PRIVATE_APP_TOKEN=replace-with-your-hubspot-private-app-token
PUSHINGCAP_WEBHOOK_HUB_BASE_URL=https://webhooks.pushingcap.com
PUSHINGCAP_WEBHOOK_HUB_ONBOARDING_TOKEN=replace-with-your-cloudflare-webhook-hub-onboarding-token
GOOGLE_VISION_PROJECT_ID=replace-with-billing-enabled-google-cloud-project-id
GOOGLE_VISION_CLIENT_EMAIL=service-account@pushingcapintegrations.iam.gserviceaccount.com
GOOGLE_VISION_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nreplace-me\n-----END PRIVATE KEY-----\n"
```

`PUSHINGSECURITY_MASTER_KEY` encrypts stored provider secrets.
`PUSHINGSECURITY_SESSION_SECRET` signs operator sessions.
`MONGODB_URI` and `MONGODB_DB_NAME` move the control data onto Mongo instead of the local JSON dev store.
`PUSHINGCAP_PLATFORM_CONTACT_SYNC_*` turns on the Pushing Capital platform contact sync lane for public lead intake.
`PUSHINGCAP_PLATFORM_SERVICE_REQUEST_SYNC_*` turns on direct platform service-request shell creation from onboarding.
`HUBSPOT_PRIVATE_APP_TOKEN` lets the app fall back to direct HubSpot deal-shell creation when the platform service-request endpoint is not configured yet.
`PUSHINGCAP_WEBHOOK_HUB_*` mirrors onboarding jobs into the Cloudflare webhook hub at `webhooks.pushingcap.com` so DocuSign webhooks can provision against a public shared state store.
`GOOGLE_VISION_*` powers the driver-license OCR route. The project must have Vision enabled and billing turned on. If you want, those values can mirror the same service-account credentials used for Google Workspace as long as they point at a billing-enabled project.

## Document Template Provisioning

The legal packet can now be provisioned into DocuSign from the app workspace.

Run:

```bash
npm run provision:document-templates
```

This provisioning pass does all of the following:

- generates branded PDFs for the six Pushing Capital-authored legal forms
- downloads the official FCRA Summary of Rights PDF into the supporting packet
- generates the California Civil Code Section 1786.22 supporting notice PDF
- upserts the default signer directory into the Pushing Capital platform contact endpoint
- creates or updates the matching DocuSign templates by name
- stores the resolved template bindings, recipient-role contracts, field contracts, and signer profiles locally for reuse

Generated artifacts live under:

- `output/pdf/document-templates/generated`
- `output/pdf/document-templates/supporting`
- `output/pdf/document-templates/previews`

Provisioning state lives at:

- `.data/document-template-provisioning.json`

Current signer defaults:

- Ahmed Ismaeil, Chief Operating Officer, `amssi@pushingcap.com`
- David Berger, Chief Data Officer, `davidb@pushingcap.com`
- Emmanuel Haddad, CEO / Chief Executive Officer, `manny@pushingcap.com`

Template behavior:

- recipient roles stay generic for portability
- the company-side default signer is Ahmed Ismaeil
- rerunning provisioning updates existing DocuSign templates in place when the names already match
- each binding now preserves the programmatic DocuSign role and field contract alongside the template ID so send-time validation and platform sync use the same metadata
- the two notary-intended forms currently fall back to standard templates if DocuSign rejects template-level notary configuration

## Provider Scaffolds

The control plane resolves provider credentials with precedence `vault -> env -> missing`.
Keep live credentials in the encrypted vault when possible and use the env values as a local fallback.

### DocuSign

- auth model: Authorization Code or JWT readiness scaffold
- existing app registration assumed under `logistics@pushingcap.com`
- default auth base: `https://account-d.docusign.com`
- shared integration package: `@pushingcap/integrations/docusign`
- vault provider: `docusign`
- vault/env secret names:
  - always: `DOCUSIGN_CLIENT_ID`
  - Authorization Code: `DOCUSIGN_CLIENT_SECRET`
  - JWT: `DOCUSIGN_PRIVATE_KEY`
- env-only settings:
  - `DOCUSIGN_AUTH_MODEL`
  - `DOCUSIGN_AUTH_BASE_URL`
  - `DOCUSIGN_OAUTH_SCOPES`
  - `DOCUSIGN_USER_ID`
  - `DOCUSIGN_KEYPAIR_ID`
  - `DOCUSIGN_ACCOUNT_ID`
  - `DOCUSIGN_MUTUAL_NDA_TEMPLATE_ID`
  - `DOCUSIGN_MUTUAL_NDA_MANAGER_EMAIL`
- local consent landing page: `/docusign/consent-complete`
- readiness route: `/api/control/integrations/docusign/status`
- template list route: `/api/control/integrations/docusign/templates`
- template detail route: `/api/control/integrations/docusign/templates/:templateId`
- account selection:
  - set `DOCUSIGN_ACCOUNT_ID` to pin the integration to a specific DocuSign account
  - if omitted, the shared layer falls back to the default DocuSign account for the authenticated user
- portability note:
  - app routes are thin wrappers over the shared workspace package so the provider logic can move into another Pushing Capital service with minimal rewrite
- the public onboarding flow can pin the live Mutual NDA with `DOCUSIGN_MUTUAL_NDA_TEMPLATE_ID`, while still falling back to an exact-name search for `Mutual NDA` when the template is moved between accounts
- the Mutual NDA send path now carries an explicit contract for recipient roles, required field labels, and hidden custom fields so A relations management platform write-back stays aligned with the live DocuSign template

### Google Workspace Admin SDK

- auth model: service account delegation scaffold only
- default project target: `pushingcapintegrations`
- delegated admin email expected via `GOOGLE_WORKSPACE_DELEGATED_ADMIN_EMAIL`
- primary domain defaults to `pushingcap.com` and can be overridden with `GOOGLE_WORKSPACE_PRIMARY_DOMAIN`
- Workspace user creation can stay on `/`, while managed Chrome can target a dedicated onboarding org unit such as `/PushingCapitalEmployees`
- vault provider: `google-workspace`
- vault/env secret names:
  - `GOOGLE_WORKSPACE_CLIENT_EMAIL`
  - `GOOGLE_WORKSPACE_PRIVATE_KEY`
- env settings:
  - `GOOGLE_WORKSPACE_PROJECT_ID`
  - `GOOGLE_WORKSPACE_DELEGATED_ADMIN_EMAIL`
  - `GOOGLE_WORKSPACE_PRIMARY_DOMAIN`
  - `GOOGLE_WORKSPACE_DEFAULT_ORG_UNIT_PATH`
  - `GOOGLE_WORKSPACE_CUSTOMER_ID`
  - `GOOGLE_WORKSPACE_SCOPES`
  - `GOOGLE_WORKSPACE_ORG_UNIT_SCOPES`
  - `GOOGLE_CHROME_POLICY_SCOPES`
  - `GOOGLE_CHROME_POLICY_ORG_UNIT_PATH`
- readiness route: `/api/control/integrations/google-workspace/status`
- if you want Chrome policy automation after DocuSign completion, authorize the same service account for both:
  - `https://www.googleapis.com/auth/admin.directory.orgunit`
  - `https://www.googleapis.com/auth/chrome.management.policy`

These provider modules now cover:

- configuration resolution and status checks
- live DocuSign JWT token bootstrapping
- DocuSign template listing plus normalized template/field reads
- DocuSign template-envelope sends for the public Mutual NDA intake flow
- Google Workspace user lookup and user provisioning for signed onboarding jobs

They still do not implement OAuth callbacks, token persistence, or automated Google Voice number selection/forwarding from the Voice admin console. The webhook hub can now assign Google Voice licenses through the Licensing API.

## Local Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The customer homepage lives at `/`.
The employee login lives at `/login`.
The employee dashboard lives at `/dashboard`.

## Current Surfaces

- `/`
  Public customer homepage
- `/onboard`
  Public lifecycle-intake page with audience split, finance/automotive split, Google Vision ID parsing, portable contact sync, service-request shell creation, and DocuSign/Notary-aware routing metadata
- `/login`
  Employee sign-in
- `/dashboard`
  Employee vault, playbooks, browser bundles, and run queue
- `/api/control/*`
  Internal JSON endpoints used by the console UI
- `/api/control/integrations/*/status`
  Operator-only readiness probes for DocuSign and Google Workspace configuration
- `/api/control/integrations/docusign/templates`
  Operator-only DocuSign template listing
- `/api/control/integrations/docusign/templates/:templateId`
  Operator-only DocuSign template detail, recipient roles, and normalized tab fields
- `/api/control/document-templates`
  Operator-only list of the Pushing Capital legal document templates and their internal IDs
- `/api/control/document-templates/:templateId`
  Operator-only detail view for a single legal template body, signer roles, attachments, and notes
- `/api/auth/session`
  Session status endpoint
- `/api/document-ai/parse-license`
  Google Vision driver-license OCR endpoint
- `/api/webhooks/stripe`
  Stripe webhook scaffold endpoint
- `/api/webhooks/docusign`
  DocuSign completion webhook for signed onboarding jobs and Google Workspace provisioning

## Public Intake

The first automation step now lives at `/onboard`.

Visible customer fields:

- intake audience
- service family
- first name
- last name
- phone number
- email address
- driver license image

The onboarding route now does all of the following:

- captures browser and campaign metadata
- classifies the intake into a lane
- recommends the next login and workflow
- reserves DocuSign Notary as a fallback path
- creates the first service-request shell through the platform endpoint or HubSpot fallback
- mirrors the lifecycle job into the webhook hub

Stored submit-time context currently includes:

- submission timestamp
- source label
- page URL and page path
- referrer
- user agent
- IP address
- request ID
- browser language and time zone
- screen size and viewport size
- geo headers for country, region, and city when present
- UTM source, medium, campaign, term, and content
- `gclid`
- `fbclid`

Contact sync behavior:

- the intake can send the lead to the Pushing Capital platform contact upsert endpoint using `PUSHINGCAP_PLATFORM_CONTACT_SYNC_URL`
- if the platform sync URL is missing, the lead still lands locally and the job stays reviewable
- the intake page and stored job schema stay the same either way, which keeps the flow portable if you move this integration into another app or service later
- after the Mutual NDA envelope is created, the onboarding route now mirrors the updated job back into the Cloudflare webhook hub so the public webhook has the live template and envelope identifiers before the signer completes
- when `PUSHINGCAP_WEBHOOK_HUB_ONBOARDING_TOKEN` is configured, each new onboarding job is also mirrored to `https://webhooks.pushingcap.com/api/onboarding/jobs` so the public DocuSign webhook can resolve the same applicant data
- the onboarding route now blocks the outbound Mutual NDA send if that Cloudflare mirror step fails, so DocuSign completion never outruns the public webhook state

Mutual NDA behavior:

- each fresh onboarding submission now attempts to send the live DocuSign `Mutual NDA` template automatically
- the envelope is sent only after the onboarding job is mirrored into the Cloudflare webhook hub
- the DocuSign envelope carries `onboardingJobId` and `jobId` custom fields so the existing webhook automation can match the signed envelope back to the applicant
- the default template mapping is:
  - `Manager` -> Ahmed Ismaeil (`amssi@pushingcap.com`) unless `DOCUSIGN_MUTUAL_NDA_MANAGER_EMAIL` overrides it
  - `Client` -> the applicant from the onboarding form, preferring the legal name extracted from the driver license when available
- the onboarding job moves to `awaiting-signature` after the Mutual NDA is sent and records the envelope receipt locally

Document template IDs now available:

- `pc-w2-employment-offer-compliance-acknowledgment`
- `pc-employee-confidentiality-data-security-agreement`
- `pc-background-check-disclosure-authorization`
- `pc-california-consumer-credit-report-addendum`
- `pc-user-client-authorization-written-instructions-esign-consent`
- `pc-limited-motor-vehicle-poa-dmv-record-authorization`

## Signed-Onboarding Automation

The signed-onboarding Google automation now works like this:

- DocuSign posts a signed or completed webhook to `/api/webhooks/docusign`
- the route matches the onboarding job by custom-field job ID or the non-company signer email
- the automation derives the username from the driver-license legal name:
  - first legal name + last-name initial
  - fallback: first legal name + last-name initial + last two digits of birth year
- the temporary password follows the requested onboarding rule:
  - legal last name + full birth year + `$`
- the created Google Workspace user is forced to change that password at first login
- the automation can target a dedicated managed Chrome org unit instead of the domain root
- if the Chrome policy scope is authorized, the worker applies:
  - the Claude in Chrome forced install
  - managed bookmarks for Experian, Equifax, TransUnion, QuickBooks, myFICO, Credit Karma, and Pushing Capital
  - startup URLs and homepage settings for the employee’s first Chrome sign-in
- if the Google Voice licensing scope is authorized, the worker assigns the configured Google Voice SKU after browser setup
- if the employee already has a Google Voice number on their Workspace profile, the worker records it as already assigned
- if the employee only receives the Voice license, the job moves into a Voice-assignment holding stage because Google still documents number selection in the admin console
- if the org-unit or Chrome policy scopes are missing, the Workspace user still gets created and the browser step records a retryable failure instead of blocking the identity

Webhook security:

- set `DOCUSIGN_CONNECT_HMAC_SECRET` if you want HMAC verification
- or set `DOCUSIGN_WEBHOOK_BEARER_TOKEN` as a simpler fallback gate
- local development allows unsigned webhook calls when neither is set

The seeded onboarding browser bundle includes:

- the Claude in Chrome extension
- bookmarks for Experian, Equifax, TransUnion, QuickBooks, myFICO, Credit Karma, and Pushing Capital

## Next Steps

- connect the Mongo bridge to your real collections and permissions
- add live OAuth/token flows for the provider scaffolds once credentials are finalized
- connect the Chrome Enterprise policy writer and Google Voice assignment workflow
- add operator roles and per-run audit trails
- wire Vercel deployment once account access is restored

## Verification

```bash
npm run build
```

Build verification is the current deployment gate until the right Vercel account access is back.
