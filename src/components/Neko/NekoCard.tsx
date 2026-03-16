'use client';

import React, { useState } from 'react';

export default function NekoCard({ image }: { image: any }) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDownloading(true);
    try {
      const downloadUrl = `/api/download?url=${encodeURIComponent(image.url)}`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.click();
    } catch (error) {
      window.open(image.url, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <div 
        onClick={() => setIsPreviewOpen(true)}
        className="group relative aspect-square overflow-hidden rounded-2xl bg-gray-900 cursor-zoom-in border border-gray-800 transition-all hover:border-blue-500/50"
      >
        <img src={image.url} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
      </div>

      {isPreviewOpen && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center bg-[#060910]/95 backdrop-blur-md p-4 animate-in fade-in duration-300"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div className="relative max-w-5xl w-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <div className="absolute -top-14 right-0 flex items-center gap-6">
              <button 
                className="text-white hover:text-blue-500 font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10"
                onClick={handleDownload}
                disabled={isDownloading}
              >
                {isDownloading ? 'Saving...' : 'Save Neko'}
              </button>
              <button className="text-white hover:text-red-500 font-black text-[10px] uppercase tracking-[0.3em]" onClick={() => setIsPreviewOpen(false)}>
                Close [×]
              </button>
            </div>
            <img src={image.url} className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl border border-white/10" />
          </div>
        </div>
      )}
    </>
  );
}