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
    
    # Context for UI Generation
    ui_specs = {
        "automotive": {
            "name": "Automotive Intake & UI (UI 8)",
            "path": "src/app/(customer)/platform/automotive/page.tsx",
            "objective": "Activate the entire Automotive service line. Needs VIN lookup, condition report upload, and valuation display."
        },
        "finance": {
            "name": "Finance Intake & Workflow UI (UI 7)",
            "path": "src/app/(customer)/platform/finance/page.tsx",
            "objective": "Activate Credit Strategy and Lender Match services. Needs soft pull consent, income verification, and goal setting."
        }
    }

    print("🎨 THE ARCHITECT IS DESIGNING EPOCH 1 SURFACES...")

    for key, spec in ui_specs.items():
        print(f"\n--- Generating {spec['name']} ---")
        
        prompt = f"""
        You are THE ARCHITECT (Gemini 2.5 Pro). Design a React Next.js Page for the Pushing Capital Platform.
        
        APPLICATION: {spec['name']}
        OBJECTIVE: {spec['objective']}
        AESTHETIC: High-end, "Vantablack" dark mode, minimal, monospace accents, cyan-950/15 blurs, teal (#00FFAA) highlights.
        
        CRITICAL: 
        1. The very first line of your output MUST be "use client";
        2. Use "as any" where necessary to ensure NO TYPE ERRORS.
        3. Ensure all components use explicit types (e.g., const Button = ({{ children }}: {{ children: React.ReactNode }}) => ...).
        4. Use Tailwind CSS and Lucide React icons.
        5. Do not include any other text, comments, or backticks like ```tsx.
        
        COMPONENTS TO INCLUDE:
        - Layout consistent with pushingSecurity.
        - Framer Motion animations for step transitions.
        - Integration placeholders for /api/onboarding and specialized domain APIs.
        
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
