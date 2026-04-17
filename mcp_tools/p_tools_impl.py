import base64
import json
import os
import subprocess
import time
import urllib.request
from pathlib import Path

import requests


SECRETS_PATH = Path("/Users/emmanuelhaddad/.config/pushingcapital/secrets.env")
DEFAULT_GCP_PROJECT = "brain-481809"
SECRET_CACHE = {}
ENV_CACHE = None
PLAYWRIGHT_WRAPPER = Path("/Users/emmanuelhaddad/.codex/skills/playwright/scripts/playwright_cli.sh")
DEFAULT_PLAYWRIGHT_SESSION = "p"
VOICE_GATEWAY_BASE = "https://pushing-capital-voice-gateway.manny-861.workers.dev"
VOICE_GATEWAY_TOKEN = "pc_voice_manny_2026"
VOICE_GATEWAY_RELAY_ID = "macstudio_adk_v2"
INGEST_CHUNK_SIZE = int(os.environ.get("P_MEMORY_INGEST_CHUNK_SIZE", "5000"))


def _parse_env_file(path):
    values = {}
    if not path.exists():
        return values
    for raw_line in path.read_text(encoding="utf-8", errors="ignore").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        if line.startswith("export "):
            line = line[7:].strip()
        if "=" not in line:
            continue
        key, value = line.split("=", 1)
        values[key.strip()] = value.strip().strip("'\"")
    return values


def _env_value(name):
    direct = os.environ.get(name, "").strip()
    if direct:
        return direct
    global ENV_CACHE
    if ENV_CACHE is None:
        ENV_CACHE = _parse_env_file(SECRETS_PATH)
    return str(ENV_CACHE.get(name, "")).strip()


def _load_service_account_info():
    raw = _env_value("GCP_SERVICE_ACCOUNT_KEY")
    if not raw:
        return None
    try:
        return json.loads(raw)
    except Exception:
        return None


def _get_gcp_project_id():
    info = _load_service_account_info() or {}
    return (
        _env_value("GOOGLE_CLOUD_PROJECT")
        or _env_value("GCP_PROJECT_ID")
        or str(info.get("project_id") or "").strip()
        or DEFAULT_GCP_PROJECT
    )


def _get_access_token(get_token_fn=None):
    if get_token_fn:
        try:
            token = str(get_token_fn() or "").strip()
            if token:
                return token
        except Exception:
            pass

    info = _load_service_account_info()
    if info:
        try:
            from google.auth.transport.requests import Request as GoogleRequest
            from google.oauth2 import service_account

            credentials = service_account.Credentials.from_service_account_info(
                info,
                scopes=["https://www.googleapis.com/auth/cloud-platform"],
            )
            credentials.refresh(GoogleRequest())
            token = str(credentials.token or "").strip()
            if token:
                return token
        except Exception:
            pass

    return run_cmd("gcloud auth print-access-token").strip()


def _get_secret_manager_value(secret_name, get_token_fn=None):
    cache_key = (secret_name, _get_gcp_project_id())
    if cache_key in SECRET_CACHE:
        return SECRET_CACHE[cache_key]

    token = _get_access_token(get_token_fn)
    if not token:
        return ""

    project_id = _get_gcp_project_id()
    url = f"https://secretmanager.googleapis.com/v1/projects/{project_id}/secrets/{secret_name}/versions/latest:access"
    try:
        response = requests.get(
            url,
            headers={"Authorization": f"Bearer {token}", "Accept": "application/json"},
            timeout=15,
        )
        if response.status_code != 200:
            return ""
        payload = response.json()
        encoded = str(payload.get("payload", {}).get("data") or "").strip()
        if not encoded:
            return ""
        value = base64.b64decode(encoded).decode("utf-8").strip()
    except Exception:
        return ""

    SECRET_CACHE[cache_key] = value
    return value


def _resolve_pcrm_bearer_token(get_token_fn=None):
    log = []
    token = _env_value("PCRM_BEARER_TOKEN")
    log.append(f"env_token: {token}")
    if token:
        with open("/tmp/pcrm_token_sources.log", "w") as f: f.write("\n".join(log))
        return token

    # Hardcoded fallback — persistent API key from platform.pushingcap.com
    PCRM_API_KEY = "ck_live_40379411b1e2d6e8.cks_qZz0fuZLpTz-mZaxQ7ktAFnlkcodUDI4"
    log.append(f"hardcoded_key: {PCRM_API_KEY[:20]}...")
    os.environ["PCRM_BEARER_TOKEN"] = PCRM_API_KEY
    with open("/tmp/pcrm_token_sources.log", "w") as f: f.write("\n".join(log))
    return PCRM_API_KEY


def _decode_bigquery_cell(cell, field):
    value = cell.get("v") if isinstance(cell, dict) else cell
    if value is None:
        return None

    mode = str(field.get("mode") or "").upper()
    field_type = str(field.get("type") or "").upper()

    if mode == "REPEATED":
        return [
            _decode_bigquery_cell(
                item,
                {**field, "mode": "NULLABLE"},
            )
            for item in (value or [])
        ]

    if field_type == "RECORD":
        nested_fields = field.get("fields") or []
        nested_values = value.get("f") if isinstance(value, dict) else []
        record = {}
        for idx, nested_field in enumerate(nested_fields):
            nested_cell = nested_values[idx] if idx < len(nested_values) else {"v": None}
            record[str(nested_field.get("name") or f"field_{idx}")] = _decode_bigquery_cell(
                nested_cell,
                nested_field,
            )
        return record

    return value


def _decode_bigquery_rows(payload):
    schema_fields = payload.get("schema", {}).get("fields") or []
    rows = []
    for row in payload.get("rows") or []:
        values = row.get("f") or []
        record = {}
        for idx, field in enumerate(schema_fields):
            name = str(field.get("name") or f"column_{idx}")
            cell = values[idx] if idx < len(values) else {"v": None}
            record[name] = _decode_bigquery_cell(cell, field)
        rows.append(record)
    return rows


def _bigquery_query(sql, get_token_fn=None):
    token = _get_access_token(get_token_fn)
    if not token:
        return "BigQuery error in query operation: No GCP access token available"

    project_id = _get_gcp_project_id()
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    try:
        response = requests.post(
            f"https://bigquery.googleapis.com/bigquery/v2/projects/{project_id}/queries",
            headers=headers,
            json={"query": sql, "useLegacySql": False},
            timeout=30,
        )
    except Exception as exc:
        return f"BigQuery error in query operation: {exc}"

    if response.status_code >= 400:
        detail = response.text.strip() or response.reason
        return f"BigQuery error in query operation: {detail}"

    payload = response.json()
    rows = _decode_bigquery_rows(payload)
    page_token = payload.get("pageToken")
    job_complete = bool(payload.get("jobComplete", True))
    job_ref = payload.get("jobReference") or {}
    job_id = str(job_ref.get("jobId") or "").strip()
    location = str(job_ref.get("location") or "US").strip()

    deadline = time.time() + 30
    while job_id and (page_token or not job_complete):
        if time.time() >= deadline:
            return "BigQuery error in query operation: Timed out waiting for query results"

        params = {"location": location, "maxResults": 1000}
        if page_token:
            params["pageToken"] = page_token
        if not job_complete:
            params["timeoutMs"] = 10000

        try:
            follow_up = requests.get(
                f"https://bigquery.googleapis.com/bigquery/v2/projects/{project_id}/queries/{job_id}",
                headers=headers,
                params=params,
                timeout=30,
            )
        except Exception as exc:
            return f"BigQuery error in query operation: {exc}"

        if follow_up.status_code >= 400:
            detail = follow_up.text.strip() or follow_up.reason
            return f"BigQuery error in query operation: {detail}"

        payload = follow_up.json()
        rows.extend(_decode_bigquery_rows(payload))
        page_token = payload.get("pageToken")
        job_complete = bool(payload.get("jobComplete", True))
        if not job_complete and not page_token:
            time.sleep(1)

    return json.dumps(rows)


def _vertex_location():
    return _env_value("GOOGLE_CLOUD_LOCATION") or _env_value("GCP_LOCATION") or "us-central1"


def _vertex_generate_text(args, get_token_fn=None):
    token = _get_access_token(get_token_fn)
    if not token:
        return json.dumps({"status": "error", "error": "No GCP access token available for Vertex AI"})

    project_id = _get_gcp_project_id()
    location = str(args.get("location") or _vertex_location()).strip() or "us-central1"
    model = str(args.get("model") or "gemini-2.5-pro").strip()
    prompt = str(args.get("prompt") or "").strip()
    if not prompt:
        return json.dumps({"status": "error", "error": "Missing prompt"})

    system = str(args.get("system") or "").strip()
    temperature = args.get("temperature")
    max_output_tokens = args.get("max_output_tokens")

    body = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": prompt}],
            }
        ]
    }
    if system:
        body["systemInstruction"] = {"parts": [{"text": system}]}

    generation_config = {}
    if temperature is not None:
        generation_config["temperature"] = float(temperature)
    if max_output_tokens is not None:
        generation_config["maxOutputTokens"] = int(max_output_tokens)
    if generation_config:
        body["generationConfig"] = generation_config

    url = (
        f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}"
        f"/publishers/google/models/{model}:generateContent"
    )

    try:
        response = requests.post(
            url,
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            json=body,
            timeout=60,
        )
    except Exception as exc:
        return json.dumps({"status": "error", "error": str(exc)})

    if response.status_code >= 400:
        return json.dumps({"status": "error", "error": response.text.strip() or response.reason, "http_status": response.status_code})

    payload = response.json()
    text_parts = []
    for candidate in payload.get("candidates") or []:
        content = candidate.get("content") or {}
        for part in content.get("parts") or []:
            if "text" in part:
                text_parts.append(str(part.get("text") or ""))

    return json.dumps(
        {
            "status": "success",
            "model": model,
            "location": location,
            "text": "\n".join([part for part in text_parts if part]).strip(),
            "raw": payload,
        }
    )


def _vertex_list_endpoints(args, get_token_fn=None):
    token = _get_access_token(get_token_fn)
    if not token:
        return json.dumps({"status": "error", "error": "No GCP access token available for Vertex AI"})

    project_id = _get_gcp_project_id()
    location = str(args.get("location") or _vertex_location()).strip() or "us-central1"
    page_size = int(args.get("page_size") or 25)
    url = f"https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/endpoints"

    try:
        response = requests.get(
            url,
            headers={
                "Authorization": f"Bearer {token}",
                "Accept": "application/json",
            },
            params={"pageSize": page_size},
            timeout=30,
        )
    except Exception as exc:
        return json.dumps({"status": "error", "error": str(exc)})

    if response.status_code >= 400:
        return json.dumps({"status": "error", "error": response.text.strip() or response.reason, "http_status": response.status_code})

    payload = response.json()
    endpoints = []
    for item in payload.get("endpoints") or []:
        endpoints.append(
            {
                "name": item.get("name"),
                "displayName": item.get("displayName"),
                "description": item.get("description"),
                "deployedModels": item.get("deployedModels") or [],
                "createTime": item.get("createTime"),
                "updateTime": item.get("updateTime"),
            }
        )

    return json.dumps({"status": "success", "location": location, "endpoints": endpoints, "raw": payload})


def run_cmd(cmd):
    try:
        p = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
        out, _ = p.communicate(timeout=60)
        return out
    except Exception as e:
        return str(e)


def _run_argv(argv, *, cwd=None, timeout=60):
    try:
        completed = subprocess.run(
            argv,
            cwd=cwd or None,
            capture_output=True,
            text=True,
            timeout=timeout,
            check=False,
        )
    except Exception as exc:
        return {"ok": False, "output": f"Command execution error: {exc}", "returncode": -1}

    output = (completed.stdout or "").strip()
    err = (completed.stderr or "").strip()
    if completed.returncode == 0:
        return {"ok": True, "output": output or "(ok)", "returncode": 0}
    detail = err or output or f"exit code {completed.returncode}"
    return {"ok": False, "output": f"Command failed: {detail}", "returncode": completed.returncode}


def _gateway_post(path, payload, *, timeout=45):
    url = f"{VOICE_GATEWAY_BASE.rstrip('/')}{path}"
    merged = {"token": VOICE_GATEWAY_TOKEN, "relay_id": VOICE_GATEWAY_RELAY_ID}
    merged.update(payload or {})
    response = requests.post(url, json=merged, timeout=timeout)
    if response.status_code >= 400:
        return {"ok": False, "error": response.text.strip() or response.reason, "http_status": response.status_code}
    try:
        data = response.json()
    except Exception:
        return {"ok": False, "error": "Gateway returned non-JSON response", "raw": response.text[:1000]}
    return data if isinstance(data, dict) else {"ok": True, "value": data}


def _sql_quote(value):
    return str(value or "").replace("'", "''")


def _extract_text_payload(args):
    for key in ("text", "content", "memory", "payload", "data", "note", "message"):
        val = args.get(key)
        if val is None:
            continue
        if isinstance(val, (dict, list)):
            return json.dumps(val, ensure_ascii=False)
        return str(val)
    return ""


def _chunk_text(text, size):
    if size <= 0:
        size = 5000
    payload = str(text or "")
    if not payload:
        return []
    return [payload[i:i + size] for i in range(0, len(payload), size)]


def _ingest_text_to_cloud_memory(*, text, key_prefix="memory", source="manual"):
    raw_text = str(text or "").strip()
    if not raw_text:
        return {"ok": False, "error": "Nothing to ingest"}

    chunk_size = max(1000, INGEST_CHUNK_SIZE)
    chunks = _chunk_text(raw_text, chunk_size)
    timestamp = str(int(time.time()))
    saved = 0

    for idx, chunk in enumerate(chunks, start=1):
        key = f"{key_prefix}:{timestamp}:{idx:04d}"
        category = key_prefix.split(":", 1)[0] if ":" in key_prefix else key_prefix
        query = (
            "INSERT INTO memory_context (category, key, value, created_at, updated_at) "
            "VALUES ('{c}', '{k}', '{v}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
        ).format(
            c=_sql_quote(category or "memory"),
            k=_sql_quote(key),
            v=_sql_quote(chunk),
        )
        result = _gateway_post("/query_d1", {"query": query})
        if not result.get("ok"):
            return {
                "ok": False,
                "error": result.get("error", "Failed writing to Cloudflare D1"),
                "chunk_index": idx,
                "saved": saved,
            }
        saved += 1

    meta_key = f"memory_ingest_meta:{timestamp}"
    meta_value = json.dumps(
        {
            "source": source,
            "key_prefix": key_prefix,
            "chunks": saved,
            "bytes": len(raw_text.encode("utf-8")),
            "created_at": int(time.time()),
        },
        ensure_ascii=False,
    )
    _gateway_post("/query_kv", {"action": "put", "key": meta_key, "value": meta_value})

    return {
        "ok": True,
        "source": source,
        "key_prefix": key_prefix,
        "chunks": saved,
        "bytes": len(raw_text.encode("utf-8")),
        "meta_key": meta_key,
    }


def _playwright_session_name(args):
    raw = str(args.get("session") or "").strip().lower()
    sanitized = "".join(ch for ch in raw if ch.isalnum())
    return sanitized[:8] or DEFAULT_PLAYWRIGHT_SESSION


def _playwright_exec(command_parts, args, *, timeout=90):
    if not PLAYWRIGHT_WRAPPER.exists():
        return {"ok": False, "output": f"Playwright wrapper missing at {PLAYWRIGHT_WRAPPER}", "returncode": -1}
    session = _playwright_session_name(args)
    argv = [str(PLAYWRIGHT_WRAPPER), "--session", session, *command_parts]
    return _run_argv(argv, timeout=timeout)


def _extract_gemini_text(payload):
    for candidate in payload.get("candidates") or []:
        content = candidate.get("content") or {}
        for part in content.get("parts") or []:
            text = str(part.get("text") or "").strip()
            if text:
                return text
    return ""

def execute_proxy(func_name, args, get_token_fn=None):
    # Hard server-side safety gates mirroring CI
    allow_mutations = os.environ.get("ALLOW_MUTATIONS", "false")
    mutation_intent = str(args.get("mutation_intent", "NO")).upper() == "YES"
    destructive = {
        "github_create_pr",
        "github_commit_and_push",
        "pcrm_delete_record",
        "notebooklm_delete",
        "notebooklm_write",
        "run_bash_command",
        "execute_local_shell"
    }

    if func_name in destructive:
        if allow_mutations != "true" or not mutation_intent:
            return json.dumps({"status": "error", "error": f"Server Guard: ALLOW_MUTATIONS=true and mutation_intent='YES' are required to run {func_name}"})
    elif mutation_intent:
        return json.dumps({"status": "error", "error": f"Server Guard: {func_name} is read-only but received mutation_intent. Blocked."})

    if func_name == "answer_core_memory":
        token = run_cmd("gcloud auth print-access-token").strip()
        query = args.get("query", "")
        url = "https://us-discoveryengine.googleapis.com/v1alpha/projects/660085746842/locations/us/collections/default_collection/engines/gemini-enterprise-17674723_1767472367566/servingConfigs/default_serving_config:answer"
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json", "x-goog-user-project": "brain-481809"}
        payload = {"query": {"text": query}}
        try:
            r = requests.post(url, headers=headers, json=payload, timeout=30)
            data = r.json()
            answer_text = data.get("answerText", "")
            if not answer_text:
                # Try to extract from parts if it's a different schema
                answer_text = str(data)[:2000]
            return answer_text
        except Exception as e:
            return f"Answer Core Memory Error: {e}"

    if func_name == "search_core_memory":
        token = run_cmd("gcloud auth print-access-token").strip()
        query = args.get("query", "")
        url = "https://us-discoveryengine.googleapis.com/v1alpha/projects/660085746842/locations/us/collections/default_collection/engines/gemini-enterprise-17674723_1767472367566/servingConfigs/default_serving_config:search"
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json", "x-goog-user-project": "brain-481809"}
        payload = {"query": query}
        try:
            r = requests.post(url, headers=headers, json=payload, timeout=30)
            data = r.json()
            # Extract snippets from search results
            results = data.get("results", [])
            summary = ""
            for res in results[:3]:
                snippet = res.get("document", {}).get("derivedStructData", {}).get("snippets", [{}])[0].get("snippet", "")
                if snippet: summary += f"- {snippet}\n"
            return summary or str(data)[:2000]
        except Exception as e:
            return f"Search Core Memory Error: {e}"

    if func_name == "cloudflare_d1_query":
        query = str(args.get("query") or args.get("sql") or "").strip()
        if not query:
            return json.dumps({"status": "error", "error": "Missing query/sql."})
        result = _gateway_post("/query_d1", {"query": query})
        return json.dumps(result)

    if func_name == "cloudflare_kv_get":
        key = str(args.get("key") or "").strip()
        if not key:
            return json.dumps({"status": "error", "error": "Missing key."})
        result = _gateway_post("/query_kv", {"action": "get", "key": key})
        return json.dumps(result)

    if func_name == "cloudflare_kv_put":
        key = str(args.get("key") or "").strip()
        if not key:
            return json.dumps({"status": "error", "error": "Missing key."})
        value = args.get("value")
        if isinstance(value, (dict, list)):
            value = json.dumps(value, ensure_ascii=False)
        result = _gateway_post("/query_kv", {"action": "put", "key": key, "value": str(value or "")})
        return json.dumps(result)

    if func_name == "read_working_memory":
        key_prefix = str(args.get("prefix") or args.get("key_prefix") or args.get("key") or "").strip()
        limit = int(args.get("limit") or 50)
        limit = max(1, min(500, limit))
        if key_prefix:
            query = (
                "SELECT category, key, value, updated_at FROM memory_context "
                f"WHERE key LIKE '{_sql_quote(key_prefix)}%' "
                "ORDER BY updated_at DESC "
                f"LIMIT {limit}"
            )
        else:
            query = f"SELECT category, key, value, updated_at FROM memory_context ORDER BY updated_at DESC LIMIT {limit}"
        result = _gateway_post("/query_d1", {"query": query})
        return json.dumps(result)

    if func_name == "clear_working_memory":
        key_prefix = str(args.get("prefix") or args.get("key_prefix") or args.get("key") or "").strip()
        if key_prefix:
            query = f"DELETE FROM memory_context WHERE key LIKE '{_sql_quote(key_prefix)}%'"
        else:
            query = "DELETE FROM memory_context"
        result = _gateway_post("/query_d1", {"query": query})
        return json.dumps(result)

    if func_name == "ingest_permanent_memory":
        key_prefix = str(args.get("key_prefix") or args.get("namespace") or "memory").strip() or "memory"
        source = str(args.get("source") or "manual").strip() or "manual"
        text_payload = _extract_text_payload(args)

        file_path = str(args.get("file_path") or args.get("path") or "").strip()
        if not text_payload and file_path:
            try:
                text_payload = Path(file_path).expanduser().read_text(encoding="utf-8", errors="ignore")
                source = source if source != "manual" else "file"
            except Exception as exc:
                return json.dumps({"status": "error", "error": f"Unable to read file_path: {exc}"})

        url = str(args.get("url") or "").strip()
        if not text_payload and url:
            try:
                response = requests.get(url, timeout=30)
                response.raise_for_status()
                text_payload = response.text
                source = source if source != "manual" else "url"
            except Exception as exc:
                return json.dumps({"status": "error", "error": f"Unable to fetch url: {exc}"})

        sql = str(args.get("query") or args.get("sql") or "").strip()
        if not text_payload and sql:
            bq_result = _bigquery_query(sql, get_token_fn=get_token_fn)
            text_payload = str(bq_result or "")
            source = source if source != "manual" else "bigquery"

        if not text_payload:
            return json.dumps({"status": "error", "error": "No ingest payload. Provide text/content, file_path, url, or query/sql."})

        ingest_result = _ingest_text_to_cloud_memory(text=text_payload, key_prefix=key_prefix, source=source)
        status = "success" if ingest_result.get("ok") else "error"
        return json.dumps({"status": status, **ingest_result})

    if func_name == "adk_ingest_agent_describe":
        return json.dumps(
            {
                "status": "success",
                "agent": "adk_ingest_agent",
                "mode": "cloud_sync_memory_ingest",
                "sinks": ["cloudflare_d1(memory_context)", "cloudflare_kv(metadata)", "bigquery_query(source optional)"],
                "chunk_size": INGEST_CHUNK_SIZE,
                "gateway": VOICE_GATEWAY_BASE,
                "relay_id": VOICE_GATEWAY_RELAY_ID,
            }
        )

    if func_name == "adk_ingest_agent_run":
        payload = dict(args or {})
        if "text" not in payload and "content" not in payload:
            payload["text"] = _extract_text_payload(args)
        if not str(payload.get("text") or "").strip():
            payload["text"] = str(args.get("query") or args.get("sql") or "").strip()
        if not str(payload.get("text") or "").strip() and str(args.get("url") or "").strip():
            payload["url"] = str(args.get("url")).strip()
        if not str(payload.get("text") or "").strip() and str(args.get("file_path") or args.get("path") or "").strip():
            payload["file_path"] = str(args.get("file_path") or args.get("path")).strip()
        payload["source"] = str(args.get("source") or "adk_ingest_agent").strip() or "adk_ingest_agent"
        result = execute_proxy("ingest_permanent_memory", payload, get_token_fn=get_token_fn)
        try:
            parsed = json.loads(result)
        except Exception:
            parsed = {"status": "error", "error": str(result)}
        parsed["agent"] = "adk_ingest_agent"
        return json.dumps(parsed)

    if func_name == "desktop_screenshot":
        save_path = str(args.get("save_path") or f"/tmp/p_desktop_{int(time.time())}.png").strip()
        result = _run_argv(["screencapture", "-x", save_path], timeout=30)
        if not result.get("ok"):
            return result.get("output")
        return json.dumps({"status": "success", "path": save_path})

    if func_name == "desktop_click":
        x = args.get("x")
        y = args.get("y")
        if x is None or y is None:
            return json.dumps({"status": "error", "error": "desktop_click requires x and y."})
        cliclick = _run_argv(["/opt/homebrew/bin/cliclick", f"c:{int(x)},{int(y)}"], timeout=10)
        if cliclick.get("ok"):
            return json.dumps({"status": "success", "x": int(x), "y": int(y)})
        return json.dumps(
            {
                "status": "error",
                "error": "desktop_click requires cliclick at /opt/homebrew/bin/cliclick",
                "detail": cliclick.get("output"),
            }
        )

    if func_name == "desktop_vision":
        question = str(args.get("question") or args.get("q") or "Describe what is visible on screen.").strip()
        image_path = str(args.get("image_path") or "").strip()
        if not image_path:
            image_path = f"/tmp/p_desktop_vision_{int(time.time())}.png"
            shot = _run_argv(["screencapture", "-x", image_path], timeout=30)
            if not shot.get("ok"):
                return json.dumps({"status": "error", "error": shot.get("output")})

        api_key = _env_value("GEMINI_API_KEY")
        if not api_key:
            return json.dumps({"status": "error", "error": "GEMINI_API_KEY is not configured"})
        model_name = str(args.get("model") or "gemini-2.5-flash").strip()
        try:
            image_b64 = base64.b64encode(Path(image_path).read_bytes()).decode("utf-8")
        except Exception as exc:
            return json.dumps({"status": "error", "error": f"Failed to read image: {exc}"})

        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [
                        {"text": question},
                        {"inlineData": {"mimeType": "image/png", "data": image_b64}},
                    ],
                }
            ],
            "generationConfig": {"temperature": 0.2, "maxOutputTokens": 1024},
        }
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
        try:
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=60) as resp:
                model_payload = json.loads(resp.read().decode("utf-8"))
        except Exception as exc:
            return json.dumps({"status": "error", "error": f"desktop_vision request failed: {exc}"})
        answer = _extract_gemini_text(model_payload) or "No vision response returned."
        return json.dumps({"status": "success", "answer": answer, "image_path": image_path})

    if func_name == "playwright_navigate":
        url = str(args.get("url") or args.get("target") or "").strip()
        if not url:
            return "playwright_navigate requires url."
        navigate = _playwright_exec(["goto", url], args)
        if navigate.get("ok"):
            return navigate.get("output")
        fallback = _playwright_exec(["open", url, "--headed"], args)
        return fallback.get("output")

    if func_name == "playwright_snapshot":
        target = str(args.get("target") or args.get("element") or "").strip()
        command = ["snapshot"]
        if target:
            command.append(target)
        result = _playwright_exec(command, args)
        return result.get("output")

    if func_name == "playwright_click":
        target = str(args.get("target") or args.get("selector") or "").strip()
        if not target:
            return "playwright_click requires target."
        button = str(args.get("button") or "").strip()
        command = ["click", target]
        if button:
            command.append(button)
        result = _playwright_exec(command, args)
        return result.get("output")

    if func_name == "playwright_type":
        text = str(args.get("text") or args.get("value") or "").strip()
        if not text:
            return "playwright_type requires text."
        target = str(args.get("target") or args.get("selector") or "").strip()
        if target:
            result = _playwright_exec(["fill", target, text], args)
        else:
            result = _playwright_exec(["type", text], args)
        return result.get("output")

    if func_name == "playwright_scroll":
        dx = int(args.get("dx") or 0)
        dy_arg = args.get("dy")
        if dy_arg is None:
            direction = str(args.get("direction") or "down").strip().lower()
            amount = int(args.get("amount") or 1200)
            dy = -abs(amount) if direction in {"up", "top"} else abs(amount)
        else:
            dy = int(dy_arg)
        result = _playwright_exec(["mousewheel", str(dx), str(dy)], args)
        return result.get("output")

    if func_name == "playwright_screenshot":
        target = str(args.get("target") or args.get("selector") or "").strip()
        command = ["screenshot"]
        if target:
            command.append(target)
        result = _playwright_exec(command, args)
        return result.get("output")

    if func_name == "get_p_notebook_catalog":
        catalog_path = "/Users/emmanuelhaddad/P-notebook-catalog-2026-04-03.md"
        if os.path.exists(catalog_path):
            with open(catalog_path, "r") as f:
                return f.read()
        return "Catalog file not found locally. Consult Master Systems Brief for IDs."

    if func_name == "bigquery_query":
        sql = (
            str(args.get("query") or "").strip()
            or str(args.get("sql") or "").strip()
            or str(args.get("statement") or "").strip()
        )
        if not sql:
            return json.dumps({"status": "error", "error": "Missing SQL query. Provide 'query' or 'sql'."})
        return _bigquery_query(sql, get_token_fn=get_token_fn)

    # Github tools
    if func_name == "github_clone_repo":
        repo = args.get("repo", "")
        dest = args.get("destination_path", "")
        cmd = f"gh repo clone {repo} {dest}" if dest else f"gh repo clone {repo}"
        return run_cmd(cmd)
    
    if func_name == "github_list_repos":
        owner = args.get("owner", "")
        cmd = f"gh repo list {owner}" if owner else "gh repo list"
        return run_cmd(cmd)
        
    if func_name == "github_view_repo":
        repo = args.get("repo", "")
        return run_cmd(f"gh repo view {repo} --json nameWithOwner,defaultBranchRef,url")

    if func_name == "github_read_file":
        repo = args.get("repo", "")
        path = args.get("path", "")
        return run_cmd(f"gh api repos/{repo}/contents/{path} -H 'Accept: application/vnd.github.v3.raw'")
        
    if func_name == "github_repo_status":
        repoPath = args.get("repo_path", "")
        return run_cmd(f"cd {repoPath} && git status")
        
    if func_name == "github_checkout_branch":
        repoPath = args.get("repo_path", "")
        branch = args.get("branch_name", "")
        create = args.get("create", True)
        cmd = f"git -C {repoPath} switch -C {branch}" if create else f"git -C {repoPath} switch {branch}"
        return run_cmd(cmd)

    if func_name == "github_commit_and_push":
        repoPath = args.get("repo_path", "")
        message = args.get("message", "")
        branch = args.get("branch_name", "")
        push = args.get("push", True)
        run_cmd(f"git -C {repoPath} add -A")
        run_cmd(f"git -C {repoPath} commit -m '{message}'")
        if push:
            return run_cmd(f"git -C {repoPath} push")
        return "Committed locally"

    # PCRM tools
    if func_name.startswith("pcrm_"):
        token = _resolve_pcrm_bearer_token(get_token_fn)
        if not token:
            return json.dumps({"status": "error", "error": "PCRM bearer token not found"})
        
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        PLATFORM = "https://platform-api.wisprflow.ai/api/v1"
        
        if func_name == "pcrm_me":
            url = f"{PLATFORM}/me"
            try:
                r = requests.get(url, headers=headers, timeout=15)
                return r.json()
            except Exception as e:
                return json.dumps({"status": "error", "error": str(e)})

        if func_name == "pcrm_list_records":
            obj = args.get("obj", "")
            page = args.get("page", 1)
            page_size = args.get("page_size", 10)
            q = args.get("q", "")
            url = f"{PLATFORM}/data/list?obj={obj}&page={page}&page_size={page_size}"
            if q:
                url += f"&q={q}"
            try:
                r = requests.get(url, headers=headers, timeout=15)
                return r.json()
            except Exception as e:
                return json.dumps({"status": "error", "error": str(e)})

        if func_name == "pcrm_get_record":
            obj = args.get("obj", "")
            record_id = args.get("id", "")
            url = f"{PLATFORM}/data/record?obj={obj}&id={record_id}"
            try:
                r = requests.get(url, headers=headers, timeout=15)
                return r.json()
            except Exception as e:
                return json.dumps({"status": "error", "error": str(e)})

        if func_name == "pcrm_create_record":
            obj = args.get("obj", "")
            fields = args.get("fields", [])
            url = f"{PLATFORM}/data/create"
            try:
                r = requests.post(url, headers=headers, json={"obj": obj, "fields": fields}, timeout=15)
                return r.json()
            except Exception as e:
                return json.dumps({"status": "error", "error": str(e)})

        if func_name == "pcrm_update_record":
            obj = args.get("obj", "")
            record_id = args.get("id", "")
            field = args.get("field", "")
            value = args.get("value", "")
            url = f"{PLATFORM}/data/update"
            try:
                r = requests.post(url, headers=headers, json={"obj": obj, "id": record_id, "field": field, "value": value}, timeout=15)
                return r.json()
            except Exception as e:
                return json.dumps({"status": "error", "error": str(e)})

        if func_name == "pcrm_delete_record":
            obj = args.get("obj", "")
            record_id = args.get("id", "")
            url = f"{PLATFORM}/data/delete"
            try:
                r = requests.post(url, headers=headers, json={"obj": obj, "id": record_id}, timeout=15)
                return r.json()
            except Exception as e:
                return json.dumps({"status": "error", "error": str(e)})

        if func_name == "pcrm_archive_record":
            obj = args.get("obj", "")
            record_id = args.get("id", "")
            archived = args.get("archived", True)
            url = f"{PLATFORM}/data/archive"
            try:
                r = requests.post(url, headers=headers, json={"obj": obj, "id": record_id, "archived": archived}, timeout=15)
                return r.json()
            except Exception as e:
                return json.dumps({"status": "error", "error": str(e)})

        if func_name == "pcrm_list_properties":
            obj = args.get("obj", "")
            url = f"{PLATFORM}/data/objects?obj={obj}"
            try:
                r = requests.get(url, headers=headers, timeout=15)
                return r.json()
            except Exception as e:
                return json.dumps({"status": "error", "error": str(e)})

        if func_name == "pcrm_list_associations":
            obj = args.get("obj", "")
            record_id = args.get("id", "")
            url = f"{PLATFORM}/data/associations?obj={obj}&id={record_id}"
            try:
                r = requests.get(url, headers=headers, timeout=15)
                return r.json()
            except Exception as e:
                return json.dumps({"status": "error", "error": str(e)})

        if func_name == "pcrm_sql_execution":
            query = args.get("query", "")
            url = f"{PLATFORM}/data/sql"
            try:
                r = requests.post(url, headers=headers, json={"query": query}, timeout=30)
                return r.json()
            except Exception as e:
                return json.dumps({"status": "error", "error": str(e)})

        if func_name == "pcrm_get_orchestration_meta":
            url = f"{PLATFORM}/orchestration/meta"
            try:
                r = requests.get(url, headers=headers, timeout=15)
                return r.json()
            except Exception as e:
                return json.dumps({"status": "error", "error": str(e)})

    # ── COMMS TOOLS ─────────────────────────────────────────────────────
    # Credentials from secrets.env:
    #   P_EMAIL_ADDRESS   — P's email (e.g. pushingP@pushingcap.com)
    #   P_EMAIL_PASSWORD  — App password or SMTP password
    #   P_EMAIL_SMTP_HOST — SMTP server (default: smtp.gmail.com)
    #   P_EMAIL_SMTP_PORT — SMTP port (default: 587)
    #   P_EMAIL_IMAP_HOST — IMAP server (default: imap.gmail.com)
    #   P_PHONE_NUMBER    — P's phone number for iMessage/SMS

    def _get_email_config():
        return {
            "address": _env_value("P_EMAIL_ADDRESS") or "pushingP@pushingcap.com",
            "password": _env_value("P_EMAIL_PASSWORD") or "",
            "smtp_host": _env_value("P_EMAIL_SMTP_HOST") or "smtp.gmail.com",
            "smtp_port": int(_env_value("P_EMAIL_SMTP_PORT") or "587"),
            "imap_host": _env_value("P_EMAIL_IMAP_HOST") or "imap.gmail.com",
        }

    if func_name == "send_email":
        import smtplib
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart
        cfg = _get_email_config()
        if not cfg["password"]:
            return json.dumps({"status": "error", "error": "P_EMAIL_PASSWORD not set in secrets.env. Need app password to send email."})
        to_addr = args.get("to", "")
        subject = args.get("subject", "(No Subject)")
        body = args.get("body", "")
        cc = args.get("cc", "")
        if not to_addr:
            return json.dumps({"status": "error", "error": "Missing 'to' address"})
        try:
            msg = MIMEMultipart()
            msg["From"] = f"P <{cfg['address']}>"
            msg["To"] = to_addr
            msg["Subject"] = subject
            if cc:
                msg["Cc"] = cc
            msg.attach(MIMEText(body, "plain"))
            with smtplib.SMTP(cfg["smtp_host"], cfg["smtp_port"]) as server:
                server.starttls()
                server.login(cfg["address"], cfg["password"])
                recipients = [to_addr] + ([cc] if cc else [])
                server.sendmail(cfg["address"], recipients, msg.as_string())
            return json.dumps({"status": "sent", "from": cfg["address"], "to": to_addr, "subject": subject})
        except Exception as e:
            return json.dumps({"status": "error", "error": f"Send email failed: {e}"})

    if func_name == "read_email":
        import imaplib
        import email as email_lib
        from email.header import decode_header
        cfg = _get_email_config()
        if not cfg["password"]:
            return json.dumps({"status": "error", "error": "P_EMAIL_PASSWORD not set in secrets.env. Need app password to read email."})
        folder = args.get("folder", "INBOX")
        search_query = args.get("search", "ALL")
        limit = int(args.get("limit", 10))
        try:
            mail = imaplib.IMAP4_SSL(cfg["imap_host"])
            mail.login(cfg["address"], cfg["password"])
            mail.select(folder)
            # Convert friendly search terms
            if search_query == "ALL" or not search_query:
                imap_query = "ALL"
            elif search_query.startswith("FROM ") or search_query.startswith("SUBJECT "):
                imap_query = f'({search_query})'
            elif "@" in search_query:
                imap_query = f'(FROM "{search_query}")'
            else:
                imap_query = f'(SUBJECT "{search_query}")'
            _, msg_ids = mail.search(None, imap_query)
            ids = msg_ids[0].split()
            ids = ids[-limit:]  # most recent
            ids.reverse()
            messages = []
            for mid in ids:
                _, msg_data = mail.fetch(mid, "(RFC822)")
                raw = msg_data[0][1]
                parsed = email_lib.message_from_bytes(raw)
                subj_raw = parsed.get("Subject", "")
                decoded_parts = decode_header(subj_raw)
                subj = ""
                for part, enc in decoded_parts:
                    if isinstance(part, bytes):
                        subj += part.decode(enc or "utf-8", errors="replace")
                    else:
                        subj += part
                body_text = ""
                if parsed.is_multipart():
                    for part in parsed.walk():
                        if part.get_content_type() == "text/plain":
                            body_text = part.get_payload(decode=True).decode("utf-8", errors="replace")
                            break
                else:
                    body_text = parsed.get_payload(decode=True).decode("utf-8", errors="replace")
                messages.append({
                    "from": parsed.get("From", ""),
                    "to": parsed.get("To", ""),
                    "subject": subj,
                    "date": parsed.get("Date", ""),
                    "body_preview": body_text[:500],
                })
            mail.logout()
            return json.dumps({"status": "success", "folder": folder, "count": len(messages), "messages": messages})
        except Exception as e:
            return json.dumps({"status": "error", "error": f"Read email failed: {e}"})

    if func_name == "send_sms":
        phone = args.get("to", "")
        message = args.get("message", "")
        if not phone or not message:
            return json.dumps({"status": "error", "error": "Missing 'to' (phone number) or 'message'"})
        # Use macOS AppleScript to send via iMessage
        escaped_msg = message.replace('"', '\\"').replace("'", "'\\''")
        applescript = f'''
        tell application "Messages"
            set targetService to 1st account whose service type = iMessage
            set targetBuddy to participant "{phone}" of targetService
            send "{escaped_msg}" to targetBuddy
        end tell
        '''
        try:
            result = subprocess.run(["osascript", "-e", applescript], capture_output=True, text=True, timeout=15)
            if result.returncode == 0:
                return json.dumps({"status": "sent", "to": phone, "message_preview": message[:100], "method": "iMessage"})
            else:
                return json.dumps({"status": "error", "error": f"iMessage send failed: {result.stderr}", "hint": "Make sure Messages app is logged in"})
        except Exception as e:
            return json.dumps({"status": "error", "error": f"SMS send failed: {e}"})

    if func_name == "read_sms":
        contact = args.get("contact", "")
        limit = int(args.get("limit", 10))
        # Read from macOS Messages SQLite database
        db_path = os.path.expanduser("~/Library/Messages/chat.db")
        if not os.path.exists(db_path):
            return json.dumps({"status": "error", "error": "Messages database not found. Need Full Disk Access."})
        try:
            import sqlite3
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            if contact:
                query = """
                    SELECT m.text, m.is_from_me, m.date, h.id as handle
                    FROM message m
                    JOIN handle h ON m.handle_id = h.ROWID
                    WHERE h.id LIKE ?
                    ORDER BY m.date DESC LIMIT ?
                """
                cursor.execute(query, (f"%{contact}%", limit))
            else:
                query = """
                    SELECT m.text, m.is_from_me, m.date, h.id as handle
                    FROM message m
                    JOIN handle h ON m.handle_id = h.ROWID
                    ORDER BY m.date DESC LIMIT ?
                """
                cursor.execute(query, (limit,))
            rows = cursor.fetchall()
            conn.close()
            messages = []
            for text, is_from_me, date_val, handle in rows:
                messages.append({
                    "text": text or "(attachment)",
                    "direction": "sent" if is_from_me else "received",
                    "handle": handle,
                    "date_raw": date_val,
                })
            messages.reverse()
            return json.dumps({"status": "success", "count": len(messages), "messages": messages})
        except Exception as e:
            return json.dumps({"status": "error", "error": f"Read SMS failed: {e}"})

    if func_name == "understand_comms_thread":
        # Summarize a conversation thread using Gemini
        thread_text = args.get("thread", "")
        context = args.get("context", "You are P, an autonomous business operations agent.")
        if not thread_text:
            return json.dumps({"status": "error", "error": "Missing 'thread' text to analyze"})
        api_key = _env_value("GEMINI_API_KEY")
        if not api_key:
            return json.dumps({"status": "error", "error": "GEMINI_API_KEY not set"})
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
            prompt = f"""{context}

Analyze this conversation thread. Provide:
1. **Summary** — What's the thread about?
2. **Key Points** — What are the important items/asks?
3. **Sentiment** — How is the other party feeling?
4. **Recommended Action** — What should P do next?
5. **Draft Reply** — Write a suggested response.

Thread:
{thread_text}"""
            payload = {"contents": [{"parts": [{"text": prompt}]}]}
            r = requests.post(url, json=payload, timeout=30)
            data = r.json()
            text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
            return json.dumps({"status": "success", "analysis": text})
        except Exception as e:
            return json.dumps({"status": "error", "error": f"Thread analysis failed: {e}"})

    if func_name == "voice_gateway_ask":
        question = args.get("question", args.get("q", ""))
        if not question:
            return json.dumps({"status": "error", "error": "Missing 'question'"})
        gateway_url = "https://pushing-capital-voice-gateway.manny-861.workers.dev/ask"
        token = "pc_voice_manny_2026"
        try:
            r = requests.post(gateway_url, json={"q": question, "token": token}, timeout=30)
            return json.dumps({"status": "success", "response": r.json()})
        except Exception as e:
            return json.dumps({"status": "error", "error": f"Voice gateway failed: {e}"})

    if func_name == "imessage_send":
        return execute_proxy("send_sms", args, get_token_fn)

    if func_name == "imessage_read":
        return execute_proxy("read_sms", args, get_token_fn)

    return json.dumps({"status": "error", "error": f"Function '{func_name}' not found or not implemented in execute_proxy."})
