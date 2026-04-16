import type { Metadata } from "next";
import Image from "next/image";
import { ActionLink } from "@/components/ui/action-link";

export const metadata: Metadata = {
  title: "pushingSecurity — Secure Access for Verified Clients",
  description:
    "pushingSecurity by Pushing Capital. Zero-trust security infrastructure with credit intelligence, identity vault, and secure browsing.",
};

/* ── Inline SVG icons ────────────────────────────────────────────────── */

function ShieldIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="h-7 w-7"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="h-7 w-7"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
      />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="h-7 w-7"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A9.015 9.015 0 003 12c0-1.605.42-3.113 1.157-4.418"
      />
    </svg>
  );
}

function FingerPrintIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="h-5 w-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a48.667 48.667 0 00-1.488 8.074m8.738-14.86a7.5 7.5 0 00-4.606 2.608m0 0a48.485 48.485 0 00-1.577 14.468m6.183-12.637a7.464 7.464 0 013.25-.75c.642 0 1.266.08 1.862.232M12 12.75a48.354 48.354 0 00-1.327 10.442"
      />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="h-5 w-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
      />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="h-5 w-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

function CheckBadgeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="h-5 w-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
      />
    </svg>
  );
}

/* ── Service card data ───────────────────────────────────────────────── */

const services = [
  {
    icon: <ShieldIcon />,
    title: "Credit Intelligence",
    description:
      "AI-powered credit report analysis. Experian and TransUnion data parsed with Google Vision OCR and Document AI for instant insights.",
    features: ["FICO Score Tracking", "Report Comparison", "Dispute Generator"],
    gradient: "from-cyan-400/20 to-teal-400/20",
    borderGlow: "rgba(55,245,241,0.15)",
  },
  {
    icon: <LockIcon />,
    title: "Identity Vault",
    description:
      "Bank-grade encrypted document storage. Upload driver's licenses, contracts, and sensitive documents with OCR-powered field extraction.",
    features: ["Document OCR", "E-Sign (DocuSign)", "Audit Log"],
    gradient: "from-violet-400/20 to-purple-400/20",
    borderGlow: "rgba(139,92,246,0.15)",
  },
  {
    icon: <GlobeIcon />,
    title: "Secure Browse",
    description:
      "Anonymized, proxied web browsing. Access credit bureaus and financial institutions through our zero-trust tunnel.",
    features: ["Proxy Shield", "Session Isolation", "Zero-Log Policy"],
    gradient: "from-emerald-400/20 to-green-400/20",
    borderGlow: "rgba(52,211,153,0.15)",
  },
];

const trustBadges = [
  { icon: <FingerPrintIcon />, label: "Zero Trust Architecture" },
  { icon: <LockIcon />, label: "Bank-Grade Encryption" },
  { icon: <CheckBadgeIcon />, label: "SOC-2 Ready" },
  { icon: <EyeIcon />, label: "Real-Time Monitoring" },
];

/* ── Component ───────────────────────────────────────────────────────── */

export default function CustomerHomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* ── Vault background ──────────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/brand/vault-bg.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1aee] via-[#0a0f1acc] to-[#0a0f1af0]" />
      </div>

      {/* ── Ambient orbs ────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 z-[1]">
        <div className="absolute left-1/2 top-[12%] h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(55,245,241,0.14),transparent_70%)] blur-3xl" />
        <div className="absolute right-[10%] top-[60%] h-[20rem] w-[20rem] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.08),transparent_70%)] blur-3xl" />
        <div className="absolute left-[5%] top-[80%] h-[16rem] w-[16rem] rounded-full bg-[radial-gradient(circle,rgba(52,211,153,0.06),transparent_70%)] blur-3xl" />
      </div>

      {/* ── Content ──────────────────────────────────────────────── */}
      <div className="relative z-10">
        {/* ── NAV ──────────────────────────────────────────────── */}
        <nav className="fixed left-4 right-4 top-4 z-50 flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-xl sm:left-8 sm:right-8">
          <div className="flex items-center gap-3">
            <div className="overflow-hidden rounded-xl border border-white/10 bg-black/30 p-1">
              <Image
                src="/brand/p-glass-mark.png"
                alt="P"
                width={32}
                height={32}
                className="h-8 w-8 rounded-lg object-cover"
                priority
              />
            </div>
            <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-white/80">
              pushingSecurity
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/vault"
              className="hidden text-[11px] font-medium uppercase tracking-[0.2em] text-white/50 transition-colors hover:text-white/80 sm:block"
            >
              Vault
            </a>
            <a
              href="/clarity"
              className="hidden text-[11px] font-medium uppercase tracking-[0.2em] text-white/50 transition-colors hover:text-white/80 sm:block"
            >
              Clarity
            </a>
            <ActionLink href="/login" label="Operator" tone="secondary" />
          </div>
        </nav>

        {/* ── HERO ─────────────────────────────────────────────── */}
        <section
          id="hero"
          className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-5 pt-24 pb-16 sm:px-8"
        >
          <div className="w-full max-w-2xl">
            <div className="relative">
              <div className="absolute -inset-16 z-0 opacity-40">
                <Image
                  src="/brand/vault-radial.png"
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain"
                />
              </div>

              <div className="relative z-10 overflow-hidden rounded-[2.4rem] border border-white/12 bg-[linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-8 shadow-[0_40px_120px_rgba(0,0,0,0.5)] backdrop-blur-2xl sm:p-12">
                <div className="pointer-events-none absolute inset-0 rounded-[2.4rem] bg-[radial-gradient(circle_at_50%_0%,rgba(55,245,241,0.08),transparent_60%)]" />

                <div className="relative text-center">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/5">
                    <ShieldIcon />
                  </div>

                  <h1
                    className="text-[clamp(2.6rem,7vw,4.8rem)] font-bold leading-[0.95] tracking-[-0.04em] text-white"
                  >
                    pushing
                    <span className="bg-gradient-to-r from-cyan-300 to-teal-200 bg-clip-text text-transparent">
                      Security
                    </span>
                  </h1>

                  <p className="mx-auto mt-6 max-w-sm text-base leading-7 text-slate-400">
                    Secure access for verified clients. Credit intelligence,
                    identity protection, and zero-trust browsing — all in one
                    vault.
                  </p>

                  <div className="mx-auto mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                    <a
                      href="/onboard"
                      className="inline-flex items-center justify-center rounded-full border border-white/40 bg-[#d4fff0] px-8 py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-[#04111d] shadow-[0_14px_36px_rgba(59,219,195,0.25)] transition-all hover:shadow-[0_20px_48px_rgba(59,219,195,0.35)] hover:brightness-110"
                    >
                      Enter Vault
                    </a>
                    <a
                      href="/clarity"
                      className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-8 py-3.5 text-xs font-medium uppercase tracking-[0.16em] text-white/70 backdrop-blur-sm transition-all hover:bg-white/10 hover:text-white"
                    >
                      View Clarity Dashboard
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="mt-16 flex flex-col items-center gap-2 text-white/20">
            <span className="text-[9px] uppercase tracking-[0.3em]">
              Scroll
            </span>
            <div className="h-8 w-[1px] bg-gradient-to-b from-white/20 to-transparent" />
          </div>
        </section>

        {/* ── SERVICES ─────────────────────────────────────────── */}
        <section
          id="services"
          className="mx-auto max-w-6xl px-5 py-24 sm:px-8"
        >
          <div className="mb-16 text-center">
            <p className="text-[10px] font-medium uppercase tracking-[0.4em] text-cyan-400/60">
              Core Capabilities
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Security Infrastructure
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-slate-500">
              Three integrated surfaces built on Google Cloud, Cloudflare
              Workers, and the Pushing Capital data mesh.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <div
                key={service.title}
                className="group relative overflow-hidden rounded-3xl border border-white/8 bg-[linear-gradient(145deg,rgba(255,255,255,0.06),rgba(255,255,255,0.01))] p-8 backdrop-blur-xl transition-all duration-500 hover:border-white/15 hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
                style={{
                  boxShadow: `inset 0 1px 0 ${service.borderGlow}`,
                }}
              >
                <div
                  className={`pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br ${service.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                />

                <div className="relative">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-cyan-300">
                    {service.icon}
                  </div>

                  <h3 className="text-lg font-bold text-white">
                    {service.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {service.description}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {service.features.map((feature) => (
                      <span
                        key={feature}
                        className="rounded-full border border-white/8 bg-white/5 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.1em] text-white/50"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── TRUST BAR ─────────────────────────────────────────── */}
        <section className="border-y border-white/5 bg-white/[0.02] py-10 backdrop-blur-sm">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-8 px-5 sm:gap-12 sm:px-8">
            {trustBadges.map((badge) => (
              <div
                key={badge.label}
                className="flex items-center gap-2.5 text-white/30"
              >
                {badge.icon}
                <span className="text-[10px] font-medium uppercase tracking-[0.2em]">
                  {badge.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── DASHBOARD PREVIEW ──────────────────────────────────── */}
        <section
          id="preview"
          className="mx-auto max-w-6xl px-5 py-24 sm:px-8"
        >
          <div className="mb-12 text-center">
            <p className="text-[10px] font-medium uppercase tracking-[0.4em] text-violet-400/60">
              Live Dashboard
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Clarity Dashboard
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-slate-500">
              Real-time credit intelligence, document management, and transaction
              monitoring in a premium glassmorphic interface.
            </p>
          </div>

          {/* Mock dashboard */}
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.01))] p-6 shadow-[0_40px_120px_rgba(0,0,0,0.4)] backdrop-blur-2xl sm:p-8">
            <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_30%_20%,rgba(55,245,241,0.06),transparent_50%)]" />

            {/* Top bar */}
            <div className="relative mb-6 flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-cyan-400/40" />
                <span className="text-xs font-medium text-white/60">
                  Clarity Dashboard
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-emerald-400">
                  Live
                </span>
              </div>
            </div>

            {/* Dashboard cards */}
            <div className="relative grid gap-4 sm:grid-cols-3">
              {/* Credit Score */}
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/40">
                  Credit Score
                </p>
                <div className="mt-3 flex items-end gap-2">
                  <span className="text-4xl font-bold text-cyan-300">742</span>
                  <span className="mb-1 text-xs text-emerald-400">+12</span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-teal-300"
                    style={{ width: "82%" }}
                  />
                </div>
                <div className="mt-2 flex justify-between text-[9px] text-white/30">
                  <span>300</span>
                  <span>850</span>
                </div>
              </div>

              {/* Documents */}
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/40">
                  Documents Secured
                </p>
                <div className="mt-3 flex items-end gap-2">
                  <span className="text-4xl font-bold text-violet-300">18</span>
                  <span className="mb-1 text-xs text-white/30">files</span>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 rounded-lg bg-white/[0.03] px-3 py-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[10px] text-white/50">
                      DL verified
                    </span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-white/[0.03] px-3 py-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    <span className="text-[10px] text-white/50">
                      2 pending review
                    </span>
                  </div>
                </div>
              </div>

              {/* Secure Sessions */}
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/40">
                  Secure Sessions
                </p>
                <div className="mt-3 flex items-end gap-2">
                  <span className="text-4xl font-bold text-emerald-300">3</span>
                  <span className="mb-1 text-xs text-white/30">active</span>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 rounded-lg bg-white/[0.03] px-3 py-1.5">
                    <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
                    <span className="text-[10px] text-white/50">
                      Experian portal
                    </span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-white/[0.03] px-3 py-1.5">
                    <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
                    <span className="text-[10px] text-white/50">
                      TransUnion pull
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ──────────────────────────────────────── */}
        <section
          id="how-it-works"
          className="mx-auto max-w-6xl px-5 py-24 sm:px-8"
        >
          <div className="mb-16 text-center">
            <p className="text-[10px] font-medium uppercase tracking-[0.4em] text-emerald-400/60">
              Pipeline
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              How It Works
            </h2>
          </div>

          <div className="mx-auto grid max-w-3xl gap-0">
            {[
              {
                step: "01",
                title: "Onboard",
                desc: "Identity verification through driver's license OCR, DocuSign e-signature, and biometric confirmation.",
              },
              {
                step: "02",
                title: "Ingest",
                desc: "Credit reports from Experian and TransUnion are ingested, parsed by Google Vision AI, and indexed.",
              },
              {
                step: "03",
                title: "Analyze",
                desc: "The Clarity Dashboard renders your credit profile with FICO scoring, dispute tracking, and trend analysis.",
              },
              {
                step: "04",
                title: "Protect",
                desc: "Documents and sessions are encrypted, audit-logged, and accessible only through zero-trust authentication.",
              },
            ].map((item, idx) => (
              <div key={item.step} className="relative flex gap-6 pb-12">
                {/* Connector line */}
                {idx < 3 && (
                  <div className="absolute left-5 top-12 h-full w-[1px] bg-gradient-to-b from-white/10 to-transparent" />
                )}

                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/5">
                  <span className="text-xs font-bold text-cyan-300">
                    {item.step}
                  </span>
                </div>

                <div className="pt-1">
                  <h3 className="text-base font-bold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(145deg,rgba(55,245,241,0.06),rgba(139,92,246,0.04))] px-8 py-16 text-center shadow-[0_40px_120px_rgba(0,0,0,0.3)] backdrop-blur-2xl sm:px-16">
            <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_50%_0%,rgba(55,245,241,0.1),transparent_60%)]" />
            <div className="relative">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Ready to secure your data?
              </h2>
              <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-slate-400">
                Start with a free credit clarity check. Upload your report and
                get AI-powered insights in under 60 seconds.
              </p>
              <a
                href="/onboard"
                className="mt-8 inline-flex items-center justify-center rounded-full border border-white/40 bg-[#d4fff0] px-10 py-4 text-xs font-bold uppercase tracking-[0.16em] text-[#04111d] shadow-[0_14px_36px_rgba(59,219,195,0.25)] transition-all hover:shadow-[0_20px_48px_rgba(59,219,195,0.35)] hover:brightness-110"
              >
                Get Started Free
              </a>
            </div>
          </div>
        </section>

        {/* ── FOOTER ────────────────────────────────────────────── */}
        <footer className="border-t border-white/5 bg-[#060a12] py-10">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-5 sm:flex-row sm:justify-between sm:px-8">
            <div className="flex items-center gap-3">
              <Image
                src="/brand/p-glass-mark.png"
                alt="P"
                width={24}
                height={24}
                className="h-6 w-6 rounded-md"
              />
              <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-white/30">
                Pushing Capital
              </span>
            </div>
            <p className="text-[9px] uppercase tracking-[0.3em] text-white/15">
              Data Orchestration · Zero Trust
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
