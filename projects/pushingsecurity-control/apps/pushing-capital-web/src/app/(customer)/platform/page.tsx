"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

// --- MiniO Design System Components ---

function LogoMiniO({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dimensions = size === "sm" ? "h-8 w-8" : size === "md" ? "h-14 w-14" : "h-28 w-28";
  const pSize = size === "sm" ? 18 : size === "md" ? 32 : 64;
  return (
    <div className={`relative ${dimensions} flex items-center justify-center`}>
      {/* The Outer Ring */}
      <div className={`absolute inset-0 rounded-full border border-white/5`} />
      {/* The Active Aperture */}
      <motion.div 
        animate={{ scale: [1, 1.02, 1], opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute inset-0 rounded-full border-[0.5px] border-[#00FFAA]/30 shadow-[0_0_30px_rgba(0,255,170,0.15)]`}
      />
      {/* The P Core */}
      <div className="relative z-10 flex items-center justify-center">
        <Image 
          src="/brand/p-glass-mark.png" 
          alt="P" 
          width={pSize} 
          height={pSize} 
          className="opacity-90 brightness-125"
        />
      </div>
    </div>
  );
}

// --- Platform Feature Components ---

function MiniOMap() {
  return (
    <div className="relative w-full h-[550px] bg-[#020202] rounded-[48px] overflow-hidden border border-white/5 shadow-2xl group">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center grayscale opacity-30 mix-blend-luminosity" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
      
      <div className="absolute top-10 left-10 flex flex-col gap-3">
        <div className="px-5 py-2.5 bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-full flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#00FFAA] shadow-[0_0_10px_#00FFAA]" />
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/70 text-shadow-sm">Google Maps Elite // Global Mesh</span>
        </div>
        <div className="flex gap-2">
           <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-[8px] font-bold uppercase tracking-widest text-white/30">Photorealistic 3D</span>
           <span className="px-3 py-1 bg-[#00FFAA]/10 border border-[#00FFAA]/20 rounded-lg text-[8px] font-bold uppercase tracking-widest text-[#00FFAA]">Active</span>
        </div>
      </div>

      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <div className="h-20 w-20 rounded-full border border-[#00FFAA]/40 bg-black/40 backdrop-blur-md flex items-center justify-center shadow-[0_0_50px_rgba(0,255,170,0.2)]">
           <div className="h-3 w-3 rounded-full bg-[#00FFAA]" />
        </div>
      </motion.div>

      <div className="absolute bottom-10 right-10 flex gap-4">
         <button className="px-8 py-3 bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 hover:text-white hover:bg-white/5 transition">Initialize_3D</button>
         <button className="px-8 py-3 bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 hover:text-white hover:bg-white/5 transition">Sync_Markers</button>
      </div>
    </div>
  );
}

function MiniOChrome() {
  const [url, setUrl] = useState("https://www.google.com/enterprise");
  return (
    <div className="w-full h-[650px] bg-[#020202] rounded-[56px] border border-white/5 overflow-hidden flex flex-col shadow-2xl relative">
       <div className="h-16 border-b border-white/5 px-10 flex items-center justify-between bg-white/[0.02] backdrop-blur-3xl">
          <div className="flex gap-8 items-center">
             <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-white/5 border border-white/10" />
                <div className="w-2 h-2 rounded-full bg-white/5 border border-white/10" />
             </div>
             <div className="h-9 w-80 bg-white/5 border border-white/5 rounded-full flex items-center px-6">
                <span className="text-[10px] font-mono text-white/30 tracking-widest uppercase">{url}</span>
             </div>
          </div>
          <div className="flex items-center gap-6">
             <span className="text-[9px] font-bold uppercase tracking-[0.5em] text-[#00FFAA] opacity-60">Chrome Enterprise Core</span>
             <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <LogoMiniO size="sm" />
             </div>
          </div>
       </div>
       <div className="flex-1 bg-black flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,170,0.02)_0%,transparent_70%)]" />
          <motion.div 
            animate={{ opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-center z-10"
          >
             <p className="text-[11px] font-bold uppercase tracking-[0.8em] text-white/20 font-mono mb-4">Zero-Trust Browser Stream</p>
             <div className="h-[1px] w-32 bg-white/10 mx-auto" />
          </motion.div>
          <div className="absolute bottom-12 px-12 py-4 bg-white/[0.01] border border-white/5 rounded-full backdrop-blur-3xl">
             <span className="text-[8px] font-bold uppercase tracking-[0.4em] text-white/30 italic font-mono uppercase">Whitelabel Integration // P-GATEWAY-V3</span>
          </div>
       </div>
    </div>
  );
}

function MiniOIntelligence() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
       
       {/* ── Fractional Automations ── */}
       <div className="p-12 bg-white/[0.02] border border-white/5 rounded-[56px] backdrop-blur-3xl flex flex-col gap-10 group hover:bg-white/[0.03] transition-all">
          <div className="flex items-center justify-between">
             <div className="h-12 w-12 rounded-2xl bg-[#00FFAA]/5 border border-[#00FFAA]/20 flex items-center justify-center">
                <LogoMiniO size="sm" />
             </div>
             <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/20">MiniO // Fractional_Ops</span>
          </div>
          <div>
             <h3 className="text-2xl font-extralight tracking-[0.2em] uppercase text-white/90 mb-4">Fractional Paperwork</h3>
             <p className="text-xs font-light tracking-widest text-white/30 leading-relaxed uppercase">High-tier LLM orchestration for automated document ingestion and filing at 1/10th the traditional cost.</p>
          </div>
          <div className="space-y-4">
             {[
               { name: "Vehicle Information", cost: "$4.50", desc: "Automated VIN/Title processing" },
               { name: "Familiar Paperwork", cost: "$12.00", desc: "Complex legal/personal form mapping" }
             ].map(item => (
               <div key={item.name} className="p-6 bg-white/[0.01] border border-white/5 rounded-3xl flex items-center justify-between group hover:border-[#00FFAA]/30 transition-all cursor-pointer">
                  <div>
                    <span className="block text-xs font-light tracking-widest uppercase text-white/60 group-hover:text-white transition-colors">{item.name}</span>
                    <span className="block text-[8px] font-mono text-white/20 uppercase tracking-widest mt-1">{item.desc}</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#00FFAA]">{item.cost}</span>
               </div>
             ))}
          </div>
       </div>

       {/* ── Private Key Vault ── */}
       <div className="p-12 bg-white/[0.02] border border-white/5 rounded-[56px] backdrop-blur-3xl flex flex-col gap-10">
          <div>
             <h3 className="text-2xl font-extralight tracking-[0.2em] uppercase text-white/90 mb-4 text-center">Private LLM Keys</h3>
             <p className="text-center text-[9px] font-bold uppercase tracking-[0.5em] text-white/20 mb-12">Sovereign Financial Access</p>
          </div>
          
          <div className="space-y-6">
             {[
               { label: "QuickBooks LLM Key", key: "QB-LLM-••••••••", provider: "Financial Core" },
               { label: "Bank LLM Key", key: "BK-LLM-••••••••", provider: "Vault Access" }
             ].map(key => (
               <div key={key.label} className="relative p-8 bg-black/40 border border-white/5 rounded-3xl overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#00FFAA]/40" />
                  <div className="flex justify-between items-center mb-4">
                     <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/40">{key.label}</span>
                     <span className="text-[8px] font-mono text-[#00FFAA]/40 uppercase tracking-widest">{key.provider}</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="font-mono text-xs tracking-[0.3em] text-white/80">{key.key}</span>
                     <button className="text-[9px] font-bold uppercase tracking-widest text-[#00FFAA] hover:text-white transition-colors">UPDATE</button>
                  </div>
               </div>
             ))}
          </div>

          <button className="mt-6 w-full py-5 border border-white/5 rounded-3xl text-[9px] font-bold uppercase tracking-[0.6em] text-white/20 hover:text-white hover:bg-white/5 transition">Establish_New_Socket</button>
       </div>

    </div>
  );
}

function MiniODocuSign() {
  return (
    <div className="p-16 bg-white/[0.02] border border-white/5 rounded-[64px] backdrop-blur-3xl flex flex-col gap-16 relative overflow-hidden">
       <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-900/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
       
       <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="text-center md:text-left">
            <h3 className="text-3xl font-extralight tracking-[0.4em] uppercase text-white mb-4">Sovereign Signing</h3>
            <p className="text-[10px] font-bold uppercase tracking-[0.6em] text-[#00FFAA] opacity-60">DocuSign // Enterprise Core Integration</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="h-1 w-12 bg-white/10" />
             <LogoMiniO size="lg" />
             <div className="h-1 w-12 bg-white/10" />
          </div>
       </div>
       
       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {["Mutual NDA", "Asset Disclosure", "Liability Waiver"].map(doc => (
            <div key={doc} className="group p-10 bg-white/[0.01] border border-white/5 rounded-[40px] hover:bg-white/[0.03] hover:border-white/10 transition-all cursor-pointer text-center flex flex-col items-center">
               <div className="h-12 w-12 mb-8 rounded-full border border-white/10 flex items-center justify-center text-white/20 group-hover:text-[#00FFAA] transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
               </div>
               <span className="text-xs font-light tracking-[0.2em] text-white/50 group-hover:text-white transition-colors uppercase mb-8">{doc}</span>
               <button className="px-6 py-2 bg-white/5 rounded-full text-[8px] font-bold uppercase tracking-[0.3em] text-[#00FFAA] border border-[#00FFAA]/20 group-hover:bg-[#00FFAA] group-hover:text-black transition-all">Sign_Portal</button>
            </div>
          ))}
       </div>
    </div>
  );
}

export default function PlatformPage() {
  const [activeTab, setActiveTab] = useState<"maps" | "browser" | "intelligence" | "docusign">("intelligence");

  return (
    <main className="min-h-screen bg-black text-white font-sans selection:bg-[#00FFAA]/20">
       {/* ── MiniO Background ─────────────────────────────────── */}
       <div className="fixed inset-0 pointer-events-none overflow-hidden">
         <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] bg-cyan-950/15 rounded-full blur-[180px]" />
         <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-white/[0.01] rounded-full blur-[140px]" />
       </div>

       <div className="relative z-10 flex flex-col min-h-screen">
          
          {/* Nav */}
          <nav className="px-16 py-12 flex justify-between items-center bg-gradient-to-b from-black to-transparent">
             <div className="flex items-center gap-8">
                <LogoMiniO size="sm" />
                <span className="text-[11px] font-extralight uppercase tracking-[0.8em] text-white/40">MiniO Platform // Enterprise</span>
             </div>
             <div className="flex gap-16">
                {["intelligence", "maps", "browser", "docusign"].map(t => (
                  <button 
                    key={t}
                    onClick={() => setActiveTab(t as any)}
                    className={`text-[10px] font-bold uppercase tracking-[0.5em] transition-all duration-700 ${activeTab === t ? 'text-[#00FFAA] tracking-[0.8em]' : 'text-white/20 hover:text-white/50'}`}
                  >
                    {t}
                  </button>
                ))}
             </div>
          </nav>

          {/* Content Arena */}
          <section className="flex-1 px-16 pb-32">
             <div className="max-w-7xl mx-auto pt-20">
                
                <AnimatePresence mode="wait">
                   {activeTab === "intelligence" && (
                     <motion.div key="intelligence" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: 0.3 } }}>
                        <div className="mb-20 text-center">
                           <h2 className="text-5xl font-extralight tracking-[0.4em] uppercase mb-6">MiniO Intelligence</h2>
                           <p className="text-white/20 text-xs tracking-[0.5em] uppercase font-light">Autonomous Orchestration // Sovereign Private Keys</p>
                        </div>
                        <MiniOIntelligence />
                     </motion.div>
                   )}

                   {activeTab === "maps" && (
                     <motion.div key="maps" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                        <div className="mb-16 text-center">
                           <h2 className="text-5xl font-extralight tracking-[0.4em] uppercase mb-6">Elite Mapping</h2>
                           <p className="text-white/20 text-xs tracking-[0.5em] uppercase font-light">Photorealistic 3D Vibe // Google Maps V4</p>
                        </div>
                        <MiniOMap />
                     </motion.div>
                   )}

                   {activeTab === "browser" && (
                     <motion.div key="browser" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="mb-16 text-center">
                           <h2 className="text-5xl font-extralight tracking-[0.4em] uppercase mb-6">Blended Chrome</h2>
                           <p className="text-white/20 text-xs tracking-[0.5em] uppercase font-light">Chrome Enterprise Whitelabel // Zero-Trust Stream</p>
                        </div>
                        <MiniOChrome />
                     </motion.div>
                   )}

                   {activeTab === "docusign" && (
                     <motion.div key="docusign" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <div className="mb-16 text-center">
                           <h2 className="text-5xl font-extralight tracking-[0.4em] uppercase mb-6">Sovereign Signing</h2>
                           <p className="text-white/20 text-xs tracking-[0.5em] uppercase font-light">DocuSign Embedded Core // Vault Sync</p>
                        </div>
                        <MiniODocuSign />
                     </motion.div>
                   )}
                </AnimatePresence>

             </div>
          </section>

          <footer className="px-16 py-12 flex justify-between opacity-10 mt-auto border-t border-white/5">
             <span className="text-[9px] font-bold uppercase tracking-[0.6em]">MiniO Platform Core // 2026</span>
             <span className="text-[9px] font-bold uppercase tracking-[0.6em]">Vertex Prime Architectural Claim</span>
          </footer>
       </div>
    </main>
  );
}
