'use client';

import Link from 'next/link';
import { Home, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center relative overflow-hidden p-4">
      {/* Dynamic Background Noise */}
      <div 
        className="fixed inset-0 opacity-[0.03] pointer-events-none mix-blend-screen z-0"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />
      
      {/* Global Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[150px] pointer-events-none -z-10" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md bg-[#0a0a0a]/80 backdrop-blur-[64px] border border-white/10 rounded-3xl p-10 text-center shadow-[0_40px_80px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)]"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-16 bg-red-500/20 rounded-full blur-[40px] pointer-events-none" />
        
        <AlertCircle className="w-16 h-16 text-red-500/80 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
        
        <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20 mb-2 drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">
          404
        </h1>
        
        <h2 className="text-xl font-bold tracking-tight text-white/90 mb-4 uppercase tracking-wide">
          Halaman Tidak Ditemukan
        </h2>
        
        <p className="text-sm font-medium text-white/40 mb-10 leading-relaxed max-w-[280px] mx-auto">
          Maaf, halaman yang Anda cari mungkin telah dihapus, diubah namanya, atau tidak pernah ada.
        </p>

        <Link 
          href="/feed"
          className="group flex items-center justify-center gap-3 w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95"
        >
          <Home className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
          <span className="text-sm font-bold tracking-wider text-white uppercase drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
            Kembali ke Beranda
          </span>
        </Link>
      </motion.div>
    </div>
  );
}
