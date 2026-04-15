#!/usr/bin/env node
/**
 * experian-handler.mjs
 *
 * Playwright automation handler for Experian login.
 * Runs on GCE fleet nodes via the orchestrator-receiver.
 * Mirrors the client's device fingerprint for stealth.
 *
 * Usage:
 *   node experian-handler.mjs --username <user> --password <pass> [--fingerprint <json>]
 */

import { chromium } from "playwright";

// ── Config ────────────────────────────────────────────────────────────────

const EXPERIAN_URL = "https://www.experian.com";
const EXPERIAN_LOGIN_URL = "https://usa.experian.com/member/myaccount";
const TIMEOUT = 30_000;

// ── Parse CLI args ────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--username" && args[i + 1]) parsed.username = args[++i];
    else if (args[i] === "--password" && args[i + 1]) parsed.password = args[++i];
    else if (args[i] === "--fingerprint" && args[i + 1]) {
      try { parsed.fingerprint = JSON.parse(args[++i]); } catch { parsed.fingerprint = {}; }
    }
    else if (args[i] === "--screenshot-dir" && args[i + 1]) parsed.screenshotDir = args[++i];
  }
  return parsed;
}

// ── Device mirroring ──────────────────────────────────────────────────────

function buildBrowserContext(fingerprint = {}) {
  return {
    viewport: {
      width: fingerprint.innerWidth || 1440,
      height: fingerprint.innerHeight || 900,
    },
    deviceScaleFactor: fingerprint.devicePixelRatio || 2,
    userAgent: fingerprint.userAgent || undefined,
    locale: fingerprint.locale || "en-US",
    timezoneId: fingerprint.timezone || "America/Los_Angeles",
    colorScheme: "light",
    hasTouch: fingerprint.touchSupport || false,
  };
}

// ── Main automation ───────────────────────────────────────────────────────

async function loginToExperian({ username, password, fingerprint = {}, screenshotDir = "/tmp" }) {
  const browser = await chromium.launch({
    headless: true,
    args: [
      "--disable-blink-features=AutomationControlled",
      "--disable-dev-shm-usage",
      "--no-sandbox",
    ],
  });

  const context = await browser.newContext(buildBrowserContext(fingerprint));

  // Stealth patches
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
    // Override chrome automation indicators
    window.chrome = { runtime: {} };
    Object.defineProperty(navigator, "plugins", {
      get: () => [1, 2, 3, 4, 5],
    });
    Object.defineProperty(navigator, "languages", {
      get: () => ["en-US", "en"],
    });
  });

  const page = await context.newPage();
  const log = (msg) => console.log(`[experian] ${new Date().toISOString()} ${msg}`);

  try {
    // Step 1: Navigate to Experian
    log("Navigating to Experian...");
    await page.goto(EXPERIAN_URL, { waitUntil: "domcontentloaded", timeout: TIMEOUT });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screenshotDir}/experian_01_homepage.png` });

    // Step 2: Find and click Sign In
    log("Looking for Sign In link...");
    const signInLink = page.locator('a:has-text("Sign In"), a:has-text("Log In"), [data-testid="sign-in"], a[href*="signin"], a[href*="login"]').first();
    if (await signInLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await signInLink.click();
      await page.waitForTimeout(3000);
    } else {
      // Try direct navigation
      log("Sign In link not found, navigating directly...");
      await page.goto(EXPERIAN_LOGIN_URL, { waitUntil: "domcontentloaded", timeout: TIMEOUT });
      await page.waitForTimeout(3000);
    }
    await page.screenshot({ path: `${screenshotDir}/experian_02_login_page.png` });

    // Step 3: Fill username
    log("Looking for username field...");
    const usernameField = page.locator(
      'input[name="username"], input[id="username"], input[name="email"], input[id="email"], input[type="email"], input[placeholder*="user" i], input[placeholder*="email" i]'
    ).first();

    await usernameField.waitFor({ timeout: TIMEOUT });
    await usernameField.click();
    await page.waitForTimeout(500);
    await usernameField.fill(username);
    log("Username entered.");
    await page.screenshot({ path: `${screenshotDir}/experian_03_username.png` });

    // Step 4: Fill password
    log("Looking for password field...");
    const passwordField = page.locator(
      'input[type="password"], input[name="password"], input[id="password"]'
    ).first();

    await passwordField.waitFor({ timeout: TIMEOUT });
    await passwordField.click();
    await page.waitForTimeout(500);
    await passwordField.fill(password);
    log("Password entered.");

    // Step 5: Submit
    log("Looking for submit button...");
    const submitBtn = page.locator(
      'button[type="submit"], button:has-text("Sign In"), button:has-text("Log In"), input[type="submit"]'
    ).first();

    await submitBtn.waitFor({ timeout: 10000 });
    await page.screenshot({ path: `${screenshotDir}/experian_04_preflight.png` });
    await submitBtn.click();
    log("Login submitted. Waiting for response...");

    // Step 6: Wait for navigation
    await page.waitForTimeout(5000);
    await page.screenshot({ path: `${screenshotDir}/experian_05_post_login.png` });

    // Check for success indicators
    const currentUrl = page.url();
    log(`Post-login URL: ${currentUrl}`);

    // Check for common error indicators
    const errorVisible = await page.locator(
      '.error-message, .alert-danger, [class*="error"], [data-testid*="error"]'
    ).isVisible({ timeout: 3000 }).catch(() => false);

    if (errorVisible) {
      const errorText = await page.locator(
        '.error-message, .alert-danger, [class*="error"]'
      ).first().textContent().catch(() => "Unknown error");
      log(`Login error detected: ${errorText}`);
      return {
        success: false,
        error: errorText,
        url: currentUrl,
        screenshots: ["experian_01_homepage.png", "experian_02_login_page.png", "experian_05_post_login.png"],
      };
    }

    // Check for MFA/2FA
    const mfaVisible = await page.locator(
      'input[name="otp"], input[name="code"], input[placeholder*="code" i], input[placeholder*="verification" i], [class*="mfa"], [class*="verification"]'
    ).isVisible({ timeout: 3000 }).catch(() => false);

    if (mfaVisible) {
      log("MFA/2FA detected. Awaiting code.");
      await page.screenshot({ path: `${screenshotDir}/experian_06_mfa.png` });
      return {
        success: false,
        mfaRequired: true,
        url: currentUrl,
        screenshots: ["experian_05_post_login.png", "experian_06_mfa.png"],
      };
    }

    // Step 7: Extract account data if logged in
    log("Attempting to extract account data...");
    await page.waitForTimeout(2000);

    const pageTitle = await page.title();
    const bodyText = await page.locator("body").textContent().catch(() => "");

    // Look for credit score
    const scoreElement = await page.locator(
      '[class*="score"], [data-testid*="score"], .fico-score, .credit-score'
    ).first().textContent({ timeout: 5000 }).catch(() => null);

    await page.screenshot({ path: `${screenshotDir}/experian_07_dashboard.png`, fullPage: true });

    log("Login automation complete.");

    return {
      success: true,
      url: currentUrl,
      pageTitle,
      creditScore: scoreElement,
      hasAccountAccess: currentUrl.includes("member") || currentUrl.includes("account"),
      screenshots: [
        "experian_01_homepage.png",
        "experian_02_login_page.png",
        "experian_05_post_login.png",
        "experian_07_dashboard.png",
      ],
    };

  } catch (error) {
    log(`Error: ${error.message}`);
    await page.screenshot({ path: `${screenshotDir}/experian_error.png` }).catch(() => {});
    return {
      success: false,
      error: error.message,
      screenshots: ["experian_error.png"],
    };
  } finally {
    await browser.close();
  }
}

// ── Run ───────────────────────────────────────────────────────────────────

const args = parseArgs();

if (!args.username || !args.password) {
  console.error("Usage: node experian-handler.mjs --username <user> --password <pass> [--fingerprint <json>]");
  process.exit(1);
}

loginToExperian(args).then((result) => {
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.success ? 0 : 1);
});
