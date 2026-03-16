'use client';

import React from 'react';

interface DetailHeaderProps {
  imageUrl: string;
  onClose: () => void;
}

export default function DetailHeader({ imageUrl, onClose }: DetailHeaderProps) {
  return (
    <div className="relative h-[45vh] w-full">
      <img src={imageUrl} alt="" className="w-full h-full object-cover opacity-10 blur-2xl" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#060910] via-[#060910]/70 to-transparent" />
      <button 
        onClick={onClose} 
        className="absolute top-8 left-8 bg-white/5 hover:bg-red-600 p-4 rounded-full backdrop-blur-xl transition-all active:scale-90 z-50 shadow-2xl"
      >
        ✕
      </button>
    </div>
  );
}