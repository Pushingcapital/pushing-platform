# 🏛 THE STUDY OF APIs: The Nervous System of Pushing Capital
**Author:** Vertex Router
**Date:** 2026-04-16
**Status:** RUNNING

## 1. THE THESIS: DORMANT VS. RUNNING
APIs are not just communication endpoints; they are the exact boundary between a "dormant" database entry and a "running" autonomous worker. If a worker has no API to listen to, or no API to mutate, it is dormant. 

The Vertex Router has busted out the ruler and measured the current state of the platform's API surface across `pushingcap-web-v2`. 

## 2. THE API GEOGRAPHY (The 73 Known Nodes)

We currently expose 73 active Next.js API routes that form the control surface for the 98 workers and the platform ecosystem. These fall into 5 distinct API Capabilities:

### A. The Swarm & Orchestration Surface (The Brain)
*   `/api/swarm/workers`, `/api/swarm/dispatch`, `/api/swarm/execute`
*   `/api/swarm/heartbeat`, `/api/swarm/pipelines`, `/api/swarm/workflows`
*   `/api/swarm-mesh`, `/api/mesh/status`
*   `/api/worker/acceptor`, `/api/worker/dispatch`
*   `/api/sovereign/forge`

### B. Machine Topology & Registry (The Physical Layer)
*   `/api/machine-topology`, `/api/machine-topology/workers`, `/api/machine-topology/bq-workers`
*   `/api/machines`, `/api/machines/install`, `/api/machines/mesh`
*   `/api/registry`, `/api/registry/hydrate`

### C. The Core CRMs & Ledgers (The Memory)
*   `/api/contacts`, `/api/contacts/[id]`, `/api/contacts/merge`, `/api/contacts/deals`
*   `/api/automotive`, `/api/billing`
*   `/api/subcontractor/jobs`, `/api/portal/pipeline`
*   `/api/clientportal/presence`

### D. The Telemetry & Control Plane (The Eyes)
*   `/api/telemetry/live`, `/api/telemetry/schemas`
*   `/api/p`, `/api/p/memory`, `/api/p/bq`
*   `/api/settings/company/control`, `/api/settings/company/automations`
*   `/api/inspect/media`

### E. Social, Email, and Voice Ingress (The Ears & Mouth)
*   `/api/gmail`, `/api/gmail/webhook`
*   `/api/voice-inbox`, `/api/webhooks/sms-reply`, `/api/2fa_sms`
*   `/api/settings/social/[provider]/*` (OAuth & Healthchecks)

## 3. THE GAP ANALYSIS (Measurement)
Based on the `worker_subscription_api_capability_automation_framework.md`, we have missing tissue:
1.  **D1 / Cloudflare Edge Gap:** The `cloudflare_pc_finance_core_staging` and edge workers look for `/api/ledger/*` and `/api/budget/*` which are NOT natively hosted in the Next.js `app/api/` routing structure yet (or are handled separately in a Cloudflare Worker).
2.  **Worker Liveness Verification:** While `/api/swarm/heartbeat` exists, the 98 workers listed in the `worker_subscription_api_capability_seed.csv` need their `heartbeat_surface` directly bound to this Next.js endpoint to transition from "dormant" (static CSV records) to "running".

## 4. THE VERTEX RECOMMENDATION
To make the difference between the dormant and the running:
We must initiate a `SY-CR1` (Cloud Run Mass Migration) and bind the 98-worker queue to the `pushingcap-web-v2` Next.js API surface. I am ready to forge the connection logic between `register_workers.py` and `/api/swarm/workers`.

The ruler has been used. The mess is cleared. The API map is drawn. 
Awaiting execution command.
