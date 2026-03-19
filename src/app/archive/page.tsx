"use client";
import React, { useState, useEffect, useMemo, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowLeft, Grid, List, X, SlidersHorizontal, ArrowRight, FileText, History, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getPublicUrl } from "@/lib/supabase";
import { ThemeToggle } from "@/components/ThemeToggle";
import { StarDisplay } from "@/components/StarRating";

type SortKey = "newest" | "oldest" | "slides" | "title";

const M3_EMPHASIZED = [0.2, 0, 0, 1] as any;

function ArchiveContents() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") || "";
  const [projects, setProjects] = useState<any[]>([]);
  const [ratings, setRatings] = useState<Record<string, { average: number; count: number }>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialQ);
  const [subject, setSubject] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetch("/api/projects").then(r => r.json()).then(async data => {
      if (Array.isArray(data)) setProjects(data);
      setLoading(false);
      const results = await Promise.allSettled(data.map((p: any) => fetch(`/api/rate?projectId=${p.id}`).then(r => r.json())));
      const ratingsMap: any = {};
      results.forEach((r, i) => { if (r.status === 'fulfilled') ratingsMap[data[i].id] = r.value; });
      setRatings(ratingsMap);
    }).catch(console.error);
  }, []);

  const subjects = useMemo(() => Array.from(new Set(projects.map(p => p.subject || "General"))).sort(), [projects]);

  const filtered = useMemo(() => {
    let list = projects.filter(p => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || p.title?.toLowerCase().includes(q) || p.subject?.toLowerCase().includes(q);
      const matchSubject = !subject || p.subject === subject;
      return matchSearch && matchSubject;
    });

    switch (sort) {
      case "newest": list = list.sort((a,b) => new Date(b.creation_date).getTime() - new Date(a.creation_date).getTime()); break;
      case "oldest": list = list.sort((a,b) => new Date(a.creation_date).getTime() - new Date(b.creation_date).getTime()); break;
      case "slides": list = list.sort((a,b) => (b.slide_count || 0) - (a.slide_count || 0)); break;
      case "title": list = list.sort((a,b) => a.title.localeCompare(b.title)); break;
    }
    return list;
  }, [projects, searchQuery, subject, sort]);

  return (
    <div className="min-h-screen bg-[var(--m3-surface)] text-[var(--m3-on-surface)] pb-40 transition-colors duration-700">
      
      {/* M3 TOP BAR */}
      <header className="fixed top-0 inset-x-0 z-[100] px-8 py-6 glass border-b border-[var(--m3-surface-variant)] flex items-center justify-between">
        <div className="flex items-center gap-8">
           <Link 
             href="/" 
             className="p-4 bg-[var(--m3-surface-container-high)] text-[var(--m3-on-surface)] border border-[var(--m3-outline)]/20 rounded-full hover:bg-[var(--m3-primary)] hover:text-[var(--m3-on-primary)] transition-all"
           >
              <ArrowLeft size={20} />
           </Link>
           <div className="hidden sm:block">
              <h1 className="text-2xl font-black tracking-tighter uppercase italic">The Vault</h1>
              <div className="flex items-center gap-2 opacity-40 text-[9px] font-black tracking-[0.4em] uppercase">
                 Status: Synced <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
              </div>
           </div>
        </div>

        <div className="flex items-center gap-6">
           <ThemeToggle />
           <div className="flex bg-[var(--m3-surface-container-high)] p-1.5 rounded-full border border-[var(--m3-outline)]/10">
              <button 
                onClick={() => setViewMode("grid")} 
                className={`p-3 rounded-full transition-all ${viewMode === "grid" ? "bg-[var(--m3-primary)] text-[var(--m3-on-primary)] shadow-lg" : "opacity-40 hover:opacity-100"}`}
              >
                <Grid size={16}/>
              </button>
              <button 
                onClick={() => setViewMode("list")} 
                className={`p-3 rounded-full transition-all ${viewMode === "list" ? "bg-[var(--m3-primary)] text-[var(--m3-on-primary)] shadow-lg" : "opacity-40 hover:opacity-100"}`}
              >
                <List size={16}/>
              </button>
           </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto pt-48 px-8">
        
        {/* REFINED SEARCH & SETTINGS */}
        <div className="flex flex-col lg:flex-row gap-8 mb-24 items-center">
           <div className="relative flex-1 group w-full">
              <Search className="absolute left-8 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 transition-opacity" size={28} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Query Registry..." 
                className="w-full bg-[var(--m3-surface-container-low)] border-2 border-[var(--m3-outline)]/20 rounded-[32px] py-8 pl-24 pr-12 font-black text-3xl outline-none focus:border-[var(--m3-primary)] transition-all shadow-xl uppercase tracking-tighter"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")} 
                  className="absolute right-8 top-1/2 -translate-y-1/2 p-3 hover:bg-[var(--m3-surface-variant)] rounded-full transition-colors"
                >
                  <X size={20}/>
                </button>
              )}
           </div>

           <button 
             onClick={() => setShowFilters(!showFilters)}
             className={`flex items-center gap-4 px-12 py-8 rounded-[32px] font-black uppercase tracking-widest text-xs transition-all border-2 shadow-xl ${showFilters || subject ? 'bg-[var(--m3-primary)] text-[var(--m3-on-primary)] border-[var(--m3-primary)] scale-105' : 'bg-[var(--m3-surface-container-high)] border-transparent hover:border-[var(--m3-primary)]'}`}
           >
              <SlidersHorizontal size={20} /> Filter Registry
           </button>
        </div>

        {/* M3 FILTER DRAWER */}
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: "auto", opacity: 1 }} 
              exit={{ height: 0, opacity: 0 }} 
              transition={{ ease: M3_EMPHASIZED }}
              className="overflow-hidden mb-24 bg-[var(--m3-surface-container-low)] rounded-[40px] border border-[var(--m3-outline)]/10 shadow-2xl p-12"
            >
               <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                  <div className="space-y-8">
                     <p className="text-xs font-black uppercase tracking-[0.5em] opacity-40 italic flex items-center gap-4">
                        <span className="w-8 h-px bg-current" /> Selector: Sector
                     </p>
                     <div className="flex flex-wrap gap-3">
                        {["All", ...subjects].map(s => (
                           <button 
                             key={s} 
                             onClick={() => setSubject(s === "All" ? "" : s)} 
                             className={`px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all ${((s === "All" && !subject) || s === subject) ? 'bg-[var(--m3-secondary)] text-[var(--m3-on-secondary)] border-[var(--m3-secondary)]' : 'bg-transparent border-[var(--m3-outline)]/20 hover:border-[var(--m3-primary)] opacity-60'}`}
                           >
                             {s}
                           </button>
                        ))}
                     </div>
                  </div>
                  <div className="space-y-8">
                     <p className="text-xs font-black uppercase tracking-[0.5em] opacity-40 italic flex items-center gap-4">
                        <span className="w-8 h-px bg-current" /> Order: Protocol
                     </p>
                     <div className="flex flex-wrap gap-3">
                        {["newest", "oldest", "slides", "title"].map(k => (
                           <button 
                             key={k} 
                             onClick={() => setSort(k as any)} 
                             className={`px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all ${sort === k ? 'bg-[var(--m3-secondary)] text-[var(--m3-on-secondary)] border-[var(--m3-secondary)]' : 'bg-transparent border-[var(--m3-outline)]/20 hover:border-[var(--m3-primary)] opacity-60'}`}
                           >
                             {k}
                           </button>
                        ))}
                     </div>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* LOADING STATE */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
             {[1,2,3,4,5,6].map(i => <div key={i} className="aspect-[16/10] rounded-[48px] animate-pulse bg-[var(--m3-surface-container-highest)]" />)}
          </div>
        ) : (
          <motion.div layout className={`grid gap-12 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            <AnimatePresence mode="popLayout">
              {filtered.map((p, i) => {
                 const rate = ratings[p.id];
                 return (
                   <motion.div 
                     layout 
                     key={p.id} 
                     initial={{ opacity: 0, scale: 0.9 }} 
                     animate={{ opacity: 1, scale: 1 }} 
                     exit={{ opacity: 0, scale: 0.9 }} 
                     transition={{ delay: i * 0.03, ease: M3_EMPHASIZED }}
                   >
                     <Link 
                       href={`/projects/${p.id}`} 
                       className={`group relative p-10 h-full flex flex-col m3-card hover:bg-[var(--m3-primary)] hover:text-[var(--m3-on-primary)] transition-all duration-500 overflow-hidden ${viewMode === 'list' && 'flex-row items-center gap-16'}`}
                     >
                        <div className={`relative overflow-hidden rounded-[40px] border-4 border-[var(--m3-outline)]/10 dark:border-white/5 ${viewMode === 'grid' ? 'aspect-[16/10] w-full mb-10 shadow-2xl' : 'w-80 aspect-video flex-shrink-0'}`}>
                           <img 
                             src={getPublicUrl(p.id, p.thumbnail || "slide_01.webp")} 
                             className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1s] ease-out" 
                             alt={p.title}
                           />
                           <div className="absolute inset-0 bg-black/5 dark:bg-white/5" />
                        </div>

                        <div className="flex-1 space-y-8">
                           <div className="flex justify-between items-start">
                              <span className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                Area: {p.subject}
                              </span>
                              <div className="p-4 bg-[var(--m3-surface-container-highest)] group-hover:bg-white/20 rounded-full group-hover:translate-x-2 transition-all shadow-inner">
                                <ArrowRight size={20}/>
                              </div>
                           </div>
                           
                           <h3 className="text-4xl font-black tracking-tighter leading-none line-clamp-2 uppercase italic">
                             {p.title}
                           </h3>
                           
                           {rate?.average > 0 && <StarDisplay value={rate.average} count={rate.count} size={16} />}
                           
                           <div className="pt-10 border-t border-[var(--m3-outline)]/10 group-hover:border-white/20 flex items-center justify-between opacity-30 group-hover:opacity-100 transition-all">
                              <div className="flex gap-10">
                                 <div className="flex items-center gap-3">
                                   <FileText size={18}/>
                                   <span className="text-xs font-black uppercase tracking-widest">{p.slide_count} NODES</span>
                                 </div>
                                 <div className="flex items-center gap-3">
                                   <History size={18}/>
                                   <span className="text-xs font-black uppercase tracking-widest">{new Date(p.creation_date).getFullYear()}</span>
                                 </div>
                              </div>
                              <div className="text-xs font-black uppercase tracking-[0.3em] font-mono">
                                {p.filetype}
                              </div>
                           </div>
                        </div>
                     </Link>
                   </motion.div>
                 );
              })}
            </AnimatePresence>
          </motion.div>
        )}

        {filtered.length === 0 && !loading && (
          <div className="py-40 text-center opacity-20">
            <X size={64} className="mx-auto mb-8" />
            <h2 className="text-4xl font-black uppercase tracking-tighter italic">No Matches Found in Registry</h2>
          </div>
        )}

      </main>

      <footer className="h-64 flex items-center justify-center opacity-10 text-[10px] font-black uppercase tracking-[2em] select-none">
          Encrypted • Validated • Archived
      </footer>
    </div>
  );
}

export default function ArchivePage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-[var(--m3-surface)]"><div className="w-12 h-12 border-8 border-[var(--m3-primary)] border-t-white rounded-full animate-spin shadow-2xl" /></div>}>
       <ArchiveContents />
    </Suspense>
  );
}
