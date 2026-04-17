"use client";

import { useState, useEffect } from "react";
import type { Metadata } from "next";
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

/* ── Component ───────────────────────────────────────────────────────── */

export default function CustomerHomePage() {
  const router = useRouter();
  
  const [userContext, setUserContext] = useState({
    name: "Manny",
    hasVehicle: true,
    hasBusiness: false,
    hasKeys: true,
  });

  return (
    <main className="relative min-h-screen bg-[#000000] text-white/70 font-sans selection:bg-[#00FFAA]/20 overflow-hidden">
      
      {/* ── UNIFIED VOID ── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-cyan-950/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-white/[0.005] rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* Nav (CamelCase + Muted Text) */}
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-12 py-10">
          <div className="flex items-center gap-6" onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
            <LogoMiniO size="sm" />
            <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/30">pushingSecurity</span>
          </div>
          <div className="flex items-center gap-12">
            <a href="/exit-node" className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/20 transition hover:text-[#00FFAA]">sovereignHub</a>
            <a href="/login" className="text-[9px] font-bold uppercase tracking-[0.4em] text-[#00FFAA]/60 transition hover:text-white/80">operatorAccess</a>
          </div>
        </nav>

        {/* Hero Area */}
        <section className="flex-1 flex flex-col items-center justify-center px-6 text-center pt-32 pb-48">
          <motion.div initial={{ opacity: 0, scale: 0.99 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 2 }} className="w-full max-w-7xl">
            <div className="mb-24 flex justify-center">
              <LogoMiniO size="lg" />
            </div>

            <h1 className="text-[clamp(3.5rem,12vw,9rem)] font-extralight tracking-[-0.02em] leading-[0.9] text-transparent bg-clip-text bg-[linear-gradient(180deg,#00FFAA_0%,#37f5f1_100%)] mb-8">
              pushing<span className="font-bold">Security</span>
            </h1>
            
            <h2 className="text-[clamp(1.5rem,4vw,3rem)] font-extralight tracking-[0.4em] uppercase text-white/90 mb-12">Sanctuary</h2>
            
            <p className="mx-auto max-w-xl text-[10px] font-light leading-relaxed text-white/20 tracking-[0.5em] uppercase mb-24 italic">Adaptive Sovereign Hub // {userContext.name}</p>

            <a href="/onboard" className="group text-[11px] font-bold uppercase tracking-[0.6em] text-white/40 hover:text-white transition-all flex flex-col items-center gap-4">
              <span>initializeNewOrchestration</span>
              <span className="text-[#00FFAA] group-hover:translate-y-2 transition-transform">↓</span>
            </a>

            {/* Adaptive Entry Points (No Harsh White) */}
            <div className="mt-48 w-full flex justify-center gap-24">
               {userContext.hasKeys && (
                 <div className="flex flex-col items-center gap-8 group cursor-pointer" onClick={() => router.push('/exit-node')}>
                    <div className="h-16 w-16 rounded-full border border-white/5 flex items-center justify-center bg-white/[0.005] group-hover:border-[#00FFAA]/20 transition-all">
                       <span className="text-white/20 group-hover:text-[#00FFAA]/60 transition-colors"><IconCurrency /></span>
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/20 group-hover:text-white/40 transition-colors">financialCore</span>
                 </div>
               )}
               {userContext.hasVehicle && (
                 <div className="flex flex-col items-center gap-8 group cursor-pointer">
                    <div className="h-16 w-16 rounded-full border border-white/5 flex items-center justify-center bg-white/[0.005] group-hover:border-[#00FFAA]/20 transition-all">
                       <span className="text-white/20 group-hover:text-[#00FFAA]/60 transition-colors"><IconAutomotive /></span>
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/20 group-hover:text-white/40 transition-colors">vehicleHub</span>
                 </div>
               )}
            </div>
          </motion.div>
        </section>

        <footer className="px-12 py-12 flex justify-between items-end opacity-20 border-t border-white/5">
          <div className="flex flex-col gap-2">
            <span className="text-[8px] font-bold uppercase tracking-[0.5em] text-white/60 text-shadow-sm">pushingSecurity by Pushing Capital LLC</span>
            <span className="text-[8px] font-bold uppercase tracking-[0.5em] text-white/40">Identity // {userContext.name.toUpperCase()}_ACTIVE</span>
          </div>
          <span className="text-[8px] font-bold uppercase tracking-[0.5em] text-white/40">Sovereign Layer V3.9</span>
        </footer>
      </div>
    </main>
  );
}
