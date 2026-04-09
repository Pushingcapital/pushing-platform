#!/usr/bin/env python3
import json
import sys
import urllib.request
import urllib.error
import base64
import tempfile
import os
import subprocess

GATEWAY = "https://pushing-capital-voice-gateway.manny-861.workers.dev/ask"
TOKEN = "pc_voice_manny_2026"

def ask_voice_gateway(question: str):
    print(f"Sending to P: '{question}'...")
    payload = json.dumps({
        "q": question, 
        "token": TOKEN, 
        "audio": True
    }).encode("utf-8")
    
    req = urllib.request.Request(
        GATEWAY, 
        data=payload, 
        headers={"Content-Type": "application/json"}, 
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req, timeout=45) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            answer = data.get("answer", "(no response)")
            print(f"\n[P]: {answer}\n")
            
            b64_audio = data.get("audio")
            if b64_audio:
                # Decode and play the MP3 audio response
                audio_bytes = base64.b64decode(b64_audio)
                with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as tmp_audio:
                    tmp_audio.write(audio_bytes)
                    tmp_audio_path = tmp_audio.name
                
                print("🔊 Playing P's voice response...")
                subprocess.run(["afplay", tmp_audio_path])
                os.remove(tmp_audio_path)
            else:
                print("No audio data returned from the gateway.")
                
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code}: {e.read().decode('utf-8')}")
    except Exception as e:
        print(f"Failed to reach P: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        # Accept text from command line arguments
        question = " ".join(sys.argv[1:])
        ask_voice_gateway(question)
    else:
        # Interactive mode
        print("Type your message to P (Voice output enabled). 'q' to exit.")
        while True:
            try:
                question = input("Manny > ").strip()
                if question.lower() == 'q':
                    break
                if question:
                    ask_voice_gateway(question)
            except (EOFError, KeyboardInterrupt):
                print()
                break
