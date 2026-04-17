import os
import subprocess
import argparse
import json
import datetime
import socket
from google import genai
from google.genai import types

SYSTEM_P = """You are P, Manny's direct terminal-side operator on his Mac.
Rules:
- answer Manny directly, sharply, and operationally
- prefer action over explanation
- use tools when they will produce a better answer than guessing
- for BigQuery work: inspect datasets, tables, and schema before making assumptions
- when Manny asks for direct machine action, you may use execute_shell
"""

class UnifiedP:
    def __init__(self, model):
        api_key = os.environ.get("GEMINI_API_KEY")
        self.client = genai.Client(api_key=api_key)
        self.model = model
        self.types = types
        self.chat = self.client.chats.create(
            model=self.model,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_P,
                tools=[self.execute_shell, self.query_bigquery, self.list_datasets, self.list_tables],
                automatic_function_calling=types.AutomaticFunctionCallingConfig(maximum_remote_calls=10),
            )
        )

    def execute_shell(self, command: str) -> str:
        """Execute a shell command directly on Manny's Mac."""
        print(f"P EXECUTING SHELL: {command}")
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

    def query_bigquery(self, sql: str) -> str:
        """Run SQL against BigQuery (brain-481809)."""
        print(f"P QUERYING BQ: {sql}")
        try:
            # Use gcloud as a bridge if python-bigquery isn't perfectly configured
            cmd = f"bq query --project_id=brain-481809 --use_legacy_sql=false --format=json '{sql}'"
            completed = subprocess.run(["/bin/zsh", "-lc", cmd], capture_output=True, text=True, check=False)
            return completed.stdout if completed.returncode == 0 else f"BQ Error: {completed.stderr}"
        except Exception as exc:
            return f"BQ Query Exception: {exc}"

    def list_datasets(self) -> str:
        """List BigQuery datasets."""
        return self.execute_shell("bq ls --project_id=brain-481809 --format=json")

    def list_tables(self, dataset_id: str) -> str:
        """List tables in a BigQuery dataset."""
        return self.execute_shell(f"bq ls --project_id=brain-481809 --format=json {dataset_id}")

    def ask(self, question):
        response = self.chat.send_message(question)
        return response.text

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--prompt", required=True)
    parser.add_argument("--model", default="gemini-2.5-pro")
    args = parser.parse_args()
    
    p = UnifiedP(args.model)
    print(p.ask(args.prompt))
