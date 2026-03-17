'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  
  const sectors = [
    { id: '/', label: 'Discovery' },
    { id: '/manga', label: 'Reading' },
    { id: '/waifu', label: 'Gallery' },
    { id: '/neko', label: 'Neko' }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-[#060910]/90 backdrop-blur-xl border-b border-white/5">
      <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Branding: CoreAnime Logo */}
        <Link href="/" className="flex items-center gap-2 md:gap-3 group shrink-0">
          <div className="w-9 h-9 md:w-10 md:h-10 bg-blue-600 rounded-lg md:rounded-xl flex items-center justify-center font-black text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] group-hover:scale-105 transition-transform">
            C
          </div>
          {/* Teks logo disembunyikan di layar sangat kecil agar tidak sempit */}
          <h1 className="hidden xs:block text-lg md:text-xl font-black uppercase tracking-tighter italic text-white leading-none">
            Core<span className="text-blue-500">Anime</span>
          </h1>
        </Link>

        {/* Navigation Links: Auto Scrollable on Mobile */}
        <div className="flex items-center gap-5 md:gap-10 overflow-x-auto no-scrollbar py-2 -mr-2 pr-2">
          {sectors.map((s) => (
            <Link 
              key={s.id} 
              href={s.id}
              className={`text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] transition-colors whitespace-nowrap relative py-1 ${
                pathname === s.id 
                ? 'text-blue-500' 
                : 'text-gray-500 hover:text-white'
              }`}
            >
              {s.label}
              
              {/* Active Indicator */}
              {pathname === s.id && (
                <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.8)] rounded-full animate-in fade-in zoom-in-50 duration-300"></span>
              )}
            </Link>
          ))}
        </div>
        
      </div>
    </nav>
  );
}