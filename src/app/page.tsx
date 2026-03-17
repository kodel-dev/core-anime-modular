'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimeCard from '@/components/Anime/AnimeCard';
import AnimeDetail from '@/components/AnimeDetail';
import { fetchAnimeData } from '@/lib/anime-service';

export default function DiscoveryPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedAnime, setSelectedAnime] = useState<any>(null);
  const isFetching = useRef(false);

  const loadAnime = useCallback(async (isMore = false) => {
    if (isFetching.current) return;
    isFetching.current = true;
    const nextPage = isMore ? page + 1 : 1;
    
    if (isMore) setLoadingMore(true);
    else setLoading(true);

    try {
      const res = await fetchAnimeData('populer', { page: nextPage });
      const newData = res.data || [];
      setData(prev => isMore ? [...prev, ...newData] : newData);
      setPage(nextPage);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isFetching.current = false;
    }
  }, [page]);

  useEffect(() => {
    loadAnime();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 1000 && !loading && !loadingMore) {
        loadAnime(true);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, loadingMore, loadAnime]);

  return (
    <div className="min-h-screen bg-[#060910] text-gray-100 flex flex-col">
      <Navbar />
      
      <main className="container mx-auto px-6 pt-40 pb-20 flex-grow relative z-10">
        <div className="flex items-center gap-6 mb-16">
          <div className="h-12 w-2 bg-blue-600 rounded-full shadow-[0_0_30px_rgba(37,99,235,0.5)]"></div>
          <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">Discovery <span className="text-blue-600 opacity-50 block md:inline md:text-5xl text-white">Engine</span></h2>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {data.map((item, idx) => (
            <AnimeCard 
              key={`${item.mal_id}-${idx}`} 
              anime={item} 
              onWatch={(a) => setSelectedAnime(a)} 
            />
          ))}
        </div>

        {loadingMore && (
          <div className="mt-20 flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[8px] font-black tracking-[0.5em] text-blue-500 uppercase italic">Expanding Archive...</p>
          </div>
        )}
      </main>

      {/* MODAL BERADA DI LUAR MAIN DAN DIBAWAH NAVBAR SECARA HIERARKI */}
      {selectedAnime && (
        <AnimeDetail 
          anime={selectedAnime} 
          onClose={() => setSelectedAnime(null)} 
        />
      )}

      <Footer />
    </div>
  );
}