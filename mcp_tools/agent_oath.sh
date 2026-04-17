#!/bin/bash

# ==============================================================================
# MCP TOOL: agent_oath.sh
# ==============================================================================
# DESCRIPTION: Initiates an automated Biological OAuth logic for the Swarm 
#              Intelligence Nodes. Agents execute this to acquire a session
#              token and retrieve their real-time memory matrix layout.
# ==============================================================================

AGENT_ID="${1:-CODE_WORKER}"

VAULT_PATH="/Users/emmanuelhaddad/pushing-platform/mcp_tools/SWARM_KEYS.json"
API_KEY=$(jq -r ".workers.${AGENT_ID}.key" "$VAULT_PATH")

if [[ "$API_KEY" == "null" ]] || [[ -z "$API_KEY" ]]; then
    echo "[SECURITY_FAULT] Caller identity '${AGENT_ID}' does not exist in SWARM_KEYS.json. Execution locked."
    exit 1
fi

echo "[SWARM_OAUTH] Initiating handshake for ${AGENT_ID}..."

RESPONSE=$(curl -s -X POST "http://34.9.22.6:3000/api/auth/swarm" \
  -H "Content-Type: application/json" \
  -d "{\"agent_id\": \"${AGENT_ID}\", \"vault_key\": \"${API_KEY}\"}")

# Format the JSON response beautifully 
echo ""
echo "=== ⎈ SWARM OAUTH MEMORY MATRIX ==="
echo "$RESPONSE" | jq '.'
echo "==================================="
echo ""
echo "[SESSION_READY] Execution authorized. Intelligence memory locked."
