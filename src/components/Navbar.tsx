'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const SECTORS = [
  { id: '/',       label: 'Discovery' },
  { id: '/manga',  label: 'Reading'   },
  { id: '/waifu',  label: 'Gallery'   },
];

export default function Navbar() {
  const pathname  = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  /* Sinkronkan status login sederhana dari cookie */
  useEffect(() => {
    const checkAuth = () => {
      const hasToken = document.cookie.includes('da_access_token');
      setIsLoggedIn(hasToken);
    };

    checkAuth();
    const onScroll = () => setScrolled(window.scrollY > 12);
    
    window.addEventListener('scroll', onScroll, { passive: true });
    // Interval kecil untuk memastikan UI update jika cookie berubah
    const interval = setInterval(checkAuth, 2000);

    return () => {
      window.removeEventListener('scroll', onScroll);
      clearInterval(interval);
    };
  }, []);

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-[100] transition-all duration-300
                  ${scrolled
                    ? 'bg-[#060910]/95 backdrop-blur-2xl border-b border-white/[0.07] shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
                    : 'bg-[#060910]/70 backdrop-blur-xl border-b border-transparent'
                  }`}
    >
      <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">

        {/* ── Logo ── */}
        <Link href="/" className="group flex items-center gap-3 shrink-0">
          <div className="relative w-10 h-10 md:w-11 md:h-11 rounded-full overflow-hidden group-hover:scale-105 transition-transform duration-300 shadow-[0_0_15px_rgba(37,99,235,0.45)] group-hover:shadow-[0_0_25px_rgba(37,99,235,0.7)] ring-1 ring-white/10 group-hover:ring-blue-500/50">
            <Image 
              src="/logo.png" 
              alt="CoreAnime Logo" 
              fill
              sizes="(max-width: 768px) 40px, 48px"
              className="object-cover transition-all duration-300"
            />
          </div>
          <span className="hidden sm:block text-[16px] md:text-[18px] font-black italic uppercase tracking-tight text-white leading-none">
            Core<span className="text-blue-500">Anime</span>
          </span>
        </Link>

        {/* ── Nav links ── */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar flex-grow justify-center">
          {SECTORS.map((s) => {
            const active = pathname === s.id;
            return (
              <Link
                key={s.id}
                href={s.id}
                className={`relative px-3 md:px-4 py-2 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-[0.18em] md:tracking-[0.22em] whitespace-nowrap transition-all duration-200 ${
                  active
                    ? 'text-blue-400 bg-blue-600/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                {s.label}
                {active && (
                  <span
                    className="absolute bottom-0.5 left-3 right-3 h-[2px] rounded-full
                               bg-blue-500 shadow-[0_0_8px_rgba(37,99,235,0.8)]
                               animate-in fade-in zoom-in-50 duration-300"
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* ── Auth Button ── */}
        <div className="shrink-0 pl-2 border-l border-white/10">
          {isLoggedIn ? (
            <Link
              href="/login"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all duration-300"
            >
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Account
            </Link>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl bg-white text-black text-[9px] font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all duration-300 shadow-lg active:scale-95"
            >
              Login
            </Link>
          )}
        </div>

      </div>
    </nav>
  );
}