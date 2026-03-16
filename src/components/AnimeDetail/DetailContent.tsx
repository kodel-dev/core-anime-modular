'use client';

import React from 'react';

interface DetailContentProps {
  title: string;
  genres: { name: string }[];
  synopsis: string;
  meta: {
    status: string;
    type: string;
    rating: string;
    studio: string;
  };
}

export default function DetailContent({ title, genres, synopsis, meta }: DetailContentProps) {
  return (
    <div className="flex-1">
      <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter uppercase italic text-white leading-none">
        {title}
      </h1>
      
      <div className="flex flex-wrap gap-2 mb-8">
        {genres.length > 0 ? (
          genres.map((g, i) => (
            <span key={i} className="px-3 py-1 bg-gray-900 border border-gray-700 rounded-md text-[10px] text-gray-400 font-black uppercase">
              {g.name}
            </span>
          ))
        ) : (
          <span className="px-3 py-1 bg-gray-900/50 border border-gray-800 rounded-md text-[10px] text-gray-600 font-black uppercase tracking-widest">
            Featured Content
          </span>
        )}
      </div>

      <p className="text-gray-400 text-lg leading-relaxed mb-12 text-justify border-l-4 border-blue-600 pl-8 italic">
        {synopsis || 'Deskripsi metadata sedang disinkronkan dari database global.'}
      </p>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-10 border-t border-gray-800">
        {[
          { label: 'Status', value: meta.status },
          { label: 'Type', value: meta.type },
          { label: 'Rating', value: meta.rating },
          { label: 'Studio', value: meta.studio }
        ].map((item, i) => (
          <div key={i}>
            <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">{item.label}</p>
            <p className="text-sm text-gray-200 mt-2 font-bold">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}