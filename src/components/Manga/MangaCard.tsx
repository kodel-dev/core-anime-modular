'use client';

import React, { useState, useEffect } from 'react';

interface MangaCardProps {
  manga: any;
}

export default function MangaCard({ manga }: MangaCardProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const attributes = manga.attributes;

  useEffect(() => {
    if (isPreviewOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isPreviewOpen]);

  const handleReadOnKitsu = () => {
    window.open(`https://kitsu.io/manga/${manga.id}`, '_blank');
  };

  return (
    <>
      {/* Thumbnail Card - Animasi dipangkas agar ringan */}
      <div 
        onClick={() => setIsPreviewOpen(true)}
        className="group relative overflow-hidden rounded-2xl bg-gray-900 border border-white/5 transition-colors hover:border-blue-500/50 shadow-xl cursor-pointer"
      >
        <div className="aspect-[3/4] overflow-hidden relative">
          <img 
            src={attributes?.posterImage?.large || attributes?.posterImage?.medium} 
            alt={attributes?.canonicalTitle}
            className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
            loading="lazy"
          />
          <div className="absolute top-3 right-3 bg-blue-600/90 px-2.5 py-1 rounded-full text-[8px] font-bold text-white shadow-lg border border-white/10">
            ★ {attributes?.averageRating || 'N/A'}
          </div>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-[#060910] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <h3 className="text-[11px] font-bold text-white line-clamp-2 uppercase italic tracking-tighter">
            {attributes?.canonicalTitle}
          </h3>
        </div>
      </div>

      {/* Modal Detail - Tanpa Blur (Anti-Lag) */}
      {isPreviewOpen && (
        <div 
          className="fixed inset-0 z-[99999] flex flex-col bg-[#060910] sm:bg-[#060910]/95 transition-opacity duration-200"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div className="flex-grow flex flex-col lg:flex-row pt-20 md:pt-36 pb-10 overflow-hidden">
            
            {/* Left Side: Poster Preview */}
            <div className="flex-[0.8] md:flex-[1.2] h-[35vh] md:h-full flex items-center justify-center p-6 relative">
              <img 
                src={attributes?.posterImage?.large || attributes?.posterImage?.medium} 
                className="max-w-full max-h-full object-contain rounded-xl shadow-2xl border border-white/5"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Right Side: Details Panel */}
            <div 
              className="flex-1 bg-white/[0.02] border-t md:border-t-0 md:border-l border-white/5 p-6 md:p-12 flex flex-col justify-between overflow-y-auto no-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-6 md:space-y-10">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-[2px] w-8 bg-blue-600"></div>
                    <span className="text-blue-500 text-[9px] font-bold uppercase tracking-[0.4em]">Manga Node</span>
                  </div>
                  <h2 className="text-2xl md:text-5xl font-black italic text-white uppercase tracking-tighter leading-tight mb-4">
                    {attributes?.canonicalTitle}
                  </h2>
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="px-3 py-1 bg-blue-600 rounded-full text-[8px] font-bold text-white uppercase tracking-widest">
                      {attributes?.mangaType || 'MANGA'}
                    </span>
                    <span className="px-3 py-1 bg-white/10 rounded-full text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                      {attributes?.status}
                    </span>
                  </div>
                  <p className="text-gray-400 text-[11px] leading-relaxed italic line-clamp-5 md:line-clamp-none">
                    {attributes?.synopsis || 'Archives for this node are unavailable.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/5">
                  <div className="space-y-1">
                    <p className="text-[8px] text-gray-600 uppercase font-bold tracking-widest">Sync Score</p>
                    <p className="text-sm font-mono text-blue-500">★ {attributes?.averageRating || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] text-gray-600 uppercase font-bold tracking-widest">Capacity</p>
                    <p className="text-sm font-mono text-white">{attributes?.chapterCount || '??'} Chapters</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-10">
                <button 
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-[10px] uppercase tracking-[0.3em] active:scale-95 transition-transform"
                  onClick={handleReadOnKitsu}
                >
                  Read on Kitsu
                </button>
                <button 
                  onClick={() => setIsPreviewOpen(false)} 
                  className="w-full bg-white/5 text-gray-500 py-4 rounded-xl font-bold text-[10px] uppercase tracking-[0.3em]"
                >
                  Close Terminal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}