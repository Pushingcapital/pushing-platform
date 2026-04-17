"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

// --- MiniO Design System Components ---

function LogoMiniO({ size = "md", glow = true }: { size?: "sm" | "md" | "lg", glow?: boolean }) {
  const dimensions = size === "sm" ? "h-10 w-10" : size === "md" ? "h-20 w-20" : "h-32 w-32";
  const pSize = size === "sm" ? 20 : size === "md" ? 40 : 80;
  return (
    <div className={`relative ${dimensions} flex items-center justify-center`}>
      <div className={`absolute inset-0 rounded-full border border-white/5`} />
      <motion.div 
        animate={glow ? { scale: [1, 1.02, 1], opacity: [0.1, 0.2, 0.1] } : {}}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute inset-0 rounded-full border-[0.5px] border-[#00FFAA]/20 ${glow ? 'shadow-[0_0_30px_rgba(0,255,170,0.1)]' : ''}`}
      />
      <div className="relative z-10 flex items-center justify-center">
        <Image src="/brand/p-glass-mark.png" alt="P" width={pSize} height={pSize} className="opacity-80 brightness-110 grayscale" />
      </div>
    </div>
  );
}

function IconCurrency() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} className="h-6 w-6">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M9 12h6" strokeLinecap="round" />
      <path d="M10 9.5a2.5 2.5 0 0 1 4 0M10 14.5a2.5 2.5 0 0 0 4 0" strokeLinecap="round" />
    </svg>
  );
}

function IconAutomotive() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} className="h-6 w-6">
      <path d="M4 11h16M4 15h16M2 13h20M7 8l2-3h6l2 3M5 18h2M17 18h2" strokeLinecap="round" />
      <rect x="3" y="8" width="18" height="9" rx="1" strokeLinejoin="round" />
    </svg>
  );
}

function IconIdentity() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} className="h-6 w-6">
      <path d="M15 5H9a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zM7 11h10M11 15h2" strokeLinecap="round" />
      <circle cx="12" cy="8" r="1.5" />
    </svg>
  );
}

function IconLegal() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} className="h-6 w-6">
      <path d="M3 10h18M7 10l-2 5h4l-2-5M17 10l-2 5h4l-2-5M12 3v18m-5 0h10" strokeLinecap="round" />
    </svg>
  );
}

// ── Types ──────────────────────────────────────────────────────────────────

type VaultCategory = "financialCore" | "identityVault" | "vehicleHub" | "enterpriseNode";

// ── Secure-categories for adaptive display ────────────────────────────────

const SECURE_CATEGORIES = [
  { key: "financialCore", icon: <IconCurrency />, label: "financialCore", desc: "Sovereign financial telemetry" },
  { key: "identityVault", icon: <IconIdentity />, label: "identityVault", desc: "Encrypted credential repository" },
  { key: "vehicleHub", icon: <IconAutomotive />, label: "vehicleHub", desc: "Automotive VIN orchestration" },
  { key: "enterpriseNode", icon: <IconLegal />, label: "enterpriseNode", desc: "High-end legal orchestration" },
];

function SignalPulse() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FFAA] opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00FFAA]"></span>
      </div>
      <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#00FFAA]/60">Sovereign_Link_Active</span>
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────

export default function VaultDashboard({ userName }: { userName?: string }) {
  const [started, setStarted] = useState(false);
  const [logs, setLogs] = useState([
    "AUTH_SUCCESS: Session established via Sanctuary Gate",
    "CORE_SYNC: Synchronizing Financial Telemetry...",
    "SECURE_LINK: Sovereign Hub handshake verified"
  ]);
  const router = useRouter();
  const name = userName || "Manny";

  useEffect(() => {
    if (started) {
      const interval = setInterval(() => {
        const newLogs = [
          "HEARTBEAT: Sovereign node 100.102.41.1 verified",
          "ORCHESTRATION: Re-indexing AES-256 Vault...",
          "SECURITY: No intrusion detected in past 60s",
          "DATA_HUB: vehicleHub VIN cross-reference stable",
          "CLARITY_SYNC: FICO telemetry refresh requested"
        ];
        const randomLog = newLogs[Math.floor(Math.random() * newLogs.length)];
        setLogs(prev => [randomLog, ...prev.slice(0, 4)]);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [started]);

  return (
    <div className="relative min-h-screen bg-[#000000] text-white/70 font-sans selection:bg-[#00FFAA]/20 overflow-hidden flex flex-col items-center">
      
      {/* ── UNIFIED VOID ── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-cyan-950/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-white/[0.005] rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen w-full">
        
        {/* Nav (CamelCase Refinement) */}
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-12 py-10">
          <div className="flex items-center gap-6" onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
            <LogoMiniO size="sm" />
            <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/30">pushingSecurity</span>
          </div>
          <div className="flex items-center gap-12">
            <a href="/exit-node" className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/20 transition hover:text-[#00FFAA]">sovereignHub</a>
            <a href="/vault" className="text-[9px] font-bold uppercase tracking-[0.4em] text-[#00FFAA] transition">vaultAccess</a>
          </div>
        </nav>

        {!started ? (
          /* ── Welcome Area ──────────────────────────────────────────────── */
          <section className="flex-1 flex flex-col items-center justify-center px-6 pt-32 pb-48 text-center">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5 }}
              className="w-full max-w-4xl"
            >
              <div className="mb-20 flex justify-center">
                <LogoMiniO size="lg" />
              </div>

              <h1 className="text-[clamp(2rem,6vw,4rem)] font-extralight tracking-[0.3em] uppercase text-white leading-tight mb-8">
                Welcome, {name}
              </h1>
              <p className="mx-auto max-w-xl text-[10px] font-light leading-relaxed text-white/20 tracking-[0.4em] uppercase mb-24 italic">
                Initialize your secure data sanctuary
              </p>

              {/* Adaptive Categories (CamelCase & Technical Icons) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-20 text-left">
                {SECURE_CATEGORIES.map((cat) => (
                  <div key={cat.key} className="p-10 bg-white/[0.01] border border-white/5 rounded-[48px] backdrop-blur-3xl group hover:bg-white/[0.02] transition-all">
                    <div className="flex justify-between items-start mb-10">
                      <div className="text-white/20 group-hover:text-[#00FFAA]/60 transition-colors">
                        {cat.icon}
                      </div>
                      <div className="h-1.5 w-1.5 rounded-full bg-[#00FFAA]/40" />
                    </div>
                    <h3 className="text-sm font-light tracking-[0.2em] uppercase text-white/80 mb-2">{cat.label}</h3>
                    <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/20 leading-relaxed">{cat.desc}</p>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setStarted(true)}
                className="group text-[10px] font-bold uppercase tracking-[0.6em] text-white/40 hover:text-[#00FFAA] transition-all"
              >
                Establish_Secure_Session <span className="transition-transform group-hover:translate-x-2 inline-block">→</span>
              </button>
            </motion.div>
          </section>
        ) : (
          /* ── Main Vault Area ─────────────────────────────────────────── */
          <section className="flex-1 flex flex-col items-center px-6 pt-48 pb-32 w-full max-w-5xl mx-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full"
            >
               <div className="flex justify-between items-end mb-16 px-4">
                  <div>
                    <h2 className="text-4xl font-extralight tracking-[0.3em] uppercase text-white/90 mb-4">vaultAccess</h2>
                    <p className="text-[9px] font-bold uppercase tracking-[0.5em] text-white/30 italic">AES-256 Sovereign Repository</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-3">
                    <SignalPulse />
                    <span className="text-[8px] font-mono text-white/10 uppercase tracking-[0.4em]">Node // 100.102.41.1</span>
                  </div>
               </div>

               {/* Orchestration Log Overlay */}
               <div className="mb-12 mx-4 p-8 bg-white/[0.01] border border-white/5 rounded-3xl backdrop-blur-md">
                  <div className="flex items-center gap-4 mb-6 opacity-30">
                     <div className="h-[1px] flex-1 bg-white/20" />
                     <span className="text-[8px] font-bold uppercase tracking-[0.4em]">System_Telemetry_Log</span>
                     <div className="h-[1px] flex-1 bg-white/20" />
                  </div>
                  <div className="space-y-3 font-mono text-[9px] tracking-widest">
                     {logs.map((log, idx) => (
                       <motion.div 
                         key={log + idx} 
                         initial={{ opacity: 0, x: -5 }} 
                         animate={{ opacity: 1 - (idx * 0.2), x: 0 }} 
                         className="flex gap-4"
                       >
                         <span className="text-[#00FFAA]/40">[{new Date().toLocaleTimeString()}]</span>
                         <span className={idx === 0 ? "text-white/80" : "text-white/30"}>{log}</span>
                       </motion.div>
                     ))}
                  </div>
               </div>

               <div className="grid grid-cols-1 gap-4 px-4">
                  {/* Empty state for demo */}
                  <div className="p-20 border border-dashed border-white/5 rounded-[56px] flex flex-col items-center justify-center text-center gap-8 bg-white/[0.005]">
                     <div className="h-12 w-12 rounded-full border border-white/5 flex items-center justify-center opacity-20">
                        <LogoMiniO size="sm" glow={false} />
                     </div>
                     <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/20">The Vault is currently empty.</span>
                     <button className="text-[9px] font-bold uppercase tracking-[0.5em] text-[#00FFAA]/60 hover:text-[#00FFAA] transition-colors border border-[#00FFAA]/10 px-8 py-3 rounded-full hover:bg-[#00FFAA]/5">
                        Add_New_Claim →
                     </button>
                  </div>
               </div>
            </motion.div>
          </section>
        )}

        <footer className="px-12 py-12 flex justify-between items-end opacity-20 border-t border-white/5 mt-auto">
          <div className="flex flex-col gap-2">
            <span className="text-[8px] font-bold uppercase tracking-[0.5em] text-white/60">pushingSecurity by Pushing Capital LLC</span>
            <span className="text-[8px] font-bold uppercase tracking-[0.5em] text-white/40">Identity // {name.toUpperCase()}_ACTIVE</span>
          </div>
          <span className="text-[8px] font-bold uppercase tracking-[0.5em] text-white/40">Sovereign Layer V3.9</span>
        </footer>
      </div>
    </div>
  );
}
