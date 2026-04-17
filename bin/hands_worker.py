#!/usr/bin/env python3
import os
import time
import subprocess
import json
from pathlib import Path
from datetime import datetime

VOICE_INBOX_PATH = Path(os.path.expanduser("~/Desktop/VOICE_INBOX.md"))
D1_DATABASE = "pushpush"

def execute_command(cmd_string: str):
    print(f"🛠️ HANDS ACTING: {cmd_string}")
    try:
        # Execute the command and capture output
        result = subprocess.run(
            cmd_string, 
            shell=True, 
            capture_output=True, 
            text=True, 
            timeout=30
        )
        output = result.stdout if result.returncode == 0 else result.stderr
        status = "completed" if result.returncode == 0 else "failed"
        return status, output
    except subprocess.TimeoutExpired:
        return "failed", "Error: Command timed out after 30 seconds."
    except Exception as e:
        return "failed", f"Error: {str(e)}"

def update_inbox_with_result(cmd_string: str, status: str, output: str):
    timestamp = datetime.now().strftime("%H:%M:%S")
    status_icon = "✅" if status == "completed" else "❌"
    
    # Format the result block
    result_block = f"\n> {status_icon} **RESULT ({timestamp})** for `{cmd_string}`:\n"
    result_block += f"```text\n{output.strip()[:1000]}\n```\n"
    
    with open(VOICE_INBOX_PATH, "a") as f:
        f.write(result_block)

def log_to_d1(cmd: str, status: str, output: str):
    # Sanitize for SQL
    safe_cmd = cmd.replace("'", "''")
    safe_output = output.replace("'", "''")
    
    sql = f"INSERT INTO local_tasks (cmd, status, output) VALUES ('{safe_cmd}', '{status}', '{safe_output}');"
    
    try:
        subprocess.run([
            "npx", "wrangler", "d1", "execute", D1_DATABASE, 
            "--remote", "--command", sql
        ], capture_output=True)
    except Exception as e:
        print(f"Failed to log to D1: {e}")

def main():
    print(f"🚀 Antigravity Hands Worker Started. Watching: {VOICE_INBOX_PATH}")
    
    # Track the last line we processed to avoid loops
    last_processed_line_idx = 0
    if VOICE_INBOX_PATH.exists():
        last_processed_line_idx = len(VOICE_INBOX_PATH.read_text().splitlines())

    while True:
        try:
            if VOICE_INBOX_PATH.exists():
                lines = VOICE_INBOX_PATH.read_text().splitlines()
                
                # Check for new lines
                if len(lines) > last_processed_line_idx:
                    for i in range(last_processed_line_idx, len(lines)):
                        line = lines[i].strip()
                        
                        # Look for "RUN:" or "> RUN:" cues
                        if "RUN:" in line and "RESULT" not in line:
                            # Extract the command (everything after RUN:)
                            cmd_part = line.split("RUN:", 1)[1].strip()
                            # Strip any backticks if the user wrapped the command
                            cmd_part = cmd_part.strip("`")
                            
                            if cmd_part:
                                status, output = execute_command(cmd_part)
                                update_inbox_with_result(cmd_part, status, output)
                                log_to_d1(cmd_part, status, output)
                                
                    last_processed_line_idx = len(lines)
            
        except Exception as e:
            print(f"Hands loop error: {e}")
            
        time.sleep(2)

if __name__ == "__main__":
    main()
