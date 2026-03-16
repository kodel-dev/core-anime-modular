'use client';

import React, { useState, useEffect } from 'react';
import { Anime } from '@/types/anime';
import { getAnimeFact } from '@/lib/fact-service'; // Import service yang sudah dipisah
import DetailHeader from './DetailHeader';
import DetailSidebar from './DetailSidebar';
import DetailContent from './DetailContent';
import DetailFacts from './DetailFacts';

interface AnimeDetailProps {
  anime: Anime;
  onClose: () => void;
}

export default function AnimeDetail({ anime, onClose }: AnimeDetailProps) {
  const [facts, setFacts] = useState<any[]>([]);

  useEffect(() => {
    const loadFacts = async () => {
      // Memanggil Kodel Fact Service
      const data = await getAnimeFact(anime.title);
      if (data) {
        setFacts(data);
      }
    };
    loadFacts();
  }, [anime.title]);

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
          
          <div className="flex-1">
            <DetailContent 
              title={anime.title}
              genres={anime.genres || []}
              synopsis={anime.synopsis}
              meta={{
                status: anime.status || 'Active',
                type: anime.type || 'Media',
                rating: anime.rating || 'G',
                studio: anime.studios?.[0]?.name || 'Kodel Provider'
              }}
            />
            
            {/* Menampilkan komponen fakta */}
            <DetailFacts facts={facts} />
          </div>
        </div>
      </div>
    </div>
  );
}