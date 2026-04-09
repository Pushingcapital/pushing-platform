#!/bin/zsh
set -euo pipefail

RUNTIME_BASE="/Users/emmanuelhaddad/.imessage_sender_runtime"
PID_FILE="$RUNTIME_BASE/imessage_listener_terminal_loop.pid"
LOOP_SCRIPT="/Users/emmanuelhaddad/bin/imessage_listener_terminal_loop.sh"

mkdir -p "$RUNTIME_BASE"

if [[ -f "$PID_FILE" ]]; then
  existing_pid="$(cat "$PID_FILE" 2>/dev/null || true)"
  if [[ -n "$existing_pid" ]] && /bin/kill -0 "$existing_pid" >/dev/null 2>&1; then
    exit 0
  fi
fi

/Users/emmanuelhaddad/bin/imessage_api_launchd.sh --sync-only >/dev/null 2>&1 || true

osascript <<APPLESCRIPT
tell application "Terminal"
  if not running then
    reopen
  end if
  do script "/bin/zsh $LOOP_SCRIPT"
end tell
APPLESCRIPT
