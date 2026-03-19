"use client";
import React, { useState, useEffect, useMemo, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowLeft, Grid, List, Clock, FileText, X, SlidersHorizontal, BookOpen, ChevronRight, Sparkles, Monitor, History, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getPublicUrl } from "@/lib/supabase";
import { ThemeToggle } from "@/components/ThemeToggle";
import { StarDisplay } from "@/components/StarRating";

type SortKey = "newest" | "oldest" | "slides" | "title";

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
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] pb-40 transition-colors duration-700">
      
      {/* MINIMAL NAV */}
      <header className="fixed top-0 inset-x-0 z-[100] px-8 py-6 glass border-b border-[var(--border)] flex items-center justify-between">
        <div className="flex items-center gap-8">
           <Link href="/" className="p-3 bg-[var(--surface)] text-[var(--fg)] border border-[var(--border)] rounded-full hover:bg-[var(--fg)] hover:text-[var(--bg)] transition-colors">
              <ArrowLeft size={20} />
           </Link>
           <div className="hidden sm:block">
              <h1 className="text-2xl font-black tracking-tighter">THE VAULT SYSTEM</h1>
              <div className="flex items-center gap-2 opacity-30 text-[9px] font-black tracking-[0.4em] uppercase">Archive Hub <ShieldCheck size={10}/> Integrity Synced</div>
           </div>
        </div>

        <div className="flex items-center gap-6">
           <ThemeToggle />
           <div className="flex bg-[var(--surface)] p-1 rounded-full border border-[var(--border)]">
              <button onClick={() => setViewMode("grid")} className={`p-3 rounded-full transition-all ${viewMode === "grid" ? "bg-[var(--fg)] text-[var(--bg)]" : "text-white/40 hover:text-white"}`}><Grid size={16}/></button>
              <button onClick={() => setViewMode("list")} className={`p-3 rounded-full transition-all ${viewMode === "list" ? "bg-[var(--fg)] text-[var(--bg)]" : "text-white/40 hover:text-white"}`}><List size={16}/></button>
           </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto pt-44 px-8">
        
        {/* GLOSSY SEARCH PANEL */}
        <div className="flex flex-col lg:flex-row gap-8 mb-20 items-center">
           <div className="relative flex-1 group w-full">
              <Search className="absolute left-8 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 transition-opacity" size={24} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Query items, areas, protocols..." 
                className="w-full bg-[var(--surface)] border-2 border-[var(--border)] rounded-full py-6 pl-20 pr-12 font-black text-2xl outline-none focus:border-[var(--fg)] transition-all shadow-xl glass uppercase tracking-tight"
              />
              {searchQuery && <button onClick={() => setSearchQuery("")} className="absolute right-8 top-1/2 -translate-y-1/2 p-2 hover:bg-black/5 rounded-full"><X size={18}/></button>}
           </div>

           <button 
             onClick={() => setShowFilters(!showFilters)}
             className={`flex items-center gap-4 px-12 py-6 rounded-full font-black uppercase tracking-widest text-[11px] transition-all border-2 ${showFilters || subject ? 'bg-[var(--fg)] text-[var(--bg)] border-[var(--fg)] shadow-2xl scale-105' : 'bg-[var(--surface)] border-[var(--border)] hover:border-[var(--fg)]'}`}
           >
              <SlidersHorizontal size={18} /> SETTINGS
           </button>
        </div>

        {/* REFINED FILTERS */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-16 border-b border-[var(--border)] pb-12">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                  <div className="space-y-6">
                     <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 italic">PROTOCOL AREA SELECTOR</p>
                     <div className="flex flex-wrap gap-2">
                        {["All", ...subjects].map(s => (
                           <button key={s} onClick={() => setSubject(s === "All" ? "" : s)} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${((s === "All" && !subject) || s === subject) ? 'bg-[var(--fg)] text-[var(--bg)] border-[var(--fg)]' : 'bg-[var(--surface)] border-[var(--border)] hover:border-[var(--fg)] opacity-60'}`}>{s}</button>
                        ))}
                     </div>
                  </div>
                  <div className="space-y-6">
                     <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 italic">CHRONOLOGICAL PROTOCOL</p>
                     <div className="flex flex-wrap gap-2">
                        {["newest", "oldest", "slides", "title"].map(k => (
                           <button key={k} onClick={() => setSort(k as any)} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${sort === k ? 'bg-[var(--fg)] text-[var(--bg)] border-[var(--fg)]' : 'bg-[var(--surface)] border-[var(--border)] hover:border-[var(--fg)] opacity-60'}`}>{k}</button>
                        ))}
                     </div>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* EXHIBITION GRID */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-12">
             {[1,2,3,4,5,6].map(i => <div key={i} className="aspect-[4/3] rounded-[32px] animate-pulse bg-[var(--surface)]" />)}
          </div>
        ) : (
          <motion.div layout className={`grid gap-12 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            <AnimatePresence mode="popLayout">
              {filtered.map((p, i) => {
                 const rate = ratings[p.id];
                 return (
                   <motion.div layout key={p.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.05 }}>
                     <Link href={`/projects/${p.id}`} className={`group relative p-8 h-full flex flex-col surface-card hover:bg-[var(--fg)] hover:text-[var(--bg)] transition-all duration-700 ${viewMode === 'list' && 'flex-row items-center gap-12'}`}>
                        <div className={`relative overflow-hidden rounded-[24px] border-4 border-black/5 dark:border-white/5 ${viewMode === 'grid' ? 'aspect-video w-full mb-10' : 'w-64 aspect-video flex-shrink-0'}`}>
                           <img src={getPublicUrl(p.id, p.thumbnail || "slide_01.webp")} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Preview"/>
                           <div className="absolute inset-0 bg-black/10 transition-opacity group-hover:opacity-0" />
                        </div>

                        <div className="flex-1 space-y-6">
                           <div className="flex justify-between items-start">
                              <span className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40 group-hover:text-white transition-colors">{p.subject} Protocol</span>
                              <div className="p-3 bg-black/5 group-hover:bg-white/10 rounded-full group-hover:translate-x-1 transition-all"><ArrowRight size={16}/></div>
                           </div>
                           <h3 className="text-3xl font-black tracking-tighter leading-none line-clamp-2 uppercase italic">{p.title}</h3>
                           
                           {rate?.average > 0 && <StarDisplay value={rate.average} count={rate.count} size={14} />}
                           
                           <div className="pt-8 border-t border-black/5 group-hover:border-white/10 flex items-center justify-between opacity-30 group-hover:opacity-100 transition-all">
                              <div className="flex gap-8">
                                 <div className="flex items-center gap-2"><FileText size={16}/><span className="text-[10px] font-black uppercase tracking-widest">{p.slide_count} NODES</span></div>
                                 <div className="flex items-center gap-2"><History size={16}/><span className="text-[10px] font-black uppercase tracking-widest">{new Date(p.creation_date).getFullYear()}</span></div>
                              </div>
                              <div className="text-[10px] font-black uppercase tracking-[0.3em]">{p.filetype} CORE</div>
                           </div>
                        </div>
                     </Link>
                   </motion.div>
                 );
              })}
            </AnimatePresence>
          </motion.div>
        )}

      </main>
    </div>
  );
}

export default function ArchivePage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-white dark:bg-black"><div className="w-10 h-10 border-4 border-black/10 border-t-black rounded-full animate-spin" /></div>}>
       <ArchiveContents />
    </Suspense>
  );
}
