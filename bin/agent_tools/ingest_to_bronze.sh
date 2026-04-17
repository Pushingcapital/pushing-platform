#!/bin/bash
# ==============================================================================
# Agent Tool: ingest_to_bronze
# Description: Inserts a record into the bronze BigQuery table.
# Usage: ./ingest_to_bronze "<json_payload>"
# ==============================================================================
PAYLOAD=$1
if [ -z "$PAYLOAD" ]; then
  echo "Error: Payload required."
  exit 1
fi
echo "$PAYLOAD" > /tmp/bq_ingest.json
bq insert --project_id=brain-481809 brain-481809:bronze_registry.raw_ingest /tmp/bq_ingest.json
echo "Ingested payload to bronze_registry."
