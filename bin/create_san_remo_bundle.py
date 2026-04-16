import os
import glob

# Source directories for registries and studies
PLATFORM_DIR = os.path.expanduser("~/pushing-platform")
DATA_DIR = os.path.join(PLATFORM_DIR, "projects/pc-data-platform-code/pushingcap-web-v2/src/data")
STUDIES_DIR = os.path.join(PLATFORM_DIR, "studies")
OUTPUT_FILE = os.path.join(PLATFORM_DIR, "NOTEBOOK_LLM_SAN_REMO_BUNDLE.md")

# Gather specific registries and studies as dictated by San Remo Dr
files_to_bundle = [
    os.path.join(STUDIES_DIR, "SAN_REMO_DR_ARCHITECTURE_STUDY.md"),
    os.path.join(DATA_DIR, "worker-parallel-registry.json"),
    os.path.join(DATA_DIR, "machine-topology-registry.json"),
    os.path.join(PLATFORM_DIR, "pc_database_registry_production.csv"),
    os.path.join(PLATFORM_DIR, "ui_surface_count_registry.csv"),
    os.path.join(PLATFORM_DIR, "pushing_capital_granular_product_service_registry_2026-04-03.csv"),
    os.path.join(PLATFORM_DIR, "SWARM_SHORTHAND_PROTOCOL.md")
]

with open(OUTPUT_FILE, "w") as outfile:
    outfile.write("# 🧠 PUSHING CAPITAL: NOTEBOOK LLM INGESTION BUNDLE (SAN REMO DR)\n\n")
    outfile.write("> **Compiled Context:** This bundle contains the core registries and the San Remo Dr Architecture Study. It serves to inform Notebook LLM of all database locations, worker assignments, topologies, and the 'Truth in Code' mandate for the 98-worker swarm.\n\n")
    outfile.write("---\n\n")
    
    for filepath in files_to_bundle:
        if os.path.exists(filepath):
            filename = os.path.basename(filepath)
            outfile.write(f"## SOURCE ARTIFACT: {filename}\n\n")
            
            if filename.endswith(".json"):
                outfile.write("```json\n")
            elif filename.endswith(".csv"):
                outfile.write("```csv\n")
            elif filename.endswith(".py"):
                outfile.write("```python\n")
            elif filename.endswith(".sql"):
                outfile.write("```sql\n")
                
            try:
                with open(filepath, "r") as infile:
                    outfile.write(infile.read())
                    outfile.write("\n")
            except Exception as e:
                outfile.write(f"[Error reading file: {e}]\n")
                
            if filename.endswith((".json", ".csv", ".py", ".sql")):
                outfile.write("```\n")
            outfile.write("\n---\n\n")

print(f"Successfully bundled artifacts into {OUTPUT_FILE}")
