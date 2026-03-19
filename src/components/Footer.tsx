import React from "react";
import Link from "next/link";
import { Github, Twitter, Mail, Instagram, ExternalLink, ShieldCheck } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full bg-[var(--bg)] border-t border-[var(--border)] py-12 px-5 sm:px-12 mt-auto transition-colors duration-300">
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* Identity */}
        <div className="md:col-span-2 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[var(--primary)] text-white flex items-center justify-center font-black">V</div>
            <h2 className="text-xl font-black tracking-tighter">VoidArchive</h2>
          </div>
          <p className="max-w-md text-sm font-medium text-[var(--fg-muted)] leading-relaxed">
            The official view-only legacy of Sincere Bhattarai. A refined digital monument dedicated to 
            preserving the academic and creative journey from the early digital years to modern mastery.
          </p>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--primary)] bg-[var(--primary-muted)] px-4 py-2 rounded-full w-fit">
            <ShieldCheck size={14} /> Official Proof of Integrity
          </div>
        </div>

        {/* Links */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[var(--fg-subtle)]">Navigation</h3>
          <ul className="space-y-2 text-sm font-bold">
            <li><Link href="/" className="hover:text-[var(--primary)] transition-colors">Digital Home</Link></li>
            <li><Link href="/archive" className="hover:text-[var(--primary)] transition-colors">The Vault</Link></li>
            <li><Link href="/archive" className="hover:text-[var(--primary)] transition-colors">Documentation</Link></li>
            <li><a href="https://github.com/VoidX3D/void-archive" target="_blank" className="flex items-center gap-1.5 hover:text-[var(--primary)] transition-colors">Sources <ExternalLink size={12}/></a></li>
          </ul>
        </div>

        {/* Connect */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[var(--fg-subtle)]">Connect</h3>
          <div className="flex items-center gap-4">
             <a href="#" className="p-3 bg-[var(--surface-2)] rounded-2xl hover:bg-[var(--primary)] hover:text-white transition-all duration-300"><Github size={18}/></a>
             <a href="#" className="p-3 bg-[var(--surface-2)] rounded-2xl hover:bg-[var(--primary)] hover:text-white transition-all duration-300"><Twitter size={18}/></a>
             <a href="#" className="p-3 bg-[var(--surface-2)] rounded-2xl hover:bg-[var(--primary)] hover:text-white transition-all duration-300"><Mail size={18}/></a>
          </div>
          <p className="text-[10px] font-medium text-[var(--fg-subtle)] pt-2">
            Professional inquiries via encrypted archive channels only.
          </p>
        </div>

      </div>

      {/* Copyright Strip */}
      <div className="max-w-[1600px] mx-auto mt-12 pt-8 border-t border-[var(--border)] flex flex-col sm:flex-row justify-between items-center gap-4 opacity-40">
        <p className="text-[10px] font-black uppercase tracking-widest">
          © {currentYear} Sincere Bhattarai — Encrypted & Preserved.
        </p>
        <p className="text-[10px] font-black uppercase tracking-widest">
          VoidOS Architecture v2.4.0
        </p>
      </div>
    </footer>
  );
}
