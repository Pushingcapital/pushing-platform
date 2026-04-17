#!/usr/bin/env python3
# ==============================================================================
# 🎙️ ONE MIC - Sovereign Continuous Listening Daemon (v2.0 - With Cues)
# ==============================================================================

import os
import time
import base64
import subprocess
import requests
import json
from datetime import datetime
from pathlib import Path

GEMINI_API_KEY = "AIzaSyCJs41AW7xpgTuOj3k7cUt2UMkQl1dZUhs"
URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"

NOTEBOOK_INGEST_DIR = Path("/Users/emmanuelhaddad/notebooklm_ingest")

PROMPT = """You are ONE MIC, the sovereign voice interface for the Pushing Capital Empire.
Your job is to listen to the user (Manny). 
Analyze his speech and assign an ACTION category.

CATEGORIES (CUES):
1. 'INGEST_NOTEBOOK': If Manny dictates a thought, idea, or note and asks to "remember this", "save this to the notebook", or "ingest this".
2. 'CREATE_PRESENTATION': If Manny asks to "create a presentation", "make a slide deck", or "generate a PDF" about a specific topic.
3. 'COMMAND': For general system commands like deploying, auditing, waking up agents, checking status, etc.

Output a valid JSON object with the following keys:
- intent: A short summary of the command or thought.
- text: The raw transcribed text of what Manny said (or the specific topic for the presentation).
- action: One of [INGEST_NOTEBOOK, CREATE_PRESENTATION, COMMAND].

If the audio is just silence, breathing, background noise, or irrelevant conversation NOT directed at the system, output EXACTLY the word: SILENCE"""

def record_chunk(duration=6, filepath="/tmp/onemic_chunk.wav"):
    subprocess.run(["ffmpeg", "-y", "-f", "avfoundation", "-i", ":0", "-t", str(duration), filepath], 
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return filepath

def analyze_audio(filepath):
    with open(filepath, "rb") as f:
        audio_data = f.read()
        
    b64_audio = base64.b64encode(audio_data).decode('utf-8')
    
    payload = {
        "contents": [{
            "parts": [
                {"text": PROMPT},
                {"inline_data": {"mime_type": "audio/wav", "data": b64_audio}}
            ]
        }],
        "generationConfig": {"temperature": 0.1}
    }
    
    try:
        response = requests.post(URL, json=payload, timeout=15)
        if response.status_code == 200:
            data = response.json()
            try:
                text = data['candidates'][0]['content']['parts'][0]['text'].strip()
                return text
            except (KeyError, IndexError):
                return "SILENCE"
        else:
            return "SILENCE"
    except Exception as e:
        return "SILENCE"

def handle_ingest_notebook(text):
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filepath = NOTEBOOK_INGEST_DIR / f"onemic_thought_{timestamp}.txt"
    with open(filepath, "w") as f:
        f.write(text)
    print(f"✅ Ingested thought into NotebookLM: {filepath}")
    subprocess.run(["/Users/emmanuelhaddad/pushing-platform/bin/agent_tools/speak.sh", "Ingested to your Notebook."], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

def handle_create_presentation(topic):
    print(f"🎬 Spawning Presentation Generator for: {topic}")
    # Run the generator script in the background
    subprocess.Popen(["python3", "/Users/emmanuelhaddad/pushing-platform/bin/agent_tools/create_presentation.py", topic])

def log_to_d1(intent, command):
    timestamp = datetime.utcnow().isoformat() + "Z"
    escaped_command = command.replace("'", "''")
    escaped_intent = intent.replace("'", "''")
    
    cmd = [
        "npx", "wrangler", "d1", "execute", "pushpush", "--remote",
        "--command", f"INSERT INTO orchestration_log (contact_id, email, command, intent, result, timestamp) VALUES ('ONE_MIC', 'voice@pushingcap.com', '{escaped_command}', '{escaped_intent}', 'PENDING', '{timestamp}');"
    ]
    subprocess.run(cmd, capture_output=True)
    print(f"✅ Command injected into D1: {intent}")
    subprocess.run(["/Users/emmanuelhaddad/pushing-platform/bin/agent_tools/speak.sh", "Command routed."], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

print("🎙️ ONE MIC: Continuous Listening Daemon Started (v2.0).")
print("Cues Enabled: INGEST_NOTEBOOK, CREATE_PRESENTATION, COMMAND.")

while True:
    filepath = record_chunk(duration=7)
    result = analyze_audio(filepath)
    
    if "SILENCE" not in result.upper():
        try:
            clean_json = result.replace("```json", "").replace("```", "").strip()
            parsed = json.loads(clean_json)
            action = parsed.get("action", "COMMAND")
            text = parsed.get("text", "")
            intent = parsed.get("intent", "")
            
            print(f"\n[DETECTED CUE: {action}] {intent}")
            
            if action == "INGEST_NOTEBOOK":
                handle_ingest_notebook(text)
            elif action == "CREATE_PRESENTATION":
                handle_create_presentation(text)
            else:
                log_to_d1(intent, text)
                
        except json.JSONDecodeError:
            pass
    
    time.sleep(0.5)
