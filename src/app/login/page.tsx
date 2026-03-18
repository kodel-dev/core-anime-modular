'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function LoginPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const hasToken = document.cookie.includes('da_access_token');
    setIsLoggedIn(hasToken);
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#060910] text-white flex flex-col overflow-hidden">
      <Navbar />

      {/* Background dekoratif */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        {/* Radial glow kiri */}
        <div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #ec4899 0%, transparent 65%)' }}
        />
        {/* Radial glow kanan bawah */}
        <div
          className="absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 65%)' }}
        />
      </div>

      <main className="flex-grow flex items-center justify-center px-4 pt-20 pb-10 relative z-10">
        <div
          className="w-full max-w-[420px]"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.5s ease, transform 0.5s ease',
          }}
        >
          {/* Card */}
          <div
            className="relative overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, rgba(14,19,32,0.95) 0%, rgba(8,11,18,0.98) 100%)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '1.75rem',
              boxShadow: '0 40px 80px -20px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)',
            }}
          >
            {/* Garis aksen atas */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, #ec4899 40%, #f472b6 60%, transparent 100%)',
              }}
            />

            <div className="p-8 sm:p-10">
              {/* Header brand */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: '#ec4899', boxShadow: '0 0 10px #ec4899' }}
                  />
                  <span
                    className="text-[9px] font-black uppercase tracking-[0.4em]"
                    style={{ color: '#ec4899' }}
                  >
                    CoreAnime · Kodel Dev
                  </span>
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: '#ec4899', boxShadow: '0 0 10px #ec4899' }}
                  />
                </div>

                <h1
                  className="text-4xl sm:text-5xl font-black uppercase leading-none mb-2"
                  style={{ letterSpacing: '-0.03em', fontStyle: 'italic' }}
                >
                  Visual{' '}
                  <span
                    className="text-transparent bg-clip-text"
                    style={{ backgroundImage: 'linear-gradient(135deg, #f472b6, #ec4899, #be185d)' }}
                  >
                    Vault
                  </span>
                </h1>
                <p className="text-[10px] text-gray-600 uppercase tracking-[0.3em] font-bold">
                  Galeri Karya Seni Digital Anime
                </p>
              </div>

              {/* Divider */}
              <div
                className="h-px mb-8"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }}
              />

              {isLoggedIn ? (
                /* ── Status Login ── */
                <div className="space-y-3">
                  <div
                    className="flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-2xl text-sm font-bold mb-6"
                    style={{
                      background: 'rgba(34,197,94,0.08)',
                      border: '1px solid rgba(34,197,94,0.2)',
                      color: '#4ade80',
                    }}
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                    </span>
                    Sesi Aktif · Kamu sudah masuk
                  </div>

                  <a
                    href="/waifu"
                    className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest text-black transition-all active:scale-[0.98]"
                    style={{
                      background: 'white',
                      boxShadow: '0 8px 24px -8px rgba(255,255,255,0.3)',
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Buka Gallery
                  </a>

                  <a
                    href="/api/auth/logout"
                    className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all active:scale-[0.98]"
                    style={{
                      background: 'rgba(239,68,68,0.08)',
                      border: '1px solid rgba(239,68,68,0.2)',
                      color: '#f87171',
                    }}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Keluar dari Akun
                  </a>
                </div>
              ) : (
                /* ── Belum Login ── */
                <div className="space-y-5">
                  {/* Fitur highlight */}
                  <div className="grid grid-cols-3 gap-2 mb-6">
                    {[
                      { icon: '🎨', label: 'Galeri Digital' },
                      { icon: '🔞', label: 'Konten 18+' },
                      { icon: '⬇️', label: 'Unduh HD' },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex flex-col items-center gap-1.5 py-3 rounded-xl"
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.05)',
                        }}
                      >
                        <span className="text-lg">{item.icon}</span>
                        <span className="text-[9px] text-gray-600 font-bold uppercase tracking-wider text-center">
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  <p className="text-gray-500 text-xs leading-relaxed text-center">
                    Masuk untuk mengakses koleksi lengkap karya seni digital anime, konten eksklusif, dan fitur unduh resolusi tinggi.
                  </p>

                  {/* Tombol Login */}
                  <a
                    href="/api/auth/login"
                    className="group relative flex items-center justify-center gap-3 w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest text-white transition-all active:scale-[0.97] overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
                      boxShadow: '0 8px 32px -8px rgba(236,72,153,0.6)',
                    }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px -8px rgba(236,72,153,0.8)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px -8px rgba(236,72,153,0.6)')}
                  >
                    {/* Shimmer effect */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)',
                        transform: 'translateX(-100%)',
                        animation: 'shimmer 2s infinite',
                      }}
                    />
                    <svg className="w-4 h-4 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span className="relative z-10">Masuk ke Visual Vault</span>
                    <svg className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </a>

                  {/* Fine print */}
                  <p className="text-center text-[9px] text-gray-700 font-bold uppercase tracking-[0.25em]">
                    OAuth2 Secure · CoreAnime · Kodel Dev
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Label bawah card */}
          <p className="text-center mt-5 text-[9px] text-gray-700 font-bold uppercase tracking-[0.3em]">
            © {new Date().getFullYear()} CoreAnime · Visual Vault · Kodel Dev
          </p>
        </div>
      </main>

      <Footer />

      <style>{`
        @keyframes shimmer {
          0%   { transform: translateX(-100%); opacity: 0; }
          50%  { opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }
      `}</style>
    </div>
  );
}