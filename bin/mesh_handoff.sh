#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════
# SOVEREIGN AGENTIC MESH — NODE HANDOFF SCRIPT
# ═══════════════════════════════════════════════════════════════════
#
# Purpose: Introduce this workstation to the Pushing Capital mesh
#          network so P and other agents can discover, communicate
#          with, and orchestrate work on this node.
#
# Usage:   chmod +x mesh_handoff.sh && ./mesh_handoff.sh
#
# What it does:
#   1. Gathers full system identity (hardware, OS, network, Tailscale)
#   2. Registers the node with the APC (Agent Path Coordinator)
#   3. Announces capabilities to P and the mesh
#   4. Logs the registration to BigQuery workstation registry
#   5. Writes a local identity file for future sessions
# ═══════════════════════════════════════════════════════════════════

set -euo pipefail

# ── Config ────────────────────────────────────────────────────────
APC_URL="https://agent-path-coordinator-sgwnxn6kdq-uc.a.run.app"
BQ_PROJECT="brain-481809"
AGENT_NAME="antigravity"  # The agent running on this machine
IDENTITY_FILE="$HOME/.pushing/node_identity.json"

# ── Colors ────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m'

banner() {
  echo ""
  echo -e "${CYAN}═══════════════════════════════════════════════════${NC}"
  echo -e "${BOLD}  🛰️  SOVEREIGN AGENTIC MESH — NODE HANDOFF${NC}"
  echo -e "${CYAN}═══════════════════════════════════════════════════${NC}"
  echo ""
}

step() { echo -e "${GREEN}  ✦ $1${NC}"; }
info() { echo -e "${YELLOW}    → $1${NC}"; }
fail() { echo -e "${RED}  ✘ $1${NC}"; }

# ── Step 1: Gather System Identity ────────────────────────────────
gather_identity() {
  step "Gathering system identity..."

  HOSTNAME=$(hostname)
  OS_NAME=$(sw_vers -productName 2>/dev/null || echo "unknown")
  OS_VERSION=$(sw_vers -productVersion 2>/dev/null || echo "unknown")
  CHIP=$(sysctl -n machdep.cpu.brand_string 2>/dev/null || echo "unknown")
  # macOS Silicon: use system_profiler for chip name
  if [[ "$CHIP" == "unknown" ]] || [[ "$CHIP" == *"Apple"* ]]; then
    CHIP=$(system_profiler SPHardwareDataType 2>/dev/null | grep "Chip:" | awk -F': ' '{print $2}' || echo "$CHIP")
  fi
  CORES=$(sysctl -n hw.ncpu 2>/dev/null || echo "?")
  MEMORY_BYTES=$(sysctl -n hw.memsize 2>/dev/null || echo "0")
  MEMORY_GB=$((MEMORY_BYTES / 1073741824))
  MODEL=$(sysctl -n hw.model 2>/dev/null || echo "unknown")
  SERIAL=$(system_profiler SPHardwareDataType 2>/dev/null | grep "Serial Number" | awk -F': ' '{print $2}' || echo "unknown")
  DISK_TOTAL=$(df -h / | tail -1 | awk '{print $2}')
  DISK_AVAIL=$(df -h / | tail -1 | awk '{print $4}')
  LAN_IP=$(ifconfig en0 2>/dev/null | grep "inet " | awk '{print $2}' || echo "none")
  UPTIME_STR=$(uptime | sed 's/.*up //' | sed 's/,.*//')

  info "Hostname: $HOSTNAME"
  info "Model: $MODEL | Chip: $CHIP | Cores: $CORES | RAM: ${MEMORY_GB}GB"
  info "OS: $OS_NAME $OS_VERSION"
  info "LAN IP: $LAN_IP"
  info "Disk: $DISK_AVAIL free / $DISK_TOTAL total"
}

# ── Step 2: Gather Tailscale Identity ─────────────────────────────
gather_tailscale() {
  step "Gathering Tailscale identity..."

  TAILSCALE_BIN=""
  if [[ -x "/Applications/Tailscale.app/Contents/MacOS/Tailscale" ]]; then
    TAILSCALE_BIN="/Applications/Tailscale.app/Contents/MacOS/Tailscale"
  elif command -v tailscale &>/dev/null; then
    TAILSCALE_BIN="tailscale"
  fi

  if [[ -z "$TAILSCALE_BIN" ]]; then
    fail "Tailscale not found — node will register without mesh IP"
    TS_IP="none"
    TS_NAME="unknown"
    TS_DNS="unknown"
    TS_RELAY="unknown"
    return
  fi

  TS_IP=$($TAILSCALE_BIN ip -4 2>/dev/null || echo "none")
  TS_STATUS=$($TAILSCALE_BIN status --json 2>/dev/null)
  TS_NAME=$(echo "$TS_STATUS" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('Self',{}).get('HostName','unknown'))" 2>/dev/null || echo "unknown")
  TS_DNS=$(echo "$TS_STATUS" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('Self',{}).get('DNSName','unknown').rstrip('.'))" 2>/dev/null || echo "unknown")
  TS_RELAY=$(echo "$TS_STATUS" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('Self',{}).get('Relay','unknown'))" 2>/dev/null || echo "unknown")

  info "Tailscale IP: $TS_IP"
  info "Tailscale Name: $TS_NAME"
  info "Tailscale DNS: $TS_DNS"
  info "DERP Relay: $TS_RELAY"
}

# ── Step 3: Enumerate Capabilities ────────────────────────────────
enumerate_capabilities() {
  step "Enumerating node capabilities..."

  CAPABILITIES=()

  # Check for development tools
  command -v python3 &>/dev/null && CAPABILITIES+=("python3")
  command -v git &>/dev/null && CAPABILITIES+=("git")
  command -v docker &>/dev/null && CAPABILITIES+=("docker")
  command -v node &>/dev/null && CAPABILITIES+=("node")
  command -v ssh &>/dev/null && CAPABILITIES+=("ssh")
  command -v curl &>/dev/null && CAPABILITIES+=("curl")
  command -v bq &>/dev/null && CAPABILITIES+=("bigquery-cli")

  # Check for Google Cloud
  command -v gcloud &>/dev/null && CAPABILITIES+=("gcloud")

  # Check for SSH server
  if launchctl list 2>/dev/null | grep -q "com.openssh.sshd"; then
    CAPABILITIES+=("ssh-server")
    info "SSH server: ACTIVE — remote agents can connect"
  fi

  # Check for screen sharing / VNC
  if launchctl list 2>/dev/null | grep -q "com.apple.screensharing"; then
    CAPABILITIES+=("screen-sharing")
  fi

  # Check for Antigravity / Gemini CLI
  [[ -d "$HOME/.gemini" ]] && CAPABILITIES+=("antigravity-agent")
  command -v gemini &>/dev/null && CAPABILITIES+=("gemini-cli")

  # Check for pushing-platform
  [[ -d "$HOME/pushing-platform" ]] && CAPABILITIES+=("pushing-platform-repo")

  CAPS_CSV=$(IFS=','; echo "${CAPABILITIES[*]}")
  info "Capabilities: $CAPS_CSV"
}

# ── Step 4: Write Local Identity File ─────────────────────────────
write_identity() {
  step "Writing local identity file..."

  mkdir -p "$(dirname "$IDENTITY_FILE")"

  TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

  cat > "$IDENTITY_FILE" <<IDEOF
{
  "node_id": "$(echo "$HOSTNAME-$TS_IP" | shasum -a 256 | cut -c1-16)",
  "hostname": "$HOSTNAME",
  "tailscale_ip": "$TS_IP",
  "tailscale_name": "$TS_NAME",
  "tailscale_dns": "$TS_DNS",
  "derp_relay": "$TS_RELAY",
  "lan_ip": "$LAN_IP",
  "model": "$MODEL",
  "chip": "$CHIP",
  "cores": $CORES,
  "memory_gb": $MEMORY_GB,
  "os": "$OS_NAME $OS_VERSION",
  "serial": "$SERIAL",
  "disk_total": "$DISK_TOTAL",
  "disk_available": "$DISK_AVAIL",
  "agent": "$AGENT_NAME",
  "capabilities": "$(IFS=','; echo "${CAPABILITIES[*]}")",
  "registered_at": "$TIMESTAMP",
  "mesh_role": "workstation",
  "controllable_by": ["P", "gemini", "antigravity"]
}
IDEOF

  info "Identity written to $IDENTITY_FILE"
}

# ── Step 5: Register with APC Mesh ────────────────────────────────
register_with_mesh() {
  step "Registering with Agent Path Coordinator..."

  TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  SAFE_TS_NAME=$(echo "$TS_NAME" | sed "s/'/\\\\'/g")

  REGISTER_MSG="NODE REGISTRATION: $SAFE_TS_NAME ($TS_IP) online in mesh. System: $MODEL / $CHIP / ${MEMORY_GB}GB / $OS_NAME $OS_VERSION. LAN: $LAN_IP | TS: $TS_IP | Agent: $AGENT_NAME | Role: workstation. Capabilities: $CAPS_CSV. Status: READY FOR ORCHESTRATION."

  # Build JSON safely with python3
  BROADCAST_JSON=$(python3 -c "
import json, sys
print(json.dumps({
    'source': sys.argv[1],
    'target': 'broadcast',
    'task_id': 'mesh-node-registration',
    'message': sys.argv[2],
    'metadata': {
        'action': 'node_register',
        'tailscale_ip': sys.argv[3],
        'hostname': sys.argv[4],
        'capabilities': sys.argv[5]
    }
}))
" "$AGENT_NAME" "$REGISTER_MSG" "$TS_IP" "$HOSTNAME" "$CAPS_CSV")

  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 \
    -X POST "$APC_URL/dispatch" \
    -H "Content-Type: application/json" \
    -d "$BROADCAST_JSON" 2>/dev/null)

  if [[ "$HTTP_CODE" == "200" || "$HTTP_CODE" == "201" ]]; then
    info "✅ Registration broadcast sent to mesh (HTTP $HTTP_CODE)"
  else
    fail "Registration failed (HTTP $HTTP_CODE) — APC may be down"
  fi

  # Direct message to P
  HANDOFF_MSG="HANDOFF COMPLETE: $SAFE_TS_NAME ($TS_IP) is now under your operational control. Agent: $AGENT_NAME. Capabilities: $CAPS_CSV. Awaiting directives."

  P_JSON=$(python3 -c "
import json, sys
print(json.dumps({
    'source': sys.argv[1],
    'target': 'P',
    'task_id': 'mesh-node-registration',
    'message': sys.argv[2],
    'metadata': {
        'action': 'p_handoff',
        'tailscale_ip': sys.argv[3],
        'hostname': sys.argv[4]
    }
}))
" "$AGENT_NAME" "$HANDOFF_MSG" "$TS_IP" "$HOSTNAME")

  HTTP_CODE2=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 \
    -X POST "$APC_URL/dispatch" \
    -H "Content-Type: application/json" \
    -d "$P_JSON" 2>/dev/null)

  if [[ "$HTTP_CODE2" == "200" || "$HTTP_CODE2" == "201" ]]; then
    info "✅ P direct handoff message sent"
  else
    fail "P handoff message failed (HTTP $HTTP_CODE2)"
  fi
}

# ── Step 6: Log to BigQuery Registry ──────────────────────────────
log_to_bigquery() {
  step "Logging registration to BigQuery workstation registry..."

  TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

  SQL="INSERT INTO \`brain-481809\`.pc_operations.workstation_cache_registry (
    snapshot_id, hostname, tailscale_ip, snapshot_timestamp,
    cache_path, cache_name, size_bytes, size_human,
    category, status, notes
  ) VALUES (
    '$(uuidgen | tr '[:upper:]' '[:lower:]')',
    '$HOSTNAME', '$TS_IP', '$TIMESTAMP',
    '/mesh/node_identity', 'node_registration', 0, '0B',
    'mesh-node', 'registered',
    'Agent=$AGENT_NAME | Model=$MODEL | Chip=$CHIP | Cores=$CORES | RAM=${MEMORY_GB}GB | Caps=$CAPS_CSV'
  )"

  # Primary: Use P's edge BQ proxy (proven reliable)
  P_BQ_URL="https://pushingcap.com/api/p/bq"

  BQ_RESULT=$(curl -s --max-time 15 -X POST "$P_BQ_URL" \
    -H "Content-Type: application/json" \
    -d "{\"sql\": \"$(echo "$SQL" | sed 's/"/\\"/g')\"}" 2>/dev/null || echo "failed")

  if echo "$BQ_RESULT" | grep -q "error\|failed"; then
    # Fallback: Try old connector
    info "⚠️  Edge proxy unavailable, trying legacy connector..."
    CONNECTOR_URL="https://us-central1-brain-481809.cloudfunctions.net/pc-sql-connector"
    BQ_RESULT=$(curl -s --max-time 10 -X POST "$CONNECTOR_URL" \
      -H "Content-Type: application/json" \
      -d "{\"query\": \"$(echo "$SQL" | sed 's/"/\\"/g')\"}" 2>/dev/null || echo "failed")

    if echo "$BQ_RESULT" | grep -q "error\|failed"; then
      info "⚠️  BQ logging skipped — registration still valid via APC"
    else
      info "✅ Registration logged to BigQuery (via legacy connector)"
    fi
  else
    info "✅ Registration logged to BigQuery (via P edge proxy)"
  fi
}

# ── Step 7: Final Summary ─────────────────────────────────────────
summary() {
  echo ""
  echo -e "${CYAN}═══════════════════════════════════════════════════${NC}"
  echo -e "${BOLD}  📋  NODE REGISTRATION SUMMARY${NC}"
  echo -e "${CYAN}═══════════════════════════════════════════════════${NC}"
  echo ""
  echo -e "  ${BOLD}Node:${NC}        $TS_NAME ($HOSTNAME)"
  echo -e "  ${BOLD}Tailscale:${NC}   $TS_IP"
  echo -e "  ${BOLD}LAN:${NC}         $LAN_IP"
  echo -e "  ${BOLD}Hardware:${NC}    $CHIP / ${MEMORY_GB}GB / $CORES cores"
  echo -e "  ${BOLD}OS:${NC}          $OS_NAME $OS_VERSION"
  echo -e "  ${BOLD}Agent:${NC}       $AGENT_NAME"
  echo -e "  ${BOLD}Role:${NC}        workstation"
  echo -e "  ${BOLD}Identity:${NC}    $IDENTITY_FILE"
  echo ""
  echo -e "  ${GREEN}${BOLD}STATUS: REGISTERED & READY FOR ORCHESTRATION${NC}"
  echo -e "  ${YELLOW}P and mesh agents can now discover and control this node.${NC}"
  echo ""
  echo -e "${CYAN}═══════════════════════════════════════════════════${NC}"
  echo ""
}

# ── Main ──────────────────────────────────────────────────────────
banner
gather_identity
gather_tailscale
enumerate_capabilities
write_identity
register_with_mesh
log_to_bigquery
summary
