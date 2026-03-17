'use client';

import React, { useState, useEffect } from 'react';

interface WaifuCardProps {
  image: { url: string; id?: string; };
  priority?: boolean;
  onToggleModal?: (isOpen: boolean) => void;
}

export default function WaifuCard({ image, priority, onToggleModal }: WaifuCardProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [imgDimensions, setImgDimensions] = useState({ w: 0, h: 0 });

  useEffect(() => {
    if (isPreviewOpen) {
      document.body.style.overflow = 'hidden';
      onToggleModal?.(true); 
      
      const img = new Image();
      img.onload = () => setImgDimensions({ w: img.width, h: img.height });
      img.src = image.url;
    } else {
      document.body.style.overflow = 'unset';
      onToggleModal?.(false);
    }

    return () => { 
      document.body.style.overflow = 'unset'; 
      onToggleModal?.(false);
    };
    // Hapus onToggleModal dari sini agar jumlah array selalu 2 (Tetap: isPreviewOpen & image.url)
  }, [isPreviewOpen, image.url]); 

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const downloadUrl = `/api/download?url=${encodeURIComponent(image.url)}`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `core-anime-${Date.now()}.png`;
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
      {/* Kartu Thumbnail */}
      <div 
        onClick={() => setIsPreviewOpen(true)}
        className="group relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-[#0b0e14] cursor-zoom-in border border-white/5 hover:border-blue-500/50 transition-all shadow-xl"
      >
        <img 
          src={image.url} 
          alt="Preview"
          className="h-full w-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
           <p className="text-[10px] font-bold text-white uppercase tracking-widest">Detail</p>
        </div>
      </div>

      {/* Modal Detail */}
      {isPreviewOpen && (
        <div 
          className="fixed inset-0 z-[100000] flex flex-col bg-[#060910] animate-in fade-in duration-300"
          onClick={() => setIsPreviewOpen(false)}
        >
          {/* Tombol Tutup */}
          <button 
            className="absolute top-6 right-6 z-[100001] w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-red-500 rounded-full text-white transition-all backdrop-blur-md border border-white/10"
            onClick={() => setIsPreviewOpen(false)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto no-scrollbar pt-20 lg:pt-0">
            {/* Sisi Gambar */}
            <div className="w-full lg:w-[60%] h-[60vh] lg:h-full flex items-center justify-center p-6 lg:p-12">
              <img 
                src={image.url} 
                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border border-white/5 animate-in zoom-in-95 duration-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Sisi Info */}
            <div 
              className="flex-1 p-8 sm:p-12 lg:flex lg:flex-col lg:justify-center lg:border-l lg:border-white/5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="max-w-md mx-auto lg:mx-0 w-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-1 w-8 bg-blue-600 rounded-full"></div>
                  <span className="text-blue-500 text-[10px] font-black uppercase tracking-[0.3em]">Detail Gambar</span>
                </div>

                <h2 className="text-4xl sm:text-5xl font-black italic text-white uppercase tracking-tighter mb-6 leading-none">
                  Info <span className="text-blue-600">Koleksi</span>
                </h2>
                
                <div className="grid grid-cols-2 gap-10 border-t border-white/5 pt-10 mb-12">
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase mb-2">Resolusi</p>
                    <p className="text-lg font-mono text-gray-200">{imgDimensions.w} x {imgDimensions.h}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase mb-2">Status</p>
                    <p className="text-lg font-mono text-emerald-400">Tersedia</p>
                  </div>
                </div>

                <button 
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {isDownloading ? 'Menyimpan...' : 'Simpan Gambar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}