'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

// ── Helper: download lewat proxy ──────────────────────────────────────────────
async function downloadViaProxy(url: string, filename: string) {
  const cleanName = filename.replace(/[^a-zA-Z0-9\s._-]/g, '').trim() || 'artwork';
  const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(cleanName)}.jpg`;

  const res = await fetch(proxyUrl);
  if (!res.ok) throw new Error(`Gagal unduh: ${res.status}`);

  const blob = await res.blob();
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${cleanName}.jpg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

// ── Komponen Utama ────────────────────────────────────────────────────────────
export default function WaifuCard({ image }: { image: any }) {
  const [isPreviewOpen, setIsPreviewOpen]   = useState(false);
  const [imgDimensions, setImgDimensions]   = useState({ w: 0, h: 0 });
  const [hasError, setHasError]             = useState(false);
  const [isLoaded, setIsLoaded]             = useState(false);
  const [isDownloading, setIsDownloading]   = useState(false);
  const [downloadDone, setDownloadDone]     = useState(false);

  // Lock scroll + deteksi dimensi saat modal terbuka
  useEffect(() => {
    if (isPreviewOpen) {
      document.body.style.overflow = 'hidden';
      const img = new window.Image();
      img.onload = () => setImgDimensions({ w: img.width, h: img.height });
      img.src = image.url;
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isPreviewOpen, image.url]);

  // Tutup modal dengan Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsPreviewOpen(false);
    };
    if (isPreviewOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isPreviewOpen]);

  const handleDownload = useCallback(async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      await downloadViaProxy(image.url, image.name);
      setDownloadDone(true);
      setTimeout(() => setDownloadDone(false), 2500);
    } catch (err) {
      console.error('Download error:', err);
      window.open(image.url, '_blank'); // fallback
    } finally {
      setIsDownloading(false);
    }
  }, [image.url, image.name, isDownloading]);

  return (
    <>
      {/* ════════════════════════════════════════
          KARTU THUMBNAIL
      ════════════════════════════════════════ */}
      <div
        onClick={() => !hasError && setIsPreviewOpen(true)}
        className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#0c0f18] cursor-pointer select-none"
        style={{
          boxShadow: '0 0 0 1px rgba(255,255,255,0.05)',
          transition: 'transform 0.35s cubic-bezier(.22,.68,0,1.2), box-shadow 0.35s ease',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement;
          el.style.transform = 'translateY(-4px) scale(1.01)';
          el.style.boxShadow = '0 0 0 1px rgba(148,163,255,0.35), 0 24px 48px -12px rgba(99,102,241,0.25)';
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement;
          el.style.transform = 'translateY(0) scale(1)';
          el.style.boxShadow = '0 0 0 1px rgba(255,255,255,0.05)';
        }}
      >
        {/* Skeleton */}
        {!isLoaded && !hasError && (
          <div className="absolute inset-0 animate-pulse"
            style={{ background: 'linear-gradient(110deg, #0c0f18 30%, #161b2a 50%, #0c0f18 70%)' }}
          />
        )}

        {/* Error State */}
        {hasError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <svg className="w-7 h-7 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[9px] text-gray-700 font-bold uppercase tracking-widest">Gagal Memuat</span>
          </div>
        ) : (
          <Image
            src={image.url}
            alt={image.name || 'Visual Art'}
            fill
            sizes="(max-width: 768px) 50vw, 20vw"
            className="object-cover duration-700 group-hover:scale-[1.08]"
            style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 0.6s ease, transform 0.7s ease' }}
            onLoad={() => setIsLoaded(true)}
            onError={() => { setHasError(true); setIsLoaded(true); }}
            unoptimized
          />
        )}

        {/* Hover Overlay */}
        {!hasError && (
          <div
            className="absolute inset-0 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: 'linear-gradient(to top, rgba(4,6,14,0.97) 0%, rgba(4,6,14,0.5) 55%, transparent 100%)' }}
          >
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center border border-white/20"
                style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)' }}
              >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
            <div className="p-3 pb-4">
              <p className="text-[10px] font-bold text-white/80 uppercase truncate tracking-[0.15em]">
                {image.name}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════
          MODAL PREVIEW
      ════════════════════════════════════════ */}
      {isPreviewOpen && (
        <div
          className="fixed inset-0 z-[9999]"
          style={{ animation: 'vaultFadeIn 0.2s ease forwards' }}
          onClick={() => setIsPreviewOpen(false)}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(3,5,11,0.97)', backdropFilter: 'blur(32px)' }}
          />

          {/* Noise texture */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.025]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat',
              backgroundSize: '128px',
            }}
          />

          {/* Close Button */}
          <button
            onClick={() => setIsPreviewOpen(false)}
            className="absolute top-5 right-5 z-20 w-9 h-9 flex items-center justify-center rounded-full text-gray-500 hover:text-white transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Konten Modal */}
          <div
            className="relative z-10 w-full h-full flex flex-col lg:flex-row overflow-hidden"
            style={{ animation: 'vaultSlideUp 0.3s cubic-bezier(.22,.68,0,1.2) forwards' }}
            onClick={e => e.stopPropagation()}
          >
            {/* ── Sisi Kiri: Gambar ── */}
            <div
              className="w-full lg:w-[65%] h-[52vh] lg:h-full flex items-center justify-center p-5 lg:p-14"
              style={{ borderRight: '1px solid rgba(255,255,255,0.04)' }}
            >
              <div className="relative w-full h-full" style={{ filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.7))' }}>
                <Image
                  src={image.url}
                  alt={image.name}
                  fill
                  className="object-contain rounded-xl"
                  unoptimized
                />
              </div>
            </div>

            {/* ── Sisi Kanan: Info Panel ── */}
            <div
              className="flex-1 flex flex-col justify-between p-7 lg:p-10 overflow-y-auto"
              style={{ background: 'rgba(255,255,255,0.015)' }}
            >
              <div className="space-y-6">
                {/* Label */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: '#6366f1', boxShadow: '0 0 8px #6366f1' }}
                  />
                  <span className="text-[9px] text-indigo-400/80 font-bold uppercase tracking-[0.35em]">
                    Visual Vault
                  </span>
                  <div className="flex-1 h-px" style={{ background: 'rgba(99,102,241,0.2)' }} />
                </div>

                {/* Judul */}
                <h2
                  className="text-[1.6rem] font-black text-white leading-tight"
                  style={{ fontStyle: 'italic', letterSpacing: '-0.02em', textShadow: '0 2px 20px rgba(99,102,241,0.15)' }}
                >
                  {image.name}
                </h2>

                {/* Meta Info Table */}
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  {[
                    {
                      label: 'Resolusi',
                      value: imgDimensions.w ? `${imgDimensions.w} × ${imgDimensions.h} px` : '···',
                      mono: true,
                      loading: !imgDimensions.w,
                    },
                    { label: 'Sumber', value: 'DeviantArt', mono: false, loading: false },
                    { label: 'Format', value: 'JPEG / PNG', mono: false, loading: false },
                  ].map((row, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-5 py-3.5"
                      style={{
                        background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                        borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                      }}
                    >
                      <span className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em]">
                        {row.label}
                      </span>
                      <span className={`text-sm text-gray-300 ${row.mono ? 'font-mono' : 'font-medium'} ${row.loading ? 'animate-pulse text-gray-600' : ''}`}>
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tombol Aksi */}
              <div className="space-y-3 mt-8">
                {/* Download */}
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all active:scale-[0.97] flex items-center justify-center gap-2.5 text-white"
                  style={{
                    background: downloadDone
                      ? 'linear-gradient(135deg, #059669, #047857)'
                      : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                    boxShadow: downloadDone
                      ? '0 8px 32px -8px rgba(5,150,105,0.5)'
                      : '0 8px 32px -8px rgba(99,102,241,0.5)',
                    opacity: isDownloading ? 0.8 : 1,
                    transition: 'all 0.3s ease',
                  }}
                >
                  {isDownloading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Mengunduh...
                    </>
                  ) : downloadDone ? (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      Berhasil Diunduh!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Unduh Gambar
                    </>
                  )}
                </button>

                {/* Buka di tab baru */}
                <button
                  onClick={() => window.open(image.url, '_blank')}
                  className="w-full py-3.5 rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all hover:text-white active:scale-[0.97] flex items-center justify-center gap-2"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    color: 'rgba(255,255,255,0.4)',
                  }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Buka Resolusi Penuh
                </button>

                {/* Tutup */}
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="w-full py-3 text-[10px] font-bold uppercase tracking-widest transition-colors"
                  style={{ color: 'rgba(255,255,255,0.2)' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.2)')}
                >
                  Tutup · ESC
                </button>
              </div>
            </div>
          </div>

          <style>{`
            @keyframes vaultFadeIn {
              from { opacity: 0; }
              to   { opacity: 1; }
            }
            @keyframes vaultSlideUp {
              from { opacity: 0; transform: translateY(20px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      )}
    </>
  );
}