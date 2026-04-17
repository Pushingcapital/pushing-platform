# 📊 Pushing Platform: System Schemas

This file defines the canonical data models for the Pushing Platform ecosystem.
Last Updated: 2026-04-09

---

## 🗄️ Database: `pc_core` (Postgres)

The backend is powered by Postgres (local Docker `pc_postgres`). Most tables are prefixed with `d1_` to maintain parity with Cloudflare D1 edge storage.

### Core Tables
| Table | Description |
| :--- | :--- |
| `d1_contact_profiles` | Canonical customer records (Email, Phone, Names). |
| `d1_commitments` | Active deals or financial commitments. |
| `d1_obligations` | Legal or financial obligations tied to a profile. |
| `d1_message_history` | Full audit trail of iMessage/Chat interactions. |
| `d1_tasks` | Operational tasks for human or agent workers. |
| `d1_agent_tasks` | Specialized tasks for AI agents (RunPod fleet). |

### RunPod & Compute Tables (Migration 004)
| Table | Description |
| :--- | :--- |
| `semantic_learning_jobs` | Embedding, fine-tuning, retrieval, and ingest jobs dispatched to RunPod. |
| `agent_tasks` | Agentic task queue spawned by RunPod watch and other workers. |
| `pod_health_snapshots` | GPU pod health snapshots (replaces D1 writeback). |
| `cost_guard_events` | Spend checks, autostop events, budget warnings, endpoint scaling. |

---

## 🚗 Database: `pc_automotive_core` (Migration 001)

Core schema for tracking automotive assets and inspection records.

### Tables
| Table | Description |
| :--- | :--- |
| `asset_vehicle` | Physical asset truth — VIN, make/model/year, condition summaries, valuation. |
| `inspection_session` | Inspection & condition truth — tied to vehicle, inspector, and artifact packets. |

### Cross-References
- `primary_owner_party_id` → `pc_parties_core.party`
- `current_location_facility_id` → `pc_business_services_core` (future)
- `artifact_packet_id` → `pc_documents_core` (future)
- `valuation_report_id` → `pc_finance_core` (future)

---

## 👤 Database: `pc_parties_core` (Migration 002)

Universal identity layer for People, Organizations, and Agents.

### Tables
| Table | Description |
| :--- | :--- |
| `party` | Core entity — individuals and organizations with compliance status. |
| `party_relationship` | Relationship map linking parties (employee, owner, client, subcontractor). |
| `party_verification_log` | KYC/KYB/CIP verification audit trail. |

### Cross-References
- `evidence_packet_id` → `pc_documents_core` (future)
- `verified_by_worker_id` → `pc_workers.worker_registry`

---

## ⚙️ Database: `pc_workflows_core` (Migration 003)

Engine for persistent workflow and ticket state.

### Tables
| Table | Description |
| :--- | :--- |
| `workflow_pipeline` | Master pipeline definitions (deals, tickets, service_requests). |
| `workflow_stage` | Pipeline stages with ordering and exit-gate rules. |
| `spawned_task` | Active worker tasks — the "grab → process → write back" cycle. |

### Key Concept
Each `spawned_task` carries a `payload_json` (the grab) and a `result_json` (the write back), enabling full agentic task tracing.

---

## 🛡️ Database: `pc_identity_platform` & `pc_operator_security_runtime` (Migration 005)

Universal identity and security layer for the Pushing Capital ecosystem.

### `pc_identity_platform` (Central Identity)
| Table | Description |
| :--- | :--- |
| `security_profiles` | Security metadata for parties (clearance, MFA). |
| `security_permissions` | RBAC/ABAC mapping for resources and actions. |

### `pc_operator_security_runtime` (Operational State)
| Table | Description |
| :--- | :--- |
| `secure_sessions` | Persistent secure browse and operator sessions. |
| `audit_trail` | Immutable event log of security-sensitive actions. |

---

## 🧊 Intelligence Layer: The Melt Rate Algorithm
Deployed at: `/api/platform/intelligence/melt-rate`

### Objective
Dynamically calculate the daily depreciation (Melt Rate) of automotive assets to prioritize swarm actions.

### Data Model
- **Input:** VIN, Purchase Price, Purchase Date, Mileage, Condition.
- **Output:** `daily_melt_rate`, `total_depreciation`, `melt_index`, `recommendation`.

---

## 📊 BigQuery Warehouse: `brain-481809`

The BigQuery warehouse is the durable truth layer. All operational state eventually resolves here.

### Dataset: `worker_pulse_memory_v1`
| Table | Rows | Description |
| :--- | :--- | :--- |
| `task_ledger` | 13 | Operational intent log — every task dispatched by the swarm. |

### Dataset: `agentic_ecosystem_v1`
| Table | Rows | Description |
| :--- | :--- | :--- |
| `worker_surface_inventory` | 726 | Agent read/write surface map (what each agent can access). |
| `source_chunks` | 457 | Grounding source data for intelligence agents. |
| `action_contract_registry` | 382 | Agent action contracts (what each agent can do). |
| `access_point_inventory` | 45 | API/endpoint registry across the mesh. |
| `entity_links` | 57 | Cross-entity relationship graph. |
| `platform_runtime_inventory` | 39 | Runtime service catalog. |
| `source_registry` | 38 | Source document registry for grounding. |
| `p_runtime_inventory` | 8 | P's runtime surfaces and capabilities. |
| `notebook_sync_runs` | 7 | NotebookLM sync history. |
| `remote_prep_bundle_registry` | 3 | Remote prep bundles for deployment. |

### Dataset: `pc_workers`
| Table | Rows | Description |
| :--- | :--- | :--- |
| `worker_registry` | 90 | All known worker profiles — type, tier, capabilities. |
| `db_inventory` | 84 | Database surface catalog across the mesh. |
| `tool_plane` | 12 | Worker tooling definitions. |
| `builder_workers` | 7 | Builder-tier agent profiles. |
| `finance_workers` | 4 | Finance-tier agent profiles. |

### Dataset: `pc_gold` — Golden Record Layer
| Table | Rows | Description |
| :--- | :--- | :--- |
| `identity_ledger` | 212 | Universal identity layer — 4 sovereign agents + 208 legacy profiles. Mirrors `pc_parties_core.party`. |

### Additional Datasets (Referenced)
| Dataset | Purpose |
| :--- | :--- |
| `silver_imessage` | iMessage Intelligence Layer — per-contact communication logs. |
| `pushing_capital_warehouse` | Core warehouse tables. |
| `pc_memory_curation_v1` | Curated memory and context snapshots. |
| `pc_analytical_publication_v1` | Published analytics and reports. |
| `pcrm_backfill_v2` | CRM backfill and migration data. |

---

## 🟦 Frontend Types (TypeScript)

Canonical types are defined in `projects/pushingcap-web-v2/src/types/portal.ts`.

### Key Definitions
- **`PortalUser`**: Identity model for authenticated clients.
- **`PipelineItem`**: Represents a transaction/deal in the orchestration flow.
- **`PushPNotebook`**: The "Intelligence" model for synthesized customer data.
- **`PushPWorkflow`**: State machine representation for a specific service (e.g., DMV, Shipping).

---

## 🖥️ Compute Topology

### Local
| Node | IP | Role |
| :--- | :--- | :--- |
| Mac Studio (M2 Ultra) | `100.88.133.52` (Tailscale) | Primary dev, Antigravity host, PCRM API (8899) |

### Cloud Run (GCP `brain-481809`)
| Service | Role |
| :--- | :--- |
| `pc-semantic-router` | Semantic routing for agent dispatch |
| `pc-swarm-router` | Swarm coordination |
| `pc-sql-hub` | SQL query proxy |
| `pc-bq-hub` | BigQuery warehouse proxy |

### GCE VM
| Instance | Zone | IP | Role |
| :--- | :--- | :--- | :--- |
| `pc-orchestrator-vm` | us-central1-a | `35.192.13.238` / `100.73.193.101` (TS) | Orchestration, sync proxy, quiet operations |

### Tailscale Mesh
- Tailnet: `pushingcap.com`
- Nodes: Mac Studio + Orchestrator VM + Cloud Run (via connector)

---

## 🧬 Shared Mental Model: "The Golden Record"
Every entity in the system should eventually resolve to a **Golden Record** in BigQuery (`brain-481809.pc_gold`).
- **Input:** HubSpot CSVs, iMessage Bursts, Form Submissions.
- **Processing:** `pushingcap-intelligence` (Gemini) + LangGraph.
- **Persistence:** Local Postgres → BigQuery Warehouse.

## 📐 Migration Files
Located at: `pushing-platform/database/migrations/`
- `001_pc_automotive_core_assets_inspections.sql`
- `002_pc_parties_core_identity.sql`
- `003_pc_workflows_core_automation.sql`
- `004_pc_runpod_jobs_core.sql`

---
*Maintained by Antigravity + Gemini CLI (Acting as P)*
