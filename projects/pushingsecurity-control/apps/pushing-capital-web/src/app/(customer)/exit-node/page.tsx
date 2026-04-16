"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";

// --- MiniO Design System Components ---

function LogoMiniO({ size = "md", status = "READY" }: { size?: "sm" | "md" | "lg", status?: string }) {
  const dimensions = size === "sm" ? "h-10 w-10" : size === "md" ? "h-20 w-20" : "h-32 w-32";
  const pSize = size === "sm" ? 20 : size === "md" ? 40 : 80;
  const isSyncing = status.includes("SYNC") || status.includes("EXEC") || status.includes("INGEST");
  
  return (
    <div className={`relative ${dimensions} flex items-center justify-center`}>
      <div className={`absolute inset-0 rounded-full border border-white/5`} />
      <motion.div 
        animate={isSyncing ? { scale: [1, 1.02, 1], opacity: [0.2, 0.4, 0.2] } : { scale: [1, 1.01, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: isSyncing ? 3 : 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-full border-[0.5px] border-[#00FFAA]/40 shadow-[0_0_30px_rgba(0,255,170,0.1)]"
      />
      <div className="relative z-10 flex items-center justify-center">
        <Image src="/brand/p-glass-mark.png" alt="P" width={pSize} height={pSize} className="opacity-80 brightness-110 grayscale" />
      </div>
    </div>
  );
}

// Technical, non-disney automotive icon (Structural profile)
function IconAutomotive() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} className="h-6 w-6">
      <path d="M4 11h16M4 15h16M2 13h20M7 8l2-3h6l2 3M5 18h2M17 18h2" strokeLinecap="round" />
      <rect x="3" y="8" width="18" height="9" rx="1" strokeLinejoin="round" />
    </svg>
  );
}

// Clean, high-end currency icon
function IconCurrency() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} className="h-6 w-6">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M9 12h6" strokeLinecap="round" />
      <path d="M10 9.5a2.5 2.5 0 0 1 4 0M10 14.5a2.5 2.5 0 0 0 4 0" strokeLinecap="round" />
    </svg>
  );
}

// --- Adaptive Hub Component ---

export default function SovereignHubPage() {
  const router = useRouter();
  const [status, setStatus] = useState("READY");
  
  const [userContext, setUserContext] = useState({
    name: "Manny",
    hasVehicle: true,
    hasBusiness: false,
    hasKeys: true,
    activeIntelligence: ["Experian"],
  });

  return (
    <main className="relative min-h-screen bg-[#000000] text-white/70 font-sans selection:bg-[#00FFAA]/20 flex flex-col items-center overflow-x-hidden">
      
      {/* ── UNIFIED BACKGROUND VOID ────────────────────────────── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] bg-cyan-950/15 rounded-full blur-[180px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-white/[0.005] rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center px-8 pt-24 pb-32">
        
        {/* Nav (CamelCase + Muted Text) */}
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-12 py-10">
          <div className="flex items-center gap-6" onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
            <LogoMiniO size="sm" />
            <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/30">pushingSecurity</span>
          </div>
          <div className="flex items-center gap-12">
            <a href="/exit-node" className="text-[9px] font-bold uppercase tracking-[0.4em] text-[#00FFAA]/80 transition">sovereignHub</a>
            <a href="/vault" className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/30 transition hover:text-[#00FFAA]">vaultAccess</a>
          </div>
        </nav>

        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-32 flex flex-col items-center text-center mt-20"
        >
           <LogoMiniO size="lg" status={status} />
           <div className="mt-12">
              <h1 className="text-4xl font-extralight tracking-[0.4em] uppercase text-white/90 mb-4">Sovereign Hub</h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.6em] text-white/30 italic">Secure Orchestration // {userContext.name}</p>
           </div>
        </motion.div>

        {/* ── ADAPTIVE NODE MATRIX (CamelCase + Blended Icons) ────── */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
           
           {/* Physical Keys Node */}
           {userContext.hasKeys && (
             <div className="p-10 bg-white/[0.01] border border-white/5 rounded-[48px] backdrop-blur-3xl flex flex-col gap-8 group hover:bg-white/[0.02] transition-all cursor-pointer relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.005] rounded-full blur-[60px]" />
                <div className="flex justify-between items-start">
                   <div className="h-12 w-12 rounded-full bg-white/[0.005] flex items-center justify-center text-lg border border-white/5 group-hover:border-[#00FFAA]/20 transition-colors text-white/40 group-hover:text-[#00FFAA]/60">🔑</div>
                   <div className="flex flex-col items-end gap-2">
                     <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/20">identity</span>
                     <div className="h-1.5 w-1.5 rounded-full bg-[#00FFAA]/60 shadow-[0_0_8px_rgba(0,255,170,0.3)]" />
                   </div>
                </div>
                <div>
                   <h3 className="text-xl font-light tracking-[0.2em] uppercase text-white/80 mb-2">sovereignKeys</h3>
                   <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/20 leading-relaxed">Digital & Physical Geometry Ingested.</p>
                </div>
                <button className="text-[9px] font-bold uppercase tracking-[0.4em] text-[#00FFAA]/60 opacity-40 group-hover:opacity-100 transition-opacity text-left">initializeSession →</button>
             </div>
           )}

           {/* Financial Node */}
           <div className="p-10 bg-white/[0.01] border border-white/5 rounded-[48px] backdrop-blur-3xl flex flex-col gap-8 group hover:bg-white/[0.02] transition-all cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.005] rounded-full blur-[60px]" />
              <div className="flex justify-between items-start">
                 <div className="h-12 w-12 rounded-full bg-white/[0.005] flex items-center justify-center border border-white/5 group-hover:border-[#00FFAA]/20 transition-colors text-white/40 group-hover:text-[#00FFAA]/60">
                    <IconCurrency />
                 </div>
                 <div className="flex flex-col items-end gap-2">
                   <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/20">finance</span>
                   <div className="h-1.5 w-1.5 rounded-full bg-[#00FFAA]/60 shadow-[0_0_8px_rgba(0,255,170,0.3)]" />
                 </div>
              </div>
              <div>
                 <h3 className="text-xl font-light tracking-[0.2em] uppercase text-white/80 mb-2">financialCore</h3>
                 <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/20 leading-relaxed">Sovereign Bank & LLM Key Access.</p>
              </div>
              <button className="text-[9px] font-bold uppercase tracking-[0.4em] text-[#00FFAA]/60 opacity-40 group-hover:opacity-100 transition-opacity text-left">syncIntelligence →</button>
           </div>

           {/* Vehicle Node */}
           {userContext.hasVehicle && (
             <div className="p-10 bg-white/[0.01] border border-white/5 rounded-[48px] backdrop-blur-3xl flex flex-col gap-8 group hover:bg-white/[0.02] transition-all cursor-pointer relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.005] rounded-full blur-[60px]" />
                <div className="flex justify-between items-start">
                   <div className="h-12 w-12 rounded-full bg-white/[0.005] flex items-center justify-center border border-white/5 group-hover:border-[#00FFAA]/20 transition-colors text-white/40 group-hover:text-[#00FFAA]/60">
                      <IconAutomotive />
                   </div>
                   <div className="flex flex-col items-end gap-2">
                     <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/20">automotive</span>
                     <div className="h-1.5 w-1.5 rounded-full bg-[#00FFAA]/60 shadow-[0_0_8px_rgba(0,255,170,0.3)]" />
                   </div>
                </div>
                <div>
                   <h3 className="text-xl font-light tracking-[0.2em] uppercase text-white/80 mb-2">vehicleHub</h3>
                   <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/20 leading-relaxed">VIN & Title Data Processing Active.</p>
                </div>
                <button className="text-[9px] font-bold uppercase tracking-[0.4em] text-[#00FFAA]/60 opacity-40 group-hover:opacity-100 transition-opacity text-left">viewFleet →</button>
             </div>
           )}

           {/* Exit Node (Always On) */}
           <div className="p-10 bg-white/[0.01] border border-white/5 rounded-[48px] backdrop-blur-3xl flex flex-col gap-8 group hover:bg-white/[0.02] transition-all cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.005] rounded-full blur-[60px]" />
              <div className="flex justify-between items-start">
                 <div className="h-12 w-12 rounded-full bg-white/[0.005] flex items-center justify-center text-lg border border-white/5 group-hover:border-[#00FFAA]/20 transition-colors text-white/40 group-hover:text-[#00FFAA]/60">⚡</div>
                 <div className="flex flex-col items-end gap-2">
                   <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/20">native</span>
                   <div className="h-1.5 w-1.5 rounded-full bg-[#00FFAA]/60 shadow-[0_0_8px_rgba(0,255,170,0.3)]" />
                 </div>
              </div>
              <div>
                 <h3 className="text-xl font-light tracking-[0.2em] uppercase text-white/80 mb-2">exitNode</h3>
                 <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/20 leading-relaxed">Bridge to Native Phone and Browser Push.</p>
              </div>
              <button className="text-[9px] font-bold uppercase tracking-[0.4em] text-[#00FFAA]/60 opacity-40 group-hover:opacity-100 transition-opacity text-left">configureSocket →</button>
           </div>

        </div>

        {/* Footer */}
        <footer className="mt-32 opacity-10 flex flex-col items-center gap-6">
           <div className="h-[1px] w-24 bg-white/20" />
           <span className="text-[8px] font-bold uppercase tracking-[0.6em]">pushingSecurity by Pushing Capital LLC</span>
           <LogoMiniO size="sm" />
        </footer>

      </div>
    </main>
  );
}
