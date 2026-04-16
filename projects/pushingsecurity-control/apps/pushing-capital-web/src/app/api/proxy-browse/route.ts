import { NextRequest, NextResponse } from "next/server";

/**
 * Stealth proxy browser — fetches any URL server-side with randomized
 * fingerprints. Client IP never touches destination. Zero flags.
 *
 * POST /api/proxy-browse
 * Body: { url, profile?: "chrome"|"safari"|"firefox"|"mobile", referer?: string }
 */

const BLOCKED_HOSTS = [
  "localhost", "127.0.0.1", "0.0.0.0",
  "169.254.", "10.", "192.168.", "172.16.",
];

// ── Stealth User Agent Pool ──────────────────────────────────────────
const UA_PROFILES: Record<string, { ua: string; accept: string; platform: string; secChUa?: string }> = {
  chrome: {
    ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    platform: "Windows",
    secChUa: '"Chromium";v="131", "Google Chrome";v="131", "Not_A Brand";v="24"',
  },
  safari: {
    ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Safari/605.1.15",
    accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    platform: "macOS",
  },
  firefox: {
    ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0",
    accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    platform: "Windows",
  },
  mobile: {
    ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Mobile/15E148 Safari/604.1",
    accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    platform: "iPhone",
  },
  edge: {
    ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0",
    accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
    platform: "Windows",
    secChUa: '"Microsoft Edge";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
  },
};

const ACCEPT_LANGUAGES = [
  "en-US,en;q=0.9",
  "en-GB,en;q=0.9,en-US;q=0.8",
  "en-US,en;q=0.9,es;q=0.8",
  "en-US,en;q=0.9,fr;q=0.8",
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildHeaders(profile: string, referer?: string) {
  const p = UA_PROFILES[profile] || UA_PROFILES.chrome;
  const headers: Record<string, string> = {
    "User-Agent": p.ua,
    "Accept": p.accept,
    "Accept-Language": randomItem(ACCEPT_LANGUAGES),
    "Accept-Encoding": "gzip, deflate, br",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
    "DNT": "1",
    "Upgrade-Insecure-Requests": "1",
    "Connection": "keep-alive",
  };

  // Chromium client hints
  if (p.secChUa) {
    headers["Sec-CH-UA"] = p.secChUa;
    headers["Sec-CH-UA-Mobile"] = profile === "mobile" ? "?1" : "?0";
    headers["Sec-CH-UA-Platform"] = `"${p.platform}"`;
    headers["Sec-Fetch-Dest"] = "document";
    headers["Sec-Fetch-Mode"] = "navigate";
    headers["Sec-Fetch-Site"] = referer ? "same-origin" : "none";
    headers["Sec-Fetch-User"] = "?1";
  }

  if (referer) {
    headers["Referer"] = referer;
  }

  return headers;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, profile = "chrome", referer } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Missing url" }, { status: 400 });
    }

    let parsed: URL;
    try {
      parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    if (BLOCKED_HOSTS.some((h) => parsed.hostname.includes(h))) {
      return NextResponse.json({ error: "Blocked: internal address" }, { status: 403 });
    }

    const headers = buildHeaders(profile, referer);
    const start = Date.now();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(parsed.toString(), {
      method: "GET",
      headers,
      redirect: "follow",
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const contentType = response.headers.get("content-type") || "";
    const latency = Date.now() - start;

    if (contentType.includes("text/html")) {
      let html = await response.text();
      const base = parsed.origin;

      // Inject <base> for relative URLs
      if (!html.includes("<base")) {
        html = html.replace(
          /<head([^>]*)>/i,
          `<head$1><base href="${base}/" target="_blank">`
        );
      }

      // Strip anti-bot detection scripts
      html = html
        .replace(/<script[^>]*src="[^"]*datadome[^"]*"[^>]*><\/script>/gi, "")
        .replace(/<script[^>]*src="[^"]*perimeterx[^"]*"[^>]*><\/script>/gi, "")
        .replace(/<script[^>]*src="[^"]*fingerprint[^"]*"[^>]*><\/script>/gi, "")
        .replace(/<script[^>]*src="[^"]*captcha[^"]*"[^>]*><\/script>/gi, "");

      return NextResponse.json({
        html,
        status: response.status,
        contentType,
        resolvedUrl: response.url,
        latency,
        profile,
        stealth: true,
      });
    }

    const buffer = await response.arrayBuffer();
    return new NextResponse(buffer, {
      status: response.status,
      headers: {
        "Content-Type": contentType,
        "X-Proxy-Latency": `${latency}ms`,
        "X-Resolved-Url": response.url,
        "X-Stealth-Profile": profile,
      },
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Proxy error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
