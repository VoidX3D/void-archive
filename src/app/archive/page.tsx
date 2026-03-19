"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ArrowLeft, Filter, Grid, List,
  Clock, FileText, X, SlidersHorizontal, BookOpen,
  ChevronRight, Sparkles
} from "lucide-react";
import Link from "next/link";
import { getPublicUrl } from "@/lib/supabase";
import { ThemeToggle } from "@/components/ThemeToggle";
import { StarDisplay } from "@/components/StarRating";

type SortKey = "newest" | "oldest" | "slides" | "title";

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export default function ArchivePage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [ratings, setRatings] = useState<Record<string, { average: number; count: number }>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [subject, setSubject] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then(async (data) => {
        if (!Array.isArray(data)) return;
        setProjects(data);

        // Fetch ratings for all projects in parallel
        const ratingResults = await Promise.allSettled(
          data.map((p: any) =>
            fetch(`/api/rate?projectId=${encodeURIComponent(p.id)}`).then((r) => r.json())
          )
        );
        const ratingsMap: Record<string, { average: number; count: number }> = {};
        ratingResults.forEach((result, idx) => {
          if (result.status === "fulfilled" && result.value) {
            ratingsMap[data[idx].id] = result.value;
          }
        });
        setRatings(ratingsMap);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const subjects = useMemo(
    () => Array.from(new Set(projects.map((p) => p.subject || "General"))).sort(),
    [projects]
  );

  const filtered = useMemo(() => {
    let list = projects.filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        p.title?.toLowerCase().includes(q) ||
        p.subject?.toLowerCase().includes(q);
      const matchSubject = !subject || p.subject === subject;
      return matchSearch && matchSubject;
    });

    switch (sort) {
      case "newest":
        list = list.sort((a, b) => new Date(b.creation_date || 0).getTime() - new Date(a.creation_date || 0).getTime());
        break;
      case "oldest":
        list = list.sort((a, b) => new Date(a.creation_date || 0).getTime() - new Date(b.creation_date || 0).getTime());
        break;
      case "slides":
        list = list.sort((a, b) => (b.slide_count || 0) - (a.slide_count || 0));
        break;
      case "title":
        list = list.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }
    return list;
  }, [projects, searchQuery, subject, sort]);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setSubject("");
    setSort("newest");
  }, []);

  const hasFilters = searchQuery || subject || sort !== "newest";

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] transition-colors duration-300">

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-[100] glass border-b border-[var(--border)] px-5 sm:px-8 lg:px-12 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Back</span>
            </Link>
            <div className="h-5 w-px bg-[var(--border)]" />
            <h1 className="text-base sm:text-lg font-black tracking-tighter text-[var(--fg)]">
              The Vault
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)]">
              <button
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
                className={`p-2 rounded-xl transition-all ${viewMode === "grid" ? "bg-[var(--surface)] shadow-sm text-[var(--primary)]" : "text-[var(--fg-muted)] hover:text-[var(--fg)]"}`}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                aria-label="List view"
                className={`p-2 rounded-xl transition-all ${viewMode === "list" ? "bg-[var(--surface)] shadow-sm text-[var(--primary)]" : "text-[var(--fg-muted)] hover:text-[var(--fg)]"}`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-40 px-5 sm:px-8 lg:px-12 max-w-[1600px] mx-auto">

        {/* Search & Filter Row */}
        <div className="mb-10 mt-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1 group">
              <Search
                className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--fg-subtle)] group-focus-within:text-[var(--primary)] transition-colors"
                size={18}
              />
              <input
                type="search"
                id="archive-search"
                placeholder="Search documents, subjects…"
                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl py-4 pl-14 pr-12 font-semibold text-sm text-[var(--fg)] placeholder:text-[var(--fg-subtle)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-muted)] transition-all shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-[var(--surface-2)] transition-colors text-[var(--fg-muted)]"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Filter Toggle (mobile) */}
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`flex items-center gap-2 px-5 py-4 rounded-2xl text-sm font-black transition-all border ${
                showFilters || hasFilters
                  ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                  : "bg-[var(--surface)] border-[var(--border)] text-[var(--fg)] hover:border-[var(--primary)]"
              }`}
            >
              <SlidersHorizontal size={16} />
              <span>Filters</span>
              {hasFilters && (
                <span className="w-5 h-5 rounded-full bg-white/30 text-white text-[10px] font-black flex items-center justify-center">
                  {[searchQuery, subject, sort !== "newest" ? sort : ""].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>

          {/* Expandable Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="surface-card rounded-2xl p-5 space-y-5">
                  {/* Subject Pills */}
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--fg-muted)] mb-3">Subject</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSubject("")}
                        className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border ${
                          !subject
                            ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                            : "bg-[var(--surface-2)] border-[var(--border)] text-[var(--fg-muted)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                        }`}
                      >
                        All
                      </button>
                      {subjects.map((s) => (
                        <button
                          key={s}
                          onClick={() => setSubject(subject === s ? "" : s)}
                          className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border ${
                            subject === s
                              ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                              : "bg-[var(--surface-2)] border-[var(--border)] text-[var(--fg-muted)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sort */}
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--fg-muted)] mb-3">Sort By</p>
                    <div className="flex flex-wrap gap-2">
                      {(["newest", "oldest", "slides", "title"] as SortKey[]).map((s) => (
                        <button
                          key={s}
                          onClick={() => setSort(s)}
                          className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border capitalize ${
                            sort === s
                              ? "bg-[var(--fg)] text-[var(--bg)] border-[var(--fg)]"
                              : "bg-[var(--surface-2)] border-[var(--border)] text-[var(--fg-muted)] hover:border-[var(--fg)]"
                          }`}
                        >
                          {s === "slides" ? "Most Slides" : s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {hasFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-[11px] font-black uppercase tracking-widest text-[var(--danger)] hover:underline"
                    >
                      Clear All Filters
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results Count */}
        {!loading && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm font-bold text-[var(--fg-muted)]">
              {filtered.length} {filtered.length === 1 ? "record" : "records"}
              {subject && <span> in <span className="text-[var(--primary)]">{subject}</span></span>}
            </p>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading && (
          <div className={`grid gap-5 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton rounded-[28px]" style={{ height: viewMode === "grid" ? 340 : 100 }} />
            ))}
          </div>
        )}

        {/* Grid/List */}
        {!loading && (
          <motion.div
            layout
            className={`grid gap-5 ${
              viewMode === "grid"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1"
            }`}
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((proj, i) => {
                const rating = ratings[proj.id];
                return (
                  <motion.div
                    key={proj.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.03, duration: 0.25 }}
                  >
                    <Link
                      href={`/projects/${proj.id}`}
                      className={`group relative overflow-hidden transition-all duration-300 block
                        ${viewMode === "grid"
                          ? "surface-card rounded-[28px] p-4 hover:shadow-xl hover:-translate-y-1.5 flex flex-col h-[360px]"
                          : "surface-card rounded-2xl p-5 flex items-center gap-6 hover:bg-[var(--surface-2)]"
                        }`}
                    >
                      {/* Thumbnail */}
                      <div
                        className={`relative overflow-hidden bg-[var(--surface-2)] rounded-[18px] ${
                          viewMode === "grid" ? "aspect-video mb-5" : "w-36 h-20 shrink-0"
                        }`}
                      >
                        {proj.thumbnail ? (
                          <img
                            src={getPublicUrl(proj.id, proj.thumbnail)}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            alt={proj.title}
                            loading="lazy"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).parentElement!.innerHTML =
                                '<div class="w-full h-full flex items-center justify-center text-[var(--fg-subtle)]"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen size={24} className="text-[var(--fg-subtle)]" />
                          </div>
                        )}
                        {/* Dominant color accent */}
                        {proj.dominant_color && (
                          <div
                            className="absolute bottom-0 left-0 right-0 h-1 opacity-60"
                            style={{ background: proj.dominant_color }}
                          />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 flex flex-col min-w-0">
                        <div className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] mb-1.5">
                          {proj.subject || "General"}
                        </div>
                        <h3
                          className={`font-black tracking-tight text-[var(--fg)] mb-3 leading-snug ${
                            viewMode === "grid" ? "text-lg line-clamp-2" : "text-xl line-clamp-1"
                          }`}
                        >
                          {proj.title}
                        </h3>

                        {/* Rating */}
                        {rating?.average > 0 && (
                          <div className="mb-3">
                            <StarDisplay value={rating.average} count={rating.count} />
                          </div>
                        )}

                        <div className="mt-auto flex items-center justify-between border-t border-[var(--border)] pt-3">
                          <div className="flex gap-4">
                            <div className="flex items-center gap-1.5 text-[var(--fg-muted)]">
                              <FileText size={13} />
                              <span className="text-[10px] font-black uppercase tracking-widest">
                                {proj.slide_count || 0} slides
                              </span>
                            </div>
                            {proj.time_spent && (
                              <div className="flex items-center gap-1.5 text-[var(--fg-muted)]">
                                <Clock size={13} />
                                <span className="text-[10px] font-black uppercase tracking-widest">
                                  {proj.time_spent}
                                </span>
                              </div>
                            )}
                          </div>
                          <ChevronRight
                            size={16}
                            className="text-[var(--fg-subtle)] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                          />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-32 text-center"
          >
            <Sparkles size={48} className="mx-auto mb-5 text-[var(--fg-subtle)]" />
            <h2 className="text-2xl font-black uppercase tracking-[0.4em] text-[var(--fg-muted)] mb-3">
              Vault is Empty
            </h2>
            <p className="text-[var(--fg-subtle)] text-sm mb-6">
              {searchQuery ? `No results for "${searchQuery}"` : "No records in this category"}
            </p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-sm font-black uppercase tracking-widest text-[var(--primary)] hover:underline"
              >
                Clear Filters
              </button>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}
