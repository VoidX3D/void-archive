"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Share2, Maximize2, Minimize2,
  ChevronLeft, ChevronRight, Info, AlertTriangle,
  Keyboard, X, Download, Monitor, Play, Pause, ZoomIn, ZoomOut
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getIdentityHash } from "@/lib/fingerprint";
import { getPublicUrl } from "@/lib/supabase";
import { StarRating } from "@/components/StarRating";

export default function ProjectViewer() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHUD, setShowHUD] = useState(true);
  const [isAutoplay, setIsAutoplay] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [ratingData, setRatingData] = useState<{ average: number; count: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hudTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoplayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch project
  useEffect(() => {
    fetch("/api/projects").then(r => r.json()).then(data => {
      const proj = data.find((p: any) => p.id === id);
      if (proj) setProject(proj);
    });
    fetch(`/api/rate?projectId=${id}`).then(r => r.json()).then(res => setRatingData(res));
  }, [id]);

  // Navigation
  const goNext = useCallback(() => {
    if (!project) return;
    setCurrentSlide(p => (p + 1) % (project.slides?.length || 1));
  }, [project]);

  const goPrev = useCallback(() => {
    if (!project) return;
    setCurrentSlide(p => (p - 1 + (project.slides?.length || 1)) % (project.slides?.length || 1));
  }, [project]);

  // Autoplay
  useEffect(() => {
    if (isAutoplay) {
      autoplayTimer.current = setInterval(goNext, 5000);
    } else {
      if (autoplayTimer.current) clearInterval(autoplayTimer.current);
    }
    return () => { if (autoplayTimer.current) clearInterval(autoplayTimer.current); };
  }, [isAutoplay, goNext]);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "f") toggleFullscreen();
      if (e.key === " ") setIsAutoplay(!isAutoplay);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev, isAutoplay]);

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
    hudTimer.current = setTimeout(() => {
      if (!isAutoplay) setShowHUD(false);
    }, 3000);
  };

  if (!project) return <div className="h-screen bg-black flex items-center justify-center text-white/20 font-black animate-pulse">LOADING ARCHIVE...</div>;

  const slides = project.slides || [];
  const activeSlidePath = getPublicUrl(id as string, slides[currentSlide]);

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="view-container bg-[#050406] relative group"
    >
      <div className="vignette" />

      {/* Top HUD */}
      <AnimatePresence>
        {showHUD && (
          <motion.nav 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="absolute top-0 inset-x-0 z-50 p-6 flex items-center justify-between"
          >
            <div className="flex items-center gap-6">
              <button onClick={() => router.back()} className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors backdrop-blur-xl text-white/80">
                <ArrowLeft size={18} />
              </button>
              <div className="space-y-0.5">
                <h1 className="text-sm font-black text-white/90 tracking-tighter uppercase">{project.title}</h1>
                <p className="text-[10px] font-black text-white/40 tracking-[0.3em] uppercase">{project.subject} • SLIDE {currentSlide + 1}/{slides.length}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl backdrop-blur-xl">
                <Monitor size={14} className="text-white/40" />
                <span className="text-[10px] font-black text-white/60 tracking-widest uppercase">Archival View</span>
              </div>
              <button 
                onClick={() => setIsAutoplay(!isAutoplay)}
                className={`p-3 border transition-all rounded-2xl backdrop-blur-xl ${isAutoplay ? 'bg-purple-500 border-purple-400 text-white' : 'bg-white/5 border-white/10 text-white/80'}`}
              >
                {isAutoplay ? <Pause size={18} /> : <Play size={18} />}
              </button>
              <button onClick={toggleFullscreen} className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors backdrop-blur-xl text-white/80">
                {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Main Exhibition Stage */}
      <main className="flex-1 flex items-center justify-center relative p-4 sm:p-12 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: zoom, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.02, filter: "blur(5px)" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full h-full max-w-7xl max-h-[85vh] flex items-center justify-center"
          >
            <img 
              src={activeSlidePath} 
              alt="Slide"
              className="w-full h-full object-contain drop-shadow-[0_24px_64px_rgba(0,0,0,0.8)] rounded-xl sm:rounded-3xl border border-white/5 pointer-events-none select-none"
            />
            
            {/* Museum Watermark Overlay */}
            <div className="absolute bottom-8 right-8 mix-blend-overlay opacity-20 pointer-events-none select-none flex flex-col items-end">
              <span className="text-[40px] font-black tracking-tighter text-white leading-none">SB ARCHIVE</span>
              <span className="text-[10px] font-black tracking-[0.5em] text-white">AUTHENTICATED LEGACY</span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Overlays */}
        <button onClick={goPrev} className="absolute inset-y-0 left-0 w-24 flex items-center justify-start pl-8 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <div className="p-4 rounded-full bg-white/5 text-white/40 hover:text-white hover:bg-white/10 border border-white/10 backdrop-blur-xl">
             <ChevronLeft size={24} />
          </div>
        </button>
        <button onClick={goNext} className="absolute inset-y-0 right-0 w-24 flex items-center justify-end pr-8 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <div className="p-4 rounded-full bg-white/5 text-white/40 hover:text-white hover:bg-white/10 border border-white/10 backdrop-blur-xl">
             <ChevronRight size={24} />
          </div>
        </button>
      </main>

      {/* Bottom Thumbnail Bar */}
      <AnimatePresence>
        {showHUD && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="absolute bottom-0 inset-x-0 z-50 p-6 flex flex-col items-center gap-6 pointer-events-none"
          >
            {/* Controls */}
            <div className="flex items-center gap-2 p-2 bg-black/40 border border-white/10 rounded-2xl backdrop-blur-2xl pointer-events-auto">
              <button 
                onClick={() => setZoom(z => Math.max(1, z - 0.2))} 
                className="p-3 hover:bg-white/10 rounded-xl transition-colors text-white/60 hover:text-white"
              >
                <ZoomOut size={16} />
              </button>
              <div className="h-4 w-px bg-white/10 mx-1" />
              <button 
                onClick={() => setZoom(z => Math.min(2, z + 0.2))}
                className="p-3 hover:bg-white/10 rounded-xl transition-colors text-white/60 hover:text-white"
              >
                <ZoomIn size={16} />
              </button>
            </div>

            {/* Reel */}
            <div className="w-full max-w-4xl overflow-x-auto no-scrollbar pointer-events-auto flex items-center gap-3 px-8">
              {slides.map((s: string, i: number) => (
                <button 
                  key={i} 
                  onClick={() => { setCurrentSlide(i); setZoom(1); }}
                  className={`relative flex-shrink-0 w-24 aspect-video rounded-xl overflow-hidden border-2 transition-all duration-300 ${i === currentSlide ? 'border-purple-500 scale-110 shadow-lg shadow-purple-500/20' : 'border-white/5 opacity-40 hover:opacity-100 hover:scale-105'}`}
                >
                  <img src={getPublicUrl(id as string, s)} alt="Thumb" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/20" />
                  <span className="absolute bottom-1 right-1.5 text-[8px] font-black text-white/60">{i + 1}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Bar (Global) */}
      <div className="absolute top-0 inset-x-0 h-1 bg-white/5 overflow-hidden z-[60]">
        <motion.div 
          className="h-full bg-gradient-to-r from-purple-500 via-blue-400 to-purple-500"
          animate={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

    </div>
  );
}
