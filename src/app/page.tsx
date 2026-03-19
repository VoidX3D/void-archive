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

  useEffect(() => {
    // Disable right click globally
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", handleContextMenu);
    
    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/projects");
        const data = await res.json();
        setProjects(data);
      } catch (err) {
        console.error("Failed to fetch projects", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjects();
    const interval = setInterval(fetchProjects, 10000); // Polling for new files
    
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      clearInterval(interval);
    };
  }, []);

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.subject?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FDF7FF] text-[#1D1B20] select-none">

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-12 py-6 bg-white/10 backdrop-blur-3xl border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[18px] bg-black shadow-2xl flex items-center justify-center transform rotate-12">
            <span className="text-white font-black text-xl">V</span>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter leading-none">VoidArchive</h1>
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-40">Sincere Bhattarai</span>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
           <Link href="/legacy" className="text-xs font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">The Legacy</Link>
           <div className="h-4 w-px bg-black/10" />
           <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Archive Live</span>
           </div>
        </div>
      </nav>

      {/* Hero Stage: Live Canvas */}
      <section className="relative h-[85vh] flex flex-col items-center justify-center overflow-hidden pt-24">
        {/* Animated Background Blob */}
        <div className="absolute inset-0 z-0">
           <motion.div 
             animate={{ 
               scale: [1, 1.2, 1],
               rotate: [0, 90, 0],
               x: [-100, 100, -100],
               y: [-50, 50, -50]
             }}
             transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
             className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-purple-400/20 blur-[120px] mix-blend-multiply"
           />
           <motion.div 
             animate={{ 
               scale: [1.2, 1, 1.2],
               rotate: [90, 0, 90],
               x: [100, -100, 100],
               y: [50, -50, 50]
             }}
             transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
             className="absolute bottom-1/4 right-1/4 w-[800px] h-[800px] rounded-full bg-blue-400/20 blur-[150px] mix-blend-multiply"
           />
        </div>

        <div className="relative z-10 w-full max-w-4xl px-12 text-center pointer-events-none">
          <motion.div
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             className="text-[10px] font-black uppercase tracking-[0.8em] text-[#6750A4] mb-8 bg-[#6750A4]/5 px-6 py-2 rounded-full inline-block backdrop-blur-xl border border-[#6750A4]/10"
          >
             Official View-Only Archive
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-7xl md:text-[10vw] font-black mb-12 leading-[0.8] tracking-[-0.05em]"
          >
            Digital <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Legend</span>
          </motion.h2>
          
          {/* Massive M3 Search Bar */}
          <div className="relative group pointer-events-auto">
            <div className="absolute inset-0 bg-white/40 blur-3xl group-hover:bg-white/60 transition-all rounded-[45px]" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="relative flex items-center bg-white border-2 border-black/5 rounded-[45px] p-2 pr-4 shadow-[0_32px_128px_-32px_rgba(0,0,0,0.1)] hover:shadow-[0_32px_128px_-32px_rgba(103,80,164,0.2)] transition-all duration-700"
            >
              <div className="p-6 bg-[#6750A4] text-white rounded-[38px] shadow-xl shadow-[#6750A4]/30 mr-4">
                 <Search size={32} strokeWidth={3} />
              </div>
              <input 
                 type="text" 
                 placeholder="Interrogate the Archive..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="flex-1 bg-transparent border-none outline-none text-2xl font-bold placeholder:opacity-20 py-8 px-4"
              />
              <div className="flex gap-2">
                 <div className="hidden md:flex px-4 py-2 bg-black/5 rounded-2xl text-[10px] items-center font-black opacity-30 tracking-widest uppercase">⌘ K</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <main className="max-w-[1700px] mx-auto p-12 lg:p-24 bg-white rounded-[100px] shadow-[0_-50px_100px_-20px_rgba(0,0,0,0.05)] -mt-20 relative z-20 min-h-screen select-none">

        {/* Bento Grid */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
             {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-3xl bg-black/5 animate-pulse h-[250px]" />
             ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 auto-rows-[300px]">
          {filteredProjects.map((proj, idx) => (
            <BentoCard key={proj.id} project={proj} delay={idx * 0.05} />
          ))}
        </div>
      </main>
    </div>
  );
}

function BentoCard({ project, delay }: { project: any, delay: number }) {
  const [hover, setHover] = useState(false);
  const isHeavy = project.slide_count > 15;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={cn(
        "relative rounded-[40px] overflow-hidden group cursor-pointer border border-black/5 transition-all duration-700",
        isHeavy ? "md:col-span-2 md:row-span-2" : "col-span-1 row-span-1",
        hover ? "shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] -translate-y-2" : "shadow-sm"
      )}
    >
      <Link href={`/project/${project.id}`}>
        {/* Dynamic Background */}
        <div 
          className="absolute inset-0 bg-gray-100 transition-colors duration-700" 
          style={{ backgroundColor: hover ? `${project.dominant_color}20` : '#F9F9F9' }}
        >
          <img 
            src={getPublicUrl(project.id, 'slide_0.webp')} 
            alt={project.title}
            className={cn(
              "w-full h-full object-cover transition-all duration-1000",
              hover ? "scale-110 opacity-40 blur-sm" : "scale-100 opacity-100"
            )}
          />
        </div>

        {/* Teaser Video/Image */}
        <AnimatePresence>
          {hover && project.teaser && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10"
            >
              <img 
                src={getPublicUrl(project.id, project.teaser)} 
                className="w-full h-full object-cover"
                alt="Teaser"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Poster Content */}
        <div className={cn(
          "absolute inset-0 z-20 flex flex-col justify-end p-8 transition-all duration-1000",
          hover ? "bg-gradient-to-t from-black/60 to-transparent" : "bg-gradient-to-t from-black/20 to-transparent shadow-inner"
        )}>
           <div className="backdrop-blur-2xl bg-white/20 border border-white/20 rounded-[32px] p-6 group-hover:bg-white/90 transition-all duration-700">
              <div className="flex justify-between items-start mb-4">
                 <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: project.dominant_color }}
                 >
                    <Info size={14} />
                 </div>
                 <div className="flex gap-1 text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity">
                   <Star size={12} fill="currentColor" />
                   <Star size={12} fill="currentColor" />
                   <Star size={12} fill="currentColor" />
                   <Star size={12} fill="currentColor" />
                   <Star size={12} fill="currentColor" />
                 </div>
              </div>
              <h3 className="font-black text-2xl group-hover:text-black transition-colors mb-2 leading-tight">
                {project.title}
              </h3>
              <div className="flex items-center justify-between text-black/40 text-[10px] font-black uppercase tracking-widest">
                 <span>{project.slide_count} Arc Archival</span>
                 <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity text-[#6750A4]">
                   <span>VIEW LEGACY</span>
                   <ChevronRight size={14} />
                 </div>
              </div>
           </div>
        </div>
      </Link>
    </motion.div>
  );
}
