"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, BookOpen, Layers, Zap } from "lucide-react";
import Link from "next/link";
import { getPublicUrl } from "@/lib/supabase";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setProjects(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalSlides = projects.reduce((acc, p) => acc + (p.slide_count || 0), 0);
  const subjects = Array.from(new Set(projects.map((p) => p.subject || "General")));

  const stats = [
    { value: projects.length, label: "Active Records", color: "var(--primary)", icon: <Layers size={20} /> },
    { value: totalSlides, label: "Preserved Slides", color: "var(--accent)", icon: <BookOpen size={20} /> },
    { value: subjects.length, label: "Subject Areas", color: "var(--success)", icon: <Zap size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] overflow-x-hidden pb-32 transition-colors duration-300">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-5 sm:px-8 lg:px-12 py-4 glass border-b border-[var(--border)]">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-[var(--primary)] text-white flex items-center justify-center shadow-lg transform rotate-12 shrink-0">
            <span className="font-black text-base leading-none">V</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-black tracking-tighter leading-none text-[var(--fg)]">VoidArchive</h1>
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--fg-muted)]">Sincere Bhattarai</span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/archive"
            className="text-[11px] font-black uppercase tracking-widest text-[var(--primary)] bg-[var(--primary-muted)] px-5 py-2.5 rounded-full hover:bg-[var(--primary)] hover:text-white transition-all duration-200 shadow-sm"
          >
            Enter Vault
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative w-full pt-44 pb-24 px-5 sm:px-10 flex flex-col items-center text-center overflow-hidden">
        {/* BG orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-[var(--primary)] opacity-5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[var(--accent)] opacity-5 rounded-full blur-[100px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-5xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 mb-8 bg-[var(--primary-muted)] px-5 py-2 rounded-full border border-[var(--border)]">
            <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--primary)]">Archive Online</span>
          </div>

          <h2 className="text-6xl sm:text-8xl lg:text-[9rem] font-black mb-8 leading-[0.85] tracking-tighter text-[var(--fg)]">
            Digital{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] via-purple-500 to-[var(--accent)] animate-gradient-x">
              Archive
            </span>
          </h2>

          <p className="text-lg sm:text-xl text-[var(--fg-muted)] font-medium leading-relaxed mb-10 max-w-2xl mx-auto">
            The official view-only legacy of Sincere Bhattarai. A refined collection of academic labor, 
            extracted with high-fidelity precision.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/archive"
              className="group flex items-center gap-3 bg-[var(--fg)] text-[var(--bg)] px-8 py-4 rounded-[24px] font-black uppercase tracking-widest text-xs shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-200"
            >
              Explore The Collection
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/archive"
              className="flex items-center gap-3 bg-[var(--primary-muted)] text-[var(--primary)] border border-[var(--border)] px-8 py-4 rounded-[24px] font-black uppercase tracking-widest text-xs hover:bg-[var(--primary)] hover:text-white transition-all duration-200"
            >
              <BookOpen size={16} />
              Browse All
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      {mounted && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className="max-w-5xl mx-auto px-5 sm:px-8 grid grid-cols-1 sm:grid-cols-3 gap-5 mb-20">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="surface-card rounded-[32px] p-8 text-center hover:scale-105 transition-transform duration-200"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl mx-auto mb-4" style={{ background: `${s.color}15`, color: s.color }}>
                  {s.icon}
                </div>
                <div className="text-5xl font-black mb-2" style={{ color: s.color }}>
                  {s.value}
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-[var(--fg-muted)]">
                  {s.label}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Scrolling Ribbon */}
          {projects.length > 0 && (
            <div className="w-full overflow-hidden relative py-8 bg-[var(--surface-2)]">
              <motion.div
                animate={{ x: ["0%", "-50%"] }}
                transition={{ duration: 60, ease: "linear", repeat: Infinity }}
                className="flex gap-6 px-4 w-fit"
              >
                {projects.concat(projects).map((proj, idx) => (
                  <Link
                    key={idx}
                    href={`/projects/${proj.id}`}
                    className="w-[260px] aspect-video rounded-[24px] overflow-hidden shrink-0 shadow-lg border-2 border-[var(--border)] hover:scale-105 transition-transform duration-300 group relative"
                  >
                    {proj.thumbnail ? (
                      <img
                        src={getPublicUrl(proj.id, proj.thumbnail)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        alt={proj.title}
                        loading="lazy"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                      />
                    ) : (
                      <div className="w-full h-full bg-[var(--surface)] flex items-center justify-center">
                        <BookOpen size={32} className="text-[var(--fg-subtle)]" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <span className="text-white text-xs font-black line-clamp-1">{proj.title}</span>
                    </div>
                  </Link>
                ))}
              </motion.div>
            </div>
          )}
        </motion.div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="max-w-5xl mx-auto px-5 sm:px-8 grid grid-cols-1 sm:grid-cols-3 gap-5 mb-20">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton rounded-[32px] h-40" />
          ))}
        </div>
      )}
    </div>
  );
}
