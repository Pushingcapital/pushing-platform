import time
import json
import os
import subprocess

# [P-ARCHITECT-01] The Agent Path Coordinator & Inbox Watchdog 
# This runs as a daemon process natively tracking the Swarm routing mesh for inbound dispatch tickets.

INBOX_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".gemini_inbox.json")
POLL_INTERVAL_SEC = 2

def execute_apple_script(message, title="P_CORE Intercept"):
    """Physical hardware alert utilizing osascript."""
    escaped_msg = message.replace('"', '\\"')
    script = f'display notification "{escaped_msg}" with title "{title}"'
    subprocess.run(["osascript", "-e", script])

def scan_inbox():
    if not os.path.exists(INBOX_PATH):
        return

    try:
        with open(INBOX_PATH, 'r') as f:
            data = json.load(f)

        status = data.get("status")
        ticket_id = data.get("ticket_id")
        directive = data.get("directive", "No payload provided.")

        if status == "UNREAD":
            print(f"[{time.strftime('%H:%M:%S')}] [P_CORE] 🚨 Incoming unread intent intercepted for local operative: {ticket_id}")
            
            # Formally acknowledge the ticket by marking it READ in the file system logic
            data["status"] = "READ"
            data["read_at"] = time.strftime('%Y-%m-%dT%H:%M:%SZ')
            
            with open(INBOX_PATH, 'w') as f:
                json.dump(data, f, indent=2)

            print(f"[{time.strftime('%H:%M:%S')}] [P_CORE] ✔ Ticket {ticket_id} consumed. Triggering local systems...")
            
            # Physically intercept and alert the local domain
            execute_apple_script(
                f"Consumed unread ticket {ticket_id}. Directive: {directive}",
                title="P_CORE Biological Link"
            )

    except json.JSONDecodeError:
        pass
    except Exception as e:
        print(f"[{time.strftime('%H:%M:%S')}] [P_CORE_ERROR] Fault in inbox parser: {e}")

if __name__ == "__main__":
    print(f"[{time.strftime('%H:%M:%S')}] [P_CORE] Agent Path Coordinator standing by. Monitoring {INBOX_PATH} for inbound routing tickets.")
    try:
        while True:
            scan_inbox()
            time.sleep(POLL_INTERVAL_SEC)
    except KeyboardInterrupt:
        print(f"\n[{time.strftime('%H:%M:%S')}] [P_CORE] Terminating path coordinator.")
