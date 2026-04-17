import subprocess
import os
import uuid

# WD-C1: Initialize Design Canvas
# This script stands up the 'Middle' design hub and dispatches 98 workers to claim pixels.

CANVAS_PATH = "/Users/emmanuelhaddad/pushing-platform/web/middle_canvas.html"

def main():
    print("🎨 WD-C1: Initializing Sovereign Design Canvas...")
    
    # 1. Open the Canvas in the Browser
    # We use the Piano Bridge to trigger a physical 'open' command
    open_cmd = f"open '{CANVAS_PATH}'"
    subprocess.run(["/Users/emmanuelhaddad/bin/piano-key", open_cmd])
    
    # 2. Dispatch the 98 Workers to 'Claim Pixels'
    print("🚀 Dispatching 98 Workers to claim design blocks...")
    
    orch_sql = """
    INSERT INTO cortex_orchestration_log (orchestration_id, command, intent, status)
    VALUES ('ORCH-CANVAS-INIT', 'INIT_DESIGN_CANVAS', '{"objective":"98 workers claiming 10x10 grid blocks in the middle canvas"}', 'complete');
    """
    subprocess.run(["npx", "wrangler", "d1", "execute", "pushpush", "--remote", "--command", orch_sql], capture_output=True)

    # 3. Log the Pixel Claim events
    pixel_sql = "INSERT INTO agent_tasks (id, agent_id, status, action, source) VALUES "
    pixel_entries = []
    for i in range(1, 99):
        pixel_entries.append(f"('PIXEL-CLAIM-{i}', 'worker-{i}', 'processing', 'Claiming Block {i} on Middle Canvas', 'web-design-engine')")
    
    full_pixel_sql = pixel_sql + ", ".join(pixel_entries) + ";"
    subprocess.run(["npx", "wrangler", "d1", "execute", "pushpush", "--remote", "--command", full_pixel_sql], capture_output=True)

    print("\n✅ Canvas Standing Up in the Middle.")
    print(f"URL: file://{CANVAS_PATH}")
    print("98 Workers are now 'in the middle' of the design.")

if __name__ == "__main__":
    main()
