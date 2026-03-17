'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimeCard from '@/components/Anime/AnimeCard';
import { getTrendingAnime, getWeeklyAnimeSchedule } from '@/lib/anime-service';

const DAYS = [
  { id: 'monday', label: 'Senin' },
  { id: 'tuesday', label: 'Selasa' },
  { id: 'wednesday', label: 'Rabu' },
  { id: 'thursday', label: 'Kamis' },
  { id: 'friday', label: 'Jumat' },
  { id: 'saturday', label: 'Sabtu' },
  { id: 'sunday', label: 'Minggu' },
];

const todayIndex = () => {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
};

export default function DiscoveryPage() {
  const [data, setData] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [activeDay, setActiveDay] = useState(DAYS[todayIndex()].id);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // State untuk Load More
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // 1. Fetch Jadwal Anime
  useEffect(() => {
    const loadSchedule = async () => {
      setLoadingSchedule(true);
      try {
        const res = await getWeeklyAnimeSchedule(activeDay);
        // Filter duplikat berdasarkan mal_id
        const uniqueSchedule = Array.from(
          new Map(res.map((item: any) => [item.mal_id, item])).values()
        );
        setSchedule(uniqueSchedule);
      } catch (error) {
        console.error("Gagal memuat jadwal:", error);
      } finally {
        setLoadingSchedule(false);
      }
    };
    loadSchedule();
  }, [activeDay]);

  // 2. Fungsi Load Anime (Katalog Utama)
  const loadAnimeData = useCallback(async (isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);

    const currentPage = isLoadMore ? page + 1 : 0;

    try {
      const res = await getTrendingAnime({ 
        query: searchQuery, 
        page: currentPage 
      });

      if (res && res.length > 0) {
        setData(prev => isLoadMore ? [...prev, ...res] : res);
        setPage(currentPage);
        setHasMore(res.length >= 20); // Jika kurang dari 20, berarti sudah habis
      } else {
        if (!isLoadMore) setData([]);
        setHasMore(false);
      }
    } catch (error) {
      console.error("Gagal memuat anime:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchQuery, page]);

  // Initial load & Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      loadAnimeData(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-[#060910] text-white flex flex-col overflow-x-hidden">
      <Navbar />
      
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-24 md:pt-32 pb-16 space-y-14 md:space-y-20">
        
        {/* SCHEDULER ANIME */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-6 w-1 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.8)]" />
            <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight">
              Jadwal <span className="text-blue-500">Rilis</span>
            </h3>
          </div>

          {/* Day Selector */}
          <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
            {DAYS.map((d) => (
              <button
                key={d.id}
                onClick={() => setActiveDay(d.id)}
                className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 whitespace-nowrap border ${
                  activeDay === d.id 
                    ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]' 
                    : 'bg-white/5 border-white/5 text-gray-500 hover:text-gray-300'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Horizontal Scroll Schedule */}
          <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar snap-x">
            {loadingSchedule ? (
              <div className="w-full py-20 text-center opacity-20 animate-pulse font-black uppercase text-xs tracking-[0.5em]">
                Memuat Jadwal...
              </div>
            ) : schedule.length > 0 ? (
              schedule.map((item, i) => (
                <div key={`${item.mal_id}-${i}`} className="shrink-0 w-[180px] sm:w-[220px] snap-start">
                  <AnimeCard anime={{ 
                    id: item.mal_id,
                    attributes: { 
                      canonicalTitle: item.title, 
                      posterImage: { large: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url },
                      averageRating: item.score ? item.score * 10 : null,
                      status: item.airing ? 'current' : 'finished',
                      synopsis: item.synopsis,
                      startDate: item.aired?.from
                    }
                  }} />
                </div>
              ))
            ) : (
              <div className="w-full py-10 text-center text-gray-600 italic text-sm">
                Tidak ada anime yang rilis hari ini.
              </div>
            )}
          </div>
        </section>

        {/* KATALOG UTAMA */}
        <section className="space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="h-6 w-1 bg-indigo-600 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.8)]" />
              <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight">
                Koleksi <span className="text-indigo-500">Anime</span>
              </h3>
            </div>

            <div className="relative w-full md:max-w-sm group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari anime..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-3.5 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-gray-600"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-500 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6 animate-pulse">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-white/5 rounded-2xl" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
                {data.map((item, i) => (
                  <AnimeCard key={`${item.id}-${i}`} anime={item} />
                ))}
              </div>

              {/* Tombol Load More */}
              {hasMore && (
                <div className="flex justify-center pt-10">
                  <button
                    onClick={() => loadAnimeData(true)}
                    disabled={loadingMore}
                    className="group relative px-8 py-3 bg-white/5 hover:bg-indigo-600 border border-white/10 hover:border-indigo-500 rounded-xl transition-all duration-300 disabled:opacity-50"
                  >
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] group-hover:text-white transition-colors">
                      {loadingMore ? 'Memproses...' : 'Muat Lebih Banyak'}
                    </span>
                  </button>
                </div>
              )}
            </>
          )}
        </section>

      </main>

      <Footer />
    </div>
  );
}