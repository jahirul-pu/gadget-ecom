"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search, Zap } from "lucide-react";

export default function NotFound() {
  return (
    <div className="fixed inset-0 bg-white z-[999] flex items-center justify-center p-6 overflow-hidden">
      {/* Background Subtle Gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-blue-400/5 rounded-full blur-[160px] animate-pulse" />
      </div>

      <div className="max-w-6xl w-full flex flex-col items-center relative z-10">
        {/* Large Background 404 Text */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.03 }}
          transition={{ duration: 2 }}
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center pointer-events-none -z-10 select-none"
        >
          <span className="text-[30vw] font-black tracking-tighter text-slate-900 leading-none">404</span>
        </motion.div>

        {/* Textual Narrative Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center space-y-10"
        >
          <div className="space-y-6 flex flex-col items-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl shadow-slate-900/20"
            >
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                Error Context: 404
            </motion.div>
            
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[9rem] font-black text-slate-900 tracking-tighter leading-none whitespace-nowrap drop-shadow-sm px-4">
              Lost in the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Digital Void</span>
            </h1>
            
            <p className="text-slate-500 text-base md:text-xl font-medium max-w-2xl mx-auto leading-relaxed px-6">
              The neural pathway to this page has been disconnected. It might have been derezzed or never existed in this sector.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
            <Link href="/">
              <Button size="lg" className="h-16 lg:h-20 px-12 lg:px-16 rounded-[2.5rem] bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg lg:text-xl shadow-2xl shadow-blue-600/30 group transition-all hover:scale-105 active:scale-95">
                <Home className="w-6 h-6 mr-4 group-hover:scale-110 transition-transform" />
                Teleport Home
              </Button>
            </Link>
            
            <Button 
                variant="outline" 
                size="lg" 
                onClick={() => window.history.back()}
                className="h-16 lg:h-20 px-10 rounded-[2.5rem] border-2 border-slate-100 bg-white hover:border-slate-300 text-slate-900 font-bold text-lg group transition-all active:scale-95"
            >
              <ArrowLeft className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform" />
              Go Back
            </Button>
          </div>

          <div className="pt-16 w-full max-w-lg">
             <div className="flex items-center gap-6 mb-8">
                 <div className="h-px flex-1 bg-slate-100"></div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Alternative Routes</span>
                 <div className="h-px flex-1 bg-slate-100"></div>
             </div>
             <div className="flex flex-wrap justify-center gap-4">
                {['Phones', 'Wearables', 'Audio', 'Hot Deals'].map((tag) => (
                    <Link key={tag} href={`/category/${tag.toLowerCase().replace(' ', '-')}`}>
                        <span className="px-7 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-bold text-slate-500 hover:bg-white hover:border-blue-500 hover:text-blue-600 transition-all cursor-pointer shadow-sm active:scale-95">
                            {tag}
                        </span>
                    </Link>
                ))}
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
