import React from "react";
import Link from "next/link";
import { Github, Twitter, Mail, ExternalLink, ShieldCheck } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full bg-[var(--m3-surface-container-low)] border-t border-[var(--m3-surface-variant)] py-24 px-8 mt-auto transition-all duration-700">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
        
        {/* Identity */}
        <div className="md:col-span-2 space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-[var(--m3-primary)] text-[var(--m3-on-primary)] flex items-center justify-center font-black text-xl shadow-lg">V</div>
            <h2 className="text-2xl font-black tracking-tighter uppercase italic">VoidArchive</h2>
          </div>
          <p className="max-w-md text-base font-medium text-[var(--m3-on-surface-variant)] leading-relaxed">
            The official digital monument of Sincere Bhattarai. 
            A high-fidelity system dedicated to preservation of academic legacy 
            and creative evolution.
          </p>
          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--m3-primary)] bg-[var(--m3-primary-container)] px-6 py-3 rounded-full w-fit shadow-sm border border-[var(--m3-outline)]/10">
            <ShieldCheck size={16} /> Encryption Verified • Node v2.4
          </div>
        </div>

        {/* Links */}
        <div className="space-y-6">
          <h3 className="text-xs font-black uppercase tracking-[0.5em] opacity-40">Registry</h3>
          <ul className="space-y-4 text-sm font-black uppercase tracking-widest">
            <li><Link href="/" className="hover:text-[var(--m3-primary)] transition-colors">Surface</Link></li>
            <li><Link href="/archive" className="hover:text-[var(--m3-primary)] transition-colors">The Vault</Link></li>
            <li><a href="https://github.com/VoidX3D/void-archive" target="_blank" className="flex items-center gap-2 hover:text-[var(--m3-primary)] transition-colors">Code Log <ExternalLink size={14}/></a></li>
          </ul>
        </div>

        {/* Connect */}
        <div className="space-y-6">
          <h3 className="text-xs font-black uppercase tracking-[0.5em] opacity-40">Channels</h3>
          <div className="flex items-center gap-3">
             <a href="#" className="p-4 bg-[var(--m3-surface-container-high)] rounded-2xl hover:bg-[var(--m3-primary)] hover:text-[var(--m3-on-primary)] transition-all shadow-md"><Github size={20}/></a>
             <a href="#" className="p-4 bg-[var(--m3-surface-container-high)] rounded-2xl hover:bg-[var(--m3-primary)] hover:text-[var(--m3-on-primary)] transition-all shadow-md"><Mail size={20}/></a>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 pt-4 font-mono">
            Location: Kathmandu, Nepal
          </p>
        </div>

      </div>

      {/* Copyright Strip */}
      <div className="max-w-[1440px] mx-auto mt-24 pt-12 border-t border-[var(--m3-outline)]/10 flex flex-col sm:flex-row justify-between items-center gap-8">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-30">
          © {currentYear} SINCERE BHATTARAI • ALL RIGHTS RESERVED
        </p>
        <div className="flex items-center gap-10 opacity-20">
           <div className="text-[10px] font-black uppercase tracking-[0.3em]">SECURE ACCESS</div>
           <div className="text-[10px] font-black uppercase tracking-[0.3em]">VOID ARCHIVE OS</div>
        </div>
      </div>
    </footer>
  );
}
