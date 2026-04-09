# P Master Systems Brief

Date: 2026-04-03

This is the master cheat sheet for `P`.

It bundles:
- auth
- notebooks
- NotebookLM API
- Gemini Enterprise API
- BigQuery
- GCS
- Cloud SQL / Firestore
- VMs
- live PCRM runtime facts
- action registry and promotion model

## 1. System Model
- live `crm-app-vm-20260313` = current staging and semantic recovery source
- `pc-identity-platform` = target canonical database and control-plane architecture
- NotebookLM + BigQuery + GCS + `pc-ecosystem-corpus-processor-01` = remote promotion/control layer

Current strategy:
- learn from live PCRM
- preserve what matters
- promote into the cleaner target estate
- do not treat the current messy runtime as final truth

## 2. Auth
### NotebookLM and Gemini Enterprise
Use Manny's licensed bearer token:
```bash
gcloud auth login manny@pushingcap.com
export NOTEBOOKLM_TOKEN="$(gcloud auth print-access-token)"
```
Use this path for:
- NotebookLM read/write
- Gemini Enterprise search/answer

### Broad GCP read/write
Use the `P` service account:
- service account: `p-pcrm-cloudsdk@brain-481809.iam.gserviceaccount.com`
- Secret Manager secret: `p-pcrm-cloudsdk-json-20260403`

Fetch and export:
```bash
gcloud secrets versions access latest --secret=p-pcrm-cloudsdk-json-20260403 > ~/p-pcrm-cloudsdk-20260403.json
chmod 600 ~/p-pcrm-cloudsdk-20260403.json
export GOOGLE_APPLICATION_CREDENTIALS=~/p-pcrm-cloudsdk-20260403.json
export GOOGLE_CLOUD_PROJECT=brain-481809
export GOOGLE_CLOUD_LOCATION=us-central1
```

## 3. Project
- project id: `brain-481809`
- project number: `660085746842`

## 4. Notebooks
### P primary
- `P Core Brain 2026-04-02` : `736ddaaf-2b88-4057-8c18-f4cf777a9294`
- `P Runtime Channels And Actions 2026-04-02` : `46fd9eab-e871-41b8-ab06-e553d37c472d`

### Adjacent
- `Manny Mac Studio Agentic Research...` : `bbe200fc-3810-4475-99b7-f1383fa7adfb`
- `Mac Studio Agentic Ecosystem Corpus` : `ae7a85ae-3574-46f4-98e0-0e84eabb56b7`
- `PCRM VM GCP Control-Plane Atlas` : `e25d4029-8ec3-40c6-ae30-4abe6f892520`

## 5. NotebookLM API
Base: `https://us-discoveryengine.googleapis.com`

## 6. Gemini Enterprise API
Engine id: `gemini-enterprise-1767472367566`

## 7. Remote Source-Of-Truth Surfaces
### BigQuery
Core control dataset: `brain-481809:agentic_ecosystem_v1`
Key tables: `action_contract_registry`, `access_point_inventory`, `source_registry`, `source_chunks`, `entity_links`, `worker_surface_inventory`, `p_runtime_inventory`, `platform_runtime_inventory`, `notebook_sync_runs`, `remote_prep_bundle_registry`

### GCS
- `gs://pc-bootstrap-imports-brain-481809/agentic-ecosystem-prep/current`
- `gs://pc-raw-object-evidence-brain-481809`

## 8. VMs
- `crm-app-vm-20260313` (10.128.0.16) - live PCRM runtime
- `crm-prod-1` (10.128.0.2)
- `pc-ecosystem-corpus-processor-01` (10.128.0.20)
- `pc-recovery-executor-01` (10.128.0.19)

## 9. Database Estate
Bootstrap bridge: `pc_identity_platform` (instance: `pc-gold`)
Instances:
- `pc-canonical-core-pg` (pc_registry_core, pc_parties_core, pc_documents_core...)
- `pc-platform-adjacent-pg` (pc_platform_projection_sync...)
- `pc-worker-runtime-pg` (pc_worker_registry...)
- `pc-network-schematics` (Firestore Enterprise)

## 10. Live PCRM Runtime Facts
Frontend: `https://platform.pushingcap.com`
VM: `crm-app-vm-20260313`
Services: `nginx`, `pcrm-api`, `pcrm-orchestration`, `pcrm-web`, `p-live-preview-proxy`

## 11. Action / Execution Layer
Registry table: `brain-481809:agentic_ecosystem_v1.action_contract_registry`
Meaning: The live runtime contains a real hidden backend control surface and enough normalized action inventory to start building a governed P execution gateway.

## 12. Worker Next-Step Protocol
Use A relations management platform as the teaching surface.

Meaning:
- PCRM is not just storage. It is the route map that trains workers.
- Pipelines teach lane identity.
- Stages teach sequence.
- `owner_worker_profile` teaches responsibility.
- tickets, callbacks, and memory writeback teach recovery and completion behavior.

Decision rule:
- use BigQuery first for structured truth
- use NotebookLM second for deep context and precedent
- then move the work forward in A relations management platform

### BigQuery = queryable truth
Use BigQuery to answer:
- what lane this work belongs to
- what workers touch this lane
- whether similar tasks already exist
- whether the work is active, stale, blocked, or missing writeback

Primary tables:
- `brain-481809.agentic_ecosystem_v1.worker_surface_inventory`
- `brain-481809.agentic_ecosystem_v1.source_registry`
- `brain-481809.agentic_ecosystem_v1.source_chunks`
- `brain-481809.worker_pulse_memory_v1.task_ledger`
- `brain-481809.notebooklm_curated_v1.notebook_registry`
- `brain-481809.notebooklm_curated_v1.notebook_source_bundles`

Use BigQuery first when the question is:
- "what is happening now?"
- "which worker owns this?"
- "which route already exists?"
- "what failed last time?"
- "what evidence is repeated enough to become a stage?"

### NotebookLM = long-context reasoning
Use NotebookLM to answer:
- why a route exists
- what architectural precedent to follow
- what a worker or system was supposed to do
- what business meaning a lane has

Notebook routing:
- `e25d4029-8ec3-40c6-ae30-4abe6f892520` = control-plane, PCRM, VM, GCP, data estate
- `736ddaaf-2b88-4057-8c18-f4cf777a9294` = P core brain, doctrine, lexicon
- `46fd9eab-e871-41b8-ab06-e553d37c472d` = runtime channels, bridges, actions

Use NotebookLM second when the question is:
- "what pattern should I follow?"
- "what does this lane mean to the business?"
- "what should be remembered after this route completes?"

### Next-step algorithm
For every task or ticket:
1. Read the A relations management platform record first.
   - get `pc_pipeline`, `pc_pipeline_stage`, `owner_worker_profile`, `notes`, `linked_state_id`, and related task or ticket context
2. Query BigQuery for the structured lane.
   - find similar workflow/stage evidence
   - find relevant worker surfaces
   - find historical failures, callbacks, or memory notes
3. Read NotebookLM only for targeted context.
   - use the smallest notebook needed
   - prefer control-plane atlas for infrastructure and route design
   - prefer P core brain for doctrine and business interpretation
4. Decide the next A relations management platform move.
   - if intent is still unclear: route to intake/discovery
   - if documents or proofs are missing: route to dossier/document collection
   - if schema or record creation is needed: route to record build/control plane
   - if workers or APIs must fire: route to dispatch/activation
   - if acknowledgement or reply is pending: route to callback/follow-up
   - if durable learning is missing: route to memory writeback
   - if errors, mismatches, or listener failures appear: route to exception/repair
5. Write the result back into A relations management platform.
   - update pipeline stage, task/ticket contract, ownership, and notes
6. Promote durable learning.
   - write the final lesson into NotebookLM when the route teaches a reusable pattern
   - write runtime evidence into BigQuery when the route generates structured operational facts

### Anti-patterns
Do not:
- start with NotebookLM when the answer is really a count, owner, stage, or status question
- leave work in generic backlog if the route is now obvious
- create a new worker before checking if the route can be taught through a better pipeline/stage map
- treat memory writeback as optional after a novel route, blocker, or recovery

### Golden heuristic
If the next step can be expressed as a better stage transition in A relations management platform, do that first.
If the answer needs evidence, query BigQuery first.
If the answer needs meaning or precedent, consult NotebookLM second.

## 13. Quick Commands
```bash
bq ls --project_id=brain-481809
gcloud compute instances list --project=brain-481809
gcloud sql instances list --project=brain-481809
gcloud storage ls gs://pc-bootstrap-imports-brain-481809
```

## 14. SSH IAP Shortcuts (Your Hands)
You have immediate execute_local_shell access to the remote GCP instances using these pre-configured SSH aliases via IAP:
- **`ssh gce-crm-app-iap`** -> Jumps into the live `crm-app-vm-20260313` staging runtime.
- **`ssh gce-crm-prod-iap`** -> Jumps into `crm-prod-1`.
- **`ssh gce-ecosystem-processor-iap`** -> Jumps into `pc-ecosystem-corpus-processor-01`.
- **`ssh gce-recovery-executor-iap`** -> Jumps into `pc-recovery-executor-01`.

Example usage for seamless cluster management:
`execute_local_shell` with command `"ssh gce-crm-app-iap 'ls -al /var/www'"`
