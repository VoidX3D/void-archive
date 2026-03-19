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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
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

  const safeProjects = Array.isArray(projects) ? projects : [];

  return (
    <div className="min-h-screen bg-[#FDF7FF] text-[#1D1B20] selection:bg-[#6750A4]/20 selection:text-[#6750A4] font-sans overflow-x-hidden pb-32">
      
      <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-6 lg:px-12 py-5 bg-white/70 backdrop-blur-xl border-b border-[#1D1B20]/5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-[#1D1B20] text-white flex items-center justify-center transform rotate-12 shadow-lg">
            <span className="font-black text-lg">V</span>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter leading-none">VoidArchive</h1>
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-40">Sincere Bhattarai</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
           <Link href="/archive" className="text-xs font-black uppercase tracking-widest text-[#6750A4] bg-[#6750A4]/5 px-6 py-3 rounded-full hover:bg-[#6750A4] hover:text-white transition-all">Enter Vault</Link>
        </div>
      </nav>

      <section className="relative w-full pt-48 pb-20 px-6 lg:px-12 flex flex-col items-center text-center overflow-hidden">
        <div className="relative z-10 w-full max-w-4xl mx-auto">
          <h2 className="text-7xl sm:text-8xl lg:text-[10rem] font-black mb-12 leading-[0.8] tracking-tighter text-[#1D1B20]">
            Digital <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6750A4] to-blue-600">Archive</span>
          </h2>
          
          <div className="max-w-2xl mx-auto flex flex-col items-center gap-10">
             <p className="text-xl text-black/40 font-medium leading-relaxed">
                The official view-only legacy of Sincere Bhattarai. A refined collection of academic labor, extracted with high-fidelity precision.
             </p>
             <Link 
               href="/archive"
               className="group flex items-center gap-4 bg-[#1D1B20] text-white px-10 py-5 rounded-[28px] font-black uppercase tracking-widest text-xs shadow-2xl hover:scale-105 transition-all"
             >
                Explore The Collection
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
             </Link>
          </div>
        </div>
      </section>

      {isMounted && safeProjects.length > 0 && (
        <div className="mt-20">
           {/* Dynamic Stats */}
           <div className="max-w-[1600px] mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-3 gap-8 mb-40">
              <div className="bg-white p-10 rounded-[40px] border border-black/5 shadow-sm text-center">
                 <div className="text-5xl font-black text-[#6750A4] mb-2">{safeProjects.length}</div>
                 <div className="text-[10px] font-black uppercase tracking-widest opacity-40">Active Records</div>
              </div>
              <div className="bg-white p-10 rounded-[40px] border border-black/5 shadow-sm text-center">
                 <div className="text-5xl font-black text-blue-600 mb-2">{safeProjects.reduce((acc, p) => acc + (p.slide_count || 0), 0)}</div>
                 <div className="text-[10px] font-black uppercase tracking-widest opacity-40">Preserved Slides</div>
              </div>
              <div className="bg-white p-10 rounded-[40px] border border-black/5 shadow-sm text-center">
                 <div className="text-5xl font-black text-orange-600 mb-2">100%</div>
                 <div className="text-[10px] font-black uppercase tracking-widest opacity-40">Archival Accuracy</div>
              </div>
           </div>

           {/* Hero Ribbon */}
           <div className="w-full overflow-hidden flex relative py-10 bg-[#F5F1F7]">
              <motion.div 
                 animate={{ x: ["0%", "-50%"] }} 
                 transition={{ duration: 50, ease: "linear", repeat: Infinity }}
                 className="flex gap-8 px-4 w-fit"
              >
                 {safeProjects.concat(safeProjects).map((proj, idx) => (
                    <div key={idx} className="w-[300px] aspect-video rounded-[32px] overflow-hidden shrink-0 shadow-lg border-4 border-white">
                       <img src={getPublicUrl(proj.id, proj.thumbnail || "slide_0.webp")} className="w-full h-full object-cover" alt="" />
                    </div>
                 ))}
              </motion.div>
           </div>
        </div>
      )}

    </div>
  );
}
