'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

interface WaifuCardProps {
  image: any;
  isNsfwLocked?: boolean;
  onCardClick?: (image: any) => void;
}

export default function WaifuCard({ image, isNsfwLocked, onCardClick }: WaifuCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [naturalRatio, setNaturalRatio] = useState<number>(0.75); // default portrait 3:4

  const imageUrl = image.preview || image.url;
  const proxyUrl = `/api/proxy?url=${encodeURIComponent(imageUrl)}`;
  const isLocked = isNsfwLocked || false;

  // Hitung aspect ratio dari dimensi yang tersedia (dari API metadata)
  useEffect(() => {
    if (image.previewWidth && image.previewHeight) {
      setNaturalRatio(image.previewWidth / image.previewHeight);
    } else if (image.width && image.height) {
      setNaturalRatio(image.width / image.height);
    }
  }, [image]);

  // Tentukan paddingBottom berdasarkan rasio gambar
  // Portrait → tinggi (ratio < 0.85) | Square → 1:1 | Landscape → pendek (ratio > 1.2)
  const getPaddingBottom = () => {
    if (naturalRatio > 1.2) return '83.33%';       // landscape 6:5
    if (naturalRatio > 0.95) return '100%';         // square
    if (naturalRatio > 0.75) return '120%';         // portrait 5:6
    return '133.33%';                               // portrait 3:4 (default)
  };

  return (
    <div
      onClick={() => !isLocked && onCardClick && onCardClick(image)}
      className={`group relative rounded-2xl overflow-hidden ${!isLocked ? 'cursor-pointer' : 'cursor-default'}`}
      style={{
        background: '#0f1219',
        boxShadow: '0 0 0 1px rgba(255,255,255,0.06)',
        transition: 'transform 0.3s cubic-bezier(.22,.68,0,1.2), box-shadow 0.3s ease',
        // Gunakan paddingBottom trick untuk preserve aspect ratio gambar
        paddingBottom: getPaddingBottom(),
        position: 'relative',
      }}
      onMouseEnter={e => {
        if (isLocked) return;
        const el = e.currentTarget as HTMLElement;
        el.style.transform = 'translateY(-3px)';
        el.style.boxShadow = '0 0 0 1px rgba(236,72,153,0.4), 0 20px 50px -12px rgba(236,72,153,0.2)';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = 'translateY(0)';
        el.style.boxShadow = '0 0 0 1px rgba(255,255,255,0.06)';
      }}
    >
      {/* Wrapper absolut supaya fill image bisa bekerja */}
      <div className="absolute inset-0">
        {/* Skeleton loading */}
        {!isLoaded && (
          <div
            className="absolute inset-0 animate-pulse"
            style={{ background: 'linear-gradient(110deg, #0f1219 30%, #1a2030 50%, #0f1219 70%)' }}
          />
        )}

        {/* Gambar — object-cover untuk kartu grid */}
        <Image
          src={proxyUrl}
          alt={image.title || 'Karya seni'}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover transition-all duration-700 group-hover:scale-[1.06]"
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.5s ease, transform 0.7s ease',
            filter: isLocked ? 'blur(18px) brightness(0.6)' : 'none',
          }}
          onLoad={e => {
            setIsLoaded(true);
            // Update ratio dari gambar yang sudah di-load
            const img = e.currentTarget as HTMLImageElement;
            if (img.naturalWidth && img.naturalHeight) {
              setNaturalRatio(img.naturalWidth / img.naturalHeight);
            }
          }}
          unoptimized
        />

        {/* Lock overlay */}
        {isLocked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/30">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.15)',
                backdropFilter: 'blur(4px)',
              }}
            >
              <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
              18+ · Aktifkan NSFW
            </span>
          </div>
        )}

        {/* Hover overlay */}
        {!isLocked && (
          <div
            className="absolute inset-0 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: 'linear-gradient(to top, rgba(5,5,15,0.97) 0%, rgba(5,5,15,0.4) 50%, transparent 100%)',
            }}
          >
            <div className="p-3 sm:p-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <p className="text-[11px] sm:text-xs font-bold text-white truncate leading-tight">
                {image.title}
              </p>
              <p className="text-[10px] mt-0.5 font-medium truncate" style={{ color: '#f472b6' }}>
                @{image.author}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}