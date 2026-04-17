"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

type Step = "auth" | "biometric" | "license" | "synthesis" | "active";

// --- MiniO Identity Components ---

function LogoMiniO({ size = "md", status = "READY" }: { size?: "sm" | "md" | "lg", status?: string }) {
  const dimensions = size === "sm" ? "h-10 w-10" : size === "md" ? "h-20 w-20" : "h-32 w-32";
  const pSize = size === "sm" ? 20 : size === "md" ? 40 : 80;
  const isSyncing = status.includes("SYNC") || status.includes("INGEST") || status.includes("PROCESS");
  
  return (
    <div className={`relative ${dimensions} flex items-center justify-center`}>
      <div className={`absolute inset-0 rounded-full border border-white/5`} />
      <motion.div 
        animate={isSyncing ? { scale: [1, 1.02, 1], opacity: [0.2, 0.4, 0.2] } : {}}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute inset-0 rounded-full border-[0.5px] border-[#00FFAA]/30 ${isSyncing ? 'shadow-[0_0_30px_rgba(0,255,170,0.15)]' : ''}`}
      />
      <div className="relative z-10 flex items-center justify-center">
        <Image src="/brand/p-glass-mark.png" alt="P" width={pSize} height={pSize} className="opacity-90 brightness-125" />
      </div>
    </div>
  );
}

export function OnboardingIntakeForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("auth");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    accessKey: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (step === "biometric") {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
        .then(stream => { if (videoRef.current) videoRef.current.srcObject = stream; })
        .catch(err => console.error("Camera Error:", err));
    }
  }, [step]);

  const advance = (next: Step) => setStep(next);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    advance("synthesis");
    
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          email: formData.email,
          intakeAudience: "service-buyer",
          serviceFamily: "automotive",
        }),
      });
      
      const result = await response.json();
      console.log("Onboarding Result:", result);
      
      if (result.job) {
        setTimeout(() => advance("active"), 2000);
      } else {
        throw new Error(result.error || "Failed to create onboarding job");
      }
    } catch (error) {
      console.error("Submission Error:", error);
      alert("Verification failed. Please check your network and try again.");
      advance("auth");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#000000] text-white font-sans selection:bg-[#00FFAA]/20 overflow-hidden flex flex-col items-center">
      
      {/* ── UNIFIED VOID ── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-cyan-950/15 rounded-full blur-[160px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-white/[0.01] rounded-full blur-[140px]" />
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-12 py-10">
        <div className="flex items-center gap-6" onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
          <LogoMiniO size="sm" />
          <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/40">pushing<span className="text-white/80">Security</span></span>
        </div>
      </nav>

      <div className="relative z-10 w-full max-w-xl flex-1 flex flex-col justify-center px-6 pt-20">
        <AnimatePresence mode="wait">
          
          {step === "auth" && (
            <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
              <div className="mb-20 flex justify-center"><LogoMiniO size="lg" /></div>
              <h1 className="text-3xl font-extralight tracking-[0.3em] uppercase mb-12">Sanctuary Gate</h1>
              <div className="max-w-md mx-auto mb-12 space-y-6">
                 {[
                   { label: "FIRST NAME", value: formData.firstName, key: "firstName", type: "text" },
                   { label: "LAST NAME", value: formData.lastName, key: "lastName", type: "text" },
                   { label: "EMAIL ADDRESS", value: formData.email, key: "email", type: "email" },
                   { label: "PHONE NUMBER", value: formData.phone, key: "phone", type: "tel" },
                   { label: "ACCESS KEY", value: formData.accessKey, key: "accessKey", type: "password", tracking: "tracking-[0.8em]" }
                 ].map((field) => (
                   <div key={field.key} className="relative group">
                     <div className="absolute inset-0 bg-white/[0.01] rounded-2xl border border-white/5 group-focus-within:border-[#00FFAA]/20 transition-all blur-[2px]" />
                     <input 
                       type={field.type} 
                       placeholder={field.label} 
                       value={field.value as string}
                       onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                       className={`relative w-full bg-transparent border-none px-6 py-5 text-center font-mono ${field.tracking || 'tracking-[0.2em]'} text-xs outline-none text-white/80 placeholder:text-white/10 transition-colors`} 
                     />
                   </div>
                 ))}
              </div>
              <button onClick={() => advance("biometric")} className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/30 hover:text-[#00FFAA] transition-all py-4 px-8 rounded-full border border-white/5 hover:bg-[#00FFAA]/5">Initialize_Handshake →</button>
            </motion.div>
          )}

          {step === "biometric" && (
            <motion.div key="bio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
              <div className="relative w-64 h-64 mx-auto rounded-full overflow-hidden border border-white/10 bg-black mb-16">
                 <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1] opacity-60 grayscale" />
                 <div className="absolute inset-0 border-[0.5px] border-[#00FFAA]/20 rounded-full animate-pulse" />
              </div>
              <h2 className="text-xl font-light tracking-[0.3em] uppercase mb-16">Confirm Identity</h2>
              <button onClick={() => advance("license")} className="h-16 w-16 rounded-full border border-white/10 flex items-center justify-center hover:border-[#00FFAA] transition-all"><div className="h-2 w-2 rounded-full bg-white" /></button>
            </motion.div>
          )}

          {step === "license" && (
            <motion.div key="lic" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
              <div className="mb-16 flex justify-center opacity-40"><LogoMiniO size="md" /></div>
              <h2 className="text-xl font-light tracking-[0.3em] uppercase mb-16">Credential Ingest</h2>
              <div className="aspect-[1.58/1] w-full max-w-sm mx-auto bg-white/[0.02] border border-white/5 rounded-[40px] flex items-center justify-center hover:bg-white/[0.04] transition-all cursor-pointer">
                 <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/20">Drop Identity Card</span>
              </div>
              <button onClick={handleSubmit} className="mt-20 text-[10px] font-bold uppercase tracking-[0.4em] text-white/40 hover:text-white transition-all">Execute_Synthesis →</button>
            </motion.div>
          )}

          {step === "synthesis" && (
            <motion.div key="syn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <div className="flex justify-center mb-16">
                 <div className="h-24 w-24 relative flex items-center justify-center">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-full border-t border-[#00FFAA]" />
                    <div className="h-1 w-1 rounded-full bg-white" />
                 </div>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-[0.6em] text-white/20 animate-pulse">Orchestrating Sanctuary</span>
            </motion.div>
          )}

          {step === "active" && (
            <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <div className="mb-20 flex justify-center"><LogoMiniO size="lg" /></div>
              <h1 className="text-3xl font-extralight tracking-[0.3em] uppercase mb-8">Verified.</h1>
              <p className="text-white/20 text-[10px] tracking-[0.4em] uppercase mb-20 italic">The Sanctuary is Adaptive to your Identity.</p>
              <button onClick={() => router.push('/exit-node')} className="text-[10px] font-bold uppercase tracking-[0.5em] text-[#00FFAA]">[ Access_Hub ]</button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      <footer className="px-12 py-12 flex justify-center opacity-10">
          <span className="text-[8px] font-bold uppercase tracking-[0.5em]">MiniO Sanctuary // P-V3</span>
      </footer>

    </div>
  );
}
