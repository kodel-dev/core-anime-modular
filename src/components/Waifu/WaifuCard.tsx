'use client';

import Image from 'next/image';
import { useState } from 'react';

interface WaifuCardProps {
  image: any;
  isNsfwLocked?: boolean;
}

export default function WaifuCard({ image, isNsfwLocked }: WaifuCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="group relative aspect-[3/4.5] bg-[#161b22] rounded-3xl overflow-hidden border border-white/5 shadow-lg">
      <Image
        src={image.preview || image.url}
        alt={image.title}
        fill
        className={`object-cover transition-all duration-700 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${isNsfwLocked ? 'blur-2xl scale-110 grayscale' : 'blur-0'}`} // Efek Blur di sini
        onLoadingComplete={() => setIsLoaded(true)}
        unoptimized
      />

      {/* Overlay Peringatan jika terkunci */}
      {isNsfwLocked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm p-4 text-center">
          <svg className="w-8 h-8 text-white/50 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">Content Locked</p>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-5 flex flex-col justify-end">
        <h3 className="text-xs font-bold truncate">{image.title}</h3>
        <p className="text-[10px] text-gray-400">@{image.author}</p>
      </div>
    </div>
  );
}