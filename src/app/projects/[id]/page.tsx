"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Eye, Clock, Calendar, FileText, CheckCircle2, 
  Video, Play, ChevronLeft, ChevronRight, Download, 
  Share2, ShieldCheck, User, Globe, AlertTriangle, Monitor,
  Package, ExternalLink, Info, Layers
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getPublicUrl } from "@/lib/supabase";
import { ThemeToggle } from "@/components/ThemeToggle";
import { StarRating, StarDisplay } from "@/components/StarRating";
import { getIdentityHash } from "@/lib/fingerprint";

export default function ProjectDescription() {
  const { id } = useParams();
  const router = useRouter();
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
      fetch("/api/projects").then(r => r.json()),
      fetch(`/api/rate?projectId=${id}`).then(r => r.json())
    ]).then(([projects, rateRes]) => {
      const found = projects.find((p: any) => p.id === id);
      if (found) setProject(found);
      if (rateRes?.average !== undefined) setRatingData(rateRes);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleRate = async (val: number) => {
    if (hasRated || ratingLoading) return;
    setRatingLoading(true); setRating(val);
    try {
      const hash = await getIdentityHash();
      const res = await fetch("/api/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: id, rating: val, identityHash: hash, telemetry: { ua: navigator.userAgent } })
      });
      const data = await res.json();
      if (data.success) {
        setHasRated(true);
        if (data.average !== undefined) setRatingData({ average: data.average, count: data.count });
      }
    } catch (e) { console.error(e); } finally { setRatingLoading(false); }
  };

  if (loading) return (
    <div className="h-screen bg-[var(--bg)] flex items-center justify-center">
       <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
    </div>
  );

  if (!project) return (
    <div className="h-screen bg-[var(--bg)] flex flex-col items-center justify-center p-12 text-center">
       <ShieldCheck size={64} className="mb-6 opacity-10" />
       <h1 className="text-4xl font-black mb-4 tracking-tighter">Missing Node Parameter</h1>
       <p className="max-w-xs mx-auto text-sm opacity-40 font-bold uppercase tracking-widest mb-10">The requested legacy entry isn't indexed in the current protocol.</p>
       <Link href="/archive" className="px-8 py-4 bg-[var(--primary)] text-white font-black uppercase tracking-widest text-[10px] rounded-2xl">Return to Root</Link>
    </div>
  );

  const slides = project.slides || [];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] pb-40 transition-colors duration-500">
      
      {/* Detail HUD */}
      <header className="fixed top-0 inset-x-0 z-[100] p-6 sm:p-8 flex items-center justify-between glass border-b border-[var(--border)]">
        <div className="flex items-center gap-6">
           <button onClick={() => router.back()} className="p-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-2xl hover:bg-[var(--primary)] hover:text-white transition-all text-[var(--fg-muted)]">
              <ArrowLeft size={18} />
           </button>
           <div className="hidden lg:block divide-y divide-[var(--border)]">
              <h1 className="text-lg font-black tracking-tighter truncate max-w-[300px]">{project.title}</h1>
              <p className="text-[10px] font-black tracking-[0.4em] uppercase opacity-40">{project.subject} Protocol {id}</p>
           </div>
        </div>

        <div className="flex items-center gap-4">
           {/* Tab Protocol */}
           <div className="flex bg-[var(--surface-2)] p-1 rounded-2xl border border-[var(--border)] backdrop-blur-3xl">
              {(["slides", "video", "info"] as const).map(tab => (
                 <button 
                   key={tab} 
                   onClick={() => setActiveTab(tab)}
                   className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-[var(--primary)] shadow-xl' : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'}`}
                 >
                   {tab}
                 </button>
              ))}
           </div>
           <ThemeToggle />
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto pt-44 px-8 lg:px-12 grid grid-cols-1 xl:grid-cols-12 gap-12">
        
        {/* Exhibition Stage */}
        <div className="xl:col-span-8 space-y-8">
           <AnimatePresence mode="wait">
             {activeTab === 'slides' && (
               <motion.div key="slides" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                  {/* Big Viewport */}
                  <div className="surface-card p-10 lg:p-14 rounded-[48px] border-2 border-[var(--border)] shadow-2xl relative group overflow-hidden">
                     {/* Floating metadata indicator */}
                     <div className="absolute top-10 right-10 z-20 flex flex-col items-end gap-2 opacity-30 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--fg-subtle)]">Archival Integrity Verified</span>
                        <div className="px-4 py-1.5 bg-green-500/10 text-green-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-green-500/20">Checked: Node {activeSlide + 1}</div>
                     </div>

                     <div className="relative aspect-video rounded-[32px] overflow-hidden bg-[var(--surface-3)] border border-[var(--border)] border-4 p-4 shadow-xl">
                        <ZoomWrap currentSlide={activeSlide} project={project} />
                     </div>

                     <div className="mt-12 flex items-center justify-between">
                        <div className="space-y-1">
                           <p className="text-xl font-black tracking-tighter">Slide Description Case</p>
                           <p className="text-xs font-medium text-[var(--fg-muted)]">Authenticated visualization of Sincere's Labour v2.4</p>
                        </div>
                        <div className="flex gap-4 items-center">
                           <div className="flex items-center gap-2 p-1 bg-[var(--surface-2)] rounded-full border border-[var(--border)]">
                              <button onClick={() => setActiveSlide(p => Math.max(0, p - 1))} className="p-3 hover:bg-white rounded-full transition-all text-[var(--fg-muted)] disabled:opacity-20" disabled={activeSlide === 0}><ChevronLeft size={16}/></button>
                              <div className="px-3 text-sm font-black text-[var(--primary)]">{activeSlide + 1} / {slides.length}</div>
                              <button onClick={() => setActiveSlide(p => Math.min(slides.length-1, p + 1))} className="p-3 hover:bg-white rounded-full transition-all text-[var(--fg-muted)] disabled:opacity-20" disabled={activeSlide === slides.length-1}><ChevronRight size={16}/></button>
                           </div>
                           <Link href={`/projects/${id}/view`} className="px-8 py-3.5 bg-[var(--fg)] text-[var(--bg)] rounded-3xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-2xl hover:scale-105 transition-all">
                              <Monitor size={14}/> Enter Museum Mode
                           </Link>
                        </div>
                     </div>
                  </div>

                  {/* Comprehensive Gallery Grid */}
                  <div className="space-y-6">
                     <h3 className="text-xs font-black uppercase tracking-[0.5em] text-[var(--fg-subtle)] ml-6">Preservation Gallery nodes</h3>
                     <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                        {slides.map((s: any, i: number) => (
                           <button 
                             key={i} 
                             onClick={() => setActiveSlide(i)}
                             className={`group relative aspect-video rounded-[32px] overflow-hidden p-1.5 border-4 transition-all duration-500 ${i === activeSlide ? 'border-[var(--primary)] shadow-2xl scale-105' : 'border-[var(--border)] hover:border-[var(--primary)] opacity-40 hover:opacity-100 hover:scale-105'}`}
                           >
                              <img src={getPublicUrl(id as string, s)} className="w-full h-full object-cover rounded-[24px]" alt="Thumb" loading="lazy" />
                              <div className="absolute inset-x-2 bottom-2 py-1 bg-black/60 backdrop-blur-md rounded-xl text-white text-[8px] font-black uppercase tracking-widest text-center opacity-0 group-hover:opacity-100 transition-opacity">Record {i+1}</div>
                           </button>
                        ))}
                     </div>
                  </div>
               </motion.div>
             )}

             {activeTab === 'info' && (
               <motion.div key="info" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="surface-card p-14 rounded-[48px] border-2 border-[var(--border)] shadow-2xl bg-white dark:bg-[#14121B]">
                  <div className="flex items-center gap-4 mb-12">
                     <Info size={28} className="text-[var(--primary)]" />
                     <h2 className="text-4xl font-black tracking-tighter">Archival Integrity Parameters</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-12">
                     {[
                        { label: "Archival Title", val: project.title, icon: <FileText size={16}/> },
                        { label: "Preservation Subject", val: project.subject, icon: <Package size={16}/> },
                        { label: "Creation Genesis", val: new Date(project.creation_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), icon: <Calendar size={16}/> },
                        { label: "Laboured Duration", val: project.time_spent || "Archival calculation pending", icon: <Clock size={16}/> },
                        { label: "Original Originator", val: "Sincere Bhattarai", icon: <User size={16}/> },
                        { label: "Asset Format", val: project.filetype || "ARCHIVE-WEB-NODE", icon: <Layers size={16}/> },
                        { label: "Integrity Verified", val: "YES / v2.4 Protocol", icon: <ShieldCheck size={16}/> },
                        { label: "Public Status", val: "VIEW-ONLY LEGACY", icon: <Globe size={16}/> }
                     ].map((item, i) => (
                        <div key={i} className="flex flex-col gap-2 group">
                           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--fg-subtle)] group-hover:text-[var(--primary)] transition-colors">
                              {item.icon} {item.label}
                           </div>
                           <div className="text-xl font-bold tracking-tight border-b-2 border-transparent group-hover:border-[var(--primary)] transition-all pb-1 w-fit">{item.val}</div>
                        </div>
                     ))}
                  </div>
               </motion.div>
             )}

             {activeTab === 'video' && (
                <motion.div key="video" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="surface-card p-20 rounded-[48px] text-center border-2 border-[var(--border)] flex flex-col items-center">
                   <div className="w-24 h-24 bg-[var(--primary-muted)] rounded-[32px] flex items-center justify-center text-[var(--primary)] mb-10 shadow-2xl">
                      <Video size={40} />
                   </div>
                   <h2 className="text-4xl font-black mb-4 tracking-tighter">Archival Cinematic Reel</h2>
                   <p className="max-w-md mx-auto text-[var(--fg-muted)] font-medium mb-12 opacity-60">The VoidEngine cinematic renderer is currently generating an MP4/WebM summary of this legacy case.</p>
                   {project.teaser && (
                      <div className="relative w-full aspect-video rounded-[40px] overflow-hidden border-8 border-black/10 shadow-2xl shadow-purple-500/10 group">
                         <img src={getPublicUrl(id as string, project.thumbnail || "slide_01.webp")} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-40 blur-lg" alt="Teaser Preview" />
                         <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
                            <button className="w-24 h-24 bg-white text-[var(--primary)] rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform group-hover:rotate-[360deg] duration-700">
                               <Play fill="currentColor" size={32} className="ml-1.5" />
                            </button>
                            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white">Playback Node Synced</span>
                         </div>
                      </div>
                   )}
                </motion.div>
             )}
           </AnimatePresence>
        </div>

        {/* Action Sidebar */}
        <aside className="xl:col-span-4 lg:space-y-10">
           
           {/* Case Identity */}
           <div className="sticky top-44 space-y-10">
              <div className="surface-card p-10 rounded-[48px] border-2 border-[var(--border)] shadow-2xl bg-[var(--surface-1)]">
                 <div className="flex items-center gap-3 mb-8">
                    <div className="px-4 py-2 bg-black text-white text-[10px] font-black tracking-widest uppercase rounded-2xl">RECORD {id}</div>
                    <div className="h-4 w-px bg-[var(--border)]" />
                    <StarDisplay value={ratingData?.average || 0} count={ratingData?.count || 0} size={14} />
                 </div>

                 <h2 className="text-4xl font-black tracking-tighter mb-8 leading-none">{project.title}</h2>
                 
                 {/* Rating Interaction */}
                 <div className="p-8 bg-white dark:bg-black/20 rounded-[32px] border-2 border-[var(--border)] mb-10 shadow-inner">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--fg-subtle)] mb-5 text-center">{hasRated ? "Rating Registered" : "Submit Peer Review"}</p>
                    <div className="flex justify-center">
                       <StarRating value={rating} onChange={handleRate} size={28} submitted={hasRated} />
                    </div>
                    {hasRated && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-4 text-[10px] font-black text-green-500">✓ IDENTITY AUTHENTICATED</motion.div>}
                 </div>

                 {/* Action Node Bundle */}
                 <div className="space-y-4">
                    <Link href={`/projects/${id}/view`} className="flex items-center justify-center gap-3 w-full py-5 bg-[var(--primary)] text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl hover:scale-105 transition-all">
                       <Monitor size={18}/> Initial Exhibition
                    </Link>
                    <button className="flex items-center justify-center gap-3 w-full py-5 bg-[var(--surface-3)] border-2 border-[var(--border)] rounded-[24px] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-[var(--fg)] hover:text-[var(--bg)] transition-all">
                       <Download size={18}/> Archive Download (v2.4)
                    </button>
                    <button onClick={() => {}} className="flex items-center justify-center gap-3 w-full py-4 text-[var(--fg-subtle)] hover:text-[var(--fg)] font-black uppercase tracking-widest text-[9px] transition-colors">
                       <Share2 size={14}/> Distribute Reference
                    </button>
                 </div>
              </div>

              {/* Legacy Request Card */}
              <div className="p-10 bg-[var(--fg)] text-[var(--bg)] rounded-[48px] shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8 opacity-20"><Package size={48} /></div>
                 <h3 className="text-2xl font-black mb-4 tracking-tighter relative z-10">The Source Bundle</h3>
                 <p className="text-sm font-medium opacity-50 mb-10 leading-relaxed relative z-10">Request the original master file (PPTX/DOCX) for academic reference or reconstruction.</p>
                 <button className="flex items-center gap-3 px-8 py-4 bg-[var(--bg)] text-[var(--fg)] rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-xl group-hover:bg-[var(--primary)] group-hover:text-white">
                    Request File Node <ExternalLink size={14} />
                 </button>
              </div>

              {/* Disclaimer */}
              <div className="flex items-start gap-4 p-6 bg-yellow-500/5 rounded-[32px] border border-yellow-500/10 opacity-60">
                 <AlertTriangle size={32} className="text-yellow-600 shrink-0" />
                 <p className="text-[10px] font-medium leading-relaxed italic">The images presented are archival summaries. Font renders may vary based on preservation protocol v2.4 compatibility.</p>
              </div>

           </div>
        </aside>

      </main>
    </div>
  );
}

function ZoomWrap({ currentSlide, project }: { currentSlide: number, project: any }) {
  const [zoom, setZoom] = useState(false);
  return (
    <div 
      className={`relative w-full h-full cursor-zoom-in transition-transform duration-500 ${zoom ? 'scale-150' : 'scale-100'}`}
      onClick={() => setZoom(!zoom)}
    >
       <AnimatePresence mode="wait">
          <motion.img 
            key={currentSlide}
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0 }}
            src={getPublicUrl(project.id, project.slides[currentSlide])} 
            className="w-full h-full object-contain pointer-events-none" 
            alt="Main Slide"
          />
       </AnimatePresence>
    </div>
  );
}
