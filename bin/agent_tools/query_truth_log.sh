#!/bin/bash
# ==============================================================================
# Agent Tool: query_truth_log
# Description: Queries the D1 database for the latest truth logs.
# Usage: ./query_truth_log <limit>
# ==============================================================================
LIMIT=${1:-10}
npx wrangler d1 execute pushpush --remote --command "SELECT timestamp, event_type, subject_name, event_data FROM truth_log ORDER BY created_at DESC LIMIT $LIMIT;"
