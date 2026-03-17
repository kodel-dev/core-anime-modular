'use client';

import React, { useState, useEffect } from 'react';

interface ScheduleCardProps {
  item: any;
  convertToWIB: (time: string) => string;
  variant?: 'default' | 'large';
}

export default function ScheduleCard({ item, convertToWIB, variant = 'default' }: ScheduleCardProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const isLarge = variant === 'large';

  // Lock scroll saat modal terbuka
  useEffect(() => {
    if (isPreviewOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isPreviewOpen]);

  return (
    <>
      {/* Thumbnail Card - Klik untuk buka deskripsi di sini */}
      <div 
        onClick={() => setIsPreviewOpen(true)}
        className={`flex-shrink-0 snap-start group relative overflow-hidden rounded-2xl bg-[#0d1117] border border-white/5 hover:border-blue-500/50 transition-all duration-300 cursor-pointer ${
          isLarge ? 'w-[280px] md:w-[320px]' : 'w-[200px] md:w-[240px]'
        }`}
      >
        <div className={`relative overflow-hidden ${isLarge ? 'aspect-video' : 'aspect-[16/10]'}`}>
          <img 
            src={item.images?.jpg?.large_image_url || item.images?.jpg?.image_url} 
            alt={item.title}
            className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060910] via-transparent to-transparent" />
          
          <div className="absolute top-3 left-3 bg-blue-600 px-3 py-1 rounded-lg shadow-xl">
            <span className="text-[9px] font-black text-white uppercase tracking-wider">
              {convertToWIB(item.broadcast?.time || item.airing_start || 'TBA')}
            </span>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-[1px] w-3 bg-blue-500" />
            <span className="text-blue-500 text-[8px] font-bold uppercase tracking-widest">
              {item.type || 'Series'}
            </span>
          </div>
          <h4 className="font-bold text-white uppercase italic text-[11px] md:text-xs line-clamp-1 tracking-tighter">
            {item.title}
          </h4>
        </div>
      </div>

      {/* Internal Modal Detail - Tidak ada link keluar */}
      {isPreviewOpen && (
        <div 
          className="fixed inset-0 z-[99999] flex flex-col bg-[#060910] transition-opacity duration-200"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div className="flex-grow flex flex-col lg:flex-row pt-20 md:pt-36 pb-10 overflow-hidden">
            
            {/* Poster Preview */}
            <div className="flex-[0.8] md:flex-[1.2] h-[35vh] md:h-full flex items-center justify-center p-6 relative">
              <img 
                src={item.images?.jpg?.large_image_url || item.images?.jpg?.image_url} 
                className="max-w-full max-h-full object-contain rounded-xl shadow-2xl border border-white/5"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Content Detail */}
            <div 
              className="flex-1 bg-white/[0.02] border-t md:border-t-0 md:border-l border-white/5 p-6 md:p-12 flex flex-col justify-between overflow-y-auto no-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-[2px] w-8 bg-blue-600"></div>
                    <span className="text-blue-500 text-[9px] font-bold uppercase tracking-[0.4em]">Detail Informasi</span>
                  </div>
                  <h2 className="text-2xl md:text-4xl font-black italic text-white uppercase tracking-tighter leading-tight mb-4">
                    {item.title}
                  </h2>
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="px-3 py-1 bg-blue-600 rounded-full text-[8px] font-bold text-white uppercase tracking-widest">
                      {item.type || 'TV'}
                    </span>
                    <span className="px-3 py-1 bg-white/10 rounded-full text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                      {item.source}
                    </span>
                  </div>
                  <p className="text-gray-400 text-[11px] leading-relaxed italic line-clamp-6 md:line-clamp-none">
                    {item.synopsis || 'Deskripsi untuk judul ini sedang dalam proses pemutakhiran data.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/5">
                  <div className="space-y-1">
                    <p className="text-[8px] text-gray-600 uppercase font-bold tracking-widest">Skor Basis Data</p>
                    <p className="text-sm font-mono text-blue-500">★ {item.score || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] text-gray-600 uppercase font-bold tracking-widest">Waktu Tayang</p>
                    <p className="text-sm font-mono text-white tracking-tighter">{item.broadcast?.string || 'TBA'}</p>
                  </div>
                </div>
              </div>

              {/* Tombol Close Saja - TANPA LINK LUAR */}
              <div className="mt-10">
                <button 
                  onClick={() => setIsPreviewOpen(false)} 
                  className="w-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white py-4 rounded-xl font-bold text-[10px] uppercase tracking-[0.3em] transition-all"
                >
                  Tutup Deskripsi [×]
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}