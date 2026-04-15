/**
 * Orchestrator Receiver — Digital Twin Dispatch Handler
 *
 * Runs on a GCE fleet node. Receives dispatch signals from the
 * pushingSecurity PWA and spawns a headless Playwright browser
 * that mirrors the client's exact device fingerprint.
 *
 * Usage:
 *   DISPATCH_SECRET=xxx node orchestrator-receiver.mjs
 *
 * The Playwright session uses:
 *   - Client's exact viewport dimensions
 *   - Client's User-Agent string
 *   - Client's timezone and locale
 *   - Client's device pixel ratio
 *   - Touch support matching
 *
 * The client never sees a browser. All automation runs autonomously
 * on the fleet node behind the mesh VPN.
 */

import { createServer } from "node:http";
import { chromium } from "playwright";

const PORT = Number(process.env.ORCHESTRATOR_PORT ?? 9090);
const SECRET = process.env.DISPATCH_SECRET ?? "";

// ── Action registry ────────────────────────────────────────────────────────

const ACTION_HANDLERS = {
  "quickbooks-provision": executeQuickBooksProvision,
  "bank-feed-connect": executeBankFeedConnect,
  "irs-filing": executeIRSFiling,
  "dmv-lookup": executeDMVLookup,
  "credit-pull": executeCreditPull,
  custom: executeCustomAction,
};

// ── Playwright launcher ────────────────────────────────────────────────────

async function launchDigitalTwin(fingerprint) {
  const browser = await chromium.launch({
    headless: true,
    args: [
      "--disable-blink-features=AutomationControlled",
      "--disable-features=IsolateOrigins,site-per-process",
      "--no-first-run",
      "--no-default-browser-check",
    ],
  });

  const context = await browser.newContext({
    viewport: {
      width: fingerprint.viewportWidth || 1920,
      height: fingerprint.viewportHeight || 1080,
    },
    screen: {
      width: fingerprint.screenWidth || 1920,
      height: fingerprint.screenHeight || 1080,
    },
    userAgent: fingerprint.userAgent || undefined,
    locale: fingerprint.language || "en-US",
    timezoneId: fingerprint.timezone || "America/Los_Angeles",
    deviceScaleFactor: fingerprint.devicePixelRatio || 1,
    hasTouch: fingerprint.touchSupport || false,
    colorScheme: "dark",
    permissions: [],
  });

  // Stealth: override navigator properties
  await context.addInitScript((fp) => {
    Object.defineProperty(navigator, "platform", {
      get: () => fp.platform || navigator.platform,
    });
    Object.defineProperty(navigator, "hardwareConcurrency", {
      get: () => fp.hardwareConcurrency || 4,
    });
    Object.defineProperty(navigator, "maxTouchPoints", {
      get: () => fp.maxTouchPoints || 0,
    });
    // Hide webdriver flag
    Object.defineProperty(navigator, "webdriver", {
      get: () => false,
    });
  }, fingerprint);

  return { browser, context };
}

// ── Action handlers (stubs — will be expanded) ─────────────────────────────

async function executeQuickBooksProvision(context, _params, jobId) {
  const page = await context.newPage();
  console.log(`[${jobId}] QuickBooks provision: navigating to signup`);
  await page.goto("https://quickbooks.intuit.com/pricing/");
  await page.waitForLoadState("networkidle");

  // TODO: implement full provisioning flow
  // 1. Click "Try it free"
  // 2. Fill in business details from the job record
  // 3. Connect bank feeds
  // 4. Screenshot confirmation

  const title = await page.title();
  console.log(`[${jobId}] QuickBooks page loaded: ${title}`);
  await page.close();
  return { status: "navigated", pageTitle: title };
}

async function executeBankFeedConnect(context, _params, jobId) {
  console.log(`[${jobId}] Bank feed connect: queued`);
  return { status: "queued" };
}

async function executeIRSFiling(context, _params, jobId) {
  console.log(`[${jobId}] IRS filing: queued`);
  return { status: "queued" };
}

async function executeDMVLookup(context, _params, jobId) {
  console.log(`[${jobId}] DMV lookup: queued`);
  return { status: "queued" };
}

async function executeCreditPull(context, _params, jobId) {
  console.log(`[${jobId}] Credit pull: queued`);
  return { status: "queued" };
}

async function executeCustomAction(context, params, jobId) {
  console.log(`[${jobId}] Custom action:`, params);
  return { status: "queued", params };
}

// ── HTTP server ────────────────────────────────────────────────────────────

async function handleDispatch(req, res) {
  let body = "";
  for await (const chunk of req) body += chunk;

  try {
    const payload = JSON.parse(body);
    const { dispatchId, jobId, fingerprint, actions } = payload;

    console.log(
      `\n[dispatch] Received ${dispatchId} for job ${jobId}`,
      `\n  UA: ${fingerprint.userAgent?.slice(0, 60)}…`,
      `\n  Viewport: ${fingerprint.viewportWidth}x${fingerprint.viewportHeight}`,
      `\n  TZ: ${fingerprint.timezone}`,
      `\n  Actions: ${actions.map((a) => a.type).join(", ")}`,
    );

    // Spin up Digital Twin browser
    const { browser, context } = await launchDigitalTwin(fingerprint);
    const results = {};

    for (const action of actions) {
      const handler = ACTION_HANDLERS[action.type];
      if (handler) {
        try {
          results[action.type] = await handler(
            context,
            action.params ?? {},
            jobId,
          );
        } catch (err) {
          results[action.type] = {
            status: "error",
            error: err.message,
          };
        }
      } else {
        results[action.type] = { status: "unknown-action" };
      }
    }

    await browser.close();

    console.log(`[dispatch] Completed ${dispatchId}`);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        dispatchId,
        status: "completed",
        results,
      }),
    );
  } catch (err) {
    console.error("[dispatch] Error:", err.message);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: err.message }));
  }
}

const server = createServer((req, res) => {
  // Auth check
  if (SECRET) {
    const auth = req.headers.authorization;
    if (auth !== `Bearer ${SECRET}`) {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Unauthorized" }));
      return;
    }
  }

  if (req.method === "POST" && req.url === "/") {
    handleDispatch(req, res);
    return;
  }

  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", node: process.env.HOSTNAME ?? "unknown" }));
    return;
  }

  res.writeHead(404);
  res.end();
});

server.listen(PORT, () => {
  console.log(`[orchestrator] Digital Twin receiver listening on :${PORT}`);
  console.log(`[orchestrator] Auth: ${SECRET ? "ENABLED" : "DISABLED (set DISPATCH_SECRET)"}`);
});
