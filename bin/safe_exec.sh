#!/bin/bash
# ==============================================================================
# Sovereign Safe-Exec (Vertex Layer)
# ==============================================================================
# This script ensures a command never blocks the Gemini CLI.
# It enforces a 30s timeout and redirects output to a rotating log.
# ==============================================================================

CMD="$@"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="/tmp/gemini_safe_exec_${TIMESTAMP}.log"

echo "Running with 30s timeout: $CMD"
timeout 30 bash -c "$CMD" > "$LOG_FILE" 2>&1

EXIT_CODE=$?

if [ $EXIT_CODE -eq 124 ]; then
    echo "[TIMEOUT] Command timed out after 30s. Partial results in $LOG_FILE"
    head -n 20 "$LOG_FILE"
    echo "..."
    tail -n 20 "$LOG_FILE"
else
    cat "$LOG_FILE"
fi

exit $EXIT_CODE
