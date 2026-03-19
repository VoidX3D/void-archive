"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Share2, Maximize2, Minimize2,
  ChevronLeft, ChevronRight, Info, AlertTriangle,
  Keyboard, X, Download
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getIdentityHash } from "@/lib/fingerprint";
import { getPublicUrl } from "@/lib/supabase";
import { StarRating } from "@/components/StarRating";

export default function ProjectViewer() {
  const { id } = useParams();
  const [project, setProject] = useState<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [rating, setRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [ratingData, setRatingData] = useState<{ average: number; count: number } | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHUD, setShowHUD] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hudTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch project + rating data
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", handleContextMenu);

    Promise.all([
      fetch("/api/projects").then((r) => r.json()),
      fetch(`/api/rate?projectId=${encodeURIComponent(id as string)}`).then((r) => r.json()),
    ]).then(([data, ratingRes]) => {
      if (Array.isArray(data)) {
        const proj = data.find((p: any) => p.id === id);
        if (proj) setProject(proj);
      }
      if (ratingRes?.average !== undefined) setRatingData(ratingRes);
    }).catch(console.error);

    return () => document.removeEventListener("contextmenu", handleContextMenu);
  }, [id]);

  // Keyboard navigation
  const goNext = useCallback(() => {
    if (!project) return;
    const slides = project.slides || [];
    setCurrentSlide((p) => Math.min(slides.length - 1, p + 1));
  }, [project]);

  const goPrev = useCallback(() => {
    setCurrentSlide((p) => Math.max(0, p - 1));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault(); goNext();
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault(); goPrev();
      }
      if (e.key === "Escape") {
        setIsShareOpen(false); setShowHelp(false);
      }
      if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      }
      if (e.key === "?") setShowHelp((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

  // Auto-hide HUD in fullscreen
  const resetHudTimer = useCallback(() => {
    setShowHUD(true);
    if (hudTimer.current != null) clearTimeout(hudTimer.current);
    if (isFullscreen) {
      hudTimer.current = setTimeout(() => setShowHUD(false), 3000);
    }
  }, [isFullscreen]);

  useEffect(() => {
    window.addEventListener("mousemove", resetHudTimer);
    return () => { window.removeEventListener("mousemove", resetHudTimer); if (hudTimer.current != null) clearTimeout(hudTimer.current); };
  }, [resetHudTimer]);

  // Scroll filmstrip
  useEffect(() => {
    if (scrollRef.current) {
      const item = scrollRef.current.children[currentSlide] as HTMLElement;
      if (item) scrollRef.current.scrollTo({ top: item.offsetTop - 80, behavior: "smooth" });
    }
  }, [currentSlide]);

  // Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onFsChange = () => {
      if (!document.fullscreenElement) setIsFullscreen(false);
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const handleRate = async (val: number) => {
    if (hasRated) return;
    setRating(val);
    try {
      const hash = await getIdentityHash();
      const res = await fetch("/api/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: id, rating: val, identityHash: hash,
          telemetry: { ua: navigator.userAgent, cores: navigator.hardwareConcurrency },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setHasRated(true);
        if (data.average !== undefined) setRatingData({ average: data.average, count: data.count });
      }
    } catch (e) { console.error(e); }
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-[#090909] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  const slides = (project.slides && project.slides.length > 0
    ? project.slides
    : Array.from({ length: project.slide_count || 0 }).map((_, i) => `slide_${i}.webp`)
  ).map((name: string) => getPublicUrl(id as string, name));

  const progress = slides.length > 1 ? ((currentSlide + 1) / slides.length) * 100 : 100;

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#070609] flex flex-col text-white selection-none overflow-hidden"
      onMouseMove={resetHudTimer}
    >
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-0.5 bg-white/5 z-[70]">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* HUD Header */}
      <AnimatePresence>
        {showHUD && (
          <motion.header
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed top-0 left-0 right-0 z-50 px-5 sm:px-8 py-5 flex items-center justify-between bg-gradient-to-b from-black/90 to-transparent"
          >
            <div className="flex items-center gap-4">
              <Link
                href={`/projects/${id}`}
                className="p-3 hover:bg-white/10 rounded-full transition-all border border-white/10 glass-dark backdrop-blur-xl"
              >
                <ArrowLeft size={18} />
              </Link>
              <div>
                <h1 className="font-black text-lg sm:text-xl tracking-tighter leading-none line-clamp-1">
                  {project.title}
                </h1>
                <div className="flex gap-4 mt-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
                    Sincere Bhattarai
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
                    {project.subject || "General"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Star rating in header */}
              <div className="hidden sm:flex items-center gap-3 glass-dark px-4 py-2 rounded-full border border-white/10">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                  {hasRated ? "Rated" : "Rate"}
                </span>
                <StarRating
                  value={rating}
                  onChange={handleRate}
                  size={16}
                  submitted={hasRated}
                />
                {ratingData && ratingData.count > 0 && (
                  <span className="text-[10px] font-black text-yellow-400 ml-1">
                    {ratingData.average.toFixed(1)} ({ratingData.count})
                  </span>
                )}
              </div>

              <button
                onClick={() => setShowHelp(true)}
                className="p-3 hover:bg-white/10 rounded-full transition-all border border-white/10 glass-dark"
              >
                <Keyboard size={18} />
              </button>

              <button
                onClick={() => setIsShareOpen(true)}
                className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black hover:scale-105 transition-all font-black text-sm shadow-2xl"
              >
                <Share2 size={16} /> Share
              </button>

              <button
                onClick={toggleFullscreen}
                className="p-3 hover:bg-white/10 rounded-full transition-all border border-white/10 glass-dark"
              >
                {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      <div className="flex-1 flex pt-0 overflow-hidden" style={{ height: "100svh" }}>
        {/* Filmstrip (left) */}
        <AnimatePresence>
          {showHUD && (
            <motion.div
              initial={{ x: -260, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -260, opacity: 0 }}
              transition={{ duration: 0.25 }}
              ref={scrollRef}
              className="hidden sm:flex w-56 lg:w-64 bg-black/50 border-r border-white/5 overflow-y-auto flex-col p-4 gap-3 no-scrollbar backdrop-blur-3xl"
            >
              <div className="text-[9px] font-black uppercase tracking-[0.5em] text-white/20 mt-16 mb-2 px-1">
                Slides ({slides.length})
              </div>
              {slides.map((src: string, i: number) => (
                <motion.button
                  key={i}
                  whileHover={{ x: 6, scale: 1.03 }}
                  onClick={() => setCurrentSlide(i)}
                  className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                    currentSlide === i
                      ? "border-purple-500 shadow-[0_0_24px_rgba(168,85,247,0.4)] scale-105"
                      : "border-white/5 opacity-30 grayscale hover:opacity-90 hover:grayscale-0"
                  }`}
                >
                  <img src={src} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                  <span className="absolute bottom-1 right-1.5 text-[9px] font-black text-white/60">{i + 1}</span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Stage */}
        <div className="flex-1 relative overflow-hidden flex flex-col bg-[#050508]">
          <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, scale: 0.93, filter: "blur(8px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 1.05, filter: "blur(4px)" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="w-full h-full max-w-6xl flex items-center justify-center relative"
              >
                <img
                  src={slides[currentSlide]}
                  className="w-full h-full object-contain rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.9)] ring-1 ring-white/10"
                  alt={`Slide ${currentSlide + 1}`}
                  draggable={false}
                />

                {/* Prev/Next buttons */}
                <button
                  onClick={goPrev}
                  disabled={currentSlide === 0}
                  className="absolute left-0 sm:-left-6 top-1/2 -translate-y-1/2 w-14 sm:w-16 h-14 sm:h-16 rounded-full glass-dark text-white flex items-center justify-center hover:bg-white/20 transition-all border border-white/10 group disabled:opacity-20 shadow-2xl"
                >
                  <ChevronLeft size={28} className="group-hover:-translate-x-0.5 transition-transform" />
                </button>
                <button
                  onClick={goNext}
                  disabled={currentSlide === slides.length - 1}
                  className="absolute right-0 sm:-right-6 top-1/2 -translate-y-1/2 w-14 sm:w-16 h-14 sm:h-16 rounded-full glass-dark text-white flex items-center justify-center hover:bg-white/20 transition-all border border-white/10 group disabled:opacity-20 shadow-2xl"
                >
                  <ChevronRight size={28} className="group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Watermark */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden opacity-[0.04] mix-blend-overlay">
                  <span className="text-white font-black text-[8vw] sm:text-[10vw] rotate-[15deg] whitespace-nowrap select-none">
                    Sincere B. Archive · Sincere B. Archive
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom HUD */}
          <AnimatePresence>
            {showHUD && (
              <motion.div
                initial={{ y: 80 }}
                animate={{ y: 0 }}
                exit={{ y: 80 }}
                transition={{ duration: 0.25 }}
                className="h-24 bg-black/80 border-t border-white/5 flex items-center justify-between px-6 sm:px-14 backdrop-blur-3xl"
              >
                <div className="flex gap-6 sm:gap-10 items-center">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/30 block mb-1">Slide</span>
                    <div className="text-xl sm:text-2xl font-black">
                      <span className="text-purple-400">{currentSlide + 1}</span>
                      <span className="text-white/20 mx-2">/</span>
                      <span>{slides.length}</span>
                    </div>
                  </div>
                  <div className="h-8 w-px bg-white/10" />
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/30 block mb-1">Investment</span>
                    <div className="text-lg sm:text-2xl font-black">{project.time_spent || "—"}</div>
                  </div>
                  {/* Mobile star rating */}
                  <div className="sm:hidden">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/30 block mb-1">Rate</span>
                    <StarRating value={rating} onChange={handleRate} size={14} submitted={hasRated} />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setIsShareOpen(true)}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all"
                  >
                    <Share2 size={20} />
                  </button>
                  <button
                    onClick={toggleFullscreen}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all"
                  >
                    {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                  </button>
                  <Link
                    href={`/projects/${id}`}
                    className="hidden sm:flex items-center gap-3 bg-purple-600 px-6 py-3 rounded-full font-black text-sm hover:bg-purple-500 transition-colors shadow-[0_0_24px_rgba(168,85,247,0.3)]"
                  >
                    <Info size={16} /> Details
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Keyboard Help Modal */}
      <AnimatePresence>
        {showHelp && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowHelp(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[110]"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="fixed inset-0 z-[120] flex items-center justify-center p-6"
            >
              <div className="bg-[#18151f] border border-white/10 rounded-[32px] p-8 max-w-sm w-full shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black">Keyboard Shortcuts</h3>
                  <button onClick={() => setShowHelp(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <X size={18} />
                  </button>
                </div>
                <div className="space-y-3">
                  {[
                    ["→ / Space", "Next Slide"],
                    ["←", "Previous Slide"],
                    ["F", "Toggle Fullscreen"],
                    ["?", "Show this help"],
                    ["Esc", "Close modals"],
                  ].map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between text-sm">
                      <span className="text-white/50">{label}</span>
                      <kbd className="px-3 py-1 bg-white/10 rounded-lg font-mono text-xs font-bold border border-white/10">{key}</kbd>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Share / Download Sheet */}
      <AnimatePresence>
        {isShareOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsShareOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-[#1C1A22] text-white rounded-t-[40px] z-[110] p-8 pb-safe shadow-[0_-20px_60px_rgba(0,0,0,0.5)] border-t border-white/10"
            >
              <div className="max-w-4xl mx-auto">
                <div className="w-14 h-1.5 bg-white/20 rounded-full mx-auto mb-8" />

                <div className="flex items-center gap-3 mb-2">
                  <AlertTriangle className="text-yellow-500 shrink-0" size={20} />
                  <span className="text-yellow-500 font-bold uppercase tracking-widest text-xs">Caution: Archival Copy</span>
                </div>
                <p className="text-white/50 text-sm mb-8 leading-relaxed">
                  These slides are flat images for maximum precision. For editable content, request the archive template.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <button className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-3xl p-6 text-left transition-all group">
                    <h4 className="font-black text-xl mb-2 group-hover:text-purple-400 transition-colors">The Template</h4>
                    <p className="text-white/40 text-xs mb-4">Stripped master format with archive branding, ready for new content.</p>
                    <div className="text-[10px] uppercase tracking-widest bg-purple-500/20 text-purple-300 py-1 px-3 rounded-full inline-block">.PPTX / .DOCX</div>
                  </button>
                  <button className="bg-purple-600 hover:bg-purple-500 border border-purple-500/50 rounded-3xl p-6 text-left transition-all shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-12 -mt-12 group-hover:scale-150 transition-transform" />
                    <h4 className="font-black text-xl mb-2 relative z-10">Image Pack</h4>
                    <p className="text-white/80 text-xs mb-4 relative z-10">Compressed .zip of all slide images for offline playback.</p>
                    <div className="text-[10px] uppercase tracking-widest bg-white/20 text-white py-1 px-3 rounded-full inline-block relative z-10">.ZIP Archive</div>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
