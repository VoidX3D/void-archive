"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Eye, Clock, Calendar, FileText, CheckCircle2, 
  Video, Play, ChevronLeft, ChevronRight, Download, 
  Share2, ShieldCheck, User, Globe, AlertTriangle, Monitor,
  Package, ExternalLink, Info, ArrowRight
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
       <div className="w-12 h-12 border-4 border-black/10 border-t-black rounded-full animate-spin" />
    </div>
  );

  if (!project) return (
    <div className="h-screen bg-[var(--bg)] flex flex-col items-center justify-center p-12 text-center">
       <ShieldCheck size={64} className="mb-6 opacity-10" />
       <h1 className="text-4xl font-black mb-4 tracking-tighter">PROTOCOL MISSING</h1>
       <p className="max-w-xs mx-auto text-sm opacity-40 font-bold uppercase tracking-widest mb-10">THE ARCHIVE NODE IS NOT INDEXED IN v2.5 SYSTEM CORE.</p>
       <Link href="/archive" className="px-10 py-5 bg-[var(--fg)] text-[var(--bg)] font-black uppercase tracking-widest text-[10px] rounded-full">RE-ENTER ARCHIVE</Link>
    </div>
  );

  const slides = project.slides || [];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] pb-40 transition-colors duration-700">
      
      {/* SHARP HUD PANE */}
      <header className="fixed top-0 inset-x-0 z-[100] px-8 py-6 glass border-b border-[var(--border)] flex items-center justify-between">
        <div className="flex items-center gap-10">
           <button onClick={() => router.back()} className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-full hover:bg-[var(--fg)] hover:text-[var(--bg)] transition-all">
              <ArrowLeft size={24} />
           </button>
           <div className="hidden lg:block">
              <h1 className="text-2xl font-black tracking-tight truncate max-w-[400px] uppercase italic">{project.title}</h1>
              <div className="flex items-center gap-3 text-[10px] font-black tracking-[0.4em] uppercase opacity-30 mt-1">NODE PROTOCOL AREA: {project.subject}</div>
           </div>
        </div>

        <div className="flex items-center gap-8">
           {/* Tab Switcher Protocol */}
           <div className="flex bg-[var(--surface)] p-1 rounded-full border border-[var(--border)] glass">
              {(["slides", "video", "info"] as const).map(tab => (
                 <button 
                   key={tab} 
                   onClick={() => setActiveTab(tab)}
                   className={`px-10 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-[var(--fg)] text-[var(--bg)]' : 'opacity-40 hover:opacity-100'}`}
                 >
                   {tab}
                 </button>
              ))}
           </div>
           <ThemeToggle />
        </div>
      </header>

      <main className="max-w-[1500px] mx-auto pt-44 px-8 grid grid-cols-1 xl:grid-cols-12 gap-16">
        
        {/* EXHIBITION PANEL */}
        <div className="xl:col-span-8 space-y-12">
           <AnimatePresence mode="wait">
             {activeTab === 'slides' && (
               <motion.div key="slides" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-12">
                  
                  {/* MASTER VIEWPORT (GLOSSY) */}
                  <div className="surface-card p-14 lg:p-20 rounded-[48px] border-4 border-[var(--border)] shadow-3xl bg-black/5 relative group overflow-hidden glass transition-all">
                     
                     <div className="absolute top-12 left-12 opacity-10 font-black text-[120px] pointer-events-none select-none italic tracking-tighter mix-blend-difference">CASE {id}</div>

                     <div className="relative aspect-video rounded-[32px] overflow-hidden border-8 border-black shadow-2xl p-4 bg-black">
                        <ZoomWrap currentSlide={activeSlide} project={project} />
                     </div>

                     <div className="mt-16 flex items-center justify-between gap-10">
                        <div className="space-y-2">
                           <p className="text-4xl font-black tracking-tighter uppercase italic">CORE VISUALIZATION</p>
                           <p className="text-xs font-black uppercase tracking-[0.4em] opacity-30 italic">AUTHENTICATED RECONSTRUCTION v2.5</p>
                        </div>
                        
                        <div className="flex gap-6 items-center">
                           <div className="flex items-center gap-2 p-2 bg-black/5 rounded-full border border-[var(--border)] glass">
                              <button onClick={() => setActiveSlide(p => Math.max(0, p - 1))} className="p-4 hover:bg-black hover:text-white rounded-full transition-all disabled:opacity-20" disabled={activeSlide === 0}><ChevronLeft size={24}/></button>
                              <div className="px-10 text-xl font-black text-[var(--fg)]">{activeSlide + 1} / {slides.length}</div>
                              <button onClick={() => setActiveSlide(p => Math.min(slides.length-1, p + 1))} className="p-4 hover:bg-black hover:text-white rounded-full transition-all disabled:opacity-20" disabled={activeSlide === slides.length-1}><ChevronRight size={24}/></button>
                           </div>
                           <Link href={`/projects/${id}/view`} className="px-12 py-5 bg-[var(--fg)] text-[var(--bg)] rounded-full font-black uppercase tracking-widest text-[11px] flex items-center gap-4 shadow-3xl hover:scale-105 transition-all">
                              <Monitor size={20}/> FULL EXHIBITION
                           </Link>
                        </div>
                     </div>

                     {/* GLOSSY REEL (DETAIL VIEW) */}
                     <div className="mt-16 pt-12 border-t border-[var(--border)] overflow-x-auto no-scrollbar flex gap-4 pb-4">
                        {slides.map((s: any, i: number) => (
                          <button key={i} onClick={() => setActiveSlide(i)} className={`relative flex-shrink-0 w-32 aspect-video rounded-xl overflow-hidden border-4 transition-all ${i === activeSlide ? 'border-[var(--fg)] scale-110 shadow-xl' : 'border-[var(--border)] opacity-30 hover:opacity-100 hover:scale-105'}`}>
                            <img src={getPublicUrl(id as string, s)} className="w-full h-full object-cover grayscale opacity-50 hover:grayscale-0 hover:opacity-100" alt="Thumb"/>
                          </button>
                        ))}
                     </div>
                  </div>

                  {/* MINIMALIST INFO MESH */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                     <div className="surface-card p-12 rounded-[40px] border-2 border-[var(--border)] glass flex flex-col justify-center">
                        <div className="text-[10px] font-black uppercase tracking-[0.5em] opacity-30 mb-8 italic">PRESERVATION DATA SUMMARY</div>
                        <div className="space-y-6">
                           {[
                             { icon: <History size={16}/>, label: "Archive Year", val: new Date(project.creation_date).getFullYear() },
                             { icon: <FileText size={16}/>, label: "Total Asset Nodes", val: `${project.slide_count} Slides` },
                             { icon: <Package size={16}/>, label: "Asset Format", val: project.filetype || "DIGITAL CORE" }
                           ].map((item, i) => (
                              <div key={i} className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                                 <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest opacity-40">{item.icon} {item.label}</div>
                                 <div className="text-xl font-black italic">{item.val}</div>
                              </div>
                           ))}
                        </div>
                     </div>
                     <div className="bg-black text-white p-12 rounded-[40px] shadow-3xl relative overflow-hidden flex flex-col justify-center">
                        <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12"><ShieldCheck size={120} /></div>
                        <h3 className="text-3xl font-black tracking-tight mb-4 uppercase italic leading-none">Integrity<br />Verified</h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mb-10">VoidArchive Ecosystem v2.5 Protocol</p>
                        <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest bg-white/10 px-6 py-4 rounded-2xl border border-white/5 shadow-inner">
                           <CheckCircle2 size={20} className="text-green-500"/> AUTHENTICATED ENTRY
                        </div>
                     </div>
                  </div>
               </motion.div>
             )}

             {activeTab === 'info' && (
               <motion.div key="info" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="surface-card p-20 rounded-[48px] border-4 border-[var(--border)] shadow-3xl bg-white dark:bg-black/20 glass">
                  <div className="flex items-center gap-6 mb-16">
                     <div className="w-16 h-16 bg-[var(--surface)] text-[var(--fg)] rounded-3xl flex items-center justify-center border-2 border-[var(--border)]"><Info size={40}/></div>
                     <div>
                        <h2 className="text-5xl font-black tracking-tight uppercase italic">TECHNICAL MESH</h2>
                        <p className="text-[10px] font-black tracking-[0.5em] opacity-30 uppercase mt-1">RECONSTRUCTION PARAMETERS v2.5</p>
                     </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-24 gap-y-16">
                     {[
                        { label: "PROTOCOL_TITLE", val: project.title, icon: <FileText size={16}/> },
                        { label: "GENESIS_DATE", val: new Date(project.creation_date).toLocaleDateString("en-US", { year: "numeric", month: "long" }), icon: <Calendar size={16}/> },
                        { label: "SUBJECT_PROTOCOL", val: project.subject, icon: <Package size={16}/> },
                        { label: "LABOUR_DURATION", val: project.time_spent || "Archival calculation pending", icon: <Clock size={16}/> },
                        { label: "ORIGINATOR_NODE", val: "SINCERE BHATTARAI", icon: <User size={16}/> },
                        { label: "PUBLIC_STATUS", val: "VIEW-ONLY LEGACY", icon: <Globe size={16}/> }
                     ].map((item, i) => (
                        <div key={i} className="flex flex-col gap-3 group">
                           <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.5em] text-[var(--fg-subtle)] group-hover:text-[var(--fg)] transition-colors italic">
                              {item.icon} {item.label}
                           </div>
                           <div className="text-2xl font-black tracking-tight uppercase group-hover:bg-[var(--fg)] group-hover:text-[var(--bg)] transition-all p-2 rounded-xl w-fit">{item.val}</div>
                        </div>
                     ))}
                  </div>
               </motion.div>
             )}

             {/* VIDEO REEL (MINIMAL) */}
             {activeTab === 'video' && (
                <motion.div key="video" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="surface-card p-24 rounded-[48px] text-center border-4 border-[var(--border)] flex flex-col items-center glass shadow-3xl">
                   <div className="w-24 h-24 bg-[var(--fg)] text-[var(--bg)] rounded-[32px] flex items-center justify-center mb-12 shadow-3xl scale-110">
                      <Video size={40} />
                   </div>
                   <h2 className="text-5xl font-black mb-6 tracking-tight uppercase italic leading-none">CINEMATIC PROTOCOL</h2>
                   <p className="max-w-md mx-auto text-xl text-[var(--fg-muted)] font-medium mb-16 opacity-60 italic leading-relaxed">The high-fidelity cinematic renderer is currently reconstructing the MP4 summary for this legacy node.</p>
                   {project.teaser && (
                      <div className="relative w-full aspect-video rounded-[48px] overflow-hidden border-8 border-black shadow-3xl bg-black">
                         <img src={getPublicUrl(id as string, project.thumbnail || "slide_01.webp")} className="w-full h-full object-cover opacity-20 blur-2xl" alt="Teaser Preview" />
                         <div className="absolute inset-0 flex flex-col items-center justify-center gap-8">
                            <button className="w-28 h-28 bg-white text-black rounded-full flex items-center justify-center shadow-3xl hover:scale-110 transition-transform active:scale-95 group">
                               <Play fill="currentColor" size={40} className="ml-2 group-hover:rotate-[360deg] duration-700" />
                            </button>
                            <span className="text-[12px] font-black uppercase tracking-[0.5em] text-white opacity-40">SYNC_PLAYBACK NODE</span>
                         </div>
                      </div>
                   )}
                </motion.div>
             )}
           </AnimatePresence>
        </div>

        {/* SIDEBAR ACTION PROTOCOL */}
        <aside className="xl:col-span-4 lg:space-y-12">
           <div className="sticky top-44 space-y-12">
              <div className="surface-card p-12 rounded-[48px] border-4 border-[var(--border)] shadow-3xl glass bg-[var(--surface)]">
                 <div className="flex items-center gap-6 mb-12">
                    <div className="px-5 py-2 bg-black text-white text-[10px] font-black tracking-widest uppercase rounded-full">PROTO {id}</div>
                    <StarDisplay value={ratingData?.average || 0} count={ratingData?.count || 0} size={16} />
                 </div>

                 <h2 className="text-5xl font-black tracking-tight mb-12 uppercase italic leading-[0.9]">{project.title}</h2>
                 
                 {/* Rating Meshing */}
                 <div className="p-10 bg-black/5 dark:bg-white/5 rounded-[40px] border border-[var(--border)] mb-12 shadow-inner">
                    <p className="text-[11px] font-black uppercase tracking-[0.4em] opacity-30 mb-8 text-center italic">Peer Review protocol</p>
                    <div className="flex justify-center scale-125">
                       <StarRating value={rating} onChange={handleRate} size={28} submitted={hasRated} />
                    </div>
                 </div>

                 {/* Action Node Bundle */}
                 <div className="space-y-6">
                    <Link href={`/projects/${id}/view`} className="flex items-center justify-center gap-6 w-full py-6 bg-[var(--fg)] text-[var(--bg)] rounded-full font-black uppercase tracking-[0.3em] text-[12px] shadow-3xl hover:scale-[1.03] transition-all">
                       <Monitor size={24}/> VIEW EXHIBITION
                    </Link>
                     {project.raw_url ? (
                        <a href={project.raw_url} download className="flex items-center justify-center gap-6 w-full py-6 bg-[var(--bg)] text-[var(--fg)] rounded-full font-black uppercase tracking-[0.3em] text-[12px] hover:bg-black hover:text-white transition-all bg-transparent border-2 border-[var(--fg)] shadow-xl">
                          <Download size={24}/> ACCESS BUNDLE
                        </a>
                     ) : (
                        <button disabled className="flex items-center justify-center gap-6 w-full py-6 bg-[var(--surface)] text-[var(--fg-muted)] rounded-full font-black uppercase tracking-[0.3em] text-[12px] border-2 border-[var(--border)] opacity-50 cursor-not-allowed">
                          <Download size={24}/> BUNDLE OFFLINE
                        </button>
                     )}
                    <button onClick={() => {}} className="flex items-center justify-center gap-4 w-full py-4 text-[10px] font-black uppercase tracking-widest opacity-30 hover:opacity-100 transition-opacity italic">
                       DISTRIBUTE_LINK <ArrowRight size={14}/>
                    </button>
                 </div>
              </div>

              {/* Source Access Protocol */}
              <div className="p-12 bg-[var(--fg)] text-[var(--bg)] rounded-[56px] shadow-3xl relative overflow-hidden glass group">
                 <h3 className="text-3xl font-black mb-6 tracking-tight uppercase italic leading-none relative z-10">THE SOURCE<br />RECORD</h3>
                 <p className="text-sm font-medium opacity-50 mb-12 leading-relaxed relative z-10">THE ORIGINAL BUNDLE (PPTX/DOCX) IS SECURED IN v2.5 MASTER REPOSITORY.</p>
                 <button className="flex items-center gap-4 px-10 py-5 bg-[var(--bg)] text-[var(--fg)] rounded-2xl font-black uppercase tracking-widest text-[11px] hover:scale-105 transition-all shadow-3xl group-hover:bg-[#EEE] group-hover:shadow-white/20">
                    REQUEST ACCESS <ExternalLink size={16} />
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
      className={`relative w-full h-full cursor-zoom-in transition-transform duration-700 ${zoom ? 'scale-150' : 'scale-100'}`}
      onClick={() => setZoom(!zoom)}
    >
       <AnimatePresence mode="wait">
          <motion.img 
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            src={getPublicUrl(project.id, project.slides[currentSlide])} 
            className="w-full h-full object-contain pointer-events-none" 
            alt="Preservation Output"
            style={{ imageRendering: 'auto' }}
          />
       </AnimatePresence>
    </div>
  );
}

function History({ size, className }: { size?: number, className?: string }) {
   return <Clock size={size} className={className} />;
}
