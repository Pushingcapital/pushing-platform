#!/usr/bin/env python3
# ==============================================================================
# Sovereign Voice Interface - Live Recorder (DJI Mic)
# ==============================================================================
# Records 5 seconds of audio from the default input device (DJI Mic)
# and sends it to the Voice Orchestrator pipeline.
# ==============================================================================

import os
import sys
import wave
import struct
import datetime
import subprocess

# macOS specific recording using built-in sox/rec or coreaudio
# We use 'rec' if sox is installed, otherwise fallback to 'osascript' or 'ffmpeg'
# The most reliable native way without extra libraries is using the 'afplay'/'afrecord' equivalents
# Since macOS doesn't have a built-in CLI recorder, we will use a quick script with 'ffmpeg' if available.

def record_audio(duration=5, output_file="/tmp/sovereign_command.wav"):
    print(f"🎙️  Listening to DJI Mic for {duration} seconds...")
    
    # Try ffmpeg first (common on dev machines)
    try:
        # -f avfoundation -i ":0" grabs default mic on macOS
        subprocess.run([
            "ffmpeg", "-y", "-f", "avfoundation", "-i", ":0", 
            "-t", str(duration), output_file
        ], capture_output=True, check=True)
        print(f"✅ Audio captured: {output_file}")
        return True
    except FileNotFoundError:
        print("❌ 'ffmpeg' not installed. Please install it with 'brew install ffmpeg'.")
        return False
    except subprocess.CalledProcessError as e:
        print(f"❌ Recording failed: {e.stderr.decode()}")
        return False

if __name__ == "__main__":
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"/tmp/sovereign_command_{timestamp}.wav"
    
    # You can pass duration as an argument
    duration = int(sys.argv[1]) if len(sys.argv) > 1 else 5
    
    if record_audio(duration, filename):
        print("Transmitting to Voice Orchestrator...")
        # Here we would trigger the Gemini API or the D1 ingestion script.
        # For now, we simulate the drop into the orchestration queue.
        
        # We can reuse the ingest_to_bronze tool or similar to log the raw audio path
        print(f"Command staged at {filename}. (Integration to D1 pending transcription module).")
        
