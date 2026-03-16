'use client';

import React from 'react';

export default function MangaCard({ manga }: { manga: any }) {
  const { attributes } = manga;
  return (
    <div className="group bg-gray-900/50 rounded-2xl overflow-hidden border border-gray-800 hover:border-green-500/50 transition-all duration-500">
      <div className="relative aspect-[3/4] overflow-hidden">
        <img 
          src={attributes.posterImage?.large || attributes.posterImage?.original} 
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
          alt={attributes.canonicalTitle}
        />
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 text-[10px] font-black text-green-500">
          📖 {attributes.averageRating || 'N/A'}%
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-xs font-bold text-gray-200 line-clamp-2 mb-1 uppercase">
          {attributes.canonicalTitle}
        </h3>
        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-3">
          {attributes.subtype || 'Manga'} • {attributes.status}
        </p>
      </div>
    </div>
  );
}