import os
from google import genai
from google.genai import types

def get_env_vars():
    secrets_path = "/Users/emmanuelhaddad/.config/pushingcapital/secrets.env"
    env_vars = {}
    if os.path.exists(secrets_path):
        with open(secrets_path, "r") as f:
            for line in f:
                if "=" in line:
                    key, value = line.strip().split("=", 1)
                    env_vars[key.replace("export ", "")] = value.strip("'\"")
    return env_vars

def main():
    env_vars = get_env_vars()
    api_key = env_vars.get("GEMINI_API_KEY")
    if not api_key:
        print("GEMINI_API_KEY not found")
        return

    client = genai.Client(api_key=api_key, http_options={'api_version': 'v1alpha'})
    
    # Context for Epoch 2 UI Generation
    ui_specs = {
        "sales_workspace": {
            "name": "Vehicle Sales Workspace (UI 17)",
            "path": "src/app/(customer)/platform/sales/page.tsx",
            "objective": "Professional surface for dealers. Needs inventory management, deal structuring (pencil), and relationship graph visualization."
        },
        "transport": {
            "name": "PushingTransport (UI 15)",
            "path": "src/app/(customer)/platform/transport/page.tsx",
            "objective": "Logistics and carrier movement pipeline. Needs shipment tracking, BOL upload, and carrier assignments."
        }
    }

    print("📈 THE ARCHITECT IS EXPANDING PROFESSIONAL SURFACES...")

    for key, spec in ui_specs.items():
        print(f"\n--- Generating {spec['name']} ---")
        
        prompt = f"""
        You are THE ARCHITECT (Gemini 2.5 Pro). Design a React Next.js Page for the Pushing Capital Platform.
        
        APPLICATION: {spec['name']}
        OBJECTIVE: {spec['objective']}
        AESTHETIC: High-end, "Vantablack" dark mode, minimal, monospace accents, cyan-950/15 blurs, teal (#00FFAA) highlights.
        
        CRITICAL: 
        1. The very first line of your output MUST be "use client";
        2. Use "any" for complex state types and component props to ensure the build PASSES immediately. 
        3. Avoid strict object key checking in generic components (e.g., use string instead of keyof T).
        4. Use Tailwind CSS and Lucide React icons.
        5. Do not include any other text, comments, or backticks like ```tsx.
        
        COMPONENTS TO INCLUDE:
        - Layout consistent with pushingSecurity.
        - High-end Data Tables and Deal structuring forms.
        
        Output only the raw TypeScript code.
        """

        try:
            response = client.models.generate_content(
                model="gemini-2.5-pro",
                contents=[prompt]
            )
            
            full_path = os.path.join("/Users/emmanuelhaddad/pushing-platform/projects/pushingsecurity-control/apps/pushing-capital-web", spec['path'])
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            
            with open(full_path, "w") as f:
                f.write(response.text.strip().replace("```tsx", "").replace("```", ""))
            
            print(f"✅ Generated: {spec['path']}")
            
        except Exception as e:
            print(f"Error generating {key} UI: {e}")

if __name__ == "__main__":
    main()
