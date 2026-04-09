#!/bin/zsh
set -euo pipefail

RUNTIME_BASE="/Users/emmanuelhaddad/.imessage_sender_runtime"
LISTENER_SCRIPT="$RUNTIME_BASE/imessage_listener.py"
RUNTIME_LOGS_DIR="$RUNTIME_BASE/imessage_logs"
STATE_FILE="$RUNTIME_LOGS_DIR/.listener_state.json"
PID_FILE="$RUNTIME_BASE/imessage_listener_fallback.pid"
STATUS_FILE="$RUNTIME_BASE/imessage_listener_fallback_status.json"
LOG_FILE="/Users/emmanuelhaddad/Library/Logs/PushingCapital/imessage_listener_fallback.log"
POLL_SECONDS=5

mkdir -p "$RUNTIME_BASE" "$RUNTIME_LOGS_DIR" "/Users/emmanuelhaddad/Library/Logs/PushingCapital"

running_pid() {
  if [[ -f "$PID_FILE" ]]; then
    local pid
    pid="$(cat "$PID_FILE" 2>/dev/null || true)"
    if [[ -n "$pid" ]] && /bin/kill -0 "$pid" >/dev/null 2>&1; then
      printf '%s\n' "$pid"
      return 0
    fi
  fi
  return 1
}

stop_impl() {
  if pid="$(running_pid)"; then
    /bin/kill "$pid"
    /bin/rm -f "$PID_FILE"
    echo "listener stopped pid=$pid"
    return 0
  fi
  echo "listener not running"
  return 1
}

write_status() {
  local pid="$1"
  cat > "$STATUS_FILE" <<EOF
{
  "checked_at": "$(/bin/date -u +%Y-%m-%dT%H:%M:%SZ)",
  "pid": $pid,
  "mode": "fallback_detached_python_listener",
  "poll_seconds": $POLL_SECONDS,
  "output_dir": "$RUNTIME_LOGS_DIR",
  "state_file": "$STATE_FILE",
  "log_file": "$LOG_FILE"
}
EOF
}

start_listener() {
  if pid="$(running_pid)"; then
    echo "listener already running pid=$pid"
    exit 0
  fi
  nohup /usr/bin/python3 "$LISTENER_SCRIPT" \
    --output-dir "$RUNTIME_LOGS_DIR" \
    --state-file "$STATE_FILE" \
    --poll-seconds "$POLL_SECONDS" >> "$LOG_FILE" 2>&1 < /dev/null &
  local pid="$!"
  echo "$pid" > "$PID_FILE"
  write_status "$pid"
  echo "listener started pid=$pid"
}

stop_listener() {
  stop_impl
}

status_listener() {
  if pid="$(running_pid)"; then
    echo "listener running pid=$pid"
  else
    echo "listener not running"
  fi
  [[ -f "$STATUS_FILE" ]] && cat "$STATUS_FILE"
}

case "${1:-status}" in
  start) start_listener ;;
  stop) stop_listener ;;
  restart) stop_impl || true; start_listener ;;
  status) status_listener ;;
  *)
    echo "usage: $0 {start|stop|restart|status}" >&2
    exit 1
    ;;
esac
