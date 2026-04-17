"use client";
import React, { useState, useEffect } from 'react';
import { ArrowRight, ShieldCheck, Car, Landmark, Download, Menu, X, Globe } from 'lucide-react';
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

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

const Header = ({ setNavOpen, isNavOpen }: any) => (
  <header className="fixed top-0 left-0 w-full z-50 text-gray-300">
    <div className="container mx-auto px-6 py-4 flex justify-between items-center backdrop-blur-md bg-black/30 border-b border-gray-800/50">
      <div className="flex items-center gap-3">
        <LogoMiniO size="sm" />
        <span className="text-xl font-bold tracking-widest text-gray-100">PUSHING CAPITAL</span>
      </div>
      <nav className="hidden md:flex items-center space-x-8">
        <a href="#verticals" className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] hover:text-[#00FFAA] transition-colors duration-300">Verticals</a>
        <a href="#intel" className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] hover:text-[#00FFAA] transition-colors duration-300">Intel</a>
        <a href="#architect" className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] hover:text-[#00FFAA] transition-colors duration-300">Architects</a>
      </nav>
      <div className="hidden md:block">
        <button onClick={() => window.location.href='/onboard'} className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] border border-gray-600 px-6 py-2 rounded-full hover:border-[#00FFAA] hover:text-[#00FFAA] transition-colors duration-300">
          Sanctuary Access
        </button>
      </div>
      <div className="md:hidden">
        <button onClick={() => setNavOpen(!isNavOpen)}>
          {isNavOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </div>
  </header>
);

const MobileNav = ({ isOpen }: any) => (
  <div className={`fixed top-0 left-0 w-full h-full bg-black z-40 transform ${isOpen ? 'translate-y-0' : '-translate-y-full'} transition-transform duration-300 ease-in-out md:hidden`}>
    <div className="container mx-auto px-6 pt-24 flex flex-col items-center space-y-8 text-center">
        <a href="#verticals" className="font-mono text-xl text-gray-200 hover:text-[#00FFAA] transition-colors duration-300">Verticals</a>
        <a href="#intel" className="font-mono text-xl text-gray-200 hover:text-[#00FFAA] transition-colors duration-300">Intel</a>
        <a href="#architect" className="font-mono text-xl text-gray-200 hover:text-[#00FFAA] transition-colors duration-300">Architects</a>
        <button onClick={() => window.location.href='/onboard'} className="font-mono text-lg border border-[#00FFAA] text-[#00FFAA] px-10 py-4 rounded-full mt-8 uppercase tracking-widest">
          Enter Sanctuary
        </button>
    </div>
  </div>
);


const HeroSection = () => (
    <section className="relative min-h-screen flex items-center justify-center text-center overflow-hidden pt-20">
      <div className="absolute inset-0 bg-black z-0">
        <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-950/20 via-cyan-950/10 to-transparent blur-3xl opacity-50 animate-pulse"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#00FFAA]/5 via-[#00FFAA]/5 to-transparent blur-3xl opacity-30 animate-pulse [animation-delay:2s]"></div>
      </div>
      <div className="container mx-auto px-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
            <div className="mb-12 flex justify-center">
                <LogoMiniO size="lg" />
            </div>
            <h1 className="text-[clamp(3rem,10vw,7rem)] font-extralight tracking-[-0.03em] leading-[0.85] text-transparent bg-clip-text bg-[linear-gradient(180deg,#fff_0%,#444_100%)] mb-8">
              ARCHITECTING<br/><span className="font-black text-[#00FFAA]">ALPHA</span>
            </h1>
            <p className="font-mono text-xs md:text-sm text-gray-500 max-w-xl mx-auto mb-12 uppercase tracking-[0.5em] leading-relaxed">
              Precision capital deployment // <span className="text-white/40">Sovereign infrastructure for the trillion-dollar strike.</span>
            </p>
            <div className="flex flex-col items-center gap-12">
              <button onClick={() => window.location.href='/onboard'} className="group relative inline-flex items-center justify-center bg-[#00FFAA] text-black font-bold py-4 px-12 rounded-full overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(0,255,170,0.2)]">
                <span className="relative z-10 flex items-center uppercase tracking-widest text-sm">
                  Initialize Protocol <ArrowRight className="ml-3 h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" />
                </span>
              </button>
              
              <div className="flex flex-col items-center gap-4 opacity-20 hover:opacity-100 transition-opacity duration-700 cursor-pointer" onClick={() => window.location.href='/onboard'}>
                 <span className="text-[9px] font-bold uppercase tracking-[0.8em]">pushingSecurity</span>
                 <div className="h-[1px] w-24 bg-[linear-gradient(90deg,transparent,#00FFAA,transparent)]" />
              </div>
            </div>
        </motion.div>
      </div>
    </section>
);

const ServiceCard = ({ icon, title, description }: any) => (
    <div className="bg-white/[0.01] border border-white/5 p-10 rounded-[32px] backdrop-blur-md transition-all duration-500 hover:border-[#00FFAA]/30 hover:-translate-y-2 group">
        <div className="mb-8 text-[#00FFAA] opacity-40 group-hover:opacity-100 transition-opacity duration-500">
            {icon}
        </div>
        <h3 className="text-xl font-light tracking-[0.2em] text-gray-100 mb-4 uppercase">{title}</h3>
        <p className="text-gray-500 font-light text-xs leading-relaxed tracking-widest uppercase">{description}</p>
    </div>
);

const CoreServicesSection = () => (
    <section id="verticals" className="py-20 md:py-32 bg-black">
        <div className="container mx-auto px-6">
            <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-100">Core Verticals</h2>
                <p className="font-mono text-gray-500 mt-2">Specialized capital allocation frameworks.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <ServiceCard 
                    icon={<Car size={32} />} 
                    title="Automotive Futures" 
                    description="Pioneering next-generation mobility platforms and resilient supply chain logistics." 
                />
                <ServiceCard 
                    icon={<Landmark size={32} />} 
                    title="Decentralized Finance" 
                    description="Building the institutional-grade infrastructure for novel value transfer protocols." 
                />
                <ServiceCard 
                    icon={<ShieldCheck size={32} />} 
                    title="Cybernetic Security" 
                    description="Securing sovereign digital assets and critical infrastructure against emergent threats." 
                />
            </div>
        </div>
    </section>
);

const DealArchitectCTA = () => (
    <section id="architect" className="relative py-20 md:py-32 bg-gray-950 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10">
            <div className="absolute left-0 top-0 w-1/2 h-full bg-[radial-gradient(ellipse_at_left,_var(--tw-gradient-stops))] from-cyan-900 to-transparent"></div>
            <div className="absolute right-0 bottom-0 w-1/2 h-full bg-[radial-gradient(ellipse_at_right,_var(--tw-gradient-stops))] from-[#00FFAA]/10 to-transparent"></div>
        </div>
        <div className="container mx-auto px-6 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-100 mb-4">Become A Deal Architect</h2>
            <p className="font-mono text-gray-400 max-w-2xl mx-auto mb-8">Source, structure, and execute with the Pushing Capital operational framework. Access proprietary deal flow and our global network.</p>
            <button className="group relative inline-flex items-center justify-center border-2 border-[#00FFAA] text-[#00FFAA] font-bold py-3 px-8 rounded-sm overflow-hidden transition-all duration-300 hover:bg-[#00FFAA] hover:text-black">
                <span className="relative z-10 flex items-center">
                    Initiate Protocol <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
            </button>
        </div>
    </section>
);

const MediaGrid = () => {
    const assets = [
        { title: "Q4 Market Analysis.pdf", size: "3.1 MB" },
        { title: "Brand Guidelines.zip", size: "12.8 MB" },
        { title: "API Documentation.md", size: "0.4 MB" },
        { title: "Vector Logo Pack.svg", size: "1.2 MB" }
    ];

    return (
        <section id="intel" className="py-20 md:py-32 bg-black">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-100">Intelligence & Assets</h2>
                    <p className="font-mono text-gray-500 mt-2">Download proprietary reports and brand materials.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {assets.map((asset, index) => (
                        <div key={index} className="bg-gray-950 border border-gray-800 rounded-sm p-6 flex flex-col justify-between transition-all duration-300 hover:border-gray-700">
                            <div>
                                <h4 className="font-mono text-gray-200">{asset.title}</h4>
                                <p className="text-xs text-gray-500 mt-1">{asset.size}</p>
                            </div>
                            <button className="group mt-6 w-full flex items-center justify-center text-sm bg-gray-800/50 text-gray-300 py-2 rounded-sm hover:bg-[#00FFAA] hover:text-black transition-colors duration-300">
                                <Download className="mr-2 h-4 w-4" /> Download
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};


const Footer = () => (
    <footer className="bg-black border-t border-gray-900">
        <div className="container mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="mb-4 md:mb-0">
                    <p className="font-mono text-sm text-gray-600">&copy; {new Date().getFullYear()} Pushing Capital. All Rights Reserved.</p>
                </div>
                <div className="flex items-center space-x-6 text-gray-500">
                   <a href="#" className="hover:text-[#00FFAA] transition-colors duration-300">Terms of Service</a>
                   <a href="#" className="hover:text-[#00FFAA] transition-colors duration-300">Privacy Policy</a>
                </div>
            </div>
        </div>
    </footer>
);

export default function PushingCapitalPage() {
    const [isNavOpen, setNavOpen] = useState(false);

    useEffect(() => {
        if (isNavOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }, [isNavOpen]);

    return (
        <div className="bg-black min-h-screen text-gray-300 antialiased">
            <Header setNavOpen={setNavOpen} isNavOpen={isNavOpen} />
            <MobileNav isOpen={isNavOpen} />
            <main>
                <HeroSection />
                <CoreServicesSection />
                <DealArchitectCTA />
                <MediaGrid />
            </main>
            <Footer />
        </div>
    );
}