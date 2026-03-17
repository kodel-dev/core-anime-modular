'use client';

import React from 'react';
import { Anime } from '@/types/anime';

interface AnimeCardProps {
  anime: Anime;
  onWatch: (anime: Anime) => void;
}

export default function AnimeCard({ anime, onWatch }: AnimeCardProps) {
  return (
    <div 
      onClick={() => onWatch(anime)}
      className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gray-900 border border-white/5 transition-all hover:border-blue-500/50 shadow-lg"
    >
      <div className="aspect-[3/4] overflow-hidden">
        <img 
          src={anime.images.jpg.large_image_url} 
          alt={anime.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      
      {/* Overlay Information */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#060910] via-[#060910]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
        <h3 className="text-sm font-bold text-white line-clamp-2 mb-1">{anime.title}</h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-blue-400 font-black uppercase tracking-widest">View Details</span>
        </div>
      </div>
      
      <div className="p-3">
        <h3 className="text-xs font-medium text-gray-300 truncate">{anime.title}</h3>
      </div>
    </div>
  );
}