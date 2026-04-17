#!/Users/emmanuelhaddad/pushing-platform/.venv_swarm/bin/python3
"""
P Web Relay Server
==================
A lightweight HTTP server that receives POST requests from the
pushingcap.com /api/p Cloudflare route and executes p_chat_bridge.py
locally, returning P's response as JSON.

Run this on your Mac to enable the P :: VAULT chat interface in production.

Usage:
    python3 p_web_relay.py [--port 7777]
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

PORT = 7778

BRIDGE_SCRIPT = Path("/Users/emmanuelhaddad/pushing-platform/bin/p_chat_bridge.py")
MEMORY_BUILDER = Path("/Users/emmanuelhaddad/pushing-platform/bin/p_memory_builder.py")
MEMORY_MD = Path("/Users/emmanuelhaddad/.config/pushingcapital/p_platform_memory.md")
MEMORY_JSON = Path("/Users/emmanuelhaddad/.config/pushingcapital/p_platform_memory.json")
VENV_PYTHON = Path("/Users/emmanuelhaddad/pushing-platform/.venv_swarm/bin/python3")
SECRETS_PATH = Path("/Users/emmanuelhaddad/.config/pushingcapital/secrets.env")

# ── Load secrets env ──────────────────────────────────────────────────────────
def load_secrets() -> dict[str, str]:
    secrets: dict[str, str] = {}
    try:
        for line in SECRETS_PATH.read_text().splitlines():
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            eq = line.find("=")
            if eq > 0:
                key = line[:eq].strip()
                val = line[eq+1:].strip().strip('"\'')
                if key:
                    secrets[key] = val
    except Exception as e:
        print(f"[relay] Warning: could not load secrets: {e}", file=sys.stderr)
    return secrets


SECRETS = load_secrets()


# ── HTTP handler ──────────────────────────────────────────────────────────────
class RelayHandler(BaseHTTPRequestHandler):

    def log_message(self, fmt: str, *args: object) -> None:
        print(f"[relay] {fmt % args}")

    def _send_json(self, status: int, payload: dict) -> None:
        body = json.dumps(payload).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self) -> None:
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, x-relay-key")
        self.end_headers()

    def do_GET(self) -> None:
        if self.path == "/health":
            self._send_json(200, {"status": "ok", "agent": "P",
                                   "endpoints": ["/health", "/memory", "/ask", "/api/p", "/memory/refresh"]})
        elif self.path == "/memory":
            # Return current memory snapshot
            try:
                if MEMORY_JSON.exists():
                    data = json.loads(MEMORY_JSON.read_text())
                    md = MEMORY_MD.read_text() if MEMORY_MD.exists() else ""
                    data["markdown"] = md
                    self._send_json(200, data)
                elif MEMORY_MD.exists():
                    self._send_json(200, {"markdown": MEMORY_MD.read_text()})
                else:
                    self._send_json(404, {"error": "Memory not built yet. POST /memory/refresh to build."})
            except Exception as e:
                self._send_json(500, {"error": str(e)})
        else:
            self._send_json(404, {"error": "Not found"})

    def do_POST(self) -> None:
        # ── Memory refresh ──────────────────────────────────────────────────
        if self.path == "/memory/refresh":
            try:
                env = {**os.environ, **SECRETS}
                result = subprocess.run(
                    [str(VENV_PYTHON), str(MEMORY_BUILDER)],
                    capture_output=True, text=True, timeout=120, env=env,
                )
                ok = result.returncode == 0
                self._send_json(200 if ok else 500, {
                    "status": "refreshed" if ok else "error",
                    "memory_md": str(MEMORY_MD),
                    "memory_json": str(MEMORY_JSON),
                    "stdout": result.stdout.strip()[-500:],
                    "stderr": result.stderr.strip()[-200:],
                })
            except Exception as e:
                self._send_json(500, {"error": str(e)})
            return

        if self.path not in ("/ask", "/api/p"):
            self._send_json(404, {"error": "Unknown endpoint"})
            return

        try:
            length = int(self.headers.get("Content-Length", 0))
            raw = self.rfile.read(length)
            body = json.loads(raw)
        except Exception as e:
            self._send_json(400, {"error": f"Bad request: {e}"})
            return

        # Resolve prompt from messages[] or message field
        prompt: str | None = None
        messages = body.get("messages") or []
        if messages:
            for msg in reversed(messages):
                if msg.get("role") == "user":
                    prompt = msg.get("content", "").strip()
                    break
        if not prompt:
            prompt = (body.get("message") or "").strip()

        if not prompt:
            self._send_json(400, {"error": "No message provided."})
            return

        # Build subprocess env
        env = {**os.environ, **SECRETS}

        try:
            # Escape for shell
            shell_prompt = prompt.replace('"', '\\"')
            result = subprocess.run(
                [str(VENV_PYTHON), str(BRIDGE_SCRIPT), "--prompt", prompt],
                capture_output=True,
                text=True,
                timeout=60,
                env=env,
            )

            stdout = result.stdout.strip()
            stderr = result.stderr.strip()

            if stderr:
                print(f"[relay] bridge stderr: {stderr}", file=sys.stderr)

            reply: str
            try:
                parsed = json.loads(stdout)
                reply = parsed.get("answer") or parsed.get("error") or stdout
            except Exception:
                reply = stdout or "P did not return a response."

            self._send_json(200, {"reply": reply})

        except subprocess.TimeoutExpired:
            self._send_json(504, {"reply": "P timed out (>60s). Bridge may be loading."})
        except Exception as e:
            self._send_json(500, {"reply": f"Relay error: {e}"})


# ── Entry point ───────────────────────────────────────────────────────────────
class ReusableHTTPServer(HTTPServer):
    allow_reuse_address = True


def main() -> None:
    parser = argparse.ArgumentParser(description="P Web Relay — bridges /api/p to the local P engine.")
    parser.add_argument("--port", type=int, default=PORT, help=f"Port to listen on (default {PORT})")
    args = parser.parse_args()

    server = ReusableHTTPServer(("0.0.0.0", args.port), RelayHandler)
    print(f"🟢 P Web Relay running on http://0.0.0.0:{args.port}")
    print(f"   POST /ask or /api/p     →  p_chat_bridge.py (P execution)")
    print(f"   GET  /health            →  status + endpoint list")
    print(f"   GET  /memory            →  current platform memory snapshot")
    print(f"   POST /memory/refresh    →  rebuild p_platform_memory.md")
    print(f"   Secrets loaded: {list(SECRETS.keys())}")
    if MEMORY_MD.exists():
        print(f"   Memory layer: {MEMORY_MD} ✅")
    else:
        print(f"   Memory layer: not built yet — POST /memory/refresh")
    print("   (Ctrl+C to stop)\n")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[relay] Shutting down.")
        server.server_close()


if __name__ == "__main__":
    main()
