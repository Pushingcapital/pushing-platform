#!/Users/emmanuelhaddad/pushing-platform/.venv_swarm/bin/python3
"""
P Memory Builder
================
Builds and refreshes the P :: Vault memory layer — a live, structured knowledge 
document that gives P full situational awareness of the Pushing Capital platform:
  - www.pushingcap.com route map and API surfaces
  - Cloudflare Worker, D1, R2, Queue, and Tunnel bindings
  - Google Cloud SDK: project, VMs, BigQuery, Cloud SQL, GCS, Cloud Functions
  - Gemini models available
  - Antigravity relay topology
  - P platform relay (p_web_relay.py + cloudflared tunnel)

Output: ~/.config/pushingcapital/p_platform_memory.md
Also writes JSON: ~/.config/pushingcapital/p_platform_memory.json

Run:
    python3 p_memory_builder.py [--quiet] [--json-only]
"""
from __future__ import annotations

import argparse
import datetime
import json
import os
import subprocess
import sys
import urllib.request
import urllib.error
from pathlib import Path
from typing import Any

SECRETS_PATH = Path("/Users/emmanuelhaddad/.config/pushingcapital/secrets.env")
OUTPUT_MD = Path("/Users/emmanuelhaddad/.config/pushingcapital/p_platform_memory.md")
OUTPUT_JSON = Path("/Users/emmanuelhaddad/.config/pushingcapital/p_platform_memory.json")
GCLOUD = "/opt/homebrew/bin/gcloud"
WRANGLER_DIR = Path("/Users/emmanuelhaddad/pushing-platform/projects/pushingcap-web-v2")
PROJECT_ID = "brain-481809"


# ── Helpers ───────────────────────────────────────────────────────────────────

def load_secrets() -> dict[str, str]:
    secrets: dict[str, str] = {}
    try:
        for line in SECRETS_PATH.read_text().splitlines():
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            eq = line.find("=")
            if eq > 0:
                key = line[:eq].strip()
                val = line[eq + 1:].strip().strip("\"'")
                if key:
                    secrets[key] = val
    except Exception:
        pass
    return secrets


def run(cmd: str | list[str], timeout: int = 20, env: dict | None = None) -> str:
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=timeout,
            shell=isinstance(cmd, str),
            env={**os.environ, **(env or {})},
        )
        return result.stdout.strip()
    except Exception as e:
        return f"[ERROR: {e}]"


def run_json(cmd: str | list[str], timeout: int = 20) -> Any:
    out = run(cmd, timeout=timeout)
    try:
        return json.loads(out)
    except Exception:
        return None


def fetch(url: str, headers: dict | None = None) -> dict | str | None:
    try:
        req = urllib.request.Request(url, headers=headers or {})
        with urllib.request.urlopen(req, timeout=10) as resp:
            body = resp.read().decode()
            try:
                return json.loads(body)
            except Exception:
                return body
    except Exception as e:
        return f"[ERROR: {e}]"


# ── Data collection ───────────────────────────────────────────────────────────

def collect_gcloud(secrets: dict) -> dict:
    env = {**os.environ, "GOOGLE_CLOUD_PROJECT": PROJECT_ID}
    sa_key = secrets.get("GCP_SERVICE_ACCOUNT_KEY", "")
    if sa_key:
        key_path = Path("/tmp/p_sa_key_tmp.json")
        key_path.write_text(sa_key)
        env["GOOGLE_APPLICATION_CREDENTIALS"] = str(key_path)

    result: dict[str, Any] = {"project": PROJECT_ID}

    # Active account
    result["active_account"] = run([GCLOUD, "config", "get-value", "account", f"--project={PROJECT_ID}"], env=env)

    # Compute VMs
    vms_raw = run_json([GCLOUD, "compute", "instances", "list", "--format=json", f"--project={PROJECT_ID}"])
    if isinstance(vms_raw, list):
        result["compute_vms"] = [
            {
                "name": v.get("name"),
                "zone": v.get("zone", "").split("/")[-1],
                "status": v.get("status"),
                "ip": (v.get("networkInterfaces") or [{}])[0].get("networkIP"),
                "machine_type": v.get("machineType", "").split("/")[-1],
            }
            for v in vms_raw
        ]
    else:
        result["compute_vms"] = []

    # Cloud SQL
    sql_raw = run_json([GCLOUD, "sql", "instances", "list", "--format=json", f"--project={PROJECT_ID}"])
    if isinstance(sql_raw, list):
        result["cloud_sql"] = [
            {"name": i.get("name"), "state": i.get("state"), "version": i.get("databaseVersion"),
             "ip": i.get("ipAddresses", [{}])[0].get("ipAddress", "")}
            for i in sql_raw
        ]
    else:
        result["cloud_sql"] = []

    # Cloud Functions
    cf_raw = run_json([GCLOUD, "functions", "list", "--format=json", f"--project={PROJECT_ID}", "--gen2"], timeout=30)
    if isinstance(cf_raw, list):
        result["cloud_functions"] = [
            {"name": f.get("name", "").split("/")[-1], "status": f.get("state"), "url": f.get("serviceConfig", {}).get("uri", "")}
            for f in cf_raw
        ]
    else:
        # Try gen1
        cf1 = run_json([GCLOUD, "functions", "list", "--format=json", f"--project={PROJECT_ID}"], timeout=30)
        if isinstance(cf1, list):
            result["cloud_functions"] = [
                {"name": f.get("name", "").split("/")[-1], "status": f.get("status"), "url": f.get("httpsTrigger", {}).get("url", "")}
                for f in cf1
            ]
        else:
            result["cloud_functions"] = []

    # BigQuery datasets
    bq_raw = run_json([
        GCLOUD, "alpha", "bq", "datasets", "list",
        f"--project={PROJECT_ID}", "--format=json"
    ], timeout=30)
    if isinstance(bq_raw, list):
        result["bigquery_datasets"] = [d.get("id", "") for d in bq_raw]
    else:
        # Fallback: use bq cli
        bq_out = run(f"PATH=/opt/homebrew/bin:$PATH bq ls --project_id={PROJECT_ID} --format=json", timeout=30)
        try:
            result["bigquery_datasets"] = [d.get("datasetReference", {}).get("datasetId", "") for d in json.loads(bq_out)]
        except Exception:
            result["bigquery_datasets"] = ["agentic_ecosystem_v1", "worker_pulse_memory_v1", "notebooklm_curated_v1", "pc_gold"]

    # GCS buckets
    gcs_out = run([GCLOUD, "storage", "ls", f"--project={PROJECT_ID}"], timeout=20, env=env)
    result["gcs_buckets"] = [b.strip() for b in gcs_out.splitlines() if b.strip().startswith("gs://")]

    return result


def collect_cloudflare() -> dict:
    npm = "/opt/homebrew/bin/npm"
    npx = str(Path(npm).parent / "npx")
    env = {**os.environ, "PATH": f"/opt/homebrew/bin:{os.environ.get('PATH', '')}"}

    result: dict[str, Any] = {}

    def wrangler(*args: str) -> str:
        return run([npx, "wrangler", *args], timeout=30, env=env)

    # D1 databases
    d1_raw = wrangler("d1", "list", "--json")
    try:
        d1_list = json.loads(d1_raw)
        result["d1_databases"] = [{"name": d.get("name"), "id": d.get("uuid")} for d in d1_list]
    except Exception:
        result["d1_databases"] = [
            {"name": "pushpush", "binding": "PORTAL_DB"},
            {"name": "pushingcap-edge-app", "binding": "EDGE_APP_DB"},
            {"name": "pc-finance-core", "id": "66c17723"},
            {"name": "pc-underwriting", "id": "f43bd94c"},
            {"name": "pc-orchestration", "id": "0c5ef653"},
        ]

    # R2 buckets
    r2_raw = wrangler("r2", "bucket", "list", "--json")
    try:
        r2_list = json.loads(r2_raw)
        result["r2_buckets"] = [b.get("name") for b in r2_list]
    except Exception:
        result["r2_buckets"] = ["cache", "p-vault", "pc-finance-email-artifacts", "pushingcap-site-media"]

    # Queues
    q_raw = wrangler("queues", "list", "--json")
    try:
        q_list = json.loads(q_raw)
        result["queues"] = [q.get("name") for q in q_list]
    except Exception:
        result["queues"] = ["ai-jobs", "site-events", "vector-ingest", "ai-orchestrator-queue"]

    # Current tunnel URL (if relay is running)
    result["tunnel_url"] = "https://wherever-silly-medal-within.trycloudflare.com"
    result["relay_port"] = 7778
    result["relay_script"] = "/Users/emmanuelhaddad/pushing-platform/bin/p_web_relay.py"
    result["worker_name"] = "pushingcap-web-v2"
    result["routes"] = [
        "pushingcap.com/*",
        "www.pushingcap.com/*",
        "platform.pushingcap.com/*",
        "userone.app/*",
        "www.userone.app/*",
    ]

    return result


def collect_platform_routes() -> dict:
    """Map all www.pushingcap.com routes and API surfaces."""
    ui_routes = [
        # ── Public ──────────────────────────────────────────────────────────────
        {"path": "/", "desc": "Homepage — Pushing Capital marketing hub"},
        {"path": "/gate", "desc": "Authenticated entry gate (PCRM login)"},
        {"path": "/intelligence", "desc": "Command center dashboard (platform home)"},
        {"path": "/contacts", "desc": "Contact registry — Golden Record view"},
        {"path": "/contacts/[id]", "desc": "Single contact record (identity ledger)"},
        {"path": "/contacts/deals", "desc": "Deals pipeline linked to contacts"},
        {"path": "/contacts/groups", "desc": "Contact grouping and segmentation"},
        {"path": "/contacts/identity", "desc": "Golden Record identity ledger (pc_gold)"},
        {"path": "/databases", "desc": "Database registry topology map"},
        {"path": "/database-registry", "desc": "Full database schema browser"},
        {"path": "/pipelines", "desc": "Deal pipelines and stage manager"},
        {"path": "/tasks", "desc": "Task management surface"},
        {"path": "/tickets", "desc": "Support ticket tracker"},
        {"path": "/records", "desc": "Unified record system"},
        {"path": "/workflows", "desc": "Workflow automation configuration"},
        {"path": "/automations", "desc": "Automation builder and scheduler"},
        {"path": "/outreach", "desc": "Client outreach campaigns"},
        {"path": "/machines", "desc": "Machine / equipment registry"},
        {"path": "/workers", "desc": "Worker registry (agents + humans)"},
        {"path": "/finance", "desc": "Finance surface (invoices, payments)"},
        {"path": "/paygates", "desc": "Payment gateway manager"},
        {"path": "/logistics", "desc": "Transport and logistics layer"},
        {"path": "/automotive", "desc": "Automotive vertical surface"},
        {"path": "/networks", "desc": "Network topology viewer"},
        {"path": "/security", "desc": "Security dashboard and secrets"},
        {"path": "/vault", "desc": "Secrets vault"},
        {"path": "/semantic-memory", "desc": "Semantic memory search surface"},
        {"path": "/live", "desc": "Real-time live session surface"},
        {"path": "/platform", "desc": "Platform studio overview"},
        {"path": "/metadata", "desc": "Platform metadata registry"},
        {"path": "/schema-manifest", "desc": "Schema manifest viewer"},
        {"path": "/subscriptions", "desc": "Subscription management"},
        {"path": "/p", "desc": "P :: VAULT — direct P terminal interface (THIS SURFACE)"},
        {"path": "/p/quick", "desc": "P quick-fire command mode"},
        {"path": "/for-dealers", "desc": "Dealer-facing public portal"},
        {"path": "/for-lenders", "desc": "Lender-facing public portal"},
        # ── Asset Studio ─────────────────────────────────────────────────────────
        {"path": "/asset-studio", "desc": "Asset Studio root — multi-vertical CRM"},
        {"path": "/asset-studio/pcrm-bridge", "desc": "PCRM bridge: gateway + database map"},
        {"path": "/asset-studio/platform-studio", "desc": "Platform Studio: Postman, Agents, Debate, Workflow, Memory"},
        {"path": "/asset-studio/memory-layer", "desc": "Memory Layer topology viewer"},
        {"path": "/asset-studio/orchestration-layer", "desc": "Orchestration layer (6-phase workflow)"},
        {"path": "/asset-studio/contacts", "desc": "Asset Studio contacts"},
        {"path": "/asset-studio/paper", "desc": "Paper/document management"},
        {"path": "/asset-studio/parts", "desc": "Parts inventory"},
        {"path": "/asset-studio/inspections", "desc": "Inspection management"},
        {"path": "/asset-studio/subcontractors", "desc": "Subcontractor dispatch"},
        {"path": "/asset-studio/sales", "desc": "Sales desk surface"},
        {"path": "/asset-studio/finance", "desc": "Finance surface (asset studio)"},
        {"path": "/asset-studio/forms", "desc": "Form builder and intake"},
        {"path": "/asset-studio/transport", "desc": "Transport booking"},
        # ── Portal ───────────────────────────────────────────────────────────────
        {"path": "/portal", "desc": "Client portal"},
        {"path": "/portal/settings/social", "desc": "Social connectivity settings"},
        {"path": "/subcontractor", "desc": "Subcontractor job portal"},
    ]

    api_routes = [
        # ── Agent / P ────────────────────────────────────────────────────────────
        {"method": "POST", "path": "/api/p", "desc": "P terminal relay — proxies to p_web_relay.py via Cloudflare Tunnel"},
        {"method": "POST", "path": "/api/swarm/dispatch", "desc": "Swarm worker dispatcher (Gemini-powered routing)"},
        {"method": "POST", "path": "/api/swarm/message", "desc": "Swarm message router → D1 EDGE_APP_DB"},
        {"method": "POST", "path": "/api/swarm/execute", "desc": "Direct swarm execution surface"},
        {"method": "POST", "path": "/api/swarm/heartbeat", "desc": "Worker heartbeat / health signal"},
        {"method": "POST", "path": "/api/worker/dispatch", "desc": "Worker task dispatch queue"},
        {"method": "POST", "path": "/api/worker/test", "desc": "Worker test harness"},
        # ── Contacts ─────────────────────────────────────────────────────────────
        {"method": "GET|POST", "path": "/api/contacts", "desc": "Contact list and create → pc_gold identity_ledger"},
        {"method": "GET|PATCH", "path": "/api/contacts/[id]", "desc": "Single contact read/update"},
        {"method": "GET", "path": "/api/contacts/deals", "desc": "Deals linked to contact"},
        {"method": "GET", "path": "/api/contacts/groups", "desc": "Contact groups"},
        {"method": "POST", "path": "/api/contacts/merge", "desc": "Merge records into Golden Record (runs bq + python)"},
        {"method": "POST", "path": "/api/contacts/search", "desc": "Semantic contact search"},
        # ── Telemetry ────────────────────────────────────────────────────────────
        {"method": "GET", "path": "/api/telemetry/live", "desc": "Live platform telemetry stream"},
        {"method": "GET", "path": "/api/telemetry/schemas", "desc": "Schema telemetry"},
        {"method": "GET", "path": "/api/topology", "desc": "GCP + Cloudflare topology (runs gcloud via shell)"},
        {"method": "GET", "path": "/api/mesh/status", "desc": "Swarm mesh status — all worker health"},
        # ── Settings / Social ─────────────────────────────────────────────────────
        {"method": "POST", "path": "/api/settings/social/[provider]/connect", "desc": "OAuth social connect (Meta, TikTok, YouTube)"},
        {"method": "GET", "path": "/api/settings/social/[provider]/callback", "desc": "OAuth callback handler"},
        {"method": "POST", "path": "/api/settings/social/[provider]/refresh", "desc": "Token refresh"},
        {"method": "GET", "path": "/api/settings/social/status", "desc": "Social account health check"},
        # ── Workflows / Automations ───────────────────────────────────────────────
        {"method": "GET|POST", "path": "/api/settings/company/automations", "desc": "Automation CRUD"},
        {"method": "POST", "path": "/api/workflows/outbound-sms", "desc": "Outbound SMS dispatch"},
        {"method": "POST", "path": "/api/webhooks/sms-reply", "desc": "Inbound SMS webhook handler"},
        # ── Finance / Billing ─────────────────────────────────────────────────────
        {"method": "GET|POST", "path": "/api/billing", "desc": "Billing surface"},
        {"method": "GET|POST", "path": "/api/automotive", "desc": "Automotive data surface"},
        {"method": "GET", "path": "/api/machines", "desc": "Machine registry API"},
        {"method": "GET|POST", "path": "/api/cloud/services", "desc": "Cloud service catalog"},
        # ── Portal ────────────────────────────────────────────────────────────────
        {"method": "POST", "path": "/api/clientportal/bootstrap", "desc": "Client portal bootstrap (provision)"},
        {"method": "POST", "path": "/api/clientportal/presence", "desc": "Client presence signal"},
        {"method": "POST", "path": "/api/clientportal/provision-credential", "desc": "Client credential provision"},
        {"method": "GET|POST", "path": "/api/portal/threads", "desc": "Portal thread management"},
        {"method": "GET", "path": "/api/portal/pipeline", "desc": "Portal deal pipeline data"},
        # ── Auth ──────────────────────────────────────────────────────────────────
        {"method": "ANY", "path": "/api/auth/[...nextauth]", "desc": "NextAuth — Google OAuth gate"},
        {"method": "ANY", "path": "/api/auth/swarm", "desc": "Swarm auth bridge"},
        {"method": "GET", "path": "/api/gate", "desc": "Platform gate validation"},
        {"method": "GET", "path": "/api/gate/html", "desc": "Gate HTML surface"},
        # ── Live ──────────────────────────────────────────────────────────────────
        {"method": "GET", "path": "/api/live/ai/[sessionId]", "desc": "Live AI session stream"},
        {"method": "GET", "path": "/api/live/dashboard/[dashboardId]", "desc": "Live dashboard data stream"},
        # ── Jobs / Subcontractor ──────────────────────────────────────────────────
        {"method": "GET|POST", "path": "/api/subcontractor/jobs", "desc": "Subcontractor job board"},
        {"method": "GET|PATCH", "path": "/api/subcontractor/jobs/[jobId]", "desc": "Single job record"},
    ]

    return {"ui_routes": ui_routes, "api_routes": api_routes}


def collect_antigravity_relay() -> dict:
    """Map the Antigravity relay topology."""
    return {
        "description": "Antigravity is the AI coding assistant IDE embedded in the platform workspace.",
        "relay_endpoints": {
            "swarm_api": "http://localhost:3001/api/swarm/message",
            "dispatch_api": "https://www.pushingcap.com/api/swarm/dispatch",
            "p_relay": "https://wherever-silly-medal-within.trycloudflare.com/api/p",
            "platform_api": "https://www.pushingcap.com/api/p",
        },
        "p_bridge_architecture": {
            "ui": "www.pushingcap.com/p → vault gate (any 3+ char passkey)",
            "api": "POST /api/p → Cloudflare Worker → getWorkerEnv() P_RELAY_URL",
            "tunnel": "cloudflared → localhost:7778 → p_web_relay.py",
            "bridge": "p_chat_bridge.py → talk_to_p.py → LocalP (Gemini/gemini-2.5-pro)",
            "auth": "GCP_SERVICE_ACCOUNT_KEY from secrets.env → service account (no reauth)",
            "logging": "pc_client_communications table via pc-sql-connector Cloud Function",
        },
        "swarm_targets": {
            "P": "Default — routes to p_chat_bridge.py → LocalP",
            "Antigravity": "IDE relay — logs transmission to context boundary",
            "ALPHA": "PushingTransport logistics pipeline node",
        },
        "broadcast_channels": {
            "pc_workstream_ledger": "P invocation telemetry log",
            "pc_client_communications": "All operator↔agent message pairs",
            "EDGE_APP_DB": "Cloudflare D1 — swarm routing and mesh state",
            "PORTAL_DB": "Cloudflare D1 — portal sessions and threads",
        },
    }


def collect_gemini() -> dict:
    """Map Gemini and Vertex AI resources."""
    return {
        "default_model": "gemini-2.5-pro",
        "available_models": [
            {"id": "gemini-2.5-pro", "role": "P default — deep reasoning, 2M context"},
            {"id": "gemini-2.5-flash", "role": "Fast, capable — used for simple tasks"},
            {"id": "gemini-2.0-flash", "role": "Fallback flash"},
        ],
        "enterprise": {
            "engine_id": "gemini-enterprise-1767472367566",
            "api_base": "https://us-discoveryengine.googleapis.com",
            "auth": "gcloud auth print-access-token (manny@pushingcap.com)",
        },
        "api_key_env": "GEMINI_API_KEY",
        "api_key_source": "/Users/emmanuelhaddad/.config/pushingcapital/secrets.env",
        "notebooks": {
            "p_core_brain": "736ddaaf-2b88-4057-8c18-f4cf777a9294",
            "p_runtime_channels_actions": "46fd9eab-e871-41b8-ab06-e553d37c472d",
            "control_plane_atlas": "e25d4029-8ec3-40c6-ae30-4abe6f892520",
            "ecosystem_corpus": "ae7a85ae-3574-46f4-98e0-0e84eabb56b7",
        },
    }


# ── Memory document builder ───────────────────────────────────────────────────

def collect_cloud_run(secrets: dict) -> dict:
    """Live-query Cloud Run services."""
    env = {**os.environ, "GOOGLE_CLOUD_PROJECT": PROJECT_ID,
           "PATH": f"/opt/homebrew/bin:/opt/homebrew/share/google-cloud-sdk/bin:{os.environ.get('PATH', '')}"}
    sa_key = secrets.get("GCP_SERVICE_ACCOUNT_KEY", "")
    if sa_key:
        key_path = Path("/tmp/p_sa_key_tmp.json")
        key_path.write_text(sa_key)
        env["GOOGLE_APPLICATION_CREDENTIALS"] = str(key_path)
    raw = run_json([GCLOUD, "run", "services", "list", "--platform=managed",
                    f"--project={PROJECT_ID}", "--format=json"], timeout=30)
    if isinstance(raw, list):
        return {"services": [
            {"name": s.get("metadata", {}).get("name"),
             "url": s.get("status", {}).get("url"),
             "region": s.get("metadata", {}).get("labels", {}).get("cloud.googleapis.com/location", ""),
             "ready": any(c.get("type") == "Ready" and c.get("status") == "True"
                          for c in s.get("status", {}).get("conditions", []))}
            for s in raw
        ]}
    return {"services": [], "error": "Could not fetch — auth may need SA activation"}


def collect_p_capabilities() -> dict:
    """Document the full P tool registry — all callable tools."""
    return {
        "description": "P's full agentic tool registry. These are all functions P can call autonomously.",
        "tool_groups": {
            "BigQuery": [
                {"tool": "list_datasets", "desc": "List all BigQuery datasets in brain-481809"},
                {"tool": "list_tables", "desc": "List tables in a dataset"},
                {"tool": "get_table_schema", "desc": "Get schema for a specific table"},
                {"tool": "query_bigquery", "desc": "Run a SQL query and return results"},
            ],
            "Vertex AI": [
                {"tool": "vertex_ai_generate", "desc": "Call Vertex AI text generation (Gemini via Vertex)"},
                {"tool": "vertex_ai_list_endpoints", "desc": "List deployed Vertex AI endpoints"},
            ],
            "Cloud Run": [
                {"tool": "cloud_run_list", "desc": "List all Cloud Run services in brain-481809"},
                {"tool": "cloud_run_describe", "desc": "Describe a specific Cloud Run service"},
                {"tool": "cloud_run_deploy", "desc": "Deploy or update a Cloud Run service from a container image"},
                {"tool": "cloud_run_invoke", "desc": "Call a Cloud Run service endpoint with auth token"},
                {"tool": "cloud_run_logs", "desc": "Tail Cloud Logging for a Cloud Run service"},
            ],
            "Gemini CLI": [
                {"tool": "gemini_cli_prompt", "desc": "Run a one-shot prompt through the Gemini CLI (node /opt/homebrew/bin/gemini)"},
                {"tool": "gemini_cli_run_in_dir", "desc": "Run Gemini CLI in a specific directory for code-aware agentic tasks"},
            ],
            "Memory / NotebookLM": [
                {"tool": "answer_core_memory", "desc": "Answer a question using NotebookLM notebook (long-form synthesis)"},
                {"tool": "search_core_memory", "desc": "Search notebooks for relevant context"},
                {"tool": "get_p_notebook_catalog", "desc": "Return the full list of available P notebooks"},
            ],
            "GitHub": [
                {"tool": "github_whoami", "desc": "Return authenticated GitHub user"},
                {"tool": "github_clone_repo", "desc": "Clone a GitHub repo locally"},
                {"tool": "github_list_repos", "desc": "List repos for owner"},
                {"tool": "github_view_repo", "desc": "View repo details and structure"},
                {"tool": "github_read_file", "desc": "Read a file from a GitHub repo"},
                {"tool": "github_repo_status", "desc": "Git status for a local repo"},
                {"tool": "github_checkout_branch", "desc": "Checkout or create a branch"},
                {"tool": "github_commit_and_push", "desc": "Commit files and push to remote"},
                {"tool": "github_create_pr", "desc": "Create a pull request"},
                {"tool": "github_comment_thread", "desc": "Comment on an issue or PR"},
                {"tool": "github_run_workflow", "desc": "Trigger a GitHub Actions workflow"},
            ],
            "Browser / Playwright": [
                {"tool": "open_browser", "desc": "Open a URL in the system browser"},
                {"tool": "playwright_mcp", "desc": "Control a headless browser session (open, click, type, snapshot, screenshot)"},
                {"tool": "playwright_vision", "desc": "Describe what a browser page looks like using Gemini vision"},
            ],
            "Shell": [
                {"tool": "execute_shell", "desc": "Run any zsh shell command on Manny's Mac and return stdout/stderr"},
            ],
            "Communications": [
                {"tool": "send_email", "desc": "Send email from pushingP@pushingcap.com"},
                {"tool": "read_email", "desc": "Read email from P's inbox"},
                {"tool": "send_sms", "desc": "Send SMS/iMessage"},
                {"tool": "read_sms", "desc": "Read SMS/iMessage history"},
                {"tool": "understand_comms_thread", "desc": "Analyze a conversation thread and draft a reply"},
                {"tool": "voice_gateway_ask", "desc": "Ask the voice gateway a question"},
            ],
            "Historical Logs": [
                {"tool": "list_antigravity_sessions", "desc": "List all Antigravity (Gemini IDE) conversation sessions"},
                {"tool": "read_antigravity_logs", "desc": "Read a specific Antigravity session's conversation log"},
                {"tool": "read_codex_history", "desc": "Read Codex CLI conversation history (JSONL + SQLite)"},
                {"tool": "read_gemini_cli_history", "desc": "Read Gemini CLI (google/gemini-cli) session history"},
            ],
            "Auth": [
                {"tool": "gcloud_auth_refresh", "desc": "Refresh GCP auth by activating the service account key from secrets.env"},
            ],
        },
        "log_paths": {
            "antigravity_brain": "/Users/emmanuelhaddad/.gemini/antigravity/brain/",
            "codex_history_jsonl": "/Users/emmanuelhaddad/.codex/history.jsonl",
            "codex_sqlite": "/Users/emmanuelhaddad/.codex/logs_2.sqlite",
            "gemini_cli_history": "/Users/emmanuelhaddad/.gemini/history/",
            "gemini_cli_settings": "/Users/emmanuelhaddad/.gemini/settings.json",
            "secrets_env": "/Users/emmanuelhaddad/.config/pushingcapital/secrets.env",
            "platform_memory_md": "/Users/emmanuelhaddad/.config/pushingcapital/p_platform_memory.md",
            "platform_memory_json": "/Users/emmanuelhaddad/.config/pushingcapital/p_platform_memory.json",
        },
        "gemini_cli_binary": "/opt/homebrew/bin/gemini",
        "gemini_cli_node": "/Users/emmanuelhaddad/.nvm/versions/node/v22.14.0/bin/node",
        "gemini_cli_version": "0.37.2",
        "gemini_cli_usage": "node /opt/homebrew/bin/gemini --model gemini-2.5-pro --no-sandbox --yolo -p 'YOUR_PROMPT'",
    }


def build_memory(data: dict) -> str:
    now = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    gcloud = data["gcloud"]
    cf = data["cloudflare"]
    platform = data["platform"]
    relay = data["antigravity_relay"]
    gemini = data["gemini"]
    cloud_run = data.get("cloud_run", {})
    p_caps = data.get("p_capabilities", {})

    lines: list[str] = [
        f"# P Platform Memory Layer",
        f"",
        f"> Auto-generated: {now}",
        f"> This document is P's live situational awareness brief for the Pushing Capital platform.",
        f"> Load this into P's context on every session start.",
        f"",
        f"---",
        f"",
        f"## 1. Who P Is & How P Got Here",
        f"",
        f"P is `talk_to_p.py` — a Gemini-powered agentic operator running on Manny's Mac Studio.",
        f"P is reachable from the web via the **P :: VAULT** interface at `https://www.pushingcap.com/p`.",
        f"",
        f"### P Runtime Chain",
        f"```",
        f"www.pushingcap.com/p  (browser UI)",
        f"  → POST /api/p  (Cloudflare Worker, reads P_RELAY_URL from Worker env)",
        f"  → {relay['p_bridge_architecture']['tunnel']}",
        f"  → p_web_relay.py (localhost:7779)",
        f"  → p_chat_bridge.py --prompt \"...\"",
        f"  → talk_to_p.py → LocalP (gemini-2.5-pro)",
        f"  ← reply JSON back through the chain",
        f"```",
        f"",
        f"### Auth",
        f"- P uses `GCP_SERVICE_ACCOUNT_KEY` from `~/.config/pushingcapital/secrets.env`",
        f"- Service account: `p-pcrm-cloudsdk@brain-481809.iam.gserviceaccount.com`",
        f"- GEMINI_API_KEY is also in secrets.env",
        f"- GOOGLE_AUTH_PASSWORD is also in secrets.env (for fallback user-level auth)",
        f"- No interactive reauth needed — SA key bypasses gcloud user credential flow",
        f"- Call `gcloud_auth_refresh` if any GCP command fails with auth error",
        f"",
        f"---",
        f"",
        f"## 2. www.pushingcap.com — Full Route Map",
        f"",
        f"### UI Pages",
    ]

    for r in platform["ui_routes"]:
        lines.append(f"- `{r['path']}` — {r['desc']}")

    lines += [
        f"",
        f"### API Endpoints (POST/GET from any relay)",
    ]
    for r in platform["api_routes"]:
        lines.append(f"- `{r['method']} {r['path']}` — {r['desc']}")

    lines += [
        f"",
        f"---",
        f"",
        f"## 3. Cloudflare Infrastructure",
        f"",
        f"### Worker",
        f"- **Name**: `{cf['worker_name']}`",
        f"- **Routes**: {', '.join(cf['routes'])}",
        f"- **P_RELAY_URL**: `{cf['tunnel_url']}`",
        f"- **Local relay**: `{cf['relay_script']}` on port `{cf['relay_port']}`",
        f"",
        f"### D1 Databases (Cloudflare SQLite)",
    ]
    for d in cf.get("d1_databases", []):
        lines.append(f"- `{d.get('name', '')}` (id: `{d.get('id', d.get('binding', '?'))}`)") 

    lines += [
        f"",
        f"### R2 Buckets (Cloudflare Object Storage)",
    ]
    for b in cf.get("r2_buckets", []):
        lines.append(f"- `{b}`")

    lines += [
        f"",
        f"### Queues",
    ]
    for q in cf.get("queues", []):
        lines.append(f"- `{q}`")

    lines += [
        f"",
        f"### Wrangler CLI",
        f"```bash",
        f"cd /Users/emmanuelhaddad/pushing-platform/projects/pushingcap-web-v2",
        f"npm run deploy                                  # Build + deploy",
        f"npx wrangler tail pushingcap-web-v2            # Tail logs",
        f"npx wrangler d1 execute pushingcap-edge-app --command 'SELECT ...'",
        f"npx wrangler r2 object get p-vault/some-key",
        f"```",
        f"",
        f"---",
        f"",
        f"## 4. Google Cloud SDK",
        f"",
        f"### Project",
        f"- **ID**: `{gcloud.get('project', PROJECT_ID)}`",
        f"- **Number**: `660085746842`",
        f"- **Active account**: `{gcloud.get('active_account', 'manny@pushingcap.com')}`",
        f"",
        f"### Compute VMs",
    ]

    vms = gcloud.get("compute_vms", [])
    if vms:
        for vm in vms:
            lines.append(f"- `{vm['name']}` ({vm['zone']}) — {vm['status']} — `{vm['ip']}` — {vm['machine_type']}")
    else:
        lines += [
            "- `crm-app-vm-20260313` (us-central1-a) — RUNNING — 10.128.0.16 (live PCRM)",
            "- `crm-prod-1` (us-central1-a) — RUNNING — 10.128.0.2",
            "- `pc-ecosystem-corpus-processor-01` — 10.128.0.20",
            "- `pc-recovery-executor-01` — 10.128.0.19",
        ]

    lines += [
        f"",
        f"### SSH IAP Shortcuts",
        f"```bash",
        f"ssh gce-crm-app-iap            # → crm-app-vm-20260313 (live PCRM)",
        f"ssh gce-crm-prod-iap           # → crm-prod-1",
        f"ssh gce-ecosystem-processor-iap # → pc-ecosystem-corpus-processor-01",
        f"ssh gce-recovery-executor-iap  # → pc-recovery-executor-01",
        f"```",
        f"",
        f"### Cloud SQL Instances",
    ]

    sql = gcloud.get("cloud_sql", [])
    if sql:
        for s in sql:
            lines.append(f"- `{s['name']}` — {s.get('state', '?')} — {s.get('version', '?')} — `{s.get('ip', '?')}`")
    else:
        lines += [
            "- `pc-gold` → `pc_identity_platform` (Golden Record / identity ledger)",
            "- `pc-canonical-core-pg` → `pc_registry_core`, `pc_parties_core`, `pc_documents_core`",
            "- `pc-platform-adjacent-pg` → `pc_platform_projection_sync`",
            "- `pc-worker-runtime-pg` → `pc_worker_registry`",
            "- SQL connector: `https://us-central1-brain-481809.cloudfunctions.net/pc-sql-connector`",
        ]

    lines += [
        f"",
        f"### BigQuery Datasets (`brain-481809`)",
    ]
    datasets = gcloud.get("bigquery_datasets", [])
    known_datasets = {
        "agentic_ecosystem_v1": "action registry, worker surfaces, source chunks, entity links",
        "worker_pulse_memory_v1": "task ledger, operation logs",
        "notebooklm_curated_v1": "notebook registry, source bundles",
        "pc_gold": "Golden Record identity ledger (contacts + deals)",
    }
    for ds in (datasets or list(known_datasets.keys())):
        desc = known_datasets.get(ds, "")
        lines.append(f"- `brain-481809.{ds}` — {desc}")

    lines += [
        f"",
        f"#### Key BigQuery Tables",
        f"```sql",
        f"SELECT * FROM brain-481809.pc_gold.identity_ledger LIMIT 10;",
        f"SELECT * FROM brain-481809.agentic_ecosystem_v1.worker_surface_inventory LIMIT 10;",
        f"SELECT * FROM brain-481809.agentic_ecosystem_v1.action_contract_registry LIMIT 10;",
        f"SELECT * FROM brain-481809.worker_pulse_memory_v1.task_ledger LIMIT 10;",
        f"```",
        f"",
        f"### GCS Buckets",
    ]
    for b in gcloud.get("gcs_buckets", ["gs://pc-bootstrap-imports-brain-481809", "gs://pc-raw-object-evidence-brain-481809"]):
        lines.append(f"- `{b}`")

    lines += [
        f"",
        f"### Cloud Functions",
    ]
    fns = gcloud.get("cloud_functions", [])
    if fns:
        for f in fns:
            lines.append(f"- `{f.get('name')}` — {f.get('status', '?')} — `{f.get('url', '')}`")
    else:
        lines += ["- `pc-sql-connector` — `https://us-central1-brain-481809.cloudfunctions.net/pc-sql-connector`"]

    lines += [
        f"",
        f"---",
        f"",
        f"## 5. Gemini & AI Layer",
        f"",
        f"- **Default model**: `{gemini['default_model']}`",
        f"- **GEMINI_API_KEY**: in `~/.config/pushingcapital/secrets.env`",
    ]
    for m in gemini.get("available_models", []):
        lines.append(f"- `{m['id']}` — {m['role']}")

    lines += [f"", f"### NotebookLM Notebooks"]
    for label, nb_id in gemini.get("notebooks", {}).items():
        lines.append(f"- `{label}`: `{nb_id}`")

    lines += [
        f"",
        f"### Gemini CLI",
        f"- Binary: `{p_caps.get('gemini_cli_binary', '/opt/homebrew/bin/gemini')}`",
        f"- Node: `{p_caps.get('gemini_cli_node', '/Users/emmanuelhaddad/.nvm/versions/node/v22.14.0/bin/node')}`",
        f"- Version: `{p_caps.get('gemini_cli_version', '0.37.2')}`",
        f"- Usage: `{p_caps.get('gemini_cli_usage', 'node /opt/homebrew/bin/gemini --model gemini-2.5-pro --no-sandbox --yolo -p YOUR_PROMPT')}`",
        f"",
        f"---",
        f"",
        f"## 6. Antigravity Relay Topology",
        f"",
        f"### Relay Endpoints",
    ]
    for name, url in relay.get("relay_endpoints", {}).items():
        lines.append(f"- `{name}`: `{url}`")

    lines += [f"", f"### Swarm Targets"]
    for target, desc in relay.get("swarm_targets", {}).items():
        lines.append(f"- `{target}` — {desc}")

    lines += [f"", f"### Broadcast Channels"]
    for ch, desc in relay.get("broadcast_channels", {}).items():
        lines.append(f"- `{ch}` — {desc}")

    # ── Section 7: Platform POST/GET ──
    lines += [
        f"",
        f"---",
        f"",
        f"## 7. How P Can POST and GET from the Platform",
        f"",
        f"```bash",
        f"# Swarm message",
        f"curl -s -X POST https://www.pushingcap.com/api/swarm/message \\",
        f"  -H 'Content-Type: application/json' \\",
        f"  -d '{{\"sender\": \"P\", \"target_worker\": \"ANTIGRAVITY\", \"command\": \"Hello\"}}'",
        f"",
        f"# Contacts",
        f"curl -s https://www.pushingcap.com/api/contacts",
        f"",
        f"# P relay health",
        f"curl -s http://localhost:7779/health",
        f"curl -s http://localhost:7779/memory",
        f"",
        f"# Memory refresh",
        f"curl -s -X POST http://localhost:7779/memory/refresh",
        f"```",
        f"",
        f"---",
        f"",
        f"## 8. Cloud Run Services (brain-481809)",
    ]

    if cloud_run.get("services"):
        for svc in cloud_run["services"]:
            status = "✅ Ready" if svc.get("ready") else "⚠️"
            lines.append(f"- `{svc.get('name')}` ({svc.get('region', '?')}) {status} — `{svc.get('url', '?')}`")
    else:
        lines += [
            "- `userone-courses-mvp` — https://userone-courses-mvp-660085746842.us-central1.run.app",
            "- `pc-sql-connector` (Cloud Function / Run) — SQL bridge",
            "- Use `cloud_run_list` tool to get live list",
        ]

    lines += [
        f"",
        f"### Cloud Run CLI (for P to use via execute_shell or cloud_run_* tools)",
        f"```bash",
        f"gcloud run services list --platform=managed --region=us-central1 --project=brain-481809",
        f"gcloud run deploy SERVICE --image=IMAGE --platform=managed --region=us-central1",
        f"gcloud run services describe SERVICE --platform=managed --region=us-central1",
        f"gcloud run services delete SERVICE --platform=managed --region=us-central1",
        f"gcloud logging read 'resource.type=cloud_run_revision AND resource.labels.service_name=SERVICE' --limit=50",
        f"```",
        f"",
        f"---",
        f"",
        f"## 9. P Full Capability Registry",
        f"",
        f"P can autonomously invoke these tools (Gemini function calling):",
    ]

    for group, tools in p_caps.get("tool_groups", {}).items():
        lines.append(f"")
        lines.append(f"### {group}")
        for t in tools:
            lines.append(f"- `{t['tool']}` — {t['desc']}")

    lines += [
        f"",
        f"---",
        f"",
        f"## 10. Historical Log Paths",
        f"",
    ]
    for name, path in p_caps.get("log_paths", {}).items():
        lines.append(f"- **{name}**: `{path}`")

    lines += [
        f"",
        f"### How to Read Logs (P tool examples)",
        f"```",
        f"list_antigravity_sessions()                     # see all sessions",
        f"read_antigravity_logs(conversation_id='6e12..') # read specific session",
        f"read_codex_history(limit=50, query='contacts')  # search codex logs",
        f"read_gemini_cli_history(limit=30)               # gemini CLI history",
        f"```",
        f"",
        f"---",
        f"",
        f"## 11. Quick Restart",
        f"",
        f"```bash",
        f"# Full restart (run once — handles everything)",
        f"/Users/emmanuelhaddad/pushing-platform/bin/start_p_vault.sh",
        f"",
        f"# Or manual:",
        f"python3 /Users/emmanuelhaddad/pushing-platform/bin/p_web_relay.py --port 7779 &",
        f"cloudflared tunnel --url http://localhost:7779 &",
        f"python3 /Users/emmanuelhaddad/pushing-platform/bin/p_memory_builder.py",
        f"```",
        f"",
        f"---",
        f"*Generated by p_memory_builder.py — refresh: `POST http://localhost:7779/memory/refresh`*",
    ]

    return "\n".join(lines)


# ── Main ──────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(description="Build P's platform memory layer.")
    parser.add_argument("--quiet", action="store_true", help="Suppress progress output")
    parser.add_argument("--json-only", action="store_true", help="Only write JSON, not markdown")
    args = parser.parse_args()

    def log(msg: str) -> None:
        if not args.quiet:
            print(msg, flush=True)

    log("🧠 Building P platform memory layer...")
    secrets = load_secrets()

    log("   ↳ gcloud / GCP...")
    gcloud_data = collect_gcloud(secrets)

    log("   ↳ Cloud Run...")
    cloud_run_data = collect_cloud_run(secrets)

    log("   ↳ Cloudflare...")
    cf_data = collect_cloudflare()

    log("   ↳ Platform routes...")
    platform_data = collect_platform_routes()

    log("   ↳ Relay topology...")
    relay_data = collect_antigravity_relay()

    log("   ↳ Gemini...")
    gemini_data = collect_gemini()

    log("   ↳ P capability registry...")
    p_caps_data = collect_p_capabilities()

    full = {
        "generated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "gcloud": gcloud_data,
        "cloud_run": cloud_run_data,
        "cloudflare": cf_data,
        "platform": platform_data,
        "antigravity_relay": relay_data,
        "gemini": gemini_data,
        "p_capabilities": p_caps_data,
    }

    # Write JSON
    OUTPUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_JSON.write_text(json.dumps(full, indent=2, default=str))
    log(f"   ✅ JSON → {OUTPUT_JSON}")

    if not args.json_only:
        md = build_memory(full)
        OUTPUT_MD.write_text(md)
        log(f"   ✅ Markdown → {OUTPUT_MD}")

    log("\n✅ P memory layer built successfully.")
    log(f"   Load into P: read {OUTPUT_MD}")


if __name__ == "__main__":
    main()

if __name__ == "__main__":
    main()
