#!/usr/bin/env node
/**
 * experian-handler.mjs
 *
 * Stealth Playwright handler for Experian personal credit report.
 * Routes through client's phone IP, clones their device fingerprint,
 * simulates human behavior, persists browser profiles.
 *
 * Usage:
 *   node experian-handler.mjs --username <u> --password <p> \
 *     --exit-node <tailscale-ip> --profile <path> --fingerprint <json>
 */

import { chromium } from "playwright";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const EXPERIAN_URL = "https://www.experian.com";
const TIMEOUT = 30_000;

// ── CLI ───────────────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const p = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i], n = args[i + 1];
    if (a === "--username" && n) p.username = args[++i];
    else if (a === "--password" && n) p.password = args[++i];
    else if (a === "--proxy" && n) p.proxy = args[++i];
    else if (a === "--exit-node" && n) p.exitNode = args[++i];
    else if (a === "--profile" && n) p.profileDir = args[++i];
    else if (a === "--screenshot-dir" && n) p.screenshotDir = args[++i];
    else if (a === "--fingerprint" && n) {
      try { p.fingerprint = JSON.parse(args[++i]); } catch { p.fingerprint = {}; }
    }
  }
  return p;
}

// ── Tailscale IP mirroring ────────────────────────────────────────────────

function setExitNode(ip) {
  try {
    execSync(`sudo tailscale set --exit-node=${ip}`, { timeout: 15000 });
    const actual = execSync("curl -s --max-time 10 https://api.ipify.org", { encoding: "utf-8" }).trim();
    log(`Exit IP: ${actual}`);
    return actual;
  } catch (e) {
    log(`Exit node failed: ${e.message}`);
    return null;
  }
}

function clearExitNode() {
  try { execSync("sudo tailscale set --exit-node=", { timeout: 10000 }); } catch {}
}

// ── Human behavior ────────────────────────────────────────────────────────

function log(msg) {
  console.log(`[experian] ${new Date().toISOString()} ${msg}`);
}

/** Type like a human — variable speed, occasional pauses, typo hesitation */
async function humanType(el, text, page) {
  await el.click();
  await sleep(300 + rand(400));

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    // Occasional micro-pause (thinking)
    if (rand(100) < 8) await sleep(400 + rand(800));
    await el.press(char, { delay: 0 });
    await sleep(80 + rand(180)); // keystroke interval
  }
  await sleep(200 + rand(300)); // post-type pause
}

/** Move mouse along a Bézier curve — looks human */
async function humanMouse(page, x, y) {
  const steps = 15 + Math.floor(rand(20));
  const fromX = 100 + rand(200);
  const fromY = 100 + rand(200);
  const cpX = fromX + (x - fromX) * 0.4 + (rand(1) - 0.5) * 120;
  const cpY = fromY + (y - fromY) * 0.4 + (rand(1) - 0.5) * 120;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const px = (1 - t) ** 2 * fromX + 2 * (1 - t) * t * cpX + t ** 2 * x;
    const py = (1 - t) ** 2 * fromY + 2 * (1 - t) * t * cpY + t ** 2 * y;
    await page.mouse.move(px, py);
    await sleep(4 + rand(12));
  }
}

/** Scroll page naturally */
async function humanScroll(page, distance = 300) {
  const steps = 5 + Math.floor(rand(8));
  const perStep = distance / steps;
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, perStep + rand(20) - 10);
    await sleep(30 + rand(50));
  }
  await sleep(200 + rand(400));
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function rand(max) { return Math.random() * max; }

// ── Context builder ───────────────────────────────────────────────────────

function buildContext(fp = {}) {
  const ctx = {
    viewport: { width: fp.innerWidth || 414, height: fp.innerHeight || 896 },
    deviceScaleFactor: fp.devicePixelRatio || 3,
    userAgent: fp.userAgent || "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1",
    locale: fp.locale || "en-US",
    timezoneId: fp.timezone || "America/Los_Angeles",
    hasTouch: fp.touchSupport ?? true,
    isMobile: (fp.maxTouchPoints || 0) > 0,
    colorScheme: "light",
    geolocation: undefined,
    permissions: ["geolocation"],
  };
  return ctx;
}

// ── Stealth patches ───────────────────────────────────────────────────────

async function applyStealthPatches(context, fp = {}) {
  await context.addInitScript((fingerprint) => {
    // WebDriver
    Object.defineProperty(navigator, "webdriver", { get: () => false });
    delete navigator.__proto__.webdriver;

    // Chrome runtime
    window.chrome = {
      runtime: { connect: () => {}, sendMessage: () => {}, onMessage: { addListener: () => {} } },
      loadTimes: () => ({}),
      csi: () => ({}),
    };

    // Plugins (mimic real browser)
    Object.defineProperty(navigator, "plugins", {
      get: () => {
        const plugins = [
          { name: "Chrome PDF Plugin", filename: "internal-pdf-viewer" },
          { name: "Chrome PDF Viewer", filename: "mhjfbmdgcfjbbpaeojofohoefgiehjai" },
          { name: "Native Client", filename: "internal-nacl-plugin" },
        ];
        plugins.length = 3;
        return plugins;
      },
    });

    // Languages
    if (fingerprint.languages) {
      Object.defineProperty(navigator, "languages", { get: () => fingerprint.languages });
    }

    // Hardware concurrency
    if (fingerprint.hardwareConcurrency) {
      Object.defineProperty(navigator, "hardwareConcurrency", { get: () => fingerprint.hardwareConcurrency });
    }

    // Device memory
    if (fingerprint.deviceMemory) {
      Object.defineProperty(navigator, "deviceMemory", { get: () => fingerprint.deviceMemory });
    }

    // Max touch points
    if (fingerprint.maxTouchPoints) {
      Object.defineProperty(navigator, "maxTouchPoints", { get: () => fingerprint.maxTouchPoints });
    }

    // Platform
    if (fingerprint.platform) {
      Object.defineProperty(navigator, "platform", { get: () => fingerprint.platform });
    }

    // Vendor
    if (fingerprint.vendor) {
      Object.defineProperty(navigator, "vendor", { get: () => fingerprint.vendor });
    }

    // WebGL spoofing
    const getParameterOrig = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function (param) {
      if (param === 37445) return fingerprint.gpuVendor || "Apple Inc.";
      if (param === 37446) return fingerprint.gpuRenderer || "Apple GPU";
      return getParameterOrig.call(this, param);
    };

    // Permissions API spoof
    const origQuery = window.Permissions?.prototype?.query;
    if (origQuery) {
      window.Permissions.prototype.query = (parameters) =>
        parameters.name === "notifications"
          ? Promise.resolve({ state: Notification.permission })
          : origQuery.call(window.Permissions.prototype, parameters);
    }

    // Connection API
    if (fingerprint.connectionType) {
      Object.defineProperty(navigator, "connection", {
        get: () => ({
          effectiveType: fingerprint.connectionType,
          downlink: fingerprint.downlink || 10,
          rtt: fingerprint.rtt || 50,
          saveData: fingerprint.saveData || false,
        }),
      });
    }
  }, fp);
}

// ── Main ──────────────────────────────────────────────────────────────────

async function run(opts) {
  const { username, password, fingerprint = {}, screenshotDir = "/tmp", proxy, exitNode, profileDir } = opts;

  // Step 0: IP mirroring
  if (exitNode) setExitNode(exitNode);

  const launchOpts = {
    headless: true,
    args: [
      "--disable-blink-features=AutomationControlled",
      "--disable-dev-shm-usage",
      "--no-sandbox",
      "--disable-infobars",
      "--disable-extensions",
      "--disable-gpu",
      "--window-size=414,896",
    ],
  };
  if (proxy) launchOpts.proxy = { server: proxy };

  const browser = await chromium.launch(launchOpts);

  // Load persisted profile if exists
  const storagePath = profileDir ? path.join(profileDir, "storage.json") : null;
  const contextOpts = buildContext(fingerprint);
  if (storagePath && fs.existsSync(storagePath)) {
    contextOpts.storageState = storagePath;
    log("Loaded persisted profile.");
  }

  const context = await browser.newContext(contextOpts);
  await applyStealthPatches(context, fingerprint);
  const page = await context.newPage();

  // Inject realistic mouse trail listener
  await page.evaluate(() => {
    document.addEventListener("mousemove", () => {}, { passive: true });
  });

  try {
    // ── Navigate ──────────────────────────────────────────────────────
    log("Navigating to Experian...");
    await page.goto(EXPERIAN_URL, { waitUntil: "domcontentloaded", timeout: TIMEOUT });
    await sleep(2000 + rand(1500));
    await humanScroll(page, 100);
    await page.screenshot({ path: `${screenshotDir}/01_homepage.png` });

    // ── Find Sign In ──────────────────────────────────────────────────
    log("Looking for Sign In...");
    const signIn = page.locator('a:has-text("Sign In"), a:has-text("Log In"), a[href*="login"], a[href*="signin"]').first();
    if (await signIn.isVisible({ timeout: 5000 }).catch(() => false)) {
      const box = await signIn.boundingBox();
      if (box) await humanMouse(page, box.x + box.width / 2, box.y + box.height / 2);
      await sleep(200 + rand(300));
      await signIn.click();
      await sleep(3000 + rand(2000));
    } else {
      await page.goto("https://usa.experian.com/login", { waitUntil: "domcontentloaded", timeout: TIMEOUT });
      await sleep(3000 + rand(2000));
    }
    await page.screenshot({ path: `${screenshotDir}/02_login.png` });

    // ── Fill username ─────────────────────────────────────────────────
    log("Entering username...");
    const userField = page.locator(
      'input[name="username"], input[id="username"], input[name="email"], input[id="email"], input[type="email"]'
    ).first();
    await userField.waitFor({ timeout: TIMEOUT });
    const ub = await userField.boundingBox();
    if (ub) await humanMouse(page, ub.x + ub.width / 2, ub.y + ub.height / 2);
    await humanType(userField, username, page);
    await page.screenshot({ path: `${screenshotDir}/03_username.png` });

    // ── Fill password ─────────────────────────────────────────────────
    log("Entering password...");
    const passField = page.locator('input[type="password"]').first();
    await passField.waitFor({ timeout: TIMEOUT });
    const pb = await passField.boundingBox();
    if (pb) await humanMouse(page, pb.x + pb.width / 2, pb.y + pb.height / 2);
    await sleep(400 + rand(600));
    await humanType(passField, password, page);

    // ── Submit ────────────────────────────────────────────────────────
    log("Submitting...");
    const submitBtn = page.locator(
      'button[type="submit"], button:has-text("Sign In"), button:has-text("Log In"), input[type="submit"]'
    ).first();
    await submitBtn.waitFor({ timeout: 10000 });
    const sb = await submitBtn.boundingBox();
    if (sb) await humanMouse(page, sb.x + sb.width / 2, sb.y + sb.height / 2);
    await sleep(300 + rand(400));
    await page.screenshot({ path: `${screenshotDir}/04_preflight.png` });
    await submitBtn.click();
    log("Login submitted.");
    await sleep(5000 + rand(3000));
    await page.screenshot({ path: `${screenshotDir}/05_response.png` });

    const url = page.url();
    log(`Post-login: ${url}`);

    // ── Check for MFA ─────────────────────────────────────────────────
    const mfa = await page.locator(
      'input[name="otp"], input[name="code"], input[placeholder*="code" i], input[placeholder*="verification" i]'
    ).isVisible({ timeout: 3000 }).catch(() => false);

    if (mfa) {
      log("MFA detected.");
      await page.screenshot({ path: `${screenshotDir}/06_mfa.png` });
      return { success: false, mfaRequired: true, url };
    }

    // ── Check for errors ──────────────────────────────────────────────
    const errEl = page.locator('.error-message, .alert-danger, [class*="error"]').first();
    if (await errEl.isVisible({ timeout: 2000 }).catch(() => false)) {
      const errText = await errEl.textContent().catch(() => "Login failed");
      log(`Error: ${errText}`);
      return { success: false, error: errText, url };
    }

    // ── Parse credit report ───────────────────────────────────────────
    log("Parsing credit report...");
    await sleep(2000 + rand(2000));
    await humanScroll(page, 500);

    const report = await page.evaluate(() => {
      const getText = (sel) => document.querySelector(sel)?.textContent?.trim() || null;
      const getAll = (sel) => [...document.querySelectorAll(sel)].map(el => el.textContent?.trim());

      // FICO score — look for large number in score-related elements
      let ficoScore = null;
      const scoreEls = document.querySelectorAll('[class*="score"], [class*="Score"], [data-testid*="score"]');
      for (const el of scoreEls) {
        const num = parseInt(el.textContent?.match(/\b([3-8]\d{2})\b/)?.[1] || "");
        if (num >= 300 && num <= 850) { ficoScore = num; break; }
      }

      // Also try raw page scan for 3-digit score
      if (!ficoScore) {
        const bodyText = document.body.textContent || "";
        const scoreMatch = bodyText.match(/FICO[^\d]*(\d{3})/i) || bodyText.match(/score[^\d]*(\d{3})/i);
        if (scoreMatch) {
          const n = parseInt(scoreMatch[1]);
          if (n >= 300 && n <= 850) ficoScore = n;
        }
      }

      // Accounts / tradelines
      const accounts = [];
      const accountCards = document.querySelectorAll('[class*="account"], [class*="tradeline"], [class*="Account"]');
      accountCards.forEach(card => {
        const text = card.textContent || "";
        const balanceMatch = text.match(/\$[\d,]+\.?\d*/);
        accounts.push({
          rawText: text.substring(0, 300),
          balance: balanceMatch ? balanceMatch[0] : null,
        });
      });

      // Inquiries
      const inquiries = [];
      const inquiryEls = document.querySelectorAll('[class*="inquiry"], [class*="Inquiry"]');
      inquiryEls.forEach(el => {
        inquiries.push({ rawText: el.textContent?.trim().substring(0, 200) });
      });

      return {
        ficoScore,
        pageTitle: document.title,
        url: window.location.href,
        accountCount: accounts.length,
        accounts: accounts.slice(0, 30),
        inquiryCount: inquiries.length,
        inquiries: inquiries.slice(0, 20),
        fullText: document.body.innerText?.substring(0, 10000),
      };
    });

    await page.screenshot({ path: `${screenshotDir}/07_dashboard.png`, fullPage: true });
    log(`FICO: ${report.ficoScore || "not found"} | Accounts: ${report.accountCount} | Inquiries: ${report.inquiryCount}`);

    // ── Persist session ───────────────────────────────────────────────
    if (storagePath) {
      fs.mkdirSync(path.dirname(storagePath), { recursive: true });
      await context.storageState({ path: storagePath });
      log("Profile saved.");
    }

    return { success: true, report };

  } catch (error) {
    log(`Error: ${error.message}`);
    await page.screenshot({ path: `${screenshotDir}/error.png` }).catch(() => {});
    return { success: false, error: error.message };
  } finally {
    await browser.close();
    if (exitNode) clearExitNode();
  }
}

// ── Entry ─────────────────────────────────────────────────────────────────

const args = parseArgs();
if (!args.username || !args.password) {
  console.error("Usage: node experian-handler.mjs --username <u> --password <p> [options]");
  process.exit(1);
}

run(args).then(r => {
  console.log(JSON.stringify(r, null, 2));
  process.exit(r.success ? 0 : 1);
});
