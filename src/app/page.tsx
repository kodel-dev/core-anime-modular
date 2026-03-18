'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimeCard from '@/components/Anime/AnimeCard';
import { getTrendingAnime, getWeeklyAnimeSchedule } from '@/lib/anime-service';

const DAYS = [
  { id: 'monday',    label: 'Senin'   },
  { id: 'tuesday',   label: 'Selasa'  },
  { id: 'wednesday', label: 'Rabu'    },
  { id: 'thursday',  label: 'Kamis'   },
  { id: 'friday',    label: 'Jumat'   },
  { id: 'saturday',  label: 'Sabtu'   },
  { id: 'sunday',    label: 'Minggu'  },
];

const GENRES = [
  { label: 'Semua',         value: '',              icon: '✦'  },
  { label: 'Action',        value: 'action',        icon: '⚔️'  },
  { label: 'Adventure',     value: 'adventure',     icon: '🗺️'  },
  { label: 'Comedy',        value: 'comedy',        icon: '😂'  },
  { label: 'Drama',         value: 'drama',         icon: '🎭'  },
  { label: 'Fantasy',       value: 'fantasy',       icon: '🧙'  },
  { label: 'Horror',        value: 'horror',        icon: '👻'  },
  { label: 'Mecha',         value: 'mecha',         icon: '🤖'  },
  { label: 'Mystery',       value: 'mystery',       icon: '🔍'  },
  { label: 'Romance',       value: 'romance',       icon: '💕'  },
  { label: 'Sci-Fi',        value: 'science-fiction', icon: '🚀' },
  { label: 'Slice of Life', value: 'slice-of-life', icon: '🌸'  },
  { label: 'Sports',        value: 'sports',        icon: '🏆'  },
  { label: 'Supernatural',  value: 'supernatural',  icon: '🌀'  },
  { label: 'Thriller',      value: 'thriller',      icon: '🎬'  },
  { label: 'Shounen',       value: 'shounen',       icon: '🔥'  },
  { label: 'Shoujo',        value: 'shoujo',        icon: '🌷'  },
  { label: 'Seinen',        value: 'seinen',        icon: '🗡️'  },
];

const todayIndex = () => {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
};

const SectionHeader = ({
  title, highlight, onSeeAll,
}: { title: string; highlight: string; onSeeAll?: () => void }) => (
  <div className="flex justify-between items-end gap-4 mb-5 sm:mb-6">
    <div className="flex items-center gap-3">
      <div className="h-5 sm:h-6 w-1.5 bg-indigo-600 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.8)]" />
      <h3 className="text-lg sm:text-xl md:text-2xl font-black uppercase tracking-tight">
        {title} <span className="text-indigo-500">{highlight}</span>
      </h3>
    </div>
    {onSeeAll && (
      <button onClick={onSeeAll} className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 group shrink-0">
        Lihat Semua
        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    )}
  </div>
);

const GridSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 animate-pulse">
    {[...Array(12)].map((_, i) => (
      <div key={i} className="aspect-[3/4] bg-white/[0.04] rounded-2xl border border-white/5" />
    ))}
  </div>
);

export default function DiscoveryPage() {
  const router = useRouter();

  const [homeData, setHomeData]           = useState<any[]>([]);
  const [loadingHome, setLoadingHome]     = useState(true);

  const [filterData, setFilterData]         = useState<any[]>([]);
  const [loadingFilter, setLoadingFilter]   = useState(false);
  const [hasMore, setHasMore]               = useState(true);
  const [loadingMore, setLoadingMore]       = useState(false);

  const [schedule, setSchedule]             = useState<any[]>([]);
  const [activeDay, setActiveDay]           = useState(DAYS[todayIndex()].id);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  const [searchQuery, setSearchQuery]       = useState('');
  const [selectedGenre, setSelectedGenre]   = useState('');

  const isFiltering = searchQuery.trim() !== '' || selectedGenre !== '';

  const pageRef    = useRef(0);
  const isFetching = useRef(false);

  // ── 1. Beranda (sekali saat mount) ──────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoadingHome(true);
      try {
        const res = await getTrendingAnime({ page: 0 });
        setHomeData(res || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingHome(false);
      }
    };
    load();
  }, []);

  // ── 2. Jadwal harian ─────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoadingSchedule(true);
      try {
        const res = await getWeeklyAnimeSchedule(activeDay);
        const unique = Array.from(new Map(res.map((i: any) => [i.mal_id, i])).values());
        setSchedule(unique as any[]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingSchedule(false);
      }
    };
    load();
  }, [activeDay]);

  // ── 3. Fetch hasil filter — genre diteruskan sebagai category ─
  const fetchFilterData = useCallback(async (
    query: string,
    genre: string,   // nilai dari GENRES[].value, sudah lowercase (e.g. "action")
    isMore: boolean
  ) => {
    if (isFetching.current) return;
    isFetching.current = true;
    const nextPage = isMore ? pageRef.current + 1 : 0;
    try {
      // Kirim genre sebagai `genre` (service akan baca sebagai filterCat)
      const res = await getTrendingAnime({ query, genre, page: nextPage });
      if (!res?.length) {
        setHasMore(false);
        if (!isMore) setFilterData([]);
      } else {
        setHasMore(res.length >= 20);
        setFilterData(prev => isMore ? [...prev, ...res] : res);
        pageRef.current = nextPage;
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingFilter(false);
      setLoadingMore(false);
      isFetching.current = false;
    }
  }, []);

  // ── 4. Trigger saat filter berubah ───────────────────────────
  useEffect(() => {
    if (!isFiltering) {
      setFilterData([]);
      setHasMore(true);
      pageRef.current = 0;
      return;
    }
    setLoadingFilter(true);
    setHasMore(true);
    pageRef.current = 0;
    const t = setTimeout(() => fetchFilterData(searchQuery, selectedGenre, false), 400);
    return () => clearTimeout(t);
  }, [searchQuery, selectedGenre, isFiltering, fetchFilterData]);

  const handleLoadMore = () => {
    if (isFetching.current || loadingMore) return;
    setLoadingMore(true);
    fetchFilterData(searchQuery, selectedGenre, true);
  };

  const handleReset = () => { setSearchQuery(''); setSelectedGenre(''); };

  // Kategorisasi beranda
  const getStatus = (item: any) => {
    const s = item?.status?.toLowerCase() || item?.attributes?.status?.toLowerCase() || '';
    if (item?.airing === true  || s.includes('airing')   || s === 'current')   return 'ongoing';
    if (item?.airing === false || s.includes('finished') || s === 'completed') return 'completed';
    return 'unknown';
  };
  const ongoingAnime   = homeData.filter(i => getStatus(i) === 'ongoing');
  const completedAnime = homeData.filter(i => getStatus(i) === 'completed');

  const activeGenreLabel = GENRES.find(g => g.value === selectedGenre)?.label || selectedGenre;

  return (
    <div className="min-h-screen bg-[#060910] text-white flex flex-col overflow-x-hidden">
      <Navbar />

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 pt-20 sm:pt-24 md:pt-28 pb-16 sm:pb-20">

        {/* ── HEADER & SEARCH ─────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8 sm:mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-1 w-8 bg-indigo-500 rounded-full" />
              <span className="text-indigo-400 text-[10px] sm:text-xs font-black uppercase tracking-[0.4em]">Tontonan Terbaik</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black italic uppercase tracking-tighter leading-tight">
              Temukan <span className="text-indigo-500">Anime</span>
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-1 hidden sm:block">
              Jelajahi ribuan judul anime dari berbagai genre dan era.
            </p>
          </div>

          <div className="relative w-full md:max-w-sm lg:max-w-md group">
            <input
              type="text"
              value={searchQuery}
              onChange={e => { setSelectedGenre(''); setSearchQuery(e.target.value); }}
              placeholder="Cari anime favorit kamu..."
              className="w-full bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl px-5 py-3.5 sm:py-4 text-xs sm:text-sm focus:outline-none focus:border-indigo-500/60 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-gray-500 pr-12"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 pointer-events-none transition-colors">
              {loadingFilter && searchQuery ? (
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
        <div className="relative mb-8 sm:mb-10">
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#060910] to-transparent z-10 pointer-events-none" />
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {GENRES.map(genre => {
              const isActive = selectedGenre === genre.value && !searchQuery;
              return (
                <button
                  key={genre.value}
                  onClick={() => { setSearchQuery(''); setSelectedGenre(genre.value); }}
                  className={`shrink-0 flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest border transition-all duration-200 active:scale-95 ${
                    isActive
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/40'
                      : 'bg-white/[0.04] border-white/[0.08] text-gray-400 hover:text-white hover:border-white/20 hover:bg-white/[0.08]'
                  }`}
                >
                  <span className="text-[11px] leading-none">{genre.icon}</span>
                  <span>{genre.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            MODE FILTER
        ══════════════════════════════════════════════════════ */}
        {isFiltering ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
            {/* Breadcrumb */}
            <div className="flex items-center gap-3">
              <button onClick={handleReset} className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors group">
                <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest">Kembali</span>
              </button>
              <span className="text-white/10">|</span>
              {searchQuery ? (
                <>
                  <span className="text-gray-500 text-[10px] sm:text-xs">Hasil untuk</span>
                  <span className="text-white text-[10px] sm:text-xs font-bold bg-white/[0.06] px-2 py-0.5 rounded-lg">"{searchQuery}"</span>
                </>
              ) : (
                <>
                  <span className="text-gray-500 text-[10px] sm:text-xs">Genre</span>
                  <span className="text-indigo-400 text-[10px] sm:text-xs font-bold bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20">
                    {activeGenreLabel}
                  </span>
                </>
              )}
              {!loadingFilter && filterData.length > 0 && (
                <span className="text-gray-600 text-[10px] sm:text-xs">— {filterData.length}+ judul</span>
              )}
            </div>

            {/* Grid hasil filter */}
            {loadingFilter ? (
              <div className="space-y-4">
                <p className="text-[10px] text-indigo-400/60 font-black uppercase tracking-widest animate-pulse">
                  {searchQuery ? `Sedang mencari "${searchQuery}"...` : `Memuat anime genre ${activeGenreLabel}...`}
                </p>
                <GridSkeleton />
              </div>
            ) : filterData.length > 0 ? (
              <div className="space-y-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
                  {filterData.map((item, i) => (
                    <AnimeCard key={`filter-${item.id}-${i}`} anime={item} />
                  ))}
                </div>
                {hasMore && (
                  <div className="flex justify-center pt-4">
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
                        <>Tampilkan lebih banyak
                          <svg className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-20 sm:py-28 text-center border border-dashed border-white/5 rounded-2xl sm:rounded-[2.5rem]">
                <span className="text-4xl sm:text-5xl mb-4 block">🤔</span>
                <p className="text-white font-bold text-sm sm:text-base mb-1">Anime-nya belum ketemu nih</p>
                <p className="text-gray-500 text-xs sm:text-sm px-4 mb-5">Coba cek ejaan atau pilih genre yang berbeda.</p>
                <button onClick={handleReset} className="text-indigo-400 hover:text-indigo-300 text-xs font-bold underline underline-offset-2 transition-colors">
                  Kembali ke beranda
                </button>
              </div>
            )}
          </div>

        ) : (
          /* ══════════════════════════════════════════════════════
              MODE BERANDA
          ══════════════════════════════════════════════════════ */
          <div className="space-y-10 sm:space-y-14 md:space-y-16">

            {/* Jadwal Rilis */}
            <section>
              <SectionHeader title="Jadwal" highlight="Rilis" onSeeAll={() => router.push('/jadwal')} />
              <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar mb-4 sm:mb-5">
                {DAYS.map(d => (
                  <button key={d.id} onClick={() => setActiveDay(d.id)}
                    className={`px-4 sm:px-6 py-2 sm:py-2.5 text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-200 whitespace-nowrap border shrink-0 active:scale-95 ${
                      activeDay === d.id
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.35)]'
                        : 'bg-white/5 border-white/5 text-gray-500 hover:text-white hover:bg-white/10'
                    }`}
                  >{d.label}</button>
                ))}
              </div>
              <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-5 no-scrollbar snap-x">
                {loadingSchedule ? (
                  <div className="w-full py-14 flex justify-center items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '120ms' }} />
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '240ms' }} />
                    <span className="ml-2 text-[10px] font-black uppercase tracking-widest text-indigo-500/60">Memuat jadwal...</span>
                  </div>
                ) : schedule.length > 0 ? (
                  schedule.map((item, i) => (
                    <div key={`${item.mal_id}-${i}`} className="shrink-0 w-[150px] sm:w-[185px] md:w-[210px] snap-start">
                      <AnimeCard anime={{ id: item.mal_id, attributes: {
                        canonicalTitle: item.title,
                        posterImage: { large: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url },
                        averageRating: item.score ? item.score * 10 : null,
                        status: item.airing ? 'current' : 'finished',
                        synopsis: item.synopsis,
                        startDate: item.aired?.from,
                      }}} />
                    </div>
                  ))
                ) : (
                  <div className="w-full py-12 flex flex-col items-center justify-center gap-2 bg-white/[0.02] rounded-2xl border border-white/5">
                    <span className="text-2xl">📭</span>
                    <span className="text-xs text-gray-500 font-medium">Tidak ada jadwal tayang hari ini.</span>
                  </div>
                )}
              </div>
            </section>

            {/* Sedang Tayang */}
            {!loadingHome && ongoingAnime.length > 0 && (
              <section className="pt-4 border-t border-white/5">
                <SectionHeader title="Sedang" highlight="Tayang" onSeeAll={() => router.push('/katalog?status=ongoing')} />
                <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-5 no-scrollbar snap-x">
                  {ongoingAnime.map((item, i) => (
                    <div key={`ongoing-${item.id}-${i}`} className="shrink-0 w-[150px] sm:w-[185px] md:w-[210px] snap-start">
                      <AnimeCard anime={item} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Sudah Tamat */}
            {!loadingHome && completedAnime.length > 0 && (
              <section className="pt-4 border-t border-white/5">
                <SectionHeader title="Sudah" highlight="Tamat" onSeeAll={() => router.push('/katalog?status=completed')} />
                <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-5 no-scrollbar snap-x">
                  {completedAnime.map((item, i) => (
                    <div key={`completed-${item.id}-${i}`} className="shrink-0 w-[150px] sm:w-[185px] md:w-[210px] snap-start">
                      <AnimeCard anime={item} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Semua Koleksi */}
            <section className="pt-4 border-t border-white/5">
              <SectionHeader title="Semua" highlight="Koleksi" />
              {loadingHome ? <GridSkeleton /> : homeData.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
                    {homeData.map((item, i) => (
                      <AnimeCard key={`home-${item.id}-${i}`} anime={item} />
                    ))}
                  </div>
                  <div className="flex justify-center pt-8 sm:pt-12">
                    <button onClick={() => router.push('/katalog')}
                      className="group bg-white/5 hover:bg-indigo-600 border border-white/10 hover:border-indigo-500 px-8 sm:px-12 py-3 sm:py-3.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-gray-300 hover:text-white transition-all duration-200 active:scale-95 flex items-center gap-2.5"
                    >
                      Lihat Semua Koleksi
                      <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </button>
                  </div>
                </>
              ) : (
                <div className="py-20 text-center border border-dashed border-white/5 rounded-2xl">
                  <p className="text-gray-500 text-sm">Gagal memuat koleksi. Coba refresh halaman.</p>
                </div>
              )}
            </section>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}