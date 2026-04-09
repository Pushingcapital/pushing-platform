import base64
import json
import os
import subprocess
import time
from pathlib import Path

import requests


SECRETS_PATH = Path("/Users/emmanuelhaddad/.config/pushingcapital/secrets.env")
DEFAULT_GCP_PROJECT = "brain-481809"
SECRET_CACHE = {}
ENV_CACHE = None


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

def execute_proxy(func_name, args, get_token_fn=None):
    # Resolve aliases first to ensure correct security checks
    if func_name == "ingest_permanent_memory":
        func_name = "notebooklm_write"

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

    if func_name == "get_p_notebook_catalog":
        catalog_path = "/Users/emmanuelhaddad/P-notebook-catalog-2026-04-03.md"
        if os.path.exists(catalog_path):
            with open(catalog_path, "r") as f:
                return f.read()
        return "Catalog file not found locally. Consult Master Systems Brief for IDs."

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
