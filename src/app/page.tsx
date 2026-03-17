'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
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

const GENRES = [
  'Semua Genre', 'Action', 'Adventure', 'Comedy', 'Drama', 
  'Fantasy', 'Horror', 'Mecha', 'Mystery', 'Romance', 
  'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural', 'Thriller'
];

const todayIndex = () => {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
};

// Komponen Reusable untuk Header Kategori
const SectionHeader = ({ title, highlight, onSeeAll }: { title: string, highlight: string, onSeeAll?: () => void }) => (
  <div className="flex justify-between items-end gap-4 mb-6">
    <div className="flex items-center gap-3">
      <div className="h-6 w-1.5 bg-indigo-600 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.8)]" />
      <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight">
        {title} <span className="text-indigo-500">{highlight}</span>
      </h3>
    </div>
    {onSeeAll && (
      <button 
        onClick={onSeeAll} 
        className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 group"
      >
        Lihat Semua
        <svg className="w-4 h-4 text-indigo-500 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    )}
  </div>
);

export default function DiscoveryPage() {
  const router = useRouter();
  
  const [data, setData] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [activeDay, setActiveDay] = useState(DAYS[todayIndex()].id);
  
  // State Loading
  const [loading, setLoading] = useState(true);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  // State Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('Semua Genre');
  const [isGenreOpen, setIsGenreOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle klik di luar dropdown genre untuk menutupnya
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsGenreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 1. Fetch Jadwal Anime
  useEffect(() => {
    const loadSchedule = async () => {
      setLoadingSchedule(true);
      try {
        const res = await getWeeklyAnimeSchedule(activeDay);
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
  const loadAnimeData = useCallback(async () => {
    setLoading(true);

    try {
      const res = await getTrendingAnime({ 
        query: searchQuery, 
        page: 0 
      });

      if (res && res.length > 0) {
        setData(res);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error("Gagal memuat anime:", error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  // Initial load & Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      loadAnimeData();
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // --- LOGIKA KATEGORI ---
  const getStatus = (item: any) => {
    const status = item?.status?.toLowerCase() || item?.attributes?.status?.toLowerCase() || '';
    if (item?.airing === true || status.includes('airing') || status === 'current') return 'ongoing';
    if (item?.airing === false || status.includes('finished') || status === 'completed') return 'completed';
    return 'unknown';
  };

  const ongoingAnime = data.filter(item => getStatus(item) === 'ongoing');
  const completedAnime = data.filter(item => getStatus(item) === 'completed');

  // Filter Grid Utama (berdasarkan Genre)
  const gridData = data.filter(item => {
    if (selectedGenre === 'Semua Genre') return true;
    const itemGenres = item.genres?.map((g: any) => g.name) || item.attributes?.genres?.map((g: any) => g.name) || [];
    if (itemGenres.length === 0) return true; 
    return itemGenres.includes(selectedGenre);
  });

  return (
    <div className="min-h-screen bg-[#060910] text-white flex flex-col overflow-x-hidden">
      <Navbar />
      
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-24 md:pt-32 pb-16 space-y-12 md:space-y-16">
        
        {/* CONTROL BAR: SEARCH & GENRE DROPDOWN */}
        <div className="flex flex-col md:flex-row gap-4 z-40 relative">
          <div className="relative w-full group">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari anime favorit..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all placeholder:text-gray-500 text-white shadow-inner"
            />
            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="relative w-full md:w-72" ref={dropdownRef}>
            <button
              onClick={() => setIsGenreOpen(!isGenreOpen)}
              className="h-full w-full flex items-center justify-between gap-4 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all text-white hover:bg-white/10"
            >
              <span className="truncate font-medium">{selectedGenre}</span>
              <svg className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isGenreOpen ? 'rotate-180 text-indigo-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div className={`absolute top-full right-0 mt-3 w-full bg-[#0a0f1a] border border-white/10 rounded-2xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-50 transition-all duration-300 transform origin-top ${isGenreOpen ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0 pointer-events-none'}`}>
              <div className="max-h-72 overflow-y-auto custom-scrollbar py-2">
                {GENRES.map(genre => (
                  <button
                    key={genre}
                    onClick={() => { setSelectedGenre(genre); setIsGenreOpen(false); }}
                    className={`w-full text-left px-6 py-3 text-sm transition-colors ${
                      selectedGenre === genre 
                        ? 'text-indigo-400 font-black bg-indigo-500/10 border-l-2 border-indigo-500' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION: SCHEDULER ANIME */}
        <section className="pt-4">
          <SectionHeader 
            title="Jadwal" 
            highlight="Rilis" 
            onSeeAll={() => router.push('/jadwal')} 
          />

          <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
            {DAYS.map((d) => (
              <button
                key={d.id}
                onClick={() => setActiveDay(d.id)}
                className={`px-6 py-2.5 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 whitespace-nowrap border ${
                  activeDay === d.id 
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]' 
                    : 'bg-white/5 border-white/5 text-gray-500 hover:text-white hover:bg-white/10'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          <div className="flex gap-4 sm:gap-5 overflow-x-auto pb-6 no-scrollbar snap-x">
            {loadingSchedule ? (
              <div className="w-full py-16 flex justify-center items-center">
                <div className="animate-pulse flex gap-2 items-center">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animation-delay-200"></div>
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animation-delay-400"></div>
                  <span className="ml-3 font-black uppercase text-xs tracking-[0.3em] text-indigo-500/70">Memuat</span>
                </div>
              </div>
            ) : schedule.length > 0 ? (
              schedule.map((item, i) => (
                <div key={`${item.mal_id}-${i}`} className="shrink-0 w-[160px] sm:w-[200px] md:w-[220px] snap-start">
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
              <div className="w-full py-12 flex flex-col items-center justify-center text-gray-600 bg-white/[0.02] rounded-2xl border border-white/5">
                <span className="text-2xl mb-2">📭</span>
                <span className="text-xs font-medium uppercase tracking-widest">Kosong</span>
              </div>
            )}
          </div>
        </section>

        {/* SECTION: ON GOING */}
        {!loading && ongoingAnime.length > 0 && (
          <section className="pt-4 border-t border-white/5">
            <SectionHeader 
              title="On" 
              highlight="Going" 
              onSeeAll={() => router.push('/katalog?status=ongoing')} 
            />
            <div className="flex gap-4 sm:gap-5 overflow-x-auto pb-6 no-scrollbar snap-x">
              {ongoingAnime.map((item, i) => (
                <div key={`ongoing-${item.id}-${i}`} className="shrink-0 w-[160px] sm:w-[200px] md:w-[220px] snap-start">
                  <AnimeCard anime={item} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION: SUDAH TAMAT (COMPLETED) */}
        {!loading && completedAnime.length > 0 && (
          <section className="pt-4 border-t border-white/5">
            <SectionHeader 
              title="Sudah" 
              highlight="Tamat" 
              onSeeAll={() => router.push('/katalog?status=completed')} 
            />
            <div className="flex gap-4 sm:gap-5 overflow-x-auto pb-6 no-scrollbar snap-x">
              {completedAnime.map((item, i) => (
                <div key={`completed-${item.id}-${i}`} className="shrink-0 w-[160px] sm:w-[200px] md:w-[220px] snap-start">
                  <AnimeCard anime={item} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION: KATALOG UTAMA (GRID) */}
        <section className="pt-4 border-t border-white/5">
          <SectionHeader title="Semua" highlight="Koleksi" />

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-white/[0.03] rounded-2xl animate-pulse border border-white/5" />
              ))}
            </div>
          ) : (
            <>
              {gridData.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
                  {gridData.map((item, i) => (
                    <AnimeCard key={`grid-${item.id}-${i}`} anime={item} />
                  ))}
                </div>
              ) : (
                <div className="w-full py-20 flex flex-col items-center justify-center text-gray-500 bg-white/[0.02] rounded-2xl border border-white/5">
                  <span className="text-4xl mb-4">🔍</span>
                  <span className="text-sm font-medium">Anime tidak ditemukan di kategori ini.</span>
                </div>
              )}

              {/* Tombol Lihat Semua */}
              {gridData.length > 0 && (
                <div className="flex justify-center pt-12">
                  <button
                    onClick={() => router.push('/katalog')}
                    className="group relative px-8 py-4 bg-white/5 hover:bg-indigo-600 border border-white/10 hover:border-indigo-500 rounded-xl transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(79,70,229,0.4)]"
                  >
                    <span className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-300 group-hover:text-white transition-colors flex items-center gap-2">
                      Lihat Semua Koleksi
                      <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
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