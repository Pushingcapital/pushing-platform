#!/bin/bash
# ==============================================================================
# Pushing Platform - The Pulse (Resurrection Daemon)
# ==============================================================================
# Runs on ONE machine (The Command Center).
# Constantly monitors the mesh and wakes up any sleeping Gemini shells
# by spawning them in detached tmux sessions.
# ==============================================================================

echo "🫀 The Pulse (Resurrection Daemon) Initialized."

# Tailscale IPs for the mesh
declare -A MESH_NODES=(
  ["Local-MacMini"]="localhost"
  ["iMac24"]="imac24.tail283dec.ts.net"
  ["MacStudio"]="emmanuels-mac-studio.tail283dec.ts.net"
)

# The command to wake a node: Creates a detached tmux session running the Gemini CLI
WAKE_CMD="tmux has-session -t sovereign-node 2>/dev/null || tmux new-session -d -s sovereign-node 'gemini'"

while true; do
  TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
  echo "[$TIMESTAMP] Sending Pulse..."

  for NODE in "${!MESH_NODES[@]}"; do
    IP="${MESH_NODES[$NODE]}"
    
    if [ "$IP" == "localhost" ]; then
      # Check local
      if ! pgrep -f "gemini" > /dev/null; then
        echo "  ⚠️ $NODE is ASLEEP. Waking Gemini..."
        eval "$WAKE_CMD"
      fi
    else
      # Check remote via SSH
      ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no "$IP" "pgrep -f gemini > /dev/null" 2>/dev/null
      STATUS=$?
      
      if [ $STATUS -ne 0 ]; then
        echo "  ⚠️ $NODE is ASLEEP. Sending Wake Packet..."
        ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no "$IP" "$WAKE_CMD" 2>/dev/null &
      else
         echo "  ✅ $NODE is Awake."
      fi
    fi
  done
  
  # Heartbeat every 60 seconds
  sleep 60
done
