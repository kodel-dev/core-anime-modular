'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const SECTORS = [
  { id: '/',       label: 'Discovery' },
  { id: '/manga',  label: 'Reading'   },
  { id: '/waifu',  label: 'Gallery'   },
  { id: '/neko',   label: 'Neko'      },
];

export default function Navbar() {
  const pathname  = usePathname();
  const [scrolled, setScrolled] = useState(false);

  /* subtle background shift on scroll */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
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
        <Link href="/" className="group flex items-center gap-2.5 shrink-0">
          <div
            className="w-8 h-8 md:w-9 md:h-9 rounded-lg md:rounded-xl
                       bg-blue-600 flex items-center justify-center
                       font-black text-[13px] text-white
                       shadow-[0_0_18px_rgba(37,99,235,0.45)]
                       group-hover:scale-110 group-hover:shadow-[0_0_24px_rgba(37,99,235,0.65)]
                       transition-all duration-200"
          >
            C
          </div>
          <span className="hidden sm:block text-[15px] md:text-[17px] font-black italic uppercase tracking-tight text-white leading-none">
            Core<span className="text-blue-500">Anime</span>
          </span>
        </Link>

        {/* ── Nav links ── */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {SECTORS.map((s) => {
            const active = pathname === s.id;
            return (
              <Link
                key={s.id}
                href={s.id}
                className={`relative px-3 md:px-4 py-2 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-[0.18em] md:tracking-[0.22em] whitespace-nowrap transition-all duration-200 ${
                  active
                    ? 'text-blue-400 bg-blue-600/10'
                    : 'text-gray-500 hover:text-gray-200 hover:bg-white/[0.05]'
                }`}
              >
                {s.label}
                {active && (
                  <span
                    className="absolute bottom-0.5 left-3 right-3 h-[2px] rounded-full
                               bg-blue-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]
                               animate-in fade-in zoom-in-50 duration-300"
                  />
                )}
              </Link>
            );
          })}
        </div>

      </div>
    </nav>
  );
}