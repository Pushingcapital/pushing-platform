#!/bin/bash
# ==============================================================================
# Pushing Platform - Sovereign Swarm Handshake
# ==============================================================================
# All nodes run this to register their presence in the D1 Truth Engine.
# Usage: ./swarm_handshake.sh <NODE_NAME>
# ==============================================================================

NODE_NAME=$1

if [ -z "$NODE_NAME" ]; then
  echo "Error: Node name required (e.g., Node-1-Reader)."
  exit 1
fi

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo "Initiating handshake for $NODE_NAME..."

npx wrangler d1 execute pushpush --remote --command "INSERT INTO orchestration_log (contact_id, email, command, intent, result, timestamp) VALUES ('$NODE_NAME', 'mesh@pushingcap.com', 'NODE_HANDSHAKE', 'Node is online and ready for A2A dispatch.', 'COMPLETED', '$TIMESTAMP');"

if [ $? -eq 0 ]; then
  echo "✅ $NODE_NAME is online and registered in the D1 Truth Engine."
else
  echo "❌ Failed to register $NODE_NAME."
fi
