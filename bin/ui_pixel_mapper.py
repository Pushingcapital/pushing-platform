import os
import subprocess
import time
import json

MAP_DIR = "/Users/emmanuelhaddad/pushing-platform/ui-maps"
os.makedirs(MAP_DIR, exist_ok=True)

def capture_and_map(screen_name):
    timestamp = int(time.time())
    screenshot_path = os.path.join(MAP_DIR, f"{screen_name}_{timestamp}.png")
    
    print(f"📸 Mapping Screen: {screen_name}...")
    
    # Take screenshot
    subprocess.run(["screencapture", "-x", screenshot_path])
    
    # Get dimensions via sips
    try:
        res = subprocess.run(["sips", "-g", "pixelWidth", "-g", "pixelHeight", screenshot_path], capture_output=True, text=True)
        # Output format: pixelWidth: 100\n pixelHeight: 200
        lines = res.stdout.split('\n')
        width = lines[1].split(': ')[1]
        height = lines[2].split(': ')[1]
        resolution = f"{width}x{height}"
    except:
        resolution = "unknown"
    
    pixel_map = {
        "screen_name": screen_name,
        "resolution": resolution,
        "timestamp": timestamp,
        "path": screenshot_path,
        "elements": [
            {"id": "closing_button", "pixel": "100,200", "action": "CLOSE_DEAL"},
            {"id": "stip_input", "pixel": "450,800", "action": "FILL_STIP"}
        ]
    }
    
    map_json_path = screenshot_path.replace(".png", ".json")
    with open(map_json_path, "w") as f:
        json.dump(pixel_map, f, indent=2)
    
    print(f"✅ Pixel Map Saved: {map_json_path}")
    return pixel_map

if __name__ == "__main__":
    capture_and_map("CEO_TERMINAL_FOCUS")
