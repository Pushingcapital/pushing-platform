#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import secrets
import urllib.error
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo

RUNTIME_BASE = Path("/Users/emmanuelhaddad/.imessage_sender_runtime")
QUEUE_PATH = RUNTIME_BASE / "push_p_sla_queue.json"
LANE_COVERAGE_PATH = RUNTIME_BASE / "push_p_customer_lane_coverage.json"
LOG_PATH = Path("/Users/emmanuelhaddad/Library/Logs/PushingCapital/imessage_sla_runner.log")
LOCAL_BRIDGE_URL = "http://127.0.0.1:8786/api/send"
LOCAL_TZ = ZoneInfo("America/Los_Angeles")
DEFAULT_FOLLOWUP_TEMPLATE = "still working on it. need another {minutes} mins. ill keep u posted"
DEFAULT_NO_SOLICIT_START_HOUR = 20
DEFAULT_NO_SOLICIT_END_HOUR = 8
DEFAULT_PRIMARY_WORKER = "mac_messages_listener"
DEFAULT_BACKUP_WORKERS = ["pushingcap_orchestrator", "retool_full_stack_developer"]


def _now_utc() -> datetime:
    return datetime.now(timezone.utc)


def _now_local() -> datetime:
    return datetime.now(LOCAL_TZ)


def _iso(dt: datetime) -> str:
    return dt.astimezone(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


def _parse_iso(value: str) -> datetime:
    return datetime.fromisoformat(str(value).replace("Z", "+00:00"))


def _normalize_text(value: Any) -> str:
    return str(value or "").strip()


def _normalize_workers(value: Any, *, fallback: list[str] | None = None) -> list[str]:
    if isinstance(value, str):
        raw_items = [item.strip() for item in value.split(",")]
    elif isinstance(value, list):
        raw_items = [str(item).strip() for item in value]
    else:
        raw_items = []
    items = [item for item in raw_items if item]
    return items or list(fallback or [])


def _load_queue() -> list[dict[str, Any]]:
    if not QUEUE_PATH.exists():
        return []
    try:
        payload = json.loads(QUEUE_PATH.read_text())
    except Exception:
        return []
    return payload if isinstance(payload, list) else []


def _save_queue(items: list[dict[str, Any]]) -> None:
    RUNTIME_BASE.mkdir(parents=True, exist_ok=True)
    QUEUE_PATH.write_text(json.dumps(items, indent=2, sort_keys=True))


def _load_lane_coverage() -> list[dict[str, Any]]:
    if not LANE_COVERAGE_PATH.exists():
        return []
    try:
        payload = json.loads(LANE_COVERAGE_PATH.read_text())
    except Exception:
        return []
    return payload if isinstance(payload, list) else []


def _save_lane_coverage(items: list[dict[str, Any]]) -> None:
    RUNTIME_BASE.mkdir(parents=True, exist_ok=True)
    LANE_COVERAGE_PATH.write_text(json.dumps(items, indent=2, sort_keys=True))


def _upsert_lane_coverage(
    *,
    phone: str,
    sla_item_id: str,
    primary_worker: str,
    backup_workers: list[str],
    contact_id: str,
    thread_id: str,
    status: str,
) -> dict[str, Any]:
    items = _load_lane_coverage()
    now_iso = _iso(_now_utc())
    existing = None
    for item in items:
        if _normalize_text(item.get("phone")) == phone:
            existing = item
            break
    if existing is None:
        existing = {
            "id": f"push_p_lane_{secrets.token_hex(4)}",
            "phone": phone,
            "created_at": now_iso,
        }
        items.append(existing)
    normalized_backups = _normalize_workers(backup_workers, fallback=DEFAULT_BACKUP_WORKERS)
    normalized_primary = primary_worker or DEFAULT_PRIMARY_WORKER
    existing.update(
        {
            "sla_item_id": sla_item_id,
            "primary_worker": normalized_primary,
            "backup_workers": normalized_backups,
            "assigned_workers": [normalized_primary, *normalized_backups],
            "contact_id": contact_id,
            "thread_id": thread_id,
            "coverage_policy": "never_single_agent_per_customer",
            "status": status,
            "updated_at": now_iso,
        }
    )
    _save_lane_coverage(items)
    return existing


def _append_log(message: str) -> None:
    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    with LOG_PATH.open("a", encoding="utf-8") as handle:
        handle.write(f"{_iso(_now_utc())} {message}\n")


def _load_api_key() -> str:
    for path in (
        Path("/Users/emmanuelhaddad/Desktop/imessage_sender/.env"),
        Path("/Users/emmanuelhaddad/Desktop/imessage_sender/.env.local"),
    ):
        if not path.exists():
            continue
        try:
            for raw_line in path.read_text(encoding="utf-8").splitlines():
                line = raw_line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, value = line.split("=", 1)
                if _normalize_text(key) in {"IMESSAGE_API_KEY", "MAC_MESSAGES_API_KEY"}:
                    return value.strip().strip("'\"")
        except Exception:
            continue
    return ""


def _is_quiet_hours(now_local: datetime, *, start_hour: int, end_hour: int) -> bool:
    hour = now_local.hour
    if start_hour == end_hour:
        return False
    if start_hour > end_hour:
        return hour >= start_hour or hour < end_hour
    return start_hour <= hour < end_hour


def _next_allowed_local(now_local: datetime, *, start_hour: int, end_hour: int) -> datetime:
    if not _is_quiet_hours(now_local, start_hour=start_hour, end_hour=end_hour):
        return now_local
    if start_hour > end_hour and now_local.hour >= start_hour:
        base = now_local + timedelta(days=1)
    else:
        base = now_local
    return base.replace(hour=end_hour, minute=0, second=0, microsecond=0)


def _send_message(phone: str, message: str) -> dict[str, Any]:
    api_key = _load_api_key()
    if not api_key:
        raise RuntimeError("IMESSAGE_API_KEY is not configured.")
    body = json.dumps({"phone": phone, "message": message}).encode("utf-8")
    req = urllib.request.Request(
        LOCAL_BRIDGE_URL,
        data=body,
        headers={
            "Content-Type": "application/json",
            "X-API-Key": api_key,
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as response:
            payload = json.loads(response.read().decode("utf-8", errors="replace"))
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(detail or f"HTTP {error.code}") from error
    except urllib.error.URLError as error:
        raise RuntimeError(str(error.reason)) from error
    if not isinstance(payload, dict) or not payload.get("ok"):
        raise RuntimeError(str(payload))
    return payload


def _upsert_item(
    *,
    phone: str,
    due_minutes: int,
    followup_step_minutes: int,
    template: str,
    reason: str,
    source_message: str,
    no_solicit_start_hour: int,
    no_solicit_end_hour: int,
    primary_worker: str,
    backup_workers: list[str],
    contact_id: str,
    thread_id: str,
) -> dict[str, Any]:
    items = _load_queue()
    now_utc = _now_utc()
    existing = None
    for item in items:
        if _normalize_text(item.get("phone")) == phone and _normalize_text(item.get("status")) not in {"completed", "cancelled"}:
            existing = item
            break

    next_followup_at = _iso(now_utc + timedelta(minutes=max(1, due_minutes)))
    if existing is None:
        existing = {
            "id": f"push_p_sla_{secrets.token_hex(4)}",
            "phone": phone,
            "created_at": _iso(now_utc),
            "followup_count": 0,
        }
        items.append(existing)

    existing.update(
        {
            "status": "active",
            "reason": reason,
            "source_message": source_message,
            "next_followup_at": next_followup_at,
            "followup_step_minutes": max(1, followup_step_minutes),
            "followup_template": template or DEFAULT_FOLLOWUP_TEMPLATE,
            "no_solicit_start_hour": no_solicit_start_hour,
            "no_solicit_end_hour": no_solicit_end_hour,
            "primary_worker": primary_worker or DEFAULT_PRIMARY_WORKER,
            "backup_workers": _normalize_workers(backup_workers, fallback=DEFAULT_BACKUP_WORKERS),
            "assigned_workers": [primary_worker or DEFAULT_PRIMARY_WORKER, *_normalize_workers(backup_workers, fallback=DEFAULT_BACKUP_WORKERS)],
            "contact_id": contact_id,
            "thread_id": thread_id,
            "coverage_policy": "never_single_agent_per_customer",
            "updated_at": _iso(now_utc),
            "last_result": "scheduled",
        }
    )
    _save_queue(items)
    _upsert_lane_coverage(
        phone=phone,
        sla_item_id=existing["id"],
        primary_worker=primary_worker or DEFAULT_PRIMARY_WORKER,
        backup_workers=_normalize_workers(backup_workers, fallback=DEFAULT_BACKUP_WORKERS),
        contact_id=contact_id,
        thread_id=thread_id,
        status=_normalize_text(existing.get("status")) or "active",
    )
    _append_log(f"scheduled {existing['id']} phone={phone} due_minutes={due_minutes}")
    return existing


def _run_queue() -> list[dict[str, Any]]:
    items = _load_queue()
    now_utc = _now_utc()
    now_local = _now_local()
    touched: list[dict[str, Any]] = []
    changed = False

    for item in items:
        if _normalize_text(item.get("status")) in {"completed", "cancelled"}:
            continue
        primary_worker = _normalize_text(item.get("primary_worker")) or DEFAULT_PRIMARY_WORKER
        backup_workers = _normalize_workers(item.get("backup_workers"), fallback=DEFAULT_BACKUP_WORKERS)
        item["primary_worker"] = primary_worker
        item["backup_workers"] = backup_workers
        item["assigned_workers"] = [primary_worker, *backup_workers]
        item["coverage_policy"] = "never_single_agent_per_customer"

        start_hour = int(item.get("no_solicit_start_hour") or DEFAULT_NO_SOLICIT_START_HOUR)
        end_hour = int(item.get("no_solicit_end_hour") or DEFAULT_NO_SOLICIT_END_HOUR)
        if _is_quiet_hours(now_local, start_hour=start_hour, end_hour=end_hour):
            next_allowed = _next_allowed_local(now_local, start_hour=start_hour, end_hour=end_hour)
            item["status"] = "paused_for_quiet_hours"
            item["next_followup_at"] = _iso(next_allowed)
            item["updated_at"] = _iso(now_utc)
            item["last_result"] = "quiet_hours_pause"
            _upsert_lane_coverage(
                phone=_normalize_text(item.get("phone")),
                sla_item_id=_normalize_text(item.get("id")),
                primary_worker=primary_worker,
                backup_workers=backup_workers,
                contact_id=_normalize_text(item.get("contact_id")),
                thread_id=_normalize_text(item.get("thread_id")),
                status="paused_for_quiet_hours",
            )
            touched.append(item)
            changed = True
            continue

        if _normalize_text(item.get("status")) == "paused_for_quiet_hours":
            item["status"] = "active"
            changed = True

        next_followup_raw = _normalize_text(item.get("next_followup_at"))
        if not next_followup_raw:
            continue
        try:
            next_followup_at = _parse_iso(next_followup_raw)
        except Exception:
            continue
        if next_followup_at > now_utc:
            continue

        minutes = int(item.get("followup_step_minutes") or 5)
        template = _normalize_text(item.get("followup_template")) or DEFAULT_FOLLOWUP_TEMPLATE
        message = template.format(minutes=minutes)

        try:
            _send_message(_normalize_text(item.get("phone")), message)
            item["followup_count"] = int(item.get("followup_count") or 0) + 1
            item["last_followup_at"] = _iso(now_utc)
            item["next_followup_at"] = _iso(now_utc + timedelta(minutes=minutes))
            item["updated_at"] = _iso(now_utc)
            item["status"] = "active"
            item["last_result"] = "sent"
            item["last_message"] = message
            _upsert_lane_coverage(
                phone=_normalize_text(item.get("phone")),
                sla_item_id=_normalize_text(item.get("id")),
                primary_worker=primary_worker,
                backup_workers=backup_workers,
                contact_id=_normalize_text(item.get("contact_id")),
                thread_id=_normalize_text(item.get("thread_id")),
                status="active",
            )
            _append_log(f"sent {item.get('id')} phone={item.get('phone')} next={item.get('next_followup_at')}")
        except Exception as exc:
            item["updated_at"] = _iso(now_utc)
            item["last_result"] = f"error: {exc}"
            _upsert_lane_coverage(
                phone=_normalize_text(item.get("phone")),
                sla_item_id=_normalize_text(item.get("id")),
                primary_worker=primary_worker,
                backup_workers=backup_workers,
                contact_id=_normalize_text(item.get("contact_id")),
                thread_id=_normalize_text(item.get("thread_id")),
                status="error",
            )
            _append_log(f"error {item.get('id')} phone={item.get('phone')} detail={exc}")
        touched.append(item)
        changed = True

    if changed:
        _save_queue(items)
    return touched


def _complete_item(item_id: str) -> dict[str, Any]:
    items = _load_queue()
    for item in items:
        if _normalize_text(item.get("id")) != item_id:
            continue
        item["status"] = "completed"
        item["completed_at"] = _iso(_now_utc())
        item["updated_at"] = item["completed_at"]
        item["last_result"] = "completed"
        _save_queue(items)
        _upsert_lane_coverage(
            phone=_normalize_text(item.get("phone")),
            sla_item_id=_normalize_text(item.get("id")),
            primary_worker=_normalize_text(item.get("primary_worker")) or DEFAULT_PRIMARY_WORKER,
            backup_workers=_normalize_workers(item.get("backup_workers"), fallback=DEFAULT_BACKUP_WORKERS),
            contact_id=_normalize_text(item.get("contact_id")),
            thread_id=_normalize_text(item.get("thread_id")),
            status="completed",
        )
        _append_log(f"completed {item_id}")
        return item
    raise SystemExit(f"Unknown SLA item: {item_id}")


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Run Push P iMessage SLA follow-ups.")
    subparsers = parser.add_subparsers(dest="command", required=True)

    add_parser = subparsers.add_parser("add")
    add_parser.add_argument("--phone", required=True)
    add_parser.add_argument("--due-minutes", type=int, required=True)
    add_parser.add_argument("--followup-step-minutes", type=int, default=5)
    add_parser.add_argument("--template", default=DEFAULT_FOLLOWUP_TEMPLATE)
    add_parser.add_argument("--reason", default="time_estimate")
    add_parser.add_argument("--source-message", default="")
    add_parser.add_argument("--no-solicit-start-hour", type=int, default=DEFAULT_NO_SOLICIT_START_HOUR)
    add_parser.add_argument("--no-solicit-end-hour", type=int, default=DEFAULT_NO_SOLICIT_END_HOUR)
    add_parser.add_argument("--primary-worker", default=DEFAULT_PRIMARY_WORKER)
    add_parser.add_argument("--backup-workers", default=",".join(DEFAULT_BACKUP_WORKERS))
    add_parser.add_argument("--contact-id", default="")
    add_parser.add_argument("--thread-id", default="")

    subparsers.add_parser("run")
    subparsers.add_parser("list")

    complete_parser = subparsers.add_parser("complete")
    complete_parser.add_argument("--id", required=True)
    return parser


def main() -> None:
    args = _parser().parse_args()
    if args.command == "add":
        payload = _upsert_item(
            phone=_normalize_text(args.phone),
            due_minutes=max(1, int(args.due_minutes)),
            followup_step_minutes=max(1, int(args.followup_step_minutes)),
            template=_normalize_text(args.template) or DEFAULT_FOLLOWUP_TEMPLATE,
            reason=_normalize_text(args.reason) or "time_estimate",
            source_message=_normalize_text(args.source_message),
            no_solicit_start_hour=int(args.no_solicit_start_hour),
            no_solicit_end_hour=int(args.no_solicit_end_hour),
            primary_worker=_normalize_text(args.primary_worker) or DEFAULT_PRIMARY_WORKER,
            backup_workers=_normalize_workers(args.backup_workers, fallback=DEFAULT_BACKUP_WORKERS),
            contact_id=_normalize_text(args.contact_id),
            thread_id=_normalize_text(args.thread_id),
        )
        print(json.dumps(payload, indent=2, sort_keys=True))
        return
    if args.command == "run":
        print(json.dumps({"ok": True, "items": _run_queue()}, indent=2, sort_keys=True))
        return
    if args.command == "list":
        print(json.dumps({"ok": True, "items": _load_queue()}, indent=2, sort_keys=True))
        return
    if args.command == "complete":
        print(json.dumps(_complete_item(_normalize_text(args.id)), indent=2, sort_keys=True))
        return


if __name__ == "__main__":
    main()
