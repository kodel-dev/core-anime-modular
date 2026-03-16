'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimeDetail from '@/components/AnimeDetail';

// Services Terpisah
import { fetchAnimeData } from '@/lib/anime-service';
import { getTrendingManga } from '@/lib/manga-service';
import { getWaifuGallery } from '@/lib/waifu-service';
import { getGhibliMovies } from '@/lib/ghibli-service';
import { getNekoGallery } from '@/lib/neko-service'; // Import service baru

// Komponen Visual Terpisah
import AnimeCard from '@/components/Anime/AnimeCard';
import MangaCard from '@/components/Manga/MangaCard';
import WaifuCard from '@/components/Waifu/WaifuCard';

export default function CoreAnime() {
  const [activeModule, setActiveModule] = useState('anime');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnime, setSelectedAnime] = useState<any>(null);

  const loadModule = async (moduleName: string) => {
    setLoading(true);
    setActiveModule(moduleName);
    try {
      let responseData: any[] = [];

      if (moduleName === 'anime') {
        const response = await fetchAnimeData('populer');
        responseData = response.data || [];
      } else if (moduleName === 'manga') {
        responseData = await getTrendingManga();
      } else if (moduleName === 'waifu') {
        responseData = await getWaifuGallery();
      } else if (moduleName === 'nekos') {
        // Panggil service yang baru saja kita pisahkan
        responseData = await getNekoGallery();
      } else if (moduleName === 'ghibli') {
        const response = await getGhibliMovies();
        responseData = response.data || [];
      }
      
      setData(responseData);
    } catch (err) {
      console.error("Critical Module Load Error:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadModule('anime'); }, []);

  return (
    <div className="min-h-screen bg-[#060910] text-gray-100 flex flex-col selection:bg-blue-600/30">
      <Navbar onFilter={(m) => loadModule(m)} onSearch={() => {}} />

      {selectedAnime && (
        <AnimeDetail anime={selectedAnime} onClose={() => setSelectedAnime(null)} />
      )}

      <main className="container mx-auto px-6 pt-44 pb-20 flex-grow">
        <div className="flex items-center gap-5 mb-14">
          <div className="h-12 w-2 bg-blue-600 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.4)]"></div>
          <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter italic text-white">
            {activeModule} <span className="text-blue-600 opacity-50 block md:inline md:text-4xl">Engine</span>
          </h2>
        </div>

        {loading ? (
          <div className="py-40 text-center animate-pulse">
            <p className="text-[10px] font-black tracking-[0.8em] uppercase opacity-30 italic">Initializing Kodel Core...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {(activeModule === 'anime' || activeModule === 'ghibli') && data.map((item, idx) => (
              <AnimeCard key={item.mal_id || idx} anime={item} onWatch={() => setSelectedAnime(item)} />
            ))}

            {activeModule === 'manga' && data.map((item, idx) => (
              <MangaCard key={item.id || idx} manga={item} />
            ))}

            {/* Modul Gallery & Nekos dirender di sini */}
            {(activeModule === 'waifu' || activeModule === 'nekos') && data.map((item, idx) => (
              <WaifuCard key={item.id || idx} image={item} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}