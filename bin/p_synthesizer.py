#!/usr/bin/env python3
"""p_synthesizer.py — ElevenLabs voice synthesis for Push P.

Converts text into Manny-voice audio via ElevenLabs TTS.
Can be used standalone (CLI) or imported by push_p_responder.

Usage:
  python3 p_synthesizer.py "Hey David, your file is ready"
  python3 p_synthesizer.py --list-voices
  python3 p_synthesizer.py --clone /path/to/samples/
  python3 p_synthesizer.py --send "+19494130318" "Quick update on your case"
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import time
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
from zoneinfo import ZoneInfo

# ── Constants ──────────────────────────────────────────────────────
ELEVENLABS_BASE = "https://api.elevenlabs.io/v1"
RUNTIME_BASE = Path("/Users/emmanuelhaddad/.imessage_sender_runtime")
AUDIO_OUTPUT_DIR = RUNTIME_BASE / "voice_output"
SECRETS_PATH = Path("/Users/emmanuelhaddad/.config/pushingcapital/secrets.env")
IMESSAGE_ENV_PATH = RUNTIME_BASE / ".env"
LOCAL_BRIDGE_URL = "http://127.0.0.1:8786/api/send"
LOCAL_TZ = ZoneInfo("America/Los_Angeles")

DEFAULT_VOICE_ID = "pNInz6obpgDQGcFmaJgB"  # ElevenLabs "Adam" fallback
DEFAULT_MODEL_ID = "eleven_turbo_v2_5"
DEFAULT_STABILITY = 0.5
DEFAULT_SIMILARITY = 0.75
DEFAULT_STYLE = 0.0
DEFAULT_SPEAKER_BOOST = True
DEFAULT_OUTPUT_FORMAT = "mp3_44100_128"


# ── Config ─────────────────────────────────────────────────────────
@dataclass
class SynthConfig:
    api_key: str = ""
    voice_id: str = DEFAULT_VOICE_ID
    model_id: str = DEFAULT_MODEL_ID
    stability: float = DEFAULT_STABILITY
    similarity_boost: float = DEFAULT_SIMILARITY
    style: float = DEFAULT_STYLE
    use_speaker_boost: bool = DEFAULT_SPEAKER_BOOST
    output_format: str = DEFAULT_OUTPUT_FORMAT
    output_dir: Path = AUDIO_OUTPUT_DIR
    imessage_api_key: str = ""


def _env_from_file(key: str, *paths: Path) -> str:
    for p in paths:
        if not p.exists():
            continue
        for line in p.read_text(errors="replace").splitlines():
            line = line.strip()
            if line.startswith("#") or "=" not in line:
                continue
            k, _, v = line.partition("=")
            if k.strip() == key:
                return v.strip().strip('"').strip("'")
    return ""


def load_config() -> SynthConfig:
    api_key = (
        os.environ.get("ELEVENLABS_API_KEY")
        or _env_from_file("ELEVENLABS_API_KEY", SECRETS_PATH, IMESSAGE_ENV_PATH)
    )
    voice_id = (
        os.environ.get("ELEVENLABS_VOICE_ID")
        or _env_from_file("ELEVENLABS_VOICE_ID", SECRETS_PATH, IMESSAGE_ENV_PATH)
        or DEFAULT_VOICE_ID
    )
    imessage_key = (
        os.environ.get("IMESSAGE_API_KEY")
        or _env_from_file("IMESSAGE_API_KEY", IMESSAGE_ENV_PATH)
    )
    cfg = SynthConfig(
        api_key=api_key,
        voice_id=voice_id,
        imessage_api_key=imessage_key,
    )
    cfg.output_dir.mkdir(parents=True, exist_ok=True)
    return cfg


# ── ElevenLabs API helpers ─────────────────────────────────────────
def _api_request(
    method: str,
    path: str,
    *,
    api_key: str,
    payload: dict | None = None,
    binary: bool = False,
    timeout: int = 30,
) -> dict | bytes:
    url = f"{ELEVENLABS_BASE}{path}"
    headers = {"xi-api-key": api_key}
    data = None
    if payload is not None:
        headers["Content-Type"] = "application/json"
        if not binary:
            headers["Accept"] = "application/json"
        data = json.dumps(payload).encode("utf-8")
    req = Request(url, data=data, headers=headers, method=method.upper())
    try:
        with urlopen(req, timeout=timeout) as resp:
            raw = resp.read()
            if binary:
                return raw
            return json.loads(raw.decode("utf-8", errors="replace"))
    except HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"ElevenLabs {exc.code}: {body}") from exc


# ── Core TTS ───────────────────────────────────────────────────────
def synthesize(
    text: str,
    config: SynthConfig | None = None,
    *,
    voice_id: str | None = None,
    output_path: Path | None = None,
) -> Path:
    """Synthesize text to audio file. Returns path to the mp3."""
    cfg = config or load_config()
    if not cfg.api_key:
        raise RuntimeError("ELEVENLABS_API_KEY not set")

    vid = voice_id or cfg.voice_id
    ts = datetime.now(LOCAL_TZ).strftime("%Y%m%d_%H%M%S")
    out = output_path or (cfg.output_dir / f"p_synth_{ts}.mp3")
    out.parent.mkdir(parents=True, exist_ok=True)

    audio_bytes = _api_request(
        "POST",
        f"/text-to-speech/{vid}?output_format={cfg.output_format}",
        api_key=cfg.api_key,
        payload={
            "text": text,
            "model_id": cfg.model_id,
            "voice_settings": {
                "stability": cfg.stability,
                "similarity_boost": cfg.similarity_boost,
                "style": cfg.style,
                "use_speaker_boost": cfg.use_speaker_boost,
            },
        },
        binary=True,
    )
    out.write_bytes(audio_bytes)
    print(f"[synth] {len(audio_bytes):,} bytes → {out}")
    return out


def synthesize_stream(
    text: str,
    config: SynthConfig | None = None,
    *,
    voice_id: str | None = None,
    output_path: Path | None = None,
) -> Path:
    """Streaming TTS — lower latency for long text."""
    cfg = config or load_config()
    if not cfg.api_key:
        raise RuntimeError("ELEVENLABS_API_KEY not set")

    vid = voice_id or cfg.voice_id
    ts = datetime.now(LOCAL_TZ).strftime("%Y%m%d_%H%M%S")
    out = output_path or (cfg.output_dir / f"p_synth_stream_{ts}.mp3")
    out.parent.mkdir(parents=True, exist_ok=True)

    url = f"{ELEVENLABS_BASE}/text-to-speech/{vid}/stream?output_format={cfg.output_format}"
    headers = {
        "xi-api-key": cfg.api_key,
        "Content-Type": "application/json",
    }
    body = json.dumps({
        "text": text,
        "model_id": cfg.model_id,
        "voice_settings": {
            "stability": cfg.stability,
            "similarity_boost": cfg.similarity_boost,
        },
    }).encode("utf-8")

    req = Request(url, data=body, headers=headers, method="POST")
    try:
        with urlopen(req, timeout=60) as resp:
            with open(out, "wb") as f:
                total = 0
                while True:
                    chunk = resp.read(8192)
                    if not chunk:
                        break
                    f.write(chunk)
                    total += len(chunk)
        print(f"[synth-stream] {total:,} bytes → {out}")
        return out
    except HTTPError as exc:
        body_err = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"ElevenLabs stream {exc.code}: {body_err}") from exc


# ── Voice management ───────────────────────────────────────────────
def list_voices(config: SynthConfig | None = None) -> list[dict]:
    cfg = config or load_config()
    resp = _api_request("GET", "/voices", api_key=cfg.api_key)
    voices = resp.get("voices", [])
    for v in voices:
        tag = " ← ACTIVE" if v["voice_id"] == cfg.voice_id else ""
        print(f"  {v['voice_id']}  {v['name']}{tag}")
    return voices


def clone_voice(
    name: str,
    sample_paths: list[Path],
    config: SynthConfig | None = None,
    description: str = "Manny — Pushing Capital",
) -> dict:
    """Clone a voice from audio samples using ElevenLabs Instant Voice Clone."""
    cfg = config or load_config()
    if not cfg.api_key:
        raise RuntimeError("ELEVENLABS_API_KEY not set")

    import mimetypes
    from email.mime.multipart import MIMEMultipart
    from io import BytesIO

    boundary = f"----PushP{int(time.time())}"
    body_parts: list[bytes] = []

    body_parts.append(f"--{boundary}\r\nContent-Disposition: form-data; name=\"name\"\r\n\r\n{name}\r\n".encode())
    body_parts.append(f"--{boundary}\r\nContent-Disposition: form-data; name=\"description\"\r\n\r\n{description}\r\n".encode())

    for sp in sample_paths:
        mime = mimetypes.guess_type(str(sp))[0] or "audio/mpeg"
        body_parts.append(
            f"--{boundary}\r\nContent-Disposition: form-data; name=\"files\"; filename=\"{sp.name}\"\r\nContent-Type: {mime}\r\n\r\n".encode()
            + sp.read_bytes()
            + b"\r\n"
        )
    body_parts.append(f"--{boundary}--\r\n".encode())
    full_body = b"".join(body_parts)

    url = f"{ELEVENLABS_BASE}/voices/add"
    req = Request(url, data=full_body, method="POST", headers={
        "xi-api-key": cfg.api_key,
        "Content-Type": f"multipart/form-data; boundary={boundary}",
    })
    try:
        with urlopen(req, timeout=120) as resp:
            result = json.loads(resp.read().decode("utf-8", errors="replace"))
        print(f"[clone] Voice created: {result.get('voice_id')} — {name}")
        return result
    except HTTPError as exc:
        body_err = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"ElevenLabs clone {exc.code}: {body_err}") from exc


def get_voice_info(voice_id: str, config: SynthConfig | None = None) -> dict:
    cfg = config or load_config()
    return _api_request("GET", f"/voices/{voice_id}", api_key=cfg.api_key)


def get_usage(config: SynthConfig | None = None) -> dict:
    cfg = config or load_config()
    return _api_request("GET", "/user/subscription", api_key=cfg.api_key)


# ── iMessage audio delivery ────────────────────────────────────────
def send_audio_imessage(phone: str, audio_path: Path) -> dict:
    """Send an audio file as an iMessage attachment via AppleScript."""
    if not audio_path.exists():
        raise FileNotFoundError(f"Audio file not found: {audio_path}")

    script = f'''
    tell application "Messages"
        set targetService to 1st account whose service type = iMessage
        set targetBuddy to participant "{phone}" of targetService
        send POSIX file "{audio_path}" to targetBuddy
    end tell
    '''
    result = subprocess.run(
        ["osascript", "-e", script],
        capture_output=True, text=True, timeout=20,
    )
    if result.returncode != 0:
        err = result.stderr.strip() or result.stdout.strip()
        raise RuntimeError(f"osascript failed: {err}")
    print(f"[send] Audio sent to {phone}: {audio_path.name}")
    return {"ok": True, "phone": phone, "file": str(audio_path)}


def synthesize_and_send(
    phone: str,
    text: str,
    config: SynthConfig | None = None,
    *,
    voice_id: str | None = None,
    also_send_text: bool = True,
    also_send_audio: bool = True,
) -> dict[str, Any]:
    """One-shot: send text and/or synthesized audio via iMessage."""
    cfg = config or load_config()
    if not also_send_text and not also_send_audio:
        raise ValueError("At least one of text or audio must be sent")

    result: dict[str, Any] = {"text": text}

    audio_path: Path | None = None
    if also_send_audio:
        audio_path = synthesize(text, cfg, voice_id=voice_id)
        result["audio_path"] = str(audio_path)

    # Optionally send the text message too via the HTTP bridge
    if also_send_text and cfg.imessage_api_key:
        try:
            payload = json.dumps({"phone": phone, "message": text}).encode()
            req = Request(
                LOCAL_BRIDGE_URL,
                data=payload,
                headers={"Content-Type": "application/json", "X-API-Key": cfg.imessage_api_key},
                method="POST",
            )
            with urlopen(req, timeout=20) as resp:
                result["text_send"] = json.loads(resp.read().decode())
        except Exception as exc:
            result["text_send_error"] = str(exc)

    # Send the audio attachment
    if audio_path is not None:
        try:
            send_result = send_audio_imessage(phone, audio_path)
            result["audio_send"] = send_result
        except Exception as exc:
            result["audio_send_error"] = str(exc)

    return result


def play_local(audio_path: Path | str) -> None:
    """Play audio locally via macOS afplay (blocking)."""
    p = Path(audio_path)
    if not p.exists():
        raise FileNotFoundError(f"Audio not found: {p}")
    print(f"[play] {p.name}")
    subprocess.run(["afplay", str(p)], check=True)


def quick_say(text: str, *, play: bool = True) -> Path:
    """Synthesize and optionally play immediately. Good for testing."""
    path = synthesize(text)
    if play:
        play_local(path)
    return path


# ── CLI ────────────────────────────────────────────────────────────
def main() -> int:
    parser = argparse.ArgumentParser(
        description="Push P voice synthesizer — ElevenLabs TTS for iMessage",
    )
    sub = parser.add_subparsers(dest="command")

    # say
    say_p = sub.add_parser("say", help="Synthesize text to audio file")
    say_p.add_argument("text", help="Text to synthesize")
    say_p.add_argument("--voice", default=None, help="Override voice ID")
    say_p.add_argument("--out", default=None, help="Output file path")
    say_p.add_argument("--stream", action="store_true", help="Use streaming TTS")
    say_p.add_argument("--play", action="store_true", help="Play audio after synthesis")

    # send
    send_p = sub.add_parser("send", help="Synthesize + send via iMessage")
    send_p.add_argument("phone", help="Recipient phone number")
    send_p.add_argument("text", help="Text to synthesize and send")
    send_p.add_argument("--voice", default=None, help="Override voice ID")
    send_p.add_argument("--text-only", action="store_true", help="Skip audio, text only")
    send_p.add_argument("--audio-only", action="store_true", help="Skip text, audio only")

    # voices
    sub.add_parser("voices", help="List available voices")

    # clone
    clone_p = sub.add_parser("clone", help="Clone a voice from audio samples")
    clone_p.add_argument("name", help="Name for the cloned voice")
    clone_p.add_argument("samples", nargs="+", help="Audio sample file paths")
    clone_p.add_argument("--desc", default="Manny — Pushing Capital")

    # info
    info_p = sub.add_parser("info", help="Get voice details")
    info_p.add_argument("voice_id", nargs="?", default=None, help="Voice ID (default: active)")

    # usage
    sub.add_parser("usage", help="Show ElevenLabs subscription/quota")

    # play
    play_p = sub.add_parser("play", help="Play a local audio file")
    play_p.add_argument("file", help="Path to audio file")

    # quick shortcut flags (no positional to avoid argparse conflict)
    parser.add_argument("--play", action="store_true", dest="quick_play", help="Play after quick synth")
    parser.add_argument("--say", type=str, help="Alias for 'say' command with --play")
    parser.add_argument("--send", type=str, help="Target phone number (alias for 'send' command)")
    parser.add_argument("--text", type=str, help="Payload to synthesize (used with --send)")
    parser.add_argument("--list-voices", action="store_true", help="Alias for 'voices' command")

    # Detect quick-say shortcut BEFORE argparse touches argv
    known_commands = {
        "say", "send", "voices", "clone", "info", "usage", "play", 
        "-h", "--help", "--play", "--say", "--send", "--text", "--list-voices"
    }
    if len(sys.argv) > 1 and sys.argv[1] not in known_commands:
        cfg = load_config()
        if not cfg.api_key:
            print("ERROR: ELEVENLABS_API_KEY not set.")
            return 1
        text = " ".join(sys.argv[1:]).replace("--play", "").strip()
        do_play = "--play" in sys.argv
        path = synthesize(text, cfg)
        if do_play:
            play_local(path)
        return 0

    args = parser.parse_args()

    # Translate flag aliases to subcommand structure
    if getattr(args, "list_voices", False):
        args.command = "voices"
    if getattr(args, "say", None):
        args.command = "say"
        args.text = args.say
        args.play = True
        args.out = None
        args.stream = False
        args.voice = None
    if getattr(args, "send", None):
        if not getattr(args, "text", None):
            print("ERROR: --text is required when using --send")
            return 1
        args.command = "send"
        args.phone = args.send
        args.voice = None
        args.text_only = False
        args.audio_only = False

    cfg = load_config()
    if not cfg.api_key:
        print("ERROR: ELEVENLABS_API_KEY not set.")
        print("Add to ~/.config/pushingcapital/secrets.env:")
        print("  ELEVENLABS_API_KEY=sk_...")
        return 1

    if args.command is None:
        parser.print_help()
        return 0

    if args.command == "say":
        out = Path(args.out) if args.out else None
        fn = synthesize_stream if args.stream else synthesize
        path = fn(args.text, cfg, voice_id=args.voice, output_path=out)
        if args.play:
            play_local(path)

    elif args.command == "send":
        if args.text_only and args.audio_only:
            print("ERROR: --text-only and --audio-only cannot be used together.")
            return 2

        result = synthesize_and_send(
            args.phone, args.text, cfg,
            voice_id=args.voice,
            also_send_text=not args.audio_only,
            also_send_audio=not args.text_only,
        )
        print(json.dumps(result, indent=2, default=str))

    elif args.command == "voices":
        list_voices(cfg)

    elif args.command == "clone":
        samples = [Path(s).expanduser().resolve() for s in args.samples]
        missing = [s for s in samples if not s.exists()]
        if missing:
            print(f"ERROR: Missing samples: {missing}")
            return 1
        result = clone_voice(args.name, samples, cfg, description=args.desc)
        print(json.dumps(result, indent=2))

    elif args.command == "info":
        vid = args.voice_id or cfg.voice_id
        info = get_voice_info(vid, cfg)
        print(json.dumps(info, indent=2))

    elif args.command == "usage":
        usage = get_usage(cfg)
        chars_used = usage.get("character_count", 0)
        chars_limit = usage.get("character_limit", 0)
        pct = (chars_used / chars_limit * 100) if chars_limit else 0
        print(f"Characters: {chars_used:,} / {chars_limit:,} ({pct:.1f}%)")
        print(f"Tier: {usage.get('tier', 'unknown')}")
        print(json.dumps(usage, indent=2))

    elif args.command == "play":
        play_local(Path(args.file))

    return 0


if __name__ == "__main__":
    sys.exit(main())
