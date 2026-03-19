"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, BookOpen, Layers, Zap, Search, ArrowRight, ShieldCheck, Download, Archive, Terminal } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getPublicUrl } from "@/lib/supabase";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchVal, setSearchVal] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch("/api/projects").then(r => r.json()).then(data => {
      if (Array.isArray(data)) setProjects(data);
    }).finally(() => setLoading(false));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) router.push(`/archive?q=${encodeURIComponent(searchVal)}`);
  };

  const totalSlides = projects.reduce((acc, p) => acc + (p.slide_count || 0), 0);
  const subjects = Array.from(new Set(projects.map((p) => p.subject || "General")));

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] overflow-x-hidden transition-colors duration-500">
      
      {/* Dynamic Background Noise */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-0 mix-blend-overlay">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <filter id="noiseFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)"/>
        </svg>
      </div>

      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-[100] p-6 sm:p-8 lg:p-12 pointer-events-none">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between pointer-events-auto">
          <Link href="/" className="flex items-center gap-4 group">
            <div className="w-11 h-11 bg-[var(--primary)] text-white flex items-center justify-center rounded-[18px] shadow-2xl group-hover:rotate-[15deg] transition-all">
                <span className="font-black text-lg">V</span>
            </div>
            <div className="hidden sm:block">
               <h1 className="text-xl font-black tracking-tighter leading-none">VoidArchive</h1>
               <p className="text-[10px] font-black tracking-[0.4em] uppercase opacity-40">Preservation Engine</p>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/archive" className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-2xl glass font-black uppercase tracking-widest text-[10px] hover:bg-[var(--primary)] hover:text-white transition-all shadow-xl">
               Vault Protocol
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Exhibition */}
      <section className="relative pt-64 pb-32 px-5 flex flex-col items-center text-center">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-5xl z-10"
        >
          <div className="inline-flex items-center gap-3 px-6 py-2 bg-[var(--primary-muted)] border border-[var(--border)] rounded-full mb-12 animate-float">
            <ShieldCheck size={14} className="text-[var(--primary)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--primary)]">Authenticated Digital Legacy</span>
          </div>

          <h1 className="text-7xl sm:text-[10rem] lg:text-[12rem] font-black leading-[0.8] tracking-tighter mb-12 overflow-hidden">
            <span className="block mb-2">Sincere's</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] via-indigo-400 to-purple-400 animate-gradient-x">Labours</span>
          </h1>

          <p className="max-w-xl mx-auto text-lg text-[var(--fg-muted)] font-medium mb-12 leading-relaxed opacity-60">
            A high-fidelity digital monument preserving years of academic and creative output. 
            Compressed for the future, archived for history.
          </p>

          {/* New Search Experience */}
          <form onSubmit={handleSearch} className="relative w-full max-w-2xl mx-auto mb-20 group">
             <div className="absolute inset-0 bg-[var(--primary)] opacity-10 blur-3xl rounded-full scale-90 group-focus-within:scale-100 transition-transform"/>
             <div className="relative flex items-center p-2 bg-[var(--surface-1)] border-2 border-[var(--border)] rounded-[32px] focus-within:border-[var(--primary)] transition-all shadow-2xl">
                <Search size={22} className="ml-6 text-[var(--fg-subtle)]" />
                <input 
                  type="text" 
                  value={searchVal}
                  onChange={e => setSearchVal(e.target.value)}
                  placeholder="Query the Archive..." 
                  className="flex-1 bg-transparent px-6 py-4 font-black text-xl placeholder:text-[var(--fg-subtle)] outline-none"
                />
                <button type="submit" className="p-4 bg-[var(--primary)] text-white rounded-[24px] hover:scale-105 active:scale-95 transition-all shadow-xl">
                   <ArrowRight size={24} />
                </button>
             </div>
          </form>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
             {[
               { icon: <Archive size={20}/>, label: "Preserved Items", val: projects.length },
               { icon: <BookOpen size={20}/>, label: "Slide Assets", val: totalSlides },
               { icon: <Terminal size={20}/>, label: "Archive Nodes", val: subjects.length }
             ].map((s, i) => (
                <div key={i} className="surface-card p-10 rounded-[40px] text-center border-t border-white/5">
                   <div className="flex justify-center mb-6 text-[var(--primary)] opacity-40">{s.icon}</div>
                   <div className="text-5xl font-black mb-2 tracking-tighter">{s.val}</div>
                   <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">{s.label}</div>
                </div>
             ))}
          </div>
        </motion.div>
      </section>

      {/* Museum Ribbon */}
      <section className="py-24 bg-[var(--surface-2)] border-y border-[var(--border)] overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-12 mb-12 flex items-center justify-between">
           <div className="space-y-1">
             <h2 className="text-2xl font-black tracking-tighter">Exhibition Highlights</h2>
             <p className="text-sm font-medium text-[var(--fg-muted)]">Curation of the most impactful presentations.</p>
           </div>
           <Link href="/archive" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--primary)] hover:underline">
              Browse Vault <ChevronRight size={16} />
           </Link>
        </div>

        {projects.length > 0 && (
          <motion.div 
            animate={{ x: [0, -2000] }}
            transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
            className="flex gap-10 px-12 w-fit"
          >
            {projects.concat(projects).map((p, i) => (
               <Link 
                 key={i} 
                 href={`/projects/${p.id}`}
                 className="flex-shrink-0 w-[450px] aspect-video rounded-[40px] overflow-hidden border-4 border-[var(--border)] shadow-2xl hover:scale-105 active:scale-95 transition-all duration-500 group relative"
               >
                  <img src={getPublicUrl(p.id, p.thumbnail || "slide_01.webp")} className="w-full h-full object-cover group-hover:rotate-3 group-hover:scale-110 transition-all duration-700" alt="Preview" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-10 flex flex-col justify-end gap-3 translate-y-6 group-hover:translate-y-0 transition-all">
                     <span className="text-[10px] font-black tracking-[0.3em] text-[var(--primary)] uppercase">{p.subject}</span>
                     <h3 className="text-2xl font-black text-white leading-tight">{p.title}</h3>
                  </div>
               </Link>
            ))}
          </motion.div>
        )}
      </section>

      {/* Life's Work Section */}
      <section className="py-44 px-5 max-w-5xl mx-auto flex flex-col items-center text-center">
         <div className="w-20 h-20 bg-[var(--primary-muted)] rounded-3xl flex items-center justify-center text-[var(--primary)] mb-12">
            <Layers size={40} />
         </div>
         <h2 className="text-4xl sm:text-6xl font-black tracking-tighter mb-8 leading-none">Complete Preservation</h2>
         <p className="text-lg text-[var(--fg-muted)] font-medium leading-relaxed mb-12 opacity-70">
           This archive is a living record of academic evolution. Every document has been processed to 
           be high-fidelity but small-footprint, ensuring Sincere's work remains accessible across generations.
         </p>
         <Link href="/archive" className="px-12 py-5 bg-[var(--fg)] text-[var(--bg)] rounded-[24px] font-black uppercase tracking-widest text-xs shadow-2xl hover:scale-105 transition-all">
            Open The Vault System
         </Link>
      </section>

    </div>
  );
}
