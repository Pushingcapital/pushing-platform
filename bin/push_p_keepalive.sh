#!/bin/zsh
set -uo pipefail

# ─────────────────────────────────────────────────────────────────
# push_p_keepalive.sh — keeps Push P listener + responder alive
#
# Usage:
#   push_p_keepalive.sh              # run forever (default)
#   push_p_keepalive.sh --once       # single health check + restart
#   push_p_keepalive.sh --status     # print status and exit
#
# Monitors both services every CHECK_INTERVAL seconds.
# Restarts any that have died. Logs everything.
# ─────────────────────────────────────────────────────────────────

RUNTIME_BASE="/Users/emmanuelhaddad/.imessage_sender_runtime"
LOG_DIR="/Users/emmanuelhaddad/Library/Logs/PushingCapital"
KEEPALIVE_LOG="$LOG_DIR/push_p_keepalive.log"
KEEPALIVE_PID_FILE="$RUNTIME_BASE/push_p_keepalive.pid"
CHECK_INTERVAL=30
KEEPALIVE_LABEL="com.pushingcapital.agentkeepalive"
LISTENER_STATUS_STALE_SECONDS=300
RESPONDER_STATUS_STALE_SECONDS=180

# --- Paths ---
LISTENER_CTL="/Users/emmanuelhaddad/bin/push_p_listener_ctl.sh"
LISTENER_LAUNCHER="/Users/emmanuelhaddad/bin/imessage_listener_terminal_launcher.sh"
RESPONDER_CTL="/Users/emmanuelhaddad/bin/push_p_responder_ctl.sh"
VISION_EARS_SCRIPT="$RUNTIME_BASE/vision_ears.py"
VISION_EARS_LABEL="com.pushingcapital.vision-ears"

LISTENER_PID_FILE="$RUNTIME_BASE/imessage_listener_fallback.pid"
LISTENER_LOOP_PID_FILE="$RUNTIME_BASE/imessage_listener_terminal_loop.pid"
LISTENER_STATUS_FILE="$RUNTIME_BASE/imessage_listener_status.json"
RESPONDER_PID_FILE="$RUNTIME_BASE/push_p_responder.pid"
RESPONDER_STATUS_FILE="$RUNTIME_BASE/push_p_responder_status.json"
VISION_EARS_PID_FILE="$RUNTIME_BASE/vision_ears.pid"

mkdir -p "$RUNTIME_BASE" "$LOG_DIR"

# --- Helpers ---
ts() { /bin/date '+%Y-%m-%d %H:%M:%S'; }
tsz() { /bin/date -u '+%Y-%m-%dT%H:%M:%SZ'; }

log() {
  local msg="[$(ts)] $*"
  echo "$msg"
  echo "$msg" >> "$KEEPALIVE_LOG"
}

is_running() {
  local pidfile="$1"
  if [[ -f "$pidfile" ]]; then
    local pid
    pid="$(cat "$pidfile" 2>/dev/null || true)"
    if [[ -n "$pid" ]] && /bin/kill -0 "$pid" >/dev/null 2>&1; then
      echo "$pid"
      return 0
    fi
  fi
  return 1
}

pidfile_value() {
  local pidfile="$1"
  local pid
  [[ -f "$pidfile" ]] || return 1
  pid="$(cat "$pidfile" 2>/dev/null || true)"
  [[ -n "$pid" ]] || return 1
  printf '%s\n' "$pid"
}

launchctl_label_pid() {
  local label="$1"
  local user_id pid
  user_id="$(/usr/bin/id -u)"
  pid="$(
    launchctl print "gui/$user_id/$label" 2>/dev/null \
      | /usr/bin/awk '/\tpid = / {print $3; exit}'
  )"
  [[ -n "$pid" ]] || return 1
  printf '%s\n' "$pid"
}

json_status_fresh() {
  local path="$1"
  local stale_after="$2"
  local required_true_csv="${3:-}"
  [[ -f "$path" ]] || return 1
  /usr/bin/python3 - "$path" "$stale_after" "$required_true_csv" <<'PY'
import json
import sys
import time
from datetime import datetime
from pathlib import Path

path = Path(sys.argv[1])
stale_after = int(sys.argv[2])
required_keys = [key for key in sys.argv[3].split(",") if key]
try:
    payload = json.loads(path.read_text())
except Exception:
    raise SystemExit(1)
checked_at = str(payload.get("checked_at") or "")
if not checked_at:
    raise SystemExit(1)
stamp = checked_at.replace("Z", "+00:00")
try:
    checked_epoch = datetime.fromisoformat(stamp).timestamp()
except Exception:
    raise SystemExit(1)
if time.time() - checked_epoch > stale_after:
    raise SystemExit(1)
for key in required_keys:
    if payload.get(key) is not True:
        raise SystemExit(1)
PY
}

json_status_pid() {
  local path="$1"
  /usr/bin/python3 - "$path" <<'PY'
import json
import sys
from pathlib import Path

path = Path(sys.argv[1])
try:
    payload = json.loads(path.read_text())
except Exception:
    raise SystemExit(1)
pid = payload.get("pid")
if pid in (None, ""):
    raise SystemExit(1)
print(pid)
PY
}

keepalive_running_pid() {
  launchctl_label_pid "$KEEPALIVE_LABEL" || is_running "$KEEPALIVE_PID_FILE"
}

listener_status_ok() {
  json_status_fresh "$LISTENER_STATUS_FILE" "$LISTENER_STATUS_STALE_SECONDS" "listener_ok,api_ok"
}

listener_healthy_pid() {
  listener_status_ok || return 1
  pidfile_value "$LISTENER_LOOP_PID_FILE" || pidfile_value "$LISTENER_PID_FILE" || printf '%s\n' "status-file"
}

responder_running_pid() {
  if json_status_fresh "$RESPONDER_STATUS_FILE" "$RESPONDER_STATUS_STALE_SECONDS"; then
    json_status_pid "$RESPONDER_STATUS_FILE" || pidfile_value "$RESPONDER_PID_FILE" || printf '%s\n' "status-file"
    return 0
  fi
  is_running "$RESPONDER_PID_FILE"
}

vision_ears_running_pid() {
  launchctl_label_pid "$VISION_EARS_LABEL" || pidfile_value "$VISION_EARS_PID_FILE"
}

vision_ears_port() {
  local log_path="$LOG_DIR/vision_ears.launchd.out.log"
  local port
  port="$(
    /usr/bin/python3 - "$log_path" <<'PY'
import re
import sys
from pathlib import Path

path = Path(sys.argv[1])
if not path.exists():
    raise SystemExit(1)
last = ""
for line in path.read_text(encoding="utf-8", errors="replace").splitlines():
    match = re.search(r"Listening on Tailnet port (\d+)", line)
    if match:
        last = match.group(1)
if not last:
    raise SystemExit(1)
print(last)
PY
  )"
  [[ -n "$port" ]] || return 1
  printf '%s\n' "$port"
}

vision_ears_health_url() {
  local port
  launchctl_label_pid "$VISION_EARS_LABEL" >/dev/null 2>&1 || return 1
  port="$(vision_ears_port 2>/dev/null || true)"
  if [[ -n "$port" ]]; then
    printf 'tcp://127.0.0.1:%s\n' "$port"
    return 0
  fi
  return 1
}

restart_vision_ears() {
  local user_id
  user_id="$(/usr/bin/id -u)"
  if launchctl print "gui/$user_id/$VISION_EARS_LABEL" >/dev/null 2>&1; then
    launchctl kickstart -k "gui/$user_id/$VISION_EARS_LABEL" >/dev/null 2>&1 || true
    return 0
  fi

  export CLOUDFLARE_API_KEY="$(grep CLOUDFLARE_API_KEY /Users/emmanuelhaddad/.config/pushingcapital/secrets.env 2>/dev/null | cut -d= -f2)"
  nohup /usr/bin/python3 "$VISION_EARS_SCRIPT" >> "$LOG_DIR/vision_ears.log" 2>&1 < /dev/null &
}

ensure_listener() {
  if pid="$(listener_healthy_pid)"; then
    log "LISTENER OK pid=$pid"
    return 0
  fi
  log "LISTENER DOWN — restarting..."
  if [[ -x "$LISTENER_LAUNCHER" ]]; then
    "$LISTENER_LAUNCHER" >> "$KEEPALIVE_LOG" 2>&1 || true
  else
    "$LISTENER_CTL" start >> "$KEEPALIVE_LOG" 2>&1 || true
  fi
  sleep 3
  if pid="$(listener_healthy_pid)"; then
    log "LISTENER RESTARTED pid=$pid"
  else
    log "LISTENER RESTART FAILED — check $LISTENER_LAUNCHER manually"
  fi
}

ensure_responder() {
  if pid="$(responder_running_pid)"; then
    log "RESPONDER OK pid=$pid"
    return 0
  fi
  log "RESPONDER DOWN — restarting..."
  "$RESPONDER_CTL" start >> "$KEEPALIVE_LOG" 2>&1
  sleep 2
  if pid="$(responder_running_pid)"; then
    echo "$pid" > "$RESPONDER_PID_FILE"
    log "RESPONDER RESTARTED pid=$pid"
  else
    rm -f "$RESPONDER_PID_FILE"
    log "RESPONDER RESTART FAILED — check $RESPONDER_CTL manually"
  fi
}

ensure_vision_ears() {
  local health_url pid
  if health_url="$(vision_ears_health_url)"; then
    pid="$(vision_ears_running_pid 2>/dev/null || true)"
    [[ -n "$pid" ]] && echo "$pid" > "$VISION_EARS_PID_FILE"
    log "VISION_EARS OK pid=${pid:-unknown} health=$health_url"
    return 0
  fi
  log "VISION_EARS DOWN — restarting..."
  restart_vision_ears
  sleep 3
  if health_url="$(vision_ears_health_url)"; then
    pid="$(vision_ears_running_pid 2>/dev/null || true)"
    [[ -n "$pid" ]] && echo "$pid" > "$VISION_EARS_PID_FILE"
    log "VISION_EARS RESTARTED pid=${pid:-unknown} health=$health_url"
  else
    rm -f "$VISION_EARS_PID_FILE"
    log "VISION_EARS RESTART FAILED"
  fi
}

health_check() {
  ensure_listener
  ensure_responder
  ensure_vision_ears
  # Write combined status
  local l_pid r_pid v_pid l_ok="false" r_ok="false" v_ok="false"
  l_pid="$(listener_healthy_pid 2>/dev/null)" && l_ok="true"
  r_pid="$(responder_running_pid 2>/dev/null)" && r_ok="true"
  v_pid="$(vision_ears_running_pid 2>/dev/null)" && vision_ears_health_url >/dev/null 2>&1 && v_ok="true"
  cat > "$RUNTIME_BASE/push_p_keepalive_status.json" <<EOF
{
  "checked_at": "$(tsz)",
  "listener_ok": $l_ok,
  "listener_pid": ${l_pid:-null},
  "responder_ok": $r_ok,
  "responder_pid": ${r_pid:-null},
  "vision_ears_ok": $v_ok,
  "vision_ears_pid": ${v_pid:-null},
  "check_interval": $CHECK_INTERVAL
}
EOF
}

print_status() {
  echo "=== Push P Keepalive Status ==="
  if pid="$(keepalive_running_pid)"; then
    echo "Keepalive: RUNNING (pid=$pid)"
  else
    echo "Keepalive: NOT RUNNING"
  fi
  if pid="$(listener_healthy_pid)"; then
    echo "Listener:  RUNNING (pid=$pid)"
  else
    echo "Listener:  DOWN"
  fi
  if pid="$(responder_running_pid)"; then
    echo "Responder: RUNNING (pid=$pid)"
  else
    echo "Responder: DOWN"
  fi
  if pid="$(vision_ears_running_pid)" && vision_ears_health_url >/dev/null 2>&1; then
    echo "VisionEars: RUNNING (pid=$pid)"
  else
    echo "VisionEars: DOWN"
  fi
  [[ -f "$RUNTIME_BASE/push_p_keepalive_status.json" ]] && \
    echo "---" && cat "$RUNTIME_BASE/push_p_keepalive_status.json"
}

cleanup() {
  rm -f "$KEEPALIVE_PID_FILE"
  log "Keepalive stopped."
}

# --- Main ---
case "${1:---loop}" in
  --once)
    health_check
    ;;
  --status)
    print_status
    ;;
  --loop|"")
    # Prevent double-launch
    if existing="$(keepalive_running_pid)" && [[ "$existing" != "$$" ]]; then
      echo "Keepalive already running pid=$existing"
      exit 0
    fi
    trap cleanup EXIT INT TERM
    echo "$$" > "$KEEPALIVE_PID_FILE"
    log "Keepalive started pid=$$ interval=${CHECK_INTERVAL}s"
    while true; do
      health_check
      /bin/sleep "$CHECK_INTERVAL"
    done
    ;;
  *)
    echo "usage: $0 [--once|--status|--loop]" >&2
    exit 1
    ;;
esac
