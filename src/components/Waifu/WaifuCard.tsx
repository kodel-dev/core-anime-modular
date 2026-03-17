'use client';

import React, { useState, useEffect } from 'react';

export default function WaifuCard({ image }: { image: any }) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [imgDimensions, setImgDimensions] = useState({ w: 0, h: 0 });
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (isPreviewOpen) {
      document.body.style.overflow = 'hidden';
      const img = new Image();
      // Tambahkan crossOrigin jika ada masalah akses canvas/dimensi
      img.crossOrigin = "anonymous"; 
      img.onload = () => setImgDimensions({ w: img.width, h: img.height });
      img.onerror = () => console.error("Gagal memuat detail gambar:", image.url);
      img.src = image.url;
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isPreviewOpen, image.url]);

  return (
    <>
      {/* --- KARTU THUMBNAIL --- */}
      <div 
        onClick={() => setIsPreviewOpen(true)}
        className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#0b0e14] cursor-pointer border border-white/5 hover:border-blue-500/50 transition-all shadow-xl"
      >
        <img 
          src={image.url} 
          alt={image.name}
          // referrerPolicy="no-referrer" membantu jika domain memblokir akses dari localhost
          referrerPolicy="no-referrer"
          className={`h-full w-full object-cover transition-all duration-700 ${
            hasError ? 'opacity-20' : 'opacity-80 group-hover:opacity-100 group-hover:scale-105'
          }`} 
          loading="lazy" 
          onError={() => setHasError(true)}
        />

        {/* Overlay Jika Gambar Error */}
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Gagal Memuat</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
          <p className="text-[10px] font-black text-white uppercase truncate tracking-tight">{image.name}</p>
        </div>
      </div>

      {/* --- MODAL DETAIL --- */}
      {isPreviewOpen && (
        <div 
          className="fixed inset-0 z-[100000] flex flex-col bg-[#060910]/98 backdrop-blur-xl animate-in fade-in duration-300" 
          onClick={() => setIsPreviewOpen(false)}
        >
          {/* Tombol Close */}
          <button className="absolute top-6 right-6 z-[100001] w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-red-500 rounded-full text-white transition-all border border-white/10 shadow-2xl active:scale-90">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto pt-20 lg:pt-0 no-scrollbar">
            {/* Area Visual Utama */}
            <div className="w-full lg:w-[70%] h-[50vh] lg:h-full flex items-center justify-center p-6 lg:p-16">
              <img 
                src={image.url} 
                referrerPolicy="no-referrer"
                className="max-w-full max-h-full object-contain rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 animate-in zoom-in-95 duration-500" 
                onClick={(e) => e.stopPropagation()} 
              />
            </div>

            {/* Area Informasi Panel */}
            <div className="flex-1 p-8 lg:flex lg:flex-col lg:justify-center bg-black/20 backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
              <div className="max-w-md mx-auto lg:mx-0 w-full space-y-6 text-left">
                <div className="space-y-2">
                  <div className="h-1 w-10 bg-blue-600 rounded-full" />
                  <h2 className="text-3xl font-black italic text-white uppercase tracking-tight leading-none">
                    {image.name}
                  </h2>
                </div>

                <div className="p-5 bg-white/[0.03] rounded-2xl border border-white/5 space-y-3">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em] mb-1">Dimensi File</span>
                    <span className="text-xl font-mono text-gray-200">
                      {imgDimensions.w ? `${imgDimensions.w} x ${imgDimensions.h}` : 'Mendeteksi...'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => window.open(image.url, '_blank')}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all shadow-[0_10px_30px_rgba(37,99,235,0.3)] active:scale-95"
                  >
                    Buka File Sumber
                  </button>
                  <p className="text-[10px] text-gray-600 text-center italic">
                    Gunakan resolusi tinggi untuk hasil cetak atau wallpaper maksimal.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}