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
    
    # Context for API Generation
    api_specs = {
        "automotive": {
            "name": "Automotive API",
            "path": "src/app/api/platform/automotive/route.ts",
            "objective": "Handle VIN lookups and automotive asset storage. Interface with pc_automotive_core database."
        },
        "finance": {
            "name": "Finance API",
            "path": "src/app/api/platform/finance/route.ts",
            "objective": "Handle financial profile updates and lender matching. Interface with pc_finance_core database."
        }
    }

    print("⚙️ THE ARCHITECT IS ENGINEERING EPOCH 1 APIs...")

    for key, spec in api_specs.items():
        print(f"\n--- Generating {spec['name']} ---")
        
        prompt = f"""
        You are THE ARCHITECT (Gemini 2.5 Pro). Design a Next.js API Route for the Pushing Capital Platform.
        
        API: {spec['name']}
        OBJECTIVE: {spec['objective']}
        
        REQUIREMENTS:
        - Use Next.js App Router (NextRequest, NextResponse).
        - Include placeholders for BigQuery or Postgres database interactions.
        - Add input validation.
        - Ensure consistent error handling.
        
        Output only the complete TypeScript code for the route.ts file.
        """

        try:
            response = client.models.generate_content(
                model="gemini-2.5-pro",
                contents=[prompt]
            )
            
            full_path = os.path.join("/Users/emmanuelhaddad/pushing-platform/projects/pushingsecurity-control/apps/pushing-capital-web", spec['path'])
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            
            with open(full_path, "w") as f:
                f.write(response.text.strip().replace("```typescript", "").replace("```ts", "").replace("```", ""))
            
            print(f"✅ Generated: {spec['path']}")
            
        except Exception as e:
            print(f"Error generating {key} API: {e}")

if __name__ == "__main__":
    main()
