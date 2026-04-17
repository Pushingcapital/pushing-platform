#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# P Vault Startup Script
# ─────────────────────────────────────────────────────────────────────────────
# Starts the full P :: VAULT relay chain:
#   1. p_web_relay.py (local HTTP bridge to p_chat_bridge.py)
#   2. cloudflared tunnel (exposes relay to internet)
#   3. p_memory_builder.py (refreshes platform memory layer)
#   4. Updates wrangler.jsonc P_RELAY_URL + deploys
#
# Usage:
#   ./start_p_vault.sh [--no-deploy] [--port 7779] [--skip-memory]
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

RELAY_PORT="${P_RELAY_PORT:-7779}"
VENV_PYTHON="/Users/emmanuelhaddad/pushing-platform/.venv_swarm/bin/python3"
RELAY_SCRIPT="/Users/emmanuelhaddad/pushing-platform/bin/p_web_relay.py"
MEMORY_BUILDER="/Users/emmanuelhaddad/pushing-platform/bin/p_memory_builder.py"
WRANGLER_CONFIG="/Users/emmanuelhaddad/pushing-platform/projects/pushingcap-web-v2/wrangler.jsonc"
PLATFORM_DIR="/Users/emmanuelhaddad/pushing-platform/projects/pushingcap-web-v2"
CLOUDFLARED="/opt/homebrew/bin/cloudflared"
TUNNEL_LOG="/tmp/p_tunnel.log"
RELAY_PID_FILE="/tmp/p_relay.pid"
TUNNEL_PID_FILE="/tmp/p_tunnel.pid"
DEPLOY=true
BUILD_MEMORY=true

# Parse args
for arg in "$@"; do
  case $arg in
    --no-deploy) DEPLOY=false ;;
    --skip-memory) BUILD_MEMORY=false ;;
    --port=*) RELAY_PORT="${arg#*=}" ;;
  esac
done

echo "═══════════════════════════════════════════════════"
echo "  P :: VAULT STARTUP"
echo "═══════════════════════════════════════════════════"

# ── Kill existing relay ────────────────────────────────────────────────────────
if [ -f "$RELAY_PID_FILE" ]; then
  OLD_PID=$(cat "$RELAY_PID_FILE")
  kill "$OLD_PID" 2>/dev/null || true
  rm -f "$RELAY_PID_FILE"
fi
# Kill by port as fallback
lsof -nP -iTCP:"$RELAY_PORT" 2>/dev/null | awk 'NR>1 {print $2}' | sort -u | xargs kill -9 2>/dev/null || true
sleep 1

# ── Start relay ────────────────────────────────────────────────────────────────
echo "🟢 Starting P relay on port $RELAY_PORT..."
"$VENV_PYTHON" "$RELAY_SCRIPT" --port "$RELAY_PORT" &
RELAY_PID=$!
echo "$RELAY_PID" > "$RELAY_PID_FILE"
sleep 3

# Verify relay is alive
if ! curl -s "http://localhost:$RELAY_PORT/health" > /dev/null 2>&1; then
  echo "❌ Relay failed to start on port $RELAY_PORT"
  exit 1
fi
echo "   ✅ Relay running (PID $RELAY_PID)"

# ── Kill existing tunnel ───────────────────────────────────────────────────────
if [ -f "$TUNNEL_PID_FILE" ]; then
  OLD_TUNNEL_PID=$(cat "$TUNNEL_PID_FILE")
  kill "$OLD_TUNNEL_PID" 2>/dev/null || true
  rm -f "$TUNNEL_PID_FILE"
fi
pkill -f "cloudflared tunnel" 2>/dev/null || true
sleep 2

# ── Start Cloudflare Tunnel ────────────────────────────────────────────────────
echo "🌐 Starting Cloudflare Tunnel → localhost:$RELAY_PORT..."
"$CLOUDFLARED" tunnel --url "http://localhost:$RELAY_PORT" > "$TUNNEL_LOG" 2>&1 &
TUNNEL_PID=$!
echo "$TUNNEL_PID" > "$TUNNEL_PID_FILE"

# Wait for tunnel URL to appear
echo "   Waiting for tunnel URL..."
TUNNEL_URL=""
for i in $(seq 1 30); do
  TUNNEL_URL=$(grep -oP 'https://[a-z0-9-]+\.trycloudflare\.com' "$TUNNEL_LOG" 2>/dev/null | head -1 || true)
  if [ -n "$TUNNEL_URL" ]; then
    break
  fi
  sleep 1
done

if [ -z "$TUNNEL_URL" ]; then
  echo "❌ Failed to get tunnel URL after 30s. Check $TUNNEL_LOG"
  exit 1
fi
echo "   ✅ Tunnel URL: $TUNNEL_URL"

# ── Rebuild memory layer ───────────────────────────────────────────────────────
if [ "$BUILD_MEMORY" = true ]; then
  echo ""
  echo "🧠 Refreshing P platform memory layer..."
  "$VENV_PYTHON" "$MEMORY_BUILDER" --quiet
  echo "   ✅ Memory layer updated"
fi

# ── Update wrangler.jsonc P_RELAY_URL ─────────────────────────────────────────
echo ""
echo "⚙️  Updating wrangler.jsonc P_RELAY_URL..."
sed -i '' "s|\"P_RELAY_URL\": \"https://[^\"]*\"|\"P_RELAY_URL\": \"$TUNNEL_URL\"|" "$WRANGLER_CONFIG"
echo "   ✅ wrangler.jsonc updated: $TUNNEL_URL"

# ── Deploy ─────────────────────────────────────────────────────────────────────
if [ "$DEPLOY" = true ]; then
  echo ""
  echo "🚀 Deploying to Cloudflare..."
  export PATH="$PATH:/opt/homebrew/bin"
  cd "$PLATFORM_DIR"
  npm run deploy 2>&1 | grep -E "Deployed|Version ID|Error|✅|❌" || true
  echo "   ✅ Deployed"
fi

echo ""
echo "═══════════════════════════════════════════════════"
echo "  ✅ P :: VAULT ONLINE"
echo "  Relay: http://localhost:$RELAY_PORT"
echo "  Tunnel: $TUNNEL_URL"
echo "  Platform: https://www.pushingcap.com/p"
echo "  Memory: ~/.config/pushingcapital/p_platform_memory.md"
echo "═══════════════════════════════════════════════════"
echo ""
echo "  To stop: kill $RELAY_PID $TUNNEL_PID"
echo "  To refresh memory: POST http://localhost:$RELAY_PORT/memory/refresh"
echo "  To tail relay: kill -0 $RELAY_PID && echo alive"
