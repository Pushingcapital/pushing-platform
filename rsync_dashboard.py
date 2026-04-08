#!/usr/bin/env python3
import json
import re
import signal
import subprocess
import threading
import time
from collections import deque
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

HOST = "127.0.0.1"
PORT = 8765
SOURCE = "/Volumes/Extreme SSD/"
DEST = "/Volumes/Pushing Cap/"

RSYNC_CMD = [
    "rsync",
    "-rlt",
    "--modify-window=1",
    "--partial",
    "--inplace",
    "--progress",
    "--exclude=/.Spotlight-V100/",
    "--exclude=/.Trashes/",
    "--exclude=/.DocumentRevisions-V100/",
    "--exclude=/.DocumentRevisions-V100-bad-1/",
    "--exclude=/.TemporaryItems/",
    "--exclude=/.fseventsd/",
    "--exclude=*.sock",
    "--exclude=*.socket",
    SOURCE,
    DEST,
]

state = {
    "running": False,
    "pid": None,
    "started_at": None,
    "ended_at": None,
    "exit_code": None,
    "current_file": None,
    "percent": None,
    "speed": None,
    "eta": None,
    "xfer": None,
    "to_check": None,
    "warnings": 0,
    "errors": 0,
    "last_line": None,
    "phase": "Idle",
    "proc_cpu": None,
    "proc_state": None,
    "proc_elapsed": None,
    "dest_used_gb": None,
    "dest_free_gb": None,
    "dest_capacity": None,
    "last_output_at": None,
}

state_lock = threading.Lock()
log_lines = deque(maxlen=5000)
subscribers = set()
subscribers_lock = threading.Lock()
process = None
process_lock = threading.Lock()

PROGRESS_RE = re.compile(
    r"^\s*([\d,]+)\s+(\d+)%\s+([^\s]+)\s+([^\s]+)\s+\(xfer#(\d+),\s+to-check=(\d+/\d+)\)$"
)


def now_iso():
    return time.strftime("%Y-%m-%d %H:%M:%S")


def snapshot():
    with state_lock:
        return dict(state)


def broadcast(payload):
    message = f"data: {json.dumps(payload, ensure_ascii=True)}\n\n".encode("utf-8")
    dead = []
    with subscribers_lock:
        for wfile in subscribers:
            try:
                wfile.write(message)
                wfile.flush()
            except Exception:
                dead.append(wfile)
        for wfile in dead:
            subscribers.discard(wfile)


def append_log(kind, line):
    ts = now_iso()
    entry = f"[{ts}] {line}"
    log_lines.append(entry)
    with state_lock:
        state["last_line"] = line
        state["last_output_at"] = ts
        if kind == "warning":
            state["warnings"] += 1
        elif kind == "error":
            state["errors"] += 1
    broadcast({"type": "log", "kind": kind, "line": entry, "state": snapshot()})


def parse_line(raw_line):
    line = raw_line.strip("\n")
    if not line:
        return

    kind = "info"
    lowered = line.lower()
    if "warning" in lowered:
        kind = "warning"
    if "error" in lowered:
        kind = "error"

    m = PROGRESS_RE.match(line)
    if m:
        with state_lock:
            state["percent"] = int(m.group(2))
            state["speed"] = m.group(3)
            state["eta"] = m.group(4)
            state["xfer"] = int(m.group(5))
            state["to_check"] = m.group(6)
            state["phase"] = "Transferring file data"
    elif not line.startswith(" ") and "/" in line:
        with state_lock:
            state["current_file"] = line
            state["phase"] = "Transferring file data"

    append_log(kind, line)


def read_output(stream):
    buffer = ""
    while True:
        chunk = stream.read(4096)
        if not chunk:
            break
        text = chunk.decode("utf-8", errors="replace").replace("\r", "\n")
        buffer += text
        while "\n" in buffer:
            line, buffer = buffer.split("\n", 1)
            parse_line(line)
    if buffer.strip():
        parse_line(buffer)


def df_stats(path):
    out = subprocess.check_output(["df", "-k", path], text=True, stderr=subprocess.DEVNULL)
    lines = [ln for ln in out.splitlines() if ln.strip()]
    if len(lines) < 2:
        return None
    cols = lines[-1].split()
    if len(cols) < 5:
        return None
    used_kb = int(cols[2])
    free_kb = int(cols[3])
    cap = cols[4]
    return {
        "used_gb": round(used_kb / 1024.0 / 1024.0, 2),
        "free_gb": round(free_kb / 1024.0 / 1024.0, 2),
        "cap": cap,
    }


def ps_stats(pid):
    out = subprocess.check_output(
        ["ps", "-p", str(pid), "-o", "%cpu=,state=,etime="],
        text=True,
        stderr=subprocess.DEVNULL,
    ).strip()
    if not out:
        return None
    cols = out.split()
    if len(cols) < 3:
        return None
    return {
        "cpu": cols[0],
        "state": cols[1],
        "elapsed": cols[2],
    }


def runtime_monitor():
    while True:
        time.sleep(5)

        with state_lock:
            running = state["running"]
            pid = state["pid"]
            last_output_at = state["last_output_at"]
            current_file = state["current_file"]
            percent = state["percent"]

        if not running or not pid:
            continue

        proc = None
        dest = None
        try:
            proc = ps_stats(pid)
        except Exception:
            proc = None

        try:
            dest = df_stats(DEST)
        except Exception:
            dest = None

        with state_lock:
            if proc:
                state["proc_cpu"] = proc["cpu"]
                state["proc_state"] = proc["state"]
                state["proc_elapsed"] = proc["elapsed"]
            if dest:
                state["dest_used_gb"] = dest["used_gb"]
                state["dest_free_gb"] = dest["free_gb"]
                state["dest_capacity"] = dest["cap"]

            phase = "Scanning and comparing existing files"
            if current_file or percent is not None:
                phase = "Transferring file data"
            if last_output_at and phase.startswith("Scanning"):
                phase = "Scanning/comparing files (normal when many files already exist)"
            state["phase"] = phase

        broadcast({"type": "status", "state": snapshot()})


def run_rsync():
    global process
    with process_lock:
        if process is not None:
            return False, "Transfer is already running."

        with state_lock:
            state.update(
                {
                    "running": True,
                    "pid": None,
                    "started_at": now_iso(),
                    "ended_at": None,
                    "exit_code": None,
                    "current_file": None,
                    "percent": None,
                    "speed": None,
                    "eta": None,
                    "xfer": None,
                    "to_check": None,
                    "warnings": 0,
                    "errors": 0,
                    "last_line": None,
                    "phase": "Starting",
                    "proc_cpu": None,
                    "proc_state": None,
                    "proc_elapsed": None,
                    "last_output_at": None,
                }
            )

        try:
            process = subprocess.Popen(
                RSYNC_CMD,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
            )
        except Exception as exc:
            with state_lock:
                state["running"] = False
                state["exit_code"] = -1
                state["ended_at"] = now_iso()
                state["phase"] = "Failed to start"
            return False, f"Failed to start rsync: {exc}"

        with state_lock:
            state["pid"] = process.pid
            state["phase"] = "Scanning and comparing existing files"

    append_log("info", f"Started rsync PID {process.pid}")
    read_output(process.stdout)
    rc = process.wait()

    with process_lock:
        process = None

    with state_lock:
        state["running"] = False
        state["exit_code"] = rc
        state["ended_at"] = now_iso()
        state["phase"] = "Completed" if rc == 0 else "Failed"

    if rc == 0:
        append_log("info", "rsync completed successfully.")
    else:
        append_log("error", f"rsync exited with code {rc}.")

    broadcast({"type": "status", "state": snapshot()})
    return True, "Transfer finished"


def start_transfer_async():
    t = threading.Thread(target=run_rsync, daemon=True)
    t.start()


def stop_transfer():
    global process
    with process_lock:
        p = process
    if p is None:
        return False, "No active transfer."

    try:
        p.send_signal(signal.SIGINT)
        return True, f"Sent SIGINT to rsync PID {p.pid}."
    except Exception as exc:
        return False, f"Failed stopping rsync: {exc}"


PAGE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Rsync Transfer Dashboard</title>
<style>
:root {
  --bg: #0b1220;
  --panel: #121c2f;
  --text: #e6edf6;
  --muted: #8ea4c7;
  --ok: #20c997;
  --warn: #ffb020;
  --err: #ff6b6b;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: var(--text);
  background: radial-gradient(1200px 800px at 15% -10%, #1a2a46, var(--bg));
}
.wrap { max-width: 1180px; margin: 20px auto; padding: 0 16px; }
.card {
  background: linear-gradient(180deg, #17243a, var(--panel));
  border: 1px solid #243656;
  border-radius: 14px;
  padding: 14px;
}
.grid { display: grid; gap: 10px; grid-template-columns: repeat(4, minmax(0, 1fr)); }
.kv { background: #0f1728; border: 1px solid #21314f; border-radius: 10px; padding: 10px; }
.k { color: var(--muted); font-size: 12px; margin-bottom: 6px; text-transform: uppercase; }
.v { font-size: 16px; font-weight: 650; }
.badge { padding: 4px 8px; border-radius: 99px; font-size: 12px; font-weight: 650; display: inline-block; }
.running { background: rgba(32,201,151,.2); color: var(--ok); }
.stopped { background: rgba(255,107,107,.2); color: var(--err); }
.controls { margin: 12px 0; display: flex; gap: 8px; }
button {
  border: 1px solid #2c4672;
  background: #17315c;
  color: #d9e8ff;
  border-radius: 10px;
  padding: 8px 12px;
  cursor: pointer;
}
button:hover { background: #1f3d70; }
#log {
  margin-top: 12px;
  height: 55vh;
  overflow: auto;
  background: #0a1221;
  border: 1px solid #1f3354;
  border-radius: 12px;
  padding: 12px;
  white-space: pre-wrap;
  line-height: 1.35;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
}
.warn { color: var(--warn); }
.err { color: var(--err); }
.info { color: #d8e6ff; }
small { color: var(--muted); }
</style>
</head>
<body>
<div class="wrap">
  <h2>Rsync Transfer Dashboard</h2>
  <small id="paths"></small>
  <div class="controls">
    <button id="startBtn">Start / Resume</button>
    <button id="stopBtn">Stop</button>
  </div>
  <div class="card">
    <div class="grid">
      <div class="kv"><div class="k">Status</div><div class="v" id="running"></div></div>
      <div class="kv"><div class="k">Phase</div><div class="v" id="phase">-</div></div>
      <div class="kv"><div class="k">PID</div><div class="v" id="pid">-</div></div>
      <div class="kv"><div class="k">Started</div><div class="v" id="started">-</div></div>
      <div class="kv"><div class="k">Current File</div><div class="v" id="file">-</div></div>
      <div class="kv"><div class="k">Progress</div><div class="v" id="progress">-</div></div>
      <div class="kv"><div class="k">Speed / ETA</div><div class="v" id="speed">-</div></div>
      <div class="kv"><div class="k">xfer# / to-check</div><div class="v" id="xfer">-</div></div>
      <div class="kv"><div class="k">Process CPU / State</div><div class="v" id="proc">-</div></div>
      <div class="kv"><div class="k">Process Elapsed</div><div class="v" id="elapsed">-</div></div>
      <div class="kv"><div class="k">Destination Used / Free</div><div class="v" id="dest">-</div></div>
      <div class="kv"><div class="k">Warnings / Errors</div><div class="v" id="issues">0 / 0</div></div>
    </div>
    <div id="log"></div>
  </div>
</div>
<script>
const logEl = document.getElementById('log');
const ids = {
  running: document.getElementById('running'),
  phase: document.getElementById('phase'),
  pid: document.getElementById('pid'),
  started: document.getElementById('started'),
  file: document.getElementById('file'),
  progress: document.getElementById('progress'),
  speed: document.getElementById('speed'),
  xfer: document.getElementById('xfer'),
  proc: document.getElementById('proc'),
  elapsed: document.getElementById('elapsed'),
  dest: document.getElementById('dest'),
  issues: document.getElementById('issues'),
};

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function updateState(st) {
  const badge = st.running
    ? '<span class="badge running">RUNNING</span>'
    : '<span class="badge stopped">STOPPED</span>';
  ids.running.innerHTML = badge;
  ids.phase.textContent = st.phase || '-';
  ids.pid.textContent = st.pid ?? '-';
  ids.started.textContent = st.started_at || '-';
  ids.file.textContent = st.current_file || (st.running ? 'Scanning/comparing files...' : '-');
  ids.progress.textContent = st.percent == null ? '-' : `${st.percent}%`;
  ids.speed.textContent = (st.speed || '-') + ' / ' + (st.eta || '-');
  ids.xfer.textContent = `${st.xfer ?? '-'} / ${st.to_check || '-'}`;
  ids.proc.textContent = `${st.proc_cpu || '-'}% / ${st.proc_state || '-'}`;
  ids.elapsed.textContent = st.proc_elapsed || '-';
  if (st.dest_used_gb != null && st.dest_free_gb != null) {
    ids.dest.textContent = `${st.dest_used_gb} GB / ${st.dest_free_gb} GB (${st.dest_capacity || '-'})`;
  } else {
    ids.dest.textContent = '-';
  }
  ids.issues.textContent = `${st.warnings} / ${st.errors}`;
}

function addLog(kind, line) {
  const cls = kind === 'error' ? 'err' : (kind === 'warning' ? 'warn' : 'info');
  const atBottom = logEl.scrollTop + logEl.clientHeight >= logEl.scrollHeight - 10;
  logEl.insertAdjacentHTML('beforeend', `<div class="${cls}">${esc(line)}</div>`);
  if (atBottom) {
    logEl.scrollTop = logEl.scrollHeight;
  }
}

async function fetchStatus() {
  const res = await fetch('/status');
  const data = await res.json();
  document.getElementById('paths').textContent = `Source: ${data.source}  ->  Destination: ${data.dest}`;
  updateState(data.state);
  logEl.innerHTML = '';
  for (const line of data.logs) {
    addLog('info', line);
  }
}

const es = new EventSource('/events');
es.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.type === 'log') {
    addLog(msg.kind, msg.line);
    updateState(msg.state);
    return;
  }
  if (msg.type === 'status') {
    updateState(msg.state);
  }
};

let lastSseWarnAt = 0;
es.onerror = () => {
  const now = Date.now();
  if (now - lastSseWarnAt > 15000) {
    addLog('warning', '[dashboard] SSE disconnected, retrying...');
    lastSseWarnAt = now;
  }
};

document.getElementById('startBtn').onclick = async () => {
  const res = await fetch('/start', { method: 'POST' });
  const data = await res.json();
  addLog(data.ok ? 'info' : 'error', `[dashboard] ${data.message}`);
};

document.getElementById('stopBtn').onclick = async () => {
  const res = await fetch('/stop', { method: 'POST' });
  const data = await res.json();
  addLog(data.ok ? 'warning' : 'error', `[dashboard] ${data.message}`);
};

setInterval(() => {
  if (es.readyState !== EventSource.OPEN) {
    fetchStatus().catch(() => {});
  }
}, 5000);

fetchStatus();
</script>
</body>
</html>
"""


class Handler(BaseHTTPRequestHandler):
    def _send_json(self, payload, status=200):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path == "/":
            body = PAGE.encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(body)
            return

        if self.path == "/status":
            payload = {
                "source": SOURCE,
                "dest": DEST,
                "state": snapshot(),
                "logs": list(log_lines),
            }
            self._send_json(payload)
            return

        if self.path == "/events":
            self.send_response(200)
            self.send_header("Content-Type", "text/event-stream")
            self.send_header("Cache-Control", "no-cache")
            self.send_header("Connection", "keep-alive")
            self.send_header("X-Accel-Buffering", "no")
            self.end_headers()

            init = {"type": "status", "state": snapshot()}
            self.wfile.write(f"retry: 2000\ndata: {json.dumps(init, ensure_ascii=True)}\n\n".encode("utf-8"))
            self.wfile.flush()

            with subscribers_lock:
                subscribers.add(self.wfile)

            try:
                while True:
                    time.sleep(5)
                    self.wfile.write(b": ping\n\n")
                    self.wfile.flush()
            except Exception:
                pass
            finally:
                with subscribers_lock:
                    subscribers.discard(self.wfile)
            return

        self._send_json({"error": "not found"}, status=404)

    def do_POST(self):
        if self.path == "/start":
            with process_lock:
                active = process is not None
            if active:
                self._send_json({"ok": False, "message": "Transfer is already running."})
                return
            start_transfer_async()
            self._send_json({"ok": True, "message": "Transfer started/resumed."})
            return

        if self.path == "/stop":
            ok, msg = stop_transfer()
            self._send_json({"ok": ok, "message": msg})
            return

        self._send_json({"error": "not found"}, status=404)

    def log_message(self, fmt, *args):
        return


def main():
    append_log("info", "Dashboard booting...")

    monitor = threading.Thread(target=runtime_monitor, daemon=True)
    monitor.start()

    start_transfer_async()

    ThreadingHTTPServer.daemon_threads = True
    ThreadingHTTPServer.allow_reuse_address = True
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    append_log("info", f"Dashboard listening at http://{HOST}:{PORT}")
    server.serve_forever()


if __name__ == "__main__":
    main()
