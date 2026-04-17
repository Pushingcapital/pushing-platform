#!/bin/zsh
echo "🚀 WAKING UP THE EMPIRE..."

# Kill any ghost processes
lsof -ti:8899,3000,3010 | xargs kill -9 2>/dev/null

PYTHON="/Library/Developer/CommandLineTools/Library/Frameworks/Python3.framework/Versions/3.9/Resources/Python.app/Contents/MacOS/Python"
DIR="/Users/emmanuelhaddad/.imessage_sender_runtime"

# 1. Start the Spinal Cord (API)
cd /Users/emmanuelhaddad/pushing-platform/pcrm-v2
$PYTHON -m uvicorn api.main:app --host 0.0.0.0 --port 8899 --reload > $DIR/pcrm_api.out.log 2>&1 &
echo "✅ API Online (8899)"

# 2. Start P (The Brain)
$PYTHON $DIR/push_p_responder.py > $DIR/api_live.out.log 2>&1 &
$PYTHON $DIR/imessage_listener.py > $DIR/listener_live.out.log 2>&1 &
echo "✅ P Active (+19497064604)"

# 3. Start the Swarm Engine
GEMINI_API_KEY="AIzaSyCemV3Y_Eiej4hyEPgXw7ShlKT8DzYzVWc" PYTHONUNBUFFERED=1 $PYTHON /Users/emmanuelhaddad/pushing-platform/pcrm-v2/api/core_swarm_engine.py > $DIR/core_swarm_engine.out.log 2>&1 &
echo "✅ Swarm Engine Online"

# 4. Start the Mirror (Website)
cd /Users/emmanuelhaddad/pushing-platform/projects/pushingcap-web-v2
npm run dev -- --port 3000 > /tmp/web_v2.log 2>&1 &
echo "✅ Platform Mirror Live (localhost:3000)"

echo "🤝 UNIFICATION COMPLETE. All agents are synchronized."

# 5. Start P Relay (Cloudflare Gateway Sync)
$PYTHON "/Users/emmanuelhaddad/pushing-platform/PushingP Vault/Core/Relay/p_relay.py" > $DIR/p_relay.out.log 2>&1 &
echo "✅ P Relay Online (Gateway Polling Active)"
