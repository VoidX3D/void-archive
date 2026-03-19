"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Eye, Clock, Calendar,
  FileText, CheckCircle2, Video, Play,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getPublicUrl } from "@/lib/supabase";
import { ThemeToggle } from "@/components/ThemeToggle";
import { StarRating, StarDisplay } from "@/components/StarRating";
import { getIdentityHash } from "@/lib/fingerprint";

export default function ProjectDescription() {
  const { id } = useParams();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"slides" | "video" | "info">("slides");
  const [rating, setRating] = useState(0);
  const [ratingData, setRatingData] = useState<{ average: number; count: number } | null>(null);
  const [hasRated, setHasRated] = useState(false);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch("/api/projects").then((r) => r.json()),
      fetch(`/api/rate?projectId=${encodeURIComponent(id as string)}`).then((r) => r.json()),
    ])
      .then(([data, ratingRes]) => {
        if (Array.isArray(data)) {
          const found = data.find((p: any) => p.id === id);
          if (found) setProject(found);
        }
        if (ratingRes?.average !== undefined) setRatingData(ratingRes);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleRate = async (val: number) => {
    if (hasRated || ratingLoading) return;
    setRatingLoading(true);
    setRating(val);
    try {
      const hash = await getIdentityHash();
      const res = await fetch("/api/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: id,
          rating: val,
          identityHash: hash,
          telemetry: {
            ua: navigator.userAgent,
            cores: navigator.hardwareConcurrency,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setHasRated(true);
        if (data.average !== undefined) {
          setRatingData({ average: data.average, count: data.count });
        } else {
          // Re-fetch rating
          const r2 = await fetch(`/api/rate?projectId=${encodeURIComponent(id as string)}`).then((r) => r.json());
          if (r2?.average !== undefined) setRatingData(r2);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRatingLoading(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-[var(--primary-muted)] border-t-[var(--primary)] rounded-full animate-spin" />
      </div>
    );

  if (!project)
    return (
      <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-black mb-4 tracking-tighter text-[var(--fg)]">Vault Entry Missing</h1>
        <Link href="/archive" className="text-[var(--primary)] font-black uppercase tracking-widest text-xs flex items-center gap-2">
          <ArrowLeft size={16} /> Back To Archive
        </Link>
      </div>
    );

  const slides: string[] = project.slides || [];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] transition-colors duration-300">

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-[100] glass border-b border-[var(--border)] px-5 sm:px-8 lg:px-12 py-3">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/archive" className="p-2 rounded-full hover:bg-[var(--surface-2)] transition-colors text-[var(--fg-muted)]">
              <ArrowLeft size={18} />
            </Link>
            <div className="h-5 w-px bg-[var(--border)] hidden sm:block" />
            <h1 className="font-black text-sm tracking-tight hidden sm:block truncate max-w-[180px] lg:max-w-[320px] text-[var(--fg)]">
              {project.title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Tab switcher */}
            <div className="flex bg-[var(--surface-2)] p-1 rounded-full border border-[var(--border)] gap-0.5">
              {(["slides", "video", "info"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeTab === tab
                      ? "bg-[var(--surface)] text-[var(--primary)] shadow-sm"
                      : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="pt-20 pb-40 px-5 sm:px-8 lg:px-12 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 mt-6">

          {/* Left: Slides / Video */}
          <div className="xl:col-span-8">
            <AnimatePresence mode="wait">

              {activeTab === "slides" && (
                <motion.div
                  key="slides"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-5"
                >
                  {slides.length === 0 && (
                    <div className="surface-card rounded-[32px] p-16 text-center">
                      <FileText size={48} className="mx-auto mb-4 text-[var(--fg-subtle)]" />
                      <h3 className="text-xl font-black text-[var(--fg-muted)]">No slides processed yet</h3>
                      <p className="text-sm text-[var(--fg-subtle)] mt-2">Run the processing pipeline on this document.</p>
                    </div>
                  )}

                  {/* Quick navigation strip */}
                  {slides.length > 1 && (
                    <div className="flex items-center gap-3 surface-card rounded-2xl p-3 overflow-x-auto no-scrollbar">
                      {slides.map((slide, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveSlide(idx)}
                          className={`shrink-0 w-16 aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                            activeSlide === idx
                              ? "border-[var(--primary)] scale-105 shadow-md"
                              : "border-[var(--border)] opacity-50 hover:opacity-80"
                          }`}
                        >
                          <img
                            src={getPublicUrl(project.id, slide)}
                            className="w-full h-full object-cover"
                            alt={`Slide ${idx + 1}`}
                            loading="lazy"
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Active slide big view */}
                  {slides.length > 0 && (
                    <div className="surface-card rounded-[32px] p-6 lg:p-10 shadow-lg">
                      <div className="flex items-center justify-between mb-5">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--primary)]">
                          Slide {activeSlide + 1} / {slides.length}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setActiveSlide((p) => Math.max(0, p - 1))}
                            disabled={activeSlide === 0}
                            className="p-2 rounded-full hover:bg-[var(--surface-2)] disabled:opacity-30 transition-all border border-[var(--border)]"
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <button
                            onClick={() => setActiveSlide((p) => Math.min(slides.length - 1, p + 1))}
                            disabled={activeSlide === slides.length - 1}
                            className="p-2 rounded-full hover:bg-[var(--surface-2)] disabled:opacity-30 transition-all border border-[var(--border)]"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>

                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeSlide}
                          initial={{ opacity: 0, scale: 0.97 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                          className="relative aspect-video rounded-2xl overflow-hidden bg-[var(--surface-2)] border border-[var(--border)]"
                        >
                          <img
                            src={getPublicUrl(project.id, slides[activeSlide])}
                            className="w-full h-full object-contain"
                            alt={`Slide ${activeSlide + 1}`}
                          />
                        </motion.div>
                      </AnimatePresence>

                      {/* CTA below slide */}
                      <div className="mt-5 flex items-center justify-between">
                        <p className="text-sm text-[var(--fg-muted)] font-medium">
                          High-fidelity archival — <span className="font-black text-[var(--fg)]">{project.title}</span>
                        </p>
                        <Link
                          href={`/projects/${id}/view`}
                          className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[var(--primary)] hover:text-[var(--primary)] bg-[var(--primary-muted)] px-4 py-2 rounded-xl hover:bg-[var(--primary)] hover:text-white transition-all"
                        >
                          <Eye size={14} />
                          Full View
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* All slides gallery */}
                  {slides.length > 1 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {slides.map((slide, idx) => (
                        <motion.button
                          key={idx}
                          onClick={() => setActiveSlide(idx)}
                          whileHover={{ scale: 1.03 }}
                          className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all ${
                            activeSlide === idx
                              ? "border-[var(--primary)] shadow-lg"
                              : "border-[var(--border)]"
                          }`}
                        >
                          <img
                            src={getPublicUrl(project.id, slide)}
                            className="w-full h-full object-cover"
                            alt={`Slide ${idx + 1}`}
                            loading="lazy"
                          />
                          <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                            {idx + 1}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "video" && (
                <motion.div
                  key="video"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  className="surface-card rounded-[40px] p-12 lg:p-20 text-center flex flex-col items-center"
                >
                  <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-500 flex items-center justify-center mb-8">
                    <Video size={36} />
                  </div>
                  <h2 className="text-3xl font-black mb-4 tracking-tighter text-[var(--fg)]">Video Reel</h2>
                  <p className="text-lg text-[var(--fg-muted)] max-w-lg mx-auto mb-10 font-medium">
                    The cinematic pipeline is rendering this project's teaser reel. Check back shortly.
                  </p>
                  {project.teaser && (
                    <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-black shadow-2xl border-8 border-[var(--border)]">
                      <img src={getPublicUrl(project.id, project.thumbnail || "slide_0.webp")} className="w-full h-full object-cover opacity-40 blur-sm" alt="Teaser" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <button className="w-20 h-20 rounded-full bg-white text-[var(--primary)] flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
                          <Play size={32} fill="currentColor" className="ml-1" />
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "info" && (
                <motion.div
                  key="info"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  className="space-y-5"
                >
                  <div className="surface-card rounded-[32px] p-8 lg:p-10">
                    <h3 className="text-xl font-black mb-6 text-[var(--fg)]">Document Details</h3>
                    <div className="space-y-0 divide-y divide-[var(--border)]">
                      {[
                        { label: "Title", value: project.title },
                        { label: "Subject", value: project.subject || "General" },
                        { label: "Slide Count", value: project.slide_count },
                        { label: "Time Invested", value: project.time_spent || "—" },
                        { label: "Archive ID", value: project.id },
                        { label: "Creation Date", value: project.creation_date ? new Date(project.creation_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—" },
                        { label: "Word Count", value: project.word_count || "—" },
                        { label: "Dominant Color", value: project.dominant_color || "—" },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex items-center justify-between py-3.5 text-sm">
                          <span className="font-bold text-[var(--fg-muted)]">{label}</span>
                          <span className="font-black text-[var(--fg)] text-right max-w-[200px] truncate">
                            {label === "Dominant Color" && project.dominant_color ? (
                              <span className="flex items-center gap-2">
                                <span className="w-4 h-4 rounded-full border border-[var(--border)] inline-block" style={{ background: project.dominant_color }} />
                                {value}
                              </span>
                            ) : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: Sticky sidebar */}
          <div className="xl:col-span-4">
            <div className="sticky top-24 space-y-6">

              {/* Identity Card */}
              <div className="surface-card rounded-[32px] p-8 shadow-lg">
                <div className="inline-flex items-center gap-2 text-[var(--primary)] font-black uppercase tracking-[0.3em] text-[10px] mb-5 bg-[var(--primary-muted)] px-4 py-2 rounded-full">
                  <CheckCircle2 size={12} />
                  Official Integrity
                </div>

                <h2 className="text-2xl font-black mb-5 tracking-tight leading-snug text-[var(--fg)]">
                  {project.title}
                </h2>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="p-3.5 bg-[var(--surface-2)] rounded-2xl text-center border border-[var(--border)]">
                    <div className="flex justify-center mb-1.5 text-[var(--fg-muted)]"><FileText size={16} /></div>
                    <div className="text-xl font-black text-[var(--fg)]">{project.slide_count || 0}</div>
                    <div className="text-[9px] font-black uppercase tracking-widest text-[var(--fg-muted)]">Slides</div>
                  </div>
                  <div className="p-3.5 bg-[var(--surface-2)] rounded-2xl text-center border border-[var(--border)]">
                    <div className="flex justify-center mb-1.5 text-[var(--fg-muted)]"><Calendar size={16} /></div>
                    <div className="text-base font-black text-[var(--fg)] leading-tight">
                      {project.creation_date ? new Date(project.creation_date).toLocaleDateString("en", { month: "short", year: "2-digit" }) : "—"}
                    </div>
                    <div className="text-[9px] font-black uppercase tracking-widest text-[var(--fg-muted)]">Date</div>
                  </div>
                </div>

                {/* Rating Section */}
                <div className="p-5 bg-[var(--surface-2)] rounded-2xl border border-[var(--border)] mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--fg-muted)]">
                      {hasRated ? "Your Rating" : "Rate This Work"}
                    </span>
                    {ratingData && ratingData.count > 0 && (
                      <StarDisplay value={ratingData.average} count={ratingData.count} size={13} />
                    )}
                  </div>
                  <StarRating
                    value={rating}
                    onChange={handleRate}
                    size={22}
                    showLabel
                    submitted={hasRated}
                  />
                  {hasRated && (
                    <motion.p
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[11px] text-[var(--success)] font-bold mt-2"
                    >
                      ✓ Rating submitted. Thank you!
                    </motion.p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href={`/projects/${id}/view`}
                    className="flex items-center justify-center gap-2 bg-[var(--primary)] text-white p-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:scale-105 transition-all"
                  >
                    <Eye size={15} /> Exhibition
                  </Link>
                  <button className="flex items-center justify-center gap-2 bg-[var(--surface-2)] border border-[var(--border)] p-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-[var(--border)] transition-all text-[var(--fg)]">
                    <Clock size={15} /> {project.time_spent || "Unknown"}
                  </button>
                </div>
              </div>

              {/* Promo Card */}
              <div className="bg-gradient-to-br from-[var(--fg)] to-purple-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                <h3 className="text-lg font-black mb-3 relative z-10 leading-snug">
                  Need the original template?
                </h3>
                <p className="text-white/50 text-xs font-medium leading-relaxed mb-6 relative z-10">
                  Request the master source through the Sincere Bhattarai private legacy network.
                </p>
                <button className="w-full py-3.5 bg-white text-black rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-white/90 transition-all relative z-10">
                  Access Legacy
                </button>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
