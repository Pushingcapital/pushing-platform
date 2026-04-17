#!/usr/bin/env python3
import sys
import os
import json
import urllib.request
from datetime import datetime

# Grab the Gemini API key
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "AIzaSyCJs41AW7xpgTuOj3k7cUt2UMkQl1dZUhs")

def create_presentation(topic):
    print(f"Generating presentation on: {topic}")
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key={GEMINI_API_KEY}"
    
    prompt = f"""You are an elite presentation designer. Manny has requested a presentation on the following topic: "{topic}".
    Create a highly structured, professional presentation in Markdown format. 
    Use the 'Brutalist/Sovereign' aesthetic in your formatting. 
    Include Slide Titles, Bullet Points, and Key Takeaways.
    Ensure it is executive-ready."""
    
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.4}
    }
    
    headers = {"Content-Type": "application/json"}
    req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers, method="POST")
    
    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            presentation_text = result['candidates'][0]['content']['parts'][0]['text']
            
            # Save the file
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filepath = f"/Users/emmanuelhaddad/Desktop/Sovereign_Presentation_{timestamp}.md"
            
            with open(filepath, "w") as f:
                f.write(presentation_text)
                
            print(f"Presentation saved to {filepath}")
            # Announce via Voice
            os.system(f'/Users/emmanuelhaddad/pushing-platform/bin/agent_tools/speak.sh "Manny, the presentation on {topic} has been generated and saved to your desktop."')
            
    except Exception as e:
        print(f"Failed to generate presentation: {e}")
        os.system(f'/Users/emmanuelhaddad/pushing-platform/bin/agent_tools/speak.sh "I encountered an error generating the presentation."')

if __name__ == "__main__":
    if len(sys.argv) > 1:
        create_presentation(sys.argv[1])
    else:
        print("Usage: python3 create_presentation.py 'topic'")
