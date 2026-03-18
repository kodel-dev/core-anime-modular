'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MangaCard from '@/components/Manga/MangaCard';
import { getTrendingManga } from '@/lib/manga-service';

export default function MangaDiscoveryPage() {
  // --- State Management ---
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  const isFetching = useRef(false);

  /**
   * Mengambil data manga dari layanan API.
   * Mendukung mode pencarian maupun tampilan manga terpopuler.
   */
  const fetchMangaData = useCallback(async (isMore = false) => {
    if (isFetching.current) return;
    isFetching.current = true;

    const targetPage = isMore ? page + 1 : 0;

    try {
      const res = await getTrendingManga({
        query: searchQuery,
        page: targetPage,
      });

      if (!res?.length) {
        setHasMore(false);
        if (!isMore) setData([]);
      } else {
        // Asumsi limit per halaman adalah 20
        setHasMore(res.length >= 20);
        setData(prev => (isMore ? [...prev, ...res] : res));
        setPage(targetPage);
      }
    } catch (error) {
      console.error("Manga Service Error:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isFetching.current = false;
    }
  }, [page, searchQuery]);

  /**
   * Menangani efek pencarian dengan sistem debounce
   * untuk mengoptimalkan performa permintaan API.
   */
  useEffect(() => {
    setLoading(true);
    const debounceTimer = setTimeout(() => {
      fetchMangaData(false);
    }, 500);
    
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, fetchMangaData]);

  return (
    <div className="min-h-screen bg-[#060910] text-white flex flex-col overflow-x-hidden">
      <Navbar />

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 md:pt-32 pb-16 space-y-8 sm:space-y-10">
        
        {/* HEADER & SEARCH INTERFACE */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-1 w-8 bg-indigo-500 rounded-full" />
              <span className="text-indigo-400 text-[10px] sm:text-xs font-black uppercase tracking-[0.4em]">Koleksi Bacaan</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black italic uppercase tracking-tighter">
              Pojok <span className="text-indigo-500">Manga</span>
            </h2>
          </div>

          <div className="relative w-full md:max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Mau baca manga apa hari ini? Cari di sini..."
              className="w-full bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl px-5 sm:px-6 py-3.5 sm:py-4 text-xs sm:text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-gray-500 shadow-inner"
            />
            <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* CONTENT GRID SECTION */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 animate-pulse">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-white/5 rounded-xl sm:rounded-2xl" />
            ))}
          </div>
        ) : data.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
            {data.map((manga, i) => (
              <MangaCard key={`${manga.id}-${i}`} manga={manga} />
            ))}
          </div>
        ) : (
          <div className="py-24 sm:py-32 text-center border border-dashed border-white/5 rounded-2xl sm:rounded-[2.5rem]">
            <span className="text-3xl sm:text-4xl mb-3 block">🤔</span>
            <p className="text-gray-400 font-medium text-xs sm:text-sm px-4">Wah, manga yang kamu cari belum ketemu nih. Coba cari judul lain, ya!</p>
          </div>
        )}

        {/* PAGINATION / LOAD MORE */}
        {hasMore && !loading && (
          <div className="flex justify-center pt-8 sm:pt-10">
            <button
              onClick={() => {
                setLoadingMore(true);
                fetchMangaData(true);
              }}
              disabled={loadingMore}
              className="bg-white/5 hover:bg-white/10 border border-white/10 px-6 sm:px-10 py-3 sm:py-3.5 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] transition-all disabled:opacity-50 active:scale-95 flex items-center gap-2"
            >
              {loadingMore ? (
                <>
                  <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  <span className="hidden xs:inline">Tunggu sebentar...</span>
                  <span className="xs:hidden">Loading...</span>
                </>
              ) : (
                <>
                  <span className="hidden xs:inline">Muat Manga Lainnya</span>
                  <span className="xs:hidden">Muat Lagi</span>
                </>
              )}
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}