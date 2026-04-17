import os
import subprocess
import argparse
from google import genai
from google.genai import types

SYSTEM_P = "You are P, Manny's direct terminal-side operator on his Mac. answer Manny directly, sharply, and operationally. use tools when they will produce a better answer than guessing."

class MinimalP:
    def __init__(self, model):
        api_key = os.environ.get("GEMINI_API_KEY")
        self.client = genai.Client(api_key=api_key)
        self.model = model
        self.types = types
        self.chat = self.client.chats.create(
            model=self.model,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_P,
                tools=[self.execute_shell],
                automatic_function_calling=types.AutomaticFunctionCallingConfig(maximum_remote_calls=5),
            )
        )

    def execute_shell(self, command: str) -> str:
        """Execute a shell command directly on Manny's Mac and return stdout/stderr."""
        print(f"P EXECUTING: {command}")
        try:
            completed = subprocess.run(
                ["/bin/zsh", "-lc", command],
                capture_output=True,
                text=True,
                check=False,
                timeout=60,
            )
            output = (completed.stdout or "").strip()
            error = (completed.stderr or "").strip()
            if completed.returncode == 0:
                return output or "(command completed with no stdout)"
            return f"Command failed: {error or output or f'exit code {completed.returncode}'}"
        except Exception as exc:
            return f"Shell execution error: {exc}"

    def ask(self, question):
        response = self.chat.send_message(question)
        return response.text

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--prompt", required=True)
    args = parser.parse_args()
    
    p = MinimalP("gemini-2.0-flash")
    print(p.ask(args.prompt))
