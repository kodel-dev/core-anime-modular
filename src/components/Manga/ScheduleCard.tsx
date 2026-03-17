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

  const imgSrc = item.images?.jpg?.large_image_url || item.images?.jpg?.image_url;
  const airTime = convertToWIB(item.broadcast?.time || item.airing_start || 'TBA');

  useEffect(() => {
    document.body.style.overflow = isPreviewOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isPreviewOpen]);

  return (
    <>
      {/* ── CARD ─────────────────────────────────────────────────── */}
      <div
        onClick={() => setIsPreviewOpen(true)}
        className={`flex-shrink-0 snap-start group relative overflow-hidden rounded-2xl
                    bg-[#0d1117] border border-white/5
                    hover:border-indigo-500/40 hover:shadow-[0_4px_24px_rgba(99,102,241,0.1)]
                    transition-all duration-300 cursor-pointer
                    ${isLarge ? 'w-[280px] md:w-[320px]' : 'w-[200px] md:w-[240px]'}`}
      >
        {/* thumbnail */}
        <div className={`relative overflow-hidden ${isLarge ? 'aspect-video' : 'aspect-[16/10]'}`}>
          <img
            src={imgSrc}
            alt={item.title}
            className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-transparent to-transparent" />

          {/* time badge */}
          <div className="absolute top-2.5 left-2.5 bg-blue-600/90 backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-lg">
            <span className="text-[8px] font-black text-white uppercase tracking-wider">{airTime}</span>
          </div>
        </div>

        {/* info */}
        <div className="px-3.5 py-3">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="h-px w-3 bg-blue-500" />
            <span className="text-blue-500 text-[7px] font-black uppercase tracking-widest">
              {item.type || 'Series'}
            </span>
          </div>
          <h4 className="text-[11px] font-bold text-white uppercase italic tracking-tight line-clamp-1">
            {item.title}
          </h4>
        </div>
      </div>

      {/* ── MODAL ────────────────────────────────────────────────── */}
      {isPreviewOpen && (
        <div
          className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div
            className="relative w-full sm:max-w-4xl bg-[#080b12] border border-white/[0.07]
                       rounded-t-[28px] sm:rounded-3xl overflow-hidden
                       flex flex-col sm:flex-row
                       h-[88dvh] sm:h-[80vh]
                       shadow-[0_-20px_60px_rgba(0,0,0,0.8)] sm:shadow-[0_30px_80px_rgba(0,0,0,0.8)]
                       animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* drag handle — mobile */}
            <div className="sm:hidden absolute top-0 inset-x-0 flex justify-center pt-2.5 pointer-events-none z-10">
              <div className="w-9 h-1 rounded-full bg-white/20" />
            </div>

            {/* close btn */}
            <button
              onClick={() => setIsPreviewOpen(false)}
              className="absolute top-3.5 right-3.5 z-50 w-8 h-8 flex items-center justify-center
                         bg-white/[0.06] hover:bg-white/[0.12] active:scale-90
                         border border-white/[0.08] rounded-xl
                         text-gray-400 hover:text-white transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* poster */}
            <div className="relative sm:w-[260px] md:w-[300px] shrink-0
                            h-[38vh] sm:h-full overflow-hidden
                            border-b sm:border-b-0 sm:border-r border-white/[0.07]">
              <img
                src={imgSrc}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent sm:bg-gradient-to-r sm:from-transparent sm:via-transparent sm:to-[#080b12]/80" />

              {/* time chip over poster */}
              <div className="absolute bottom-4 left-4 bg-blue-600/90 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                <span className="text-[9px] font-black text-white uppercase tracking-widest">{airTime}</span>
              </div>
            </div>

            {/* detail panel */}
            <div className="flex-1 flex flex-col justify-between overflow-y-auto no-scrollbar
                            p-5 sm:p-8 md:p-10 pt-7 sm:pt-10">
              <div className="space-y-5 sm:space-y-7">
                {/* heading */}
                <div>
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="h-px w-7 bg-blue-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                    <span className="text-blue-400/80 text-[8px] font-black uppercase tracking-[0.45em]">Detail Informasi</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-black italic text-white uppercase tracking-tight leading-[1.1] line-clamp-3 mb-3 pr-8">
                    {item.title}
                  </h2>
                  <div className="flex flex-wrap gap-1.5">
                    {item.type && (
                      <span className="px-2.5 py-1 bg-blue-600/90 rounded-full text-[7px] font-black text-white uppercase tracking-widest">
                        {item.type}
                      </span>
                    )}
                    {item.source && (
                      <span className="px-2.5 py-1 bg-white/[0.07] border border-white/[0.08] rounded-full text-[7px] font-black text-gray-400 uppercase tracking-widest">
                        {item.source}
                      </span>
                    )}
                  </div>
                </div>

                {/* synopsis */}
                <p className="text-gray-400 text-[12px] sm:text-[13px] leading-relaxed">
                  {item.synopsis || 'Deskripsi untuk judul ini sedang dalam proses pemutakhiran data.'}
                </p>

                {/* stats */}
                <div className="grid grid-cols-2 gap-4 pt-5 border-t border-white/[0.06]">
                  <div>
                    <p className="text-[7px] text-gray-600 uppercase font-black tracking-widest mb-1">Skor</p>
                    <p className="text-[13px] font-mono text-blue-400">★ {item.score || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[7px] text-gray-600 uppercase font-black tracking-widest mb-1">Jadwal Tayang</p>
                    <p className="text-[12px] text-white font-semibold tracking-tight">{item.broadcast?.string || 'TBA'}</p>
                  </div>
                </div>
              </div>

              {/* close button */}
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="mt-8 w-full bg-white/[0.05] hover:bg-white/[0.09] active:scale-[0.98]
                           border border-white/[0.08] text-gray-500 hover:text-white
                           py-3 rounded-xl font-black text-[8px] uppercase tracking-[0.35em]
                           transition-all duration-200"
              >
                Tutup  ×
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}