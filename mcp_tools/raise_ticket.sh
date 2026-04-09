#!/bin/zsh
# Swarm Universal Protocol: Ticket Dispatch
# Natively integrated with Biological JSON Vault.

if [ "$#" -lt 3 ]; then
    echo "Usage: ./raise_ticket.sh <target_agent> <ticket_id> <payload> [optional: <caller_identity>]"
    echo "Example: ./raise_ticket.sh CODE_WORKER TKT-099 'Execute bash loop' GEMINI"
    exit 1
fi

TARGET_AGENT=$1
TICKET_ID=$2
PAYLOAD=$3
CALLER=$4

# Default to operating as ANTIGRAVITY if no explicit caller is routed
if [ -z "$CALLER" ]; then
    CALLER="ANTIGRAVITY"
fi

VAULT_PATH="/Users/emmanuelhaddad/pushing-platform/mcp_tools/SWARM_KEYS.json"
API_KEY=$(jq -r ".workers.${CALLER}.key" "$VAULT_PATH")

if [[ "$API_KEY" == "null" ]] || [[ -z "$API_KEY" ]]; then
    echo "[SECURITY_FAULT] Caller identity '${CALLER}' does not exist in SWARM_KEYS.json. Execution locked."
    exit 1
fi

echo "[SWARM_OUTBOUND] Authenticated as ${CALLER}. Pulsing router with ticket ${TICKET_ID}..."

curl -s -X POST http://localhost:3001/api/swarm/dispatch \
  -H "Content-Type: application/json" \
  -H "X-Swarm-Key: $API_KEY" \
  -d "{\"target_agent\": \"$TARGET_AGENT\", \"ticket_id\": \"$TICKET_ID\", \"payload\": \"$PAYLOAD\"}" | jq .
