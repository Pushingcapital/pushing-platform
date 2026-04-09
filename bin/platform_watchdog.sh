#!/usr/bin/env bash

# // ==========================================
# // PLATFORM WATCHDOG // The Keeper of the Pulse
# // ==========================================
# This daemon ensures the Pushing Capital architecture
# fundamentally refuses to die. If the UI node or the React
# server violently crash, this immediately spins it back up.

TARGET_URL="http://localhost:3000"
PROJECT_DIR="/Users/emmanuelhaddad/pushing-platform/projects/pushingcap-web-v2"
WAIT_SECONDS=10

echo "============ PUSHING CAPITAL SENTINEL BINDING ============"
echo "Mapping watchdog to port 3000..."

while true; do
  # Ping the platform
  if ! curl -s --head  --request GET ${TARGET_URL} | grep "200" > /dev/null; then
    echo "[$(date +'%H:%M:%S')] ⚠ PLATFORM HALT DETECTED."
    echo "[$(date +'%H:%M:%S')] ⎈ Pinging dead node. Target unreached."
    
    # Check if a node process exists for Next.js, explicitly kill it just in case it zombie'd
    ZOMBIE_PID=$(lsof -ti:3000)
    if [ ! -z "$ZOMBIE_PID" ]; then
        echo "[$(date +'%H:%M:%S')] ⨯ Terminating zombie process on port 3000 (PID: $ZOMBIE_PID)"
        kill -9 $ZOMBIE_PID
    fi

    echo "[$(date +'%H:%M:%S')] ⌁ INIT RECOVERY: Booting Sovereign Engine..."
    
    # Relaunch the NextJS platform in the background, dumping logs directly to terminal
    cd $PROJECT_DIR && npm run dev > /tmp/pushing_platform_recovery.log 2>&1 &
    
    echo "[$(date +'%H:%M:%S')] ✓ RESURRECT VALID. Platform bounds re-established."
    sleep 15 # Give it a grace period to compile and bind
  else
    # Heartbeat is fine
    echo "[$(date +'%H:%M:%S')] Pulse OK -> $TARGET_URL"
  fi
  
  sleep $WAIT_SECONDS
done
