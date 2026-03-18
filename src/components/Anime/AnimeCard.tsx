'use client';

import React, { useState, useEffect } from 'react';

interface AnimeCardProps {
  anime: any;
}

export default function AnimeCard({ anime }: AnimeCardProps) {
  const [isPreviewOpen, setIsPreviewOpen]     = useState(false);
  const [activeTab, setActiveTab]             = useState('Ringkasan');
  const [translatedSynopsis, setTranslatedSynopsis] = useState('');
  const [isTranslating, setIsTranslating]     = useState(false);
  const [isPlayingTrailer, setIsPlayingTrailer] = useState(false);

  const [episodes, setEpisodes]           = useState<any[]>([]);
  const [characters, setCharacters]       = useState<any[]>([]);
  const [franchise, setFranchise]         = useState<any[]>([]);
  const [streamingLinks, setStreamingLinks] = useState<any[]>([]);
  const [reactions, setReactions]         = useState<any[]>([]);
  const [productions, setProductions]     = useState<{ studios: string[] }>({ studios: [] });

  const [loadingDetail, setLoadingDetail]   = useState(false);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  const attributes  = anime.attributes || anime;
  const posterImage =
    attributes?.posterImage?.large ||
    attributes?.posterImage?.original ||
    attributes?.images?.jpg?.large_image_url;
  const youtubeId = attributes?.youtubeVideoId || attributes?.trailer?.youtube_id;

  const TABS = ['Ringkasan', 'Episode', 'Karakter', 'Reaksi', 'Franchise', 'Streaming'];

  const KITSU_HEADERS = {
    Accept: 'application/vnd.api+json',
    'Content-Type': 'application/vnd.api+json',
  };

  const convertToWIB = (timeString: string) => {
    if (!timeString || timeString === 'TBA') return 'Belum diumumkan';
    try {
      const [hours, minutes] = timeString.split(':').map(Number);
      if (isNaN(hours)) return timeString;
      let h = hours - 2;
      if (h < 0) h += 24;
      return `${h.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} WIB`;
    } catch {
      return timeString;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Belum diumumkan';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  // ── Translate sinopsis ────────────────────────────────────────
  const translateSynopsis = async (text: string) => {
    if (!text || translatedSynopsis) return;
    setIsTranslating(true);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error('Translate failed');
      const data = await res.json();
      setTranslatedSynopsis(data.translatedText || text);
    } catch {
      setTranslatedSynopsis(text);
    } finally {
      setIsTranslating(false);
    }
  };

  // ── Fetch episode rekursif ────────────────────────────────────
  const fetchEpisodesRecursive = async (offset = 0) => {
    if (offset === 0) {
      setLoadingEpisodes(true);
      setEpisodes([]);
    }
    try {
      const res = await fetch(
        `https://kitsu.io/api/edge/anime/${anime.id}/episodes?page[limit]=20&page[offset]=${offset}`,
        { headers: KITSU_HEADERS }
      );
      if (!res.ok) { setLoadingEpisodes(false); return; }
      const result = await res.json();
      const batch = result.data || [];
      if (batch.length > 0) {
        setEpisodes(prev => [...prev, ...batch]);
        if (batch.length === 20) fetchEpisodesRecursive(offset + 20);
        else setLoadingEpisodes(false);
      } else {
        setLoadingEpisodes(false);
      }
    } catch (e) {
      console.error(e);
      setLoadingEpisodes(false);
    }
  };

  // ── Fetch data per tab ────────────────────────────────────────
  useEffect(() => {
    if (!isPreviewOpen || !anime.id) return;

    const fetchData = async () => {
      if (attributes?.synopsis) translateSynopsis(attributes.synopsis);

      setLoadingDetail(true);
      try {
        // Studio — selalu fetch sekali
        if (productions.studios.length === 0) {
          const resProd = await fetch(
            `https://kitsu.io/api/edge/anime/${anime.id}/productions?include=producer`,
            { headers: KITSU_HEADERS }
          );
          if (resProd.ok) {
            const dataProd = await resProd.json();
            const studios = dataProd.data
              ?.filter((p: any) => p.attributes.role === 'studio')
              .map((p: any) =>
                dataProd.included?.find(
                  (inc: any) =>
                    inc.type === 'producers' &&
                    inc.id === p.relationships.producer.data.id
                )?.attributes?.name
              )
              .filter(Boolean);
            setProductions({ studios: studios || [] });
          }
        }

        if (activeTab === 'Episode' && episodes.length === 0) {
          fetchEpisodesRecursive(0);

        } else if (activeTab === 'Streaming' && streamingLinks.length === 0) {
          const res = await fetch(
            `https://kitsu.io/api/edge/anime/${anime.id}/streaming-links`,
            { headers: KITSU_HEADERS }
          );
          if (res.ok) {
            const data = await res.json();
            setStreamingLinks(data?.data || []);
          }

        } else if (activeTab === 'Karakter' && characters.length === 0) {
          const res = await fetch(
            `https://kitsu.io/api/edge/castings?filter[media_id]=${anime.id}&filter[media_type]=Anime&filter[is_character]=true&filter[language]=Japanese&include=character,person&page[limit]=15`,
            { headers: KITSU_HEADERS }
          );
          if (res.ok) {
            const data = await res.json();
            if (data?.data) {
              setCharacters(
                data.data.map((item: any) => {
                  const charData   = data.included?.find((inc: any) => inc.type === 'characters' && inc.id === item.relationships?.character?.data?.id);
                  const personData = data.included?.find((inc: any) => inc.type === 'people'     && inc.id === item.relationships?.person?.data?.id);
                  return {
                    name:    charData?.attributes?.name || 'Tidak diketahui',
                    image:   charData?.attributes?.image?.original || charData?.attributes?.image?.large || posterImage,
                    vaName:  personData?.attributes?.name || 'Seiyuu belum tersedia',
                    vaImage: personData?.attributes?.image?.original || personData?.attributes?.image?.medium || null,
                  };
                })
              );
            }
          }

        } else if (activeTab === 'Franchise' && franchise.length === 0) {
          const res = await fetch(
            `https://kitsu.io/api/edge/anime/${anime.id}/media-relationships?include=destination`,
            { headers: KITSU_HEADERS }
          );
          if (res.ok) {
            const data = await res.json();
            if (data.data) {
              setFranchise(
                data.data
                  .map((rel: any) => {
                    const dest = data.included?.find((inc: any) =>
                      (inc.type === 'anime' || inc.type === 'manga') &&
                      inc.id === rel.relationships.destination.data.id
                    );
                    return { role: rel.attributes.role, attributes: dest?.attributes };
                  })
                  .filter((f: any) => f.attributes)
              );
            }
          }

        } else if (activeTab === 'Reaksi' && reactions.length === 0) {
          const res = await fetch(
            `https://kitsu.io/api/edge/anime/${anime.id}/reviews?include=user&page[limit]=10&sort=-likesCount`,
            { headers: KITSU_HEADERS }
          );
          if (res.ok) {
            const data = await res.json();
            if (data?.data) {
              setReactions(
                data.data.map((review: any) => ({
                  ...review,
                  user: data.included?.find((inc: any) =>
                    inc.type === 'users' && inc.id === review.relationships?.user?.data?.id
                  ),
                }))
              );
            }
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingDetail(false);
      }
    };

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPreviewOpen, activeTab, anime.id]);

  // ── Scroll lock ───────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = isPreviewOpen ? 'hidden' : 'unset';
    if (!isPreviewOpen) {
      setActiveTab('Ringkasan');
      setIsPlayingTrailer(false);
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isPreviewOpen]);

  const getPlatformInfo = (url: string) => {
    const link = url.toLowerCase();
    if (link.includes('crunchyroll')) return { label: 'Crunchyroll', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Crunchyroll_Logo.png', color: 'from-orange-600/20 to-orange-900/5 border-orange-500/20' };
    if (link.includes('netflix'))    return { label: 'Netflix',      logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',  color: 'from-red-700/20 to-red-900/5 border-red-500/20' };
    if (link.includes('hulu'))       return { label: 'Hulu',         logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Hulu_Logo.svg',            color: 'from-green-700/20 to-green-900/5 border-green-500/20' };
    if (link.includes('disney'))     return { label: 'Disney+',      logo: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg',       color: 'from-blue-700/20 to-blue-900/5 border-blue-500/20' };
    return { label: 'Tonton Sekarang', logo: null, color: 'from-indigo-700/20 to-indigo-900/5 border-indigo-500/20' };
  };

  const seasonName  = attributes?.season ? attributes.season.charAt(0).toUpperCase() + attributes.season.slice(1) : '';
  const releaseYear = attributes?.startDate ? new Date(attributes.startDate).getFullYear() : '';

  const detailData = [
    { label: 'Status',   value: attributes?.status === 'finished' ? '✅ Sudah tamat' : '🔄 Sedang tayang' },
    { label: 'Tipe',     value: attributes?.showType?.toUpperCase() || attributes?.type },
    { label: 'Episode',  value: attributes?.episodeCount },
    { label: 'Tayang',   value: attributes?.broadcast?.time ? convertToWIB(attributes.broadcast.time) : formatDate(attributes?.startDate) },
    { label: 'Musim',    value: seasonName || releaseYear ? `${seasonName} ${releaseYear}`.trim() : 'Belum diumumkan' },
    { label: 'Studio',   value: productions.studios.length > 0 ? productions.studios.join(', ') : 'Tidak diketahui' },
    { label: 'Rating',   value: attributes?.ageRatingGuide || attributes?.rating },
  ];

  return (
    <>
      {/* ── KARTU ──────────────────────────────────────────────── */}
      <div
        onClick={() => setIsPreviewOpen(true)}
        className="group relative overflow-hidden rounded-xl sm:rounded-2xl bg-[#0d1117] border border-white/5
                   hover:border-indigo-500/50 hover:shadow-[0_8px_40px_rgba(99,102,241,0.12)]
                   cursor-pointer transition-all duration-500"
      >
        <div className="aspect-[3/4] overflow-hidden relative">
          <img
            src={posterImage}
            alt={attributes?.canonicalTitle || attributes?.title || 'Poster Anime'}
            className="h-full w-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />

          {attributes?.averageRating && (
            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-md px-1.5 py-0.5 flex items-center gap-1">
              <span className="text-yellow-400 text-[8px] leading-none">★</span>
              <span className="text-white text-[8px] font-bold leading-none">{attributes.averageRating}%</span>
            </div>
          )}

          <div className="absolute inset-0 flex items-end justify-start p-2 sm:p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-2.5 py-1.5">
              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.841z" />
              </svg>
              <span className="text-white text-[8px] font-bold uppercase tracking-widest">Lihat Detail</span>
            </div>
          </div>
        </div>

        <div className="px-2.5 sm:px-3 pt-2 sm:pt-2.5 pb-2.5 sm:pb-3">
          <h3 className="text-[10px] sm:text-[11px] font-bold text-gray-300 group-hover:text-white truncate transition-colors leading-snug">
            {attributes?.canonicalTitle || attributes?.title}
          </h3>
          {attributes?.startDate && (
            <p className="text-[8px] sm:text-[9px] text-gray-500 mt-0.5 font-medium">
              {new Date(attributes.startDate).getFullYear()}
            </p>
          )}
        </div>
      </div>

      {/* ── MODAL ──────────────────────────────────────────────── */}
      {isPreviewOpen && (
        <div
          className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center
                     bg-black/75 backdrop-blur-md p-0 sm:p-3 md:p-4 lg:p-6"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div
            className="relative w-full sm:max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl
                       h-[92dvh] sm:h-[88vh] md:h-[85vh]
                       bg-[#07090f] border border-white/[0.07]
                       rounded-t-[28px] sm:rounded-2xl md:rounded-3xl
                       flex flex-col lg:flex-row overflow-hidden
                       shadow-[0_-30px_100px_rgba(0,0,0,0.9)] sm:shadow-[0_20px_80px_rgba(0,0,0,0.9)]
                       animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-300 ease-out"
            onClick={e => e.stopPropagation()}
          >
            {/* drag handle mobile */}
            <div className="sm:hidden absolute top-0 inset-x-0 flex justify-center pt-2.5 z-10 pointer-events-none">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {/* Tombol tutup */}
            <button
              onClick={() => setIsPreviewOpen(false)}
              aria-label="Tutup"
              className="absolute top-3 right-3 sm:top-3.5 sm:right-3.5 lg:top-4 lg:right-4 z-50
                         w-8 h-8 flex items-center justify-center
                         bg-white/[0.07] hover:bg-red-500 active:scale-90
                         border border-white/[0.1] rounded-xl
                         text-gray-400 hover:text-white transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* ── SIDEBAR ───────────────────────────────────────── */}
            <aside
              className="shrink-0 w-full lg:w-[320px] xl:w-[360px]
                         flex flex-col overflow-y-auto no-scrollbar
                         max-h-[30vh] sm:max-h-[34vh] lg:max-h-none lg:h-full
                         px-4 sm:px-5 pt-7 sm:pt-8 pb-3
                         lg:px-6 lg:pt-8 lg:pb-6
                         border-b lg:border-b-0 lg:border-r border-white/[0.07]
                         bg-gradient-to-b from-[#0b0e18] to-[#07090f]"
            >
              {/* Trailer / poster */}
              <div className="relative w-full aspect-video rounded-xl lg:rounded-2xl overflow-hidden border border-white/[0.08] bg-black shadow-xl">
                {!isPlayingTrailer ? (
                  <>
                    <img src={posterImage} className="w-full h-full object-cover" alt="" />
                    {youtubeId && (
                      <button
                        onClick={() => setIsPlayingTrailer(true)}
                        className="absolute inset-0 flex items-center justify-center group/play"
                      >
                        <div className="bg-red-600 p-3.5 sm:p-4 rounded-full shadow-2xl group-hover/play:scale-110 transition-all shadow-red-950/60">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.841z" />
                          </svg>
                        </div>
                      </button>
                    )}
                  </>
                ) : (
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
                    allowFullScreen
                  />
                )}
              </div>

              {/* Detail info — desktop */}
              <div className="hidden lg:block mt-6 pt-5 border-t border-white/[0.06] space-y-3">
                <p className="text-[9px] text-white font-black uppercase tracking-[0.35em] mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-sm bg-indigo-500" />
                  Info Anime
                </p>
                {detailData.map((d, i) =>
                  d.value ? (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="text-[7px] text-gray-500 font-black uppercase tracking-widest w-[50px] shrink-0 mt-0.5 leading-tight">
                        {d.label}
                      </span>
                      <span className="text-[10px] text-gray-300 font-medium leading-snug break-words flex-1">
                        {d.value}
                      </span>
                    </div>
                  ) : null
                )}
              </div>

              {/* Footer credit */}
              <div className="hidden lg:flex mt-auto pt-5 items-center justify-between border-t border-white/[0.04]">
                <span className="text-[8px] text-gray-700 font-bold uppercase tracking-[0.25em]">CoreAnime · Kodel Dev</span>
                <span className="text-[8px] text-gray-700 font-bold uppercase tracking-[0.25em]">© {new Date().getFullYear()}</span>
              </div>
            </aside>

            {/* ── KONTEN UTAMA ──────────────────────────────────── */}
            <main className="flex-1 flex flex-col overflow-hidden bg-[#07090f] min-h-0">
              <header className="shrink-0 px-4 sm:px-5 lg:px-7 pt-2 sm:pt-5 lg:pt-6 pb-0 border-b border-white/[0.07] bg-[#07090f]/95 backdrop-blur-md z-20">
                <h2 className="hidden lg:block text-2xl xl:text-3xl font-black italic text-white uppercase tracking-tight leading-tight line-clamp-2 mb-4 pr-10">
                  {attributes?.canonicalTitle || attributes?.title}
                </h2>
                <nav className="flex overflow-x-auto no-scrollbar gap-0.5 sm:gap-1">
                  {TABS.map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-2.5 sm:px-3 pb-2.5 sm:pb-3 pt-1.5 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] relative transition-all shrink-0 ${
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

              <div className="flex-1 overflow-y-auto no-scrollbar p-4 sm:p-5 lg:p-7 pt-5 pb-8 sm:pb-10">
                {loadingDetail && activeTab !== 'Ringkasan' && activeTab !== 'Episode' ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3 opacity-40">
                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Sebentar ya...</span>
                  </div>
                ) : (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 text-left">

                    {/* ── Ringkasan ── */}
                    {activeTab === 'Ringkasan' && (
                      <div className="max-w-3xl space-y-5">
                        {isTranslating ? (
                          <div className="space-y-2.5 animate-pulse">
                            {[...Array(4)].map((_, i) => (
                              <div key={i} className="h-3 rounded bg-white/5" style={{ width: `${90 - i * 8}%` }} />
                            ))}
                            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest mt-2">
                              Sedang menerjemahkan ke Bahasa Indonesia...
                            </p>
                          </div>
                        ) : (
                          <p className="text-gray-300 text-sm sm:text-[15px] leading-relaxed font-normal">
                            {translatedSynopsis || attributes?.synopsis ||
                              'Sinopsis untuk anime ini belum tersedia. Nantikan pembaruan selanjutnya!'}
                          </p>
                        )}

                        {/* Info detail — hanya muncul di mobile/tablet, desktop pakai sidebar */}
                        <div className="lg:hidden pt-4 border-t border-white/[0.07]">
                          <p className="text-[8px] text-white font-black uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-sm bg-indigo-500 inline-block" />
                            Info Anime
                          </p>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                            {detailData.map((d, i) =>
                              d.value ? (
                                <div key={i} className="flex flex-col gap-0.5">
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

                    {/* ── Episode ── */}
                    {activeTab === 'Episode' && (
                      <>
                        {loadingEpisodes && episodes.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-20 gap-3 opacity-40">
                            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Memuat daftar episode...</span>
                          </div>
                        ) : episodes.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                            {episodes.map((ep: any, i: number) => (
                              <div key={i} className="flex gap-3 p-2.5 sm:p-3 bg-white/[0.03] hover:bg-white/[0.06] transition-colors rounded-xl border border-white/[0.05]">
                                <img
                                  src={ep.attributes?.thumbnail?.original || posterImage}
                                  className="w-20 sm:w-24 aspect-video object-cover rounded-lg shrink-0"
                                  alt=""
                                />
                                <div className="flex flex-col justify-center min-w-0 gap-0.5">
                                  <span className="text-indigo-400 text-[7px] sm:text-[8px] font-black uppercase tracking-widest">
                                    Ep {ep.attributes?.number ?? '—'}
                                  </span>
                                  <h4 className="text-white text-xs sm:text-sm font-semibold truncate italic leading-snug">
                                    {ep.attributes?.canonicalTitle || `Episode ${ep.attributes?.number ?? ''}`}
                                  </h4>
                                </div>
                              </div>
                            ))}
                            {loadingEpisodes && (
                              <div className="col-span-full py-4 text-center text-[9px] font-black uppercase tracking-widest opacity-30 animate-pulse">
                                Memuat sisa episode...
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-14">
                            <p className="text-gray-500 text-sm font-medium">
                              Daftar episode belum tersedia. Nantikan pembaruan selanjutnya!
                            </p>
                          </div>
                        )}
                      </>
                    )}

                    {/* ── Karakter ── */}
                    {activeTab === 'Karakter' && (
                      characters.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                          {characters.map((char: any, i: number) => (
                            <div key={i} className="flex flex-col gap-2 group">
                              <img
                                src={char.image}
                                className="aspect-[3/4] object-cover rounded-xl border border-white/5 shadow-lg group-hover:scale-105 transition-transform duration-300"
                                alt={char.name}
                              />
                              <p className="text-[10px] sm:text-xs font-black text-white uppercase text-center truncate leading-tight">
                                {char.name}
                              </p>
                              <div className="flex items-center gap-1.5 justify-center opacity-60">
                                {char.vaImage && (
                                  <img src={char.vaImage} className="w-5 h-5 rounded-full border border-indigo-500/30 object-cover" alt="" />
                                )}
                                <span className="text-[8px] font-semibold text-gray-400 uppercase truncate">
                                  {char.vaName}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-14">
                          <p className="text-gray-500 text-sm font-medium">
                            Info karakter belum tersedia untuk anime ini.
                          </p>
                        </div>
                      )
                    )}

                    {/* ── Reaksi ── */}
                    {activeTab === 'Reaksi' && (
                      reactions.length > 0 ? (
                        <div className="space-y-3 sm:space-y-4 max-w-3xl">
                          {reactions.map((review: any, i: number) => (
                            <div key={i} className="bg-white/[0.02] p-4 sm:p-5 rounded-2xl border border-white/[0.05] flex flex-col sm:flex-row gap-3 sm:gap-4">
                              <img
                                src={review.user?.attributes?.avatar?.tiny || 'https://placehold.co/100x100/1a1a2e/ffffff?text=U'}
                                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-indigo-500/30 shrink-0"
                                alt="Avatar"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-xs sm:text-sm font-bold mb-1.5 flex items-center gap-2 flex-wrap">
                                  {review.user?.attributes?.name || 'Penonton Anonim'}
                                  <span className="text-yellow-500 text-[9px] bg-yellow-500/10 px-2 py-0.5 rounded-full">
                                    ★ {review.attributes?.likesCount || 0} suka
                                  </span>
                                </p>
                                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed italic">
                                  "{review.attributes?.content}"
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-14">
                          <p className="text-gray-500 text-sm font-medium">
                            Belum ada reaksi dari penonton. Jadilah yang pertama!
                          </p>
                        </div>
                      )
                    )}

                    {/* ── Franchise ── */}
                    {activeTab === 'Franchise' && (
                      franchise.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                          {franchise.map((item: any, i: number) => (
                            <div key={i} className="bg-white/[0.03] hover:bg-white/[0.06] transition-colors p-2.5 sm:p-3 rounded-2xl flex gap-3 items-center border border-white/[0.05] cursor-pointer">
                              <img
                                src={item.attributes?.posterImage?.tiny || posterImage}
                                className="w-10 h-14 sm:w-12 sm:h-[68px] rounded-lg object-cover shrink-0 border border-white/10"
                                alt=""
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-[8px] sm:text-[9px] text-indigo-400 font-black uppercase tracking-widest mb-1">{item.role}</p>
                                <p className="text-xs sm:text-sm text-white font-bold truncate">{item.attributes?.canonicalTitle || 'Judul tidak diketahui'}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-14">
                          <p className="text-gray-500 text-sm font-medium">
                            Tidak ada anime atau manga terkait saat ini.
                          </p>
                        </div>
                      )
                    )}

                    {/* ── Streaming ── */}
                    {activeTab === 'Streaming' && (
                      streamingLinks.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {streamingLinks.map((link: any, i: number) => {
                            const platform = getPlatformInfo(link.attributes?.url);
                            return (
                              <button
                                key={i}
                                onClick={() => window.open(link.attributes?.url, '_blank')}
                                className={`flex items-center justify-between bg-gradient-to-r ${platform.color} p-4 sm:p-5 rounded-2xl border hover:brightness-125 transition-all active:scale-95`}
                              >
                                <div className="flex items-center gap-3">
                                  {platform.logo ? (
                                    <img src={platform.logo} className="h-4 object-contain" alt={platform.label} />
                                  ) : (
                                    <div className="w-1 h-4 bg-indigo-500 rounded-full" />
                                  )}
                                  <span className="text-xs font-black uppercase tracking-widest text-white">
                                    {platform.label}
                                  </span>
                                </div>
                                <svg className="w-4 h-4 text-white/50" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                                </svg>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-14">
                          <p className="text-gray-500 text-sm font-medium">
                            Link streaming belum tersedia untuk anime ini.
                          </p>
                        </div>
                      )
                    )}

                  </div>
                )}
              </div>

              {/* Footer credit mobile */}
              <div className="lg:hidden shrink-0 px-4 py-3 border-t border-white/[0.04] flex items-center justify-between">
                <span className="text-[8px] text-gray-700 font-bold uppercase tracking-[0.25em]">CoreAnime · Kodel Dev</span>
                <span className="text-[8px] text-gray-700 font-bold uppercase tracking-[0.25em]">© {new Date().getFullYear()}</span>
              </div>
            </main>
          </div>
        </div>
      )}
    </>
  );
}