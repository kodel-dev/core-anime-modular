'use client';

import React, { useState, useEffect } from 'react';

interface WaifuCardProps {
  image: {
    url: string;
    id?: string;
  };
  priority?: boolean;
}

export default function WaifuCard({ image, priority }: WaifuCardProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [imgDimensions, setImgDimensions] = useState({ w: 0, h: 0 });

  // Mengambil dimensi asli gambar & lock scroll
  useEffect(() => {
    if (isPreviewOpen) {
      document.body.style.overflow = 'hidden';
      const img = new Image();
      img.onload = () => setImgDimensions({ w: img.width, h: img.height });
      img.src = image.url;
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isPreviewOpen, image.url]);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const downloadUrl = `/api/download?url=${encodeURIComponent(image.url)}`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `core-waifu-${Date.now()}.png`;
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
      {/* Thumbnail Card */}
      <div 
        onClick={() => setIsPreviewOpen(true)}
        className="group relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-gray-900 cursor-zoom-in border border-white/5 transition-all hover:border-blue-500/50 shadow-xl"
      >
        <img 
          src={image.url} 
          alt="Waifu Asset"
          loading={priority ? "eager" : "lazy"}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
           <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em]">Open Archive</p>
        </div>
      </div>

      {/* Professional Detail Modal */}
      {isPreviewOpen && (
        <div 
          className="fixed inset-0 z-[99999] flex flex-col bg-[#060910]/98 backdrop-blur-3xl animate-in fade-in duration-300"
          onClick={() => setIsPreviewOpen(false)}
        >
          {/* Main Layout dengan Padding Top Tinggi agar di bawah Navbar */}
          <div className="flex-grow flex flex-col lg:flex-row pt-32 lg:pt-36 pb-10 overflow-hidden">
            
            {/* Left Side: Image Preview */}
            <div className="flex-[1.5] h-full flex items-center justify-center p-4 md:p-12 relative overflow-hidden">
              <img 
                src={image.url} 
                className="max-w-full max-h-full object-contain rounded-lg shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/5 animate-in zoom-in-95 duration-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Right Side: Professional Details Panel */}
            <div 
              className="flex-1 bg-white/[0.02] border-l border-white/5 p-8 md:p-12 flex flex-col justify-between overflow-y-auto no-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-10">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-[2px] w-8 bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.8)]"></div>
                    <span className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em]">Metadata Analysis</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black italic text-white uppercase tracking-tighter leading-none mb-4">
                    Neural <span className="text-blue-600">Waifu</span>
                  </h2>
                  <p className="text-gray-500 text-xs leading-relaxed italic opacity-70">
                    High-fidelity asset retrieved from Core Gallery. Neural processing stable. Verified for collectible status.
                  </p>
                </div>

                {/* Technical Specs */}
                <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/5">
                  <div className="space-y-1">
                    <p className="text-[9px] text-gray-600 uppercase font-bold tracking-[0.2em]">Resolution</p>
                    <p className="text-sm font-mono text-gray-200">{imgDimensions.w} x {imgDimensions.h}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] text-gray-600 uppercase font-bold tracking-[0.2em]">Source</p>
                    <p className="text-sm font-mono text-gray-200">WAIFU_PICS_API</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] text-gray-600 uppercase font-bold tracking-[0.2em]">Format</p>
                    <p className="text-sm font-mono text-gray-200">IMAGE/PNG</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] text-gray-600 uppercase font-bold tracking-[0.2em]">Class</p>
                    <p className="text-sm font-mono text-gray-200">SFW_GALLERY</p>
                  </div>
                </div>

                {/* Tags */}
                <div className="pt-8">
                  <p className="text-[9px] text-gray-600 uppercase font-bold tracking-[0.2em] mb-4">Classifiers</p>
                  <div className="flex flex-wrap gap-2">
                    {['WAIFU', 'NEURAL_HD', 'COLLECTIBLE', 'VERIFIED'].map(tag => (
                      <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[8px] font-bold text-gray-400">#{tag}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4 pt-12 border-t border-white/5 mt-10">
                <button 
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 shadow-[0_10px_40px_rgba(37,99,235,0.3)] hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                >
                  {isDownloading ? 'Syncing...' : 'Download Waifu Asset'}
                </button>
                <button 
                  onClick={() => setIsPreviewOpen(false)}
                  className="w-full bg-transparent hover:bg-white/5 text-gray-500 hover:text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] transition-all border border-white/5"
                >
                  Close [×]
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}