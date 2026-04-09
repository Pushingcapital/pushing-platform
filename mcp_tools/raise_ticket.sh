#!/bin/zsh
# Swarm Universal Protocol: Ticket Dispatch
# Requires valid X-Swarm-Key to communicate with the Biological Router.

if [ "$#" -lt 4 ]; then
    echo "Usage: ./raise_ticket.sh <target_agent> <ticket_id> <payload> <api_key>"
    echo "Example: ./raise_ticket.sh CODE_WORKER TKT-099 'Execute bash loop' sk_swarm_gemini_5409"
    exit 1
fi

TARGET_AGENT=$1
TICKET_ID=$2
PAYLOAD=$3
API_KEY=$4

echo "[SWARM_OUTBOUND] Pulsing router with ticket ${TICKET_ID} via key ${API_KEY:0:10}***..."

curl -s -X POST http://localhost:3001/api/swarm/dispatch \
  -H "Content-Type: application/json" \
  -H "X-Swarm-Key: $API_KEY" \
  -d "{\"target_agent\": \"$TARGET_AGENT\", \"ticket_id\": \"$TICKET_ID\", \"payload\": \"$PAYLOAD\"}" | jq .
