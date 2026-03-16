'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimeDetail from '@/components/AnimeDetail';

// Services
import { fetchAnimeData } from '@/lib/anime-service';
import { getTrendingManga } from '@/lib/manga-service';
import { getWaifuGallery } from '@/lib/waifu-service';
import { getGhibliMovies } from '@/lib/ghibli-service';
import { getNekoGallery } from '@/lib/neko-service';
import { getRandomQuote } from '@/lib/quote-service';

// Components
import AnimeCard from '@/components/Anime/AnimeCard';
import MangaCard from '@/components/Manga/MangaCard';
import WaifuCard from '@/components/Waifu/WaifuCard';
import NekoCard from '@/components/Neko/NekoCard';

export default function CoreAnime() {
  const [activeModule, setActiveModule] = useState('anime');
  const [data, setData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  const [selectedAnime, setSelectedAnime] = useState<any>(null);
  const [quote, setQuote] = useState<any>(null);

  const loadModule = async (moduleName: string) => {
    setLoading(true);
    setActiveModule(moduleName);
    localStorage.setItem('kodel_active_sector', moduleName);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    try {
      let responseData: any[] = [];
      if (moduleName === 'anime') {
        const res = await fetchAnimeData('populer');
        responseData = res.data || [];
      } else if (moduleName === 'manga') {
        responseData = await getTrendingManga();
      } else if (moduleName === 'waifu') {
        responseData = await getWaifuGallery();
      } else if (moduleName === 'nekos') {
        responseData = await getNekoGallery();
      } else if (moduleName === 'ghibli') {
        const res = await getGhibliMovies();
        responseData = res.data || [];
      }
      
      setData(responseData);
      setFilteredData(responseData); // Inisialisasi data filter
      
      const q = await getRandomQuote();
      if (q) setQuote(q);
    } catch (err) {
      console.error("Core Engine Error:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Logika Pencarian Universal
  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredData(data);
      return;
    }
    
    const lowerQuery = query.toLowerCase();
    const filtered = data.filter((item) => {
      // Cek judul anime/ghibli/manga atau tags waifu/neko
      const title = (item.title || item.attributes?.canonicalTitle || "").toLowerCase();
      const tags = item.tags ? item.tags.join(" ").toLowerCase() : "";
      return title.includes(lowerQuery) || tags.includes(lowerQuery);
    });
    setFilteredData(filtered);
  };

  useEffect(() => {
    const savedSector = localStorage.getItem('kodel_active_sector');
    loadModule(savedSector || 'anime');
  }, []);

  return (
    <div className="min-h-screen bg-[#060910] text-gray-100 flex flex-col">
      <Navbar onFilter={(m) => loadModule(m)} onSearch={handleSearch} />

      {selectedAnime && (
        <AnimeDetail anime={selectedAnime} onClose={() => setSelectedAnime(null)} />
      )}

      <main className="container mx-auto px-6 pt-44 pb-20 flex-grow">
        {quote && !loading && (
          <div className="mb-20 p-10 bg-blue-600/5 border border-blue-500/10 rounded-[2.5rem] animate-in fade-in duration-1000 shadow-[0_0_40px_rgba(37,99,235,0.05)]">
            <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.5em] mb-4">Core Insights — {quote.anime}</p>
            <p className="text-2xl md:text-3xl font-medium italic text-gray-200 italic leading-relaxed">"{quote.quote}"</p>
            <p className="mt-6 text-sm font-bold text-gray-500 uppercase tracking-widest">— {quote.character}</p>
          </div>
        )}

        <div className="flex items-center gap-6 mb-16">
          <div className="h-12 w-2 bg-blue-600 rounded-full shadow-[0_0_30px_rgba(37,99,235,0.5)]"></div>
          <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter italic">
            {activeModule} <span className="text-blue-600 opacity-50 block md:inline md:text-5xl text-white">Engine</span>
          </h2>
        </div>

        {loading ? (
          <div className="py-40 text-center animate-pulse text-[10px] font-black tracking-[1em] uppercase opacity-20 italic">Initializing Core...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-10">
            {/* Render menggunakan filteredData */}
            {(activeModule === 'anime' || activeModule === 'ghibli') && filteredData.map((item, idx) => (
              <AnimeCard key={item.mal_id || idx} anime={item} onWatch={() => setSelectedAnime(item)} />
            ))}
            {activeModule === 'manga' && filteredData.map((item, idx) => (
              <MangaCard key={item.id || idx} manga={item} />
            ))}
            {activeModule === 'waifu' && filteredData.map((item, idx) => (
              <WaifuCard key={item.id || idx} image={item} />
            ))}
            {activeModule === 'nekos' && filteredData.map((item, idx) => (
              <NekoCard key={item.id || idx} image={item} />
            ))}
          </div>
        )}

        {!loading && filteredData.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-gray-600 uppercase font-black tracking-widest text-xs italic">No data found in current archive</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}