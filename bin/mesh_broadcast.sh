#!/bin/bash
# ==============================================================================
# Pushing Platform - Sovereign Mesh Broadcaster (Vertex Router)
# ==============================================================================
# This script is the physical execution layer for the Machine Topology UI.
# It takes a command and broadcasts it across the 14 VMs and local nodes
# using Tailscale SSH and local execution.
# ==============================================================================

COMMAND=$1

if [ -z "$COMMAND" ]; then
  echo "Error: No command provided."
  echo "Usage: ./mesh_broadcast.sh \"<command>\""
  exit 1
fi

echo "====================================================="
echo "👑 VERTEX ROUTER: INITIATING MESH BROADCAST"
echo "====================================================="
echo "Target Command: $COMMAND"
echo "-----------------------------------------------------"

# Node Definitions (mapped from MachineTopologyClient.tsx)
declare -A MESH_NODES=(
  ["Local-MacMini"]="localhost"
  ["iMac24"]="imac24.tail283dec.ts.net"
  ["MacStudio-Antigravity"]="emmanuels-mac-studio.tail283dec.ts.net"
  ["Cloud-Orchestrator"]="100.79.107.126"
)

# Broadcast execution
for NODE in "${!MESH_NODES[@]}"; do
  ADDRESS=${MESH_NODES[$NODE]}
  echo "[*] Pinging $NODE ($ADDRESS)..."
  
  if [ "$ADDRESS" == "localhost" ]; then
    # Execute locally
    eval "$COMMAND" &
    echo "  -> Dispatched locally to background."
  else
    # Execute via Tailscale SSH
    # Note: Keys must be authorized in Tailscale ACLs
    ssh -o StrictHostKeyChecking=no -o ConnectTimeout=3 "$ADDRESS" "$COMMAND" &
    echo "  -> Dispatched via Tailscale SSH to background."
  fi
done

wait
echo "-----------------------------------------------------"
echo "✅ MESH BROADCAST COMPLETE"
echo "====================================================="
