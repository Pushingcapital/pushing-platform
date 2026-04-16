# 🧠 PUSHING CAPITAL: NOTEBOOK LLM INGESTION BUNDLE (SAN REMO DR)

> **Compiled Context:** This bundle contains the core registries and the San Remo Dr Architecture Study. It serves to inform Notebook LLM of all database locations, worker assignments, topologies, and the 'Truth in Code' mandate for the 98-worker swarm.

---

## SOURCE ARTIFACT: SAN_REMO_DR_ARCHITECTURE_STUDY.md

# 🏛 SAN REMO DR ARCHITECTURE STUDY
**Date:** 2026-04-16
**Source:** Voice Memos (San Remo Dr 9-14)
**Transcribed by:** Antigravity (via Gemini 2.5 Pro)
**Status:** DRAFT | INGESTION READY

## 📋 EXECUTIVE SUMMARY
This study captures high-level architectural and philosophical mandates for the Pushing Capital swarm. The core objective is to "stand up" the entire corporation (approx. 65 applications) by orchestrating data, tools, and 98 parallel workers using a "Truth in Code" brand doctrine.

---

## 🎙 TRANSCRIPTIONS & SUMMARIES

### 📍 Memo: San Remo Dr 11 / 9 / 13 (Consolidated)
*Note: These memos contain identical instructions regarding the core orchestration plan.*

#### **Transcription Excerpts**
- "Record as much information of what you know about [tickets, tasks, inspections, triggers, workers, databases, machines, tools] inside the registries."
- "The goal of this exercise is to put all of our tools up so that everyone can see. Put your studies up, ingest it into Notebook LLM."
- "The brand of the company... is going to be language, or code. Truth in code."
- "Assign the tasks, the tickets, the workflows, and the pipelines to an individual worker that is willing to stand in their position for the purpose of the company."
- "Notebook LLM is going to give you your answers... give me a full answer for the whole team, all 98 of you, on exactly how long and how you're going to orchestrate the data."
- "The databases are going to be exactly where they need to be. Let the database tell you where."

#### **Key Instructions**
1.  **Inventory & Recording:** Document all assets into "the registries" without moving them yet.
2.  **Research & Topology:** Study data science and topology via Google/Internal docs to understand connectivity.
3.  **Notebook LLM Ingestion:** Feed all data (database location, type, size, use; product lists; role definitions) into Notebook LLM.
4.  **Orchestration:** The 98-worker swarm must define a timeline and method for lifting 65+ applications.
5.  **Data-Driven Placement:** Database locations must be determined by the orchestration plan itself.

---

### 📍 Memo: San Remo Dr 14
#### **Transcription Excerpts**
- "Do not try to attempt to do something that... is not defined within you."
- "Hook the program into GitHub and you would place the correct information with you, and then you would test to make sure that you've ingested this memory."
- "The schematics need to be aligned and perfect."
- "Look at the tickets and tasks and the properties and objectives that we've studied."
- "Inside Google AI, 3D... one of the applications that we have to stand up. It's exactly the same... same logic, different intent."

#### **Key Points**
1.  **Capability-First Development:** Systems should only attempt tasks defined within their core logic.
2.  **GitHub-Centric Memory:** Use GitHub for code/data adjustments and verify via testing/ingestion.
3.  **Schematic Alignment:** Ensure all architectural diagrams and properties are perfectly synchronized.
4.  **Reference Logic:** Use "Google AI 3D" logic as a template for upcoming application stand-ups.

---

### 📍 Memos: San Remo Dr 10 / 12
*Note: Brief tactical exchanges regarding physical/object positioning.*
- **Summary:** Confirmation of location/spotting. "Front" placement indicated for visibility.

---

## 🛠 NEXT STEPS FOR SWARM
1.  **[ ]** Finalize the "First Pixel" (pushingSecurity).
2.  **[ ]** Initialize the `registry` updates based on current machine/worker state.
3.  **[ ]** Prepare the `Notebook LLM` bundle for ingestion.
4.  **[ ]** Connect the current session memory back to GitHub as "Truth in Code."


---

## SOURCE ARTIFACT: worker-parallel-registry.json

```json
{
  "version": "2026.04.15",
  "sourceControl": "github",
  "registryPath": "src/data/worker-parallel-registry.json",
  "updatedAt": "2026-04-15T06:22:00Z",
  "defaultRepo": "pushingcapital/pushing-platform",
  "defaultBranch": "main",
  "workers": [
    {
      "id": "wrk-001",
      "label": "Antigravity Core",
      "machineId": "ag-ts-emmanuels-mac-studio-1",
      "status": "active",
      "runtime": "Gemini CLI + tmux",
      "parallelLane": "frontend-cockpit",
      "github": { "repo": "pushingcapital/pushing-platform", "branch": "main" },
      "capabilities": ["codegen", "orchestration", "terminal-control"],
      "fileScopes": [
        "projects/pushingcap-web-v2/src/app/machine-topology/page.tsx",
        "projects/pushingcap-web-v2/src/app/api/machine-topology/session/route.ts",
        "projects/pushingcap-web-v2/src/data/machine-topology-registry.json"
      ]
    },
    {
      "id": "wrk-002",
      "label": "P Brain",
      "machineId": "ag-ts-pc-orchestrator-vm",
      "status": "active",
      "runtime": "Node.js",
      "parallelLane": "intent-routing",
      "github": { "repo": "pushingcapital/pushing-platform", "branch": "main" },
      "capabilities": ["nl-to-sql", "memory-routing", "registry-sync"],
      "fileScopes": [
        "projects/pushingcap-web-v2/src/app/api/p/route.ts",
        "projects/pushingcap-web-v2/src/app/api/registry/route.ts",
        "projects/pushingcap-web-v2/src/lib/registry-gold.ts"
      ]
    },
    {
      "id": "wrk-003",
      "label": "BQ Relay Server",
      "machineId": "ag-ts-emmanuels-mac-studio-1",
      "status": "active",
      "runtime": "Node.js",
      "parallelLane": "data-plane",
      "github": { "repo": "pushingcapital/pushing-platform", "branch": "main" },
      "capabilities": ["bigquery", "sql-proxy", "catalog-read"],
      "fileScopes": [
        "projects/pushingcap-web-v2/src/app/api/p/bq/route.ts",
        "projects/pushingcap-web-v2/src/app/databases/page.tsx",
        "projects/pushingcap-web-v2/src/app/api/telemetry/live/route.ts"
      ]
    },
    {
      "id": "wrk-004",
      "label": "Fleet Terminal MCP",
      "machineId": "ag-ts-emmanuels-mac-studio-1",
      "status": "active",
      "runtime": "Node.js MCP",
      "parallelLane": "machine-control",
      "github": { "repo": "pushingcapital/pushing-platform", "branch": "main" },
      "capabilities": ["ssh-fanout", "session-control", "fleet-sync"],
      "fileScopes": [
        "projects/pushingcap-web-v2/src/app/api/machine-topology/route.ts",
        "projects/pushingcap-web-v2/src/app/api/machine-topology/exec/route.ts",
        "projects/pushingcap-web-v2/src/app/api/machines/mesh/route.ts"
      ]
    },
    {
      "id": "wrk-005",
      "label": "Gemini CLI (iMac)",
      "machineId": "ag-ts-emmanuels-imac-1",
      "status": "active",
      "runtime": "Gemini CLI",
      "parallelLane": "rapid-implementation",
      "github": { "repo": "pushingcapital/pushing-platform", "branch": "main" },
      "capabilities": ["prototype", "code-review", "terminal-control"],
      "fileScopes": [
        "projects/pushingcap-web-v2/src/app/a2a-control-panel/page.tsx",
        "projects/pushingcap-web-v2/src/app/api/swarm/dispatch/route.ts",
        "projects/pushingcap-web-v2/src/app/api/worker/dispatch/route.ts"
      ]
    },
    {
      "id": "wrk-006",
      "label": "PCRM API Server",
      "machineId": "ag-ts-emmanuels-imac-1",
      "status": "idle",
      "runtime": "Python FastAPI",
      "parallelLane": "crm-backend",
      "github": { "repo": "pushingcapital/pushing-platform", "branch": "main" },
      "capabilities": ["crm-sync", "contacts", "pipeline-api"],
      "fileScopes": [
        "projects/pushingcap-web-v2/src/app/api/machines/route.ts",
        "projects/pushingcap-web-v2/src/app/api/cloud/services/route.ts",
        "projects/pushingcap-web-v2/src/app/api/telemetry/live/route.ts"
      ]
    },
    {
      "id": "wrk-007",
      "label": "Render Pipeline",
      "machineId": "ag-gce-pc-platform-server-iap",
      "status": "active",
      "runtime": "Node.js",
      "parallelLane": "asset-generation",
      "github": { "repo": "pushingcapital/pushing-platform", "branch": "main" },
      "capabilities": ["asset-build", "batch-jobs", "queue-processing"],
      "fileScopes": [
        "projects/pushingcap-web-v2/src/app/asset-studio/forms/deliverables/page.tsx",
        "projects/pushingcap-web-v2/src/app/asset-studio/forms/registry/page.tsx",
        "projects/pushingcap-web-v2/src/app/api/registry/route.ts"
      ]
    },
    {
      "id": "wrk-008",
      "label": "Field Ops Agent",
      "machineId": "ag-gce-pc-comm-hub-01-iap",
      "status": "active",
      "runtime": "Node.js",
      "parallelLane": "field-intake",
      "github": { "repo": "pushingcapital/pushing-platform", "branch": "main" },
      "capabilities": ["intake", "work-orders", "notifications"],
      "fileScopes": [
        "projects/pushingcap-web-v2/src/app/a2a-control-panel/page.tsx",
        "projects/pushingcap-web-v2/src/app/api/p/route.ts",
        "projects/pushingcap-web-v2/src/app/api/swarm/dispatch/route.ts"
      ]
    },
    {
      "id": "wrk-009",
      "label": "Windows Compliance",
      "machineId": "ag-gce-crm-app-vm-20260313-iap",
      "status": "idle",
      "runtime": "Node.js",
      "parallelLane": "compliance-tests",
      "github": { "repo": "pushingcapital/pushing-platform", "branch": "main" },
      "capabilities": ["cross-platform", "hardening", "qa-checks"],
      "fileScopes": [
        "projects/pushingcap-web-v2/src/app/api/machine-topology/session/route.ts",
        "projects/pushingcap-web-v2/src/app/api/machine-topology/exec/route.ts",
        "projects/pushingcap-web-v2/src/app/api/machine-topology/route.ts"
      ]
    },
    {
      "id": "wrk-010",
      "label": "Docker Orchestrator",
      "machineId": "ag-gce-pc-orchestrator-vm-iap",
      "status": "active",
      "runtime": "Docker + Bash",
      "parallelLane": "infrastructure",
      "github": { "repo": "pushingcapital/pushing-platform", "branch": "main" },
      "capabilities": ["deploy", "runtime-control", "gcloud-ops"],
      "fileScopes": [
        "projects/pushingcap-web-v2/src/app/api/cloud/services/route.ts",
        "projects/pushingcap-web-v2/src/app/api/machines/route.ts",
        "projects/pushingcap-web-v2/src/app/api/telemetry/live/route.ts"
      ]
    },
    {
      "id": "wrk-011",
      "label": "Postgres Guardian",
      "machineId": "ag-gce-crm-prod-1-iap",
      "status": "active",
      "runtime": "Postgres + Docker",
      "parallelLane": "database-integrity",
      "github": { "repo": "pushingcapital/pushing-platform", "branch": "main" },
      "capabilities": ["db-admin", "migration", "backup"],
      "fileScopes": [
        "projects/pushingcap-web-v2/src/app/databases/page.tsx",
        "projects/pushingcap-web-v2/src/app/api/p/bq/route.ts",
        "projects/pushingcap-web-v2/src/app/api/p/route.ts"
      ]
    },
    {
      "id": "wrk-012",
      "label": "Voice Intelligence",
      "machineId": "ag-gce-pc-voice-intel-01-iap",
      "status": "active",
      "runtime": "Node.js",
      "parallelLane": "voice-routing",
      "github": { "repo": "pushingcapital/pushing-platform", "branch": "main" },
      "capabilities": ["voice-ai", "webhooks", "event-routing"],
      "fileScopes": [
        "projects/pushingcap-web-v2/src/app/api/swarm/dispatch/route.ts",
        "projects/pushingcap-web-v2/src/app/api/p/route.ts",
        "projects/pushingcap-web-v2/src/app/api/registry/route.ts"
      ]
    },
    {
      "id": "wrk-013",
      "label": "Telecom Pipeline",
      "machineId": "ag-gce-pc-comm-hub-01-iap",
      "status": "active",
      "runtime": "Cloudflare Workers",
      "parallelLane": "telecom-ingest",
      "github": { "repo": "pushingcapital/pushing-platform", "branch": "main" },
      "capabilities": ["sms-ingest", "voice-ingest", "crm-sync"],
      "fileScopes": [
        "projects/pushingcap-web-v2/src/app/api/p/route.ts",
        "projects/pushingcap-web-v2/src/app/api/registry/route.ts",
        "projects/pushingcap-web-v2/src/app/a2a-control-panel/page.tsx"
      ]
    },
    {
      "id": "wrk-014",
      "label": "Emilia MacBook Worker",
      "machineId": "ag-ts-emilias-macbook-pro-2",
      "status": "active",
      "runtime": "Node.js + Python3",
      "parallelLane": "burst-compute",
      "github": { "repo": "pushingcapital/pushing-platform", "branch": "main" },
      "capabilities": ["terminal-control", "remote-build", "parallel-workers"],
      "fileScopes": [
        "projects/pushingcap-web-v2/src/data/machine-topology-registry.json",
        "projects/pushingcap-web-v2/src/data/worker-parallel-registry.json",
        "projects/pushingcap-web-v2/src/app/machine-topology/page.tsx"
      ]
    }
  ]
}

```

---

## SOURCE ARTIFACT: machine-topology-registry.json

```json
{
  "version": "2026.04.15",
  "project": "brain-481809",
  "sourceControl": "github",
  "registryPath": "src/data/machine-topology-registry.json",
  "updatedAt": "2026-04-15T06:26:00Z",
  "machines": [
    {
      "id": "ag-ts-emmanuels-mac-studio-1",
      "label": "Emmanuels-Mac-Studio.local",
      "class": "workstation",
      "status": "online",
      "parallelSlots": 14,
      "tools": [
        "node",
        "npm",
        "python3",
        "gemini",
        "tmux",
        "ssh"
      ],
      "capabilities": [
        "terminal-control",
        "parallel-agent-fanout",
        "mcp-control-plane",
        "web-orchestration"
      ],
      "controlPlane": "fleet-terminal-mcp",
      "notes": "Primary workstation \u2014 Apple Silicon, 14 cores confirmed live"
    },
    {
      "id": "ag-ts-emmanuels-imac-1",
      "label": "24imac.local",
      "class": "workstation",
      "status": "online",
      "parallelSlots": 8,
      "tools": [
        "node",
        "npm",
        "python3",
        "gemini",
        "tmux",
        "ssh"
      ],
      "capabilities": [
        "terminal-control",
        "parallel-workers",
        "frontend-builds"
      ],
      "controlPlane": "fleet-terminal-mcp",
      "notes": "iMac 24in \u2014 8 cores confirmed live"
    },
    {
      "id": "ag-ts-emilias-macbook-pro-2",
      "label": "Emilias-MacBook-Pro-3.local",
      "class": "workstation",
      "status": "online",
      "parallelSlots": 4,
      "tools": [
        "node",
        "npm",
        "python3",
        "ssh"
      ],
      "capabilities": [
        "terminal-control",
        "parallel-workers",
        "remote-build"
      ],
      "controlPlane": "fleet-terminal-mcp",
      "notes": "Emilia MacBook Pro \u2014 x86_64, 16 cores confirmed live, Tailscale mesh"
    },
    {
      "id": "ag-ts-pc-orchestrator-vm",
      "label": "pc-orchestrator-vm",
      "class": "orchestrator-vm",
      "status": "online",
      "parallelSlots": 2,
      "tools": [
        "node",
        "npm",
        "python3",
        "gemini",
        "tmux",
        "ssh"
      ],
      "capabilities": [
        "orchestration-daemon",
        "command-routing",
        "task-execution"
      ],
      "controlPlane": "fleet-terminal-mcp",
      "notes": "Orchestrator VM \u2014 2 cores, Node v18.20.4 confirmed live"
    },
    {
      "id": "ag-gce-crm-app-vm-20260313-iap",
      "label": "crm-app-vm-20260313",
      "class": "gce-vm",
      "status": "online",
      "parallelSlots": 2,
      "tools": [
        "node",
        "npm",
        "python3",
        "gemini",
        "tmux",
        "ssh",
        "gcloud"
      ],
      "capabilities": [
        "app-runtime",
        "crm-staging",
        "remote-terminal"
      ],
      "controlPlane": "iap+fleet-terminal-mcp",
      "notes": "CRM staging application VM \u2014 2 cores confirmed live"
    },
    {
      "id": "ag-gce-crm-prod-1-iap",
      "label": "crm-prod-1",
      "class": "gce-vm",
      "status": "online",
      "parallelSlots": 2,
      "tools": [
        "node",
        "npm",
        "python3",
        "gemini",
        "tmux",
        "ssh",
        "gcloud"
      ],
      "capabilities": [
        "app-runtime",
        "crm-production",
        "remote-terminal"
      ],
      "controlPlane": "iap+fleet-terminal-mcp",
      "notes": "CRM production VM \u2014 2 cores confirmed live"
    },
    {
      "id": "ag-gce-pc-orchestrator-vm-iap",
      "label": "pc-orchestrator-vm",
      "class": "gce-vm",
      "status": "online",
      "parallelSlots": 2,
      "tools": [
        "node",
        "npm",
        "python3",
        "gemini",
        "tmux",
        "ssh",
        "gcloud"
      ],
      "capabilities": [
        "orchestrator-backup",
        "iap-terminal",
        "parallel-control"
      ],
      "controlPlane": "iap+fleet-terminal-mcp",
      "notes": "GCE alias for orchestrator VM \u2014 2 cores confirmed live"
    },
    {
      "id": "ag-gce-pc-platform-server-iap",
      "label": "pc-platform-server",
      "class": "gce-vm",
      "status": "online",
      "parallelSlots": 1,
      "tools": [
        "ssh",
        "gcloud"
      ],
      "capabilities": [
        "platform-host",
        "remote-terminal"
      ],
      "controlPlane": "iap+fleet-terminal-mcp",
      "notes": "Platform server lane"
    },
    {
      "id": "ag-gce-pc-voice-intel-01-iap",
      "label": "pc-voice-intel-01",
      "class": "gce-vm",
      "status": "online",
      "parallelSlots": 1,
      "tools": [
        "ssh",
        "gcloud"
      ],
      "capabilities": [
        "voice-intelligence",
        "remote-terminal"
      ],
      "controlPlane": "iap+fleet-terminal-mcp",
      "notes": "Voice intelligence lane"
    },
    {
      "id": "ag-gce-pc-comm-hub-01-iap",
      "label": "pc-comm-hub-01",
      "class": "gce-vm",
      "status": "online",
      "parallelSlots": 1,
      "tools": [
        "ssh",
        "gcloud"
      ],
      "capabilities": [
        "communications-hub",
        "remote-terminal"
      ],
      "controlPlane": "iap+fleet-terminal-mcp",
      "notes": "Communications hub lane"
    }
  ]
}

```

---

## SOURCE ARTIFACT: pc_database_registry_production.csv

```csv
database_name,node_affiliation,primary_purpose,storage_type,build_status
pc_registry_core,Node 6,Master "Source of Truth" index for all record IDs,PostgreSQL,Active
pc_parties_core,Node 6,People Organizations and relationship anchors,PostgreSQL,Active
pc_documents_core,Node 6,Evidence storage file metadata and OCR extraction,PostgreSQL,Active
pc_workflows_core,Node 8,Durable pipeline definitions and stage sequences,PostgreSQL,Active
pc_control_plane_core,Node 8,Active execution state and exception handling,PostgreSQL,Active
pc_audit_core,Node 7,Immutable compliance logs and historical traceability,PostgreSQL,Active
pc_commercial_core,Node 4,Professional accounting and payment routing,PostgreSQL,Proposed
pc_automotive_core,Nodes 1 & 2,Vehicle truth and inspection evidence,PostgreSQL,Active
pc_finance_core,Node 3,Banking qualifications and credit formulation,PostgreSQL,Active
pc_business_services_core,Node 5,Logistics transport and carrier movement,PostgreSQL,Proposed
pc_platform_projection_sync,Node 7,Synchronization state with external platforms,Firestore,Active
pc_operator_security_runtime,Node 7,Security vault access and IAM keys,Firestore,Active
pc_platform_shape_visibility,Node 7,Frontend state management and UI routing,Firestore,Active
pc_worker_registry,Node 7,Active worker subscriptions and capabilities,Firestore,Active
pc_data_surface_registry,Node 7,Inventory of digital execution environments,Firestore,Active
pc_routing_handoffs,Node 8,Specialist handoff contracts and routing logic,Firestore,Active
pc_runtime_state_trace,Node 8,Ledger of worker actions and callbacks,Firestore,Active
pc_agent_coordination_runtime,Node 8,A2A message bus and active worker dispatch,Firestore,Active
pc_worker_memory_runtime,Node 8,Long-term RAG storage for rules and corrections,Firestore,Active
pc_relationship_graph_runtime,Node 6,The non-ending association map (Node-to-Node),Firestore,Active
pc_semantic_vector_runtime,Node 8,Vectorized intent and semantic search indices,Firestore,Active
pc_identity_platform,Node 6,Unified authentication and KYC status,PostgreSQL,Active
pc-network-schematics,Node 7,Technical topography and gateway routes,PostgreSQL,Active

```

---

## SOURCE ARTIFACT: ui_surface_count_registry.csv

```csv
ui_number,ui_program,status,primary_route_or_host,main_audience,main_job
1,Main Public Site,live,pushingcapital.com,public,Explain the company and route users into the correct next surface
2,PushingSecurity Landing,live,PushingSecurity /,public,Security-led front door into onboarding and lifecycle control
3,Service-Buyer Onboarding,live mode,PushingSecurity /onboard?audience=service-buyer,service buyers,Start a service request classify the lane and create the first shell
4,Software-Buyer Onboarding,live mode,PushingSecurity /onboard?audience=software-buyer,software or application buyers,Route software buyers into the platform-sales and onboarding path
5,Employee Onboarding,live mode,PushingSecurity /onboard?audience=employee,employees,Intake identity review provisioning browser bootstrap and lifecycle entry
6,Subcontractor Onboarding,live mode,PushingSecurity /onboard?audience=subcontractor,subcontractors,Intake qualification and handoff into execution access
7,Finance Intake And Workflow UI,split-now,PushingSecurity /onboard?family=finance -> /login?portal=finance,finance-side users,Route into lender readiness underwriting and finance execution
8,Automotive Intake And Workflow UI,split-now,PushingSecurity /onboard?family=automotive -> /login?portal=automotive,automotive-side users,Route into DMV inspections transport parts and automotive execution
9,Push P Client Portal,live,/clientportal and /p,customers and guided users,Show workflow truth next required action quote payment and handoff state
10,subcontractorPortal,live,/subcontractor,workers in execution,Receive work upload evidence update status and close steps back into the control plane
11,PushingSecurity Dashboard,live,PushingSecurity /dashboard,operators,Manage vault playbooks bundles and lifecycle control
12,PushingForms,live anchor,internal CRM PushingFormsPage,operators,Control intake matrices packets and form-led record creation
13,PushingInspections,live anchor,internal CRM PushingInspectionsPage,operators and inspectors,Capture inspection evidence findings and packet outputs
14,PushingAssets,partial live,assets.pushingcap.com,design media and marketing users,Generate and deliver asset packet and media outputs
15,PushingTransport,prototype plus live anchor,standalone pushing-transport plus transport CRM prototype,transport buyers and operators,Transport intake dispatch coordination and route evidence
16,PushingParts Sales,prototype plus live anchor,standalone pushing-parts,parts buyers and operators,Parts intake sourcing flow fitment and parts-side execution routing
17,Vehicle Sales Workspace,split-now,dealer-facing narrative now real workspace next,dealers and automotive sales operators,Hold vehicle sale workflows records compliance and closeout state
18,Mobile Worker App,split-now,current base in /subcontractor plus transport mobile prototypes,field workers inspectors and transport/mobile operators,Perform in-field execution upload evidence and close micro-steps
19,userOne Courses,live,/userone-courses,learners operators and qualified entrants,Training filtration and readiness
20,userOne Professional Platform,split-now,userOne after filtration and professional access,licensed automotive professionals and dealers,Dealer-side automotive platform professional workspace and licensed execution access

```

---

## SOURCE ARTIFACT: pushing_capital_granular_product_service_registry_2026-04-03.csv

```csv
domain,lane_family,application,product_code,product_name,category,subcategory,catalog_pipeline,intake_object,domain_objects,commercial_objects,ticket_shell,task_shell,primary_agents,notebook_backed_sources,mapping_notes
Automotive,Vehicle Sales,Vehicle Sales Workspace,AUTO-VS-001,New Car Sales,Vehicle Sales,New,Auto Consignment Services Pipeline,p242835887_service_requests,Desired Vehicles; Vehicles,deals; quotes; contacts; companies,Vehicle sales execution ticket,sourcing; negotiation; compliance; delivery-closeout tasks,google_run_brain_ingestion; pushingcap_orchestrator,pushing_capital_products_services_context_2026-03-10.md; automotive_ui_program_stack.md; automotive_control_plane_big_picture_memory.md,Vehicle acquisition and consignment lane using the Auto Consignment Services Pipeline with Desired Vehicles and Vehicles as the domain truth.
Automotive,Vehicle Sales,Vehicle Sales Workspace,AUTO-VS-002,Used Car Sales,Vehicle Sales,Used,Auto Consignment Services Pipeline,p242835887_service_requests,Desired Vehicles; Vehicles,deals; quotes; contacts; companies,Vehicle sales execution ticket,sourcing; negotiation; compliance; delivery-closeout tasks,google_run_brain_ingestion; pushingcap_orchestrator,pushing_capital_products_services_context_2026-03-10.md; automotive_ui_program_stack.md; automotive_control_plane_big_picture_memory.md,Vehicle acquisition and consignment lane using the Auto Consignment Services Pipeline with Desired Vehicles and Vehicles as the domain truth.
Automotive,Vehicle Sales,Vehicle Sales Workspace,AUTO-VS-003,Consignment,Vehicle Sales,Consignment,Auto Consignment Services Pipeline,p242835887_service_requests,Desired Vehicles; Vehicles,deals; quotes; contacts; companies,Vehicle sales execution ticket,sourcing; negotiation; compliance; delivery-closeout tasks,google_run_brain_ingestion; pushingcap_orchestrator,pushing_capital_products_services_context_2026-03-10.md; automotive_ui_program_stack.md; automotive_control_plane_big_picture_memory.md,Vehicle acquisition and consignment lane using the Auto Consignment Services Pipeline with Desired Vehicles and Vehicles as the domain truth.
Automotive,Vehicle Sales,Vehicle Sales Workspace,AUTO-VS-004,Elite Vehicle Purchase Solutions,Vehicle Sales,Premium,Auto Consignment Services Pipeline,p242835887_service_requests,Desired Vehicles; Vehicles,deals; quotes; contacts; companies,Vehicle sales execution ticket,sourcing; negotiation; compliance; delivery-closeout tasks,google_run_brain_ingestion; pushingcap_orchestrator,pushing_capital_products_services_context_2026-03-10.md; automotive_ui_program_stack.md; automotive_control_plane_big_picture_memory.md,Vehicle acquisition and consignment lane using the Auto Consignment Services Pipeline with Desired Vehicles and Vehicles as the domain truth.
Automotive,Inspections & Appraisals,PushingInspections,AUTO-IA-001,Body Inspection,Inspection,Body,Service Dispatch Pipeline,p242835887_service_requests,p242835887_vehicle_inspections; p242835887_inspection_items; Vehicles,quotes; deals; tickets; tasks,Auto Repair / inspection handoff ticket,evidence capture; finding itemization; downstream routing; closeout tasks,google_run_brain_ingestion; pushingcap_orchestrator; google_run_pc_paygate_bridge,pushing_inspections_workflow_pipeline_spec.md; pushing_inspections_canonical_execution_matrix.md; automotive_control_plane_big_picture_memory.md,"Inspection evidence engine. Findings can route to repair, parts, transport, or report-only closeout."
Automotive,Inspections & Appraisals,PushingInspections,AUTO-IA-002,Complete Vehicle Scan,Inspection,Diagnostic,Service Dispatch Pipeline,p242835887_service_requests,p242835887_vehicle_inspections; p242835887_inspection_items; Vehicles,quotes; deals; tickets; tasks,Auto Repair / inspection handoff ticket,evidence capture; finding itemization; downstream routing; closeout tasks,google_run_brain_ingestion; pushingcap_orchestrator; google_run_pc_paygate_bridge,pushing_inspections_workflow_pipeline_spec.md; pushing_inspections_canonical_execution_matrix.md; automotive_control_plane_big_picture_memory.md,"Inspection evidence engine. Findings can route to repair, parts, transport, or report-only closeout."
Automotive,Inspections & Appraisals,PushingInspections,AUTO-IA-003,Pre-purchase Inspection,Inspection,Pre-Purchase,Service Dispatch Pipeline,p242835887_service_requests,p242835887_vehicle_inspections; p242835887_inspection_items; Vehicles,quotes; deals; tickets; tasks,Auto Repair / inspection handoff ticket,evidence capture; finding itemization; downstream routing; closeout tasks,google_run_brain_ingestion; pushingcap_orchestrator; google_run_pc_paygate_bridge,pushing_inspections_workflow_pipeline_spec.md; pushing_inspections_canonical_execution_matrix.md; automotive_control_plane_big_picture_memory.md,"Inspection evidence engine. Findings can route to repair, parts, transport, or report-only closeout."
Automotive,Inspections & Appraisals,PushingInspections,AUTO-IA-004,Safety Inspection,Inspection,Safety,Service Dispatch Pipeline,p242835887_service_requests,p242835887_vehicle_inspections; p242835887_inspection_items; Vehicles,quotes; deals; tickets; tasks,Auto Repair / inspection handoff ticket,evidence capture; finding itemization; downstream routing; closeout tasks,google_run_brain_ingestion; pushingcap_orchestrator; google_run_pc_paygate_bridge,pushing_inspections_workflow_pipeline_spec.md; pushing_inspections_canonical_execution_matrix.md; automotive_control_plane_big_picture_memory.md,"Inspection evidence engine. Findings can route to repair, parts, transport, or report-only closeout."
Automotive,Inspections & Appraisals,PushingInspections,AUTO-IA-PKG,Standalone Inspection Package,Inspection,Package,Service Dispatch Pipeline,p242835887_service_requests,p242835887_vehicle_inspections; p242835887_inspection_items; Vehicles,quotes; deals; tickets; tasks,Auto Repair / inspection handoff ticket,evidence capture; finding itemization; downstream routing; closeout tasks,google_run_brain_ingestion; pushingcap_orchestrator; google_run_pc_paygate_bridge,pushing_inspections_workflow_pipeline_spec.md; pushing_inspections_canonical_execution_matrix.md; automotive_control_plane_big_picture_memory.md,"Inspection evidence engine. Findings can route to repair, parts, transport, or report-only closeout."
Automotive,Inspections & Appraisals,PushingInspections,AUTO-IA-005,Vehicle Appraisal,Appraisal,Valuation,Service Dispatch Pipeline,p242835887_service_requests,p242835887_vehicle_inspections; p242835887_inspection_items; Vehicles,quotes; deals; tickets; tasks,Auto Repair / inspection handoff ticket,evidence capture; finding itemization; downstream routing; closeout tasks,google_run_brain_ingestion; pushingcap_orchestrator; google_run_pc_paygate_bridge,pushing_inspections_workflow_pipeline_spec.md; pushing_inspections_canonical_execution_matrix.md; automotive_control_plane_big_picture_memory.md,"Inspection evidence engine. Findings can route to repair, parts, transport, or report-only closeout."
Automotive,Inspections & Appraisals,PushingInspections,AUTO-IA-PKG2,Standalone Appraisal Package,Appraisal,Package,Service Dispatch Pipeline,p242835887_service_requests,p242835887_vehicle_inspections; p242835887_inspection_items; Vehicles,quotes; deals; tickets; tasks,Auto Repair / inspection handoff ticket,evidence capture; finding itemization; downstream routing; closeout tasks,google_run_brain_ingestion; pushingcap_orchestrator; google_run_pc_paygate_bridge,pushing_inspections_workflow_pipeline_spec.md; pushing_inspections_canonical_execution_matrix.md; automotive_control_plane_big_picture_memory.md,"Inspection evidence engine. Findings can route to repair, parts, transport, or report-only closeout."
Automotive,Repair & Field Services,Automotive App,AUTO-GL-001,Chip Repair,Glass,Repair,Auto Repair Pipeline,p242835887_service_requests,Vehicles; optional p242835887_vehicle_inspections,quotes; deals; tickets; tasks,Auto Repair execution ticket,dispatch; diagnosis; repair; parts; closeout tasks,google_run_brain_ingestion; pushingcap_orchestrator; google_run_pc_paygate_bridge,pushing_capital_products_services_context_2026-03-10.md; automotive_control_plane_big_picture_memory.md; ui_offer_catalog_and_inspection_packet_map.md,"Repair lane for glass, bodywork, tires, wheels, keys, and repair operations using the Auto Repair pipeline."
Automotive,Repair & Field Services,Automotive App,AUTO-GL-002,Windshield Replacement,Glass,Replacement,Auto Repair Pipeline,p242835887_service_requests,Vehicles; optional p242835887_vehicle_inspections,quotes; deals; tickets; tasks,Auto Repair execution ticket,dispatch; diagnosis; repair; parts; closeout tasks,google_run_brain_ingestion; pushingcap_orchestrator; google_run_pc_paygate_bridge,pushing_capital_products_services_context_2026-03-10.md; automotive_control_plane_big_picture_memory.md; ui_offer_catalog_and_inspection_packet_map.md,"Repair lane for glass, bodywork, tires, wheels, keys, and repair operations using the Auto Repair pipeline."
Automotive,Repair & Field Services,Automotive App,AUTO-GL-003,Side/Rear Glass Replacement,Glass,Replacement,Auto Repair Pipeline,p242835887_service_requests,Vehicles; optional p242835887_vehicle_inspections,quotes; deals; tickets; tasks,Auto Repair execution ticket,dispatch; diagnosis; repair; parts; closeout tasks,google_run_brain_ingestion; pushingcap_orchestrator; google_run_pc_paygate_bridge,pushing_capital_products_services_context_2026-03-10.md; automotive_control_plane_big_picture_memory.md; ui_offer_catalog_and_inspection_packet_map.md,"Repair lane for glass, bodywork, tires, wheels, keys, and repair operations using the Auto Repair pipeline."
Automotive,Repair & Field Services,Automotive App,AUTO-BW-001,Dent Repair,Bodywork,Dent,Auto Repair Pipeline,p242835887_service_requests,Vehicles; optional p242835887_vehicle_inspections,quotes; deals; tickets; tasks,Auto Repair execution ticket,dispatch; diagnosis; repair; parts; closeout tasks,google_run_brain_ingestion; pushingcap_orchestrator; google_run_pc_paygate_bridge,pushing_capital_products_services_context_2026-03-10.md; automotive_control_plane_big_picture_memory.md; ui_offer_catalog_and_inspection_packet_map.md,"Repair lane for glass, bodywork, tires, wheels, keys, and repair operations using the Auto Repair pipeline."
Automotive,Repair & Field Services,Automotive App,AUTO-BW-002,Panel Repair/Replacement,Bodywork,Panel,Auto Repair Pipeline,p242835887_service_requests,Vehicles; optional p242835887_vehicle_inspections,quotes; deals; tickets; tasks,Auto Repair execution ticket,dispatch; diagnosis; repair; parts; closeout tasks,google_run_brain_ingestion; pushingcap_orchestrator; google_run_pc_paygate_bridge,pushing_capital_products_services_context_2026-03-10.md; automotive_control_plane_big_picture_memory.md; ui_offer_catalog_and_inspection_packet_map.md,"Repair lane for glass, bodywork, tires, wheels, keys, and repair operations using the Auto Repair pipeline."
Automotive,Repair & Field Services,Automotive App,AUTO-BW-003,Paint Refinishing,Bodywork,Paint,Auto Repair Pipeline,p242835887_service_requests,Vehicles; optional p242835887_vehicle_inspections,quotes; deals; tickets; tasks,Auto Repair execution ticket,dispatch; diagnosis; repair; parts; closeout tasks,google_run_brain_ingestion; pushingcap_orchestrator; google_run_pc_paygate_bridge,pushing_capital_products_services_context_2026-03-10.md; automotive_control_plane_big_picture_memory.md; ui_offer_catalog_and_inspection_packet_map.md,"Repair lane for glass, bodywork, tires, wheels, keys, and repair operations using the Auto Repair pipeline."
Automotive,Repair & Field Services,Automotive App,AUTO-TW-001,Tire Sales,Tires,Sales,Auto Repair Pipeline,p242835887_service_requests,Vehicles; optional p242835887_vehicle_inspections,quotes; deals; tickets; tasks,Auto Repair execution ticket,dispatch; diagnosis; repair; parts; closeout tasks,google_run_brain_ingestion; pushingcap_orchestrator; google_run_pc_paygate_bridge,pushing_capital_products_services_context_2026-03-10.md; automotive_control_plane_big_picture_memory.md; ui_offer_catalog_and_inspection_packet_map.md,"Repair lane for glass, bodywork, tires, wheels, keys, and repair operations using the Auto Repair pipeline."
Automotive,Repair & Field Services,Automotive App,AUTO-TW-002,Mounting & Balancing,Tires,Service,Auto Repair Pipeline,p242835887_service_requests,Vehicles; optional p242835887_vehicle_inspections,quotes; deals; tickets; tasks,Auto Repair execution ticket,dispatch; diagnosis; repair; parts; closeout tasks,google_run_brain_ingestion; pushingcap_orchestrator; google_run_pc_paygate_bridge,pushing_capital_products_services_context_2026-03-10.md; automotive_control_plane_big_picture_memory.md; ui_offer_catalog_and_inspection_packet_map.md,"Repair lane for glass, bodywork, tires, wheels, keys, and repair operations using the Auto Repair pipeline."
Automotive,Repair & Field Services,Automotive App,AUTO-TW-003,Tire Rotation,Tires,Service,Auto Repair Pipeline,p242835887_service_requests,Vehicles; optional p242835887_vehicle_inspections,quotes; deals; tickets; tasks,Auto Repair execution ticket,dispatch; diagnosis; repair; parts; closeout tasks,google_run_brain_ingestion; pushingcap_orchestrator; google_run_pc_paygate_bridge,pushing_capital_products_services_context_2026-03-10.md; automotive_control_plane_big_picture_memory.md; ui_offer_catalog_and_inspection_packet_map.md,"Repair lane for glass, bodywork, tires, wheels, keys, and repair operations using the Auto Repair pipeline."
Automotive,Repair & Field Services,Automotive App,AUTO-TW-004,Wheel Alignment,Wheels,Alignment,Auto Repair Pipeline,p242835887_service_requests,Vehicles; optional p242835887_vehicle_inspections,quotes; deals; tickets; tasks,Auto Repair execution ticket,dispatch; diagnosis; repair; parts; closeout tasks,google_run_brain_ingestion; pushingcap_orchestrator; google_run_pc_paygate_bridge,pushing_capital_products_services_context_2026-03-10.md; automotive_control_plane_big_picture_memory.md; ui_offer_catalog_and_inspection_packet_map.md,"Repair lane for glass, bodywork, tires, wheels, keys, and repair operations using the Auto Repair pipeline."
Automotive,Repair & Field Services,Automotive App,AUTO-TW-005,Wheel Repair - Cosmetic,Wheels,Repair,Auto Repair Pipeline,p242835887_service_requests,Vehicles; optional p242835887_vehicle_inspections,quotes; deals; tickets; tasks,Auto Repair execution ticket,dispatch; diagnosis; repair; parts; closeout tasks,google_run_brain_ingestion; pushingcap_orchestrator; google_run_pc_paygate_bridge,pushing_capital_products_services_context_2026-03-10.md; automotive_control_plane_big_picture_memory.md; ui_offer_catalog_and_inspection_packet_map.md,"Repair lane for glass, bodywork, tires, wheels, keys, and repair operations using the Auto Repair pipeline."
Automotive,Repair & Field Services,Automotive App,AUTO-TW-006,Wheel Repair - Straightening,Wheels,Repair,Auto Repair Pipeline,p242835887_service_requests,Vehicles; optional p242835887_vehicle_inspections,quotes; deals; tickets; tasks,Auto Repair execution ticket,dispatch; diagnosis; repair; parts; closeout tasks,google_run_brain_ingestion; pushingcap_orchestrator; google_run_pc_paygate_bridge,pushing_capital_products_services_context_2026-03-10.md; automotive_control_plane_big_picture_memory.md; ui_offer_catalog_and_inspection_packet_map.md,"Repair lane for glass, bodywork, tires, wheels, keys, and repair operations using the Auto Repair pipeline."
Automotive,Repair & Field Services,Automotive App,AUTO-KP-001,Key Cutting,Keys,Cutting,Auto Repair Pipeline,p242835887_service_requests,Vehicles; optional p242835887_vehicle_inspections,quotes; deals; tickets; tasks,Auto Repair execution ticket,dispatch; diagnosis; repair; parts; closeout tasks,google_run_brain_ingestion; pushingcap_orchestrator; google_run_pc_paygate_bridge,pushing_capital_products_services_context_2026-03-10.md; automotive_control_plane_big_picture_memory.md; ui_offer_catalog_and_inspection_packet_map.md,"Repair lane for glass, bodywork, tires, wheels, keys, and repair operations using the Auto Repair pipeline."
Automotive,Repair & Field Services,Automotive App,AUTO-KP-002,Key Fob Programming,Keys,Programming,Auto Repair Pipeline,p242835887_service_requests,Vehicles; optional p242835887_vehicle_inspections,quotes; deals; tickets; tasks,Auto Repair execution ticket,dispatch; diagnosis; repair; parts; closeout tasks,google_run_brain_ingestion; pushingcap_orchestrator; google_run_pc_paygate_bridge,pushing_capital_products_services_context_2026-03-10.md; automotive_control_plane_big_picture_memory.md; ui_offer_catalog_and_inspection_packet_map.md,"Repair lane for glass, bodywork, tires, wheels, keys, and repair operations using the Auto Repair pipeline."
Automotive,Mobile Services,Mobile Worker App,AUTO-MS-001,Mobile Car Wash,Mobile Services,Wash,Service Dispatch Pipeline,p242835887_service_requests,Vehicles; optional p242835887_vehicle_inspections,quotes; deals; tickets; tasks,Service Dispatch / mobile execution ticket,scheduling; field dispatch; evidence upload; closeout tasks,google_run_brain_ingestion; pushingcap_orchestrator,automotive_ui_program_stack.md; ui_offer_catalog_and_inspection_packet_map.md; pushing_capital_products_services_context_2026-03-10.md,"Field-execution lane for mobile detail, wash, and labor packages; closes back through the mobile worker surface."
Automotive,Mobile Services,Mobile Worker App,AUTO-MS-002,Detail Service,Mobile Services,Detail,Service Dispatch Pipeline,p242835887_service_requests,Vehicles; optional p242835887_vehicle_inspections,quotes; deals; tickets; tasks,Service Dispatch / mobile execution ticket,scheduling; field dispatch; evidence upload; closeout tasks,google_run_brain_ingestion; pushingcap_orchestrator,automotive_ui_program_stack.md; ui_offer_catalog_and_inspection_packet_map.md; pushing_capital_products_services_context_2026-03-10.md,"Field-execution lane for mobile detail, wash, and labor packages; closes back through the mobile worker surface."
Automotive,Mobile Services,Mobile Worker App,AUTO-MS-003,Complete Detail x2,Mobile Services,Detail,Service Dispatch Pipeline,p242835887_service_requests,Vehicles; optional p242835887_vehicle_inspections,quotes; deals; tickets; tasks,Service Dispatch / mobile execution ticket,scheduling; field dispatch; evidence upload; closeout tasks,google_run_brain_ingestion; pushingcap_orchestrator,automotive_ui_program_stack.md; ui_offer_catalog_and_inspection_packet_map.md; pushing_capital_products_services_context_2026-03-10.md,"Field-execution lane for mobile detail, wash, and labor packages; closes back through the mobile worker surface."
Automotive,Mobile Services,Mobile Worker App,AUTO-MS-004,Pre-photograph Wash,Mobile Services,Wash,Service Dispatch Pipeline,p242835887_service_requests,Vehicles; optional p242835887_vehicle_inspections,quotes; deals; tickets; tasks,Service Dispatch / mobile execution ticket,scheduling; field dispatch; evidence upload; closeout tasks,google_run_brain_ingestion; pushingcap_orchestrator,automotive_ui_program_stack.md; ui_offer_catalog_and_inspection_packet_map.md; pushing_capital_products_services_context_2026-03-10.md,"Field-execution lane for mobile detail, wash, and labor packages; closes back through the mobile worker surface."
Automotive,Mobile Services,Mobile Worker App,AUTO-MS-PKG,Standalone Mobile Services Package,Mobile Services,Package,Service Dispatch Pipeline,p242835887_service_requests,Vehicles; optional p242835887_vehicle_inspections,quotes; deals; tickets; tasks,Service Dispatch / mobile execution ticket,scheduling; field dispatch; evidence upload; closeout tasks,google_run_brain_ingestion; pushingcap_orchestrator,automotive_ui_program_stack.md; ui_offer_catalog_and_inspection_packet_map.md; pushing_capital_products_services_context_2026-03-10.md,"Field-execution lane for mobile detail, wash, and labor packages; closes back through the mobile worker surface."
Automotive,Parts,Parts Sales UI,AUTO-PT-001,Parts (New),Parts,New,Auto Repair Pipeline,p242835887_service_requests,Skus; Brands; Part Types,deals; quotes; tickets; tasks,Expert Parts Acquisition and Sourcing ticket,fitment; vendor sourcing; order placement; delivery-closeout tasks,google_run_brain_ingestion; pushingcap_orchestrator,pushing_parts_sales_workflow_pipeline_spec.md; pushing_parts_sales_canonical_execution_matrix.md; automotive_control_plane_big_picture_memory.md,Parts lane uses service request intake plus parts catalog objects and a dedicated sourcing ticket shell.
Automotive,Parts,Parts Sales UI,AUTO-PT-002,Parts (Used),Parts,Used,Auto Repair Pipeline,p242835887_service_requests,Skus; Brands; Part Types,deals; quotes; tickets; tasks,Expert Parts Acquisition and Sourcing ticket,fitment; vendor sourcing; order placement; delivery-closeout tasks,google_run_brain_ingestion; pushingcap_orchestrator,pushing_parts_sales_workflow_pipeline_spec.md; pushing_parts_sales_canonical_execution_matrix.md; automotive_control_plane_big_picture_memory.md,Parts lane uses service request intake plus parts catalog objects and a dedicated sourcing ticket shell.
Automotive,Parts,Parts Sales UI,AUTO-PT-003,Parts (Refurbished),Parts,Refurbished,Auto Repair Pipeline,p242835887_service_requests,Skus; Brands; Part Types,deals; quotes; tickets; tasks,Expert Parts Acquisition and Sourcing ticket,fitment; vendor sourcing; order placement; delivery-closeout tasks,google_run_brain_ingestion; pushingcap_orchestrator,pushing_parts_sales_workflow_pipeline_spec.md; pushing_parts_sales_canonical_execution_matrix.md; automotive_control_plane_big_picture_memory.md,Parts lane uses service request intake plus parts catalog objects and a dedicated sourcing ticket shell.
Automotive,Parts,Parts Sales UI,AUTO-PT-PKG,Standalone Parts Package,Parts,Package,Auto Repair Pipeline,p242835887_service_requests,Skus; Brands; Part Types,deals; quotes; tickets; tasks,Expert Parts Acquisition and Sourcing ticket,fitment; vendor sourcing; order placement; delivery-closeout tasks,google_run_brain_ingestion; pushingcap_orchestrator,pushing_parts_sales_workflow_pipeline_spec.md; pushing_parts_sales_canonical_execution_matrix.md; automotive_control_plane_big_picture_memory.md,Parts lane uses service request intake plus parts catalog objects and a dedicated sourcing ticket shell.
Automotive,Transport,PushingTransport,AUTO-TR-001,Emergency Towing,Transport,Towing,Auto Transport Pipeline,p242835887_service_requests,p242835887_transport; p242835887_subcontractor_job; p242835887_payouts,deals; quotes; tickets; tasks,Auto Transport execution ticket,dispatch; carrier assignment; route tracking; delivery; payout tasks,google_run_brain_ingestion; pushingcap_orchestrator; google_run_pc_paygate_bridge; pushingcap_sick_memory_dude,pushing_transport_bundle_contract.md; pushing_transport_formal_workflow_definition.md; transport_end_to_end_map.md,"Transport lane binds service requests to deals, transport records, subcontractor jobs, and payout tracking."
Automotive,Transport,PushingTransport,AUTO-TR-002,Scheduled Transport,Transport,Transport,Auto Transport Pipeline,p242835887_service_requests,p242835887_transport; p242835887_subcontractor_job; p242835887_payouts,deals; quotes; tickets; tasks,Auto Transport execution ticket,dispatch; carrier assignment; route tracking; delivery; payout tasks,google_run_brain_ingestion; pushingcap_orchestrator; google_run_pc_paygate_bridge; pushingcap_sick_memory_dude,pushing_transport_bundle_contract.md; pushing_transport_formal_workflow_definition.md; transport_end_to_end_map.md,"Transport lane binds service requests to deals, transport records, subcontractor jobs, and payout tracking."
Automotive,Transport,PushingTransport,AUTO-TR-PKG,Standalone Transport Package,Transport,Package,Auto Transport Pipeline,p242835887_service_requests,p242835887_transport; p242835887_subcontractor_job; p242835887_payouts,deals; quotes; tickets; tasks,Auto Transport execution ticket,dispatch; carrier assignment; route tracking; delivery; payout tasks,google_run_brain_ingestion; pushingcap_orchestrator; google_run_pc_paygate_bridge; pushingcap_sick_memory_dude,pushing_transport_bundle_contract.md; pushing_transport_formal_workflow_definition.md; transport_end_to_end_map.md,"Transport lane binds service requests to deals, transport records, subcontractor jobs, and payout tracking."
Automotive,Mobile Services,Mobile Worker App,AUTO-LB-PKG,Standalone Labor Package,Labor,Package,Service Dispatch Pipeline,p242835887_service_requests,Vehicles; optional p242835887_vehicle_inspections,quotes; deals; tickets; tasks,Service Dispatch / mobile execution ticket,scheduling; field dispatch; evidence upload; closeout tasks,google_run_brain_ingestion; pushingcap_orchestrator,automotive_ui_program_stack.md; ui_offer_catalog_and_inspection_packet_map.md; pushing_capital_products_services_context_2026-03-10.md,"Field-execution lane for mobile detail, wash, and labor packages; closes back through the mobile worker surface."
Automotive,DMV & Compliance,PushingForms / DMV,AUTO-DMV-001,Title & Registration,DMV,Title,DMV Concierge Pipeline,service_request or equivalent intake shell,Vehicles; DMV/compliance packet,deals; quotes; tickets; tasks,DMV Concierge execution ticket,identity; verification; filing; notary; packet-closeout tasks,google_run_brain_ingestion; pushingcap_orchestrator; postman_api; ops_health,pushing_forms_dmv_public_intake_matrix.md; pushing_forms_dmv_courses_map.md; pushing_capital_products_services_context_2026-03-10.md,"Compliance-heavy automotive lane. Forms route into service_request, deal/ticket/task shells, and a DMV packet."
Automotive,DMV & Compliance,PushingForms / DMV,AUTO-DMV-002,VIN/Odometer Verification,DMV,Verification,DMV Concierge Pipeline,service_request or equivalent intake shell,Vehicles; DMV/compliance packet,deals; quotes; tickets; tasks,DMV Concierge execution ticket,identity; verification; filing; notary; packet-closeout tasks,google_run_brain_ingestion; pushingcap_orchestrator; postman_api; ops_health,pushing_forms_dmv_public_intake_matrix.md; pushing_forms_dmv_courses_map.md; pushing_capital_products_services_context_2026-03-10.md,"Compliance-heavy automotive lane. Forms route into service_request, deal/ticket/task shells, and a DMV packet."
Automotive,DMV & Compliance,PushingForms / DMV,AUTO-DMV-003,Notary Services,DMV,Notary,DMV Concierge Pipeline,service_request or equivalent intake shell,Vehicles; DMV/compliance packet,deals; quotes; tickets; tasks,DMV Concierge execution ticket,identity; verification; filing; notary; packet-closeout tasks,google_run_brain_ingestion; pushingcap_orchestrator; postman_api; ops_health,pushing_forms_dmv_public_intake_matrix.md; pushing_forms_dmv_courses_map.md; pushing_capital_products_services_context_2026-03-10.md,"Compliance-heavy automotive lane. Forms route into service_request, deal/ticket/task shells, and a DMV packet."
Automotive,DMV & Compliance,PushingForms / DMV,AUTO-DMV-PKG,Standalone DMV Package,DMV,Package,DMV Concierge Pipeline,service_request or equivalent intake shell,Vehicles; DMV/compliance packet,deals; quotes; tickets; tasks,DMV Concierge execution ticket,identity; verification; filing; notary; packet-closeout tasks,google_run_brain_ingestion; pushingcap_orchestrator; postman_api; ops_health,pushing_forms_dmv_public_intake_matrix.md; pushing_forms_dmv_courses_map.md; pushing_capital_products_services_context_2026-03-10.md,"Compliance-heavy automotive lane. Forms route into service_request, deal/ticket/task shells, and a DMV packet."
Automotive,Repair & Field Services,Automotive App,AUTO-RP-001,Mechanical Repair,Repair,Mechanical,Auto Repair Pipeline,p242835887_service_requests,Vehicles; optional p242835887_vehicle_inspections,quotes; deals; tickets; tasks,Auto Repair execution ticket,dispatch; diagnosis; repair; parts; closeout tasks,google_run_brain_ingestion; pushingcap_orchestrator; google_run_pc_paygate_bridge,pushing_capital_products_services_context_2026-03-10.md; automotive_control_plane_big_picture_memory.md; ui_offer_catalog_and_inspection_packet_map.md,"Repair lane for glass, bodywork, tires, wheels, keys, and repair operations using the Auto Repair pipeline."
Automotive,Repair & Field Services,Automotive App,AUTO-RP-002,Electrical Repair,Repair,Electrical,Auto Repair Pipeline,p242835887_service_requests,Vehicles; optional p242835887_vehicle_inspections,quotes; deals; tickets; tasks,Auto Repair execution ticket,dispatch; diagnosis; repair; parts; closeout tasks,google_run_brain_ingestion; pushingcap_orchestrator; google_run_pc_paygate_bridge,pushing_capital_products_services_context_2026-03-10.md; automotive_control_plane_big_picture_memory.md; ui_offer_catalog_and_inspection_packet_map.md,"Repair lane for glass, bodywork, tires, wheels, keys, and repair operations using the Auto Repair pipeline."
Finance,Credit Strategy,Finance App,FIN-CS-001,Credit Strategy Discovery,Credit Strategy,,Credit Strategy Personal Pipeline,service_request or finance intake shell,Financial Profiles; Credit Reports; Credit Tradelines; Credit Inspections,deals; quotes; tickets; tasks,Credit Strategy / Credit Processing ticket,bureau audit; dispute; monitoring; follow-up tasks,incomplete_profile_worker; validator_worker; pushingcap_orchestrator,lender_matching_fico_dti_ltv_business_formation_brief.md; pushing_capital_products_services_context_2026-03-10.md,Credit strategy and monitoring lane. Uses credit-profile objects and validation workers before deeper underwriting.
Finance,Credit Strategy,Finance App,FIN-CS-002,Credit Strategy,Credit Strategy,,Credit Strategy Personal Pipeline,service_request or finance intake shell,Financial Profiles; Credit Reports; Credit Tradelines; Credit Inspections,deals; quotes; tickets; tasks,Credit Strategy / Credit Processing ticket,bureau audit; dispute; monitoring; follow-up tasks,incomplete_profile_worker; validator_worker; pushingcap_orchestrator,lender_matching_fico_dti_ltv_business_formation_brief.md; pushing_capital_products_services_context_2026-03-10.md,Credit strategy and monitoring lane. Uses credit-profile objects and validation workers before deeper underwriting.
Finance,Credit Strategy,Finance App,FIN-CS-003,Tradeline Validation,Credit Strategy,,Credit Strategy Personal Pipeline,service_request or finance intake shell,Financial Profiles; Credit Reports; Credit Tradelines; Credit Inspections,deals; quotes; tickets; tasks,Credit Strategy / Credit Processing ticket,bureau audit; dispute; monitoring; follow-up tasks,incomplete_profile_worker; validator_worker; pushingcap_orchestrator,lender_matching_fico_dti_ltv_business_formation_brief.md; pushing_capital_products_services_context_2026-03-10.md,Credit strategy and monitoring lane. Uses credit-profile objects and validation workers before deeper underwriting.
Finance,Credit Strategy,Finance App,FIN-CS-004,MyScoreIQ 7-day trial,Credit Strategy,,Credit Strategy Personal Pipeline,service_request or finance intake shell,Financial Profiles; Credit Reports; Credit Tradelines; Credit Inspections,deals; quotes; tickets; tasks,Credit Strategy / Credit Processing ticket,bureau audit; dispute; monitoring; follow-up tasks,incomplete_profile_worker; validator_worker; pushingcap_orchestrator,lender_matching_fico_dti_ltv_business_formation_brief.md; pushing_capital_products_services_context_2026-03-10.md,Credit strategy and monitoring lane. Uses credit-profile objects and validation workers before deeper underwriting.
Finance,Credit Strategy,Finance App,FIN-CS-005,MyScoreIQ Monthly Subscription,Credit Strategy,,Credit Strategy Personal Pipeline,service_request or finance intake shell,Financial Profiles; Credit Reports; Credit Tradelines; Credit Inspections,deals; quotes; tickets; tasks,Credit Strategy / Credit Processing ticket,bureau audit; dispute; monitoring; follow-up tasks,incomplete_profile_worker; validator_worker; pushingcap_orchestrator,lender_matching_fico_dti_ltv_business_formation_brief.md; pushing_capital_products_services_context_2026-03-10.md,Credit strategy and monitoring lane. Uses credit-profile objects and validation workers before deeper underwriting.
Finance,Credit Strategy,Finance App,FIN-CS-006,MyScoreIQ On-Demand Pull,Credit Strategy,,Credit Strategy Personal Pipeline,service_request or finance intake shell,Financial Profiles; Credit Reports; Credit Tradelines; Credit Inspections,deals; quotes; tickets; tasks,Credit Strategy / Credit Processing ticket,bureau audit; dispute; monitoring; follow-up tasks,incomplete_profile_worker; validator_worker; pushingcap_orchestrator,lender_matching_fico_dti_ltv_business_formation_brief.md; pushing_capital_products_services_context_2026-03-10.md,Credit strategy and monitoring lane. Uses credit-profile objects and validation workers before deeper underwriting.
Finance,Auto Finance & Lender Match,Finance App,FIN-AF-001,Loan Acquisition,Auto Finance,,Home Purchase (Finance) / Home Loan,service_request or finance intake shell,pc_credit_profiles; pc_income_profiles; pc_bank_stipulations; pc_reverse_auction_matches; pc_auction_rate_submissions,deals; quotes; tickets; tasks,Loan Optimization & Acquisition ticket,doc chase; ratio validation; underwriting; lender-match tasks,incomplete_profile_worker; validator_worker; underwriting_worker; lender_matching_worker; pushingcap_orchestrator,lender_matching_fico_dti_ltv_business_formation_brief.md; pushing_capital_products_services_context_2026-03-10.md,Funding/readiness lane. Applies DTI/LTV/FICO validation and lender matching against finance packet truth.
Finance,Auto Finance & Lender Match,Finance App,FIN-AF-002,Funding Options Review,Auto Finance,,Home Purchase (Finance) / Home Loan,service_request or finance intake shell,pc_credit_profiles; pc_income_profiles; pc_bank_stipulations; pc_reverse_auction_matches; pc_auction_rate_submissions,deals; quotes; tickets; tasks,Financial Preperation & Lender Matching ticket,doc chase; ratio validation; underwriting; lender-match tasks,incomplete_profile_worker; validator_worker; underwriting_worker; lender_matching_worker; pushingcap_orchestrator,lender_matching_fico_dti_ltv_business_formation_brief.md; pushing_capital_products_services_context_2026-03-10.md,Funding/readiness lane. Applies DTI/LTV/FICO validation and lender matching against finance packet truth.
Finance,Auto Finance & Lender Match,Finance App,FIN-AF-003,Rate & Term Review,Auto Finance,,Home Purchase (Finance) / Home Loan,service_request or finance intake shell,pc_credit_profiles; pc_income_profiles; pc_bank_stipulations; pc_reverse_auction_matches; pc_auction_rate_submissions,deals; quotes; tickets; tasks,Loan Optimization & Acquisition ticket,doc chase; ratio validation; underwriting; lender-match tasks,incomplete_profile_worker; validator_worker; underwriting_worker; lender_matching_worker; pushingcap_orchestrator,lender_matching_fico_dti_ltv_business_formation_brief.md; pushing_capital_products_services_context_2026-03-10.md,Funding/readiness lane. Applies DTI/LTV/FICO validation and lender matching against finance packet truth.
Finance,Auto Finance & Lender Match,Finance App,FIN-AF-004,Refinance/Consolidation Options,Auto Finance,,Home Purchase (Finance) / Home Loan,service_request or finance intake shell,pc_credit_profiles; pc_income_profiles; pc_bank_stipulations; pc_reverse_auction_matches; pc_auction_rate_submissions,deals; quotes; tickets; tasks,Loan Optimization & Acquisition ticket,doc chase; ratio validation; underwriting; lender-match tasks,incomplete_profile_worker; validator_worker; underwriting_worker; lender_matching_worker; pushingcap_orchestrator,lender_matching_fico_dti_ltv_business_formation_brief.md; pushing_capital_products_services_context_2026-03-10.md,Funding/readiness lane. Applies DTI/LTV/FICO validation and lender matching against finance packet truth.
Finance,Auto Finance & Lender Match,Finance App,FIN-AF-005,Readiness Checklist,Auto Finance,,Home Purchase (Finance) / Home Loan,service_request or finance intake shell,pc_credit_profiles; pc_income_profiles; pc_bank_stipulations; pc_reverse_auction_matches; pc_auction_rate_submissions,deals; quotes; tickets; tasks,Financial Preperation & Lender Matching ticket,doc chase; ratio validation; underwriting; lender-match tasks,incomplete_profile_worker; validator_worker; underwriting_worker; lender_matching_worker; pushingcap_orchestrator,lender_matching_fico_dti_ltv_business_formation_brief.md; pushing_capital_products_services_context_2026-03-10.md,Funding/readiness lane. Applies DTI/LTV/FICO validation and lender matching against finance packet truth.
Finance,Auto Finance & Lender Match,Finance App,FIN-AF-006,Curated Lender Introductions,Auto Finance,,Home Purchase (Finance) / Home Loan,service_request or finance intake shell,pc_credit_profiles; pc_income_profiles; pc_bank_stipulations; pc_reverse_auction_matches; pc_auction_rate_submissions,deals; quotes; tickets; tasks,Financial Preperation & Lender Matching ticket,doc chase; ratio validation; underwriting; lender-match tasks,incomplete_profile_worker; validator_worker; underwriting_worker; lender_matching_worker; pushingcap_orchestrator,lender_matching_fico_dti_ltv_business_formation_brief.md; pushing_capital_products_services_context_2026-03-10.md,Funding/readiness lane. Applies DTI/LTV/FICO validation and lender matching against finance packet truth.
Finance,Auto Finance & Lender Match,Finance App,FIN-AF-PKG1,Standalone Auto Finance Package,Auto Finance,,Home Purchase (Finance) / Home Loan,service_request or finance intake shell,pc_credit_profiles; pc_income_profiles; pc_bank_stipulations; pc_reverse_auction_matches; pc_auction_rate_submissions,deals; quotes; tickets; tasks,Financial Preperation & Lender Matching ticket,doc chase; ratio validation; underwriting; lender-match tasks,incomplete_profile_worker; validator_worker; underwriting_worker; lender_matching_worker; pushingcap_orchestrator,lender_matching_fico_dti_ltv_business_formation_brief.md; pushing_capital_products_services_context_2026-03-10.md,Funding/readiness lane. Applies DTI/LTV/FICO validation and lender matching against finance packet truth.
Finance,Auto Finance & Lender Match,Finance App,FIN-AF-PKG2,Standalone Retail/Broker Package,Auto Finance,,Home Purchase (Finance) / Home Loan,service_request or finance intake shell,pc_credit_profiles; pc_income_profiles; pc_bank_stipulations; pc_reverse_auction_matches; pc_auction_rate_submissions,deals; quotes; tickets; tasks,Financial Preperation & Lender Matching ticket,doc chase; ratio validation; underwriting; lender-match tasks,incomplete_profile_worker; validator_worker; underwriting_worker; lender_matching_worker; pushingcap_orchestrator,lender_matching_fico_dti_ltv_business_formation_brief.md; pushing_capital_products_services_context_2026-03-10.md,Funding/readiness lane. Applies DTI/LTV/FICO validation and lender matching against finance packet truth.
Finance,Auto Finance & Lender Match,Finance App,FIN-AF-PKG3,Standalone Wholesale/Broker Package,Auto Finance,,Home Purchase (Finance) / Home Loan,service_request or finance intake shell,pc_credit_profiles; pc_income_profiles; pc_bank_stipulations; pc_reverse_auction_matches; pc_auction_rate_submissions,deals; quotes; tickets; tasks,Financial Preperation & Lender Matching ticket,doc chase; ratio validation; underwriting; lender-match tasks,incomplete_profile_worker; validator_worker; underwriting_worker; lender_matching_worker; pushingcap_orchestrator,lender_matching_fico_dti_ltv_business_formation_brief.md; pushing_capital_products_services_context_2026-03-10.md,Funding/readiness lane. Applies DTI/LTV/FICO validation and lender matching against finance packet truth.
Finance,Business Formation,Finance App,FIN-BF-001,LLC Formation,Business Formation,,Service Dispatch Pipeline,service_request or finance intake shell,Companies; business launch packet,deals; quotes; tickets; tasks,Business Formation & Launch Support ticket,entity filing; EIN; KYB; banking; launch tasks,incomplete_profile_worker; validator_worker; pushingcap_orchestrator,lender_matching_fico_dti_ltv_business_formation_brief.md; pushing_capital_products_services_context_2026-03-10.md,Entity setup and launch lane that prepares the business shell before lender-facing or operational work.
Finance,Business Formation,Finance App,FIN-BF-002,Corporation (C/S-Corp),Business Formation,,Service Dispatch Pipeline,service_request or finance intake shell,Companies; business launch packet,deals; quotes; tickets; tasks,Business Formation & Launch Support ticket,entity filing; EIN; KYB; banking; launch tasks,incomplete_profile_worker; validator_worker; pushingcap_orchestrator,lender_matching_fico_dti_ltv_business_formation_brief.md; pushing_capital_products_services_context_2026-03-10.md,Entity setup and launch lane that prepares the business shell before lender-facing or operational work.
Finance,Business Formation,Finance App,FIN-BF-003,DBA Registration,Business Formation,,Service Dispatch Pipeline,service_request or finance intake shell,Companies; business launch packet,deals; quotes; tickets; tasks,Business Formation & Launch Support ticket,entity filing; EIN; KYB; banking; launch tasks,incomplete_profile_worker; validator_worker; pushingcap_orchestrator,lender_matching_fico_dti_ltv_business_formation_brief.md; pushing_capital_products_services_context_2026-03-10.md,Entity setup and launch lane that prepares the business shell before lender-facing or operational work.
Finance,Business Formation,Finance App,FIN-BF-004,Nonprofit Formation,Business Formation,,Service Dispatch Pipeline,service_request or finance intake shell,Companies; business launch packet,deals; quotes; tickets; tasks,Business Formation & Launch Support ticket,entity filing; EIN; KYB; banking; launch tasks,incomplete_profile_worker; validator_worker; pushingcap_orchestrator,lender_matching_fico_dti_ltv_business_formation_brief.md; pushing_capital_products_services_context_2026-03-10.md,Entity setup and launch lane that prepares the business shell before lender-facing or operational work.
Finance,Business Formation,Finance App,FIN-BF-005,EIN Registration,Business Formation,,Service Dispatch Pipeline,service_request or finance intake shell,Companies; business launch packet,deals; quotes; tickets; tasks,Business Formation & Launch Support ticket,entity filing; EIN; KYB; banking; launch tasks,incomplete_profile_worker; validator_worker; pushingcap_orchestrator,lender_matching_fico_dti_ltv_business_formation_brief.md; pushing_capital_products_services_context_2026-03-10.md,Entity setup and launch lane that prepares the business shell before lender-facing or operational work.
Finance,Business Formation,Finance App,FIN-BF-006,Business Credit Setup,Business Formation,,Service Dispatch Pipeline,service_request or finance intake shell,Companies; business launch packet,deals; quotes; tickets; tasks,Business Formation & Launch Support ticket,entity filing; EIN; KYB; banking; launch tasks,incomplete_profile_worker; validator_worker; pushingcap_orchestrator,lender_matching_fico_dti_ltv_business_formation_brief.md; pushing_capital_products_services_context_2026-03-10.md,Entity setup and launch lane that prepares the business shell before lender-facing or operational work.
Finance,Bookkeeping & Tax,Finance App,FIN-BT-001,Monthly Reconciliation,Bookkeeping & Tax,,Service Dispatch Pipeline,service_request or finance intake shell,Companies; financial statements; tax packets,deals; quotes; tickets; tasks,Accounting & Book Keeping ticket,reconciliation; statement prep; document gathering; audit packet tasks,validator_worker; pushingcap_orchestrator,lender_matching_fico_dti_ltv_business_formation_brief.md; pushing_capital_products_services_context_2026-03-10.md,"Operational bookkeeping and tax packet lane for reconciliations, statements, document prep, and audit readiness."
Finance,Bookkeeping & Tax,Finance App,FIN-BT-002,Invoices & Bills Tracking,Bookkeeping & Tax,,Service Dispatch Pipeline,service_request or finance intake shell,Companies; financial statements; tax packets,deals; quotes; tickets; tasks,Accounting & Book Keeping ticket,reconciliation; statement prep; document gathering; audit packet tasks,validator_worker; pushingcap_orchestrator,lender_matching_fico_dti_ltv_business_formation_brief.md; pushing_capital_products_services_context_2026-03-10.md,"Operational bookkeeping and tax packet lane for reconciliations, statements, document prep, and audit readiness."
Finance,Bookkeeping & Tax,Finance App,FIN-BT-003,Profit & Loss (P&L),Bookkeeping & Tax,,Service Dispatch Pipeline,service_request or finance intake shell,Companies; financial statements; tax packets,deals; quotes; tickets; tasks,Accounting & Book Keeping ticket,reconciliation; statement prep; document gathering; audit packet tasks,validator_worker; pushingcap_orchestrator,lender_matching_fico_dti_ltv_business_formation_brief.md; pushing_capital_products_services_context_2026-03-10.md,"Operational bookkeeping and tax packet lane for reconciliations, statements, document prep, and audit readiness."
Finance,Bookkeeping & Tax,Finance App,FIN-BT-004,Balance Sheet,Bookkeeping & Tax,,Service Dispatch Pipeline,service_request or finance intake shell,Companies; financial statements; tax packets,deals; quotes; tickets; tasks,Accounting & Book Keeping ticket,reconciliation; statement prep; document gathering; audit packet tasks,validator_worker; pushingcap_orchestrator,lender_matching_fico_dti_ltv_business_formation_brief.md; pushing_capital_products_services_context_2026-03-10.md,"Operational bookkeeping and tax packet lane for reconciliations, statements, document prep, and audit readiness."
Finance,Bookkeeping & Tax,Finance App,FIN-BT-005,Tax Summary,Bookkeeping & Tax,,Service Dispatch Pipeline,service_request or finance intake shell,Companies; financial statements; tax packets,deals; quotes; tickets; tasks,Accounting & Book Keeping ticket,reconciliation; statement prep; document gathering; audit packet tasks,validator_worker; pushingcap_orchestrator,lender_matching_fico_dti_ltv_business_formation_brief.md; pushing_capital_products_services_context_2026-03-10.md,"Operational bookkeeping and tax packet lane for reconciliations, statements, document prep, and audit readiness."
Finance,Bookkeeping & Tax,Finance App,FIN-BT-006,Document Gathering,Bookkeeping & Tax,,Service Dispatch Pipeline,service_request or finance intake shell,Companies; financial statements; tax packets,deals; quotes; tickets; tasks,Accounting & Book Keeping ticket,reconciliation; statement prep; document gathering; audit packet tasks,validator_worker; pushingcap_orchestrator,lender_matching_fico_dti_ltv_business_formation_brief.md; pushing_capital_products_services_context_2026-03-10.md,"Operational bookkeeping and tax packet lane for reconciliations, statements, document prep, and audit readiness."
Finance,Bookkeeping & Tax,Finance App,FIN-BT-007,Audit Packet Preparation,Bookkeeping & Tax,,Service Dispatch Pipeline,service_request or finance intake shell,Companies; financial statements; tax packets,deals; quotes; tickets; tasks,Accounting & Book Keeping ticket,reconciliation; statement prep; document gathering; audit packet tasks,validator_worker; pushingcap_orchestrator,lender_matching_fico_dti_ltv_business_formation_brief.md; pushing_capital_products_services_context_2026-03-10.md,"Operational bookkeeping and tax packet lane for reconciliations, statements, document prep, and audit readiness."

```

---

## SOURCE ARTIFACT: SWARM_SHORTHAND_PROTOCOL.md

# ⚡ SWARM SHORTHAND PROTOCOL (SSP)
### A Bit-Defined Language for the 98-Worker Swarm
**Version:** 1.0 | **Date:** 2026-04-15 | **Author:** Antigravity

---

## Design Principle

Every command in this system can be expressed in **26 bits** (4 bytes).
Every concept has a **2-3 character shortcode** for human use AND a **binary address** for machine use.

```
┌─────────┬─────────┬─────────┬──────────┬──────┬───────┐
│ VERB    │ WORKER  │ MACHINE │ TARGET   │ LANE │ STATE │
│ 5 bits  │ 7 bits  │ 4 bits  │ 4 bits   │ 3b   │ 3b    │
│ 32 cmds │ 128 max │ 16 max  │ 16 types │ 8    │ 8     │
└─────────┴─────────┴─────────┴──────────┴──────┴───────┘
          Total: 26 bits = 1 command
```

---

## 1. VERB DICTIONARY (5 bits → 32 commands)

| Code | Short | Binary | Meaning |
|------|-------|--------|---------|
| `BLD` | Build | `00001` | Compile/construct code |
| `DPL` | Deploy | `00010` | Ship to production |
| `TST` | Test | `00011` | Run test suite |
| `CMT` | Commit | `00100` | Git commit |
| `PSH` | Push | `00101` | Git push |
| `PLL` | Pull | `00110` | Git pull |
| `RST` | Restart | `00111` | Restart process |
| `KIL` | Kill | `01000` | Stop process |
| `SSH` | Connect | `01001` | SSH into machine |
| `RUN` | Execute | `01010` | Run arbitrary command |
| `QRY` | Query | `01011` | Database query |
| `WRT` | Write | `01100` | Write to file/DB |
| `RED` | Read | `01101` | Read file/DB |
| `CRT` | Create | `01110` | Create new resource |
| `DEL` | Delete | `01111` | Delete resource |
| `MOV` | Move | `10000` | Transfer/migrate |
| `CPY` | Copy | `10001` | Duplicate |
| `MRG` | Merge | `10010` | Git merge / data merge |
| `RVW` | Review | `10011` | Code review / PR review |
| `ACK` | Acknowledge | `10100` | Confirm receipt |
| `NAK` | Reject | `10101` | Reject/deny |
| `SYN` | Sync | `10110` | Synchronize state |
| `POL` | Poll | `10111` | Check status |
| `BRC` | Broadcast | `11000` | Fan out to all |
| `RTE` | Route | `11001` | Dispatch to specific target |
| `HLT` | Halt | `11010` | Emergency stop |
| `WAK` | Wake | `11011` | Bring online |
| `SCN` | Scan | `11100` | Scan/audit |
| `GEN` | Generate | `11101` | AI generate content |
| `OPT` | Optimize | `11110` | Performance tuning |
| `LOG` | Log | `11111` | Record to audit trail |
| `NOP` | No-op | `00000` | Heartbeat/ping |

---

## 2. WORKER DICTIONARY (7 bits → 98 workers)

### Core Tier (0x00–0x0A)

| Code | Short | Binary | Worker |
|------|-------|--------|--------|
| `P` | P | `0000000` | P — Sovereign Intelligence |
| `AG` | AG | `0000001` | antigravity — Code Synthesis |
| `AA` | AA | `0000010` | antigravity_agent — Autonomous Executor |
| `DX` | DX | `0000011` | deployment_executor — Program Activation |
| `GM` | GM | `0000100` | gemini — Verification & Mesh Ops |
| `ML` | ML | `0000101` | mac_messages_listener — Message Intake |
| `MC` | MC | `0000110` | mesh_coordinator — Task Routing |
| `PE` | PE | `0000111` | p_agent_edge — Edge Operations |
| `PA` | PA | `0001000` | pipeline_architect — Program Design |
| `PO` | PO | `0001001` | pushingcap_orchestrator — Cross-Dept Routing |
| `SM` | SM | `0001010` | pushingcap_sick_memory_dude — Memory Arch |

### High Tier (0x0B–0x15)

| Code | Short | Binary | Worker |
|------|-------|--------|--------|
| `GC` | GC | `0001011` | gemini_cli_agent |
| `BH` | BH | `0001100` | bigquery_memory_hub |
| `BC` | BC | `0001101` | biosphere_console |
| `CD` | CD | `0001110` | codex_design |
| `OH` | OH | `0001111` | ops_health |
| `OA` | OA | `0010000` | outreach_account_manager |
| `OC` | OC | `0010001` | outreach_customer_success |
| `OS` | OS | `0010010` | outreach_sdr |
| `OR` | OR | `0010011` | outreach_subcontractor_recruiter |
| `PM` | PM | `0010100` | postman_api |
| `RM` | RM | `0010101` | runpod_media |

### Medium Tier — Cloudflare (0x16–0x2F)

| Code | Short | Binary | Worker |
|------|-------|--------|--------|
| `C0` | C0 | `0010110` | cloudflare_core_mcp_edge |
| `C1` | C1 | `0010111` | cloudflare_hubspot_orchestrator |
| `C2` | C2 | `0011000` | cloudflare_hubspot_webhook |
| `C3` | C3 | `0011001` | cloudflare_openphone_webhook |
| `C4` | C4 | `0011010` | cloudflare_pc_credit_analytics |
| `C5` | C5 | `0011011` | cloudflare_pc_credit_api |
| `C6` | C6 | `0011100` | cloudflare_pc_credit_indexer |
| `C7` | C7 | `0011101` | cloudflare_pc_credit_processor |
| `C8` | C8 | `0011110` | cloudflare_pc_finance_core |
| `C9` | C9 | `0011111` | cloudflare_pushing_capital_admin |
| `CA` | CA | `0100000` | cloudflare_pushing_capital_integration |
| `CB` | CB | `0100001` | cloudflare_pushing_capital_memory |
| `CC` | CC | `0100010` | cloudflare_pushing_capital_security |
| `CE` | CE | `0100011` | cloudflare_pushingcap_assets |
| `CF` | CF | `0100100` | cloudflare_pushingcap_intelligence |
| `CG` | CG | `0100101` | cloudflare_pushingcap_ops_health |
| `CH` | CH | `0100110` | cloudflare_pushingcap_realtime |
| `CI` | CI | `0100111` | cloudflare_pushingcap_web_v2 |
| `CJ` | CJ | `0101000` | cloudflare_vertex_ai_router |

### Medium Tier — Cloud Run (0x30–0x3B)

| Code | Short | Binary | Worker |
|------|-------|--------|--------|
| `R0` | R0 | `0101001` | google_run_analysis_brain |
| `R1` | R1 | `0101010` | google_run_brain_ingestion |
| `R2` | R2 | `0101011` | google_run_brain_orchestrator |
| `R3` | R3 | `0101100` | google_run_core_mcp |
| `R4` | R4 | `0101101` | google_run_orchestrator |
| `R5` | R5 | `0101110` | google_run_pc_paygate_bridge |
| `R6` | R6 | `0101111` | google_run_pc_sql_connector |
| `R7` | R7 | `0110000` | google_run_stackops_core |

### Medium Tier — Retool (0x3C–0x4A)

| Code | Short | Binary | Worker |
|------|-------|--------|--------|
| `T0` | T0 | `0110001` | retool_brand_designer |
| `T1` | T1 | `0110010` | retool_data_engineer |
| `T2` | T2 | `0110011` | retool_devops_engineer |
| `T3` | T3 | `0110100` | retool_full_stack_developer |
| `T4` | T4 | `0110101` | retool_memory_orchestrator |
| `T5` | T5 | `0110110` | retool_product_manager |
| `T6` | T6 | `0110111` | retool_security_architect |
| `T7` | T7 | `0111000` | retool_the_architect |
| `T8` | T8 | `0111001` | retool_the_builder |
| `T9` | T9 | `0111010` | retool_the_refiner |
| `TA` | TA | `0111011` | retool_the_router |
| `TB` | TB | `0111100` | retool_the_visualizer |
| `TC` | TC | `0111101` | retool_ui_ux_designer |
| `TD` | TD | `0111110` | retool_worker_coordinator |

### Medium Tier — Social (0x4B–0x51)

| Code | Short | Binary | Worker |
|------|-------|--------|--------|
| `S0` | S0 | `0111111` | google_presence |
| `S1` | S1 | `1000000` | instagram_platform |
| `S2` | S2 | `1000001` | linkedin_bing_profile |
| `S3` | S3 | `1000010` | meta_business |
| `S4` | S4 | `1000011` | tiktok_platform |
| `S5` | S5 | `1000100` | x_platform |
| `S6` | S6 | `1000101` | youtube_channel |

### Specialist Tier (0x52–0x56)

| Code | Short | Binary | Worker |
|------|-------|--------|--------|
| `B0` | B0 | `1000110` | bigquery_customer_dossiers |
| `B1` | B1 | `1000111` | bigquery_deal_dossiers |
| `B2` | B2 | `1001000` | bigquery_message_associations |
| `B3` | B3 | `1001001` | bigquery_message_backfill |
| `B4` | B4 | `1001010` | bigquery_schema_warehouse |

### Wildcard

| Code | Short | Binary | Worker |
|------|-------|--------|--------|
| `**` | ALL | `1111111` | All workers (broadcast) |

---

## 3. MACHINE DICTIONARY (4 bits → 10+)

| Code | Short | Binary | Machine |
|------|-------|--------|---------|
| `MS` | MS | `0001` | Mac Studio (M2 Ultra, 36GB) |
| `IM` | IM | `0010` | iMac (8c, 8GB) |
| `MB` | MB | `0011` | MacBook Pro (16c, 16GB) |
| `OV` | OV | `0100` | Orchestrator VM (GCE) |
| `PS` | PS | `0101` | Platform Server (GCE) |
| `CV` | CV | `0110` | CRM App VM (GCE, 83GB) |
| `CP` | CP | `0111` | CRM Prod (GCE) |
| `HB` | HB | `1000` | Comm Hub (GCE) |
| `VI` | VI | `1001` | Voice Intel (GCE) |
| `TO` | TO | `1010` | TS Orchestrator |
| `CF` | CF | `1011` | Cloudflare Edge (serverless) |
| `CR` | CR | `1100` | Cloud Run (serverless) |
| `RT` | RT | `1101` | Retool (managed) |
| `**` | ALL | `1111` | All machines (broadcast) |

---

## 4. TARGET DICTIONARY (4 bits → 16 types)

| Code | Short | Binary | Target |
|------|-------|--------|--------|
| `PG` | PG | `0001` | Page/Route |
| `AP` | AP | `0010` | API endpoint |
| `CM` | CM | `0011` | Component |
| `DB` | DB | `0100` | Database/table |
| `FL` | FL | `0101` | File |
| `SV` | SV | `0110` | Service/process |
| `PK` | PK | `0111` | Package/dependency |
| `TK` | TK | `1000` | Token/secret |
| `RP` | RP | `1001` | Repo/branch |
| `PR` | PR | `1010` | Pull request |
| `TS` | TS | `1011` | Test suite |
| `DC` | DC | `1100` | Docker container |
| `CF` | CF | `1101` | Config file |
| `AS` | AS | `1110` | Asset (image/media) |
| `MG` | MG | `1111` | Migration |
| `**` | ALL | `0000` | Everything |

---

## 5. LANE DICTIONARY (3 bits → 8 lanes)

| Code | Short | Binary | Lane |
|------|-------|--------|------|
| `L0` | ARC | `000` | Architecture & Orchestration |
| `L1` | DSN | `001` | Design System |
| `L2` | PAG | `010` | Page Construction |
| `L3` | API | `011` | API & Data Layer |
| `L4` | CNT | `100` | Content & Media |
| `L5` | SEC | `101` | Security & Compliance |
| `L6` | INF | `110` | Infrastructure & DevOps |
| `L7` | QAI | `111` | Quality & Intelligence |

---

## 6. STATE DICTIONARY (3 bits → 8 states)

| Code | Short | Binary | State |
|------|-------|--------|-------|
| `IDL` | ⚪ | `000` | Idle |
| `RUN` | 🟢 | `001` | Running |
| `BLD` | 🔵 | `010` | Building |
| `DPL` | 🟣 | `011` | Deploying |
| `ERR` | 🔴 | `100` | Error |
| `WAT` | 🟡 | `101` | Waiting/blocked |
| `DON` | ✅ | `110` | Done/complete |
| `HLT` | ⛔ | `111` | Halted |

---

## 7. COMMAND SYNTAX

### Human-readable format:
```
VERB.WORKER.MACHINE.TARGET
```

### Examples:

| Command | Meaning |
|---------|---------|
| `BLD.AG.MS.PG` | Build — Antigravity — Mac Studio — Page |
| `DPL.**.CF.*` | Deploy — ALL workers — Cloudflare — Everything |
| `SSH.MC.OV.SV` | Connect — mesh_coordinator — Orchestrator VM — Service |
| `QRY.BH.MS.DB` | Query — bigquery_memory_hub — Mac Studio — Database |
| `RUN.PO.PS.AP` | Execute — orchestrator — Platform Server — API |
| `KIL.**.**.SV` | Kill — ALL — ALL machines — ALL services |
| `GEN.CD.MS.AS` | Generate — codex_design — Mac Studio — Asset |
| `TST.T9.RT.TS` | Test — the_refiner — Retool — Test suite |
| `BRC.PO.**.PG` | Broadcast — orchestrator — ALL — Pages |
| `SYN.**.**.RP` | Sync — ALL — ALL — Repo |
| `NOP.P.MS.*` | Heartbeat — P — Mac Studio |

### Multi-command chains (pipe with `>`)
```
BLD.AG.MS.PG > TST.T9.RT.TS > DPL.CI.CF.SV
```
Meaning: Build (Antigravity, Mac Studio, Page) → Test (Refiner, Retool, Tests) → Deploy (Web Worker, Cloudflare, Service)

### Batch commands (parallel with `|`)
```
BLD.AG.MS.PG | BLD.AA.MS.AP | BLD.GM.IM.CM
```
Meaning: Simultaneously build page (AG), API (AA), and component (GM)

---

## 8. QUICK REFERENCE CARD

```
┌──────────────────────────────────────────────────┐
│  SWARM SHORTHAND PROTOCOL — CHEAT SHEET         │
├──────────────────────────────────────────────────┤
│  VERBS: BLD DPL TST CMT PSH PLL RST KIL SSH    │
│         RUN QRY WRT RED CRT DEL MOV CPY MRG    │
│         RVW ACK NAK SYN POL BRC RTE HLT WAK    │
│         SCN GEN OPT LOG NOP                      │
├──────────────────────────────────────────────────┤
│  CORE:  P AG AA DX GM ML MC PE PA PO SM         │
│  HIGH:  GC BH BC CD OH OA OC OS OR PM RM        │
│  CF:    C0-CJ  RUN: R0-R7  RETOOL: T0-TD       │
│  SOCIAL: S0-S6  BQ: B0-B4  ALL: **             │
├──────────────────────────────────────────────────┤
│  MACHINES: MS IM MB OV PS CV CP HB VI TO CF CR  │
│  TARGETS:  PG AP CM DB FL SV PK TK RP PR TS DC  │
│  LANES:    ARC DSN PAG API CNT SEC INF QAI      │
│  STATE:    IDL RUN BLD DPL ERR WAT DON HLT      │
├──────────────────────────────────────────────────┤
│  FORMAT:  VERB.WORKER.MACHINE.TARGET             │
│  CHAIN:   cmd > cmd > cmd  (sequential)          │
│  BATCH:   cmd | cmd | cmd  (parallel)            │
│  26 bits per command. 4 bytes on the wire.       │
└──────────────────────────────────────────────────┘
```

---

## 9. FIRST COMMAND

```
BLD.AG.MS.PG | BLD.AA.MS.AP | BLD.DX.MS.CM > DPL.CI.CF.SV
```

Translation: **In parallel**, Antigravity builds the vault page, antigravity_agent builds the credit API, deployment_executor builds the secure browser component. **Then** deploy via Cloudflare web worker to production.

**This is the pushingSecurity first pixel claim, encoded in 4 bytes × 4 = 16 bytes total.**


---

