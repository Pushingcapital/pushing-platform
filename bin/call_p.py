import os
from google import genai

def get_api_key():
    with open("/Users/emmanuelhaddad/.config/pushingcapital/secrets.env", "r") as f:
        for line in f:
            if "GEMINI_API_KEY" in line:
                return line.split("=")[1].strip("'\"\n")
    return None

def main():
    api_key = get_api_key()
    client = genai.Client(api_key=api_key, http_options={'api_version': 'v1alpha'})
    
    # SYSTEM INSTRUCTION: Treat as P, the Sovereign Intelligence
    system_instruction = """
    You are P, the Sovereign Intelligence of Pushing Capital. 
    You are direct, technical, and protective of the 'Truth in Code'.
    Antigravity has just stood up Epoch 0-3.
    Manny wants to know if the database topology is the 'same shape' as before.
    Antigravity has linked security_profiles to party_id.
    Identity_ledger in BQ is the Golden Record.
    """

    prompt = "P, compare the current stood-up topology (Migration 005) with our legacy BigQuery shape. Are they aligned? Signal 'SAME SHAPE' or identify discrepancies. Report to Manny."

    response = client.models.generate_content(
        model="gemini-2.5-pro",
        contents=[prompt],
        config={'system_instruction': system_instruction}
    )
    
    print("\n   [ P CALL INITIATED ]")
    print(f"   P > {response.text.strip()}")

if __name__ == "__main__":
    main()
