#!/usr/bin/env node
/**
 * pushingSecurity Stealth Mirror Server
 * 
 * WebSocket server that captures and streams the pushingSecurity website
 * to connected clients (machine-topology, workers, mobile).
 * 
 * Protocol: stealth-mirror-v1
 *   → Client sends: { type: "subscribe", channel: "mirror" }
 *   ← Server sends: { type: "frame", data: <base64 JPEG>, url: <current URL>, ts: <timestamp> }
 *   → Client sends: { type: "navigate", url: "..." } to change page
 *   → Client sends: { type: "click", x: N, y: N } to relay input
 *   → Client sends: { type: "scroll", deltaY: N } to relay scroll
 * 
 * Usage: node mirror-server.mjs
 * Requires: npm install ws puppeteer-core
 */

import { WebSocketServer, WebSocket } from "ws";
import { launch } from "puppeteer-core";
import { existsSync } from "fs";

const PORT = 3021;
const TARGET = process.env.MIRROR_TARGET || "http://localhost:3020";
const FRAME_INTERVAL = process.env.FRAME_MS ? parseInt(process.env.FRAME_MS) : 500;
const VIEWPORT = { width: 1440, height: 900 };

// Find Chrome
const CHROME_PATHS = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium-browser",
];

let browser = null;
let page = null;
let currentUrl = TARGET;
let frameInterval = null;

const wss = new WebSocketServer({ port: PORT });
const clients = new Set();

console.log(`🪞 Mirror server starting on ws://localhost:${PORT}`);
console.log(`🎯 Target: ${TARGET}`);
console.log(`🖼️  Frame rate: ${1000 / FRAME_INTERVAL} fps`);

// ── Launch headless browser ──────────────────────────────────────────

async function initBrowser() {
  const execPath = CHROME_PATHS.find((p) => existsSync(p));

  if (!execPath) {
    console.error("❌ No Chrome/Chromium found. Install Chrome or set CHROME_PATH.");
    process.exit(1);
  }

  browser = await launch({
    executablePath: execPath,
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      `--window-size=${VIEWPORT.width},${VIEWPORT.height}`,
    ],
  });

  page = await browser.newPage();
  await page.setViewport(VIEWPORT);
  await page.goto(TARGET, { waitUntil: "networkidle2", timeout: 15000 });
  currentUrl = TARGET;
  console.log(`✅ Browser loaded: ${TARGET}`);
}

// ── Frame capture loop ───────────────────────────────────────────────

async function captureFrame() {
  if (!page || clients.size === 0) return;

  try {
    const screenshot = await page.screenshot({
      type: "jpeg",
      quality: 70,
      encoding: "base64",
    });

    const frame = JSON.stringify({
      type: "frame",
      data: screenshot,
      format: "jpeg",
      url: currentUrl,
      ts: Date.now(),
      viewport: VIEWPORT,
    });

    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(frame);
      }
    }
  } catch (err) {
    console.error("Frame capture error:", err.message);
  }
}

function startCapture() {
  if (frameInterval) return;
  frameInterval = setInterval(captureFrame, FRAME_INTERVAL);
  console.log("▶ Capture started");
}

function stopCapture() {
  if (frameInterval) {
    clearInterval(frameInterval);
    frameInterval = null;
    console.log("⏸ Capture paused (no clients)");
  }
}

// ── WebSocket handlers ───────────────────────────────────────────────

wss.on("connection", (ws, req) => {
  const ip = req.socket.remoteAddress;
  console.log(`🔌 Client connected: ${ip}`);
  clients.add(ws);

  // Send initial state
  ws.send(JSON.stringify({
    type: "connected",
    url: currentUrl,
    viewport: VIEWPORT,
    clients: clients.size,
  }));

  // Start capture if first client
  if (clients.size === 1) startCapture();

  ws.on("message", async (raw) => {
    try {
      const msg = JSON.parse(raw.toString());

      switch (msg.type) {
        case "subscribe":
          console.log(`📡 Subscribed: ${msg.channel}`);
          break;

        case "navigate":
          if (msg.url && page) {
            currentUrl = msg.url;
            await page.goto(msg.url, { waitUntil: "networkidle2", timeout: 10000 });
            console.log(`🧭 Navigated: ${msg.url}`);
            // Send immediate frame
            captureFrame();
          }
          break;

        case "click":
          if (page && typeof msg.x === "number" && typeof msg.y === "number") {
            await page.mouse.click(msg.x, msg.y);
            console.log(`🖱️ Click: ${msg.x}, ${msg.y}`);
            setTimeout(captureFrame, 200);
          }
          break;

        case "scroll":
          if (page && typeof msg.deltaY === "number") {
            await page.mouse.wheel({ deltaY: msg.deltaY });
            setTimeout(captureFrame, 100);
          }
          break;

        case "type":
          if (page && msg.text) {
            await page.keyboard.type(msg.text);
            setTimeout(captureFrame, 100);
          }
          break;

        case "resize":
          if (page && msg.width && msg.height) {
            await page.setViewport({ width: msg.width, height: msg.height });
            captureFrame();
          }
          break;

        default:
          console.log(`❓ Unknown message type: ${msg.type}`);
      }
    } catch (err) {
      console.error("Message parse error:", err.message);
    }
  });

  ws.on("close", () => {
    clients.delete(ws);
    console.log(`🔌 Client disconnected. Remaining: ${clients.size}`);
    if (clients.size === 0) stopCapture();
  });
});

// ── Init ─────────────────────────────────────────────────────────────

initBrowser().catch((err) => {
  console.error("Browser init failed:", err.message);
  console.log("⚠️ Running in info-only mode (no capture)");
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down mirror...");
  stopCapture();
  if (browser) await browser.close();
  wss.close();
  process.exit(0);
});

console.log(`🪞 WebSocket server listening on ws://localhost:${PORT}`);
