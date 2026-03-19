"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Clock, Calendar, FileText, CheckCircle2, 
  Video, Play, ChevronLeft, ChevronRight, Download, 
  ShieldCheck, User, Globe, Monitor,
  Package, ExternalLink, Info, ArrowRight
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getPublicUrl } from "@/lib/supabase";
import { ThemeToggle } from "@/components/ThemeToggle";
import { StarRating, StarDisplay } from "@/components/StarRating";
import { getIdentityHash } from "@/lib/fingerprint";

const M3_EMPHASIZED = [0.2, 0, 0, 1] as any;

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
    <div className="h-screen bg-[var(--m3-surface)] flex items-center justify-center">
       <div className="w-12 h-12 border-8 border-[var(--m3-primary)] border-t-white rounded-full animate-spin shadow-2xl" />
    </div>
  );

  if (!project) return (
    <div className="h-screen bg-[var(--m3-surface)] flex flex-col items-center justify-center p-12 text-center">
       <ShieldCheck size={80} className="mb-10 opacity-10" />
       <h1 className="text-6xl font-black mb-6 tracking-tighter italic uppercase">Registry Empty</h1>
       <p className="max-w-md mx-auto text-sm opacity-40 font-black uppercase tracking-[0.4em] mb-12">THE REQUESTED NODE IS NOT INDEXED IN VOID CORE v2.5</p>
       <Link href="/archive" className="m3-button-filled !px-12 !py-6">RE-ENTER ARCHIVE</Link>
    </div>
  );

  const slides = project.slides || [];

  return (
    <div className="min-h-screen bg-[var(--m3-surface)] text-[var(--m3-on-surface)] pb-40 transition-all duration-700">
      
      {/* HUD TOP BAR */}
      <header className="fixed top-0 inset-x-0 z-[100] px-8 py-6 glass border-b border-[var(--m3-surface-variant)] flex items-center justify-between">
        <div className="flex items-center gap-10">
           <button 
             onClick={() => router.back()} 
             className="p-4 bg-[var(--m3-surface-container-high)] border border-[var(--m3-outline)]/10 rounded-full hover:bg-[var(--m3-primary)] hover:text-[var(--m3-on-primary)] transition-all shadow-md"
           >
              <ArrowLeft size={24} />
           </button>
           <div className="hidden lg:block">
              <h1 className="text-2xl font-black tracking-tighter truncate max-w-[400px] uppercase italic leading-none">{project.title}</h1>
              <div className="flex items-center gap-3 text-[9px] font-black tracking-[0.5em] uppercase opacity-40 mt-2">
                Sector Registry: {project.subject} • Integrity Locked <ShieldCheck size={10} className="inline"/>
              </div>
           </div>
        </div>

        <div className="flex items-center gap-8">
           <div className="flex bg-[var(--m3-surface-container-high)] p-1.5 rounded-full border border-[var(--m3-outline)]/10">
              {(["slides", "video", "info"] as const).map(tab => (
                 <button 
                   key={tab} 
                   onClick={() => setActiveTab(tab)}
                   className={`px-10 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.4em] transition-all ${activeTab === tab ? 'bg-[var(--m3-primary)] text-[var(--m3-on-primary)] shadow-lg' : 'opacity-40 hover:opacity-100'}`}
                 >
                   {tab}
                 </button>
              ))}
           </div>
           <ThemeToggle />
        </div>
      </header>

      <main className="max-w-[1500px] mx-auto pt-48 px-8 grid grid-cols-1 xl:grid-cols-12 gap-16">
        
        {/* PRIMARY VIEWPORT AREA */}
        <div className="xl:col-span-8 space-y-16">
           <AnimatePresence mode="wait">
             {activeTab === 'slides' && (
                <motion.div 
                  key="slides" 
                  initial={{ opacity: 0, y: 30 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, scale: 0.95 }} 
                  transition={{ ease: M3_EMPHASIZED }}
                  className="space-y-16"
                >
                   {/* EXHIBITION PANEL (M3 CONTAINER) */}
                   <div className="m3-card !p-0 overflow-hidden shadow-3xl bg-[var(--m3-surface-container-low)] border border-[var(--m3-outline)]/10">
                      <div className="relative aspect-video bg-black/90 p-6 flex items-center justify-center">
                         <div className="absolute inset-0 opacity-5 pointer-events-none select-none flex items-center justify-center text-[15rem] font-black italic tracking-tighter uppercase">
                            CORE
                         </div>
                         <div className="relative w-full h-full rounded-[32px] overflow-hidden shadow-2xl border-4 border-white/5">
                            <ZoomWrap currentSlide={activeSlide} project={project} />
                         </div>
                         
                         {/* NAVIGATION OVERLAYS */}
                         <div className="absolute inset-x-12 bottom-12 flex items-center justify-between pointer-events-none">
                            <div className="pointer-events-auto">
                               <button 
                                 onClick={() => setActiveSlide(p => Math.max(0, p - 1))} 
                                 className="p-6 bg-white/10 hover:bg-white text-white hover:text-black rounded-full backdrop-blur-3xl transition-all shadow-2xl border border-white/10 disabled:opacity-0" 
                                 disabled={activeSlide === 0}
                               >
                                 <ChevronLeft size={32}/>
                               </button>
                            </div>
                            <div className="pointer-events-auto">
                               <button 
                                 onClick={() => setActiveSlide(p => Math.min(slides.length-1, p + 1))} 
                                 className="p-6 bg-white/10 hover:bg-white text-white hover:text-black rounded-full backdrop-blur-3xl transition-all shadow-2xl border border-white/10 disabled:opacity-0" 
                                 disabled={activeSlide === slides.length-1}
                               >
                                 <ChevronRight size={32}/>
                               </button>
                            </div>
                         </div>
                      </div>

                      <div className="p-12 flex flex-col md:flex-row items-center justify-between gap-12 bg-[var(--m3-surface-container-high)]">
                         <div className="space-y-3 text-center md:text-left">
                            <h2 className="text-4xl font-black tracking-tighter uppercase italic leading-none">Visualization Node</h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40">System Index: {activeSlide + 1} OF {slides.length} NODES</p>
                         </div>
                         
                         <div className="flex gap-6 items-center">
                            <Link href={`/projects/${id}/view`} className="m3-button-filled !px-12 !py-6 shadow-2xl hover:scale-105 transition-all">
                               <Monitor size={20}/> OPEN FULL ACCESS
                            </Link>
                         </div>
                      </div>

                      {/* FILMSTRIP REEL */}
                      <div className="px-12 py-10 border-t border-[var(--m3-outline)]/10 overflow-x-auto no-scrollbar flex gap-4">
                         {slides.map((s: any, i: number) => (
                           <button 
                             key={i} 
                             onClick={() => setActiveSlide(i)} 
                             className={`relative flex-shrink-0 w-40 aspect-video rounded-2xl overflow-hidden border-4 transition-all duration-500 ${i === activeSlide ? 'border-[var(--m3-primary)] scale-105 shadow-2xl' : 'border-transparent opacity-30 hover:opacity-100'}`}
                           >
                             <img src={getPublicUrl(id as string, s)} className="w-full h-full object-cover" alt={`Node ${i}`}/>
                           </button>
                         ))}
                      </div>
                   </div>

                   {/* TECHNICAL DATA CARDS */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="m3-card flex flex-col justify-center bg-[var(--m3-secondary-container)] text-[var(--m3-on-secondary-container)] border-none">
                         <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40 mb-10 italic">Preservation Metadata</p>
                         <div className="space-y-8">
                            {[
                              { icon: <Clock size={20}/>, label: "Registry Year", val: new Date(project.creation_date).getFullYear() },
                              { icon: <FileText size={20}/>, label: "Sub-Nodes", val: `${project.slide_count} Items` },
                              { icon: <Package size={20}/>, label: "Registry Format", val: project.filetype || "Binary" }
                            ].map((item, i) => (
                               <div key={i} className="flex items-center justify-between border-b border-[var(--m3-on-secondary-container)]/10 pb-6">
                                  <div className="flex items-center gap-4 text-xs font-black uppercase tracking-[0.1em] opacity-60">{item.icon} {item.label}</div>
                                  <div className="text-2xl font-black italic tracking-tighter">{item.val}</div>
                               </div>
                            ))}
                         </div>
                      </div>
                      <div className="bg-[var(--m3-surface-container-highest)] text-[var(--m3-on-surface)] p-12 rounded-[56px] shadow-2xl relative overflow-hidden flex flex-col justify-center border border-[var(--m3-outline)]/10">
                         <ShieldCheck className="absolute -top-10 -right-10 w-40 h-40 opacity-5 -rotate-12" />
                         <h3 className="text-3xl font-black tracking-tight mb-4 uppercase italic italic leading-none">Security<br />Seal</h3>
                         <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mb-10">VoidArchive Ecosystem Protocol Alpha</p>
                         <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest bg-[var(--m3-primary)] text-[var(--m3-on-primary)] px-8 py-5 rounded-3xl shadow-xl w-fit">
                            <CheckCircle2 size={24}/> VALIDATED ACCESS
                         </div>
                      </div>
                   </div>
                </motion.div>
             )}

             {activeTab === 'info' && (
                <motion.div 
                  key="info" 
                  initial={{ opacity: 0, y: 30 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="m3-card !p-20 bg-[var(--m3-surface-container-low)]"
                >
                   <div className="flex items-center gap-8 mb-20">
                      <div className="w-20 h-20 bg-[var(--m3-primary)] text-[var(--m3-on-primary)] rounded-[32px] flex items-center justify-center shadow-2xl"><Info size={40}/></div>
                      <div>
                         <h2 className="text-5xl font-black tracking-tight uppercase italic leading-none">Technical Spec</h2>
                         <p className="text-xs font-black tracking-[0.5em] opacity-40 uppercase mt-4">Node Reconstruction Parameters</p>
                      </div>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-x-24 gap-y-16">
                      {[
                         { label: "PROTOCOL_TITLE", val: project.title, icon: <FileText size={20}/> },
                         { label: "GENESIS_DATE", val: new Date(project.creation_date).toLocaleDateString("en-US", { year: "numeric", month: "long" }), icon: <Calendar size={20}/> },
                         { label: "SUBJECT_AREA", val: project.subject, icon: <Package size={20}/> },
                         { label: "WORKLOAD_LOG", val: project.time_spent || "N/A", icon: <Clock size={20}/> },
                         { label: "ORIGIN_NODE", val: "SINCERE BHATTARAI", icon: <User size={20}/> },
                         { label: "REGISTRY_TYPE", val: "LEGACY ARCHIVE", icon: <Globe size={20}/> }
                      ].map((item, i) => (
                         <div key={i} className="flex flex-col gap-4 group">
                            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] opacity-40 group-hover:text-[var(--m3-primary)] group-hover:opacity-100 transition-all italic">
                               {item.icon} {item.label}
                            </div>
                            <div className="text-2xl font-black border-l-4 border-transparent group-hover:border-[var(--m3-primary)] pl-6 transition-all">{item.val}</div>
                         </div>
                      ))}
                   </div>
                </motion.div>
             )}

             {activeTab === 'video' && (
                <motion.div 
                  key="video" 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  className="m3-card !p-24 text-center flex flex-col items-center bg-[var(--m3-surface-container-lowest)] border-2 border-[var(--m3-primary)]"
                >
                   <div className="w-24 h-24 bg-[var(--m3-primary)] text-[var(--m3-on-primary)] rounded-[32px] flex items-center justify-center mb-12 shadow-3xl animate-bounce-slow">
                      <Video size={48} />
                   </div>
                   <h2 className="text-6xl font-black mb-8 tracking-tighter uppercase italic leading-none">Cinematic Stream</h2>
                   <p className="max-w-md mx-auto text-xl text-[var(--m3-on-surface-variant)] font-medium mb-16 italic opacity-60 leading-relaxed">The cinematic rendering engine is constructing the high-fidelity MP4 summary for this legacy node.</p>
                   {project.teaser && (
                      <div className="relative w-full aspect-video rounded-[32px] overflow-hidden border-8 border-black shadow-3xl bg-black group cursor-pointer">
                         <img src={getPublicUrl(id as string, project.thumbnail || "slide_01.webp")} className="w-full h-full object-cover opacity-30 blur-2xl group-hover:blur-sm transition-all duration-1000" alt="Teaser" />
                         <div className="absolute inset-0 flex flex-col items-center justify-center gap-8">
                            <button className="w-32 h-32 bg-[var(--m3-primary)] text-[var(--m3-on-primary)] rounded-full flex items-center justify-center shadow-3xl hover:scale-110 transition-all active:scale-90 group">
                               <Play fill="currentColor" size={48} className="ml-2" />
                            </button>
                            <span className="text-[12px] font-black uppercase tracking-[1em] opacity-40 animate-pulse">Establishing Signal...</span>
                         </div>
                      </div>
                   )}
                </motion.div>
             )}
           </AnimatePresence>
        </div>

        {/* SIDEBAR SIDE PANEL */}
        <aside className="xl:col-span-4 space-y-12">
           <div className="sticky top-48 space-y-12">
              <div className="m3-card p-12 bg-[var(--m3-surface-container-high)] shadow-2xl border-2 border-[var(--m3-outline)]/20">
                 <div className="flex items-center gap-6 mb-12">
                    <div className="px-5 py-2 bg-[var(--m3-primary)] text-[var(--m3-on-primary)] text-[10px] font-black tracking-widest uppercase rounded-full shadow-lg">NODE_{id}</div>
                    <StarDisplay value={ratingData?.average || 0} count={ratingData?.count || 0} size={18} />
                 </div>

                 <h2 className="text-5xl font-black tracking-tighter mb-12 uppercase italic leading-none">{project.title}</h2>
                 
                 {/* Rating Interaction */}
                 <div className="p-10 bg-[var(--m3-surface-container-low)] rounded-[40px] border border-[var(--m3-outline)]/10 mb-12 shadow-inner">
                    <p className="text-[11px] font-black uppercase tracking-[0.5em] opacity-40 mb-10 text-center italic">Node Peer Evaluation</p>
                    <div className="flex justify-center scale-150 py-4">
                       <StarRating value={rating} onChange={handleRate} size={28} submitted={hasRated} />
                    </div>
                 </div>

                 {/* Action Stack */}
                 <div className="space-y-6">
                    <Link href={`/projects/${id}/view`} className="m3-button-filled w-full !py-8 bg-[var(--m3-primary)] !rounded-[32px] shadow-3xl hover:scale-[1.02] active:scale-95 transition-all text-sm tracking-[0.4em] justify-center">
                       <Monitor size={24}/> START EXHIBITION
                    </Link>
                     {project.raw_url ? (
                        <a href={project.raw_url} download className="flex items-center justify-center gap-6 w-full py-8 text-[var(--m3-primary)] font-black uppercase tracking-[0.4em] text-xs hover:bg-[var(--m3-primary)] hover:text-[var(--m3-on-primary)] transition-all bg-transparent border-4 border-[var(--m3-primary)] rounded-[32px] shadow-xl">
                          <Download size={24}/> DOWNLOAD NODE
                        </a>
                     ) : (
                        <button disabled className="flex items-center justify-center gap-6 w-full py-8 bg-[var(--m3-surface-container-highest)] text-[var(--m3-on-surface-variant)] rounded-[32px] font-black uppercase tracking-[0.4em] text-xs opacity-40 cursor-not-allowed">
                          <Download size={24}/> BUNDLE OFFLINE
                        </button>
                     )}
                    <button className="flex items-center justify-center gap-4 w-full py-4 text-[10px] font-black uppercase tracking-widest opacity-30 hover:opacity-100 transition-all italic">
                       SHARE_REGISTRY_LINK <ArrowRight size={16}/>
                    </button>
                 </div>
              </div>

              {/* M3 PRIMARY RECTANGLE */}
              <div className="p-12 bg-[var(--m3-tertiary-container)] text-[var(--m3-on-tertiary-container)] rounded-[64px] shadow-3xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 group-hover:rotate-45 transition-transform duration-1000"><ShieldCheck size={140} /></div>
                 <h3 className="text-4xl font-black mb-6 tracking-tighter uppercase italic leading-none relative z-10">THE ORIGINAL<br />RECORD</h3>
                 <p className="text-base font-bold opacity-60 mb-12 leading-relaxed relative z-10">The master record (PPTX/PDF) is preserved in the secure v2.5 cloud repository.</p>
                 <button className="m3-button-filled !bg-[var(--m3-tertiary)] !text-[var(--m3-on-tertiary)] !px-10 !py-6 !rounded-2xl hover:scale-105 transition-all shadow-2xl relative z-10 uppercase tracking-widest text-xs font-black">
                    REQUEST ARCHIVE <ExternalLink size={20} className="ml-2"/>
                 </button>
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
      className={`relative w-full h-full cursor-zoom-in transition-all duration-1000 ease-in-out ${zoom ? 'scale-150' : 'scale-100'}`}
      onClick={() => setZoom(!zoom)}
    >
       <AnimatePresence mode="wait">
          <motion.img 
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: M3_EMPHASIZED }}
            src={getPublicUrl(project.id, project.slides[currentSlide])} 
            className="w-full h-full object-contain pointer-events-none" 
            alt="Registry Asset"
            style={{ imageRendering: 'auto' }}
          />
       </AnimatePresence>
    </div>
  );
}
