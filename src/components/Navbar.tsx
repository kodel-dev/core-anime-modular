'use client';

import React from 'react';

interface NavbarProps {
  onSearch: (query: string) => void;
  onFilter: (type: string) => void;
}

export default function Navbar({ onSearch, onFilter }: NavbarProps) {
  const sectors = [
    { id: 'anime', label: 'Discovery' },
    { id: 'ghibli', label: 'Studio' },
    { id: 'manga', label: 'Reading' },
    { id: 'waifu', label: 'Gallery' },
    { id: 'nekos', label: 'Neko' }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-[60] bg-[#060910]/80 backdrop-blur-xl border-b border-gray-800 px-6 py-6 transition-all duration-300">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.location.href = '/'}>
          <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center font-black text-white shadow-[0_0_25px_rgba(37,99,235,0.4)] transition-transform group-hover:scale-110">C</div>
          <h1 className="text-2xl font-black uppercase tracking-tighter italic text-white">Core<span className="text-blue-500">Anime</span></h1>
        </div>

        <div className="flex items-center gap-8 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
          {sectors.map((s) => (
            <button key={s.id} onClick={() => onFilter(s.id)} className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-blue-500 transition-all whitespace-nowrap">{s.label}</button>
          ))}
        </div>

        <div className="relative w-full md:w-72 group">
          <input 
            type="text"
            placeholder="Search Core Archive..."
            onChange={(e) => onSearch(e.target.value)}
            className="w-full bg-gray-900/50 border border-gray-800 rounded-2xl pl-12 pr-5 py-3 text-xs text-white placeholder-gray-600 focus:border-blue-600 outline-none transition-all shadow-inner"
          />
        </div>
      </div>
    </nav>
  );
}