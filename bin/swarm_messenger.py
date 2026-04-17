import os
import json
import subprocess
import urllib.request
import urllib.parse
import time
import argparse
import base64
import tempfile
from pathlib import Path

# --- Configuration ---
GATEWAY_BASE = "https://pushing-capital-voice-gateway.manny-861.workers.dev"
GATEWAY_TOKEN = "pc_voice_manny_2026"
CONTEXT_V3_PATH = Path("pushing-platform/projects/pc-ops-hub/workers/pushingcap-orchestrator/src/context-v3.js")
SECRETS_PATH = Path("/Users/emmanuelhaddad/.config/pushingcapital/secrets.env")

# --- Context Loader ---
def load_context_v3():
    """Loads the unified memory context from the orchestrator source."""
    if not CONTEXT_V3_PATH.exists():
        return "Warning: CONTEXT_V3 not found."
    try:
        content = CONTEXT_V3_PATH.read_text()
        # Extract the template literal content
        start = content.find("String.raw`") + 11
        end = content.rfind("`;")
        return content[start:end].strip()
    except Exception as e:
        return f"Error loading context: {e}"

# --- Memory Accessors ---

def run_d1_query(query: str):
    """Executes a query on the pushpush D1 database via wrangler CLI."""
    cmd = ["npx", "wrangler", "d1", "execute", "pushpush", "--remote", "--command", query]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        return result.stdout
    except subprocess.CalledProcessError as e:
        return f"Error executing D1 query: {e.stderr or e.stdout}"

def query_bigquery(sql: str):
    """Executes a query on the brain-481809 BigQuery warehouse via the bq CLI."""
    cmd = ["bq", "query", "--use_legacy_sql=false", "--format=prettyjson", sql]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        return result.stdout
    except subprocess.CalledProcessError as e:
        return f"Error executing BigQuery query: {e.stderr or e.stdout}"

# --- Voice Gateway Messenger ---

def ask_swarm_async(question: str, context: str = ""):
    """Sends an asynchronous message to the P Voice Gateway and returns a thought_id."""
    url = f"{GATEWAY_BASE}/ask_async"
    
    # Prepend context to the question if provided
    full_q = f"CONTEXT:\n{context[:4000]}\n---\nDIRECTIVE: {question}" if context else question
    
    payload = json.dumps({
        "q": full_q,
        "token": GATEWAY_TOKEN,
        "audio": False
    }).encode("utf-8")
    
    req = urllib.request.Request(
        url,
        data=payload,
        headers={"Content-Type": "application/json", "User-Agent": "Swarm-Messenger/1.0"},
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data.get("id")
    except Exception as e:
        print(f"Error reaching gateway (async): {e}")
        return None

def poll_swarm_response(thought_id: str):
    """Polls for a response from P for a given thought_id."""
    url = f"{GATEWAY_BASE}/poll_responses"
    payload = json.dumps({"token": GATEWAY_TOKEN, "thought_id": thought_id}).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=payload,
        headers={"Content-Type": "application/json", "User-Agent": "Swarm-Messenger/1.0"},
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            if data.get("ok") and data.get("response"):
                return data["response"].get("answer")
    except Exception:
        pass
    return None

def talk_to_swarm(question: str, context: str = "", timeout: int = 60):
    """Blocking call to send a message to the swarm and wait for an answer."""
    thought_id = ask_swarm_async(question, context)
    if not thought_id:
        return "(Failed to initialize communication with swarm)"
    
    print(f"  [Transmitting to Gateway (ID: {thought_id[:8]})] ", end="", flush=True)
    for _ in range(timeout):
        print(".", end="", flush=True)
        answer = poll_swarm_response(thought_id)
        if answer:
            print()
            return answer
        time.sleep(1)
    
    print()
    return "(Timed out waiting for swarm response)"

# --- Main CLI ---

def main():
    parser = argparse.ArgumentParser(description="Pushing Capital Swarm Messenger")
    parser.add_argument("--interactive", "-i", action="store_true", help="Start interactive mode")
    parser.add_argument("--d1", "-d", help="Run a D1 query")
    parser.add_argument("--bq", "-b", help="Run a BigQuery query")
    parser.add_argument("--context", "-c", action="store_true", help="Print loaded unified context")
    parser.add_argument("message", nargs="?", help="Message to send to the swarm")
    args = parser.parse_args()

    context = load_context_v3()

    if args.context:
        print(context)
        return

    if args.d1:
        print(run_d1_query(args.d1))
        return

    if args.bq:
        print(query_bigquery(args.bq))
        return

    if args.interactive:
        print("="*60)
        print("  SWARM MESSENGER v1.0 — Unified Orchestration Mode")
        print("  Context: Loaded (CONTEXT_V3)")
        print("  Type '/help' for commands, 'q' to quit.")
        print("="*60)
        while True:
            try:
                msg = input("MANNY > ").strip()
                if not msg or msg.lower() in ["exit", "quit", "q"]:
                    break
                
                if msg == "/help":
                    print("Commands: /d1 <query>, /bq <sql>, /context, /clear")
                    continue
                if msg == "/clear":
                    print("\033[H\033[J")
                    continue
                if msg == "/context":
                    print(context[:1000] + "...")
                    continue
                if msg.startswith("/d1 "):
                    print(run_d1_query(msg[4:]))
                    continue
                elif msg.startswith("/bq "):
                    print(query_bigquery(msg[4:]))
                    continue
                
                response = talk_to_swarm(msg, context=context)
                print(f"   P  > {response}\n")
            except KeyboardInterrupt:
                print("\nbye")
                break
    elif args.message:
        response = talk_to_swarm(args.message, context=context)
        print(f"P > {response}")
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
