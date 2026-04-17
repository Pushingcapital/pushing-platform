"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

interface DriveFileEntry {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  size: string | null;
  downloadUrl: string;
  isPdf: boolean;
  isImage: boolean;
  isGoogleDoc: boolean;
  webViewLink?: string;
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

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function getMimeIcon(entry: DriveFileEntry) {
  if (entry.isPdf) return "📄";
  if (entry.isImage) return "🖼️";
  if (entry.isGoogleDoc) return "📝";
  return "📎";
}

// ── Component ─────────────────────────────────────────────────────────────

function FicoRing({ score }: { score: number }) {
  const color = scoreColor(score);
  const percentage = (score - 300) / 550; // FICO ranges 300-850
  const strokeDasharray = 283; // 2 * PI * 45
  const strokeDashoffset = strokeDasharray * (1 - percentage);

  return (
    <div className="relative h-64 w-64 flex items-center justify-center">
      <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="6" />
        <motion.circle 
          cx="50" cy="50" r="45" 
          fill="transparent" 
          stroke={color} 
          strokeWidth="6" 
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: strokeDasharray }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 2, ease: "easeOut" }}
          strokeLinecap="round"
          className="drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-5xl font-extralight tracking-tight text-white mb-1">{score}</span>
        <span className="text-[10px] font-bold uppercase tracking-[0.4em]" style={{ color }}>{scoreLabel(score)}</span>
      </div>
    </div>
  );
}

export default function ClarityDashboard({ report }: { report: CreditReport | null }) {
  const [tab, setTab] = useState<"overview" | "accounts" | "inquiries" | "documents">("overview");
  const [driveFiles, setDriveFiles] = useState<DriveFileEntry[]>([]);
  const [driveLoading, setDriveLoading] = useState(false);
  const [driveError, setDriveError] = useState<string | null>(null);
  const [viewingFile, setViewingFile] = useState<DriveFileEntry | null>(null);
  const [searchMode, setSearchMode] = useState<"credit" | "recent">("credit");

  // Fetch Drive files when documents tab opens
  const fetchFiles = useCallback(async (mode: "credit" | "recent") => {
    setDriveLoading(true);
    setDriveError(null);
    try {
      const action = mode === "credit" ? "search" : "recent";
      const res = await fetch(`/api/credit-report?action=${action}`);
      const data = await res.json();
      if (data.ok) {
        setDriveFiles(data.files);
        if (data.files.length === 0 && mode === "credit") {
          setSearchMode("recent");
          const recentRes = await fetch("/api/credit-report?action=recent");
          const recentData = await recentRes.json();
          if (recentData.ok) setDriveFiles(recentData.files);
        }
      } else {
        setDriveError(data.error || "Failed to fetch files");
      }
    } catch {
      setDriveError("Network error fetching Drive files");
    } finally {
      setDriveLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "documents" && driveFiles.length === 0 && !driveLoading) {
      fetchFiles(searchMode);
    }
  }, [tab, driveFiles.length, driveLoading, fetchFiles, searchMode]);

  const data: CreditReport = report || {
    ficoScore: 742,
    scoreDate: new Date().toLocaleDateString(),
    scoreFactors: [
      { label: "On-time payment history", impact: "positive" },
      { label: "Low revolving utilization", impact: "positive" },
      { label: "Recent hard inquiry (Chase)", impact: "negative" }
    ],
    accounts: [
      { creditor: "American Express", type: "revolving", balance: 1240, limit: 15000, status: "current", utilization: 8, paymentHistory: ["ok","ok","ok","ok","ok","ok","ok","ok","ok","ok","ok","ok"] },
      { creditor: "Chase Sapphire", type: "revolving", balance: 450, limit: 10000, status: "current", utilization: 4.5, paymentHistory: ["ok","ok","ok","ok","ok","ok","ok","ok","ok","ok","ok","ok"] },
      { creditor: "Ford Motor Credit", type: "installment", balance: 28500, limit: 0, status: "current", utilization: 0, paymentHistory: ["ok","ok","ok","ok","ok","ok","ok","ok","ok","ok","ok","ok"] }
    ],
    inquiries: [
      { creditor: "Chase Card", date: "2026-03-12", type: "hard" },
      { creditor: "Amex", date: "2025-11-20", type: "soft" }
    ],
    totalDebt: 30190,
    totalAvailable: 25000,
    overallUtilization: 6.7
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-12 animate-in fade-in duration-1000 pb-32">
      
      {/* ── Score Header ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-16 py-12">
        <FicoRing score={data.ficoScore} />
        
        {data.scoreFactors && (
          <div className="flex flex-col gap-4 max-w-sm">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/20 mb-2">Key_Score_Factors</span>
            {data.scoreFactors.map((f, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 bg-white/[0.01] border border-white/5 rounded-2xl">
                <span className="text-xs">{f.impact === "positive" ? "✅" : "⚠️"}</span>
                <span className={`text-[11px] font-medium tracking-wide ${f.impact === "positive" ? "text-emerald-400/80" : "text-rose-400/80"}`}>{f.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Tabs ───────────────────────────────────────────────── */}
      <div className="flex gap-2 p-1.5 bg-white/[0.02] border border-white/5 rounded-[24px] backdrop-blur-xl">
        {(["overview", "accounts", "inquiries", "documents"] as const).map(t => (
          <button 
            key={t} 
            onClick={() => setTab(t)} 
            className={`flex-1 py-4 px-2 rounded-[18px] text-[9px] font-bold uppercase tracking-[0.3em] transition-all
              ${tab === t ? 'bg-white/[0.05] text-[#00FFAA] shadow-[0_4px_12px_rgba(0,0,0,0.5)]' : 'text-white/20 hover:text-white/40'}`}
          >
            {t === "documents" ? "📁 pushes" : t}
          </button>
        ))}
      </div>

      {/* ── Tab Content Area ───────────────────────────────────── */}
      <div className="min-h-[400px]">
        {tab === "overview" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="p-10 bg-white/[0.01] border border-white/5 rounded-[48px] backdrop-blur-3xl">
              <div className="flex justify-between items-end mb-12 text-left">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/20 mb-4">Capital_Utilization</p>
                  <span className="text-4xl font-extralight tracking-tight text-white">${data.totalDebt.toLocaleString()}</span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/20 mb-4">Available_Liquidity</p>
                  <span className="text-2xl font-extralight tracking-tight text-emerald-400/80">${data.totalAvailable.toLocaleString()}</span>
                </div>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden mb-4">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: `${data.overallUtilization}%` }} 
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-[linear-gradient(90deg,#34d399,#06b6d4)]" 
                />
              </div>
              <p className="text-[9px] font-mono text-right text-white/20 uppercase tracking-widest">{data.overallUtilization}% System_Utilization</p>
            </div>
          </motion.div>
        )}

        {tab === "accounts" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 gap-6">
            {data.accounts.map((a, i) => (
              <div key={i} className="p-8 bg-white/[0.01] border border-white/5 rounded-[40px] hover:bg-white/[0.02] transition-all group text-left">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-lg font-light tracking-[0.1em] text-white mb-2">{a.creditor}</h3>
                    <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/20">{a.type}</span>
                  </div>
                  <div className="px-4 py-2 rounded-full border border-white/5 bg-white/[0.02] text-[8px] font-bold uppercase tracking-widest text-emerald-400/60">
                    {a.status}
                  </div>
                </div>
                <div className="flex justify-between items-end">
                   <div className="space-y-1">
                      <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/10">Balance</p>
                      <p className="text-xl font-extralight tracking-tight text-white">${a.balance.toLocaleString()}</p>
                   </div>
                   <div className="text-right space-y-4 flex-1 max-w-[200px] ml-12">
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                         <div className="h-full bg-emerald-400/40" style={{ width: `${a.utilization}%` }} />
                      </div>
                      <p className="text-[8px] font-mono text-white/10 uppercase tracking-widest">{a.utilization}% Limit_Ratio</p>
                   </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {tab === "inquiries" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {data.inquiries.map((inq, i) => (
              <div key={i} className="flex justify-between items-center p-8 bg-white/[0.01] border border-white/5 rounded-[32px] text-left">
                <div>
                  <h4 className="text-sm font-light tracking-[0.1em] text-white mb-1">{inq.creditor}</h4>
                  <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/20">{inq.date}</p>
                </div>
                <span className={`px-4 py-2 rounded-full border border-white/5 text-[8px] font-bold uppercase tracking-widest 
                  ${inq.type === 'hard' ? 'text-rose-400/60' : 'text-emerald-400/60'}`}>
                  {inq.type}_Inquiry
                </span>
              </div>
            ))}
          </motion.div>
        )}

        {tab === "documents" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="flex justify-between items-center px-4 text-left">
               <div>
                  <h3 className="text-xl font-extralight tracking-[0.2em] uppercase text-white mb-2">pushingFormulas</h3>
                  <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/20">Sovereign_Document_Staging</p>
               </div>
               <button onClick={() => fetchFiles(searchMode)} className="h-12 w-12 rounded-full border border-white/5 flex items-center justify-center hover:bg-white/5 transition-all text-white/40">
                  <span className={driveLoading ? 'animate-spin' : ''}>🔄</span>
               </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {driveFiles.length === 0 && !driveLoading ? (
                <div className="col-span-full p-20 border border-dashed border-white/5 rounded-[56px] flex flex-col items-center justify-center text-center gap-4">
                   <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/20">No documents found in staging</span>
                </div>
              ) : driveFiles.map((file, i) => (
                <div key={i} onClick={() => setViewingFile(file)} className="p-8 bg-white/[0.01] border border-white/5 rounded-[40px] hover:bg-white/[0.03] transition-all cursor-pointer group text-left">
                  <div className="flex items-center gap-6">
                    <div className="h-16 w-16 rounded-[24px] bg-white/[0.02] border border-white/5 flex items-center justify-center text-2xl grayscale group-hover:grayscale-0 transition-all">
                       {getMimeIcon(file)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-white/80 truncate mb-2">{file.name}</p>
                      <p className="text-[9px] font-mono text-white/20 uppercase tracking-widest">{file.size || '0 KB'} // {timeAgo(file.modifiedTime)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Document Viewer ────────────────────────────────────── */}
      <AnimatePresence>
        {viewingFile && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl p-12 flex flex-col"
          >
            <div className="flex justify-between items-center mb-12">
               <div>
                  <h3 className="text-xl font-extralight tracking-tight text-white mb-2">{viewingFile.name}</h3>
                  <p className="text-[9px] font-mono text-white/20 uppercase tracking-widest">{viewingFile.size} // Vault_Origin</p>
               </div>
               <button onClick={() => setViewingFile(null)} className="h-16 w-16 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all">
                  ✕
               </button>
            </div>
            <div className="flex-1 rounded-[48px] overflow-hidden bg-white/[0.02] border border-white/5">
               <iframe src={viewingFile.downloadUrl} className="w-full h-full border-none grayscale contrast-[1.1]" title={viewingFile.name} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 flex justify-around p-8 border-t border-white/5 bg-black/80 backdrop-blur-xl z-[90]">
        {[
          { label: "Vault", href: "/vault", icon: "🔐" },
          { label: "Clarity", href: "/clarity", icon: "📊", active: true },
          { label: "Browse", href: "/browse", icon: "🌐" },
          { label: "Settings", href: "/settings", icon: "⚙️" },
        ].map(n => (
          <a key={n.label} href={n.href} className={`flex flex-col items-center gap-2 ${n.active ? 'text-[#00FFAA]' : 'text-white/20'}`}>
            <span className="text-xl">{n.icon}</span>
            <span className="text-[8px] font-bold uppercase tracking-widest">{n.label}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}
