'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MangaCard from '@/components/Manga/MangaCard';
import { getTrendingManga } from '@/lib/manga-service';

// ── Daftar Genre ──────────────────────────────────────────────
const GENRES = [
  { label: 'Semua',         value: '',                 icon: '✦'  },
  { label: 'Action',        value: 'action',           icon: '⚔️'  },
  { label: 'Romance',       value: 'romance',          icon: '💕'  },
  { label: 'Comedy',        value: 'comedy',           icon: '😂'  },
  { label: 'Fantasy',       value: 'fantasy',          icon: '🧙'  },
  { label: 'Horror',        value: 'horror',           icon: '👻'  },
  { label: 'Mystery',       value: 'mystery',          icon: '🔍'  },
  { label: 'Sci-Fi',        value: 'science-fiction',  icon: '🚀'  },
  { label: 'Slice of Life', value: 'slice-of-life',    icon: '🌸'  },
  { label: 'Sports',        value: 'sports',           icon: '🏆'  },
  { label: 'Supernatural',  value: 'supernatural',     icon: '🌀'  },
  { label: 'Thriller',      value: 'thriller',         icon: '🎭'  },
  { label: 'Mecha',         value: 'mecha',            icon: '🤖'  },
  { label: 'Isekai',        value: 'isekai',           icon: '🌍'  },
  { label: 'Shounen',       value: 'shounen',          icon: '🔥'  },
  { label: 'Shoujo',        value: 'shoujo',           icon: '🌷'  },
  { label: 'Seinen',        value: 'seinen',           icon: '🗡️'  },
  { label: 'Josei',         value: 'josei',            icon: '✨'  },
];

export default function MangaDiscoveryPage() {
  const [data, setData]               = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore]         = useState(true);

  // page disimpan di ref — tidak memicu re-render & tidak masuk dependency
  const pageRef    = useRef(0);
  const isFetching = useRef(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeGenre, setActiveGenre] = useState('');

  // ── Fungsi fetch utama ────────────────────────────────────────
  // isMore = true  → load more (tambah ke data lama)
  // isMore = false → reset (ganti semua data)
  const fetchMangaData = useCallback(async (
    query: string,
    genre: string,
    isMore: boolean
  ) => {
    if (isFetching.current) return;
    isFetching.current = true;

    const nextPage = isMore ? pageRef.current + 1 : 0;

    try {
      const res = await getTrendingManga({ query, genre, page: nextPage });

      if (!res?.length) {
        setHasMore(false);
        if (!isMore) setData([]);
      } else {
        setHasMore(res.length >= 20);
        setData(prev => isMore ? [...prev, ...res] : res);
        pageRef.current = nextPage;
      }
    } catch (err) {
      console.error('Manga fetch error:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isFetching.current = false;
    }
  }, []); // dependency kosong — aman karena pakai ref untuk page

  // ── Reset & fetch ulang setiap kali search/genre berubah ─────
  useEffect(() => {
    setLoading(true);
    setHasMore(true);
    pageRef.current = 0;

    const timer = setTimeout(() => {
      fetchMangaData(searchQuery, activeGenre, false);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, activeGenre, fetchMangaData]);

  // ── Handler tombol load more ─────────────────────────────────
  const handleLoadMore = () => {
    if (isFetching.current || loadingMore) return;
    setLoadingMore(true);
    fetchMangaData(searchQuery, activeGenre, true);
  };

  return (
    <div className="min-h-screen bg-[#060910] text-white flex flex-col overflow-x-hidden">
      <Navbar />

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 pt-20 sm:pt-24 md:pt-28 pb-16 sm:pb-20">

        {/* ── HEADER ─────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8 sm:mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-1 w-8 bg-indigo-500 rounded-full" />
              <span className="text-indigo-400 text-[10px] sm:text-xs font-black uppercase tracking-[0.4em]">
                Koleksi Bacaan
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black italic uppercase tracking-tighter leading-tight">
              Pojok <span className="text-indigo-500">Manga</span>
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-1 hidden sm:block">
              Temukan manga favoritmu dari ribuan judul yang tersedia.
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full md:max-w-sm lg:max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setActiveGenre('');
                setSearchQuery(e.target.value);
              }}
              placeholder="Cari judul manga..."
              className="w-full bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl px-5 py-3.5 sm:py-4 text-xs sm:text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-gray-500 pr-12"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
              {loading && searchQuery ? (
                <svg className="animate-spin h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </div>
          </div>
        </div>

        {/* ── GENRE FILTER ────────────────────────────────────── */}
        <div className="relative mb-7 sm:mb-9">
          {/* fade ujung kanan — penanda bisa scroll */}
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#060910] to-transparent z-10 pointer-events-none rounded-r-full" />
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {GENRES.map((genre) => {
              const isActive = activeGenre === genre.value && !searchQuery;
              return (
                <button
                  key={genre.value}
                  onClick={() => {
                    setSearchQuery('');
                    setActiveGenre(genre.value);
                  }}
                  className={`
                    shrink-0 flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full
                    text-[9px] sm:text-[10px] font-black uppercase tracking-widest
                    border transition-all duration-200 active:scale-95
                    ${isActive
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/40'
                      : 'bg-white/[0.04] border-white/[0.08] text-gray-400 hover:text-white hover:border-white/20 hover:bg-white/[0.08]'
                    }
                  `}
                >
                  <span className="text-[11px] leading-none">{genre.icon}</span>
                  <span>{genre.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── LABEL FILTER AKTIF ──────────────────────────────── */}
        {(activeGenre || searchQuery) && !loading && (
          <div className="flex items-center gap-2 mb-5 -mt-2 sm:-mt-4">
            <span className="text-gray-500 text-[10px] sm:text-xs">
              {searchQuery
                ? `Hasil pencarian untuk "${searchQuery}"`
                : `Genre: ${GENRES.find(g => g.value === activeGenre)?.label}`}
              {data.length > 0 && (
                <span className="text-gray-600 ml-1">— {data.length}+ judul</span>
              )}
            </span>
            <button
              onClick={() => { setSearchQuery(''); setActiveGenre(''); }}
              className="text-indigo-400 hover:text-indigo-300 text-[10px] sm:text-xs font-bold underline underline-offset-2 transition-colors"
            >
              Reset
            </button>
          </div>
        )}

        {/* ── GRID MANGA ──────────────────────────────────────── */}
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
          <div className="py-20 sm:py-28 text-center border border-dashed border-white/5 rounded-2xl sm:rounded-[2.5rem]">
            <span className="text-4xl sm:text-5xl mb-4 block">🤔</span>
            <p className="text-white font-bold text-sm sm:text-base mb-1">
              Manga-nya belum ketemu nih
            </p>
            <p className="text-gray-500 text-xs sm:text-sm px-4">
              Coba cek ejaan judulnya atau pilih genre yang berbeda.
            </p>
          </div>
        )}

        {/* ── LOAD MORE ───────────────────────────────────────── */}
        {hasMore && !loading && data.length > 0 && (
          <div className="flex justify-center pt-8 sm:pt-12">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="group bg-white/5 hover:bg-indigo-600 border border-white/10 hover:border-indigo-500 px-8 sm:px-12 py-3 sm:py-3.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-gray-300 hover:text-white transition-all duration-200 disabled:opacity-50 active:scale-95 flex items-center gap-2.5"
            >
              {loadingMore ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Tunggu sebentar...
                </>
              ) : (
                <>
                  Tampilkan lebih banyak
                  <svg className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
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