'use client';

import React, { useState, useEffect } from 'react';

interface NekoCardProps {
  image: { url: string; id?: string; };
  priority?: boolean;
  onToggleModal?: (isOpen: boolean) => void;
}

export default function NekoCard({ image, priority, onToggleModal }: NekoCardProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Hanya trigger onToggleModal jika isPreviewOpen BERUBAH
  useEffect(() => {
    if (isPreviewOpen) {
      onToggleModal?.(true);
      document.body.style.overflow = 'hidden';
    } else {
      // Jangan langsung kirim false di sini karena bisa bentrok dengan card lain saat render ulang
      // Biarkan cleanup function yang bekerja
      document.body.style.overflow = 'unset';
    }
  }, [isPreviewOpen]); // Dependensi hanya isPreviewOpen

  // Cleanup function saat komponen di-unmount atau ditutup
  const handleClose = () => {
    setIsPreviewOpen(false);
    onToggleModal?.(false);
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const downloadUrl = `/api/download?url=${encodeURIComponent(image.url)}`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `core-neko-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      window.open(image.url, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <div 
        onClick={() => setIsPreviewOpen(true)}
        className="group relative aspect-square w-full overflow-hidden rounded-2xl bg-[#0b0e14] cursor-zoom-in border border-white/5 transition-all hover:border-blue-500/50 shadow-xl"
      >
        <img src={image.url} alt="Neko" className="h-full w-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
      </div>

      {isPreviewOpen && (
        <div 
          className="fixed inset-0 z-[999999] flex flex-col bg-[#060910] animate-in fade-in duration-300 overflow-y-auto"
          onClick={handleClose}
        >
          <button 
            className="fixed top-6 right-6 z-[1000000] w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-red-500 rounded-full text-white backdrop-blur-md border border-white/10"
            onClick={handleClose}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          <div className="flex-grow flex flex-col lg:flex-row min-h-screen">
            <div className="w-full lg:w-[60%] h-[50vh] lg:h-screen flex items-center justify-center p-6 sm:p-12 sticky top-0 lg:relative z-10 bg-[#060910]">
              <img src={image.url} className="max-w-full max-h-full object-contain rounded-xl shadow-2xl border border-white/5 animate-in zoom-in-95 duration-500" onClick={(e) => e.stopPropagation()} />
            </div>

            <div className="flex-1 bg-[#070a11] lg:bg-white/[0.01] border-t lg:border-t-0 lg:border-l border-white/[0.05] p-8 md:p-12 flex flex-col justify-between z-20" onClick={(e) => e.stopPropagation()}>
              <div className="space-y-12">
                <section>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="h-[2px] w-10 bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.6)]"></div>
                    <span className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em]">Detail Koleksi</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black italic text-white uppercase tracking-tighter leading-none mb-5">Neko <span className="text-blue-600">Asset</span></h2>
                  <p className="text-gray-400 text-xs leading-relaxed font-medium border-l border-white/10 pl-4">Gambar berhasil dimuat dari database galeri.</p>
                </section>

                <div className="grid grid-cols-2 gap-y-10 gap-x-6 pt-10 border-t border-white/[0.05]">
                  <div><p className="text-[10px] text-gray-600 uppercase font-black tracking-widest mb-1">Format</p><p className="text-sm font-mono text-gray-200 uppercase">PNG</p></div>
                  <div><p className="text-[10px] text-gray-600 uppercase font-black tracking-widest mb-1">Status</p><p className="text-sm font-mono text-emerald-400 uppercase">Tersedia</p></div>
                </div>
              </div>

              <div className="space-y-4 pt-12 border-t border-white/[0.05] mt-12 pb-6 lg:pb-0">
                <button onClick={handleDownload} disabled={isDownloading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-50">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  {isDownloading ? 'Menyimpan...' : 'Simpan ke Perangkat'}
                </button>
                <button onClick={handleClose} className="w-full bg-transparent hover:bg-white/[0.03] text-gray-600 hover:text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] transition-all border border-white/[0.05]">Tutup [×]</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}