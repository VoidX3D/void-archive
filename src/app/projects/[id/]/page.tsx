"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Download, Eye, Clock, 
  Calendar, FileText, Share2, Star, 
  ChevronRight, ExternalLink, Info, CheckCircle2,
  Video, Play, ThumbsUp, MessageSquare, Plus, Minus
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getPublicUrl } from "@/lib/supabase";

export default function ProjectDescription() {
  const { id } = useParams();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"slides" | "video" | "info">("slides");

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch("/api/projects");
        const data = await res.json();
        const found = data.find((p: any) => p.id === id);
        if (found) setProject(found);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-[#FDF7FF] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-[#6750A4]/20 border-t-[#6750A4] rounded-full animate-spin" />
    </div>
  );

  if (!project) return (
    <div className="min-h-screen bg-[#FDF7FF] flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl font-black mb-4 tracking-tighter">Vault Entry Missing</h1>
      <Link href="/" className="text-[#6750A4] font-black uppercase tracking-widest text-xs flex items-center gap-2">
        <ArrowLeft size={16} /> Re-enter Archives
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDF7FF] text-[#1D1B20] selection:bg-[#6750A4]/20 selection:text-[#6750A4] font-sans">
      
      {/* 1. Static Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-2xl border-b border-black/5 px-6 lg:px-12 py-3">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="p-2.5 rounded-full hover:bg-black/5 transition-all text-black/60">
              <ArrowLeft size={18} />
            </Link>
            <div className="h-6 w-px bg-black/5" />
            <h1 className="font-black text-sm tracking-tight hidden sm:block truncate max-w-[200px]">{project.title}</h1>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="flex bg-black/5 p-1 rounded-full">
                {["slides", "video", "info"].map((tab) => (
                   <button 
                     key={tab}
                     onClick={() => setActiveTab(tab as any)}
                     className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                       activeTab === tab ? "bg-white text-[#6750A4] shadow-sm" : "text-black/40 hover:text-black/60"
                     }`}
                   >
                     {tab}
                   </button>
                ))}
             </div>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-40 px-6 lg:px-12 max-w-[1600px] mx-auto">
        
        {/* 2. Main Stage (Canva/SlidesCarnival Style) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
           
           {/* Left Content Area (Slides / Video) */}
           <div className="xl:col-span-8 space-y-12">
              
              <AnimatePresence mode="wait">
                 {activeTab === "slides" && (
                    <motion.div 
                      key="slides"
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                      className="space-y-12"
                    >
                       {/* Full Feature Presentation Display */}
                       {(project.slides || []).map((slide: string, idx: number) => (
                          <div key={idx} className="bg-white rounded-[40px] p-8 lg:p-12 shadow-xl shadow-black/5 border border-black/5 group">
                             <div className="flex items-center justify-between mb-8">
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#6750A4]">Asset Archival 00{idx + 1}</span>
                                <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <button className="p-2 hover:bg-black/5 rounded-full transition-colors"><Plus size={16} /></button>
                                   <button className="p-2 hover:bg-black/5 rounded-full transition-colors"><Minus size={16} /></button>
                                </div>
                             </div>
                             <div className="relative aspect-video rounded-3xl overflow-hidden border border-black/5 bg-[#F9F9F9] shadow-inner mb-8">
                                <img 
                                  src={getPublicUrl(project.id, slide)} 
                                  className="w-full h-full object-contain" 
                                  alt={`Slide ${idx + 1}`} 
                                />
                             </div>
                             
                             {/* Comment/Caption Section */}
                             <div className="pt-8 border-t border-black/5 flex flex-col sm:flex-row gap-8 items-start">
                                <div className="hidden sm:block w-12 h-12 rounded-2xl bg-[#6750A4]/10 flex items-center justify-center text-[#6750A4] font-black">{idx + 1}</div>
                                <div className="flex-1">
                                   <h4 className="font-black text-xl mb-4 tracking-tight">Slide Execution Context</h4>
                                   <p className="text-[#1D1B20]/50 font-medium leading-relaxed max-w-2xl">
                                      This segment precisely preserves the transition geometry and master font stack 
                                      recorded during the <b>{project.title}</b> archival process. Optimized for high-DPI viewing 
                                      within the VoidOS terminal.
                                   </p>
                                   <div className="flex gap-6 mt-8">
                                      <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#6750A4]"><ThumbsUp size={14}/> Accurate</button>
                                      <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-black/40"><MessageSquare size={14}/> Context</button>
                                   </div>
                                </div>
                             </div>
                          </div>
                       ))}
                    </motion.div>
                 )}

                 {activeTab === "video" && (
                    <motion.div 
                      key="video"
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                      className="bg-white rounded-[60px] p-12 lg:p-20 shadow-xl shadow-black/5 border border-black/5 text-center flex flex-col items-center"
                    >
                       <div className="w-24 h-24 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-10">
                          <Video size={40} />
                       </div>
                       <h2 className="text-4xl font-black mb-6 tracking-tighter leading-none">Canva-Edition Reel Generator</h2>
                       <p className="text-xl text-black/40 max-w-xl mx-auto mb-12 font-medium">
                          Our AI Teaser Pipeline is currently rendering the movement metadata for this project. Check back shortly for the high-res WebM cinematic.
                       </p>
                       {project.teaser && (
                         <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-black shadow-2xl group border-[12px] border-black/5">
                            <img src={getPublicUrl(project.id, project.thumbnail || "slide_0.webp")} className="w-full h-full object-cover opacity-40 blur-sm" alt="Teaser Preview" />
                            <div className="absolute inset-0 flex items-center justify-center">
                               <button className="w-24 h-24 rounded-full bg-white text-[#6750A4] flex items-center justify-center shadow-2xl hover:scale-110 transition-transform active:scale-95">
                                  <Play size={40} fill="currentColor" className="ml-2" />
                               </button>
                            </div>
                         </div>
                       )}
                    </motion.div>
                 )}
              </AnimatePresence>
           </div>

           {/* Right Column: Sticky Metadata & Specs */}
           <div className="xl:col-span-4">
              <div className="sticky top-28 space-y-8">
                 
                 {/* Main Identity Card */}
                 <div className="bg-white rounded-[40px] p-8 lg:p-10 shadow-xl shadow-black/5 border border-black/5">
                    <div className="inline-flex items-center gap-2 text-[#6750A4] font-black uppercase tracking-[0.3em] text-[10px] mb-6 bg-[#6750A4]/5 px-4 py-2 rounded-full w-fit">
                       <CheckCircle2 size={12} />
                       Official Integrity
                    </div>
                    <h2 className="text-3xl font-black mb-6 tracking-tight leading-tight">{project.title.replace(/\.pptx|\.pdf/gi, "")}</h2>
                    
                    <div className="flex items-center gap-4 mb-10 p-4 bg-black/5 rounded-3xl">
                       <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#6750A4]">
                          <Clock size={20} />
                       </div>
                       <div className="flex flex-col">
                          <span className="text-xs font-black uppercase tracking-widest opacity-40">Capture Date</span>
                          <span className="text-sm font-black">{new Date(project.creation_date).toLocaleDateString()}</span>
                       </div>
                    </div>

                    <div className="space-y-4 mb-10">
                       <div className="flex justify-between items-center px-4 py-2 text-sm font-bold opacity-60">
                          <span>Slide Count</span>
                          <span>{project.slide_count}</span>
                       </div>
                       <div className="w-full h-px bg-black/5" />
                       <div className="flex justify-between items-center px-4 py-2 text-sm font-bold opacity-60">
                          <span>Subject</span>
                          <span>{project.subject || "General"}</span>
                       </div>
                       <div className="w-full h-px bg-black/5" />
                       <div className="flex justify-between items-center px-4 py-2 text-sm font-bold opacity-60">
                          <span>Archive ID</span>
                          <span>{id?.toString().slice(0, 8)}...</span>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <Link 
                         href={`/projects/${id}/view`}
                         className="flex items-center justify-center gap-2 bg-[#6750A4] text-white p-5 rounded-[24px] font-black uppercase tracking-widest text-[10px] shadow-lg shadow-[#6750A4]/20 hover:scale-105 transition-all outline-none"
                       >
                          <Eye size={16} /> Exhibition
                       </Link>
                       <button className="flex items-center justify-center gap-2 bg-white border border-black/5 p-5 rounded-[24px] font-black uppercase tracking-widest text-[10px] hover:bg-black/5 transition-all outline-none">
                          <Download size={16} /> Assets
                       </button>
                    </div>
                 </div>

                 {/* Ad / Promo Column (Canva Style) */}
                 <div className="bg-gradient-to-br from-[#1D1B20] to-purple-900 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16" />
                    <h3 className="text-xl font-black mb-4 relative z-10 leading-snug">Need the original raw template?</h3>
                    <p className="text-white/40 text-sm font-medium leading-relaxed mb-8 relative z-10">
                       Request the master XML source through the Sincere Bhattarai private legacy network for unrestricted editing access.
                    </p>
                    <button className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/90 transition-all relative z-10">
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
