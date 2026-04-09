#!/usr/bin/env python3

from __future__ import annotations

import argparse
from datetime import datetime, timezone
import json
import os
import re
import sys
from pathlib import Path
from urllib.parse import parse_qs, urlparse


CODEX_HOME = Path(os.environ.get("CODEX_HOME", str(Path.home() / ".codex"))).expanduser()
SESSIONS_ROOT = CODEX_HOME / "sessions"
SESSION_INDEX = CODEX_HOME / "session_index.jsonl"
SESSION_ID_RE = re.compile(
    r"(?P<id>[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\.jsonl$"
)
PATH_PATTERNS = [
    re.compile(r"\((/[^)\s]+)\)"),
    re.compile(r"(?<!\()(/(?:Users|Volumes|opt|tmp|var)/[^\s\])\",']+)"),
]
URI_RE = re.compile(r"(agents://codex/[^\s]+)")


def collapse_ws(value: str) -> str:
    return " ".join(value.split())


def snippet(value: str, limit: int = 160) -> str:
    text = collapse_ws(value)
    if len(text) <= limit:
        return text
    return text[: limit - 3] + "..."


def iso_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def iso_mtime(path: Path) -> str:
    return datetime.fromtimestamp(path.stat().st_mtime, tz=timezone.utc).isoformat().replace("+00:00", "Z")


def stable_dedupe(values: list[str]) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for value in values:
        if not value or value in seen:
            continue
        seen.add(value)
        out.append(value)
    return out


def iter_session_files() -> list[Path]:
    if not SESSIONS_ROOT.exists():
        return []
    return sorted(
        SESSIONS_ROOT.rglob("rollout-*.jsonl"),
        key=lambda path: path.stat().st_mtime,
        reverse=True,
    )


def extract_session_id(path: Path) -> str:
    match = SESSION_ID_RE.search(path.name)
    if match:
        return match.group("id")
    return path.stem


def read_session_index() -> list[dict[str, object]]:
    rows: list[dict[str, object]] = []
    if not SESSION_INDEX.exists():
        return rows
    with SESSION_INDEX.open("r", encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if not line:
                continue
            try:
                rows.append(json.loads(line))
            except json.JSONDecodeError:
                continue
    return rows


def find_thread(identifier: str) -> dict[str, object] | None:
    exact = None
    prefix = None
    for row in read_session_index():
        thread_id = str(row.get("id") or "")
        if not thread_id:
            continue
        if thread_id == identifier:
            exact = row
            break
        if thread_id.startswith(identifier) and prefix is None:
            prefix = row
    return exact or prefix


def load_session_data(path: Path) -> tuple[dict[str, object], list[dict[str, str]]]:
    context: dict[str, object] = {}
    messages: list[dict[str, str]] = []
    with path.open("r", encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if not line:
                continue
            try:
                record = json.loads(line)
            except json.JSONDecodeError:
                continue
            record_type = record.get("type")
            if record_type == "turn_context":
                payload = record.get("payload") or {}
                for key in ("cwd", "current_date", "timezone", "model"):
                    value = payload.get(key)
                    if value and key not in context:
                        context[key] = value
                continue
            if record_type != "event_msg":
                continue
            payload = record.get("payload") or {}
            payload_type = payload.get("type")
            if payload_type == "user_message":
                messages.append(
                    {
                        "timestamp": str(record.get("timestamp") or ""),
                        "role": "user",
                        "text": str(payload.get("message") or ""),
                    }
                )
            elif payload_type == "agent_message":
                message = str(payload.get("message") or "")
                messages.append(
                    {
                        "timestamp": str(record.get("timestamp") or ""),
                        "role": "assistant",
                        "text": message,
                        "phase": str(payload.get("phase") or ""),
                    }
                )
                context["last_agent_message"] = message
            elif payload_type == "task_complete" and payload.get("last_agent_message"):
                context["last_agent_message"] = str(payload.get("last_agent_message"))
    return context, messages


def load_recent_messages(path: Path, limit: int) -> list[dict[str, str]]:
    _, messages = load_session_data(path)
    if limit <= 0:
        return []
    return messages[-limit:]


def resolve_identifier(identifier: str) -> tuple[Path | None, list[Path]]:
    files = iter_session_files()
    if not files:
        return None, []
    if identifier in {"current", "latest"}:
        return files[0], [files[0]]

    exact: list[Path] = []
    prefix: list[Path] = []
    contains: list[Path] = []
    for path in files:
        session_id = extract_session_id(path)
        if session_id == identifier:
            exact.append(path)
        elif session_id.startswith(identifier):
            prefix.append(path)
        elif identifier in path.name:
            contains.append(path)
    candidates = exact or prefix or contains
    return (candidates[0] if candidates else None), candidates


def parse_uri(uri: str) -> tuple[str | None, dict[str, list[str]]]:
    parsed = urlparse(uri)
    if parsed.scheme != "agents":
        raise SystemExit(f"Unsupported URI scheme: {parsed.scheme or '(missing)'}")
    if parsed.netloc != "codex":
        raise SystemExit(f"Unsupported authority: {parsed.netloc or '(missing)'}")
    parts = [part for part in parsed.path.split("/") if part]
    identifier = None
    if parts:
        if parts[0] in {"thread", "threads", "session", "sessions"} and len(parts) > 1:
            identifier = parts[1]
        else:
            identifier = parts[0]
    return identifier, parse_qs(parsed.query, keep_blank_values=True)


def extract_artifacts(messages: list[dict[str, str]]) -> dict[str, list[str]]:
    paths: list[str] = []
    uris: list[str] = []
    for message in messages:
        text = str(message.get("text") or "")
        for pattern in PATH_PATTERNS:
            paths.extend(match.group(1) for match in pattern.finditer(text))
        uris.extend(match.group(1) for match in URI_RE.finditer(text))
    return {
        "paths": stable_dedupe(paths),
        "uris": stable_dedupe(uris),
    }


def build_handoff_payload(
    uri: str,
    resolved: Path,
    candidates: list[Path],
    thread: dict[str, object] | None,
    messages: list[dict[str, str]],
    context: dict[str, object],
    timeline_limit: int,
) -> dict[str, object]:
    trimmed_messages = messages[-timeline_limit:] if timeline_limit > 0 else []
    user_messages = [message for message in messages if message.get("role") == "user"]
    assistant_messages = [message for message in messages if message.get("role") == "assistant"]
    latest_user_message = user_messages[-1]["text"] if user_messages else ""
    latest_assistant_message = assistant_messages[-1]["text"] if assistant_messages else str(context.get("last_agent_message") or "")
    artifacts = extract_artifacts(trimmed_messages or messages)
    session_id = extract_session_id(resolved)
    canonical_uri = f"agents://codex/{session_id}"
    return {
        "schema_version": "xurl-handoff-v1",
        "kind": "codex_handoff",
        "generated_at": iso_now(),
        "origin": {
            "requested_uri": uri,
            "canonical_uri": canonical_uri,
            "session_id": session_id,
            "thread_id": thread.get("id") if thread else None,
            "thread_name": thread.get("thread_name") if thread else None,
        },
        "session": {
            "path": str(resolved),
            "updated_at": iso_mtime(resolved),
            "candidate_count": len(candidates),
            "cwd": context.get("cwd"),
            "model": context.get("model"),
            "current_date": context.get("current_date"),
            "timezone": context.get("timezone"),
        },
        "summary": {
            "latest_user_message": latest_user_message,
            "latest_assistant_message": latest_assistant_message,
            "message_count": len(messages),
        },
        "artifacts": artifacts,
        "timeline": [
            {
                "timestamp": message.get("timestamp"),
                "role": message.get("role"),
                "phase": message.get("phase") or None,
                "text": collapse_ws(str(message.get("text") or "")),
            }
            for message in trimmed_messages
        ],
    }


def frontmatter_value(value: object) -> str:
    if value is None:
        return "null"
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (int, float)):
        return str(value)
    return json.dumps(value, ensure_ascii=True)


def render_handoff_markdown(payload: dict[str, object]) -> str:
    origin = payload["origin"]
    session = payload["session"]
    summary = payload["summary"]
    artifacts = payload["artifacts"]
    timeline = payload["timeline"]

    frontmatter = [
        "---",
        f"schema_version: {frontmatter_value(payload['schema_version'])}",
        f"kind: {frontmatter_value(payload['kind'])}",
        f"generated_at: {frontmatter_value(payload['generated_at'])}",
        f"requested_uri: {frontmatter_value(origin['requested_uri'])}",
        f"canonical_uri: {frontmatter_value(origin['canonical_uri'])}",
        f"session_id: {frontmatter_value(origin['session_id'])}",
        f"thread_id: {frontmatter_value(origin['thread_id'])}",
        f"thread_name: {frontmatter_value(origin['thread_name'])}",
        f"transcript_path: {frontmatter_value(session['path'])}",
        f"updated_at: {frontmatter_value(session['updated_at'])}",
        f"cwd: {frontmatter_value(session['cwd'])}",
        f"model: {frontmatter_value(session['model'])}",
        f"timezone: {frontmatter_value(session['timezone'])}",
        f"message_count: {frontmatter_value(summary['message_count'])}",
        f"timeline_count: {frontmatter_value(len(timeline))}",
        f"artifact_paths: {frontmatter_value(artifacts['paths'])}",
        f"artifact_uris: {frontmatter_value(artifacts['uris'])}",
        "---",
    ]

    body = [
        "# Codex Handoff",
        "",
        "## Summary",
        f"Latest user message: {snippet(str(summary['latest_user_message']), 280)}" if summary["latest_user_message"] else "Latest user message: ",
        f"Latest assistant message: {snippet(str(summary['latest_assistant_message']), 280)}" if summary["latest_assistant_message"] else "Latest assistant message: ",
        "",
        "## Timeline",
    ]

    if timeline:
        for item in timeline:
            timestamp = item.get("timestamp") or ""
            role = item.get("role") or "unknown"
            phase = f" [{item['phase']}]" if item.get("phase") else ""
            body.append(f"- {timestamp} | {role}{phase} | {snippet(str(item.get('text') or ''), 320)}")
    else:
        body.append("- No timeline entries available.")

    body.extend(["", "## Artifacts"])
    if artifacts["paths"]:
        for path in artifacts["paths"]:
            body.append(f"- path: {path}")
    else:
        body.append("- path: none")

    if artifacts["uris"]:
        for handoff_uri in artifacts["uris"]:
            body.append(f"- uri: {handoff_uri}")
    else:
        body.append("- uri: none")

    return "\n".join(frontmatter + [""] + body)


def render_recent(files: list[Path], limit: int, as_json: bool) -> int:
    rows = []
    for path in files[:limit]:
        rows.append(
            {
                "session_id": extract_session_id(path),
                "path": str(path),
                "mtime_epoch": path.stat().st_mtime,
            }
        )
    if as_json:
        print(json.dumps(rows, indent=2))
    else:
        for row in rows:
            print(f"{row['session_id']}  {row['path']}")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Resolve agents://codex/... URIs into local Codex transcript paths.")
    parser.add_argument("uri", nargs="?", default="agents://codex", help="URI such as agents://codex/<session_id>")
    parser.add_argument("--json", action="store_true", help="Emit JSON")
    parser.add_argument("--handoff", action="store_true", help="Emit a structured handoff payload")
    parser.add_argument("--path-only", action="store_true", help="Print only the resolved transcript path")
    parser.add_argument("--tail", type=int, default=None, help="Show the last N user/assistant messages")
    parser.add_argument("--limit", type=int, default=10, help="Limit rows when listing recent sessions")
    args = parser.parse_args()

    identifier, query = parse_uri(args.uri)
    tail = args.tail
    if tail is None and query.get("tail"):
        try:
            tail = int(query["tail"][0])
        except ValueError:
            tail = None
    if identifier is None:
        return render_recent(iter_session_files(), max(args.limit, 1), args.json)

    resolved, candidates = resolve_identifier(identifier)
    thread = find_thread(identifier)
    if resolved is None:
        if thread is not None:
            payload = {
                "uri": args.uri,
                "kind": "codex_thread",
                "thread_id": thread.get("id"),
                "thread_name": thread.get("thread_name"),
                "updated_at": thread.get("updated_at"),
                "path": None,
                "message": "Matched a thread id in session_index.jsonl, but no rollout transcript filename matched directly.",
            }
            if args.json:
                print(json.dumps(payload, indent=2))
            else:
                print(f"thread_id: {payload['thread_id']}")
                print(f"thread_name: {payload['thread_name']}")
                print(f"updated_at: {payload['updated_at']}")
                print(payload["message"])
            return 0
        print(f"xurl: no Codex session found for '{identifier}'", file=sys.stderr)
        return 1

    context, messages = load_session_data(resolved)
    recent = messages[-max(tail or 0, 0):] if tail else []
    payload = {
        "uri": args.uri,
        "kind": "codex_session",
        "session_id": extract_session_id(resolved),
        "path": str(resolved),
        "mtime_epoch": resolved.stat().st_mtime,
        "updated_at": iso_mtime(resolved),
        "candidate_count": len(candidates),
        "thread": thread,
        "recent_messages": recent,
        "context": context,
    }

    if args.path_only:
        print(payload["path"])
        return 0

    if args.handoff:
        handoff_limit = tail if tail is not None else 8
        handoff_payload = build_handoff_payload(args.uri, resolved, candidates, thread, messages, context, max(handoff_limit, 0))
        if args.json:
            print(json.dumps(handoff_payload, indent=2))
        else:
            print(render_handoff_markdown(handoff_payload))
        return 0

    if args.json:
        print(json.dumps(payload, indent=2))
        return 0

    print(f"uri: {payload['uri']}")
    print(f"session_id: {payload['session_id']}")
    print(f"path: {payload['path']}")
    print(f"candidate_count: {payload['candidate_count']}")
    if thread:
        print(f"thread_id: {thread.get('id')}")
        print(f"thread_name: {thread.get('thread_name')}")
        print(f"thread_updated_at: {thread.get('updated_at')}")
    if recent:
        print("recent_messages:")
        for message in recent:
            print(f"- [{message['role']}] {snippet(message['text'])}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
