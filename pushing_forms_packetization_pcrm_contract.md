# PushingForms Packetization PCRM Contract

This is the canonical build for high-volume form operations.

The job is not just to collect a form.
The job is to:

1. download or generate the form
2. know every field on the form
3. know exactly where each field belongs in PCRM
4. know the character budget for each field
5. know whether the signature is wet, digital, or notary
6. know what to do when the form is incomplete, too long, or mismatched

## Core Idea

`PushingForms` should become a packetization engine.

Every form must be converted into a structured packet contract before it is allowed into high-volume automation.

That packet contract is the source of truth for:

- document source
- field geometry
- field meaning
- character limits
- signature requirements
- PCRM placement
- gating rules

## The Six Required Layers

### 1. Form Template Registry

Every form gets a template record with:

- `template_key`
- `template_name`
- `document_source_type`
  - `downloaded_pdf`
  - `generated_pdf`
  - `docusign_template`
  - `uploaded_scan`
- `provider`
  - `internal`
  - `docusign`
  - `wet`
  - `notary`
- `source_document_paths`
- `version`

Without a registered template, no high-volume packet run should start.

### 2. Field Placement Registry

Every field on the form needs a contract:

- field id
- label
- source type
- page number
- x / y placement or anchor string
- tab type
- required or optional
- max character count
- overflow rule
- PCRM destination

This is the missing bridge between “we have a form” and “we can safely write it into PCRM.”

### 3. Signature Registry

Every signature slot needs a classification:

- `wet`
- `digital`
- `notary`

And each one needs:

- signer role
- routing order
- evidence expectations
- PCRM writeback targets

Examples:

- wet signature:
  - requires scanned completion artifact
  - requires signed-at proof or upload receipt
- digital signature:
  - can use provider envelope / tab completion metadata
- notary:
  - requires notary-ready gate
  - requires notary completion evidence

### 4. PCRM Placement Registry

Every field must say exactly where it lands.

Minimum placement contract:

- target object
  - `contact`
  - `company`
  - `deal`
  - `ticket`
  - `task`
  - `service_request`
  - `custom_object`
- target property
- write mode
  - `replace`
  - `append`
  - `merge_json`
  - `create_association`
- whether it is primary truth or supporting evidence

No field should be “figured out later.”

### 5. Formula and Gate Layer

Forms are not passive documents.
They are gated data packets.

Each packet needs gates like:

- missing required field
- character overflow
- invalid format
- missing signature
- wrong signature type
- notary required but notary artifact missing
- mismatch with existing PCRM truth

This is where `PushingFormulas` lives.

### 6. Completion Receipt

Every packet execution should produce a receipt:

- what was written
- what was skipped
- what overflowed
- what signature path was used
- what still needs follow-up
- which workflow should continue next

## The Working Pipeline

The live pipeline should be:

1. `Acquire form`
Download, generate, or import the document.

2. `Register template`
Confirm the form has a template contract.

3. `Resolve field values`
Pull values from intake, PCRM, formulas, OCR, or manual input.

4. `Validate field contracts`
Check required values, length, formatting, and signature readiness.

5. `Render or map`
Fill the provider template or prepare the wet-signature packet.

6. `Write to PCRM`
Store the same values in their exact canonical properties.

7. `Emit completion receipt`
Write packet metadata, signature mode, and gate status.

8. `Route next workflow step`
Move to signature, notary, review, payout hold, onboarding, or closeout.

## Non-Negotiables

- Every field needs a max character rule.
- Every field needs a PCRM destination.
- Every signature needs a type.
- Every form needs a provider classification.
- Every packet needs a receipt.
- Every overflow needs an explicit fallback rule.

## Existing Anchors

The current codebase already has the first pieces:

- service-request sync:
  - [/Users/emmanuelhaddad/projects/pushingsecurity-control/apps/pushing-capital-web/src/lib/platform-service-requests.ts](/Users/emmanuelhaddad/projects/pushingsecurity-control/apps/pushing-capital-web/src/lib/platform-service-requests.ts)
- template binding state:
  - [/Users/emmanuelhaddad/projects/pushingsecurity-control/apps/pushing-capital-web/src/lib/document-template-bindings.ts](/Users/emmanuelhaddad/projects/pushingsecurity-control/apps/pushing-capital-web/src/lib/document-template-bindings.ts)
- DocuSign field and recipient contracts:
  - [/Users/emmanuelhaddad/projects/pushingsecurity-control/apps/pushing-capital-web/src/lib/docusign/contracts.ts](/Users/emmanuelhaddad/projects/pushingsecurity-control/apps/pushing-capital-web/src/lib/docusign/contracts.ts)
- onboarding / routing types:
  - [/Users/emmanuelhaddad/projects/pushingsecurity-control/apps/pushing-capital-web/src/lib/control/types.ts](/Users/emmanuelhaddad/projects/pushingsecurity-control/apps/pushing-capital-web/src/lib/control/types.ts)
- internal forms lane:
  - [/Users/emmanuelhaddad/pc-data-platform/ui/internal-crm/web/src/pages/PushingFormsPage.tsx](/Users/emmanuelhaddad/pc-data-platform/ui/internal-crm/web/src/pages/PushingFormsPage.tsx)

## The Immediate Build

The next implementation layer is:

1. create a reusable form packet contract
2. register every form against that contract
3. enforce field length and signature rules before dispatch
4. write the same values into PCRM deterministically

That is the build we have to nail before we start pumping forms out at scale.
