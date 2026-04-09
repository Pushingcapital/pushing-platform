#!/bin/zsh
set -euo pipefail

DESKTOP_BASE="/Users/emmanuelhaddad/Desktop/imessage_sender"
RUNTIME_BASE="/Users/emmanuelhaddad/.imessage_sender_runtime"
RUNTIME_ENV="$RUNTIME_BASE/.env"
RUNTIME_LISTENER="$RUNTIME_BASE/imessage_listener.py"
RUNTIME_LOGS_DIR="$RUNTIME_BASE/imessage_logs"
STATE_FILE="$RUNTIME_LOGS_DIR/.listener_state.json"

mkdir -p "$RUNTIME_BASE" "$RUNTIME_LOGS_DIR"

if [[ -r "$DESKTOP_BASE/imessage_listener.py" ]]; then
  cp "$DESKTOP_BASE/imessage_listener.py" "$RUNTIME_LISTENER" 2>/dev/null || true
fi

if [[ ! -r "$RUNTIME_LISTENER" ]]; then
  echo "Missing runtime listener: $RUNTIME_LISTENER" >&2
  exit 1
fi

if [[ -r "$RUNTIME_ENV" ]]; then
  set -a
  source "$RUNTIME_ENV"
  set +a
fi

exec /usr/bin/python3 "$RUNTIME_LISTENER" \
  --output-dir "$RUNTIME_LOGS_DIR" \
  --state-file "$STATE_FILE"
