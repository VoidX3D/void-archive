"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Share2, Maximize2, Minimize2,
  ChevronLeft, ChevronRight, Info, AlertTriangle,
  Keyboard, X, Download, Monitor, Play, Pause, ZoomIn, ZoomOut,
  Maximize, Minimize, ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getPublicUrl } from "@/lib/supabase";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function ProjectViewer() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHUD, setShowHUD] = useState(true);
  const [isAutoplay, setIsAutoplay] = useState(false);
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const hudTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoplayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/projects").then(r => r.json()).then(data => {
      const proj = data.find((p: any) => p.id === id);
      if (proj) setProject(proj);
    });
  }, [id]);

  const goNext = useCallback(() => {
    if (!project) return;
    setCurrentSlide(p => (p + 1) % (project.slides?.length || 1));
  }, [project]);

  const goPrev = useCallback(() => {
    if (!project) return;
    setCurrentSlide(p => (p - 1 + (project.slides?.length || 1)) % (project.slides?.length || 1));
  }, [project]);

  useEffect(() => {
    if (isAutoplay) autoplayTimer.current = setInterval(goNext, 8000);
    else if (autoplayTimer.current) clearInterval(autoplayTimer.current);
    return () => { if (autoplayTimer.current) clearInterval(autoplayTimer.current); };
  }, [isAutoplay, goNext]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "f") toggleFullscreen();
      if (e.key === " ") setIsAutoplay(!isAutoplay);
      if (e.key === "Escape") router.back();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev, isAutoplay, router]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleMouseMove = () => {
    setShowHUD(true);
    if (hudTimer.current) clearTimeout(hudTimer.current);
    hudTimer.current = setTimeout(() => { if (!isAutoplay) setShowHUD(false); }, 3000);
  };

  if (!project) return (
    <div className="h-screen bg-black flex items-center justify-center">
       <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  );

  const slides = project.slides || [];
  const activeSlidePath = getPublicUrl(id as string, slides[currentSlide]);

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="view-container bg-black relative group select-none no-scrollbar h-screen w-screen overflow-hidden flex flex-col items-center justify-center p-0"
    >
      
      {/* SHARP HUD */}
      <AnimatePresence>
        {showHUD && (
          <motion.nav 
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            className="absolute top-0 inset-x-0 z-50 p-10 flex items-center justify-between"
          >
            <div className="flex items-center gap-10">
              <button onClick={() => router.back()} className="p-5 bg-white/5 border border-white/10 rounded-full hover:bg-white text-black transition-all shadow-3xl glass group">
                <ArrowLeft size={24} className="group-hover:scale-110 transition-all" />
              </button>
              <div className="space-y-1">
                <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">{project.title}</h1>
                <div className="flex items-center gap-4 text-[10px] font-black text-white/40 tracking-[0.5em] uppercase">
                   {project.subject} <ShieldCheck size={10} className="text-green-500"/> AUTHENTICATED VAULT NODE {currentSlide + 1}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="hidden lg:flex items-center gap-3 px-6 py-2 bg-white/5 border border-white/10 rounded-full glass">
                <Monitor size={16} className="text-white/40" />
                <span className="text-[10px] font-black text-white tracking-widest uppercase">High Preservation Viewing</span>
              </div>
              <button 
                onClick={() => setIsAutoplay(!isAutoplay)}
                className={`p-4 border-2 transition-all rounded-full glass ${isAutoplay ? 'bg-white border-white text-black scale-110 shadow-3xl' : 'bg-white/5 border-white/10 text-white'}`}
              >
                {isAutoplay ? <Pause size={24} /> : <Play size={24} />}
              </button>
              <button onClick={toggleFullscreen} className="p-4 bg-white/5 border border-white/10 rounded-full glass hover:bg-white text-black transition-all">
                {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* STAGE (NO GRAIN, PURE CONTRAST) */}
      <main className="flex-1 flex items-center justify-center relative w-full h-full overflow-hidden p-0 sm:p-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: zoom }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full h-full max-w-[1700px] flex items-center justify-center"
          >
            <img 
              src={activeSlidePath} 
              alt="Labours Slide"
              className="w-full h-full object-contain shadow-[0_40px_120px_rgba(0,0,0,0.9)] border border-white/5 select-none pointer-events-none"
              style={{ imageRendering: 'auto' }}
            />
            
            {/* Glossy Overlay Watermark */}
            <div className="absolute bottom-12 right-12 opacity-5 pointer-events-none select-none flex flex-col items-end scale-75 lg:scale-100">
              <span className="text-[60px] font-black tracking-tighter text-white leading-none">SB MUSEUM</span>
              <span className="text-[12px] font-black tracking-[1em] text-white">LEGACY ARCHIVE</span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* GLOSSY NAV TRIGGERS */}
        <button onClick={goPrev} className="absolute inset-y-0 left-0 w-32 flex items-center justify-start pl-12 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <div className="p-6 rounded-full bg-white/5 text-white/40 hover:text-black hover:bg-white border border-white/10 glass transition-all shadow-2xl scale-125">
             <ChevronLeft size={32} />
          </div>
        </button>
        <button onClick={goNext} className="absolute inset-y-0 right-0 w-32 flex items-center justify-end pr-12 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <div className="p-6 rounded-full bg-white/5 text-white/40 hover:text-black hover:bg-white border border-white/10 glass transition-all shadow-2xl scale-125">
             <ChevronRight size={32} />
          </div>
        </button>
      </main>

      {/* GLOSSY REEL PANEL */}
      <AnimatePresence>
        {showHUD && (
          <motion.div 
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="absolute bottom-0 inset-x-0 z-50 p-12 flex flex-col items-center gap-10"
          >
            {/* Zoom Controls */}
            <div className="flex items-center gap-2 p-1.5 bg-black/40 border border-white/10 rounded-full glass pointer-events-auto">
              <button 
                onClick={() => setZoom(z => Math.max(1, z - 0.2))} 
                className="p-4 hover:bg-white rounded-full transition-all text-white hover:text-black"
              >
                <ZoomOut size={20} />
              </button>
              <div className="h-6 w-px bg-white/10 mx-2" />
              <button 
                onClick={() => setZoom(z => Math.min(2.5, z + 0.2))}
                className="p-4 hover:bg-white rounded-full transition-all text-white hover:text-black"
              >
                <ZoomIn size={20} />
              </button>
            </div>

            {/* Glossy Reel */}
            <div className="w-full max-w-5xl overflow-x-auto no-scrollbar pointer-events-auto flex items-center gap-4 px-12 pb-2">
              {slides.map((s: string, i: number) => (
                <button 
                  key={i} 
                  onClick={() => { setCurrentSlide(i); setZoom(1); }}
                  className={`relative flex-shrink-0 w-36 aspect-video rounded-xl overflow-hidden border-4 transition-all duration-500 shadow-2xl ${i === currentSlide ? 'border-white scale-110' : 'border-white/5 opacity-30 hover:opacity-100 hover:scale-105'}`}
                >
                  <img src={getPublicUrl(id as string, s)} alt="Thumb" className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100" />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent" />
                  <span className="absolute bottom-2 right-2 text-[10px] font-black text-white/40">{i + 1}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PROGRESS PROTOCOL */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-white/5 overflow-hidden z-[60]">
        <motion.div 
          className="h-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.8)]"
          animate={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
          transition={{ duration: 0.8, ease: "anticipate" }}
        />
      </div>

    </div>
  );
}
