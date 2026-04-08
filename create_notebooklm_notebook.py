#!/usr/bin/env python3
import argparse
import json
import os
import sys

try:
    import google.auth
    from google.auth.exceptions import DefaultCredentialsError
    from google.auth.transport.requests import Request
except ModuleNotFoundError:
    google = None
    class DefaultCredentialsError(Exception):
        pass
    Request = None

import requests


DEFAULT_TITLE = "Data Engineering Structure and Databases for pushing capital"


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Create a NotebookLM Enterprise notebook via the current Discovery Engine API."
    )
    parser.add_argument(
        "--project-number",
        default=os.environ.get("GOOGLE_CLOUD_PROJECT_NUMBER"),
        help="Google Cloud project number. Can also be set with GOOGLE_CLOUD_PROJECT_NUMBER.",
    )
    parser.add_argument(
        "--location",
        default=os.environ.get("NOTEBOOKLM_LOCATION", "global"),
        choices=("global", "us", "eu"),
        help="NotebookLM location. Defaults to NOTEBOOKLM_LOCATION or global.",
    )
    parser.add_argument(
        "--title",
        default=os.environ.get("NOTEBOOKLM_TITLE", DEFAULT_TITLE),
        help="Notebook title. Defaults to NOTEBOOKLM_TITLE or the Pushing Capital title.",
    )
    return parser


def get_access_token() -> str:
    if google is None or Request is None:
        raise ModuleNotFoundError(
            "Missing dependency: google-auth. Install it with `pip install google-auth requests`."
        )

    credentials, _ = google.auth.default(
        scopes=[
            "https://www.googleapis.com/auth/cloud-platform",
            "https://www.googleapis.com/auth/discoveryengine.readwrite",
        ]
    )
    credentials.refresh(Request())
    return credentials.token


def create_notebook(project_number: str, location: str, title: str) -> dict:
    endpoint = (
        f"https://{location}-discoveryengine.googleapis.com/"
        f"v1alpha/projects/{project_number}/locations/{location}/notebooks"
    )
    headers = {
        "Authorization": f"Bearer {get_access_token()}",
        "Content-Type": "application/json",
    }
    payload = {"title": title}

    response = requests.post(endpoint, headers=headers, data=json.dumps(payload), timeout=60)
    response.raise_for_status()
    return response.json()


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    if not args.project_number:
        parser.error(
            "--project-number is required. Set it explicitly or export GOOGLE_CLOUD_PROJECT_NUMBER."
        )

    try:
        notebook = create_notebook(args.project_number, args.location, args.title)
    except DefaultCredentialsError as exc:
        print("Authentication failed: no Application Default Credentials were found.", file=sys.stderr)
        print(
            "Use either `gcloud auth application-default login` or set "
            "`GOOGLE_APPLICATION_CREDENTIALS` to a service-account JSON key.",
            file=sys.stderr,
        )
        print(str(exc), file=sys.stderr)
        return 2
    except ModuleNotFoundError as exc:
        print(str(exc), file=sys.stderr)
        return 2
    except requests.HTTPError as exc:
        print("Notebook creation failed.", file=sys.stderr)
        print(f"HTTP {exc.response.status_code}", file=sys.stderr)
        print(exc.response.text, file=sys.stderr)
        return 1
    except Exception as exc:
        print(f"Unexpected error: {exc}", file=sys.stderr)
        return 1

    print("Notebook created.")
    print(f"Title: {notebook.get('title', '')}")
    print(f"Notebook ID: {notebook.get('notebookId', '')}")
    print(f"Resource name: {notebook.get('name', '')}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
