#!/bin/zsh
set -euo pipefail

DESKTOP_BASE="/Users/emmanuelhaddad/Desktop/imessage_sender"
RUNTIME_BASE="/Users/emmanuelhaddad/.imessage_sender_runtime"
RUNTIME_ENV="$RUNTIME_BASE/.env"
RUNTIME_APP="$RUNTIME_BASE/web_sender.py"
RUNTIME_LISTENER="$RUNTIME_BASE/imessage_listener.py"

mkdir -p "$RUNTIME_BASE"

# Launchd can lose Desktop read privileges under macOS privacy rules, so the
# runtime copy is the stable source of truth at service start. Desktop sync is
# still available explicitly via --sync-only or IMESSAGE_SYNC_FROM_DESKTOP=1.
SYNC_FROM_DESKTOP=0
if [[ "${1:-}" == "--sync-only" || "${IMESSAGE_SYNC_FROM_DESKTOP:-0}" == "1" ]]; then
  SYNC_FROM_DESKTOP=1
fi

if [[ "$SYNC_FROM_DESKTOP" == "1" ]]; then
  if [[ -r "$DESKTOP_BASE/.env" ]]; then
    cp "$DESKTOP_BASE/.env" "$RUNTIME_ENV" 2>/dev/null || true
    chmod 600 "$RUNTIME_ENV" 2>/dev/null || true
  fi
  if [[ -r "$DESKTOP_BASE/web_sender.py" ]]; then
    cp "$DESKTOP_BASE/web_sender.py" "$RUNTIME_APP" 2>/dev/null || true
  fi
  if [[ -r "$DESKTOP_BASE/imessage_listener.py" ]]; then
    cp "$DESKTOP_BASE/imessage_listener.py" "$RUNTIME_LISTENER" 2>/dev/null || true
  fi
fi

if [[ "${1:-}" == "--sync-only" ]]; then
  exit 0
fi

if [[ ! -r "$RUNTIME_ENV" ]]; then
  echo "Missing runtime env: $RUNTIME_ENV" >&2
  exit 1
fi
if [[ ! -r "$RUNTIME_APP" ]]; then
  echo "Missing runtime app: $RUNTIME_APP" >&2
  exit 1
fi

set -a
source "$RUNTIME_ENV"
set +a

if [[ -z "${IMESSAGE_API_KEY:-}" ]]; then
  echo "IMESSAGE_API_KEY missing in $RUNTIME_ENV" >&2
  exit 1
fi

HOST="${IMESSAGE_BIND_HOST:-127.0.0.1}"
PORT="${IMESSAGE_API_PORT:-8786}"

exec /usr/bin/python3 "$RUNTIME_APP" \
  --host "$HOST" \
  --port "$PORT" \
  --api-key "$IMESSAGE_API_KEY" \
  --no-browser
