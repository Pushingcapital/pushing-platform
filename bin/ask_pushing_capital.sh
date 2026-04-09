#!/bin/zsh
# Quick test: Ask Pushing Capital voice gateway from terminal
# This simulates what the Shortcut will do

echo "🎤 Ask Pushing Capital — Terminal Test"
echo "Type your question (or pass as arg):"

QUESTION="${1:-}"
if [ -z "$QUESTION" ]; then
  read "QUESTION?> "
fi

RESPONSE=$(curl -s -X POST \
  "https://pushing-capital-voice-gateway.manny-861.workers.dev/ask" \
  -H "Content-Type: application/json" \
  -d "{\"q\":\"$QUESTION\",\"token\":\"pc_voice_manny_2026\"}")

ANSWER=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('answer','No response'))" 2>/dev/null)

echo ""
echo "🤖 P says: $ANSWER"

# Speak it on macOS
say "$ANSWER" 2>/dev/null
