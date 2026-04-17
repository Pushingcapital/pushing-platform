import subprocess
import json
import uuid
import sys

def dispatch_study(lane, topic, workers):
    study_id = f"STUDY-{lane}-{uuid.uuid4().hex[:4].upper()}"
    print(f"派遣中 (Dispatching) {lane}: {topic}...")
    
    # Log to D1 agent_tasks
    sql = f"""
    INSERT INTO agent_tasks (id, agent_id, status, action, source, created_at) 
    VALUES ('{study_id}', '{workers}', 'dispatched', 'Study Request: {topic}', 'parallel-study-lane', CURRENT_TIMESTAMP);
    """
    subprocess.run(["npx", "wrangler", "d1", "execute", "pushpush", "--remote", "--command", sql], capture_output=True)
    
    # Log to Orchestration Log
    orch_sql = f"""
    INSERT INTO cortex_orchestration_log (orchestration_id, command, intent, initiated_by_node, status)
    VALUES ('ORCH-{study_id}', 'DISPATCH_PARALLEL_STUDY', '{{"lane":"{lane}", "topic":"{topic}"}}', 'vertex-router', 'processing');
    """
    subprocess.run(["npx", "wrangler", "d1", "execute", "pushpush", "--remote", "--command", orch_sql], capture_output=True)

    print(f"✅ {lane} Active. Study {study_id} is running asynchronously.")

if __name__ == "__main__":
    studies = [
        ("LANE-A", "visionOS API Video Interception & Real-time Streaming", "runpod-orch-A"),
        ("LANE-B", "US Bank Auto-Closing API & Stipulation Parsing Logic", "runpod-orch-B"),
        ("LANE-C", "High-Latency Mesh Self-Healing & Tunnel Hardening", "runpod-orch-C"),
        ("LANE-D", "Autonomous .shortcut Plist Generation & Signing Exploits", "runpod-orch-D")
    ]
    
    for lane, topic, workers in studies:
        dispatch_study(lane, topic, workers)
    
    print("\n--- ALL 4 PARALLEL LANES DISPATCHED ---")
    print("Vertex Router now free for other tasks. Waiting for Callback alerts.")
