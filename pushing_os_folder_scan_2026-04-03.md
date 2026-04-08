# PushingOS Folder Scan

Date: 2026-04-03

Notebook target:

- `control_plane_atlas`

## Summary

The scanned folders break into three distinct categories:

1. `concept surfaces`
2. `empty namespace shells`
3. `archival dataroom builds`

The strongest live concept work is in `PushingOS` and `PushingOS_Core`.
The `PushingDocuSignIngest` and `PushingDealContracts` folders currently exist as names without implementation.
The `PushingCapital_DataRoom_BUILD` folder is an archive and composer/build area for dataroom drafting rather than a live application.

## Folder Findings

### `PushingDocuSignIngest`

Path:

- `/Users/emmanuelhaddad/PushingDocuSignIngest`

Current state:

- empty folder
- no files
- no app scaffold
- no ingestion logic yet

Interpretation:

- namespace reserved
- likely intended future lane for DocuSign ingestion, signature handling, and contract packet intake
- currently not implementation-bearing

### `PushingDealContracts`

Path:

- `/Users/emmanuelhaddad/PushingDealContracts`

Current state:

- empty folder
- no files
- no contract templates or code present

Interpretation:

- namespace reserved
- likely intended future lane for deal-side contract logic
- currently not implementation-bearing

### `PushingOS`

Path:

- `/Users/emmanuelhaddad/PushingOS`

Key files:

- `/Users/emmanuelhaddad/PushingOS/index.html`
- `/Users/emmanuelhaddad/PushingOS/images/voice-ai.png`

What it is:

- a static concept page titled `PushingOS: Ambient Observer`
- a dark, cinematic voice/observer interface

Visible structure from the file:

- ambient full-screen video background
- blurred overlay
- central orb using `voice-ai.png`
- active/inactive indicator
- transcript feed on the right side
- button controls at the bottom
- header labeled `PushingCore`
- subtitle `AMBIENT OBSERVER MATRIX`

Interpretation:

- this is an early conversational/ambient-control concept for P rather than a production website
- it frames PushingOS as a listening, observing, transcript-driven interface
- it is useful as precedent for:
  - live voice UI
  - ambient operator presence
  - transcript/feed surfaces
  - active state signaling

### `PushingOS_Core`

Path:

- `/Users/emmanuelhaddad/PushingOS_Core`

Key files:

- `/Users/emmanuelhaddad/PushingOS_Core/src/App.jsx`
- `/Users/emmanuelhaddad/PushingOS_Core/src/index.css`
- `/Users/emmanuelhaddad/PushingOS_Core/src/App.css`
- `/Users/emmanuelhaddad/PushingOS_Core/package.json`

What it is:

- a Vite + React + ReactFlow concept app
- a visual truth-engine / formula-map interface

Core app identity:

- page title overlay: `The Truth Engine`
- explicit framing: “Everything is a formula. Nothing is hidden.”

What the node graph models:

- `Phase I: Base Rate Injection`
- `Variable: Vehicle Multiplier`
- `Variable: Route Friction`
- `Phase II: Seasonal Output`
- `Subcontractor Split Matrix`
- `The Emotional Coverage Protocol`

What this means:

- the app is modeling internal pricing and operational formulas
- especially transport, subcontractor split, margin, seasonal modifiers, and emotional-risk logic
- this is not a generic flowchart; it is an exposed pricing/decision architecture concept

Visual system:

- dark bronze / copper / parchment formula aesthetic
- ReactFlow graph
- animated dashed edges
- manifesto overlay
- formula nodes with highlighted outputs

Interpretation:

- this is one of the clearest local concept artifacts for `PushingFormulas`
- it supports the idea that Pushing Capital wants to expose, inspect, and gate operational truth through formulas
- it is valuable precedent for:
  - pricing calculators
  - inspections formula gates
  - transport margin maps
  - underwriting and readiness logic maps

### `PushingCapital_DataRoom_BUILD`

Path:

- `/Users/emmanuelhaddad/PushingCapital_DataRoom_BUILD`

Observed structure:

- timestamped build folders
- reconciliation folder
- dataroom draft folders
- input/composer pack folders

Examples:

- `20260204_000323__MACSTUDIO`
- `20260203_235857__MACSTUDIO`
- `RECONCILIATION__V1__20260204_011552`
- `DATAROOM_DRAFT_V1__20260204_030440`
- `DATAROOM_DRAFT_V2__20260204_122924`
- `INPUTS/COMPOSER_PACK_V2__IMAC24/SEED_DRAFT`

Interpretation:

- this is an archive/build lane for dataroom packaging
- likely useful for investor, diligence, internal record, or structured packet assembly
- it reads more like a composer/build workspace than a runtime application

## What Should Be Remembered

1. `PushingOS` is the ambient voice/listening concept.
2. `PushingOS_Core` is the formula/truth-engine concept.
3. `PushingDocuSignIngest` is currently an empty reserved shell.
4. `PushingDealContracts` is currently an empty reserved shell.
5. `PushingCapital_DataRoom_BUILD` is a dataroom build/archive workspace, not a live product surface.

## Architectural Meaning

These folders suggest a deeper split inside the Pushing Capital system:

- `ambient operator intelligence`
  - voice presence
  - transcript
  - live observer UI

- `truth engine / formulas`
  - exposed logic
  - gated calculations
  - pricing and margin maps

- `contract / signature future lanes`
  - DocuSign ingestion
  - deal contracts

- `dataroom composer lane`
  - archival build
  - diligence packet assembly

This makes the folder set useful as precedent even when some namespaces are still empty.

## Recommendation

Treat these folders in the notebook as:

- `concept artifact`
- `reserved namespace`
- `archive/composer lane`

Do not treat `PushingDocuSignIngest` or `PushingDealContracts` as implemented systems yet.
Do treat `PushingOS` and `PushingOS_Core` as meaningful concept evidence for live voice presence and formula-driven system logic.
