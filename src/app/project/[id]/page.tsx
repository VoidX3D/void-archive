"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Star, Share2, Maximize2, 
  ChevronLeft, ChevronRight, Info, AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getIdentityHash } from "@/lib/fingerprint";
import { getPublicUrl } from "@/lib/supabase";

export default function ProjectViewer() {
  const { id } = useParams();
  const [project, setProject] = useState<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [rating, setRating] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Disable right-click
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", handleContextMenu);

    const fetchProject = async () => {
       try {
          const res = await fetch("/api/projects");
          const data = await res.json();
          const proj = data.find((p: any) => p.id === id);
          if (proj) setProject(proj);
       } catch (err) {
          console.error("Failed to fetch project", err);
       }
    };
    fetchProject();
    return () => document.removeEventListener("contextmenu", handleContextMenu);
  }, [id]);

  useEffect(() => {
    if (scrollRef.current) {
        const item = scrollRef.current.children[currentSlide] as HTMLElement;
        if (item) {
            scrollRef.current.scrollTo({
                top: item.offsetTop - 100,
                behavior: 'smooth'
            });
        }
    }
  }, [currentSlide]);

  const handleRate = async (val: number) => {
     setRating(val);
     const hash = await getIdentityHash();
     await fetch("/api/rate", {
        method: "POST",
        body: JSON.stringify({
           projectId: id,
           rating: val,
           identityHash: hash,
           telemetry: {
              ua: navigator.userAgent,
              memory: (navigator as any).deviceMemory,
              cores: navigator.hardwareConcurrency
           }
        })
     });
  };

  if (!project) return <div className="min-h-screen bg-black flex items-center justify-center font-black text-white/20 text-8xl tracking-tight">VOID ARCHIVE</div>;

  const slides = Array.from({ length: project.slide_count }).map((_, i) => getPublicUrl(id as string, `slide_${i}.webp`));

  return (
    <div className="min-h-screen bg-[#090909] flex flex-col text-white select-none">
       {/* Anti-Copy Styles */}

       {/* Floating Header */}
       <header className="fixed top-0 left-0 right-0 z-50 px-8 py-6 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
          <div className="flex items-center gap-6">
             <Link href="/" className="p-4 hover:bg-white/10 rounded-full transition-all border border-white/5 bg-black/40 backdrop-blur-xl">
                <ArrowLeft size={20} />
             </Link>
             <div>
                <h1 className="font-black text-3xl tracking-tighter leading-none">{project.title}</h1>
                <div className="flex gap-4 mt-2">
                   <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Collector: Sincere Bhattarai</span>
                   <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Subject: {project.subject || "General"}</span>
                </div>
             </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="flex items-center bg-white/5 border border-white/10 rounded-full p-1 pl-4 gap-4 backdrop-blur-xl">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Guest Proof</span>
                <div className="flex gap-1 pr-2">
                   {[1, 2, 3, 4, 5].map((s) => (
                      <Star 
                        key={s} 
                        size={18} 
                        onClick={() => handleRate(s)}
                        fill={s <= rating ? "#FACC15" : "none"}
                        className={`cursor-pointer transition-transform hover:scale-125 ${s <= rating ? "text-yellow-400" : "text-white/20"}`} 
                      />
                   ))}
                </div>
             </div>
             
             <button className="flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black hover:scale-105 transition-all font-black text-sm shadow-2xl">
                <Share2 size={18} />
                <span>Sync Legacy</span>
             </button>
          </div>
       </header>

       <div className="flex-1 flex pt-28 overflow-hidden">
          {/* Museum Rail (Left Filmstrip) */}
          <div 
            ref={scrollRef}
            className="w-64 bg-black/40 border-r border-white/5 overflow-y-auto p-6 space-y-6 no-scrollbar backdrop-blur-3xl"
          >
             <div className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 mb-8 px-2">Manifest</div>
             {slides.map((src, i) => (
                <motion.div
                   key={i}
                   whileHover={{ x: 10, scale: 1.05 }}
                   onClick={() => setCurrentSlide(i)}
                   className={`relative aspect-video rounded-2xl overflow-hidden cursor-pointer border-2 transition-all duration-700 ${
                        currentSlide === i ? "border-purple-500 shadow-[0_0_40px_rgba(168,85,247,0.3)] scale-105" : "border-white/5 opacity-30 grayscale hover:opacity-100 hover:grayscale-0"
                   }`}
                >
                   <img src={src} alt="Thumb" className="w-full h-full object-cover" />
                </motion.div>
             ))}
          </div>

          {/* Main Exhibition Stage (Center) */}
          <div className="flex-1 relative overflow-hidden flex flex-col bg-[#050505]">
             <div className="flex-1 flex items-center justify-center p-12">
                <AnimatePresence mode="wait">
                   <motion.div
                      key={currentSlide}
                      initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
                      animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                      exit={{ opacity: 0, scale: 1.1, rotateX: -20 }}
                      transition={{ type: "spring", damping: 30, stiffness: 150 }}
                      className="w-full h-full max-w-7xl flex items-center justify-center relative perspective-1000"
                   >
                      <img 
                        src={slides[currentSlide]} 
                        className="w-full h-full object-contain rounded-2xl shadow-[0_64px_128px_-32px_rgba(0,0,0,1)] ring-1 ring-white/10" 
                        alt="Current Arc"
                      />
                    
                      <button 
                        onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                        className="absolute left-12 top-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-white/5 text-white flex items-center justify-center hover:bg-white/20 transition-all backdrop-blur-3xl border border-white/10 group shadow-2xl"
                      >
                         <ChevronLeft size={40} className="group-hover:-translate-x-1 transition-transform" />
                      </button>
                      <button 
                        onClick={() => setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1))}
                        className="absolute right-12 top-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-white/5 text-white flex items-center justify-center hover:bg-white/20 transition-all backdrop-blur-3xl border border-white/10 group shadow-2xl"
                      >
                         <ChevronRight size={40} className="group-hover:translate-x-1 transition-transform" />
                      </button>

                      {/* Hard Watermark Overlay */}
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden opacity-5 mix-blend-overlay">
                         <span className="text-white font-black text-[12vw] rotate-12 whitespace-nowrap select-none">Sincere B. Archive Sincere B. Archive</span>
                      </div>
                   </motion.div>
                </AnimatePresence>
             </div>

             {/* Exhibition Metadata Rail */}
             <div className="h-32 bg-black/80 border-t border-white/5 flex items-center justify-between px-16 backdrop-blur-3xl relative z-10">
                <div className="flex gap-12 items-center">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Arc Counter</span>
                        <div className="text-2xl font-black">
                           <span className="text-purple-500">{currentSlide + 1}</span>
                           <span className="text-white/20 mx-2">/</span>
                           <span>{slides.length}</span>
                        </div>
                    </div>
                    <div className="h-8 w-px bg-white/10" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Estimated Investment</span>
                        <div className="text-2xl font-black">{project.time_spent || "42h 15m"}</div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all group shadow-xl">
                        <Maximize2 size={24} className="group-hover:scale-110 transition-transform" />
                    </button>
                    <button className="flex items-center gap-4 bg-purple-600 px-8 py-4 rounded-full font-black text-sm hover:bg-purple-500 transition-colors shadow-[0_0_30px_rgba(168,85,247,0.4)]">
                        <Info size={18} />
                        <span>View Authenticity Proof</span>
                    </button>
                </div>
             </div>
          </div>
       </div>

       {/* Caution Banner Overlay (Hidden by default, triggered on save/print) */}
       <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 animate-gradient-x z-[60]" />
    </div>
  );
}
