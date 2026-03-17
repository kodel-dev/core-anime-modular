'use client';

import React, { useEffect } from 'react';

interface AnimeDetailProps {
  anime: any;
  onClose: () => void;
}

export default function AnimeDetail({ anime, onClose }: AnimeDetailProps) {
  // Mencegah scroll pada body saat detail terbuka
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 z-[150] flex items-center justify-center bg-[#060910]/95 backdrop-blur-2xl animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-[#0c101b] rounded-[2.5rem] border border-white/5 shadow-2xl no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button Mobile Floating */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-[160] bg-white/5 hover:bg-red-500/20 text-white p-3 rounded-full border border-white/10 transition-all active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Cover Image Section */}
          <div className="w-full md:w-1/3 p-8">
            <img 
              src={anime.images.jpg.large_image_url} 
              alt={anime.title}
              className="w-full rounded-3xl shadow-2xl border border-white/5"
            />
          </div>

          {/* Info Section */}
          <div className="w-full md:w-2/3 p-8 md:pl-0">
            <div className="space-y-6">
              <div>
                <span className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2 block">Database Entry</span>
                <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white leading-none">
                  {anime.title}
                </h2>
              </div>

              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-1.5 bg-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                  {anime.score} SCORE
                </span>
                <span className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-400">
                  {anime.status}
                </span>
              </div>

              <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6">
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4">Synopsis Archive</p>
                <p className="text-sm text-gray-400 leading-relaxed italic">
                  {anime.synopsis || 'No analytical data available for this entry.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Type</p>
                  <p className="text-xs font-bold text-gray-300">{anime.type}</p>
                </div>
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Episodes</p>
                  <p className="text-xs font-bold text-gray-300">{anime.episodes || '?'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}