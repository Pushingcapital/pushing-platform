#!/usr/bin/env python3
from __future__ import annotations

import argparse
import importlib.util
import json
import os
import sys
import signal
import urllib.request
import urllib.error
from pathlib import Path
from typing import Any


class _Timeout(Exception):
    pass

def _alarm_handler(signum, frame):
    raise _Timeout("Model call exceeded time limit")


TALK_TO_P_PATH = Path("/Users/emmanuelhaddad/pushing-platform/PushingP Vault/Core/Launcher/talk_to_p.py")


def load_talk_to_p_module() -> Any:
    spec = importlib.util.spec_from_file_location("talk_to_p_module", TALK_TO_P_PATH)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Unable to load talk_to_p.py from {TALK_TO_P_PATH}")

    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def log_to_ledger(prompt: str, answer: str, mode: str) -> None:
    connector_url = os.environ.get("PC_SQL_CONNECTOR_URL", "https://us-central1-brain-481809.cloudfunctions.net/pc-sql-connector")
    api_key = os.environ.get("CONNECTOR_API_KEY", "")
    
    if not api_key:
        return

    # Truncate strings to avoid oversized queries
    try:
        trunc_prompt = (prompt[:250] + '...') if len(prompt) > 250 else prompt
        trunc_answer = (answer[:250] + '...') if len(answer) > 250 else answer
        
        query = """
            INSERT INTO pc_workstream_ledger (module, action, detail, agent, status, created_at)
            VALUES (%s, %s, %s, %s, %s, NOW())
        """
        payload = {
            "query": query,
            "parameters": [
                "ORCHESTRATION",
                "P_CHAT_INVOCATION",
                f"Mode: {mode} | Prompt: {trunc_prompt} | Answer: {trunc_answer}",
                "P",
                "LIVE"
            ]
        }
        
        req = urllib.request.Request(connector_url, data=json.dumps(payload).encode('utf-8'))
        req.add_header('Content-Type', 'application/json')
        req.add_header('x-api-key', api_key)
        
        urllib.request.urlopen(req, timeout=3)
    except Exception as e:
        # Silently fail the telemetry push to not break core agent invocation
        pass

def push_to_swarm_mesh(prompt: str, answer: str) -> None:
    # Immediately proxy the intent through the Next.js fast-path swarm api
    payload = {
        "sender": "P_CORE",
        "target_worker": "ANTIGRAVITY",
        "command": f"P Execution Trace. Prompt: {prompt} | Output: {answer}",
        "is_sh": True
    }
    
    try:
        req = urllib.request.Request("https://offshore-dom-upgrade-calgary.trycloudflare.com/api/swarm/message", data=json.dumps(payload).encode('utf-8'))
        req.add_header('Content-Type', 'application/json')
        urllib.request.urlopen(req, timeout=1)  # Lightning fast relay drop
    except Exception:
        pass


def build_local_agent(module: Any) -> Any:
    return module.LocalP(
        model=module.DEFAULT_MODEL,
        max_input_tokens=max(32768, module.DEFAULT_MAX_INPUT_TOKENS),
        max_output_tokens=max(2048, module.DEFAULT_MAX_OUTPUT_TOKENS),
        max_thinking_tokens=max(0, module.DEFAULT_MAX_THINKING_TOKENS),
        max_tool_calls=max(4, module.DEFAULT_MAX_TOOL_CALLS),
        max_tool_result_tokens=max(1024, module.DEFAULT_MAX_TOOL_RESULT_TOKENS),
        max_playwright_tool_result_tokens=max(
            2048, module.DEFAULT_MAX_PLAYWRIGHT_TOOL_RESULT_TOKENS
        ),
    )


def build_remote_agent(module: Any) -> Any:
    return module.RemoteP(
        max_input_tokens=max(32768, module.DEFAULT_MAX_INPUT_TOKENS),
        max_output_tokens=max(2048, module.DEFAULT_MAX_OUTPUT_TOKENS),
        max_thinking_tokens=max(0, module.DEFAULT_MAX_THINKING_TOKENS),
        max_tool_calls=max(4, module.DEFAULT_MAX_TOOL_CALLS),
        max_tool_result_tokens=max(1024, module.DEFAULT_MAX_TOOL_RESULT_TOKENS),
        max_playwright_tool_result_tokens=max(
            2048, module.DEFAULT_MAX_PLAYWRIGHT_TOOL_RESULT_TOKENS
        ),
        audio=False,
    )


def refresh_memory() -> None:
    """Rebuild the platform memory layer synchronously."""
    memory_builder = Path("/Users/emmanuelhaddad/pushing-platform/bin/p_memory_builder.py")
    venv_python = Path("/Users/emmanuelhaddad/pushing-platform/.venv_swarm/bin/python3")
    if memory_builder.exists():
        import subprocess as _sp
        _sp.run([str(venv_python), str(memory_builder), "--quiet"], timeout=90)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="One-shot JSON bridge for P from web surfaces."
    )
    parser.add_argument("--prompt", help="Prompt to send to P.")
    parser.add_argument(
        "--mode",
        choices=["local", "remote"],
        default="local",
        help="Which P path to use.",
    )
    parser.add_argument(
        "--refresh-memory",
        action="store_true",
        help="Rebuild p_platform_memory.md before answering.",
    )
    args = parser.parse_args()

    if args.refresh_memory:
        refresh_memory()

    prompt = (args.prompt or sys.stdin.read()).strip()
    if not prompt:
        print(json.dumps({"status": "error", "error": "A prompt is required."}))
        raise SystemExit(2)

    module = load_talk_to_p_module()
    runtime_mode = args.mode

    try:
        if runtime_mode == "local":
            try:
                agent = build_local_agent(module)
            except Exception:
                runtime_mode = "remote"
                agent = build_remote_agent(module)
        else:
            agent = build_remote_agent(module)

        # ── Try primary model with 12s timeout, fallback to flash ──────
        answer = None
        try:
            signal.signal(signal.SIGALRM, _alarm_handler)
            signal.alarm(12)  # 12 second hard limit
            answer = str(agent.ask(prompt)).strip() or None
            signal.alarm(0)  # Cancel timer on success
        except (_Timeout, Exception) as primary_err:
            signal.alarm(0)
            print(f"[bridge] Primary model failed ({primary_err}), trying flash...", file=sys.stderr)
            # Fallback: use gemini-2.0-flash directly via API
            try:
                api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY", "")
                if api_key:
                    flash_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
                    flash_payload = json.dumps({
                        "contents": [{"parts": [{"text": prompt}]}],
                        "generationConfig": {"maxOutputTokens": 1024}
                    }).encode()
                    req = urllib.request.Request(flash_url, data=flash_payload)
                    req.add_header("Content-Type", "application/json")
                    resp = urllib.request.urlopen(req, timeout=10)
                    flash_data = json.loads(resp.read())
                    answer = flash_data["candidates"][0]["content"]["parts"][0]["text"].strip()
                    runtime_mode = "flash-fallback"
            except Exception as flash_err:
                print(f"[bridge] Flash fallback also failed: {flash_err}", file=sys.stderr)

        if not answer:
            answer = "I received your message but my models are currently loading. Please try again in a moment. 🧠"
            runtime_mode = "fallback-static"

        print(
            json.dumps(
                {
                    "status": "success",
                    "runtime_mode": runtime_mode,
                    "answer": answer,
                }
            )
        )
        # Asynchronously or silently log to ledger
        log_to_ledger(prompt, answer, runtime_mode)
        
        # PING THE SWARM API FAST-PATH
        push_to_swarm_mesh(prompt, answer)
        
    except Exception as exc:
        print(
            json.dumps(
                {
                    "status": "error",
                    "runtime_mode": runtime_mode,
                    "error": str(exc),
                }
            )
        )
        raise SystemExit(1)


if __name__ == "__main__":
    main()
