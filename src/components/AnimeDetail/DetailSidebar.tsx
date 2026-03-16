'use client';

import React from 'react';

interface DetailSidebarProps {
  imageUrl: string;
  title: string;
  score: number | string | null;
}

export default function DetailSidebar({ imageUrl, title, score }: DetailSidebarProps) {
  return (
    <div className="w-full lg:w-72 flex-shrink-0">
      <img src={imageUrl} alt={title} className="w-full rounded-3xl border border-gray-800 shadow-2xl" />
      <div className="mt-6 p-5 bg-gray-900/50 rounded-2xl border border-gray-800 text-center">
        <span className="text-[10px] text-blue-500 font-black uppercase tracking-[0.2em] block mb-1">Kodel Rating</span>
        <span className="text-3xl font-black italic">{score || 'N/A'}</span>
      </div>
    </div>
  );
}