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
      className={`fixed top-0 inset-x-0 z-[100] transition-all duration-500
                  ${scrolled
                    ? 'bg-black/70 backdrop-blur-3xl border-b border-blue-500/20 shadow-[0_8px_32px_rgba(37,99,235,0.15)]'
                    : 'bg-black/40 backdrop-blur-lg border-b border-transparent'
                  }`}
    >
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 h-16 sm:h-18 md:h-20 flex items-center justify-between gap-2 sm:gap-3 md:gap-6">

        {/* ── Logo ── */}
        <Link href="/" className="group flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg overflow-hidden transition-all duration-300 group-hover:scale-110 shadow-[0_0_15px_rgba(37,99,235,0.4)] group-hover:shadow-[0_0_25px_rgba(37,99,235,0.7)] ring-2 ring-blue-500/30 group-hover:ring-blue-500/60 flex-shrink-0">
            <Image 
              src="/logo.png" 
              alt="CoreAnime Logo" 
              fill
              sizes="(max-width: 640px) 36px, (max-width: 768px) 40px, 48px"
              className="object-cover"
            />
          </div>
          <div className="hidden sm:flex flex-col leading-tight min-w-0">
            <span className="text-xs sm:text-sm md:text-lg font-black italic uppercase tracking-tight text-white">
              Core<span className="text-blue-400">Anime</span>
            </span>
            <span className="text-[8px] sm:text-[9px] md:text-xs text-gray-500 uppercase tracking-widest">Portal</span>
          </div>
        </Link>

        {/* ── Nav links ── */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar flex-grow justify-center px-2 sm:px-0">
          {SECTORS.map((s) => {
            const active = pathname === s.id;
            return (
              <Link
                key={s.id}
                href={s.id}
                className={`relative px-2.5 sm:px-3 md:px-5 py-1.5 sm:py-2 md:py-2.5 rounded-lg font-bold uppercase text-[9px] sm:text-xs md:text-sm tracking-widest whitespace-nowrap transition-all duration-300 group flex-shrink-0 ${
                  active
                    ? 'text-blue-300 bg-blue-600/15'
                    : 'text-gray-400 hover:text-blue-300 hover:bg-blue-600/10'
                }`}
              >
                {s.label}
                {active && (
                  <span
                    className="absolute -bottom-1 left-1.5 right-1.5 sm:left-2 sm:right-2 h-1 rounded-full
                               bg-gradient-to-r from-blue-500 to-blue-400 shadow-[0_0_10px_rgba(37,99,235,0.8)]
                               animate-in fade-in zoom-in-50 duration-300"
                  />
                )}
                {!active && (
                  <span
                    className="absolute -bottom-1 left-1.5 right-1.5 sm:left-2 sm:right-2 h-0.5 rounded-full
                               bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-0
                               group-hover:opacity-100 transition-opacity duration-300"
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* ── Auth Button ── */}
        <div className="shrink-0 pl-2 sm:pl-3 md:pl-4 border-l border-blue-500/20">
          {isLoggedIn ? (
            <Link
              href="/login"
              className="flex items-center justify-center gap-1.5 sm:gap-2 w-9 h-9 sm:w-10 sm:h-10 md:w-auto md:px-5 md:py-2.5 md:rounded-full rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold uppercase tracking-widest hover:from-blue-500 hover:to-blue-600 hover:shadow-[0_0_20px_rgba(37,99,235,0.6)] transition-all duration-300 group relative shadow-[0_4px_12px_rgba(37,99,235,0.3)]"
              title="Dashboard"
            >
              <div className="md:hidden flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-400 text-blue-900 text-xs font-bold animate-pulse">
                ✓
              </div>
              <span className="hidden md:inline text-xs">Dashboard</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex items-center justify-center px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold text-[10px] sm:text-xs md:text-xs uppercase tracking-widest hover:from-blue-500 hover:to-blue-400 transition-all duration-300 shadow-[0_4px_15px_rgba(37,99,235,0.3)] hover:shadow-[0_6px_25px_rgba(37,99,235,0.5)] active:scale-95 transform whitespace-nowrap"
            >
              <span className="hidden sm:inline">Login</span>
              <span className="sm:hidden">Sign</span>
            </Link>
          )}
        </div>

      </div>
    </nav>
  );
}
