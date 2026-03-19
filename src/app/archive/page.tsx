"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ArrowLeft, Filter, Grid, List,
  Clock, FileText, X, SlidersHorizontal, BookOpen,
  ChevronRight, Sparkles, Monitor, Info, History, ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getPublicUrl } from "@/lib/supabase";
import { ThemeToggle } from "@/components/ThemeToggle";
import { StarDisplay } from "@/components/StarRating";

type SortKey = "newest" | "oldest" | "slides" | "title";

export default function ArchivePage() {
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
      
      // Parallel rating fetch (throttled/batched)
      const results = await Promise.allSettled(data.map((p: any) => fetch(`/api/rate?projectId=${p.id}`).then(r => r.json())));
      const ratingsMap: any = {};
      results.forEach((r, i) => { if (r.status === 'fulfilled') ratingsMap[data[i].id] = r.value; });
      setRatings(ratingsMap);
    }).catch(console.error);
  }, []);

  // Update query when params change
  useEffect(() => { setSearchQuery(searchParams.get("q") || ""); }, [searchParams]);

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
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] pb-40 transition-colors duration-500">
      
      {/* Header (Slim & Fixed) */}
      <header className="fixed top-0 inset-x-0 z-[100] p-6 sm:p-8 glass-dark border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-6">
           <Link href="/" className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors text-white/60">
              <ArrowLeft size={18} />
           </Link>
           <div className="hidden sm:block">
              <h1 className="text-xl font-black tracking-tighter text-white">The Vault Protocol</h1>
              <p className="text-[10px] font-black tracking-[0.4em] uppercase text-white/40">Secure Archival Repository</p>
           </div>
        </div>

        <div className="flex items-center gap-4">
           {loading && <div className="hidden sm:flex items-center gap-2 text-white/40 text-[10px] uppercase tracking-widest font-black animate-pulse"><Monitor size={14}/> Syncing Node...</div>}
           <ThemeToggle />
           <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-3xl">
              <button 
                onClick={() => setViewMode("grid")}
                className={`p-2.5 rounded-xl transition-all ${viewMode === "grid" ? "bg-[var(--primary)] text-white shadow-xl" : "text-white/40 hover:text-white"}`}
              >
                <Grid size={16} />
              </button>
              <button 
                onClick={() => setViewMode("list")}
                className={`p-2.5 rounded-xl transition-all ${viewMode === "list" ? "bg-[var(--primary)] text-white shadow-xl" : "text-white/40 hover:text-white"}`}
              >
                <List size={16} />
              </button>
           </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto pt-44 px-8 lg:px-12">
        
        {/* Search Row */}
        <div className="flex flex-col lg:flex-row gap-6 mb-16 items-center">
           <div className="relative flex-1 group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[var(--primary)] transition-colors" size={20} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Query items, years, or areas..." 
                className="w-full bg-[var(--surface-1)] border-2 border-[var(--border)] rounded-3xl py-5 pl-16 pr-10 font-black text-lg outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-muted)] transition-all shadow-xl"
              />
              {searchQuery && <button onClick={() => setSearchQuery("")} className="absolute right-6 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/10 rounded-full text-white/40 transition-colors"><X size={16}/></button>}
           </div>

           <button 
             onClick={() => setShowFilters(!showFilters)}
             className={`flex items-center gap-3 px-8 py-5 rounded-3xl font-black uppercase tracking-widest text-[10px] transition-all border ${showFilters || subject ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-2xl' : 'bg-[var(--surface-1)] border-[var(--border)] hover:border-[var(--primary)]'}`}
           >
              <SlidersHorizontal size={14} /> 
              Settings
              {subject && <span className="bg-white/20 px-2 rounded-full ml-1 lowercase tracking-normal">({subject})</span>}
           </button>
        </div>

        {/* Expandable Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-12"
            >
               <div className="surface-card p-10 rounded-[40px] border-2 border-[var(--border)] grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-4">
                     <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--fg-subtle)]">Filter Node Area</p>
                     <div className="flex flex-wrap gap-2">
                        {["All", ...subjects].map(s => (
                           <button 
                             key={s} 
                             onClick={() => setSubject(s === "All" ? "" : s)}
                             className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${((s === "All" && !subject) || s === subject) ? 'bg-[var(--primary)] text-white border-[var(--primary)]' : 'bg-white/5 border-[var(--border)] hover:border-[var(--primary)] opacity-60'}`}
                           >
                              {s}
                           </button>
                        ))}
                     </div>
                  </div>
                  <div className="space-y-4">
                     <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--fg-subtle)]">Chronological Order</p>
                     <div className="flex flex-wrap gap-2">
                        {["newest", "oldest", "slides", "title"].map(k => (
                           <button 
                             key={k} 
                             onClick={() => setSort(k as any)}
                             className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${sort === k ? 'bg-[var(--fg)] text-[var(--bg)] border-[var(--fg)]' : 'bg-white/5 border-[var(--border)] hover:border-[var(--primary)] opacity-60'}`}
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

        {/* Results Info */}
        {!loading && (
          <div className="flex items-center gap-4 mb-10 px-2">
             <div className="flex items-center gap-2 px-4 py-1.5 bg-[var(--primary-muted)] text-[var(--primary)] rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                <ShieldCheck size={12}/> {filtered.length} Valid Records
             </div>
             <div className="h-4 w-px bg-[var(--border)]" />
             <p className="text-xs font-black uppercase tracking-widest opacity-30">VoidArchive v2.4 Integrity: 100%</p>
          </div>
        )}

        {/* Grid / List View */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
             {[1,2,3,4,5,6].map(i => <div key={i} className="aspect-[4/3] rounded-[40px] animate-pulse bg-[var(--surface-2)] border border-[var(--border)]" />)}
          </div>
        ) : (
          <motion.div 
             layout
             className={`grid gap-8 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((p, i) => {
                 const rate = ratings[p.id];
                 return (
                   <motion.div 
                     layout 
                     key={p.id}
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.9 }}
                     transition={{ delay: i * 0.03 }}
                   >
                     <Link href={`/projects/${p.id}`} className={`surface-card group relative p-6 flex flex-col hover:scale-[1.02] shadow-2xl transition-all duration-500 overflow-hidden ${viewMode === 'list' && 'flex-row items-center gap-8'}`}>
                        {/* Dominant Color Backdrop */}
                        <div className="absolute inset-0 opacity-[0.03] transition-opacity group-hover:opacity-[0.08]" style={{ background: p.dominant_color }} />
                        
                        <div className={`relative overflow-hidden rounded-[32px] border-4 border-black/5 ${viewMode === 'grid' ? 'aspect-video w-full mb-8' : 'w-48 aspect-video flex-shrink-0'}`}>
                           <img src={getPublicUrl(p.id, p.thumbnail || "slide_01.webp")} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Preview"/>
                           <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        </div>

                        <div className="flex-1 space-y-4">
                           <div className="flex justify-between items-start">
                              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--primary)]">{p.subject}</span>
                              <div className="p-2 bg-white/5 border border-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"><ChevronRight size={14}/></div>
                           </div>
                           <h3 className="text-xl font-black tracking-tighter leading-tight group-hover:text-[var(--primary)] transition-colors line-clamp-2">{p.title}</h3>
                           
                           {rate?.average > 0 && <StarDisplay value={rate.average} count={rate.count} size={14} />}
                           
                           <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between">
                              <div className="flex gap-4">
                                 <div className="flex items-center gap-2 opacity-40"><FileText size={14}/><span className="text-[10px] font-black uppercase tracking-widest">{p.slide_count} slides</span></div>
                                 <div className="flex items-center gap-2 opacity-40"><History size={14}/><span className="text-[10px] font-black uppercase tracking-widest">{new Date(p.creation_date).getFullYear()}</span></div>
                              </div>
                              <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30">{p.filetype} Node</div>
                           </div>
                        </div>
                     </Link>
                   </motion.div>
                 );
              })}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <div className="py-44 flex flex-col items-center text-center">
             <div className="w-20 h-20 bg-[var(--surface-2)] rounded-[32px] flex items-center justify-center mb-8 border border-[var(--border)]">
                <Sparkles size={32} className="opacity-20" />
             </div>
             <h3 className="text-2xl font-black tracking-tight mb-2 opacity-60">No records found for query</h3>
             <p className="text-sm opacity-30 max-w-xs mx-auto mb-10 font-bold uppercase tracking-widest">Adjust protocol settings to find the missing node.</p>
             <button onClick={() => { setSearchQuery(""); setSubject(""); }} className="px-8 py-4 bg-[var(--primary)] text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-2xl hover:scale-105 transition-all">Reset All Parameters</button>
          </div>
        )}

      </main>
    </div>
  );
}
