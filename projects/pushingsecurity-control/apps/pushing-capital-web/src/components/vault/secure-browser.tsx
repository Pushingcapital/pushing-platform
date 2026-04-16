"use client";

import { useState, useRef, useCallback, useEffect } from "react";

type StealthProfile = "chrome" | "safari" | "firefox" | "edge" | "mobile";

interface BrowseResult {
  html: string;
  status: number;
  resolvedUrl: string;
  latency: number;
  profile: string;
  stealth: boolean;
}

const PROFILE_META: Record<StealthProfile, { label: string; icon: string; color: string }> = {
  chrome: { label: "Chrome 131", icon: "🌐", color: "#4285f4" },
  safari: { label: "Safari 18", icon: "🧭", color: "#007aff" },
  firefox: { label: "Firefox 134", icon: "🦊", color: "#ff7139" },
  edge: { label: "Edge 131", icon: "🔷", color: "#0078d7" },
  mobile: { label: "iOS Safari", icon: "📱", color: "#34c759" },
};

const QUICK_SITES = [
  { label: "Experian", url: "https://www.experian.com" },
  { label: "Equifax", url: "https://www.equifax.com" },
  { label: "TransUnion", url: "https://www.transunion.com" },
  { label: "Credit Karma", url: "https://www.creditkarma.com" },
  { label: "CFPB", url: "https://www.consumerfinance.gov" },
];

export default function SecureBrowser() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BrowseResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<StealthProfile>("chrome");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [sessionCount, setSessionCount] = useState(0);
  const [totalLatency, setTotalLatency] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus URL bar
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const browse = useCallback(async (targetUrl?: string) => {
    const u = (targetUrl || url).trim();
    if (!u) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const finalUrl = u.startsWith("http") ? u : `https://${u}`;
      const res = await fetch("/api/proxy-browse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: finalUrl, profile }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to load");
        return;
      }

      if (data.html) {
        setResult(data);
        if (data.resolvedUrl) setUrl(data.resolvedUrl);
        setHistory((h) => [...h.slice(0, historyIndex + 1), data.resolvedUrl || finalUrl]);
        setHistoryIndex((i) => i + 1);
        setSessionCount((c) => c + 1);
        setTotalLatency((t) => t + (data.latency || 0));
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [url, profile, historyIndex]);

  const goBack = () => {
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1;
      setHistoryIndex(newIdx);
      const prevUrl = history[newIdx];
      setUrl(prevUrl);
      browse(prevUrl);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      const newIdx = historyIndex + 1;
      setHistoryIndex(newIdx);
      const nextUrl = history[newIdx];
      setUrl(nextUrl);
      browse(nextUrl);
    }
  };

  const refresh = () => { if (url) browse(url); };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#06090f",
      color: "#e2e8f0",
      fontFamily: "'Space Grotesk', system-ui, sans-serif",
      display: "flex",
      flexDirection: "column",
    }}>

      {/* ── STEALTH STATUS BAR ─────────────────────────────── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "6px 16px",
        background: "rgba(0,0,0,0.6)",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        fontSize: 10,
      }}>
        <span style={{
          display: "flex", alignItems: "center", gap: 6,
          color: "#4ade80", fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "0.15em",
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "#4ade80",
            boxShadow: "0 0 8px #4ade80",
            animation: "pulse 2s infinite",
          }} />
          STEALTH ACTIVE
        </span>
        <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
        <span style={{ color: "rgba(255,255,255,0.3)" }}>
          Profile: {PROFILE_META[profile].icon} {PROFILE_META[profile].label}
        </span>
        <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
        <span style={{ color: "rgba(255,255,255,0.3)" }}>
          {sessionCount} requests · {totalLatency}ms total
        </span>
        <div style={{ flex: 1 }} />
        <span style={{ color: "rgba(255,255,255,0.15)", fontFamily: "'IBM Plex Mono', monospace" }}>
          pushingSecurity / Secure Browse v2
        </span>
      </div>

      {/* ── URL BAR ────────────────────────────────────────── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        background: "rgba(255,255,255,0.02)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        {/* Nav buttons */}
        <button onClick={goBack} disabled={historyIndex <= 0}
          style={{
            ...navBtnStyle,
            opacity: historyIndex > 0 ? 0.6 : 0.15,
            cursor: historyIndex > 0 ? "pointer" : "default",
          }}>←</button>
        <button onClick={goForward} disabled={historyIndex >= history.length - 1}
          style={{
            ...navBtnStyle,
            opacity: historyIndex < history.length - 1 ? 0.6 : 0.15,
            cursor: historyIndex < history.length - 1 ? "pointer" : "default",
          }}>→</button>
        <button onClick={refresh}
          style={{ ...navBtnStyle, opacity: 0.6, cursor: "pointer" }}>⟳</button>

        {/* Shield */}
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: "rgba(74,222,128,0.08)",
          border: "1px solid rgba(74,222,128,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14,
        }}>🛡️</div>

        {/* URL input */}
        <div style={{
          flex: 1, display: "flex", alignItems: "center",
          background: "rgba(0,0,0,0.4)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 10, padding: "0 12px",
          transition: "border-color 0.2s",
        }}>
          <span style={{ fontSize: 10, color: "rgba(74,222,128,0.5)", marginRight: 6, fontWeight: 700 }}>
            {url.startsWith("https") ? "🔒" : "⚠️"}
          </span>
          <input
            ref={inputRef}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") browse(); }}
            placeholder="Enter URL — all traffic routed through stealth proxy"
            style={{
              flex: 1, padding: "10px 0",
              background: "transparent", border: "none", outline: "none",
              color: "#e2e8f0", fontSize: 13,
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          />
          {loading && (
            <div style={{
              width: 14, height: 14,
              border: "2px solid rgba(55,245,241,0.2)",
              borderTop: "2px solid #37f5f1",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }} />
          )}
        </div>

        {/* Go */}
        <button onClick={() => browse()}
          disabled={loading || !url.trim()}
          style={{
            padding: "8px 20px", borderRadius: 10, fontSize: 11,
            fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em",
            background: loading ? "rgba(255,255,255,0.05)" : "rgba(55,245,241,0.1)",
            border: `1px solid ${loading ? "rgba(255,255,255,0.08)" : "rgba(55,245,241,0.25)"}`,
            color: loading ? "rgba(255,255,255,0.3)" : "#37f5f1",
            cursor: loading ? "wait" : "pointer",
            transition: "all 0.2s",
          }}>
          {loading ? "Loading..." : "Go"}
        </button>
      </div>

      {/* ── PROFILE SELECTOR + QUICK SITES ─────────────────── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "6px 12px",
        background: "rgba(0,0,0,0.3)",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        flexWrap: "wrap",
      }}>
        <span style={{
          fontSize: 8, fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "0.25em", color: "rgba(255,255,255,0.2)",
          marginRight: 4,
        }}>Identity:</span>

        {(Object.keys(PROFILE_META) as StealthProfile[]).map((p) => (
          <button key={p} onClick={() => setProfile(p)}
            style={{
              padding: "4px 10px", borderRadius: 6, fontSize: 9,
              fontWeight: 600, border: "1px solid",
              background: profile === p ? `${PROFILE_META[p].color}15` : "transparent",
              borderColor: profile === p ? `${PROFILE_META[p].color}40` : "rgba(255,255,255,0.06)",
              color: profile === p ? PROFILE_META[p].color : "rgba(255,255,255,0.3)",
              cursor: "pointer", transition: "all 0.2s",
            }}>
            {PROFILE_META[p].icon} {PROFILE_META[p].label}
          </button>
        ))}

        <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.06)", margin: "0 4px" }} />

        <span style={{
          fontSize: 8, fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "0.25em", color: "rgba(255,255,255,0.2)",
          marginRight: 4,
        }}>Quick:</span>

        {QUICK_SITES.map((site) => (
          <button key={site.label}
            onClick={() => { setUrl(site.url); browse(site.url); }}
            style={{
              padding: "4px 8px", borderRadius: 6, fontSize: 9,
              fontWeight: 500, border: "1px solid rgba(255,255,255,0.06)",
              background: "transparent", color: "rgba(255,255,255,0.35)",
              cursor: "pointer", transition: "all 0.2s",
            }}>
            {site.label}
          </button>
        ))}
      </div>

      {/* ── VIEWPORT ───────────────────────────────────────── */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {/* Empty state */}
        {!result && !loading && !error && (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 16,
          }}>
            <div style={{
              width: 80, height: 80, borderRadius: 24,
              background: "rgba(55,245,241,0.05)",
              border: "1px solid rgba(55,245,241,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 36,
            }}>🛡️</div>
            <div style={{
              fontSize: 22, fontWeight: 700, color: "rgba(255,255,255,0.6)",
              letterSpacing: "-0.02em",
            }}>Secure Browse</div>
            <div style={{
              fontSize: 12, color: "rgba(255,255,255,0.25)",
              maxWidth: 400, textAlign: "center", lineHeight: 1.6,
            }}>
              All traffic proxied through server-side relay. Your IP, location,
              and device fingerprint are never exposed.
              <br />Select an identity profile and enter a URL to begin.
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 12,
          }}>
            <div style={{
              padding: "12px 24px", borderRadius: 12,
              background: "rgba(244,63,94,0.08)",
              border: "1px solid rgba(244,63,94,0.2)",
              color: "#fb7185", fontSize: 13,
            }}>
              ⚠️ {error}
            </div>
            <button onClick={() => browse()}
              style={{
                padding: "8px 20px", borderRadius: 8,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.5)", fontSize: 11,
                cursor: "pointer", fontWeight: 600,
              }}>
              Retry
            </button>
          </div>
        )}

        {/* Rendered page */}
        {result?.html && (
          <iframe
            ref={iframeRef}
            srcDoc={result.html}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            style={{
              width: "100%", height: "100%", border: "none",
              background: "#fff",
            }}
          />
        )}
      </div>

      {/* ── STATUS BAR ─────────────────────────────────────── */}
      {result && (
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "4px 12px",
          background: "rgba(0,0,0,0.5)",
          borderTop: "1px solid rgba(255,255,255,0.04)",
          fontSize: 9, fontFamily: "'IBM Plex Mono', monospace",
        }}>
          <span style={{
            color: result.status < 400 ? "#4ade80" : "#f43f5e",
            fontWeight: 700,
          }}>
            HTTP {result.status}
          </span>
          <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
          <span style={{ color: "rgba(55,245,241,0.5)" }}>{result.latency}ms</span>
          <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
          <span style={{ color: "rgba(255,255,255,0.25)" }}>
            {PROFILE_META[profile].icon} {PROFILE_META[profile].label}
          </span>
          <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
          <span style={{ color: "rgba(255,255,255,0.2)", maxWidth: 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {result.resolvedUrl}
          </span>
          <div style={{ flex: 1 }} />
          <span style={{ color: "rgba(74,222,128,0.4)", fontWeight: 700 }}>
            STEALTH ✓
          </span>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}

const navBtnStyle: React.CSSProperties = {
  width: 28, height: 28, borderRadius: 8, border: "none",
  background: "rgba(255,255,255,0.04)",
  color: "#e2e8f0", fontSize: 14,
  display: "flex", alignItems: "center", justifyContent: "center",
  transition: "all 0.2s",
};
