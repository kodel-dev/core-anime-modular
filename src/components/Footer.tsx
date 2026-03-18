'use client';

import React from 'react';
import Image from 'next/image';

const NAV_LINKS = [
  { label: 'Temukan Anime', href: '/' },
  { label: 'Koleksi Manga', href: '/manga' },
  { label: 'Galeri Visual', href: '/waifu' },
  { label: 'Jadwal Tayang', href: '/jadwal' },
];

const SOCIAL_LINKS = [
  {
    label: 'GitHub',
    href: 'https://github.com/kodel-dev',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
      </svg>
    ),
    color: 'hover:text-white hover:border-white/30',
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/notyur_devboy/',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>
    ),
    color: 'hover:text-pink-400 hover:border-pink-500/40',
  },
  {
    label: 'Discord',
    href: 'https://discord.gg/6ZnNcTJxer',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.032.055a19.9 19.9 0 005.993 3.03.077.077 0 00.084-.028c.462-.63.874-1.295 1.226-1.995a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
      </svg>
    ),
    color: 'hover:text-indigo-400 hover:border-indigo-500/40',
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#060910] overflow-hidden">
      {/* Ambient glow background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[300px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[250px] rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      {/* Top border dengan gradient */}
      <div className="h-px w-full"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.3) 30%, rgba(99,102,241,0.3) 70%, transparent)' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-20 pb-10">

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 sm:gap-12 mb-12 sm:mb-16">

          {/* Brand — col span 5 */}
          <div className="lg:col-span-5 space-y-6">
            {/* Logo + nama */}
            <div className="flex items-center gap-3 group w-fit cursor-pointer">
              <div className="relative w-11 h-11 rounded-full overflow-hidden ring-1 ring-white/10 group-hover:ring-indigo-500/60 transition-all duration-300 group-hover:scale-105 shadow-[0_0_24px_rgba(99,102,241,0.25)]">
                <Image src="/logo.png" alt="CoreAnime" fill sizes="44px" className="object-cover" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tighter italic leading-none text-white group-hover:text-indigo-300 transition-colors">
                  Core<span className="text-indigo-500">Anime</span>
                </h2>
                <p className="text-[9px] text-gray-600 font-black uppercase tracking-[0.3em] mt-0.5">
                  by kodel-dev
                </p>
              </div>
            </div>

            {/* Tagline */}
            <p className="text-gray-500 text-sm leading-relaxed max-w-[340px] font-medium">
              Portal anime dan manga buatan anak Indonesia — temukan, baca, dan nikmati ribuan judul favoritmu di satu tempat.
            </p>

            {/* Social buttons */}
            <div className="flex gap-3">
              {SOCIAL_LINKS.map(social => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className={`w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 border border-white/[0.07] transition-all duration-200 active:scale-95 ${social.color}`}
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                >
                  {social.icon}
                </a>
              ))}
            </div>

            {/* Status badge */}
            <div className="flex items-center gap-2.5 w-fit px-3.5 py-2 rounded-full border border-white/[0.06]"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[10px] font-bold text-gray-500 tracking-wide">
                Semua layanan berjalan normal
              </span>
            </div>
          </div>

          {/* Spacer lg */}
          <div className="hidden lg:block lg:col-span-1" />

          {/* Navigasi — col span 3 */}
          <div className="lg:col-span-3">
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-600 mb-5 sm:mb-6">
              Halaman
            </p>
            <ul className="space-y-3">
              {NAV_LINKS.map(item => (
                <li key={item.label}>
                  <a href={item.href}
                    className="group flex items-center gap-2.5 text-gray-500 hover:text-white transition-colors duration-200 text-sm font-medium">
                    <span className="w-1 h-1 rounded-full bg-indigo-500/40 group-hover:bg-indigo-400 transition-colors flex-shrink-0" />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Info — col span 3 */}
          <div className="lg:col-span-3">
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-600 mb-5 sm:mb-6">
              Info
            </p>
            <ul className="space-y-4">
              <li>
                <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-1">Versi</p>
                <p className="text-xs text-gray-400 font-semibold">3.2.0 — Stabil</p>
              </li>
              <li>
                <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-1">Developer</p>
                <a href="https://github.com/kodel-dev" target="_blank" rel="noreferrer"
                  className="text-xs text-gray-400 font-semibold hover:text-indigo-400 transition-colors">
                  @kodel-dev
                </a>
              </li>
              <li>
                <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-1">Komunitas</p>
                <a href="https://discord.gg/6ZnNcTJxer" target="_blank" rel="noreferrer"
                  className="text-xs text-indigo-400 font-semibold hover:text-indigo-300 transition-colors flex items-center gap-1.5">
                  Gabung Discord
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="pt-6 sm:pt-8 border-t border-white/[0.04] flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
          <p className="text-[10px] text-gray-700 font-bold tracking-[0.2em] uppercase text-center sm:text-left">
            © {currentYear} CoreAnime —{' '}
            <span className="text-gray-600 italic not-italic font-medium normal-case tracking-normal">
              Dibuat untuk komunitas anime Indonesia
            </span>
          </p>
          <p className="text-[10px] text-gray-700 font-bold tracking-[0.15em] uppercase">
            kodel-dev
          </p>
        </div>

      </div>
    </footer>
  );
}