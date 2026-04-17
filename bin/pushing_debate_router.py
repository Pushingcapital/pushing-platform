#!/usr/bin/env python3
import os
import time
import urllib.request
import json
from pathlib import Path

VOICE_INBOX_PATH = Path(os.path.expanduser("~/Desktop/VOICE_INBOX.md"))
GATEWAY_URL = "https://pushing-capital-voice-gateway.manny-861.workers.dev/ask"
TOKEN = "pc_voice_manny_2026"

def route_to_debate_studio(new_text: str):
    print(f"Routing to pushingdebatedude: {new_text[:50]}...")
    
    # 1. Route to Voice Gateway (Cloudflare)
    payload = {
        "q": f"[SYSTEM ROUTING] New dictation for pushingdebatedude in /pushing-debate-studio.y:\n{new_text}",
        "token": TOKEN,
        "max_input_tokens": 1024,
        "max_output_tokens": 256
    }
    
    req_gateway = urllib.request.Request(
        GATEWAY_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req_gateway, timeout=15) as response:
            res = json.loads(response.read().decode("utf-8"))
            print(f"-> Gateway response: {res.get('answer', 'No answer')[:50]}")
    except Exception as e:
        print(f"-> Failed to route to Gateway: {e}")

    # 2. Route to Local Next.js Debate Studio Endpoint
    local_payload = {
        "content": new_text,
        "source": "VOICE_INBOX_ROUTER"
    }
    
    req_local = urllib.request.Request(
        "http://localhost:3013/api/pushing-debate-studio.y",
        data=json.dumps(local_payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req_local, timeout=5) as response:
            res = json.loads(response.read().decode("utf-8"))
            if res.get('stitch'):
                 print(f"-> Local Stitch Confirmed: {res.get('message')}")
    except Exception as e:
        print(f"-> Failed to route to Local Debate Studio API: {e}")

def main():
    print(f"Starting Voice Route Worker. Monitoring: {VOICE_INBOX_PATH}")
    last_mtime = 0
    last_content = ""
    
    if VOICE_INBOX_PATH.exists():
        last_mtime = VOICE_INBOX_PATH.stat().st_mtime
        last_content = VOICE_INBOX_PATH.read_text(errors="ignore")

    while True:
        try:
            if VOICE_INBOX_PATH.exists():
                current_mtime = VOICE_INBOX_PATH.stat().st_mtime
                if current_mtime > last_mtime:
                    current_content = VOICE_INBOX_PATH.read_text(errors="ignore")
                    
                    # Diff the content to find new entries
                    if len(current_content) > len(last_content):
                        new_text = current_content[len(last_content):].strip()
                        if new_text:
                            route_to_debate_studio(new_text)
                    
                    last_content = current_content
                    last_mtime = current_mtime
            
        except Exception as e:
            print(f"Worker loop error: {e}")
            
        time.sleep(1)

if __name__ == "__main__":
    main()
