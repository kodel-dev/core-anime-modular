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

// Komponen Card Terpisah
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
      // Menggunakan penamaan variabel yang konsisten untuk menghindari ReferenceError
      if (moduleName === 'anime') {
        const response = await fetchAnimeData('populer');
        setData(response.data || []);
      } else if (moduleName === 'manga') {
        const response = await getTrendingManga();
        setData(response || []);
      } else if (moduleName === 'waifu') {
        const response = await getWaifuGallery();
        setData(response || []); // Memperbaiki error 'res is not defined'
      } else if (moduleName === 'ghibli') {
        const response = await getGhibliMovies();
        setData(response.data || []);
      }
    } catch (err) {
      console.error("Critical Module Load Error:", err);
      setData([]); // Reset data jika terjadi error agar tidak crash saat .map()
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    loadModule('anime'); 
  }, []);

  return (
    <div className="min-h-screen bg-[#060910] text-gray-100 flex flex-col selection:bg-blue-600/30">
      {/* Navbar dengan fungsi filter antar module */}
      <Navbar onFilter={(m) => loadModule(m)} onSearch={() => {}} />

      {/* Komponen Detail Overlay */}
      {selectedAnime && (
        <AnimeDetail 
          anime={selectedAnime} 
          onClose={() => setSelectedAnime(null)} 
        />
      )}

      <main className="container mx-auto px-6 pt-44 pb-20 flex-grow">
        <div className="flex items-center gap-5 mb-14">
          <div className="h-12 w-2 bg-blue-600 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.4)]"></div>
          <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter">
            {activeModule} Database
          </h2>
        </div>

        {loading ? (
          <div className="py-40 text-center animate-pulse">
            <p className="text-[10px] font-black tracking-[0.6em] uppercase opacity-30">
              Synchronizing {activeModule.toUpperCase()} Engine...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {/* Render Anime & Ghibli (Struktur Data MAL/Jikan) */}
            {(activeModule === 'anime' || activeModule === 'ghibli') && data.map((item, idx) => (
              <AnimeCard 
                key={item.mal_id || idx} 
                anime={item} 
                onWatch={() => setSelectedAnime(item)} 
              />
            ))}

            {/* Render Manga (Struktur Data Kitsu) */}
            {activeModule === 'manga' && data.map((item, idx) => (
              <MangaCard key={item.id || idx} manga={item} />
            ))}

            {/* Render Waifu (Struktur Data Gallery) */}
            {activeModule === 'waifu' && data.map((item, idx) => (
              <WaifuCard key={item.id || idx} image={item} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}