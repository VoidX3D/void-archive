"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, BookOpen, Search, ArrowRight, ShieldCheck, Archive } from "lucide-react";
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
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] transition-all duration-700">
      
      {/* GLOSSY NAV */}
      <nav className="fixed top-0 inset-x-0 z-[100] px-8 py-6 flex items-center justify-between glass border-b border-[var(--border)]">
        <Link href="/" className="flex items-center gap-4 group">
          <div className="w-10 h-10 bg-[var(--fg)] text-[var(--bg)] flex items-center justify-center rounded-xl shadow-2xl transition-all">
              <span className="font-black text-lg">V</span>
          </div>
          <div className="hidden sm:block">
             <h1 className="text-xl font-black tracking-tight leading-none">VoidArchive</h1>
             <p className="text-[10px] font-black tracking-[0.4em] uppercase opacity-40">The Legacy Museum</p>
          </div>
        </Link>
        <div className="flex items-center gap-6">
          <ThemeToggle />
          <Link href="/archive" className="px-8 py-2.5 bg-[#EEE] dark:bg-[#222] border border-[var(--border)] rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-[var(--fg)] hover:text-[var(--bg)] transition-all flex items-center gap-2">
             THE VAULT <ArrowRight size={14}/>
          </Link>
        </div>
      </nav>

      {/* MINIMALIST HERO */}
      <section className="relative pt-64 pb-24 px-5 flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-5xl z-10 text-center"
        >
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-full mb-12 animate-float">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">System Core Online</span>
          </div>

          <h1 className="text-8xl sm:text-[11rem] lg:text-[13rem] font-black leading-[0.8] tracking-tight mb-16 select-none opacity-100 dark:mix-blend-difference">
            DIGITAL<br />
            <span className="text-transparent bg-[var(--fg)] bg-clip-text">LEGACY</span>
          </h1>

          <p className="max-w-2xl mx-auto text-xl text-[var(--fg-muted)] font-medium mb-16 leading-relaxed opacity-60">
            A refined collection of academic labour, preserved in high-fidelity for the future. 
            Minimalist architecture. Maximum fidelity.
          </p>

          {/* GLOSSY SEARCH */}
          <form onSubmit={handleSearch} className="relative w-full max-w-2xl mx-auto mb-20 group">
             <div className="absolute inset-0 bg-black/10 dark:bg-white/10 opacity-5 blur-3xl rounded-full scale-110"/>
             <div className="relative flex items-center p-2 bg-[var(--bg)] border-2 border-[var(--border)] rounded-full focus-within:border-[var(--fg)] transition-all shadow-2xl overflow-hidden glass">
                <Search size={24} className="ml-8 text-[var(--fg-subtle)]" />
                <input 
                  type="text" 
                  value={searchVal}
                  onChange={e => setSearchVal(e.target.value)}
                  placeholder="Query archival nodes..." 
                  className="flex-1 bg-transparent px-8 py-6 font-black text-2xl placeholder:opacity-20 outline-none"
                />
                <button type="submit" className="p-6 bg-[var(--fg)] text-[var(--bg)] rounded-full hover:scale-105 active:scale-95 transition-all shadow-2xl">
                   <ArrowRight size={28} />
                </button>
             </div>
          </form>

          {/* MINIMAL STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto pt-12 border-t border-[var(--border)]">
             {[
               { icon: <Archive size={20}/>, label: "Documents", val: projects.length },
               { icon: <BookOpen size={20}/>, label: "Archive Slides", val: totalSlides },
               { icon: <ShieldCheck size={20}/>, label: "Node Integrity", val: "100%" }
             ].map((s, i) => (
                <div key={i} className="text-center group">
                   <div className="text-6xl font-black mb-1 group-hover:scale-110 transition-transform">{s.val}</div>
                   <div className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30">{s.label}</div>
                </div>
             ))}
          </div>
        </motion.div>
      </section>

      {/* GLOSSY EXHIBITION RIBBON */}
      <section className="py-24 bg-[var(--surface)] border-y border-[var(--border)] overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-12 mb-12 flex items-center justify-between">
           <div className="space-y-1">
             <h2 className="text-3xl font-black tracking-tight">Active Exhibition</h2>
             <p className="text-sm font-medium opacity-40">Highlighting the most impactful Labours.</p>
           </div>
           <Link href="/archive" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--fg)] hover:underline">
              BROWSE VAULT <ChevronRight size={16} />
           </Link>
        </div>

        {projects.length > 0 && (
          <motion.div 
            animate={{ x: [0, -1500] }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="flex gap-12 px-12 w-fit h-72"
          >
            {projects.concat(projects).map((p, i) => (
               <Link 
                 key={i} 
                 href={`/projects/${p.id}`}
                 className="flex-shrink-0 w-96 rounded-2xl overflow-hidden glass border-4 border-white/10 dark:border-white/5 shadow-2xl hover:scale-[1.03] transition-all duration-700 overflow-hidden relative group"
               >
                  <img src={getPublicUrl(p.id, p.thumbnail || "slide_01.webp")} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" alt="Preview" />
                  <div className="absolute inset-0 bg-black/40 p-10 flex flex-col justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                     <span className="text-[10px] font-black tracking-[0.4em] text-white uppercase">{p.subject}</span>
                     <h3 className="text-2xl font-black text-white leading-tight">{p.title}</h3>
                  </div>
               </Link>
            ))}
          </motion.div>
        )}
      </section>

      <div className="h-64 flex items-center justify-center opacity-10 text-[10px] font-black uppercase tracking-[1em]">
          VoidArchive Preservation System v2.6
      </div>

    </div>
  );
}
