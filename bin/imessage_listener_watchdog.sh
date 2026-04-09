#!/bin/zsh
set -euo pipefail

USER_ID="$(id -u)"
RUNTIME_BASE="/Users/emmanuelhaddad/.imessage_sender_runtime"
LISTENER_STATUS_FILE="$RUNTIME_BASE/imessage_listener_status.json"
STATUS_FILE="$RUNTIME_BASE/imessage_watchdog_status.json"
LANE_COVERAGE_FILE="$RUNTIME_BASE/push_p_customer_lane_coverage.json"
ERROR_STATE_FILE="$RUNTIME_BASE/push_p_lane_error_state.json"
LOG_DIR="/Users/emmanuelhaddad/Library/Logs/PushingCapital"
API_SYNC_SCRIPT="/Users/emmanuelhaddad/bin/imessage_api_launchd.sh"
LISTENER_LAUNCHER="/Users/emmanuelhaddad/bin/imessage_listener_terminal_launcher.sh"
SLA_RUNNER="/Users/emmanuelhaddad/bin/imessage_sla_runner.py"
API_LABEL="com.emmanuelhaddad.imessage-api"
TUNNEL_LABEL="com.emmanuelhaddad.imessage-tunnel"
API_PLIST="/Users/emmanuelhaddad/Library/LaunchAgents/${API_LABEL}.plist"
TUNNEL_PLIST="/Users/emmanuelhaddad/Library/LaunchAgents/${TUNNEL_LABEL}.plist"

mkdir -p "$RUNTIME_BASE" "$LOG_DIR"

timestamp() {
  /bin/date -u +"%Y-%m-%dT%H:%M:%SZ"
}

ensure_loaded() {
  local label="$1"
  local plist="$2"
  if [[ ! -f "$plist" ]]; then
    return 1
  fi
  if ! launchctl print "gui/$USER_ID/$label" >/dev/null 2>&1; then
    launchctl bootstrap "gui/$USER_ID" "$plist" >/dev/null 2>&1 || true
    return 2
  fi
  return 0
}

job_running() {
  local label="$1"
  launchctl print "gui/$USER_ID/$label" 2>/dev/null | /usr/bin/grep -q "state = running"
}

api_health_ok() {
  /usr/bin/curl -fsS --max-time 10 "http://127.0.0.1:8786/health" >/dev/null 2>&1
}

public_health_ok() {
  /usr/bin/curl -fsS --max-time 12 "https://imessage-api.pushingcap.com/health" >/dev/null 2>&1
}

maybe_send_lane_apologies() {
  local api_ok="$1"
  local listener_ok="$2"
  local public_ok="$3"
  local api_err_excerpt
  local listener_err_excerpt
  api_err_excerpt="$(tail -n 3 "$RUNTIME_BASE/api.err.log" 2>/dev/null || true)"
  listener_err_excerpt="$(tail -n 3 "$RUNTIME_BASE/listener.err.log" 2>/dev/null || true)"
  /usr/bin/python3 - <<PY >/dev/null 2>&1 || true
import json, pathlib, time, urllib.request

runtime_base = pathlib.Path("$RUNTIME_BASE")
coverage_path = pathlib.Path("$LANE_COVERAGE_FILE")
state_path = pathlib.Path("$ERROR_STATE_FILE")
env_path = runtime_base / ".env"
bridge_url = "http://127.0.0.1:8786/api/send"
api_ok = "$api_ok" == "true"
listener_ok = "$listener_ok" == "true"
public_ok = "$public_ok" == "true"
api_err = """$api_err_excerpt""".strip()
listener_err = """$listener_err_excerpt""".strip()

if api_ok and listener_ok and public_ok and not api_err and not listener_err:
    raise SystemExit(0)
if not coverage_path.exists():
    raise SystemExit(0)

try:
    coverage = json.loads(coverage_path.read_text())
except Exception:
    raise SystemExit(0)
if not isinstance(coverage, list):
    raise SystemExit(0)

api_key = ""
if env_path.exists():
    for raw in env_path.read_text().splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        if key.strip() in {"IMESSAGE_API_KEY", "MAC_MESSAGES_API_KEY"}:
            api_key = value.strip().strip("'\"")
            break
if not api_key:
    raise SystemExit(0)

try:
    state = json.loads(state_path.read_text()) if state_path.exists() else {}
except Exception:
    state = {}
if not isinstance(state, dict):
    state = {}

signature = f"api={api_ok}|listener={listener_ok}|public={public_ok}|api_err={bool(api_err)}|listener_err={bool(listener_err)}"
now = int(time.time())
apology = "my bad. our side glitched for a sec and im back on it now. ill resend the clean path as soon as its good"

for lane in coverage:
    if not isinstance(lane, dict):
        continue
    phone = str(lane.get("phone") or "").strip()
    status = str(lane.get("status") or "").strip()
    if not phone or status in {"completed", "cancelled"}:
        continue
    state_key = f"{phone}:{signature}"
    last_sent = int(state.get(state_key) or 0)
    if now - last_sent < 600:
        continue
    body = json.dumps({"phone": phone, "message": apology}).encode("utf-8")
    req = urllib.request.Request(
        bridge_url,
        data=body,
        headers={"Content-Type": "application/json", "X-API-Key": api_key},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=15):
            state[state_key] = now
    except Exception:
        continue

state_path.write_text(json.dumps(state, indent=2, sort_keys=True))
PY
}

listener_recent_ok() {
  /usr/bin/python3 - <<PY >/dev/null 2>&1
import datetime, json, pathlib, sys
status_path = pathlib.Path("$LISTENER_STATUS_FILE")
if not status_path.exists():
    status_path = pathlib.Path("$STATUS_FILE")
if not status_path.exists():
    raise SystemExit(1)
payload = json.loads(status_path.read_text())
checked_at = str(payload.get("checked_at") or "").strip()
if str(payload.get("listener_ok") or "").lower() != "true" or not checked_at:
    raise SystemExit(1)
checked = datetime.datetime.fromisoformat(checked_at.replace("Z", "+00:00"))
age = (datetime.datetime.now(datetime.timezone.utc) - checked).total_seconds()
raise SystemExit(0 if age <= 300 else 1)
PY
}

"$API_SYNC_SCRIPT" --sync-only >/dev/null 2>&1 || true
/usr/bin/python3 "$SLA_RUNNER" run >/dev/null 2>&1 || true

api_loaded="false"
listener_loaded="false"
tunnel_loaded="false"
api_restarted="false"
listener_restarted="false"
tunnel_restarted="false"

if ensure_loaded "$API_LABEL" "$API_PLIST"; then
  api_loaded="true"
else
  if [[ -f "$API_PLIST" ]] && launchctl print "gui/$USER_ID/$API_LABEL" >/dev/null 2>&1; then
    api_loaded="true"
  fi
fi

if [[ -f "$TUNNEL_PLIST" ]]; then
  if ensure_loaded "$TUNNEL_LABEL" "$TUNNEL_PLIST"; then
    tunnel_loaded="true"
  else
    if launchctl print "gui/$USER_ID/$TUNNEL_LABEL" >/dev/null 2>&1; then
      tunnel_loaded="true"
    fi
  fi
fi

if ! api_health_ok; then
  launchctl kickstart -k "gui/$USER_ID/$API_LABEL" >/dev/null 2>&1 || true
  api_restarted="true"
  /bin/sleep 2
fi

if ! listener_recent_ok; then
  "$LISTENER_LAUNCHER" >/dev/null 2>&1 || true
  listener_restarted="true"
  /bin/sleep 2
fi

if ! public_health_ok; then
  launchctl kickstart -k "gui/$USER_ID/$TUNNEL_LABEL" >/dev/null 2>&1 || true
  if [[ "$tunnel_loaded" == "true" ]]; then
    tunnel_restarted="true"
    /bin/sleep 2
  fi
fi

api_ok="false"
listener_ok="false"
public_ok="false"

if api_health_ok; then
  api_ok="true"
fi
if listener_recent_ok; then
  listener_ok="true"
fi
listener_loaded="$listener_ok"
if public_health_ok; then
  public_ok="true"
fi

maybe_send_lane_apologies "$api_ok" "$listener_ok" "$public_ok"

checked_at="$(timestamp)"
printf '%s api_ok=%s listener_ok=%s public_ok=%s api_restarted=%s listener_restarted=%s tunnel_restarted=%s\n' \
  "$checked_at" "$api_ok" "$listener_ok" "$public_ok" "$api_restarted" "$listener_restarted" "$tunnel_restarted"

cat > "$STATUS_FILE" <<EOF
{
  "checked_at": "$checked_at",
  "api_loaded": $api_loaded,
  "listener_loaded": $listener_loaded,
  "tunnel_loaded": $tunnel_loaded,
  "api_ok": $api_ok,
  "listener_ok": $listener_ok,
  "public_ok": $public_ok,
  "api_restarted": $api_restarted,
  "listener_restarted": $listener_restarted,
  "tunnel_restarted": $tunnel_restarted,
  "sla_seconds": 120,
  "check_interval_seconds": 120,
  "target_model": "gpt-5.4"
}
EOF
