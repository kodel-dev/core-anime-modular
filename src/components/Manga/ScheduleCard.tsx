'use client';

import React, { useState, useEffect } from 'react';

interface ScheduleCardProps {
  item: any;
  convertToWIB: (time: string) => string;
  variant?: 'small' | 'large';
}

export default function ScheduleCard({ item, convertToWIB, variant = 'small' }: ScheduleCardProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const isClickable = variant === 'large';

  useEffect(() => {
    if (isClickable && isPreviewOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isPreviewOpen, isClickable]);

  return (
    <>
      {/* Thumbnail Card - Animasi durasi dipangkas habis agar enteng */}
      <div 
        onClick={() => isClickable && setIsPreviewOpen(true)}
        className={`${
          variant === 'large' 
            ? 'min-w-[260px] sm:min-w-[350px] md:min-w-[450px] h-48 md:h-64' 
            : 'min-w-[130px] sm:min-w-[180px] md:min-w-[220px]'
        } snap-start snap-always group relative cursor-pointer`}
      >
        <div className={`relative h-full w-full overflow-hidden rounded-2xl md:rounded-[2rem] border border-white/5 bg-gray-900 ${variant === 'small' ? 'aspect-[3/4]' : ''}`}>
          
          {/* Image - Hapus transisi transform raksasa */}
          <img 
            src={item.images.jpg.large_image_url} 
            className={`absolute inset-0 w-full h-full object-cover ${
                variant === 'large' ? 'opacity-50' : 'opacity-80'
            }`} 
            alt={item.title} 
            loading="lazy"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent opacity-90 z-10"></div>
          {variant === 'large' && (
            <div className="absolute inset-0 bg-gradient-to-r from-[#060910] via-[#060910]/30 to-transparent z-10"></div>
          )}
          
          {/* Badge Waktu */}
          <div className="absolute top-3 left-3 md:top-6 md:left-6 px-3 py-1 bg-black/80 rounded-full border border-white/10 text-[7px] md:text-[9px] font-bold text-red-500 z-20 uppercase tracking-wider">
            {convertToWIB(item.broadcast.time)}
          </div>

          {variant === 'large' && (
            <div className="absolute inset-0 p-5 md:p-10 flex flex-col justify-end md:justify-center z-20">
               <div className="flex items-center gap-2 mb-1 md:mb-3">
                  <div className="h-[1.5px] w-4 bg-red-600"></div>
                  <span className="text-red-500 text-[7px] md:text-[8px] font-black uppercase tracking-[0.3em]">Broadcast</span>
               </div>
               <h4 className="text-sm md:text-2xl font-black uppercase italic leading-tight text-white line-clamp-2 tracking-tighter">
                 {item.title}
               </h4>
            </div>
          )}

          {variant === 'small' && (
            <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5 z-20">
              <h4 className="text-[9px] md:text-[10px] font-black uppercase truncate text-white tracking-tighter italic">
                {item.title}
              </h4>
            </div>
          )}
        </div>
      </div>

      {/* Modal Detail - Hapus backdrop-blur-3xl (Ini penyebab lag utama di mobile) */}
      {isClickable && isPreviewOpen && (
        <div 
          className="fixed inset-0 z-[99999] flex flex-col bg-[#060910] sm:bg-[#060910]/95"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div className="flex-grow flex flex-col lg:flex-row pt-20 md:pt-36 pb-10 overflow-hidden">
             
             <div className="flex-[0.8] md:flex-[1.2] h-[35vh] md:h-full flex items-center justify-center p-6 relative">
               <img 
                 src={item.images.jpg.large_image_url} 
                 className="max-w-full max-h-full object-contain rounded-xl shadow-2xl border border-white/5" 
                 alt={item.title}
               />
             </div>

             <div className="flex-1 bg-white/[0.02] border-t md:border-t-0 md:border-l border-white/5 p-6 md:p-12 flex flex-col justify-between overflow-y-auto" onClick={(e) => e.stopPropagation()}>
               <div className="space-y-6">
                 <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-[2px] w-6 bg-red-600"></div>
                        <span className="text-red-500 text-[8px] font-black uppercase tracking-[0.4em]">Live Intel</span>
                    </div>
                    <h2 className="text-2xl md:text-4xl font-black italic text-white uppercase tracking-tighter leading-tight">
                        {item.title}
                    </h2>
                 </div>
                 <p className="text-gray-400 text-[11px] leading-relaxed italic line-clamp-5 md:line-clamp-none">
                    {item.synopsis || 'Transmission data pending...'}
                 </p>
               </div>

               <div className="flex flex-col gap-3 mt-8">
                  <button 
                    onClick={() => window.open(item.url, '_blank')}
                    className="w-full bg-red-600 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] active:scale-95"
                  >
                    MAL Link
                  </button>
                  <button 
                    onClick={() => setIsPreviewOpen(false)} 
                    className="w-full bg-white/5 text-gray-400 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.3em]"
                  >
                    Close [×]
                  </button>
               </div>
             </div>
          </div>
        </div>
      )}
    </>
  );
}