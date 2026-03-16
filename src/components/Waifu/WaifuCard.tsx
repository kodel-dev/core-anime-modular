'use client';

import React from 'react';

export default function WaifuCard({ image }: { image: any }) {
  return (
    <div className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 shadow-2xl">
      <img 
        src={image.url} 
        className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110" 
        alt="Waifu Gallery"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#060910] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-5">
        <p className="text-[9px] font-black uppercase text-blue-400 tracking-[0.2em] mb-1">Source: Waifu.im</p>
        <div className="flex flex-wrap gap-1">
          {image.tags?.slice(0, 2).map((t: any, i: number) => (
            <span key={i} className="text-[8px] bg-white/10 px-2 py-0.5 rounded uppercase font-bold text-white/70">
              #{t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}