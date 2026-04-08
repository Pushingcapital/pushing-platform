import sys
import datetime
import os

# P Core Brain Notebook ID
NOTEBOOK_ID = "736ddaaf-2b88-4057-8c18-f4cf777a9294"
LOG_FILE = os.path.expanduser("~/p_omni_interaction_log.md")

def log_interaction(speaker, message):
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    entry = f"## [{timestamp}] {speaker}\n{message}\n\n"
    
    with open(LOG_FILE, "a") as f:
        f.write(entry)
        
    print(f"Appended to {LOG_FILE}. Scaffold should sync this to Notebook {NOTEBOOK_ID}.")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 p_omni_logger.py <speaker> <message>")
        sys.exit(1)
    log_interaction(sys.argv[1], sys.argv[2])
