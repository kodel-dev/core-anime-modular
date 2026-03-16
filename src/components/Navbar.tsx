'use client';

import React from 'react';

interface NavbarProps {
  onSearch: (query: string) => void;
  onFilter: (type: string) => void;
}

export default function Navbar({ onSearch, onFilter }: NavbarProps) {
  // Daftar kategori yang mendukung fitur Multi-API kita
  const categories = [
    { name: 'Populer', id: 'populer' },
    { name: 'On-Going', id: 'on-going' },
    { name: 'Manga', id: 'manga' },
    { name: 'Ghibli', id: 'ghibli' },
    { name: 'Waifu', id: 'waifu' },
    { name: 'Nekos', id: 'nekos' }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-[60] bg-[#060910]/90 backdrop-blur-xl border-b border-gray-800 px-6 py-4 transition-all duration-300">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        
        {/* Logo Section */}
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => window.location.href = '/'}
        >
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] group-hover:scale-110 transition-transform">
            C
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tighter italic text-white">
            Core<span className="text-blue-500">Anime</span>
          </h1>
        </div>

        {/* Categories Navigation */}
        <div className="flex items-center gap-5 md:gap-8 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide no-scrollbar">
          {categories.map((cat) => (
            <button 
              key={cat.id}
              onClick={() => onFilter(cat.id)}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-blue-500 hover:translate-y-[-1px] transition-all whitespace-nowrap active:scale-95"
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72 group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-gray-500 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input 
            type="text"
            placeholder="Search Global Database..."
            onChange={(e) => onSearch(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-2xl pl-12 pr-5 py-3 text-xs text-white placeholder-gray-600 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all shadow-inner"
          />
        </div>

      </div>
    </nav>
  );
}