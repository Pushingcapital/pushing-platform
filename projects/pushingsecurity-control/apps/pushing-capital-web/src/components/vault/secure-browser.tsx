"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";

export default function SecureBrowser() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [html, setHtml] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ resolvedUrl?: string; latency?: number; status?: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const browse = useCallback(async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setHtml(null);

    try {
      const res = await fetch("/api/proxy-browse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to load page");
        return;
      }

      if (data.html) {
        setHtml(data.html);
        setMeta({ resolvedUrl: data.resolvedUrl, latency: data.latency, status: data.status });
        // Update URL bar to resolved URL
        if (data.resolvedUrl) setUrl(data.resolvedUrl);
      }
    } catch (err) {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }, [url]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") browse();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0a0f1a",
        color: "#fff",
        fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "10px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          backgroundColor: "rgba(10,15,26,0.95)",
          backdropFilter: "blur(16px)",
        }}
      >
        <Image src="/brand/p-glass-mark.png" alt="P" width={20} height={20} style={{ borderRadius: "5px", flexShrink: 0 }} />
        
        {/* URL bar */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 14px",
            borderRadius: "9999px",
            backgroundColor: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <span style={{ fontSize: "12px", color: loading ? "#fbbf24" : "#34d399", flexShrink: 0 }}>
            {loading ? "⏳" : "🔒"}
          </span>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter URL to browse securely..."
            style={{
              flex: 1,
              background: "none",
              border: "none",
              outline: "none",
              color: "#fff",
              fontSize: "13px",
              fontFamily: "monospace",
            }}
          />
          {url && (
            <button
              onClick={() => { setUrl(""); setHtml(null); setError(null); }}
              type="button"
              style={{
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.3)",
                cursor: "pointer",
                fontSize: "14px",
                padding: 0,
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          )}
        </div>

        <button
          onClick={browse}
          disabled={loading || !url.trim()}
          type="button"
          style={{
            padding: "8px 14px",
            borderRadius: "9999px",
            border: "none",
            background: loading ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #34d399, #06b6d4)",
            color: loading ? "rgba(255,255,255,0.3)" : "#04111d",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            cursor: loading ? "not-allowed" : "pointer",
            flexShrink: 0,
          }}
        >
          {loading ? "..." : "Go"}
        </button>
      </header>

      {/* Status bar */}
      {meta && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "6px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
            fontSize: "10px",
            color: "rgba(255,255,255,0.25)",
            letterSpacing: "0.08em",
          }}
        >
          <span>Status: {meta.status}</span>
          <span>•</span>
          <span>Latency: {meta.latency}ms</span>
          <span>•</span>
          <span style={{ color: "#34d399" }}>🛡️ Proxied through secure tunnel</span>
        </div>
      )}

      {/* Content area */}
      <div style={{ flex: 1, position: "relative" }}>
        {/* Empty state */}
        {!html && !error && !loading && (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ fontSize: "48px", opacity: 0.2, marginBottom: "16px" }}>🌐</div>
            <h2 style={{ fontSize: "18px", fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>
              Secure Browser
            </h2>
            <p style={{ marginTop: "8px", fontSize: "13px", color: "rgba(255,255,255,0.25)", lineHeight: 1.6, maxWidth: "300px", margin: "8px auto 0" }}>
              Browse any website through pushingSecurity&apos;s encrypted tunnel. Your IP and location are never exposed.
            </p>
            <div style={{ marginTop: "24px", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px" }}>
              {[
                { label: "Experian", url: "https://www.experian.com" },
                { label: "Google", url: "https://www.google.com" },
                { label: "What's My IP", url: "https://api.ipify.org" },
              ].map((q) => (
                <button
                  key={q.label}
                  onClick={() => { setUrl(q.url); }}
                  type="button"
                  style={{
                    padding: "6px 14px",
                    borderRadius: "9999px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    backgroundColor: "rgba(255,255,255,0.03)",
                    color: "rgba(255,255,255,0.4)",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: "24px", animation: "spin 1s linear infinite", display: "inline-block" }}>🔄</div>
            <p style={{ marginTop: "12px", fontSize: "13px", color: "rgba(255,255,255,0.3)" }}>
              Routing through secure tunnel...
            </p>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>⚠️</div>
            <p style={{ fontSize: "14px", color: "#fca5a5" }}>{error}</p>
          </div>
        )}

        {/* Rendered content */}
        {html && (
          <iframe
            ref={iframeRef}
            srcDoc={html}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            style={{
              width: "100%",
              height: "calc(100vh - 100px)",
              border: "none",
              backgroundColor: "#fff",
            }}
            title="Secure Browser"
          />
        )}
      </div>

      {/* Bottom nav */}
      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "space-around",
          padding: "10px 0 env(safe-area-inset-bottom, 10px)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          backgroundColor: "rgba(10,15,26,0.95)",
          backdropFilter: "blur(16px)",
        }}
      >
        {[
          { icon: "🔐", label: "Vault", href: "/vault", active: false },
          { icon: "🌐", label: "Browse", href: "/browse", active: true },
          { icon: "⚙️", label: "Settings", href: "/settings", active: false },
        ].map((n) => (
          <a
            key={n.label}
            href={n.href}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              color: n.active ? "#6ee7b7" : "rgba(255,255,255,0.25)",
              fontSize: "18px",
              textDecoration: "none",
              padding: "4px 16px",
            }}
          >
            <span>{n.icon}</span>
            <span style={{ fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase" }}>{n.label}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}
