'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface MangaCardProps {
  manga: any;
}

export default function MangaCard({ manga }: MangaCardProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeTab,     setActiveTab]     = useState('Sinopsis');
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [chapters,   setChapters]   = useState<any[]>([]);
  const [characters, setCharacters] = useState<any[]>([]);
  const [reviews,    setReviews]    = useState<any[]>([]);
  const [franchise,  setFranchise]  = useState<any[]>([]);
  const [fullDetail, setFullDetail] = useState<any>(null);

  // Loading state per tab
  const [loadingCharacters, setLoadingCharacters] = useState(false);
  const [loadingReviews,    setLoadingReviews]    = useState(false);
  const [loadingFranchise,  setLoadingFranchise]  = useState(false);

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
    if (!dateString) return 'Belum diumumkan';
    return new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  useEffect(() => {
    if (isPreviewOpen) {
      document.body.style.overflow = 'hidden';
      fetchInitialInfo();
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

  const translateText = async (text: string) => {
    setIsTranslating(true);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      setTranslatedSynopsis(data.translatedText || data.text || data.result || text);
    } catch (e) {
      console.error("Gagal menerjemahkan sinopsis:", e);
      setTranslatedSynopsis(text);
    } finally {
      setIsTranslating(false);
    }
  };

  const fetchChapters = useCallback(async (offset = 0) => {
    setIsLoadingChapters(true);
    try {
      const res = await fetch(
        `https://kitsu.io/api/edge/manga/${manga.id}/chapters?page[limit]=20&page[offset]=${offset}`,
        { headers: KITSU_HEADERS }
      );
      const data = await res.json();
      const fetchedChapters = data.data || [];

      if (offset === 0) {
        setChapters(fetchedChapters);
      } else {
        setChapters(prev => [...prev, ...fetchedChapters]);
      }
      
      setHasMoreChapters(fetchedChapters.length === 20);
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
      const res  = await fetch(
        `https://kitsu.io/api/edge/manga/${manga.id}?include=genres,productions.producer`,
        { headers: KITSU_HEADERS }
      );
      const data = await res.json();
      setFullDetail(data);
    } catch (e) { 
      console.error("Gagal memuat detail:", e); 
    } finally { 
      setLoadingDetail(false); 
    }
  };

  useEffect(() => {
    if (!isPreviewOpen) return;
    const fetchTabData = async () => {
      try {
        if (activeTab === 'Bab' && chapters.length === 0) {
          fetchChapters(0);

        } else if (activeTab === 'Karakter' && characters.length === 0) {
          setLoadingCharacters(true);
          const res  = await fetch(
            `https://kitsu.io/api/edge/castings?filter[media_id]=${manga.id}&filter[media_type]=Manga&filter[is_character]=true&include=character&page[limit]=16`,
            { headers: KITSU_HEADERS }
          );
          const data = await res.json();
          setCharacters(
            data.data?.map((item: any) => {
              const char = data.included?.find((inc: any) =>
                inc.type === 'characters' && inc.id === item.relationships?.character?.data?.id
              );
              return {
                name: char?.attributes?.name,
                image: char?.attributes?.image?.original || char?.attributes?.image?.large
              };
            }).filter((c: any) => c.name) || []
          );
          setLoadingCharacters(false);

        } else if (activeTab === 'Ulasan' && reviews.length === 0) {
          setLoadingReviews(true);
          const res  = await fetch(
            `https://kitsu.io/api/edge/manga/${manga.id}/reviews?include=user&page[limit]=10&sort=-likesCount`,
            { headers: KITSU_HEADERS }
          );
          const data = await res.json();
          setReviews(
            data.data?.map((r: any) => ({
              ...r,
              user: data.included?.find((inc: any) =>
                inc.type === 'users' && inc.id === r.relationships?.user?.data?.id
              ),
            })) || []
          );
          setLoadingReviews(false);

        } else if (activeTab === 'Terkait' && franchise.length === 0) {
          setLoadingFranchise(true);
          const res  = await fetch(
            `https://kitsu.io/api/edge/manga/${manga.id}/media-relationships?include=destination`,
            { headers: KITSU_HEADERS }
          );
          const data = await res.json();
          setFranchise(
            data.data?.map((rel: any) => ({
              role: rel.attributes.role,
              dest: data.included?.find((inc: any) =>
                inc.id === rel.relationships?.destination?.data?.id
              ),
            })) || []
          );
          setLoadingFranchise(false);
        }
      } catch (e) { 
        console.error("Gagal memuat data tab:", e);
        setLoadingCharacters(false);
        setLoadingReviews(false);
        setLoadingFranchise(false);
      }
    };
    fetchTabData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isPreviewOpen, manga.id]);

  const getStudios = () => {
    const prods = fullDetail?.included?.filter((i: any) => i.type === 'producers') || [];
    return prods.map((p: any) => p.attributes.name).join(', ');
  };

  const seasonName = attributes?.season
    ? attributes.season.charAt(0).toUpperCase() + attributes.season.slice(1)
    : "";
  const releaseYear = attributes?.startDate ? attributes.startDate.substring(0, 4) : "";
  const displaySeason = seasonName || releaseYear ? `${seasonName} ${releaseYear}`.trim() : "Belum diumumkan";

  const detailData = [
    { label: 'Judul Inggris', value: attributes?.titles?.en },
    { label: 'Judul Jepang', value: attributes?.titles?.ja_jp },
    { label: 'Romaji',       value: attributes?.titles?.en_jp },
    { label: 'Tipe',         value: attributes?.mangaType?.toUpperCase() },
    { label: 'Volume',       value: attributes?.volumeCount },
    { label: 'Total Bab',    value: attributes?.chapterCount },
    {
      label: 'Status',
      value: attributes?.status === 'finished' ? '✅ Sudah tamat' : '🔄 Masih terbit'
    },
    {
      label: 'Tanggal Terbit',
      value: attributes?.startDate
        ? `${formatDate(attributes.startDate)}${attributes.endDate ? ` — ${formatDate(attributes.endDate)}` : ' — sekarang'}`
        : 'Belum diumumkan'
    },
    { label: 'Musim',      value: displaySeason },
    { label: 'Penerbit',   value: getStudios() || 'Tidak diketahui' },
    { label: 'Batasan Usia', value: attributes?.ageRatingGuide },
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
            alt={attributes?.canonicalTitle || "Sampul Manga"}
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
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-2.5 py-1.5">
              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
              </svg>
              <span className="text-white text-[8px] font-bold uppercase tracking-widest">Lihat Detail</span>
            </div>
          </div>
        </div>

        <div className="px-2.5 sm:px-3 pt-2 sm:pt-2.5 pb-2.5 sm:pb-3">
          <h3 className="text-[10px] sm:text-[11px] md:text-xs font-bold text-gray-300 group-hover:text-white truncate transition-colors leading-snug">
            {attributes?.canonicalTitle}
          </h3>
          {attributes?.startDate && (
            <p className="text-[8px] sm:text-[9px] text-gray-500 mt-0.5 font-medium">
              {attributes.startDate.substring(0, 4)}
            </p>
          )}
        </div>
      </div>

      {/* ═══ MODAL ═══ */}
      {isPreviewOpen && (
        <div
          className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center
                     bg-black/80 backdrop-blur-sm p-0 sm:p-3 md:p-4 lg:p-6"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div
            className="relative w-full sm:max-w-2xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl
                       h-[92dvh] sm:h-[88vh] md:h-[85vh] lg:h-[87vh]
                       bg-[#07090f] border border-white/[0.07]
                       rounded-t-[28px] sm:rounded-2xl md:rounded-3xl
                       flex flex-col lg:flex-row overflow-hidden
                       shadow-[0_-30px_100px_rgba(0,0,0,0.9)] sm:shadow-[0_20px_80px_rgba(0,0,0,0.9)]
                       animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-300 ease-out"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle — mobile only */}
            <div className="sm:hidden absolute top-0 inset-x-0 flex justify-center pt-2.5 z-10 pointer-events-none">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {/* Tombol tutup */}
            <button
              onClick={() => setIsPreviewOpen(false)}
              aria-label="Tutup"
              className="absolute top-3 right-3 sm:top-3.5 sm:right-3.5 lg:top-4 lg:right-4 z-50
                         w-8 h-8 flex items-center justify-center
                         bg-white/[0.07] hover:bg-white/[0.14] active:scale-90
                         border border-white/[0.1] rounded-xl
                         text-gray-400 hover:text-white transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* ── SIDEBAR ── */}
            <aside
              className="shrink-0 w-full lg:w-[270px] xl:w-[310px]
                         flex flex-col overflow-y-auto no-scrollbar
                         max-h-[28vh] sm:max-h-[30vh] md:max-h-[32vh] lg:max-h-none lg:h-full
                         px-4 sm:px-5 pt-7 sm:pt-8 pb-3
                         lg:px-6 lg:pt-8 lg:pb-8
                         border-b lg:border-b-0 lg:border-r border-white/[0.07]
                         bg-gradient-to-b from-[#0b0e18] to-[#07090f]"
            >
              <div className="flex gap-4 lg:block">
                {/* Poster */}
                <div className="relative shrink-0 w-[88px] sm:w-[104px] md:w-[116px] lg:w-full aspect-[3/4]
                                rounded-xl lg:rounded-2xl overflow-hidden
                                border border-white/[0.08] bg-black shadow-xl lg:shadow-2xl">
                  <img src={posterImage} className="w-full h-full object-cover" alt={attributes?.canonicalTitle} />
                </div>

                {/* Info ringkas — hanya mobile/tablet */}
                <div className="flex flex-col justify-between flex-1 lg:hidden py-0.5 min-w-0">
                  <div>
                    <p className="text-indigo-400/80 text-[7px] sm:text-[8px] font-black uppercase tracking-[0.4em] mb-1">
                      Manga
                    </p>
                    <h2 className="text-white text-sm sm:text-base font-black italic uppercase tracking-tight leading-tight line-clamp-3">
                      {attributes?.canonicalTitle}
                    </h2>
                  </div>
                  <button className="mt-3 w-full bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white py-2 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all">
                    + Simpan ke Daftar
                  </button>
                </div>
              </div>

              {/* Tombol simpan — hanya desktop */}
              <button className="hidden lg:flex items-center justify-center gap-2 mt-5 w-full bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-indigo-950/40">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/>
                </svg>
                Simpan ke Daftar Bacaan
              </button>

              {/* Detail info — hanya desktop */}
              <div className="hidden lg:block mt-6 pt-5 border-t border-white/[0.06] space-y-3">
                <p className="text-[9px] text-white font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-sm bg-indigo-500 inline-block" />
                  Info Manga
                </p>
                {detailData.map((d, i) =>
                  d.value ? (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-[7px] text-gray-500 font-black uppercase tracking-widest w-[60px] shrink-0 mt-0.5 leading-tight">
                        {d.label}
                      </span>
                      <span className="text-[10px] text-gray-300 font-medium leading-snug break-words flex-1">
                        {d.value}
                      </span>
                    </div>
                  ) : null
                )}
              </div>
            </aside>

            {/* ── MAIN CONTENT ── */}
            <main className="flex-1 flex flex-col overflow-hidden bg-[#07090f] min-h-0">

              {/* Header + Tab Navigation */}
              <header className="shrink-0 px-4 sm:px-5 lg:px-7 pt-2 sm:pt-4 lg:pt-6 pb-0 border-b border-white/[0.07] bg-[#07090f]/95 backdrop-blur-md z-20">
                {/* Judul — hanya desktop */}
                <div className="hidden lg:block mb-4 pr-10">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-px w-5 bg-indigo-500" />
                    <span className="text-indigo-400/80 text-[8px] font-black uppercase tracking-[0.5em]">
                      Katalog Manga
                    </span>
                  </div>
                  <h2 className="text-2xl xl:text-3xl font-black italic text-white uppercase tracking-tight leading-tight line-clamp-2">
                    {attributes?.canonicalTitle}
                  </h2>
                </div>

                {/* Tab Bar */}
                <nav className="flex overflow-x-auto no-scrollbar gap-0.5 sm:gap-1">
                  {TABS.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 sm:px-4 pb-2.5 sm:pb-3 pt-1.5 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] relative transition-all shrink-0 ${
                        activeTab === tab
                          ? 'text-indigo-400'
                          : 'text-gray-500 hover:text-gray-300'
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

              {/* Konten Tab */}
              <div className="flex-1 overflow-y-auto no-scrollbar p-4 sm:p-5 lg:p-7 pt-5 pb-8 sm:pb-10">
                {loadingDetail && activeTab === 'Sinopsis' ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3 opacity-40">
                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                      Sebentar ya, lagi disiapkan...
                    </span>
                  </div>
                ) : (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 text-left">

                    {/* ── SINOPSIS ── */}
                    {activeTab === 'Sinopsis' && (
                      <div className="max-w-3xl space-y-5">
                        {isTranslating ? (
                          <div className="flex items-center gap-3 py-5 opacity-60">
                            <svg className="animate-spin h-5 w-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span className="text-sm text-indigo-300 font-medium">
                              Sedang menerjemahkan sinopsis ke Bahasa Indonesia...
                            </span>
                          </div>
                        ) : (
                          <p className="text-gray-300 text-sm sm:text-[15px] md:text-base leading-relaxed font-normal">
                            {translatedSynopsis ||
                              'Sinopsis untuk manga ini belum tersedia. Kamu bisa cek di sumber lain sementara kami perbarui datanya.'}
                          </p>
                        )}

                        {/* Info detail — hanya mobile/tablet, desktop pakai sidebar */}
                        <div className="lg:hidden pt-4 border-t border-white/[0.07]">
                          <p className="text-[8px] text-white font-black uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-sm bg-indigo-500 inline-block" />
                            Info Manga
                          </p>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                            {detailData.map((d, i) =>
                              d.value ? (
                                <div key={i} className={`flex flex-col gap-0.5 ${d.label === 'Tanggal Terbit' ? 'col-span-2' : ''}`}>
                                  <span className="text-[7px] text-gray-500 font-black uppercase tracking-widest leading-tight">
                                    {d.label}
                                  </span>
                                  <span className="text-[11px] text-gray-200 font-medium leading-snug break-words">
                                    {d.value}
                                  </span>
                                </div>
                              ) : null
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ── DAFTAR BAB ── */}
                    {activeTab === 'Bab' && (
                      <div className="space-y-5">
                        {chapters.length > 0 ? (
                          <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                              {chapters.map((ch: any, i: number) => (
                                <div
                                  key={`${ch.id}-${i}`}
                                  className="flex gap-3 p-2.5 sm:p-3 bg-white/[0.03] hover:bg-white/[0.06] transition-colors rounded-xl border border-white/[0.05] cursor-pointer"
                                >
                                  <div className="w-11 h-16 sm:w-12 sm:h-[68px] bg-gray-900 rounded-lg shrink-0 overflow-hidden border border-white/10 flex items-center justify-center">
                                    {(ch.attributes?.thumbnail?.original || posterImage) ? (
                                      <img
                                        src={ch.attributes?.thumbnail?.original || posterImage}
                                        className="w-full h-full object-cover"
                                        alt=""
                                      />
                                    ) : (
                                      <span className="text-gray-600 text-[8px] font-bold text-center leading-tight px-1">Tidak ada gambar</span>
                                    )}
                                  </div>
                                  <div className="flex flex-col justify-center min-w-0 gap-0.5">
                                    <span className="text-indigo-400 text-[8px] font-black uppercase tracking-widest">
                                      Bab {ch.attributes?.number ?? '—'}
                                    </span>
                                    <h4 className="text-white text-xs sm:text-sm font-semibold truncate leading-snug">
                                      {ch.attributes?.canonicalTitle || `Chapter ${ch.attributes?.number ?? ''}`}
                                    </h4>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {hasMoreChapters && (
                              <div className="flex justify-center pt-4">
                                <button
                                  onClick={() => fetchChapters(chapterOffset + 20)}
                                  disabled={isLoadingChapters}
                                  className="px-6 py-2.5 bg-white/5 hover:bg-indigo-600 border border-white/10 hover:border-indigo-500 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 hover:text-white transition-all disabled:opacity-50 active:scale-95"
                                >
                                  {isLoadingChapters ? 'Memuat bab berikutnya...' : 'Tampilkan bab selanjutnya'}
                                </button>
                              </div>
                            )}
                          </>
                        ) : (
                          !isLoadingChapters && (
                            <div className="text-center py-14">
                              <p className="text-gray-500 text-sm font-medium">
                                Daftar bab belum tersedia untuk manga ini. Nantikan pembaruan selanjutnya!
                              </p>
                            </div>
                          )
                        )}

                        {/* Skeleton loader bab */}
                        {isLoadingChapters && chapters.length === 0 && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 opacity-50">
                              <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                                Sedang memuat daftar bab, sabar ya...
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 animate-pulse">
                              {[...Array(6)].map((_, i) => (
                                <div key={i} className="flex gap-3 p-2.5 bg-white/[0.03] rounded-xl border border-white/[0.05]">
                                  <div className="w-11 h-16 bg-white/[0.05] rounded-lg shrink-0" />
                                  <div className="flex-1 space-y-2 py-2">
                                    <div className="h-2 bg-white/[0.05] rounded-full w-1/4" />
                                    <div className="h-3 bg-white/[0.04] rounded-full w-3/4" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── KARAKTER ── */}
                    {activeTab === 'Karakter' && (
                      loadingCharacters ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 opacity-50">
                            <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                              Lagi nyari karakter-karakternya...
                            </span>
                          </div>
                          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 animate-pulse">
                            {[...Array(8)].map((_, i) => (
                              <div key={i} className="flex flex-col gap-2">
                                <div className="aspect-[3/4] bg-white/[0.05] rounded-xl" />
                                <div className="h-2.5 bg-white/[0.05] rounded-full w-3/4 mx-auto" />
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : characters.length > 0 ? (
                        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
                          {characters.map((char: any, i: number) => (
                            <div key={i} className="bg-white/[0.03] border border-white/[0.05] p-1.5 sm:p-2 rounded-2xl flex flex-col group">
                              <div className="overflow-hidden rounded-xl aspect-[3/4] bg-gray-900 mb-2">
                                <img
                                  src={char.image || 'https://placehold.co/300x400/1a1a2e/ffffff?text=?'}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                  alt={char.name}
                                />
                              </div>
                              <div className="bg-white/[0.05] rounded-lg py-1.5 mt-auto">
                                <p className="text-[9px] sm:text-[10px] font-bold text-gray-300 group-hover:text-white text-center truncate px-2">
                                  {char.name}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-14">
                          <p className="text-gray-500 text-sm font-medium">
                            Informasi karakter untuk manga ini belum ada. Mungkin segera ditambahkan!
                          </p>
                        </div>
                      )
                    )}

                    {/* ── ULASAN ── */}
                    {activeTab === 'Ulasan' && (
                      loadingReviews ? (
                        <div className="space-y-3 sm:space-y-4">
                          <div className="flex items-center gap-2 opacity-50">
                            <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                              Mengumpulkan pendapat para pembaca...
                            </span>
                          </div>
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white/[0.02] p-3.5 sm:p-4 rounded-2xl border border-white/[0.05] flex gap-3 animate-pulse">
                              <div className="w-9 h-9 rounded-full bg-white/[0.06] shrink-0" />
                              <div className="flex-1 space-y-2 py-1">
                                <div className="h-2.5 bg-white/[0.06] rounded-full w-1/3" />
                                <div className="h-2 bg-white/[0.04] rounded-full w-full" />
                                <div className="h-2 bg-white/[0.04] rounded-full w-4/5" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : reviews.length > 0 ? (
                        <div className="space-y-3 sm:space-y-4">
                          {reviews.map((rev: any, i: number) => (
                            <div
                              key={i}
                              className="bg-white/[0.02] p-3.5 sm:p-4 lg:p-5 rounded-2xl flex flex-col sm:flex-row gap-3 sm:gap-4 border border-white/[0.05]"
                            >
                              <img
                                src={rev.user?.attributes?.avatar?.medium || rev.user?.attributes?.avatar?.tiny || 'https://placehold.co/100x100/1a1a2e/ffffff?text=U'}
                                className="w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-full object-cover border-2 border-indigo-500/30 shrink-0"
                                alt="Avatar"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-xs sm:text-sm font-bold mb-1.5 flex items-center gap-2 flex-wrap">
                                  {rev.user?.attributes?.name || 'Pembaca Anonim'}
                                  <span className="text-yellow-500 text-[9px] bg-yellow-500/10 px-2 py-0.5 rounded-full font-semibold">
                                    ★ {rev.attributes?.likesCount} suka
                                  </span>
                                </p>
                                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                                  {rev.attributes?.content}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-14">
                          <p className="text-gray-500 text-sm font-medium">
                            Belum ada ulasan dari pembaca. Kamu bisa jadi yang pertama memberikan pendapat!
                          </p>
                        </div>
                      )
                    )}

                    {/* ── TERKAIT ── */}
                    {activeTab === 'Terkait' && (
                      loadingFranchise ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 opacity-50">
                            <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                              Mencari manga dan anime yang berhubungan...
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 animate-pulse">
                            {[...Array(4)].map((_, i) => (
                              <div key={i} className="flex gap-3 items-center p-2.5 bg-white/[0.02] rounded-2xl border border-white/[0.04]">
                                <div className="w-11 h-16 rounded-lg bg-white/[0.06] shrink-0" />
                                <div className="flex-1 space-y-2">
                                  <div className="h-2 bg-white/[0.06] rounded-full w-1/3" />
                                  <div className="h-3 bg-white/[0.05] rounded-full w-4/5" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : franchise.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                          {franchise.map((f: any, i: number) => (
                            <div
                              key={i}
                              className="bg-white/[0.03] hover:bg-white/[0.06] transition-colors p-2.5 sm:p-3 rounded-2xl flex gap-3 items-center border border-white/[0.05] cursor-pointer"
                            >
                              <img
                                src={f.dest?.attributes?.posterImage?.small || f.dest?.attributes?.posterImage?.tiny || posterImage}
                                className="w-11 h-16 sm:w-12 sm:h-[68px] rounded-lg object-cover bg-gray-900 border border-white/10 shrink-0"
                                alt=""
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-[8px] sm:text-[9px] text-indigo-400 font-black uppercase tracking-widest mb-1">
                                  {f.role}
                                </p>
                                <p className="text-xs sm:text-sm text-white font-bold truncate">
                                  {f.dest?.attributes?.canonicalTitle || 'Judul tidak diketahui'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-14">
                          <p className="text-gray-500 text-sm font-medium">
                            Tidak ada manga atau anime terkait yang ditemukan saat ini.
                          </p>
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