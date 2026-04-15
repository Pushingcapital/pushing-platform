import type { Metadata } from "next";
import Image from "next/image";
import { ActionLink } from "@/components/ui/action-link";

export const metadata: Metadata = {
  title: "pushingSecurity",
  description: "Pushing Capital — Security infrastructure.",
};

export default function CustomerHomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* ── Vault background ────────────────────────────────────── */}
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

      {/* ── Ambient glow ───────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 z-[1]">
        <div className="absolute left-1/2 top-[12%] h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(55,245,241,0.14),transparent_70%)] blur-3xl" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#0a0f1a] to-transparent" />
      </div>

      {/* ── Content ────────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-5 py-16 sm:px-8">
        {/* Top bar */}
        <nav className="absolute left-4 right-4 top-4 flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-xl sm:left-8 sm:right-8">
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
          <div className="flex gap-2">
            <ActionLink href="/login" label="Operator" tone="secondary" />
          </div>
        </nav>

        {/* Hero card */}
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

            <section className="relative z-10 overflow-hidden rounded-[2.4rem] border border-white/12 bg-[linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-8 shadow-[0_40px_120px_rgba(0,0,0,0.5)] backdrop-blur-2xl sm:p-12">
              <div className="pointer-events-none absolute inset-0 rounded-[2.4rem] bg-[radial-gradient(circle_at_50%_0%,rgba(55,245,241,0.08),transparent_60%)]" />

              <div className="relative text-center">
                <h1 className="text-[clamp(2.6rem,7vw,4.8rem)] font-bold leading-[0.95] tracking-[-0.04em] text-white">
                  pushing
                  <span className="bg-gradient-to-r from-cyan-300 to-teal-200 bg-clip-text text-transparent">
                    Security
                  </span>
                </h1>

                <p className="mx-auto mt-6 max-w-sm text-base leading-7 text-slate-400">
                  Secure access for verified clients.
                </p>

                <div className="mx-auto mt-8 flex justify-center">
                  <a
                    href="/onboard"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minWidth: "12rem",
                      padding: "14px 32px",
                      borderRadius: "9999px",
                      backgroundColor: "#d4fff0",
                      color: "#04111d",
                      fontSize: "12px",
                      fontWeight: 700,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      textDecoration: "none",
                      border: "1px solid rgba(255,255,255,0.4)",
                      boxShadow: "0 14px 36px rgba(59,219,195,0.25)",
                    }}
                  >
                    Enter
                  </a>
                </div>
              </div>
            </section>
          </div>
        </div>

        <p className="mt-12 text-center text-[10px] tracking-[0.3em] uppercase text-white/25">
          Data Orchestration · Zero Trust
        </p>
      </div>
    </main>
  );
}
