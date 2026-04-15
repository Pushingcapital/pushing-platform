"use client";

import { useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────

interface CreditAccount {
  creditor: string;
  type: string;
  balance: number;
  limit: number;
  status: string;
  utilization: number;
  paymentHistory: ("ok" | "late" | "miss" | "na")[];
}

interface CreditInquiry {
  creditor: string;
  date: string;
  type: "hard" | "soft";
}

interface CreditReport {
  ficoScore: number;
  scoreDate: string;
  scoreFactors: { label: string; impact: "positive" | "negative" }[];
  accounts: CreditAccount[];
  inquiries: CreditInquiry[];
  totalDebt: number;
  totalAvailable: number;
  overallUtilization: number;
}

// ── Score color ───────────────────────────────────────────────────────────

function scoreColor(s: number) {
  if (s >= 740) return "#34d399";
  if (s >= 670) return "#fbbf24";
  if (s >= 580) return "#f97316";
  return "#ef4444";
}

function scoreLabel(s: number) {
  if (s >= 800) return "Exceptional";
  if (s >= 740) return "Very Good";
  if (s >= 670) return "Good";
  if (s >= 580) return "Fair";
  return "Poor";
}

function gradientForUtil(u: number) {
  if (u <= 30) return "linear-gradient(90deg, #34d399, #06b6d4)";
  if (u <= 50) return "linear-gradient(90deg, #fbbf24, #f97316)";
  return "linear-gradient(90deg, #f97316, #ef4444)";
}

// ── Component ─────────────────────────────────────────────────────────────

export default function ClarityDashboard({ report }: { report: CreditReport | null }) {
  const [tab, setTab] = useState<"overview" | "accounts" | "inquiries">("overview");

  // Demo data if no report provided
  const data: CreditReport = report || {
    ficoScore: 742,
    scoreDate: "2026-04-15",
    scoreFactors: [
      { label: "100% on-time payments", impact: "positive" },
      { label: "Low credit utilization (12%)", impact: "positive" },
      { label: "Long credit history (7 years)", impact: "positive" },
      { label: "Recent hard inquiry", impact: "negative" },
      { label: "Limited credit mix", impact: "negative" },
    ],
    accounts: [
      { creditor: "Chase Sapphire Preferred", type: "revolving", balance: 1243, limit: 15000, status: "current", utilization: 8, paymentHistory: ["ok","ok","ok","ok","ok","ok","ok","ok","ok","ok","ok","ok"] },
      { creditor: "Amex Gold", type: "revolving", balance: 3890, limit: 20000, status: "current", utilization: 19, paymentHistory: ["ok","ok","ok","ok","ok","ok","ok","ok","ok","ok","ok","ok"] },
      { creditor: "Capital One Quicksilver", type: "revolving", balance: 0, limit: 8000, status: "current", utilization: 0, paymentHistory: ["ok","ok","ok","ok","ok","ok","ok","ok","ok","ok","ok","ok"] },
      { creditor: "Tesla Auto Loan", type: "installment", balance: 28450, limit: 45000, status: "current", utilization: 63, paymentHistory: ["ok","ok","ok","ok","ok","ok","ok","ok","ok","ok","ok","ok"] },
      { creditor: "SoFi Student Loan", type: "installment", balance: 12000, limit: 35000, status: "current", utilization: 34, paymentHistory: ["ok","ok","ok","ok","ok","late","ok","ok","ok","ok","ok","ok"] },
    ],
    inquiries: [
      { creditor: "Tesla Financial", date: "2026-03-12", type: "hard" },
      { creditor: "Chase Bank", date: "2025-11-05", type: "hard" },
      { creditor: "Amex", date: "2025-08-20", type: "hard" },
    ],
    totalDebt: 45583,
    totalAvailable: 123000,
    overallUtilization: 12,
  };

  const sc = scoreColor(data.ficoScore);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0a0f1a", color: "#fff", fontFamily: "var(--font-space-grotesk), system-ui, sans-serif" }}>
      {/* Header */}
      <header style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", margin: 0 }}>pushingSecurity</p>
          <h1 style={{ fontSize: "18px", fontWeight: 700, margin: "4px 0 0", letterSpacing: "-0.02em" }}>CLARITY</h1>
        </div>
        <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)" }}>Last pulled: {data.scoreDate}</span>
      </header>

      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "20px 16px 120px" }}>
        {/* ── Score Ring ─────────────────────────────────────────── */}
        <div style={{ textAlign: "center", margin: "20px 0 30px" }}>
          <div style={{
            width: "180px", height: "180px", borderRadius: "50%", margin: "0 auto",
            background: `conic-gradient(${sc} ${(data.ficoScore - 300) / 550 * 100}%, rgba(255,255,255,0.05) 0%)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 0 60px ${sc}22, 0 0 120px ${sc}11`,
          }}>
            <div style={{
              width: "150px", height: "150px", borderRadius: "50%",
              backgroundColor: "#0a0f1a", display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontSize: "42px", fontWeight: 800, color: sc, letterSpacing: "-0.04em" }}>
                {data.ficoScore}
              </span>
              <span style={{ fontSize: "11px", color: sc, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                {scoreLabel(data.ficoScore)}
              </span>
            </div>
          </div>

          <p style={{ marginTop: "12px", fontSize: "11px", color: "rgba(255,255,255,0.25)" }}>
            FICO® Score · 300-850 range
          </p>
        </div>

        {/* ── Quick stats ────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "24px" }}>
          {[
            { label: "Utilization", value: `${data.overallUtilization}%`, color: data.overallUtilization <= 30 ? "#34d399" : "#fbbf24" },
            { label: "Accounts", value: String(data.accounts.length), color: "#818cf8" },
            { label: "Inquiries", value: String(data.inquiries.length), color: data.inquiries.length <= 2 ? "#34d399" : "#fbbf24" },
          ].map(s => (
            <div key={s.label} style={{
              borderRadius: "14px", border: "1px solid rgba(255,255,255,0.06)",
              backgroundColor: "rgba(255,255,255,0.02)", padding: "14px 12px", textAlign: "center",
            }}>
              <p style={{ fontSize: "22px", fontWeight: 700, color: s.color, margin: 0 }}>{s.value}</p>
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", marginTop: "4px", letterSpacing: "0.1em", textTransform: "uppercase" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Score Factors ──────────────────────────────────────── */}
        <div style={{ marginBottom: "24px" }}>
          <h3 style={{ fontSize: "13px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "12px" }}>
            Score Factors
          </h3>
          {data.scoreFactors.map((f, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "10px 14px", borderRadius: "10px", marginBottom: "6px",
              backgroundColor: f.impact === "positive" ? "rgba(52,211,153,0.04)" : "rgba(239,68,68,0.04)",
              border: `1px solid ${f.impact === "positive" ? "rgba(52,211,153,0.1)" : "rgba(239,68,68,0.1)"}`,
            }}>
              <span style={{ fontSize: "14px" }}>{f.impact === "positive" ? "✅" : "⚠️"}</span>
              <span style={{ fontSize: "13px", color: f.impact === "positive" ? "#6ee7b7" : "#fca5a5" }}>{f.label}</span>
            </div>
          ))}
        </div>

        {/* ── Tabs ───────────────────────────────────────────────── */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          {(["overview", "accounts", "inquiries"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} type="button" style={{
              flex: 1, padding: "10px 0", borderRadius: "10px",
              border: tab === t ? "1px solid rgba(52,211,153,0.3)" : "1px solid rgba(255,255,255,0.06)",
              backgroundColor: tab === t ? "rgba(52,211,153,0.08)" : "transparent",
              color: tab === t ? "#6ee7b7" : "rgba(255,255,255,0.3)",
              fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase",
              cursor: "pointer",
            }}>
              {t}
            </button>
          ))}
        </div>

        {/* ── Overview tab ───────────────────────────────────────── */}
        {tab === "overview" && (
          <div>
            <div style={{ borderRadius: "14px", border: "1px solid rgba(255,255,255,0.06)", backgroundColor: "rgba(255,255,255,0.02)", padding: "16px", marginBottom: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>Total Debt</span>
                <span style={{ fontSize: "14px", fontWeight: 700 }}>${data.totalDebt.toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>Available Credit</span>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#34d399" }}>${data.totalAvailable.toLocaleString()}</span>
              </div>
              <div style={{ width: "100%", height: "6px", borderRadius: "3px", backgroundColor: "rgba(255,255,255,0.06)", overflow: "hidden", marginTop: "12px" }}>
                <div style={{ width: `${data.overallUtilization}%`, height: "100%", borderRadius: "3px", background: gradientForUtil(data.overallUtilization), transition: "width 1s ease" }} />
              </div>
              <p style={{ marginTop: "6px", fontSize: "10px", color: "rgba(255,255,255,0.2)", textAlign: "right" }}>{data.overallUtilization}% utilized</p>
            </div>
          </div>
        )}

        {/* ── Accounts tab ───────────────────────────────────────── */}
        {tab === "accounts" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {data.accounts.map((a, i) => (
              <div key={i} style={{
                borderRadius: "14px", border: "1px solid rgba(255,255,255,0.06)",
                backgroundColor: "rgba(255,255,255,0.02)", padding: "14px 16px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: 600, margin: 0 }}>{a.creditor}</p>
                    <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", margin: "2px 0 0", letterSpacing: "0.1em", textTransform: "uppercase" }}>{a.type}</p>
                  </div>
                  <span style={{
                    padding: "3px 10px", borderRadius: "9999px", fontSize: "10px", fontWeight: 600,
                    backgroundColor: a.status === "current" ? "rgba(52,211,153,0.1)" : "rgba(239,68,68,0.1)",
                    color: a.status === "current" ? "#34d399" : "#ef4444",
                  }}>
                    {a.status}
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "8px" }}>
                  <span>Balance: <strong style={{ color: "#fff" }}>${a.balance.toLocaleString()}</strong></span>
                  {a.type === "revolving" && <span>Limit: ${a.limit.toLocaleString()}</span>}
                </div>

                {a.type === "revolving" && (
                  <div style={{ width: "100%", height: "4px", borderRadius: "2px", backgroundColor: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                    <div style={{ width: `${a.utilization}%`, height: "100%", borderRadius: "2px", background: gradientForUtil(a.utilization) }} />
                  </div>
                )}

                {/* Payment history grid */}
                <div style={{ display: "flex", gap: "3px", marginTop: "10px" }}>
                  {a.paymentHistory.map((p, j) => (
                    <div key={j} style={{
                      flex: 1, height: "6px", borderRadius: "2px",
                      backgroundColor: p === "ok" ? "#34d399" : p === "late" ? "#fbbf24" : p === "miss" ? "#ef4444" : "rgba(255,255,255,0.04)",
                    }} />
                  ))}
                </div>
                <p style={{ margin: "4px 0 0", fontSize: "9px", color: "rgba(255,255,255,0.15)", textAlign: "right" }}>12-mo payment history</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Inquiries tab ──────────────────────────────────────── */}
        {tab === "inquiries" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {data.inquiries.map((inq, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "12px 16px", borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.06)", backgroundColor: "rgba(255,255,255,0.02)",
              }}>
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 600, margin: 0 }}>{inq.creditor}</p>
                  <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", margin: "2px 0 0" }}>{inq.date}</p>
                </div>
                <span style={{
                  padding: "3px 10px", borderRadius: "9999px", fontSize: "9px", fontWeight: 600,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  backgroundColor: inq.type === "hard" ? "rgba(239,68,68,0.08)" : "rgba(52,211,153,0.08)",
                  color: inq.type === "hard" ? "#fca5a5" : "#6ee7b7",
                }}>
                  {inq.type}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <nav style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        display: "flex", justifyContent: "space-around",
        padding: "10px 0 env(safe-area-inset-bottom, 10px)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        backgroundColor: "rgba(10,15,26,0.95)", backdropFilter: "blur(16px)",
      }}>
        {[
          { icon: "🔐", label: "Vault", href: "/vault" },
          { icon: "📊", label: "Clarity", href: "/clarity", active: true },
          { icon: "🌐", label: "Browse", href: "/browse" },
          { icon: "⚙️", label: "Settings", href: "/settings" },
        ].map(n => (
          <a key={n.label} href={n.href} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
            color: n.active ? "#6ee7b7" : "rgba(255,255,255,0.25)",
            fontSize: "18px", textDecoration: "none", padding: "4px 12px",
          }}>
            <span>{n.icon}</span>
            <span style={{ fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase" }}>{n.label}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}
