#!/usr/bin/env node
/**
 * orchestrator-receiver.mjs
 *
 * Runs on GCE fleet nodes. Receives dispatch signals from the PWA
 * and spawns Playwright handlers for autonomous financial operations.
 *
 * Start: node orchestrator-receiver.mjs
 * Port: 8787 (default)
 */

import http from "http";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 8787;
const SECRET = process.env.DISPATCH_SECRET || "ps-vault-dispatch-2026";

// ── Handler registry ──────────────────────────────────────────────────────

const HANDLERS = {
  "experian-login": {
    script: path.join(__dirname, "handlers/experian-handler.mjs"),
    requiredFields: ["username", "password"],
  },
  "quickbooks-provision": {
    script: path.join(__dirname, "handlers/quickbooks-handler.mjs"),
    requiredFields: ["email"],
  },
};

// ── Spawn handler ─────────────────────────────────────────────────────────

function runHandler(handlerConfig, params, fingerprint = {}) {
  return new Promise((resolve, reject) => {
    const screenshotDir = `/tmp/ps-automation-${Date.now()}`;
    fs.mkdirSync(screenshotDir, { recursive: true });

    const args = [];
    for (const [k, v] of Object.entries(params)) {
      args.push(`--${k}`, String(v));
    }
    args.push("--fingerprint", JSON.stringify(fingerprint));
    args.push("--screenshot-dir", screenshotDir);

    const child = spawn("node", [handlerConfig.script, ...args], {
      cwd: __dirname,
      env: { ...process.env, NODE_ENV: "production" },
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (d) => { stdout += d.toString(); });
    child.stderr.on("data", (d) => { stderr += d.toString(); });

    child.on("close", (code) => {
      try {
        const result = JSON.parse(stdout.trim().split("\n").pop());
        resolve({ code, result, screenshotDir });
      } catch {
        resolve({ code, stdout, stderr, screenshotDir });
      }
    });

    child.on("error", reject);

    // Timeout after 2 minutes
    setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error("Handler timed out after 120s"));
    }, 120_000);
  });
}

// ── HTTP server ───────────────────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  if (req.method === "POST" && req.url === "/dispatch") {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", async () => {
      try {
        const payload = JSON.parse(body);

        // Auth check
        if (payload.secret !== SECRET && req.headers.authorization !== `Bearer ${SECRET}`) {
          res.writeHead(401, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ error: "Unauthorized" }));
        }

        const { action, params, fingerprint } = payload;

        if (!HANDLERS[action]) {
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ error: `Unknown action: ${action}`, available: Object.keys(HANDLERS) }));
        }

        const handler = HANDLERS[action];
        const missing = handler.requiredFields.filter((f) => !params?.[f]);
        if (missing.length > 0) {
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ error: `Missing fields: ${missing.join(", ")}` }));
        }

        console.log(`[orchestrator] ${new Date().toISOString()} Dispatching: ${action}`);
        const result = await runHandler(handler, params, fingerprint);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "completed", ...result }));

      } catch (err) {
        console.error(`[orchestrator] Error:`, err);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Health check
  if (req.method === "GET" && (req.url === "/" || req.url === "/health")) {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({
      service: "pushingSecurity-orchestrator",
      status: "operational",
      handlers: Object.keys(HANDLERS),
      uptime: process.uptime(),
    }));
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(PORT, () => {
  console.log(`[orchestrator] pushingSecurity orchestrator listening on :${PORT}`);
  console.log(`[orchestrator] Handlers: ${Object.keys(HANDLERS).join(", ")}`);
});
