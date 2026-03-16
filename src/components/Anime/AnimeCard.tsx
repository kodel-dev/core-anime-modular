'use client';

import React from 'react';
import { Anime } from '@/types/anime';

interface AnimeCardProps {
  anime: Anime;
  onWatch?: (id: number) => void;
}

export default function AnimeCard({ anime, onWatch }: AnimeCardProps) {
  return (
    <div className="group bg-gray-900/50 rounded-2xl overflow-hidden border border-gray-800 hover:border-blue-500/50 transition-all duration-500">
      <div className="relative aspect-[3/4] overflow-hidden">
        <img 
          src={anime.images.jpg.large_image_url} 
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
          alt={anime.title}
        />
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 text-[10px] font-black text-yellow-500">
          ⭐ {anime.score || 'N/A'}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-xs font-bold text-gray-200 line-clamp-2 mb-3 h-8 uppercase tracking-tight">
          {anime.title}
        </h3>
        <button 
          onClick={() => onWatch?.(anime.mal_id)}
          className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all active:scale-95"
        >
          Details
        </button>
      </div>
    </div>
  );
}