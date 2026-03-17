'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimeCard from '@/components/Anime/AnimeCard';
import { getTrendingAnime } from '@/lib/anime-service';

function KatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const statusParam = searchParams.get('status');

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination State
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Helper untuk filter status secara lokal
  const getStatus = (item: any) => {
    const status = item?.status?.toLowerCase() || item?.attributes?.status?.toLowerCase() || '';
    if (item?.airing === true || status.includes('airing') || status === 'current') return 'ongoing';
    if (item?.airing === false || status.includes('finished') || status === 'completed') return 'completed';
    return 'unknown';
  };

  const loadAnimeData = useCallback(async (isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);

    const currentPage = isLoadMore ? page + 1 : 0;

    try {
      let res = await getTrendingAnime({ 
        query: searchQuery, 
        page: currentPage 
      });

      if (res && res.length > 0) {
        if (statusParam) {
           res = res.filter((item: any) => getStatus(item) === statusParam);
        }

        setData(prev => isLoadMore ? [...prev, ...res] : res);
        setPage(currentPage);
        setHasMore(res.length >= 10); 
      } else {
        if (!isLoadMore) setData([]);
        setHasMore(false);
      }
    } catch (error) {
      console.error("Gagal memuat katalog anime:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchQuery, page, statusParam]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      loadAnimeData(false);
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, statusParam]);

  const getPageTitle = () => {
    if (statusParam === 'ongoing') return 'On Going';
    if (statusParam === 'completed') return 'Sudah Tamat';
    return 'Semua Koleksi';
  };

  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-24 md:pt-32 pb-16 space-y-8 flex-grow">
      
      {/* Tombol Kembali */}
      <button 
        onClick={() => router.back()}
        className="group flex items-center gap-2 text-gray-500 hover:text-white transition-colors w-fit"
      >
        <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="text-[11px] font-black uppercase tracking-[0.2em]">Kembali</span>
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-2">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-2 bg-indigo-600 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.8)]" />
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
              Katalog <span className="text-indigo-500">{getPageTitle()}</span>
            </h1>
          </div>
          <p className="text-gray-400 text-sm md:text-base max-w-xl">
            Jelajahi arsip anime lengkap kami. Cari, temukan, dan simpan anime favorit untuk ditonton nanti.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80 group">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari di katalog..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all placeholder:text-gray-500 text-white shadow-inner"
          />
          <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {[...Array(18)].map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-white/[0.03] rounded-2xl animate-pulse border border-white/5" />
          ))}
        </div>
      ) : (
        <>
          {data.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
              {data.map((item, i) => (
                <AnimeCard key={`katalog-${item.id}-${i}`} anime={item} />
              ))}
            </div>
          ) : (
            <div className="w-full py-32 flex flex-col items-center justify-center text-gray-500 bg-white/[0.02] rounded-3xl border border-white/5">
              <span className="text-5xl mb-4">🔍</span>
              <span className="text-lg font-bold uppercase tracking-widest text-gray-400">Data Tidak Ditemukan</span>
              <span className="text-sm mt-2">Coba gunakan kata kunci pencarian yang lain.</span>
            </div>
          )}

          {/* Tombol Load More */}
          {hasMore && data.length > 0 && (
            <div className="flex justify-center pt-12">
              <button
                onClick={() => loadAnimeData(true)}
                disabled={loadingMore}
                className="group relative px-10 py-4 bg-white/5 hover:bg-indigo-600 border border-white/10 hover:border-indigo-500 rounded-xl transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-[0_0_20px_rgba(79,70,229,0.4)]"
              >
                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-300 group-hover:text-white transition-colors flex items-center gap-2">
                  {loadingMore ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Memuat Data...
                    </>
                  ) : 'Muat Lebih Banyak'}
                </span>
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}

export default function KatalogPage() {
  return (
    <div className="min-h-screen bg-[#060910] text-white flex flex-col overflow-x-hidden">
      <Navbar />
      <Suspense fallback={
        <main className="w-full h-screen flex justify-center items-center">
          <div className="animate-pulse flex gap-2 items-center">
            <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
            <div className="w-3 h-3 bg-indigo-500 rounded-full animation-delay-200"></div>
            <div className="w-3 h-3 bg-indigo-500 rounded-full animation-delay-400"></div>
          </div>
        </main>
      }>
        <KatalogContent />
      </Suspense>
      <Footer />
    </div>
  );
}