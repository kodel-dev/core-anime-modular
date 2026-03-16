'use client';

import React from 'react';
import { Anime } from '@/types/anime';
import DetailHeader from './DetailHeader';
import DetailSidebar from './DetailSidebar';
import DetailContent from './DetailContent';

interface AnimeDetailProps {
  anime: Anime;
  onClose: () => void;
}

export default function AnimeDetail({ anime, onClose }: AnimeDetailProps) {
  const genres = anime.genres || [];
  const studios = anime.studios || [];

  return (
    <div className="fixed inset-0 z-[100] bg-[#060910] overflow-y-auto animate-in fade-in duration-300">
      <DetailHeader 
        imageUrl={anime.images.jpg.large_image_url} 
        onClose={onClose} 
      />

      <div className="container mx-auto px-6 -mt-32 relative z-10 pb-20">
        <div className="flex flex-col lg:flex-row gap-12">
          <DetailSidebar 
            imageUrl={anime.images.jpg.large_image_url} 
            title={anime.title} 
            score={anime.score} 
          />
          
          <DetailContent 
            title={anime.title}
            genres={genres}
            synopsis={anime.synopsis}
            meta={{
              status: anime.status || 'Active',
              type: anime.type || 'Media',
              rating: anime.rating || 'G',
              studio: studios[0]?.name || 'Global Provider'
            }}
          />
        </div>
      </div>
    </div>
  );
}