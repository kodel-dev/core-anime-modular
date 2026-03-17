'use client';

import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#060910] border-t border-white/[0.05] pt-24 pb-12 px-6">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-white shadow-[0_0_30px_rgba(79,70,229,0.3)]">
                C
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tighter italic text-white">
                Core<span className="text-indigo-500">Anime</span>
              </h2>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-sm mb-8 font-medium">
              Platform eksplorasi anime generasi mutakhir. Didukung oleh <span className="text-gray-300 font-bold">Kodel Core Engine</span> untuk akses arsip media global yang komprehensif dan efisien.
            </p>
            <div className="flex gap-6">
              <a href="https://github.com/kodel-dev" target="_blank" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 hover:text-indigo-500 transition-all">GitHub</a>
              <a href="#" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 hover:text-indigo-500 transition-all">Instagram</a>
              <a href="#" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 hover:text-indigo-500 transition-all">Discord</a>
            </div>
          </div>

          <div>
            <h3 className="text-white text-xs font-black uppercase tracking-[0.4em] mb-8 opacity-80">Navigation</h3>
            <ul className="space-y-4">
              <li><a href="#" className="text-sm text-gray-500 hover:text-indigo-400 transition-colors font-medium">Discovery</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-indigo-400 transition-colors font-medium">Archive Studio</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-indigo-400 transition-colors font-medium">Manga Reader</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-indigo-400 transition-colors font-medium">Media Gallery</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white text-xs font-black uppercase tracking-[0.4em] mb-8 opacity-80">Architecture</h3>
            <ul className="space-y-4">
              <li className="flex flex-col">
                <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">v3.2.0</span>
                <span className="text-[10px] text-gray-600 italic">Stable Enterprise Build</span>
              </li>
              <li className="flex flex-col">
                <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Integration</span>
                <span className="text-[10px] text-gray-600 italic">Kodel Core Ecosystem</span>
              </li>
              <li className="flex flex-col">
                <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Engineer</span>
                <span className="text-[10px] text-gray-600 italic">Developed by kodel-dev</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-white/[0.03] flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-700">
            © {currentYear} <span className="text-gray-500 italic">kodel-dev labs</span>. Hak Cipta Dilindungi.
          </p>
          <div className="flex items-center gap-3 bg-white/[0.02] px-4 py-2 rounded-full border border-white/[0.05]">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-500">System Status: Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}