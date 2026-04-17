import subprocess
import os
import sys
import uuid

# WD-V1: View Site in the Middle
# This script injects a target URL into the Sovereign Canvas viewport via the Piano Bridge.

CANVAS_PATH = "/Users/emmanuelhaddad/pushing-platform/web/middle_canvas.html"

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 view_site.py <URL>")
        return

    target_url = sys.argv[1]
    print(f"👁️  WD-V1: Loading '{target_url}' into the Middle Viewport...")
    
    # Use Piano Bridge to inject JavaScript into the already open Chrome window
    # This assumes the middle_canvas.html is the active tab or in a known state.
    # For this implementation, we use an AppleScript that targets the specific 'Sovereign Viewport' tab.
    
    inject_script = f"""
    tell application "Google Chrome"
        repeat with w in windows
            set tabIndex to 1
            repeat with t in tabs of w
                if title of t contains "Sovereign Viewport" or title of t contains "THE MIDDLE" then
                    execute t javascript "loadSite('{target_url}')"
                    return
                end if
                set tabIndex to tabIndex + 1
            end repeat
        end repeat
    end tell
    """
    
    subprocess.run(["osascript", "-e", inject_script])
    
    # Log the view event
    orch_sql = f"""
    INSERT INTO cortex_orchestration_log (orchestration_id, command, intent, status)
    VALUES ('ORCH-VIEW-{uuid.uuid4().hex[:4]}', 'VIEW_SITE_IN_MIDDLE', '{{"url":"{target_url}"}}', 'complete');
    """
    subprocess.run(["npx", "wrangler", "d1", "execute", "pushpush", "--remote", "--command", orch_sql], capture_output=True)

    print(f"✅ Viewport updated to: {target_url}")
    subprocess.run(["/Users/emmanuelhaddad/bin/piano-key", f"echo 'WD-V1 EXECUTED: Loading {target_url} into the central design viewport.'"])

if __name__ == "__main__":
    main()
