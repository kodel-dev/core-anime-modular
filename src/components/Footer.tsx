'use client';

import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#060910] border-t border-gray-800 pt-20 pb-10 px-6">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                C
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tighter italic text-white">
                Core<span className="text-blue-500">Anime</span>
              </h2>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-sm mb-6">
              The next generation of anime discovery. Built on the <span className="text-gray-300 font-bold">Kodel Core Engine</span> for seamless exploration of global media archives.
            </p>
            <div className="flex gap-4">
              <a href="https://github.com/kodel-dev" target="_blank" className="text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-blue-500 transition-colors">GitHub</a>
              <a href="#" className="text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-blue-500 transition-colors">Instagram</a>
              <a href="#" className="text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-blue-500 transition-colors">Discord</a>
            </div>
          </div>

          <div>
            <h3 className="text-white text-xs font-black uppercase tracking-[0.3em] mb-6">Sectors</h3>
            <ul className="space-y-4">
              <li><a href="#" className="text-sm text-gray-500 hover:text-blue-400 transition-colors">Discovery</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-blue-400 transition-colors">Studio</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-blue-400 transition-colors">Reading</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-blue-400 transition-colors">Gallery</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white text-xs font-black uppercase tracking-[0.3em] mb-6">System</h3>
            <ul className="space-y-4">
              <li><span className="text-sm text-gray-500 italic">v3.0.0 Stable Build</span></li>
              <li><span className="text-sm text-gray-500 italic">Kodel Core Integrated</span></li>
              <li><span className="text-sm text-gray-500 italic">Developed by kodel-dev</span></li>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-700">
            © {currentYear} <span className="text-gray-500 italic">kodel-dev</span>. All Rights Reserved.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-700">System Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}