'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface MangaCardProps {
  manga: any;
}

export default function MangaCard({ manga }: MangaCardProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeTab,     setActiveTab]     = useState('Sinopsis');
  const [loadingDetail, setLoadingDetail] = useState(false);

  // State untuk Data Tab
  const [chapters,   setChapters]   = useState<any[]>([]);
  const [characters, setCharacters] = useState<any[]>([]);
  const [reviews,    setReviews]    = useState<any[]>([]);
  const [franchise,  setFranchise]  = useState<any[]>([]);
  const [fullDetail, setFullDetail] = useState<any>(null);

  // State Ekstra untuk Fitur Baru (Translate & Pagination Bab)
  const [translatedSynopsis, setTranslatedSynopsis] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState(false);
  
  const [chapterOffset, setChapterOffset] = useState(0);
  const [hasMoreChapters, setHasMoreChapters] = useState(true);
  const [isLoadingChapters, setIsLoadingChapters] = useState(false);

  const attributes  = manga.attributes;
  const posterImage = attributes?.posterImage?.large || attributes?.posterImage?.original;
  const TABS        = ['Sinopsis', 'Bab', 'Karakter', 'Ulasan', 'Terkait'];

  const KITSU_HEADERS = {
    'Accept':       'application/vnd.api+json',
    'Content-Type': 'application/vnd.api+json',
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'TBA';
    return new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  /* ── Scroll lock & Init Fetch ── */
  useEffect(() => {
    if (isPreviewOpen) {
      document.body.style.overflow = 'hidden';
      fetchInitialInfo();
      // Trigger translate sinopsis pertama kali buka modal
      if (!translatedSynopsis && attributes?.synopsis) {
        translateText(attributes.synopsis);
      }
    } else {
      document.body.style.overflow = 'unset';
      setActiveTab('Sinopsis');
    }
    return () => { document.body.style.overflow = 'unset'; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPreviewOpen]);

  /* ── Fungsi Translate Sinopsis ── */
  const translateText = async (text: string) => {
    setIsTranslating(true);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      // Menyesuaikan dengan ragam format balasan dari API Translate
      setTranslatedSynopsis(data.translatedText || data.text || data.result || text);
    } catch (e) {
      console.error("Gagal menerjemahkan sinopsis:", e);
      setTranslatedSynopsis(text); // Fallback ke bahasa asli jika error
    } finally {
      setIsTranslating(false);
    }
  };

  /* ── Fungsi Load Bab Bertahap ── */
  const fetchChapters = useCallback(async (offset = 0) => {
    setIsLoadingChapters(true);
    try {
      // Mengambil 20 bab berdasarkan offset (pagination)
      const res = await fetch(`https://kitsu.io/api/edge/manga/${manga.id}/chapters?page[limit]=20&page[offset]=${offset}`, { headers: KITSU_HEADERS });
      const data = await res.json();
      const fetchedChapters = data.data || [];

      if (offset === 0) {
        setChapters(fetchedChapters);
      } else {
        setChapters(prev => [...prev, ...fetchedChapters]);
      }
      
      setHasMoreChapters(fetchedChapters.length === 20); // Jika kurang dari 20, berarti data sudah habis
      setChapterOffset(offset);
    } catch (e) {
      console.error("Gagal memuat bab manga:", e);
    } finally {
      setIsLoadingChapters(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manga.id]);

  const fetchInitialInfo = async () => {
    setLoadingDetail(true);
    try {
      const res  = await fetch(`https://kitsu.io/api/edge/manga/${manga.id}?include=genres,productions.producer`, { headers: KITSU_HEADERS });
      const data = await res.json();
      setFullDetail(data);
    } catch (e) { 
      console.error("Gagal memuat detail awal:", e); 
    } finally { 
      setLoadingDetail(false); 
    }
  };

  /* ── Per-tab fetch ── */
  useEffect(() => {
    if (!isPreviewOpen) return;
    const fetchTabData = async () => {
      try {
        if (activeTab === 'Bab' && chapters.length === 0) {
          fetchChapters(0); // Panggil fungsi fetch bertahap dari offset 0

        } else if (activeTab === 'Karakter' && characters.length === 0) {
          const res  = await fetch(`https://kitsu.io/api/edge/castings?filter[media_id]=${manga.id}&filter[media_type]=Manga&filter[is_character]=true&include=character&page[limit]=16`, { headers: KITSU_HEADERS });
          const data = await res.json();
          setCharacters(
            data.data?.map((item: any) => {
              const char = data.included?.find((inc: any) => inc.type === 'characters' && inc.id === item.relationships?.character?.data?.id);
              return { name: char?.attributes?.name, image: char?.attributes?.image?.original || char?.attributes?.image?.large };
            }).filter((c: any) => c.name) || [] 
          );

        } else if (activeTab === 'Ulasan' && reviews.length === 0) {
          const res  = await fetch(`https://kitsu.io/api/edge/manga/${manga.id}/reviews?include=user&page[limit]=10&sort=-likesCount`, { headers: KITSU_HEADERS });
          const data = await res.json();
          setReviews(
            data.data?.map((r: any) => ({
              ...r,
              user: data.included?.find((inc: any) => inc.type === 'users' && inc.id === r.relationships?.user?.data?.id),
            })) || []
          );

        } else if (activeTab === 'Terkait' && franchise.length === 0) {
          const res  = await fetch(`https://kitsu.io/api/edge/manga/${manga.id}/media-relationships?include=destination`, { headers: KITSU_HEADERS });
          const data = await res.json();
          setFranchise(
            data.data?.map((rel: any) => ({
              role: rel.attributes.role,
              dest: data.included?.find((inc: any) => inc.id === rel.relationships?.destination?.data?.id),
            })) || []
          );
        }
      } catch (e) { 
        console.error("Gagal memuat tab data:", e); 
      }
    };
    fetchTabData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isPreviewOpen, manga.id]);

  const getStudios = () => {
    const prods = fullDetail?.included?.filter((i: any) => i.type === 'producers') || [];
    return prods.map((p: any) => p.attributes.name).join(', ');
  };

  const seasonName = attributes?.season ? attributes.season.charAt(0).toUpperCase() + attributes.season.slice(1) : "";
  const releaseYear = attributes?.startDate ? attributes.startDate.substring(0, 4) : "";
  const displaySeason = seasonName || releaseYear ? `${seasonName} ${releaseYear}`.trim() : "TBA";

  const detailData = [
    { label: 'Inggris',       value: attributes?.titles?.en },
    { label: 'Jepang',        value: attributes?.titles?.ja_jp },
    { label: 'Romaji',        value: attributes?.titles?.en_jp },
    { label: 'Tipe',          value: attributes?.mangaType?.toUpperCase() },
    { label: 'Volume',        value: attributes?.volumeCount },
    { label: 'Bab Total',     value: attributes?.chapterCount },
    { label: 'Status',        value: attributes?.status === 'finished' ? 'Selesai Terbit' : 'Sedang Terbit' },
    { label: 'Tgl Terbit',    value: attributes?.startDate ? `${formatDate(attributes.startDate)}${attributes.endDate ? ` — ${formatDate(attributes.endDate)}` : ' — Sekarang'}` : 'TBA' },
    { label: 'Musim',         value: displaySeason },
    { label: 'Penerbit',      value: getStudios() || 'TBA' },
    { label: 'Rating',        value: attributes?.ageRatingGuide },
  ];

  return (
    <>
      {/* ═══ CARD ═══ */}
      <div
        onClick={() => setIsPreviewOpen(true)}
        className="group relative overflow-hidden rounded-xl sm:rounded-2xl bg-[#0d1117] border border-white/5
                   hover:border-indigo-500/50 hover:shadow-[0_8px_40px_rgba(99,102,241,0.12)]
                   cursor-pointer transition-all duration-500"
      >
        <div className="aspect-[3/4] overflow-hidden relative">
          <img
            src={posterImage}
            alt={attributes?.canonicalTitle || "Manga Poster"}
            className="h-full w-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />

          {attributes?.averageRating && (
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-md px-1.5 py-0.5">
              <span className="text-yellow-400 text-[8px] leading-none">★</span>
              <span className="text-white text-[8px] font-bold leading-none">{attributes.averageRating}%</span>
            </div>
          )}

          {attributes?.mangaType && (
            <div className="absolute top-2 left-2 bg-indigo-600/90 backdrop-blur-md rounded-md px-1.5 py-0.5 shadow-lg">
              <span className="text-white text-[7px] font-black uppercase tracking-widest">{attributes.mangaType}</span>
            </div>
          )}

          <div className="absolute inset-0 flex items-end justify-start p-2 sm:p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-2 sm:px-2.5 py-1 sm:py-1.5">
              <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
              </svg>
              <span className="text-white text-[7px] sm:text-[8px] font-bold uppercase tracking-widest">Lihat Detail</span>
            </div>
          </div>
        </div>

        <div className="px-2 sm:px-3 pt-2 sm:pt-2.5 pb-2 sm:pb-3">
          <h3 className="text-[10px] sm:text-[11px] font-bold text-gray-300 group-hover:text-white truncate transition-colors">
            {attributes?.canonicalTitle}
          </h3>
          {attributes?.startDate && (
            <p className="text-[8px] sm:text-[9px] text-gray-500 mt-0.5 font-medium">{attributes.startDate.substring(0, 4)}</p>
          )}
        </div>
      </div>

      {/* ═══ MODAL ═══ */}
      {isPreviewOpen && (
        <div
          className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center
                     bg-black/80 backdrop-blur-sm p-0 sm:p-3 md:p-4"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div
            className="relative w-full sm:max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl
                       h-[93dvh] sm:h-[90vh] md:h-[88vh]
                       bg-[#07090f] border border-white/[0.07]
                       rounded-t-[24px] sm:rounded-2xl md:rounded-3xl
                       flex flex-col lg:flex-row overflow-hidden
                       shadow-[0_-30px_100px_rgba(0,0,0,0.9)] sm:shadow-[0_20px_80px_rgba(0,0,0,0.9)] lg:shadow-[0_30px_100px_rgba(0,0,0,0.9)]
                       animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-300 ease-out"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sm:hidden absolute top-0 inset-x-0 flex justify-center pt-2 z-10 pointer-events-none">
              <div className="w-9 h-1 rounded-full bg-white/20" />
            </div>

            <button
              onClick={() => setIsPreviewOpen(false)}
              className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 lg:top-4 lg:right-4 z-50
                         w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center
                         bg-white/[0.06] hover:bg-white/[0.12] active:scale-90
                         border border-white/[0.08] rounded-lg sm:rounded-xl
                         text-gray-400 hover:text-white transition-all"
            >
              <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* SIDEBAR */}
            <aside
              className="shrink-0 w-full lg:w-[260px] xl:w-[300px]
                         flex flex-col overflow-y-auto no-scrollbar
                         max-h-[40vh] sm:max-h-[42vh] md:max-h-[44vh] lg:max-h-none lg:h-full
                         px-3 sm:px-4 pt-6 sm:pt-7 pb-3 sm:pb-4 lg:px-5 lg:pt-8 lg:pb-8
                         border-b lg:border-b-0 lg:border-r border-white/[0.07]
                         bg-gradient-to-b from-[#0b0e18] to-[#07090f]"
            >
              <div className="flex gap-3 sm:gap-4 lg:block">
                <div className="relative shrink-0 w-[85px] sm:w-[100px] md:w-[110px] lg:w-full aspect-[3/4]
                                rounded-lg sm:rounded-xl lg:rounded-2xl overflow-hidden
                                border border-white/[0.08] bg-black shadow-xl lg:shadow-2xl">
                  <img src={posterImage} className="w-full h-full object-cover" alt={attributes?.canonicalTitle} />
                </div>

                <div className="flex flex-col justify-between flex-1 lg:hidden py-0.5 min-w-0">
                  <div>
                    <p className="text-indigo-400/80 text-[7px] sm:text-[8px] font-black uppercase tracking-[0.4em] mb-1">Manga</p>
                    <h2 className="text-white text-[13px] sm:text-[15px] md:text-[16px] font-black italic uppercase tracking-tight leading-[1.1] line-clamp-3">
                      {attributes?.canonicalTitle}
                    </h2>
                  </div>
                  <button className="mt-2 sm:mt-3 w-full bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white py-1.5 sm:py-2 rounded-lg font-black text-[8px] sm:text-[9px] uppercase tracking-widest transition-all">
                    + Simpan
                  </button>
                </div>
              </div>

              <button className="hidden lg:flex items-center justify-center gap-2 mt-5 w-full bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-indigo-950/40">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
                Simpan ke Pustaka
              </button>

              <div className="hidden lg:block mt-6 pt-5 border-t border-white/[0.06] space-y-3">
                <p className="text-[9px] text-white font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-sm bg-indigo-500 inline-block" />
                  Informasi Manga
                </p>
                {detailData.map((d, i) =>
                  d.value ? (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-[7px] text-gray-500 font-black uppercase tracking-widest w-[55px] shrink-0 mt-0.5 leading-tight">{d.label}</span>
                      <span className="text-[10px] text-gray-300 font-medium leading-snug break-words flex-1">{d.value}</span>
                    </div>
                  ) : null
                )}
              </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col overflow-hidden bg-[#07090f] min-h-0">
              <header className="shrink-0 px-3 sm:px-5 lg:px-6 pt-2 sm:pt-4 lg:pt-5 pb-0 border-b border-white/[0.07] bg-[#07090f]/95 backdrop-blur-md z-20">
                <div className="hidden lg:block mb-3 pr-8">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-px w-5 bg-indigo-500" />
                    <span className="text-indigo-400/80 text-[8px] font-black uppercase tracking-[0.5em]">Katalog Manga</span>
                  </div>
                  <h2 className="text-2xl xl:text-3xl font-black italic text-white uppercase tracking-tight leading-[1.1] line-clamp-2">
                    {attributes?.canonicalTitle}
                  </h2>
                </div>

                <nav className="flex overflow-x-auto no-scrollbar gap-1 sm:gap-2 md:gap-3">
                  {TABS.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-2 sm:px-3 pb-2 sm:pb-3 pt-1 text-[8px] sm:text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.25em] relative transition-all shrink-0 ${
                        activeTab === tab ? 'text-indigo-400' : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      {tab}
                      {activeTab === tab && (
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] sm:h-[3px] bg-indigo-500 rounded-t-full shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                      )}
                    </button>
                  ))}
                </nav>
              </header>

              <div className="flex-1 overflow-y-auto no-scrollbar p-3 sm:p-5 lg:p-6 pt-4 sm:pt-5 pb-6 sm:pb-8">
                {loadingDetail && activeTab === 'Sinopsis' ? (
                  <div className="flex flex-col items-center justify-center py-16 sm:py-20 gap-3 opacity-40">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-[9px] sm:text-[10px] font-black text-indigo-400 uppercase tracking-widest">Menyiapkan Data...</span>
                  </div>
                ) : (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 text-left">
                    
                    {/* SINOPSIS */}
                    {activeTab === 'Sinopsis' && (
                      <div className="max-w-3xl space-y-4">
                        {isTranslating ? (
                          <div className="flex items-center gap-2 sm:gap-3 py-4 sm:py-5 opacity-60">
                            <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            <span className="text-xs text-indigo-300 font-medium">Sedang menerjemahkan sinopsis...</span>
                          </div>
                        ) : (
                          <p className="text-gray-300 text-xs sm:text-sm md:text-[15px] leading-relaxed font-medium">
                            {translatedSynopsis || 'Maaf, sinopsis untuk manga ini belum tersedia di database kami.'}
                          </p>
                        )}
                      </div>
                    )}

                    {/* DAFTAR BAB (Dengan Pagination Bertahap) */}
                    {activeTab === 'Bab' && (
                      <div className="space-y-5">
                        {chapters.length > 0 ? (
                          <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                              {chapters.map((ch: any, i: number) => (
                                <div key={`${ch.id}-${i}`} className="flex gap-2 sm:gap-3 p-2 sm:p-3 bg-white/[0.03] hover:bg-white/[0.06] transition-colors rounded-lg sm:rounded-xl border border-white/[0.05]">
                                  <div className="w-10 h-14 sm:w-12 sm:h-16 bg-gray-900 rounded-md sm:rounded-lg shrink-0 overflow-hidden border border-white/10 flex items-center justify-center">
                                    {ch.attributes?.thumbnail?.original || posterImage ? (
                                      <img src={ch.attributes?.thumbnail?.original || posterImage} className="w-full h-full object-cover" alt="" />
                                    ) : (
                                      <span className="text-gray-600 text-[8px] font-bold">No Img</span>
                                    )}
                                  </div>
                                  <div className="flex flex-col justify-center min-w-0">
                                     <span className="text-indigo-400 text-[7px] sm:text-[8px] font-black uppercase tracking-widest mb-0.5 sm:mb-1">
                                       Bab {ch.attributes?.number || '?'}
                                     </span>
                                     <h4 className="text-white text-xs sm:text-sm font-bold truncate">
                                       {ch.attributes?.canonicalTitle || `Chapter ${ch.attributes?.number || ''}`}
                                     </h4>
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            {/* Tombol Load More untuk Bab */}
                            {hasMoreChapters && (
                              <div className="flex justify-center pt-3 sm:pt-4">
                                <button
                                  onClick={() => fetchChapters(chapterOffset + 20)}
                                  disabled={isLoadingChapters}
                                  className="px-4 sm:px-5 py-1.5 sm:py-2 bg-white/5 hover:bg-indigo-600 border border-white/10 hover:border-indigo-500 rounded-lg text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 hover:text-white transition-all disabled:opacity-50"
                                >
                                  {isLoadingChapters ? 'Memuat...' : 'Muat Bab Selanjutnya'}
                                </button>
                              </div>
                            )}
                          </>
                        ) : (
                          !isLoadingChapters && (
                            <div className="text-center py-12 sm:py-14">
                               <p className="text-gray-500 text-xs sm:text-sm font-medium">Belum ada daftar bab yang ditambahkan untuk manga ini.</p>
                            </div>
                          )
                        )}
                        
                        {/* Skeleton loader awal untuk tab bab */}
                        {isLoadingChapters && chapters.length === 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 animate-pulse">
                            {[...Array(6)].map((_, i) => (
                              <div key={i} className="h-[70px] sm:h-[80px] bg-white/[0.03] rounded-lg sm:rounded-xl border border-white/[0.05]" />
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* KARAKTER */}
                    {activeTab === 'Karakter' && (
                      characters.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                          {characters.map((char: any, i: number) => (
                            <div key={i} className="bg-white/[0.03] border border-white/[0.05] p-1.5 sm:p-2 rounded-xl sm:rounded-2xl flex flex-col group">
                              <div className="overflow-hidden rounded-lg sm:rounded-xl aspect-[3/4] bg-gray-900 mb-1 sm:mb-2">
                                <img src={char.image || 'https://placehold.co/300x400/1a1a2e/ffffff?text=?'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={char.name} />
                              </div>
                              <div className="bg-white/[0.05] rounded-md sm:rounded-lg py-1 sm:py-2 mt-auto">
                                <p className="text-[8px] sm:text-[10px] font-bold text-gray-300 group-hover:text-white text-center truncate px-1 sm:px-2">{char.name}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 sm:py-14">
                           <p className="text-gray-500 text-xs sm:text-sm font-medium">Informasi karakter belum tersedia.</p>
                        </div>
                      )
                    )}

                    {/* ULASAN PEMBACA */}
                    {activeTab === 'Ulasan' && (
                      reviews.length > 0 ? (
                        <div className="space-y-3 sm:space-y-4">
                          {reviews.map((rev: any, i: number) => (
                            <div key={i} className="bg-white/[0.02] p-3 sm:p-4 lg:p-5 rounded-xl sm:rounded-2xl flex flex-col sm:flex-row gap-3 sm:gap-4 border border-white/[0.05]">
                              <img src={rev.user?.attributes?.avatar?.medium || rev.user?.attributes?.avatar?.tiny || 'https://placehold.co/100x100/1a1a2e/ffffff?text=U'} className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full object-cover border-2 border-indigo-500/30" alt="Avatar" />
                              <div className="flex-1">
                                 <p className="text-white text-xs sm:text-sm font-bold mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2 flex-wrap">
                                   {rev.user?.attributes?.name || 'Pengguna Anonim'}
                                   <span className="text-yellow-500 text-[9px] sm:text-xs bg-yellow-500/10 px-1.5 sm:px-2 py-0.5 rounded-full">★ {rev.attributes?.likesCount} Likes</span>
                                 </p>
                                 <p className="text-gray-400 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{rev.attributes?.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 sm:py-14">
                           <p className="text-gray-500 text-xs sm:text-sm font-medium">Belum ada ulasan pembaca untuk manga ini. Jadilah yang pertama!</p>
                        </div>
                      )
                    )}

                    {/* TERKAIT / FRANCHISE */}
                    {activeTab === 'Terkait' && (
                      franchise.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                          {franchise.map((f: any, i: number) => (
                            <div key={i} className="bg-white/[0.03] hover:bg-white/[0.06] transition-colors p-2 sm:p-3 rounded-xl sm:rounded-2xl flex gap-2 sm:gap-3 items-center border border-white/[0.05]">
                              <img src={f.dest?.attributes?.posterImage?.small || f.dest?.attributes?.posterImage?.tiny || posterImage} className="w-10 h-14 sm:w-12 sm:h-16 rounded-md sm:rounded-lg object-cover bg-gray-900 border border-white/10" alt="" />
                              <div className="min-w-0 flex-1">
                                <p className="text-[7px] sm:text-[9px] text-indigo-400 font-black uppercase tracking-widest mb-1">{f.role}</p>
                                <p className="text-xs sm:text-sm text-white font-bold truncate">{f.dest?.attributes?.canonicalTitle || 'Unknown Title'}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 sm:py-14">
                           <p className="text-gray-500 text-xs sm:text-sm font-medium">Tidak ada media/franchise terkait yang ditemukan.</p>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      )}
    </>
  );
}