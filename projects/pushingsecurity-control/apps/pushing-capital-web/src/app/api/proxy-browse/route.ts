import { NextRequest, NextResponse } from "next/server";

/**
 * Secure proxy browser — fetches any URL server-side so the client's IP
 * is never exposed to the destination. Traffic exits from the fleet node's IP.
 *
 * POST /api/proxy-browse
 * Body: { url: "https://example.com" }
 *
 * Returns: { html, status, headers, resolvedUrl, exitIp }
 */

const BLOCKED_HOSTS = [
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "169.254.",
  "10.",
  "192.168.",
  "172.16.",
];

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Missing url" }, { status: 400 });
    }

    // Validate URL
    let parsed: URL;
    try {
      parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    // Block internal network access
    if (BLOCKED_HOSTS.some((h) => parsed.hostname.includes(h))) {
      return NextResponse.json({ error: "Blocked: internal address" }, { status: 403 });
    }

    // Fetch through server (fleet node IP)
    const start = Date.now();
    const response = await fetch(parsed.toString(), {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "identity",
      },
      redirect: "follow",
    });

    const contentType = response.headers.get("content-type") || "";
    const latency = Date.now() - start;

    // For HTML pages, rewrite relative URLs to absolute
    if (contentType.includes("text/html")) {
      let html = await response.text();
      const base = parsed.origin;

      // Inject <base> tag so relative links resolve correctly
      if (!html.includes("<base")) {
        html = html.replace(
          /<head([^>]*)>/i,
          `<head$1><base href="${base}/" target="_blank">`
        );
      }

      return NextResponse.json({
        html,
        status: response.status,
        contentType,
        resolvedUrl: response.url,
        latency,
      });
    }

    // For non-HTML (images, JSON, etc.), return raw
    const buffer = await response.arrayBuffer();
    return new NextResponse(buffer, {
      status: response.status,
      headers: {
        "Content-Type": contentType,
        "X-Proxy-Latency": `${latency}ms`,
        "X-Resolved-Url": response.url,
      },
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Proxy error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
