"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Star, ChevronRight, Info } from "lucide-react";
import Link from "next/link";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { getPublicUrl } from "@/lib/supabase";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Home() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [currentSubject, setCurrentSubject] = useState<string>("");

  useEffect(() => {
    setIsMounted(true);
    
    // Disable right click globally for View-Only mode
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", handleContextMenu);
    
    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/projects");
        const data = await res.json();
        if (Array.isArray(data)) {
           setProjects(data);
        } else {
           console.error("API Error", data);
           setProjects([]);
        }
      } catch (err) {
        console.error("Fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjects();
    const interval = setInterval(fetchProjects, 10000); 
    
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      clearInterval(interval);
    };
  }, []);

  const safeProjects = Array.isArray(projects) ? projects : [];
  const subjects = Array.from(new Set(safeProjects.map(p => p.subject || "General")));

  const filteredProjects = safeProjects.filter(p => {
    const matchesSearch = (p.title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || 
                          (p.subject?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    const matchesSubject = currentSubject === "" || (p.subject || "General") === currentSubject;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="min-h-screen bg-[#FDF7FF] text-[#1D1B20] selection:bg-[#6750A4]/20 selection:text-[#6750A4] font-sans overflow-x-hidden pb-32">
      
      {/* 1. Global Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-6 lg:px-12 py-5 bg-white/70 backdrop-blur-xl border-b border-[#1D1B20]/5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-[#1D1B20] text-white flex items-center justify-center transform rotate-12 shadow-lg hover:rotate-0 transition-transform cursor-pointer">
            <span className="font-black text-lg">V</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-black tracking-tighter leading-none">VoidArchive</h1>
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-40">Sincere Bhattarai</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
           <Link href="/legacy" className="text-xs font-bold uppercase tracking-widest opacity-50 hover:opacity-100 hover:text-[#6750A4] transition-all">The Legacy</Link>
           <div className="h-4 w-px bg-black/10 hidden sm:block" />
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ring-4 ring-emerald-500/20" />
              <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Live</span>
           </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="relative w-full pt-40 pb-20 px-6 lg:px-12 flex flex-col items-center justify-center overflow-hidden">
        
        {/* Animated Orbs */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
           <motion.div 
             animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }}
             transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
             className="absolute top-0 left-1/4 w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-[#6750A4]/10 blur-[100px]"
           />
           <motion.div 
             animate={{ scale: [1.1, 1, 1.1], rotate: [90, 0, 90] }}
             transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
             className="absolute bottom-0 right-1/4 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full bg-blue-500/10 blur-[120px]"
           />
        </div>

        <div className="relative z-10 w-full max-w-3xl mx-auto text-center flex flex-col items-center">
          <div className="text-[10px] font-black uppercase tracking-[0.6em] text-[#6750A4] mb-6 bg-[#6750A4]/10 px-5 py-2 rounded-full backdrop-blur-md border border-[#6750A4]/20 shadow-sm">
             Official View-Only Archive
          </div>
          
          <h2 className="text-6xl sm:text-7xl lg:text-8xl font-black mb-10 leading-[0.85] tracking-tight text-[#1D1B20]">
            Digital <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6750A4] to-blue-600">Legend</span>
          </h2>
          
          {/* M3 Search Bar */}
          <div className="relative w-full group max-w-2xl z-20">
            <div className="absolute inset-0 bg-white/40 blur-2xl group-hover:bg-white/60 transition-all rounded-[32px] -z-10" />
            <div className="relative flex items-center bg-white/80 backdrop-blur-2xl border-2 border-white/50 rounded-[32px] p-2 pr-4 shadow-xl hover:shadow-2xl hover:border-[#6750A4]/30 transition-all duration-500 ring-1 ring-black/5">
              <div className="p-4 sm:p-5 bg-[#6750A4] text-white rounded-[24px] shadow-lg shadow-[#6750A4]/30 mr-4">
                 <Search size={24} strokeWidth={3} />
              </div>
              <input 
                 type="text" 
                 placeholder="Interrogate the Archive..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="flex-1 bg-transparent border-none outline-none text-lg sm:text-xl font-bold placeholder:text-[#1D1B20]/30 py-4 w-full"
              />
            </div>
          </div>
        </div>

      </section>

      {isMounted && (
        <div className="relative z-10 flex flex-col items-center w-full">
          
          {/* 3. Global Statistics Board */}
          <div className="w-full max-w-5xl px-6 lg:px-12 mb-16">
            <div className="bg-white/60 backdrop-blur-3xl border border-white/80 shadow-xl rounded-[40px] p-8 lg:p-10 flex flex-wrap justify-center sm:justify-between items-center gap-8 ring-1 ring-black/5">
               <div className="flex items-center gap-6 w-full sm:w-auto justify-center">
                  <div className="w-16 h-16 rounded-full bg-[#6750A4]/10 flex items-center justify-center">
                    <span className="text-3xl font-black text-[#6750A4]">{safeProjects.length}</span>
                  </div>
                  <div className="flex flex-col text-left">
                     <span className="text-sm font-black tracking-tight text-[#1D1B20]">Master Archives</span>
                     <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">Total Records</span>
                  </div>
               </div>
               
               <div className="hidden lg:block w-px h-12 bg-black/10" />
               
               <div className="flex items-center gap-6 w-full sm:w-auto justify-center">
                  <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <span className="text-3xl font-black text-blue-600">
                      {safeProjects.reduce((acc, p) => acc + (p.slide_count || 0), 0)}
                    </span>
                  </div>
                  <div className="flex flex-col text-left">
                     <span className="text-sm font-black tracking-tight text-[#1D1B20]">Extracted Slides</span>
                     <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">Preserved Pages</span>
                  </div>
               </div>
               
               <div className="hidden lg:block w-px h-12 bg-black/10" />
               
               <div className="flex items-center gap-6 w-full sm:w-auto justify-center">
                  <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center">
                    <span className="text-3xl font-black text-orange-600">
                      {safeProjects.length > 0 ? safeProjects.reduce((acc, p) => acc + (p.slide_count ? Math.round(p.slide_count * 0.25 + 2) : 0), 0) : 0}h
                    </span>
                  </div>
                  <div className="flex flex-col text-left">
                     <span className="text-sm font-black tracking-tight text-[#1D1B20]">Est. Labor</span>
                     <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">Time Invested</span>
                  </div>
               </div>
            </div>
          </div>

          {/* 4. Infinite Hero Carousel */}
          {safeProjects.length > 0 && (
             <div className="w-full overflow-hidden flex relative py-8 mb-16">
                <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-[#FDF7FF] to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-[#FDF7FF] to-transparent z-10 pointer-events-none" />
                
                <motion.div 
                   animate={{ x: ["0%", "-50%"] }} 
                   transition={{ duration: 60, ease: "linear", repeat: Infinity }}
                   className="flex gap-6 px-6 w-fit"
                >
                   {safeProjects.concat(safeProjects).map((proj, idx) => (
                      <Link 
                        key={`${proj.id}-${idx}`} 
                        href={`/projects/${proj.id}`}
                        className="w-[280px] h-[160px] sm:w-[320px] sm:h-[180px] rounded-3xl overflow-hidden shrink-0 shadow-lg border border-black/5 relative group cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 block"
                      >
                         <img 
                           src={getPublicUrl(proj.id, proj.thumbnail || "slide_0.webp")} 
                           className="w-full h-full object-cover bg-black/5 transition-transform duration-700 group-hover:scale-110" 
                           alt={proj.title}
                           onError={(e) => { e.currentTarget.src = "/user-placeholder.svg"; }}
                         />
                         <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-5 pt-12">
                            <span className="text-white font-black text-sm tracking-tight line-clamp-2 leading-snug">{proj.title}</span>
                         </div>
                      </Link>
                   ))}
                </motion.div>
             </div>
          )}
        </div>
      )}

      {/* 5. Main Gallery Area (Filters + Grid) */}
      <main className="w-full max-w-[1600px] mx-auto px-6 lg:px-12 relative z-20">
        
        {/* Filters */}
        {isMounted && subjects.length > 0 && (
          <div className="flex gap-3 overflow-x-auto pb-6 mb-8 no-scrollbar w-full mask-edges">
            {subjects.map((sub, i) => {
              const isActive = currentSubject === sub;
              return (
                <button
                  key={`${sub}-${i}`}
                  onClick={() => setCurrentSubject(isActive ? "" : sub)}
                  className={cn(
                     "px-6 py-3 rounded-full text-xs font-black tracking-widest uppercase transition-all whitespace-nowrap border",
                     isActive 
                       ? "bg-[#6750A4] text-white border-[#6750A4] shadow-[0_8px_24px_-8px_rgba(103,80,164,0.5)] scale-105" 
                       : "bg-white text-[#1D1B20]/60 border-black/5 hover:bg-black/5 hover:text-[#1D1B20]"
                  )}
                >
                  {sub}
                </button>
              );
            })}
          </div>
        )}

        {/* Loading Grid */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
             {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-[32px] bg-black/5 animate-pulse h-[280px]" />
             ))}
          </div>
        )}

        {/* Bento Grid */}
        {!loading && filteredProjects.length === 0 && (
           <div className="w-full py-20 flex flex-col items-center justify-center opacity-40">
              <Search size={48} className="mb-4" />
              <h3 className="text-xl font-black tracking-widest uppercase">No Archives Found</h3>
           </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-[320px]">
          {filteredProjects.map((proj, idx) => (
            <BentoCard key={proj.id} project={proj} delay={idx * 0.05} />
          ))}
        </div>

        {/* 6. Discover Flow (SlidesCarnival Style Footer Section) */}
        <section className="mt-40 pt-20 border-t border-black/5">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div>
                 <h2 className="text-5xl font-black tracking-tighter mb-8 leading-none">The Science of <br/> Architectural Design</h2>
                 <p className="text-xl text-black/50 font-medium leading-relaxed mb-10">
                    Every project in the VoidArchive is more than just a presentation. It is a captured moment of academic labor, extracted through high-fidelity LibreOffice pipelines to preserve font geometry and transition logic.
                 </p>
                 <div className="flex gap-10">
                    <div>
                       <div className="text-4xl font-black text-[#6750A4] mb-2">{safeProjects.length}</div>
                       <div className="text-xs font-black uppercase tracking-widest opacity-40">Projects</div>
                    </div>
                    <div>
                       <div className="text-4xl font-black text-blue-600 mb-2">100%</div>
                       <div className="text-xs font-black uppercase tracking-widest opacity-40">Authentic</div>
                    </div>
                    <div>
                       <div className="text-4xl font-black text-orange-600 mb-2">24/7</div>
                       <div className="text-xs font-black uppercase tracking-widest opacity-40">Available</div>
                    </div>
                 </div>
              </div>
              <div className="bg-[#6750A4]/5 rounded-[60px] p-12 lg:p-16 border border-[#6750A4]/10 relative overflow-hidden group">
                 <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#6750A4]/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                 <h3 className="text-2xl font-black mb-6 relative z-10 text-[#6750A4]">How to use this Archive?</h3>
                 <ul className="space-y-6 relative z-10">
                    {[
                      { t: "Interrogate", d: "Use the global search to find specific subject legacies." },
                      { t: "Examine", d: "Enter the Exhibition view for a cinema-grade slide experience." },
                      { t: "Archive", d: "Download the original raw assets for offline preservation." }
                    ].map((step, i) => (
                       <li key={i} className="flex gap-5">
                          <div className="w-8 h-8 rounded-full bg-[#6750A4] text-white flex items-center justify-center shrink-0 font-black text-xs">{i+1}</div>
                          <div>
                             <h4 className="font-black text-sm uppercase tracking-widest">{step.t}</h4>
                             <p className="text-sm opacity-50 font-medium">{step.d}</p>
                          </div>
                       </li>
                    ))}
                 </ul>
              </div>
           </div>
        </section>
      </main>
    </div>
  );
}

function BentoCard({ project, delay }: { project: any, delay: number }) {
  const [hover, setHover] = useState(false);
  const isHeavy = project.slide_count > 15;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={cn(
        "relative rounded-[40px] overflow-hidden group border border-white/50 bg-white transition-all duration-500",
        isHeavy ? "sm:col-span-2 sm:row-span-2" : "col-span-1 row-span-1",
        hover ? "shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] -translate-y-3 ring-2 ring-[#6750A4]/20" : "shadow-lg shadow-black/5"
      )}
    >
      <Link href={`/projects/${project.id}`} className="block w-full h-full absolute inset-0">
        
        {/* Dynamic Background */}
        <div className="absolute inset-0 bg-[#F9F9F9] transition-colors duration-700">
          <img 
            src={getPublicUrl(project.id, project.thumbnail || 'slide_0.webp')} 
            alt={project.title}
            className={cn(
              "w-full h-full object-cover transition-all duration-1000",
              hover ? "scale-110 opacity-30 blur-md" : "scale-[1.02] opacity-100"
            )}
            onError={(e) => { e.currentTarget.src = "/user-placeholder.svg"; }}
          />
        </div>

        {/* Playful Gradient Overlay */}
        <div className={cn(
           "absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-100 transition-opacity duration-500",
           hover && "opacity-80"
        )} />

        {/* Auto-playing Teaser */}
        <AnimatePresence>
          {hover && project.teaser && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 z-10"
            >
              <img 
                src={getPublicUrl(project.id, project.teaser)} 
                className="w-full h-full object-cover mix-blend-overlay"
                alt="Teaser"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Foreground Content */}
        <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 sm:p-8 transition-transform duration-500 transform translate-y-2 group-hover:translate-y-0">
           
           <div className="flex justify-between items-start mb-auto opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-y-4 group-hover:translate-y-0">
              <div className="flex gap-2">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-xl backdrop-blur-md bg-white/20 border border-white/30 hover:bg-[#6750A4] transition-colors">
                  <Info size={16} />
                </div>
                <div className="px-4 py-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-black text-white uppercase tracking-widest">
                  {project.subject || "General"}
                </div>
              </div>
              <div className="flex gap-1 text-yellow-500 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full">
                <Star size={12} fill="currentColor" />
                <Star size={12} fill="currentColor" />
                <Star size={12} fill="currentColor" />
                <Star size={12} fill="currentColor" />
                <Star size={12} fill="currentColor" className="opacity-40" />
              </div>
           </div>

           <div>
              <h3 className="text-2xl sm:text-3xl text-white font-black mb-3 leading-tight tracking-tight drop-shadow-md">
                {project.title}
              </h3>
              
              <div className="flex flex-wrap items-center justify-between gap-4 text-white/80 font-bold text-xs uppercase tracking-widest">
                 <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                    <span className="text-[#A8C7FA]">{project.slide_count}</span>
                    <span className="opacity-70">Slides</span>
                 </div>
                 
                 <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-white translate-x-4 group-hover:translate-x-0">
                   <span>Explore</span>
                   <ChevronRight size={16} className="animate-pulse" />
                 </div>
              </div>
           </div>
        </div>

      </Link>
    </motion.div>
  );
}
