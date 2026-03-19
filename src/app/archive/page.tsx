"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronRight, Info, Star, ArrowLeft, Filter, Grid, List, Clock, FileText } from "lucide-react";
import Link from "next/link";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { getPublicUrl } from "@/lib/supabase";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function ArchivePage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSubject, setCurrentSubject] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/projects");
        const data = await res.json();
        if (Array.isArray(data)) setProjects(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const subjects = Array.from(new Set(projects.map(p => p.subject || "General")));
  const filtered = projects.filter(p => {
    const matchesSearch = p.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = !currentSubject || p.subject === currentSubject;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="min-h-screen bg-[#FDF7FF] text-[#1D1B20]">
      <header className="fixed top-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-2xl border-b border-black/5 px-6 lg:px-12 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 font-black uppercase tracking-widest text-xs opacity-60 hover:opacity-100 transition-all">
            <ArrowLeft size={16} /> Back
          </Link>
          <h1 className="text-xl font-black tracking-tighter">The Vault Archives</h1>
          <div className="flex gap-4">
             <button onClick={() => setViewMode("grid")} className={cn("p-2 rounded-lg", viewMode === "grid" ? "bg-[#6750A4] text-white" : "hover:bg-black/5")}><Grid size={20}/></button>
             <button onClick={() => setViewMode("list")} className={cn("p-2 rounded-lg", viewMode === "list" ? "bg-[#6750A4] text-white" : "hover:bg-black/5")}><List size={20}/></button>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-40 px-6 lg:px-12 max-w-[1600px] mx-auto">
        
        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-6 mb-16 items-center">
           <div className="relative flex-1 group w-full">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-black/20 group-hover:text-[#6750A4] transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Search the legacy documents..."
                className="w-full bg-white border border-black/5 rounded-2xl py-5 pl-16 pr-8 font-bold placeholder:text-black/20 outline-none focus:border-[#6750A4]/30 shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
           
           <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              <button 
                onClick={() => setCurrentSubject("")}
                className={cn("px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border", !currentSubject ? "bg-[#6750A4] text-white" : "bg-white border-black/5")}
              >
                 All
              </button>
              {subjects.map(s => (
                <button 
                  key={s}
                  onClick={() => setCurrentSubject(s)}
                  className={cn("px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border", currentSubject === s ? "bg-[#6750A4] text-white" : "bg-white border-black/5")}
                >
                   {s}
                </button>
              ))}
           </div>
        </div>

        {/* Results Grid */}
        <div className={cn(
           "grid gap-6",
           viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
        )}>
          {filtered.map((proj) => (
             <Link 
               key={proj.id} 
               href={`/projects/${proj.id}`}
               className={cn(
                  "group relative overflow-hidden transition-all duration-500",
                  viewMode === "grid" 
                    ? "bg-white rounded-[32px] border border-black/5 p-4 hover:shadow-2xl hover:-translate-y-2 h-[420px] flex flex-col" 
                    : "bg-white rounded-3xl border border-black/5 p-6 flex items-center gap-8 hover:bg-black/5"
               )}
             >
                <div className={cn(
                   "relative rounded-[24px] overflow-hidden bg-black/5",
                   viewMode === "grid" ? "aspect-video mb-6" : "w-40 h-24 shrink-0"
                )}>
                   <img 
                     src={getPublicUrl(proj.id, proj.thumbnail || "slide_0.webp")} 
                     className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                     alt={proj.title}
                     onError={(e) => { e.currentTarget.src = "/user-placeholder.svg"}}
                   />
                </div>
                
                <div className="flex-1 flex flex-col">
                   <div className="text-[10px] font-black uppercase tracking-widest text-[#6750A4] mb-2">{proj.subject || "General"}</div>
                   <h3 className={cn("font-black tracking-tight text-[#1D1B20] mb-4 leading-tight", viewMode === "grid" ? "text-xl line-clamp-2" : "text-2xl")}>
                      {proj.title.replace(/\.pptx|\.pdf|\.docx/gi, "").replace(/_/g, " ")}
                   </h3>
                   
                   <div className="mt-auto flex items-center justify-between border-t border-black/5 pt-4">
                      <div className="flex gap-4">
                         <div className="flex items-center gap-2 opacity-40">
                            <FileText size={14}/>
                            <span className="text-[10px] font-black uppercase tracking-widest">{proj.slide_count}</span>
                         </div>
                         <div className="flex items-center gap-2 opacity-40">
                            <Clock size={14}/>
                            <span className="text-[10px] font-black uppercase tracking-widest">{proj.time_spent || "4h"}</span>
                         </div>
                      </div>
                      <ChevronRight size={18} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                   </div>
                </div>
             </Link>
          ))}
        </div>

        {!loading && filtered.length === 0 && (
           <div className="py-40 text-center opacity-20">
              <Search size={48} className="mx-auto mb-6" />
              <h2 className="text-2xl font-black uppercase tracking-[0.4em]">Vault is Empty</h2>
           </div>
        )}
      </main>
    </div>
  );
}


