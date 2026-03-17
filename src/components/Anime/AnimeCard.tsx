'use client';

import React, { useState, useEffect } from 'react';

interface AnimeCardProps {
  anime: any;
}

export default function AnimeCard({ anime }: AnimeCardProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Ringkasan');
  const [translatedSynopsis, setTranslatedSynopsis] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isPlayingTrailer, setIsPlayingTrailer] = useState(false);

  const [episodes, setEpisodes] = useState<any[]>([]);
  const [characters, setCharacters] = useState<any[]>([]);
  const [franchise, setFranchise] = useState<any[]>([]);
  const [streamingLinks, setStreamingLinks] = useState<any[]>([]);
  const [reactions, setReactions] = useState<any[]>([]);
  const [productions, setProductions] = useState<{studios: string[]}>({studios: []});
  const [loadingDetail, setLoadingDetail] = useState(false);

  const attributes = anime.attributes;
  const posterImage = attributes?.posterImage?.large || attributes?.posterImage?.original;
  const youtubeId = attributes?.youtubeVideoId;

  const TABS = ['Ringkasan', 'Episode', 'Karakter', 'Reaksi', 'Franchise', 'Streaming'];

  const KITSU_HEADERS = {
    'Accept': 'application/vnd.api+json',
    'Content-Type': 'application/vnd.api+json',
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'TBA';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!isPreviewOpen) return;

      if (activeTab === 'Ringkasan' && attributes?.synopsis && !translatedSynopsis) {
        setIsTranslating(true);
        try {
          const res = await fetch(`/api/translate?text=${encodeURIComponent(attributes.synopsis)}`);
          const data = await res.json();
          setTranslatedSynopsis(data.translated);
        } catch (err) {
          setTranslatedSynopsis(attributes.synopsis);
        } finally {
          setIsTranslating(false);
        }
      }

      setLoadingDetail(true);
      try {
        if (productions.studios.length === 0) {
          const resProd = await fetch(`https://kitsu.io/api/edge/anime/${anime.id}/productions?include=producer`, { headers: KITSU_HEADERS });
          const dataProd = await resProd.json();
          if (dataProd.data) {
            const studios = dataProd.data
              .filter((p: any) => p.attributes.role === 'studio')
              .map((p: any) => {
                const info = dataProd.included?.find((inc: any) => inc.type === 'producers' && inc.id === p.relationships.producer.data.id);
                return info?.attributes?.name;
              }).filter(Boolean);
            setProductions({ studios });
          }
        }

        if (activeTab === 'Episode' && episodes.length === 0) {
          const res = await fetch(`https://kitsu.io/api/edge/anime/${anime.id}/episodes?page[limit]=20`, { headers: KITSU_HEADERS });
          const data = await res.json();
          setEpisodes(data?.data || []);
        } else if (activeTab === 'Streaming' && streamingLinks.length === 0) {
          const res = await fetch(`https://kitsu.io/api/edge/anime/${anime.id}/streaming-links`, { headers: KITSU_HEADERS });
          const data = await res.json();
          setStreamingLinks(data?.data || []);
        } else if (activeTab === 'Karakter' && characters.length === 0) {
          const res = await fetch(
            `https://kitsu.io/api/edge/castings?filter[media_id]=${anime.id}&filter[media_type]=Anime&filter[is_character]=true&filter[language]=Japanese&include=character,person&page[limit]=15`,
            { headers: KITSU_HEADERS }
          );
          const data = await res.json();
          if (data?.data) {
            const combined = data.data.map((item: any) => {
              const charData = data.included?.find((inc: any) => inc.type === 'characters' && inc.id === item.relationships?.character?.data?.id);
              const personData = data.included?.find((inc: any) => inc.type === 'people' && inc.id === item.relationships?.person?.data?.id);
              return {
                name: charData?.attributes?.name || 'Unknown',
                image: charData?.attributes?.image?.original || charData?.attributes?.image?.large || posterImage,
                vaName: personData?.attributes?.name || 'Seiyuu TBD',
                vaImage: personData?.attributes?.image?.original || personData?.attributes?.image?.medium || null,
              };
            });
            setCharacters(combined);
          }
        } else if (activeTab === 'Franchise' && franchise.length === 0) {
          const res = await fetch(`https://kitsu.io/api/edge/anime/${anime.id}/media-relationships?include=destination&page[limit]=10`, { headers: KITSU_HEADERS });
          const data = await res.json();
          setFranchise(data?.included || []);
        } else if (activeTab === 'Reaksi' && reactions.length === 0) {
          const res = await fetch(`https://kitsu.io/api/edge/anime/${anime.id}/reviews?include=user&page[limit]=10&sort=-likesCount`, { headers: KITSU_HEADERS });
          const data = await res.json();
          if (data?.data) {
            const reviewsWithUsers = data.data.map((review: any) => ({
              ...review,
              user: data.included?.find((inc: any) => inc.type === 'users' && inc.id === review.relationships?.user?.data?.id),
            }));
            setReactions(reviewsWithUsers);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingDetail(false);
      }
    };
    fetchData();
  }, [isPreviewOpen, activeTab, anime.id]);

  useEffect(() => {
    if (isPreviewOpen) document.body.style.overflow = 'hidden';
    else { document.body.style.overflow = 'unset'; setActiveTab('Ringkasan'); setIsPlayingTrailer(false); }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isPreviewOpen]);

  const getPlatformInfo = (url: string) => {
    const link = url.toLowerCase();
    if (link.includes('crunchyroll')) return { label: 'Crunchyroll', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Crunchyroll_Logo.png', color: 'from-orange-600/20 to-orange-900/5 border-orange-500/20' };
    if (link.includes('netflix'))     return { label: 'Netflix',     logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg', color: 'from-red-700/20 to-red-900/5 border-red-500/20' };
    if (link.includes('hulu'))        return { label: 'Hulu',        logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Hulu_Logo.svg', color: 'from-green-700/20 to-green-900/5 border-green-500/20' };
    if (link.includes('disney'))      return { label: 'Disney+',     logo: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg', color: 'from-blue-700/20 to-blue-900/5 border-blue-500/20' };
    return { label: 'Official Stream', logo: null, color: 'from-indigo-700/20 to-indigo-900/5 border-indigo-500/20' };
  };

  const seasonName  = attributes?.season ? attributes.season.charAt(0).toUpperCase() + attributes.season.slice(1) : '';
  const releaseYear = attributes?.startDate ? new Date(attributes.startDate).getFullYear() : '';

  const detailData = [
    { label: 'Inggris', value: attributes?.titles?.en },
    { label: 'Jepang',  value: attributes?.titles?.ja_jp },
    { label: 'Romaji',  value: attributes?.titles?.en_jp },
    { label: 'Tipe',    value: attributes?.showType?.toUpperCase() },
    { label: 'Episode', value: attributes?.episodeCount },
    { label: 'Status',  value: attributes?.status === 'finished' ? 'Selesai Tayang' : 'Sedang Tayang' },
    { label: 'Tayang',  value: formatDate(attributes?.startDate) },
    { label: 'Musim',   value: seasonName || releaseYear ? `${seasonName} ${releaseYear}`.trim() : 'TBA' },
    { label: 'Rating',  value: attributes?.ageRatingGuide },
    { label: 'Studio',  value: productions.studios.length > 0 ? productions.studios.join(', ') : 'TBA' },
  ];

  /* ──────────────────────────────────────────────────────────────── */
  return (
    <>
      {/* ═══ CARD ═══════════════════════════════════════════════════ */}
      <div
        onClick={() => setIsPreviewOpen(true)}
        className="group relative overflow-hidden rounded-2xl bg-[#0d1117] border border-white/5
                   hover:border-indigo-500/50 hover:shadow-[0_8px_40px_rgba(99,102,241,0.12)]
                   cursor-pointer transition-all duration-500"
      >
        <div className="aspect-[3/4] overflow-hidden relative">
          <img
            src={posterImage}
            alt={attributes?.canonicalTitle}
            className="h-full w-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />

          {/* score badge */}
          {attributes?.averageRating && (
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-md px-1.5 py-0.5">
              <span className="text-yellow-400 text-[8px] leading-none">★</span>
              <span className="text-white text-[8px] font-bold leading-none">{attributes.averageRating}%</span>
            </div>
          )}

          {/* type badge */}
          {attributes?.showType && (
            <div className="absolute top-2 left-2 bg-indigo-600/80 backdrop-blur-md rounded-md px-1.5 py-0.5">
              <span className="text-white text-[7px] font-black uppercase tracking-widest">{attributes.showType}</span>
            </div>
          )}

          {/* hover hint */}
          <div className="absolute inset-0 flex items-end justify-start p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-2.5 py-1.5">
              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.841z" />
              </svg>
              <span className="text-white text-[8px] font-bold uppercase tracking-widest">Lihat Detail</span>
            </div>
          </div>
        </div>

        <div className="px-3 pt-2.5 pb-3">
          <h3 className="text-[10px] font-bold text-gray-400 group-hover:text-white truncate uppercase tracking-tight transition-colors">
            {attributes?.canonicalTitle}
          </h3>
          {attributes?.startDate && (
            <p className="text-[8px] text-gray-600 mt-0.5">{attributes.startDate.substring(0, 4)}</p>
          )}
        </div>
      </div>

      {/* ═══ MODAL ═══════════════════════════════════════════════════ */}
      {isPreviewOpen && (
        <div
          className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center
                     bg-black/70 backdrop-blur-md p-0 sm:p-4 md:p-6"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div
            className="relative w-full sm:max-w-5xl xl:max-w-6xl
                       h-[93dvh] sm:h-[88vh]
                       bg-[#07090f] border border-white/[0.07]
                       rounded-t-[28px] sm:rounded-3xl
                       flex flex-col lg:flex-row overflow-hidden
                       shadow-[0_-30px_100px_rgba(0,0,0,0.9)] sm:shadow-[0_30px_100px_rgba(0,0,0,0.9)]
                       animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-300 ease-out"
            onClick={(e) => e.stopPropagation()}
          >
            {/* drag handle — mobile */}
            <div className="sm:hidden absolute top-0 inset-x-0 flex justify-center pt-2.5 z-10 pointer-events-none">
              <div className="w-9 h-1 rounded-full bg-white/20" />
            </div>

            {/* close btn */}
            <button
              onClick={() => setIsPreviewOpen(false)}
              className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-50
                         w-8 h-8 flex items-center justify-center
                         bg-white/[0.06] hover:bg-white/[0.12] active:scale-90
                         border border-white/[0.08] rounded-xl
                         text-gray-400 hover:text-white transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* ── LEFT SIDEBAR ─────────────────────────────────────── */}
            <aside
              className="shrink-0 w-full lg:w-[280px] xl:w-[320px]
                         flex flex-col overflow-y-auto no-scrollbar
                         max-h-[40vh] sm:max-h-[44vh] lg:max-h-none lg:h-full
                         px-4 pt-8 pb-4 sm:px-5 sm:pt-6 lg:px-7 lg:pt-8 lg:pb-8
                         border-b lg:border-b-0 lg:border-r border-white/[0.07]
                         bg-gradient-to-b from-[#0b0e18] to-[#07090f]"
            >
              {/* poster row — horizontal on mobile, stacked on desktop */}
              <div className="flex gap-4 lg:block">

                {/* poster thumbnail */}
                <div className="relative shrink-0 w-[95px] sm:w-[120px] lg:w-full aspect-[3/4]
                                rounded-xl lg:rounded-2xl overflow-hidden
                                border border-white/[0.08] bg-black shadow-2xl">
                  {!isPlayingTrailer ? (
                    <>
                      <img src={posterImage} className="w-full h-full object-cover" alt={attributes?.canonicalTitle} />
                      <div className="absolute inset-0 bg-black/25" />
                      {youtubeId && (
                        <button
                          onClick={() => setIsPlayingTrailer(true)}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <div className="bg-red-600 hover:bg-red-500 active:scale-90 hover:scale-110 transition-all
                                          p-3 lg:p-4 rounded-full shadow-xl shadow-red-950/60">
                            <svg className="w-4 h-4 lg:w-5 lg:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.841z" />
                            </svg>
                          </div>
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full relative bg-black">
                      <iframe
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                      />
                      <button
                        onClick={() => setIsPlayingTrailer(false)}
                        className="absolute top-2 right-2 bg-black/70 p-1 rounded-md text-white hover:bg-red-600 transition-all z-30"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M6 18L18 6M6 6l12 12" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                {/* title + CTA — mobile only (right of poster) */}
                <div className="flex flex-col justify-between flex-1 lg:hidden py-0.5 min-w-0">
                  <div>
                    <p className="text-indigo-400/60 text-[7px] font-black uppercase tracking-[0.4em] mb-1">Anime</p>
                    <h2 className="text-white text-[13px] sm:text-[15px] font-black italic uppercase tracking-tight leading-[1.05] line-clamp-3">
                      {attributes?.canonicalTitle}
                    </h2>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      {attributes?.averageRating && (
                        <span className="text-yellow-400 text-[9px] font-bold">★ {attributes.averageRating}%</span>
                      )}
                      {attributes?.status && (
                        <span className={`text-[8px] font-black ${attributes.status === 'finished' ? 'text-gray-500' : 'text-green-400'}`}>
                          {attributes.status === 'finished' ? '· Selesai' : '· On-air'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 mt-3">
                    <button className="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white py-2 rounded-lg font-black text-[8px] uppercase tracking-widest transition-all">
                      + Pustaka
                    </button>
                    <button
                      onClick={() => setActiveTab('Streaming')}
                      className="w-full bg-white/[0.06] hover:bg-white/[0.1] active:scale-95 text-gray-300 py-2 rounded-lg font-black text-[8px] uppercase tracking-widest border border-white/[0.08] transition-all"
                    >
                      ▶ Tonton
                    </button>
                  </div>
                </div>
              </div>

              {/* CTA — desktop only */}
              <div className="hidden lg:flex flex-col gap-2 mt-6">
                <button className="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all shadow-lg shadow-indigo-950/40">
                  + Tambah ke Pustaka
                </button>
                <button
                  onClick={() => setActiveTab('Streaming')}
                  className="w-full bg-white/[0.05] hover:bg-white/[0.09] active:scale-95 text-gray-300 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest border border-white/[0.08] transition-all"
                >
                  ▶ Tonton Online
                </button>
              </div>

              {/* detail list — desktop only */}
              <div className="hidden lg:block mt-8 pt-7 border-t border-white/[0.06] space-y-3.5">
                <p className="text-[9px] text-white font-black uppercase tracking-[0.35em] mb-5 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600 inline-block" />
                  Info Detail
                </p>
                {detailData.map((d, i) =>
                  d.value ? (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="text-[7px] text-gray-600 font-black uppercase tracking-widest w-[50px] shrink-0 mt-0.5">{d.label}</span>
                      <span className="text-[11px] text-gray-200 font-medium leading-snug break-words flex-1">{d.value}</span>
                    </div>
                  ) : null
                )}
              </div>
            </aside>

            {/* ── MAIN PANEL ───────────────────────────────────────── */}
            <main className="flex-1 flex flex-col overflow-hidden bg-[#07090f] min-h-0">

              {/* sticky header */}
              <header className="shrink-0 px-4 sm:px-7 pt-3 sm:pt-6 pb-0
                                 border-b border-white/[0.07]
                                 bg-[#07090f]/95 backdrop-blur-md z-20">
                {/* title — desktop only */}
                <div className="hidden lg:block mb-4 pr-10">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-px w-6 bg-indigo-500" />
                    <span className="text-indigo-400/70 text-[8px] font-black uppercase tracking-[0.5em]">Core Database</span>
                  </div>
                  <h2 className="text-3xl xl:text-5xl font-black italic text-white uppercase tracking-tight leading-[0.9] line-clamp-2">
                    {attributes?.canonicalTitle}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mt-2.5">
                    {attributes?.averageRating && (
                      <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/15 px-2.5 py-0.5 rounded-full text-[8px] font-black">
                        ★ {attributes.averageRating}%
                      </span>
                    )}
                    {attributes?.startDate && (
                      <span className="text-gray-600 text-[8px] font-bold">{attributes.startDate.substring(0, 4)}</span>
                    )}
                    {attributes?.status && (
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border ${
                        attributes.status === 'finished'
                          ? 'text-gray-500 border-gray-700/40 bg-gray-800/30'
                          : 'text-green-400 border-green-600/30 bg-green-900/20'
                      }`}>
                        {attributes.status === 'finished' ? 'Selesai' : '● Sedang Tayang'}
                      </span>
                    )}
                  </div>
                </div>

                {/* tabs */}
                <nav className="flex overflow-x-auto no-scrollbar">
                  {TABS.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3.5 sm:px-5 pb-3.5 pt-1 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] relative transition-all shrink-0 ${
                        activeTab === tab ? 'text-indigo-400' : 'text-gray-600 hover:text-gray-400'
                      }`}
                    >
                      {tab}
                      {activeTab === tab && (
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.7)] rounded-full" />
                      )}
                    </button>
                  ))}
                </nav>
              </header>

              {/* scrollable content */}
              <div className="flex-1 overflow-y-auto no-scrollbar p-4 sm:p-7 pt-5 pb-8">
                {loadingDetail && activeTab !== 'Ringkasan' ? (
                  <div className="flex flex-col items-center justify-center py-24 gap-3 opacity-25">
                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Memuat data...</span>
                  </div>
                ) : (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 text-left">

                    {/* RINGKASAN */}
                    {activeTab === 'Ringkasan' && (
                      <div className="max-w-2xl space-y-5">
                        <p className="text-gray-300 text-[13px] sm:text-[14px] leading-relaxed">
                          {isTranslating ? (
                            <span className="flex items-center gap-2 text-gray-500 text-[12px]">
                              <span className="w-3.5 h-3.5 border border-indigo-500 border-t-transparent rounded-full animate-spin inline-block shrink-0" />
                              Menerjemahkan...
                            </span>
                          ) : (
                            translatedSynopsis || attributes?.synopsis
                          )}
                        </p>
                        {/* detail grid — mobile only */}
                        <div className="lg:hidden grid grid-cols-2 sm:grid-cols-3 gap-2 pt-5 border-t border-white/[0.06]">
                          {detailData.map((d, i) =>
                            d.value ? (
                              <div key={i} className="bg-white/[0.04] hover:bg-white/[0.06] transition-colors rounded-xl p-3 border border-white/[0.06]">
                                <p className="text-[7px] text-indigo-400/60 font-black uppercase tracking-widest mb-1">{d.label}</p>
                                <p className="text-[10px] text-gray-200 font-semibold leading-tight break-words">{d.value}</p>
                              </div>
                            ) : null
                          )}
                        </div>
                      </div>
                    )}

                    {/* KARAKTER */}
                    {activeTab === 'Karakter' && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                        {characters.map((char: any, i: number) => (
                          <div key={i} className="flex flex-col gap-2.5 group/ch">
                            <div className="bg-gradient-to-br from-red-700 to-red-950 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-red-500/20 overflow-hidden">
                              <div className="aspect-[3/4] sm:aspect-square overflow-hidden rounded-lg sm:rounded-xl bg-black/40">
                                <img src={char.image} className="w-full h-full object-cover group-hover/ch:scale-105 transition-transform duration-500" alt={char.name} />
                              </div>
                              <div className="bg-white mt-1 sm:mt-1.5 rounded-md sm:rounded-lg px-1.5 py-2 flex items-center justify-center min-h-[36px] sm:min-h-[44px]">
                                <p className="text-[8px] sm:text-[9px] font-black text-black uppercase leading-tight tracking-tight text-center break-words">{char.name}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 bg-white/[0.04] p-2 sm:p-2.5 rounded-xl border border-white/[0.07]">
                              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border border-indigo-500/30 shrink-0 bg-gray-900">
                                {char.vaImage
                                  ? <img src={char.vaImage} className="w-full h-full object-cover" alt={char.vaName} />
                                  : <div className="w-full h-full flex items-center justify-center text-[6px] text-gray-600 font-black">N/A</div>
                                }
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-[6px] sm:text-[7px] text-indigo-400/50 font-black uppercase leading-none mb-0.5 tracking-widest">CV</p>
                                <p className="text-[9px] text-white font-bold leading-snug uppercase tracking-tight truncate">{char.vaName}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* REAKSI */}
                    {activeTab === 'Reaksi' && (
                      <div className="space-y-3 max-w-3xl">
                        {reactions.map((review: any, i: number) => (
                          <div key={i} className="bg-white/[0.04] hover:bg-white/[0.06] transition-colors p-4 sm:p-6 rounded-2xl border border-white/[0.07] flex flex-col sm:flex-row gap-4">
                            <div className="flex sm:flex-col items-center gap-3 sm:gap-2 sm:w-20 shrink-0">
                              <img src={review.user?.attributes?.avatar?.tiny || 'https://placehold.co/100x100?text=U'} className="w-10 h-10 rounded-full border border-indigo-500/25 object-cover" alt="" />
                              <div>
                                <p className="text-white text-[10px] sm:text-[11px] font-bold truncate max-w-[100px] sm:max-w-none sm:text-center">{review.user?.attributes?.name || 'User'}</p>
                                <p className="text-yellow-400 text-[8px] font-black sm:text-center">★ {review.attributes?.likesCount || 0}</p>
                              </div>
                            </div>
                            <div className="flex-1 sm:border-l sm:border-indigo-500/20 sm:pl-5 min-w-0">
                              <p className="text-gray-300 text-[12px] sm:text-[13px] leading-relaxed italic break-words">"{review.attributes?.content}"</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* EPISODE */}
                    {activeTab === 'Episode' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {episodes.map((ep: any, i: number) => (
                          <div key={i} className="flex gap-3 sm:gap-4 p-3 bg-white/[0.04] hover:bg-white/[0.07] transition-colors rounded-xl sm:rounded-2xl border border-white/[0.06] group/ep">
                            <div className="w-24 sm:w-32 aspect-video bg-gray-900 rounded-lg sm:rounded-xl overflow-hidden shrink-0 border border-white/[0.07]">
                              <img src={ep.attributes?.thumbnail?.original || posterImage} className="w-full h-full object-cover group-hover/ep:scale-105 transition-transform duration-500" alt="" />
                            </div>
                            <div className="flex flex-col justify-center min-w-0">
                              <span className="text-indigo-400 text-[7px] sm:text-[8px] font-black uppercase mb-0.5">EP {ep.attributes?.number}</span>
                              <h4 className="text-white text-[11px] sm:text-[12px] font-black uppercase italic leading-tight mb-1.5 line-clamp-2">{ep.attributes?.canonicalTitle || `Episode ${ep.attributes?.number}`}</h4>
                              <div className="flex gap-2.5 text-[8px] text-gray-500 font-bold uppercase">
                                <span>{ep.attributes?.length || '24'}m</span>
                                <span className="hidden sm:inline">{formatDate(ep.attributes?.airdate)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* FRANCHISE */}
                    {activeTab === 'Franchise' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                        {franchise.map((item: any, i: number) => (
                          <div key={i} className="bg-white/[0.04] hover:bg-indigo-600/10 hover:border-indigo-500/25 transition-all p-3 rounded-xl sm:rounded-2xl border border-white/[0.06] flex gap-3.5 items-center group/fr">
                            <div className="w-10 aspect-[2/3] shrink-0 overflow-hidden rounded-lg border border-white/[0.08]">
                              <img src={item.attributes?.posterImage?.tiny} className="w-full h-full object-cover" alt="" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[7px] text-indigo-400 font-black uppercase mb-1 tracking-widest">{item.type}</p>
                              <p className="text-[11px] text-white font-black line-clamp-2 uppercase italic leading-tight">{item.attributes?.canonicalTitle}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* STREAMING */}
                    {activeTab === 'Streaming' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-2xl">
                        {streamingLinks.map((link: any, i: number) => {
                          const platform = getPlatformInfo(link.attributes?.url);
                          return (
                            <button
                              key={i}
                              onClick={() => window.open(link.attributes?.url, '_blank')}
                              className={`flex items-center justify-between bg-gradient-to-r ${platform.color} p-4 sm:p-5 rounded-xl sm:rounded-2xl border transition-all active:scale-[0.97] hover:brightness-125 group/st`}
                            >
                              <div className="flex items-center gap-3">
                                {platform.logo
                                  ? <img src={platform.logo} className="h-3.5 sm:h-4 object-contain grayscale group-hover/st:grayscale-0 transition-all duration-300" alt={platform.label} />
                                  : <div className="w-1 h-4 bg-indigo-500 rounded-full" />
                                }
                                <span className="text-[10px] sm:text-[11px] text-gray-300 group-hover/st:text-white font-black uppercase tracking-widest transition-colors">{platform.label}</span>
                              </div>
                              <svg className="w-3.5 h-3.5 text-gray-500 group-hover/st:text-white transition-colors" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                              </svg>
                            </button>
                          );
                        })}
                      </div>
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