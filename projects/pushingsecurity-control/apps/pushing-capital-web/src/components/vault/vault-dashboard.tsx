"use client";

import { useState } from "react";
import Image from "next/image";

// ── Types ──────────────────────────────────────────────────────────────────

type VaultCategory = "passwords" | "documents" | "insurance" | "automotive" | "financial";

type VaultItem = {
  id: string;
  category: VaultCategory;
  label: string;
  detail: string;
  icon: string;
  masked?: boolean;
};

// ── Secure-categories for onboarding ───────────────────────────────────────

const SECURE_CATEGORIES = [
  { key: "passwords", icon: "🔑", label: "Passwords", desc: "Logins & credentials" },
  { key: "documents", icon: "🪪", label: "IDs & Documents", desc: "License, passport, SSN" },
  { key: "insurance", icon: "🛡️", label: "Insurance", desc: "Health, auto, home" },
  { key: "automotive", icon: "🚗", label: "Automotive", desc: "Registration, title, VIN" },
  { key: "financial", icon: "📊", label: "Financial", desc: "Tax returns, W-2s, 1099s" },
  { key: "legal", icon: "⚖️", label: "Legal", desc: "Contracts, NDAs, agreements" },
];

const TABS: { key: VaultCategory | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "passwords", label: "Passwords" },
  { key: "documents", label: "IDs" },
  { key: "insurance", label: "Insurance" },
  { key: "automotive", label: "Auto" },
  { key: "financial", label: "Finance" },
];

// ── Component ──────────────────────────────────────────────────────────────

export default function VaultDashboard({ userName }: { userName?: string }) {
  const [started, setStarted] = useState(false);
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [filter, setFilter] = useState<VaultCategory | "all">("all");
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const name = userName || "there";

  const items = filter === "all" ? vaultItems : vaultItems.filter((i) => i.category === filter);

  const toggle = (id: string) => {
    setRevealed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Welcome / Get Started ────────────────────────────────────────────────

  if (!started) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#0a0f1a",
          color: "#fff",
          fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
        }}
      >
        {/* Header */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "14px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Image src="/brand/p-glass-mark.png" alt="P" width={22} height={22} style={{ borderRadius: "5px" }} />
            <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>
              pushingSecurity
            </span>
          </div>
        </header>

        <div style={{ maxWidth: "420px", margin: "0 auto", padding: "48px 20px 40px", textAlign: "center" }}>
          {/* Shield animation */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "80px",
              height: "80px",
              borderRadius: "24px",
              background: "linear-gradient(135deg, rgba(52,211,153,0.15), rgba(6,182,212,0.1))",
              border: "1px solid rgba(52,211,153,0.2)",
              fontSize: "36px",
              marginBottom: "24px",
              animation: "pulse-shield 2s ease-in-out infinite",
            }}
          >
            🔐
          </div>

          <h1 style={{ fontSize: "24px", fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.3 }}>
            Welcome{name !== "there" ? `, ${name}` : ""}!
          </h1>
          <p style={{ marginTop: "8px", fontSize: "28px", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.2 }}>
            Let&apos;s secure your data.
          </p>

          <p style={{ marginTop: "16px", fontSize: "14px", color: "rgba(255,255,255,0.4)", lineHeight: 1.6, maxWidth: "320px", margin: "16px auto 0" }}>
            Your vault stores passwords, IDs, insurance cards, vehicle docs, and more — all encrypted, all in one place.
          </p>

          {/* Category preview cards */}
          <div style={{ marginTop: "32px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", textAlign: "left" }}>
            {SECURE_CATEGORIES.map((cat) => (
              <div
                key={cat.key}
                style={{
                  padding: "16px 14px",
                  borderRadius: "14px",
                  border: "1px solid rgba(255,255,255,0.06)",
                  backgroundColor: "rgba(255,255,255,0.02)",
                  transition: "background-color 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.backgroundColor = "rgba(255,255,255,0.04)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.backgroundColor = "rgba(255,255,255,0.02)";
                }}
              >
                <span style={{ fontSize: "22px" }}>{cat.icon}</span>
                <p style={{ marginTop: "8px", fontSize: "13px", fontWeight: 600, color: "#fff" }}>{cat.label}</p>
                <p style={{ marginTop: "2px", fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>{cat.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={() => setStarted(true)}
            type="button"
            style={{
              width: "100%",
              marginTop: "28px",
              padding: "16px",
              borderRadius: "9999px",
              border: "none",
              background: "linear-gradient(135deg, #34d399, #06b6d4)",
              color: "#04111d",
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              cursor: "pointer",
              boxShadow: "0 12px 40px rgba(52,211,153,0.25)",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 16px 48px rgba(52,211,153,0.35)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 12px 40px rgba(52,211,153,0.25)";
            }}
          >
            Get Started
          </button>

          <p style={{ marginTop: "16px", fontSize: "11px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em" }}>
            256-bit encrypted · Zero-knowledge · Your data never leaves your vault
          </p>

          <style>{`
            @keyframes pulse-shield {
              0%, 100% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.05); opacity: 0.9; }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // ── Main Vault ───────────────────────────────────────────────────────────

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0a0f1a",
        color: "#fff",
        fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
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
          justifyContent: "space-between",
          padding: "12px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          backgroundColor: "rgba(10,15,26,0.92)",
          backdropFilter: "blur(16px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Image src="/brand/p-glass-mark.png" alt="P" width={24} height={24} style={{ borderRadius: "6px" }} />
          <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)" }}>
            pushingSecurity
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "5px 12px 5px 6px",
            borderRadius: "9999px",
            backgroundColor: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            style={{
              width: "22px",
              height: "22px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #34d399, #06b6d4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "10px",
              fontWeight: 700,
              color: "#04111d",
            }}
          >
            {name[0]?.toUpperCase()}
          </div>
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>{name}</span>
        </div>
      </header>

      {/* Content */}
      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "24px 16px 100px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 600, letterSpacing: "-0.02em" }}>Your Vault</h1>
        <p style={{ marginTop: "4px", fontSize: "13px", color: "rgba(255,255,255,0.3)" }}>
          {items.length} item{items.length !== 1 ? "s" : ""} secured
        </p>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: "4px",
            marginTop: "20px",
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            paddingBottom: "2px",
          }}
        >
          {TABS.map((tab) => {
            const active = filter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                type="button"
                style={{
                  padding: "7px 14px",
                  borderRadius: "9999px",
                  border: active ? "1px solid rgba(52,211,153,0.3)" : "1px solid rgba(255,255,255,0.06)",
                  backgroundColor: active ? "rgba(52,211,153,0.1)" : "transparent",
                  color: active ? "#6ee7b7" : "rgba(255,255,255,0.35)",
                  fontSize: "12px",
                  fontWeight: 500,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s",
                  flexShrink: 0,
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Empty state */}
        {items.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 16px" }}>
            <div style={{ fontSize: "40px", opacity: 0.3, marginBottom: "12px" }}>🔐</div>
            <p style={{ fontSize: "15px", fontWeight: 500, color: "rgba(255,255,255,0.5)" }}>
              {filter === "all" ? "Your vault is empty" : `No ${filter} items yet`}
            </p>
            <p style={{ marginTop: "6px", fontSize: "12px", color: "rgba(255,255,255,0.25)", lineHeight: 1.5 }}>
              Add your first item below to start securing your data.
            </p>
          </div>
        )}

        {/* Items */}
        {items.length > 0 && (
          <div style={{ marginTop: "16px", display: "grid", gap: "6px" }}>
            {items.map((item) => {
              const isRevealed = revealed.has(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => item.masked && toggle(item.id)}
                  role={item.masked ? "button" : undefined}
                  tabIndex={item.masked ? 0 : undefined}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "14px 16px",
                    borderRadius: "14px",
                    border: "1px solid rgba(255,255,255,0.05)",
                    backgroundColor: "rgba(255,255,255,0.02)",
                    cursor: item.masked ? "pointer" : "default",
                    transition: "background-color 0.12s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.backgroundColor = "rgba(255,255,255,0.04)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.backgroundColor = "rgba(255,255,255,0.02)";
                  }}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      backgroundColor: "rgba(255,255,255,0.04)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "18px",
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "14px", fontWeight: 500, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.label}
                    </p>
                    <p style={{ marginTop: "2px", fontSize: "12px", color: "rgba(255,255,255,0.3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.detail}
                    </p>
                  </div>
                  {item.masked && (
                    <div style={{ fontSize: "10px", color: isRevealed ? "#6ee7b7" : "rgba(255,255,255,0.2)", letterSpacing: "0.1em", textTransform: "uppercase", flexShrink: 0 }}>
                      {isRevealed ? "Visible" : "Tap"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Add button */}
        <button
          type="button"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            width: "100%",
            marginTop: "12px",
            padding: "14px",
            borderRadius: "14px",
            border: "2px dashed rgba(255,255,255,0.06)",
            backgroundColor: "transparent",
            color: "rgba(255,255,255,0.25)",
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          + Add to vault
        </button>
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
          { icon: "🔐", label: "Vault", href: "/vault", active: true },
          { icon: "🌐", label: "Browse", href: "/browse", active: false },
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
