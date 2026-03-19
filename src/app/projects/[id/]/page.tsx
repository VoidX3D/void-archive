"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Download, Eye, Clock, 
  Calendar, FileText, Share2, Star, 
  ChevronRight, ExternalLink, Info, CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getPublicUrl } from "@/lib/supabase";

export default function ProjectDescription() {
  const { id } = useParams();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF7FF] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#6750A4]/20 border-t-[#6750A4] rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#FDF7FF] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-black mb-4">Archive Entry Not Found</h1>
        <Link href="/" className="text-[#6750A4] font-bold flex items-center gap-2">
          <ArrowLeft size={20} /> Return to Vault
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF7FF] text-[#1D1B20] selection:bg-[#6750A4]/20 selection:text-[#6750A4]">
      
      {/* 1. Dynamic Header */}
      <header className="fixed top-0 left-0 right-0 z-[100] bg-white/70 backdrop-blur-xl border-b border-[#1D1B20]/5 px-6 lg:px-12 py-4">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-3 text-sm font-black uppercase tracking-widest opacity-60 hover:opacity-100 transition-all">
            <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center group-hover:bg-[#6750A4] group-hover:text-white transition-all">
              <ArrowLeft size={18} />
            </div>
            Back to Archive
          </Link>
          <div className="flex gap-4">
             <button className="p-3 rounded-full hover:bg-black/5 transition-all text-black/40 hover:text-[#6750A4]">
                <Share2 size={20} />
             </button>
             <button className="p-3 rounded-full hover:bg-black/5 transition-all text-black/40 hover:text-yellow-500">
                <Star size={20} />
             </button>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-40 px-6 lg:px-12 max-w-[1400px] mx-auto">
        
        {/* 2. Hero Section: Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 mb-20">
          
          {/* Left: Preview & Visuals */}
          <div className="lg:col-span-7 space-y-8">
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="relative aspect-video rounded-[40px] overflow-hidden shadow-2xl shadow-purple-900/10 border border-black/5 group"
            >
               <img 
                 src={getPublicUrl(project.id, project.thumbnail || "slide_0.webp")} 
                 className="w-full h-full object-cover" 
                 alt="Main Preview" 
               />
               <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all flex items-center justify-center">
                  <Link 
                    href={`/projects/${id}/view`}
                    className="flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-black uppercase tracking-widest text-sm shadow-2xl hover:scale-110 transition-transform active:scale-95"
                  >
                     <Eye size={20} />
                     Enter Exhibition
                  </Link>
               </div>
            </motion.div>

            {/* Micro Gallery */}
            <div className="grid grid-cols-4 gap-4">
               {(project.slides || []).slice(0, 4).map((slide, i) => (
                  <div key={i} className="aspect-video rounded-2xl overflow-hidden border border-black/5 opacity-60 hover:opacity-100 transition-all cursor-pointer">
                     <img src={getPublicUrl(project.id, slide)} className="w-full h-full object-cover" alt="Slide preview" />
                  </div>
               ))}
            </div>
          </div>

          {/* Right: Metadata & Stats */}
          <div className="lg:col-span-5 flex flex-col justify-center">
             <div className="inline-flex items-center gap-2 text-[#6750A4] font-black uppercase tracking-[0.3em] text-[10px] mb-4 bg-[#6750A4]/5 px-4 py-2 rounded-full w-fit">
                <CheckCircle2 size={12} />
                Archival Verified
             </div>
             
             <h1 className="text-5xl sm:text-6xl font-black tracking-tight mb-6 leading-tight text-[#1D1B20]">
                {project.title.replace(/\.[^/.]+$/, "").replace(/_/g, " ")}
             </h1>

             <p className="text-lg text-[#1D1B20]/60 leading-relaxed mb-10 font-medium">
                A meticulously preserved digital archive of Sincere Bhattarai&apos;s masterpiece. 
                This presentation covers the intricacies of <b>{project.subject || "The Subject"}</b> with academic precision and visual excellence.
             </p>

             <div className="grid grid-cols-2 gap-6 mb-12">
                <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm">
                   <div className="text-black/30 mb-2"><FileText size={20} /></div>
                   <div className="text-2xl font-black">{project.slide_count}</div>
                   <div className="text-[10px] font-bold uppercase tracking-widest opacity-40">Slides</div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm">
                   <div className="text-black/30 mb-2"><Clock size={20} /></div>
                   <div className="text-2xl font-black">{project.slide_count ? Math.round(project.slide_count * 0.25 + 2) : 2}h</div>
                   <div className="text-[10px] font-bold uppercase tracking-widest opacity-40">Est. Labor</div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm">
                   <div className="text-black/30 mb-2"><Calendar size={20} /></div>
                   <div className="text-xl font-black whitespace-nowrap overflow-hidden text-ellipsis">
                      {new Date(project.creation_date).toLocaleDateString()}
                   </div>
                   <div className="text-[10px] font-bold uppercase tracking-widest opacity-40">Captured</div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm">
                   <div className="text-black/30 mb-2"><Info size={20} /></div>
                   <div className="text-xl font-black uppercase tracking-tight">{project.subject || "General"}</div>
                   <div className="text-[10px] font-bold uppercase tracking-widest opacity-40">Category</div>
                </div>
             </div>

             <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href={`/projects/${id}/view`}
                  className="flex-1 flex items-center justify-center gap-3 bg-[#6750A4] text-white px-8 py-5 rounded-3xl font-black uppercase tracking-widest text-sm shadow-xl shadow-[#6750A4]/20 hover:scale-105 transition-all"
                >
                   <Maximize2 size={18} />
                   View Exhibition
                </Link>
                <button className="flex-1 flex items-center justify-center gap-3 bg-white border border-black/5 text-black px-8 py-5 rounded-3xl font-black uppercase tracking-widest text-sm hover:bg-black/5 transition-all">
                   <Download size={18} />
                   Download Assets
                </button>
             </div>
          </div>
        </div>

        {/* 3. Deep Features Section */}
        <section className="bg-white rounded-[60px] p-12 lg:p-20 shadow-xl shadow-black/5 border border-black/5">
           <div className="max-w-4xl mx-auto text-center mb-16">
              <h2 className="text-4xl font-black mb-6">Archive Composition</h2>
              <div className="w-20 h-1.5 bg-[#6750A4] rounded-full mx-auto" />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="space-y-4">
                 <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
                    <Star size={28} />
                 </div>
                 <h4 className="text-xl font-black">Primacy Score</h4>
                 <p className="text-sm text-black/50 leading-relaxed font-medium">
                    This archive ranks in the top percentile of visual consistency, utilizing the legendary Sincere Bhattarai signature color palette.
                 </p>
              </div>
              <div className="space-y-4">
                 <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <ExternalLink size={28} />
                 </div>
                 <h4 className="text-xl font-black">Meta-Linking</h4>
                 <p className="text-sm text-black/50 leading-relaxed font-medium">
                    Fully cataloged and indexed within the VoidArchive global registry, including cross-referenced subject tags and labor-metrics.
                 </p>
              </div>
              <div className="space-y-4">
                 <div className="w-14 h-14 rounded-2xl bg-purple-100 text-[#6750A4] flex items-center justify-center">
                    <Info size={28} />
                 </div>
                 <h4 className="text-xl font-black">Authenticity</h4>
                 <p className="text-sm text-black/50 leading-relaxed font-medium">
                    Generated via the Observer Python legacy pipeline. All slides carry the 2% Ghost Watermark as Proof of Archival.
                 </p>
              </div>
           </div>
        </section>

      </main>
    </div>
  );
}

function Maximize2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 3H5a2 2 0 0 0-2 2v3" />
      <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
      <path d="M3 16v3a2 2 0 0 0 2 2h3" />
      <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}
