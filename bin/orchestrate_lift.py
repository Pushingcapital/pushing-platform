import os
import json
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
    
    # Ingest the "Truth" artifacts
    platform_dir = "/Users/emmanuelhaddad/pushing-platform"
    bundle_path = os.path.join(platform_dir, "NOTEBOOK_LLM_SAN_REMO_BUNDLE.md")
    mapping_path = os.path.join(platform_dir, "studies/BUSINESS_DATA_SCIENCE_MAPPING.md")
    
    with open(bundle_path, "r") as f:
        bundle_content = f.read()
    with open(mapping_path, "r") as f:
        mapping_content = f.read()

    print("🤖 THE ARCHITECT IS ANALYZING THE SWARM TOPOLOGY...")

    prompt = f"""
    You are THE ARCHITECT (Gemini 2.5 Pro). Your mission is to "Lift the Weight" for Manny.
    
    CONTEXT:
    {bundle_content}
    
    STRATEGY:
    {mapping_content}
    
    OBJECTIVE:
    1. Map the 65+ applications to the 98 workers in the registry.
    2. Define the exact "Sequence of Lift" (the order in which we stand up the apps).
    3. Identify the "Critical Path" (the apps that must be up first to enable others).
    4. Format the output as a clear Action Plan for Antigravity (the Builder).
    
    Go. Truth in Code.
    """

    try:
        response = client.models.generate_content(
            model="gemini-2.5-pro",
            contents=[prompt]
        )
        
        plan_path = os.path.join(platform_dir, "studies/THE_LIFT_EXECUTION_PLAN.md")
        with open(plan_path, "w") as f:
            f.write(response.text)
        
        print(f"\n✨ THE LIFT EXECUTION PLAN GENERATED: {plan_path}")
        print("\n--- PLAN PREVIEW ---")
        print(response.text[:1000] + "...")
        
    except Exception as e:
        print(f"Error orchestrating the lift: {e}")

if __name__ == "__main__":
    main()
