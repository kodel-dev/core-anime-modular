'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export default function WaifuCard({ image }: { image: any }) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [imgDimensions, setImgDimensions] = useState({ w: 0, h: 0 });
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (isPreviewOpen) {
      document.body.style.overflow = 'hidden';

      // ✅ FIX: pakai window.Image() bukan new Image()
      const img = new window.Image();
      img.onload = () => setImgDimensions({ w: img.width, h: img.height });
      img.onerror = () => console.error('Gagal memuat dimensi:', image.url);
      img.src = image.url;
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isPreviewOpen, image.url]);

  // Tutup modal saat tekan Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsPreviewOpen(false);
    };
    if (isPreviewOpen) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isPreviewOpen]);

  return (
    <>
      {/* ── KARTU THUMBNAIL ── */}
      <div
        onClick={() => !hasError && setIsPreviewOpen(true)}
        className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-[#0c0f18] cursor-pointer"
        style={{
          boxShadow: '0 0 0 1px rgba(255,255,255,0.04)',
          transition: 'box-shadow 0.3s ease, transform 0.3s ease',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.boxShadow =
            '0 0 0 1px rgba(99,179,237,0.4), 0 20px 60px -10px rgba(99,179,237,0.15)';
          (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.boxShadow =
            '0 0 0 1px rgba(255,255,255,0.04)';
          (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        }}
      >
        {/* Skeleton shimmer */}
        {!isLoaded && !hasError && (
          <div className="absolute inset-0 bg-gradient-to-r from-[#0c0f18] via-[#1a1f2e] to-[#0c0f18] animate-pulse" />
        )}

        {hasError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#0c0f18]">
            <svg className="w-8 h-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Gagal Memuat</span>
          </div>
        ) : (
          <Image
            src={image.url}
            alt={image.name || 'Visual Art'}
            fill
            sizes="(max-width: 768px) 50vw, 20vw"
            className="object-cover transition-all duration-700 group-hover:scale-110"
            style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 0.5s ease' }}
            onLoad={() => setIsLoaded(true)}
            onError={() => { setHasError(true); setIsLoaded(true); }}
            unoptimized
          />
        )}

        {/* Hover overlay */}
        {!hasError && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: 'linear-gradient(to top, rgba(6,9,16,0.95) 0%, rgba(6,9,16,0.4) 50%, transparent 100%)',
            }}
          >
            {/* Ikon play di tengah */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20"
                style={{ transform: 'scale(0.8)', transition: 'transform 0.2s ease' }}
              >
                <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
            {/* Nama di bawah */}
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="text-[10px] font-bold text-white uppercase truncate tracking-widest opacity-80">
                {image.name}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL PREVIEW ── */}
      {isPreviewOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ animation: 'fadeIn 0.25s ease' }}
          onClick={() => setIsPreviewOpen(false)}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{
              background: 'rgba(4, 6, 12, 0.96)',
              backdropFilter: 'blur(24px)',
            }}
          />

          {/* Tombol Close */}
          <button
            onClick={() => setIsPreviewOpen(false)}
            className="absolute top-5 right-5 z-10 w-10 h-10 flex items-center justify-center rounded-full border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition-all"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Konten Modal */}
          <div
            className="relative z-10 w-full h-full flex flex-col lg:flex-row max-w-7xl mx-auto overflow-y-auto"
            style={{ animation: 'slideUp 0.3s ease' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Area Gambar */}
            <div className="w-full lg:w-[68%] h-[55vh] lg:h-screen flex items-center justify-center p-6 lg:p-12">
              <div
                className="relative w-full h-full rounded-2xl overflow-hidden"
                style={{
                  boxShadow: '0 0 0 1px rgba(255,255,255,0.07), 0 40px 80px -20px rgba(0,0,0,0.8)',
                }}
              >
                <Image
                  src={image.url}
                  alt={image.name}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            </div>

            {/* Panel Info */}
            <div
              className="flex-1 flex flex-col justify-center p-8 lg:p-12"
              style={{
                borderLeft: '1px solid rgba(255,255,255,0.05)',
                background: 'rgba(255,255,255,0.02)',
              }}
            >
              <div className="max-w-sm w-full space-y-8">
                {/* Judul */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-px flex-1 bg-gradient-to-r from-blue-500/50 to-transparent" />
                    <span className="text-[9px] text-blue-400 font-bold uppercase tracking-[0.3em]">Detail Karya</span>
                    <div className="h-px flex-1 bg-gradient-to-l from-blue-500/50 to-transparent" />
                  </div>
                  <h2
                    className="text-2xl font-black text-white uppercase leading-tight tracking-tight"
                    style={{ fontStyle: 'italic' }}
                  >
                    {image.name}
                  </h2>
                </div>

                {/* Stats */}
                <div
                  className="rounded-xl p-5 space-y-4"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div>
                    <p className="text-[9px] text-gray-600 font-bold uppercase tracking-[0.2em] mb-1">Resolusi</p>
                    <p className="text-lg font-mono text-gray-100">
                      {imgDimensions.w
                        ? `${imgDimensions.w} × ${imgDimensions.h}`
                        : <span className="text-gray-600 animate-pulse">Mendeteksi...</span>
                      }
                    </p>
                  </div>

                  <div
                    className="h-px"
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                  />

                  <div>
                    <p className="text-[9px] text-gray-600 font-bold uppercase tracking-[0.2em] mb-1">Sumber</p>
                    <p className="text-xs text-gray-500 truncate font-mono">DeviantArt</p>
                  </div>
                </div>

                {/* Tombol aksi */}
                <div className="space-y-3">
                  <button
                    onClick={() => window.open(image.url, '_blank')}
                    className="w-full py-4 rounded-xl text-white font-bold text-[11px] uppercase tracking-widest transition-all active:scale-[0.98]"
                    style={{
                      background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                      boxShadow: '0 8px 32px -8px rgba(37,99,235,0.5)',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 12px 40px -8px rgba(37,99,235,0.7)')}
                    onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 8px 32px -8px rgba(37,99,235,0.5)')}
                  >
                    Buka Resolusi Penuh ↗
                  </button>

                  <button
                    onClick={() => setIsPreviewOpen(false)}
                    className="w-full py-3 rounded-xl text-gray-500 font-bold text-[11px] uppercase tracking-widest transition-all hover:text-gray-300"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>

          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideUp {
              from { opacity: 0; transform: translateY(16px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      )}
    </>
  );
}