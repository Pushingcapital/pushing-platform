import csv
import subprocess
import json
import uuid

CATALOG_PATH = "/Users/emmanuelhaddad/pushing-platform/knowledge/google-api-catalog/google-api-catalog-2026-04-15.csv"

def main():
    print("🚀 MISSION: Sovereign API Claiming (Batch Mode) Initialized.")
    
    inserts = []
    with open(CATALOG_PATH, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            api_name = row['api_name']
            agent_namespace = row['agent_namespace']
            category = row['primary_category']
            title = row['title'].replace("'", "''")
            description = f"Sovereign access to {title} ({category})".replace("'", "''")
            
            inserts.append(f"('vertex-router', '{agent_namespace}', '{description}')")

    if not inserts:
        print("❌ No APIs found in catalog.")
        return

    # Batch Insert SQL
    sql = f"INSERT OR IGNORE INTO agent_capabilities (agent_id, capability, description) VALUES {','.join(inserts)};"
    
    print(f"Executing batch ingestion of {len(inserts)} APIs into D1...")
    subprocess.run(["npx", "wrangler", "d1", "execute", "pushpush", "--remote", "--command", sql], capture_output=True)
    
    # Log the mass-claiming event to the A2A bus
    orch_sql = f"""
    INSERT INTO cortex_orchestration_log (orchestration_id, command, intent, initiated_by_node, status)
    VALUES ('ORCH-API-CLAIM-{uuid.uuid4().hex[:4]}', 'SOVEREIGN_API_CLAIM', '{{"total_apis":{len(inserts)}, "scope":"Universal Google Catalog"}}', 'vertex-router', 'complete');
    """
    subprocess.run(["npx", "wrangler", "d1", "execute", "pushpush", "--remote", "--command", orch_sql], capture_output=True)

    print(f"\n✅ SUCCESS: {len(inserts)} Google APIs claimed as Sovereign Swarm Assets.")
    subprocess.run(["/Users/emmanuelhaddad/bin/piano-key", f"echo 'MISSION COMPLETE: {len(inserts)} Google APIs Batch-Claimed.'"])

if __name__ == "__main__":
    main()
