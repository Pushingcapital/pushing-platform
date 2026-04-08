import os
import json
from google import genai
from google.genai import types

# 1. Initialize the client
client = genai.Client() # It will automatically look for the GEMINI_API_KEY environment variable

# 2. Retrieve your Master Brain (Using your exact File URI)
brain_file = client.files.get(name="files/jzw8araj9dqz")

# 3. Define the strict State-Tracking Schema
state_tracking_schema = types.Schema(
    type=types.Type.OBJECT,
    properties={
        "guidance": types.Schema(
            type=types.Type.STRING,
            description="Step-by-step ETL/architecture instructions for the user."
        ),
        "updated_state": types.Schema(
            type=types.Type.STRING,
            description="Concise summary of the current pipeline status. Save as new state."
        )
    },
    required=["guidance", "updated_state"]
)

# 4. Initialize the Chat Session with the Master Brain attached
chat = client.chats.create(
    model="gemini-2.5-pro",
    config=types.GenerateContentConfig(
        temperature=0.2,
        response_mime_type="application/json",
        response_schema=state_tracking_schema,
        system_instruction=[
            "You are the Lead Data Architect for Pushing Capital. ",
            "Your entire business logic, DAG structure, and database schemas are in the attached Master Brain document.",
            "Always check the 'CURRENT STATE' before providing instructions. Give guidance strictly one step at a time."
        ]
    )
)

# 5. The Execution Function
def ask_architect(user_input, current_state):
    print("\n[SYSTEM] Consulting the Master Brain...")
    full_prompt = f"CURRENT STATE: {current_state}\n\nUSER INPUT: {user_input}"
    response = chat.send_message([brain_file, full_prompt])
    
    response_data = json.loads(response.text)
    print("\n========================================")
    print("         ARCHITECT GUIDANCE             ")
    print("========================================\n")
    print(response_data["guidance"])
    print("\n========================================")
    print(f"[SYSTEM] NEW STATE SAVED: {response_data['updated_state']}")
    
    return response_data["updated_state"]

# --- 6. Helper Functions for State ---
STATE_FILE = "architect_state.json"

def load_state():
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE, 'r') as f:
            return json.load(f).get("current_state", "State: Ready.")
    return "State: Master Brain uploaded. Ready to execute the pipeline."

def save_state(new_state):
    with open(STATE_FILE, 'w') as f:
        json.dump({"current_state": new_state}, f, indent=4)

# --- 7. The Interactive Chat Loop ---
if __name__ == "__main__":
    print("\n========================================")
    print("  PUSHING CAPITAL ARCHITECT ONLINE")
    print("  Type 'exit' or 'quit' to close.")
    print("========================================")
    
    while True:
        current_state = load_state()
        print(f"\n[CURRENT STATE]: {current_state}")
        
        question = input("\n[YOU]: ")
        if question.lower() in ['exit', 'quit']:
            print("\nShutting down Architect. State preserved. Goodbye.")
            break
            
        new_state = ask_architect(question, current_state)
        save_state(new_state)
