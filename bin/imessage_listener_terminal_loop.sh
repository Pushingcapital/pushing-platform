#!/bin/zsh
set -euo pipefail

RUNTIME_BASE="/Users/emmanuelhaddad/.imessage_sender_runtime"
LISTENER_SCRIPT="$RUNTIME_BASE/imessage_listener.py"
RUNTIME_LOGS_DIR="$RUNTIME_BASE/imessage_logs"
STATE_FILE="$RUNTIME_LOGS_DIR/.listener_state.json"
LISTENER_STATUS_FILE="$RUNTIME_BASE/imessage_listener_status.json"
PID_FILE="$RUNTIME_BASE/imessage_listener_terminal_loop.pid"
RUN_LOG="/Users/emmanuelhaddad/Library/Logs/PushingCapital/imessage_listener_terminal_loop.log"
CHECK_INTERVAL_SECONDS=120

mkdir -p "$RUNTIME_BASE" "$RUNTIME_LOGS_DIR" "/Users/emmanuelhaddad/Library/Logs/PushingCapital"
/Users/emmanuelhaddad/bin/imessage_api_launchd.sh --sync-only >/dev/null 2>&1 || true

if [[ ! -r "$LISTENER_SCRIPT" ]]; then
  echo "Missing runtime listener: $LISTENER_SCRIPT" >&2
  exit 1
fi

timestamp() {
  /bin/date -u +"%Y-%m-%dT%H:%M:%SZ"
}

api_health_ok() {
  /usr/bin/curl -fsS --max-time 10 "http://127.0.0.1:8786/health" >/dev/null 2>&1
}

public_health_ok() {
  /usr/bin/curl -fsS --max-time 12 "https://imessage-api.pushingcap.com/health" >/dev/null 2>&1
}

cleanup() {
  rm -f "$PID_FILE"
}

trap cleanup EXIT INT TERM
echo "$$" > "$PID_FILE"

while true; do
  checked_at="$(timestamp)"
  run_log="$(/usr/bin/python3 "$LISTENER_SCRIPT" --once --output-dir "$RUNTIME_LOGS_DIR" --state-file "$STATE_FILE" 2>&1)" || listener_exit=$?
  listener_exit="${listener_exit:-0}"
  if [[ "$listener_exit" == "0" ]]; then
    listener_ok="true"
  else
    listener_ok="false"
  fi
  if api_health_ok; then
    api_ok="true"
  else
    api_ok="false"
  fi
  if public_health_ok; then
    public_ok="true"
  else
    public_ok="false"
  fi
  printf '%s listener_ok=%s exit_code=%s\n%s\n' \
    "$checked_at" "$listener_ok" "$listener_exit" "$run_log" >> "$RUN_LOG"
  cat > "$LISTENER_STATUS_FILE" <<EOF
{
  "checked_at": "$checked_at",
  "api_loaded": true,
  "listener_loaded": true,
  "tunnel_loaded": $public_ok,
  "api_ok": $api_ok,
  "listener_ok": $listener_ok,
  "public_ok": $public_ok,
  "api_restarted": false,
  "listener_restarted": false,
  "tunnel_restarted": false,
  "sla_seconds": 120,
  "check_interval_seconds": 120,
  "target_model": "gpt-5.4"
}
EOF
  unset listener_exit
  /bin/sleep "$CHECK_INTERVAL_SECONDS"
done
