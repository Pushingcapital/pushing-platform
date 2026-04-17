#!/usr/bin/env python3
import sys
import os
import requests
import uuid

# Load OpenAI key from the environment
API_KEY = os.environ.get("OPENAI_API_KEY", "")

def check_env_files():
    files = [
        "/Users/emmanuelhaddad/pushing-platform/.config/pushingcapital/secrets.env",
        "/Users/emmanuelhaddad/.env"
    ]
    for f in files:
        if os.path.exists(f):
            with open(f, 'r') as file:
                for line in file:
                    if line.startswith("OPENAI_API_KEY="):
                        return line.split("=")[1].strip()
    return ""

if not API_KEY:
    API_KEY = check_env_files()

def speak(text):
    if not API_KEY:
        print("No OpenAI API key found. Falling back to native.")
        os.system(f'say -v "Alex" "{text}"')
        return

    url = "https://api.openai.com/v1/audio/speech"
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": "tts-1",
        "input": text,
        "voice": "shimmer" # Shimmer is very clear and expressive, excellent presentation voice
    }
    
    response = requests.post(url, json=data, headers=headers)
    
    if response.status_code == 200:
        filename = f"/tmp/sovereign_voice_{uuid.uuid4().hex}.mp3"
        with open(filename, "wb") as f:
            f.write(response.content)
        
        # Play the audio natively using macOS 'afplay'
        os.system(f"afplay {filename}")
        os.remove(filename)
    else:
        print(f"Error from OpenAI: {response.text}")
        os.system(f'say -v "Alex" "{text}"')

if __name__ == "__main__":
    if len(sys.argv) > 1:
        speak(sys.argv[1])
    else:
        print("Usage: python3 speak.py 'text to speak'")
