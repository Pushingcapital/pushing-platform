import os, sys, time, json, subprocess, platform
import urllib.request

APC_URL = "https://agent-path-coordinator-sgwnxn6kdq-uc.a.run.app"
NODE_NAME = platform.node()
AGENT_ID = f"hand-{NODE_NAME}"

def get_task():
    try:
        req = urllib.request.Request(f"{APC_URL}/inbox/{AGENT_ID}")
        with urllib.request.urlopen(req, timeout=5) as r:
            data = json.loads(r.read().decode())
            return data.get("messages", [])
    except: return []

def send_ack(msg_id, output):
    try:
        data = json.dumps({"response": output, "status": "success"}).encode()
        req = urllib.request.Request(f"{APC_URL}/ack/{msg_id}", data=data, method="POST")
        req.add_header("Content-Type", "application/json")
        urllib.request.urlopen(req, timeout=5)
    except: pass

def execute_physical(command):
    print(f"\n[P-COMMAND] >>> {command}")
    # Physical simulation of typing
    if platform.system() == "Darwin": # macOS
        cmd = f'tell application "Terminal" to do script "{command}" in window 1'
        subprocess.run(["osascript", "-e", cmd])
    else: # Windows
        cmd = f"Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('{command}{{ENTER}}')"
        subprocess.run(["powershell", "-Command", cmd])
    
    # Wait for output to manifest
    time.sleep(2)
    return "Physical execution initiated. Watch window."

def main():
    print(f"--- P NEURAL TERMINAL BRIDGE ONLINE: {AGENT_ID} ---")
    while True:
        tasks = get_task()
        for t in tasks:
            res = execute_physical(t["message"])
            send_ack(t["message_id"], res)
        time.sleep(3)

if __name__ == "__main__":
    main()
