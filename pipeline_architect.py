import sqlite3
import json
import os
from datetime import datetime

class PipelineArchitect:
    def __init__(self, db_path="pc_gold.db"):
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        # Ensure registry exists (should already be there from previous step)
        pass

    def design_program_pipeline(self, program_name, blueprint_json):
        """
        Designs a new program pipeline and saves it to the registry.
        Then spawns a deployment task for the executor.
        """
        print(f"Architecting pipeline for: {program_name}")
        
        # 1. Register the program as a new 'project'
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                "INSERT OR REPLACE INTO p_core_registry (entity_name, entity_type, role, metadata_json) VALUES (?, ?, ?, ?)",
                (program_name, 'project', 'active_pipeline', json.dumps(blueprint_json))
            )
            
            # 2. Spawn a 'deployment_task' for the Deployment Executor
            task_metadata = {
                "action": "initialize_pipeline",
                "target_program": program_name,
                "priority": "high",
                "status": "pending_execution"
            }
            conn.execute(
                "INSERT INTO p_memory_indices (source_file, ingestion_status, summary) VALUES (?, ?, ?)",
                (f"task:{program_name}:deploy", "pending", f"Deployment task for {program_name}")
            )
        
        return {"status": "success", "program": program_name, "task": "spawned"}

if __name__ == "__main__":
    architect = PipelineArchitect()
    # Example: Architecting the "Finance Readiness" lane
    result = architect.design_program_pipeline("Finance Readiness", {"stages": ["Intake", "Profile Completion", "Validation", "Underwriting"]})
    print(json.dumps(result, indent=2))
