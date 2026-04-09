#!/bin/zsh
set -euo pipefail

RUNTIME_BASE="/Users/emmanuelhaddad/.imessage_sender_runtime"
RESPONDER_SCRIPT="$RUNTIME_BASE/push_p_responder.py"
PID_FILE="$RUNTIME_BASE/push_p_responder.pid"
STATUS_FILE="$RUNTIME_BASE/push_p_responder_status.json"
LOG_FILE="/Users/emmanuelhaddad/Library/Logs/PushingCapital/push_p_responder.log"

mkdir -p "$RUNTIME_BASE" "/Users/emmanuelhaddad/Library/Logs/PushingCapital"

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
    echo "responder stopped pid=$pid"
    return 0
  fi
  echo "responder not running"
  return 1
}

start_responder() {
  if pid="$(running_pid)"; then
    echo "responder already running pid=$pid"
    exit 0
  fi
  nohup /usr/bin/python3 "$RESPONDER_SCRIPT" >> "$LOG_FILE" 2>&1 < /dev/null &
  local pid="$!"
  echo "$pid" > "$PID_FILE"
  echo "responder started pid=$pid"
}

run_once() {
  exec /usr/bin/python3 "$RESPONDER_SCRIPT" --once
}

run_dry() {
  exec /usr/bin/python3 "$RESPONDER_SCRIPT" --once --dry-run
}

stop_responder() {
  stop_impl
}

status_responder() {
  if pid="$(running_pid)"; then
    echo "responder running pid=$pid"
  else
    echo "responder not running"
  fi
  [[ -f "$STATUS_FILE" ]] && cat "$STATUS_FILE"
}

case "${1:-status}" in
  start) start_responder ;;
  stop) stop_responder ;;
  restart) stop_impl || true; start_responder ;;
  status) status_responder ;;
  once) run_once ;;
  dry-run) run_dry ;;
  *)
    echo "usage: $0 {start|stop|restart|status|once|dry-run}" >&2
    exit 1
    ;;
esac
