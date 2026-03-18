'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function LoginPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Mengecek apakah cookie token tersedia
    const hasToken = document.cookie.includes('da_access_token');
    setIsLoggedIn(hasToken);
  }, []);

  return (
    <div className="min-h-screen bg-[#060910] text-white flex flex-col">
      <Navbar />

      <main className="flex-grow flex items-center justify-center px-6 pt-20">
        <div className="relative w-full max-w-md">
          {/* Efek Cahaya Latar (Aesthetic Glow) */}
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-600/20 blur-[80px] rounded-full" />
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-cyan-600/20 blur-[80px] rounded-full" />

          <div className="relative bg-white/5 border border-white/10 backdrop-blur-2xl p-10 rounded-[2.5rem] shadow-2xl text-center">
            <div className="mb-8">
              <h1 className="text-3xl font-black italic uppercase tracking-tighter">
                Visual <span className="text-blue-500">Vault</span>
              </h1>
              <p className="text-gray-500 text-xs mt-2 uppercase tracking-[0.2em]">Authentication</p>
            </div>

            {isLoggedIn ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-green-400 text-sm mb-6 flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                  Sesi Aktif
                </div>
                
                <a
                  href="/waifu"
                  className="block w-full bg-white text-black font-black py-4 rounded-2xl transition-all active:scale-95 text-sm uppercase tracking-widest"
                >
                  Masuk ke Gallery
                </a>

                <a
                  href="/api/auth/logout"
                  className="block w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold py-4 rounded-2xl transition-all border border-red-500/20 text-sm"
                >
                  Logout Account
                </a>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-gray-400 text-sm leading-relaxed">
                  Hubungkan akun DeviantArt Anda untuk mengakses koleksi karya seni digital di Boston Point.
                </p>

                <a
                  href="/api/auth/login"
                  className="group relative block w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl transition-all active:scale-95 shadow-lg shadow-blue-500/25 overflow-hidden text-sm uppercase tracking-widest"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    Login with DeviantArt
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </a>
                
                <p className="text-[10px] text-gray-600 uppercase tracking-widest">
                  Secure OAuth2 Connection
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}