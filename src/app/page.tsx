"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Search, ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getPublicUrl } from "@/lib/supabase";
import { ThemeToggle } from "@/components/ThemeToggle";

// MATERIAL 3 MOTION TOKENS
const M3_EMPHASIZED = [0.2, 0, 0, 1] as any;
const M3_STANDARD = [0.2, 0, 0, 1] as any;

export default function Home() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchVal, setSearchVal] = useState("");

  useEffect(() => {
    fetch("/api/projects")
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setProjects(data); })
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) router.push(`/archive?q=${encodeURIComponent(searchVal)}`);
  };

  const totalSlides = projects.reduce((acc, p) => acc + (p.slide_count || 0), 0);

  return (
    <div className="min-h-screen bg-[var(--m3-surface)] text-[var(--m3-on-surface)] transition-all duration-700">
      
      {/* Navigation (M3 Surface Container Low) */}
      <nav className="fixed top-0 inset-x-0 z-[100] px-8 py-4 flex items-center justify-between glass border-b border-[var(--m3-surface-variant)]">
        <Link href="/" className="flex items-center gap-4 group">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-12 h-12 bg-[var(--m3-primary)] text-[var(--m3-on-primary)] flex items-center justify-center rounded-2xl font-black text-xl shadow-lg"
          >
            V
          </motion.div>
          <div className="hidden sm:block">
             <h1 className="text-xl font-bold tracking-tight">VoidArchive</h1>
             <p className="text-[10px] uppercase tracking-widest opacity-60 font-bold">DIGITAL MUSEUM v01</p>
          </div>
        </Link>
        <div className="flex items-center gap-6">
          <ThemeToggle />
          <Link 
            href="/archive" 
            className="m3-button-filled group relative overflow-hidden"
          >
             <span className="relative z-10 flex items-center gap-2">
               EXPLORE <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
             </span>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-64 pb-32 px-5 flex flex-col items-center overflow-hidden">
        {/* Background Accents (M3 Tertiary) */}
        <div className="absolute top-0 -z-10 w-[800px] h-[800px] bg-[var(--m3-primary-container)] blur-[160px] opacity-20 rounded-full -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 -z-10 w-[600px] h-[600px] bg-[var(--m3-tertiary-container)] blur-[160px] opacity-10 rounded-full translate-x-1/4" />

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: M3_EMPHASIZED }}
          className="w-full max-w-6xl text-center"
        >
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-3 px-6 py-2 bg-[var(--m3-secondary-container)] text-[var(--m3-on-secondary-container)] rounded-full mb-12 shadow-sm border border-[var(--m3-outline)]/20"
          >
            <span className="w-2 h-2 rounded-full bg-[var(--m3-primary)] animate-ping" />
            <span className="text-xs font-bold uppercase tracking-[0.2em]">Systems Online • Sincere Bhattarai</span>
          </motion.div>

          <h1 className="text-8xl sm:text-9xl lg:text-[12rem] font-black tracking-tighter mb-16 leading-[0.85] uppercase italic">
            VOID<br />
            <span className="opacity-10 text-[var(--m3-outline)] outline-text">ARCHIVE</span>
          </h1>

          <p className="max-w-2xl mx-auto text-xl text-[var(--m3-on-surface-variant)] mb-20 leading-relaxed font-medium">
            A high-fidelity digital library housing curated academic work, 
            creative presentations, and specialized documentation.
          </p>

          {/* Search Bar (M3 Search Pattern) */}
          <form onSubmit={handleSearch} className="relative w-full max-w-3xl mx-auto mb-24">
             <div className="group flex items-center p-3 bg-[var(--m3-surface-container-high)] border-2 border-transparent focus-within:border-[var(--m3-primary)] focus-within:bg-[var(--m3-surface-container-highest)] rounded-[32px] transition-all duration-500 shadow-2xl">
                <Search size={28} className="ml-8 opacity-40 group-focus-within:opacity-100 group-focus-within:text-[var(--m3-primary)] transition-all" />
                <input 
                  type="text" 
                  value={searchVal}
                  onChange={e => setSearchVal(e.target.value)}
                  placeholder="Query the database..." 
                  className="flex-1 bg-transparent px-8 py-6 font-bold text-2xl outline-none placeholder:opacity-30 uppercase tracking-tight"
                />
                <button type="submit" className="p-6 bg-[var(--m3-primary)] text-[var(--m3-on-primary)] rounded-[24px] hover:scale-105 active:scale-95 transition-all shadow-lg mx-2">
                   <ArrowRight size={28} />
                </button>
             </div>
          </form>

          {/* Quick Stats (M3 Cards) */}
          <div className="grid grid-cols-2 gap-8 sm:gap-24 pt-16 border-t border-[var(--m3-outline)]/10">
             <motion.div whileHover={{ y: -5 }} className="text-center p-8 rounded-[40px] bg-[var(--m3-surface-container-low)]">
                <div className="text-7xl font-black mb-2 text-[var(--m3-primary)]">{projects.length}</div>
                <div className="text-xs font-black uppercase tracking-[0.4em] opacity-40">Core Records</div>
             </motion.div>
             <motion.div whileHover={{ y: -5 }} className="text-center p-8 rounded-[40px] bg-[var(--m3-surface-container-low)]">
                <div className="text-7xl font-black mb-2 text-[var(--m3-secondary)]">{totalSlides}</div>
                <div className="text-xs font-black uppercase tracking-[0.4em] opacity-40">Data Sheets</div>
             </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Featured Items (M3 Carousel Pattern) */}
      <section className="py-32 bg-[var(--m3-surface-container-low)] border-y border-[var(--m3-outline)]/10">
        <div className="max-w-[1440px] mx-auto px-8 mb-16 flex items-end justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.5em] text-[var(--m3-primary)] mb-4">Latest Ingestions</p>
              <h2 className="text-5xl font-black italic uppercase tracking-tighter">Newest Discoveries</h2>
            </div>
            <Link href="/archive" className="flex items-center gap-3 text-sm font-black text-[var(--m3-primary)] hover:opacity-70 transition-all uppercase tracking-widest">
               OPEN FULL ACCESS <ChevronRight size={20} />
            </Link>
        </div>

        {loading ? (
          <div className="flex gap-10 px-8">
            {[1,2,3].map(i => <div key={i} className="w-[450px] aspect-[16/10] bg-[var(--m3-surface-variant)] animate-pulse rounded-[40px]" />)}
          </div>
        ) : (
          <div className="flex gap-10 overflow-x-auto no-scrollbar px-8 pb-12">
            {projects.slice(0, 6).map((p, i) => (
               <motion.div
                 key={i}
                 initial={{ opacity: 0, x: 50 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: i * 0.1, ease: M3_EMPHASIZED }}
               >
                 <Link 
                   href={`/projects/${p.id}`}
                   className="flex-shrink-0 w-[450px] block m3-card !p-0 overflow-hidden group shadow-xl"
                 >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img 
                        src={getPublicUrl(p.id, p.thumbnail || "slide_01.webp")} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out" 
                        alt={p.title} 
                      />
                      <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/80 to-transparent text-white transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                          <p className="text-xs font-bold uppercase tracking-widest mb-2 text-white/70">{p.subject}</p>
                          <h3 className="text-2xl font-bold truncate">{p.title}</h3>
                      </div>
                    </div>
                 </Link>
               </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Footer Signature */}
      <footer className="py-40 flex flex-col items-center justify-center text-center px-8">
          <BookOpen className="w-16 h-16 opacity-10 mb-8" />
          <div className="text-[10px] font-black uppercase tracking-[1.5em] opacity-30 select-none">
              PRODUCED IN NEPAL • 2026 • VOID SYSTEMS
          </div>
      </footer>

    </div>
  );
}
