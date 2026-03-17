'use client';

import React, { useState, useEffect } from 'react';

interface MangaCardProps {
  manga: any;
}

export default function MangaCard({ manga }: MangaCardProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeTab,     setActiveTab]     = useState('Ringkasan');
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [chapters,   setChapters]   = useState<any[]>([]);
  const [characters, setCharacters] = useState<any[]>([]);
  const [reactions,  setReactions]  = useState<any[]>([]);
  const [franchise,  setFranchise]  = useState<any[]>([]);
  const [fullDetail, setFullDetail] = useState<any>(null);

  const attributes  = manga.attributes;
  const posterImage = attributes?.posterImage?.large || attributes?.posterImage?.original;
  const TABS        = ['Ringkasan', 'Bab', 'Karakter', 'Reaksi', 'Franchise'];

  const KITSU_HEADERS = {
    'Accept':       'application/vnd.api+json',
    'Content-Type': 'application/vnd.api+json',
  };

  // ─── FIX ERROR: Fungsi Konversi Waktu ───
  const convertToWIB = (timeString: string) => {
    if (!timeString) return '';
    try {
      const [hours, minutes] = timeString.split(':').map(Number);
      let localHours = hours - 2; // Estimasi JST (UTC+9) ke WIB (UTC+7)
      if (localHours < 0) localHours += 24;
      return `${localHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} WIB`;
    } catch (e) { return timeString; }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'TBA';
    return new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  /* ── scroll lock ── */
  useEffect(() => {
    if (isPreviewOpen) {
      document.body.style.overflow = 'hidden';
      fetchInitialInfo();
    } else {
      document.body.style.overflow = 'unset';
      setActiveTab('Ringkasan');
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isPreviewOpen]);

  const fetchInitialInfo = async () => {
    setLoadingDetail(true);
    try {
      // Mengambil genre dan data produksi (studio) secara dinamis
      const res  = await fetch(`https://kitsu.io/api/edge/manga/${manga.id}?include=genres,productions.producer`, { headers: KITSU_HEADERS });
      const data = await res.json();
      setFullDetail(data);
    } catch (e) { console.error(e); }
    finally     { setLoadingDetail(false); }
  };

  /* ── per-tab fetch ── */
  useEffect(() => {
    if (!isPreviewOpen) return;
    const fetchTabData = async () => {
      try {
        if (activeTab === 'Bab' && chapters.length === 0) {
          const res  = await fetch(`https://kitsu.io/api/edge/manga/${manga.id}/chapters?page[limit]=20`, { headers: KITSU_HEADERS });
          const data = await res.json();
          setChapters(data.data || []);

        } else if (activeTab === 'Karakter' && characters.length === 0) {
          const res  = await fetch(`https://kitsu.io/api/edge/castings?filter[media_id]=${manga.id}&filter[media_type]=Manga&filter[is_character]=true&include=character&page[limit]=15`, { headers: KITSU_HEADERS });
          const data = await res.json();
          setCharacters(
            data.data?.map((item: any) => {
              const char = data.included?.find((inc: any) => inc.type === 'characters' && inc.id === item.relationships?.character?.data?.id);
              return { name: char?.attributes?.name, image: char?.attributes?.image?.original || char?.attributes?.image?.large };
            }) || []
          );

        } else if (activeTab === 'Reaksi' && reactions.length === 0) {
          const res  = await fetch(`https://kitsu.io/api/edge/manga/${manga.id}/reviews?include=user&page[limit]=10&sort=-likesCount`, { headers: KITSU_HEADERS });
          const data = await res.json();
          setReactions(
            data.data?.map((r: any) => ({
              ...r,
              user: data.included?.find((inc: any) => inc.type === 'users' && inc.id === r.relationships?.user?.data?.id),
            })) || []
          );

        } else if (activeTab === 'Franchise' && franchise.length === 0) {
          const res  = await fetch(`https://kitsu.io/api/edge/manga/${manga.id}/media-relationships?include=destination`, { headers: KITSU_HEADERS });
          const data = await res.json();
          setFranchise(
            data.data?.map((rel: any) => ({
              role: rel.attributes.role,
              dest: data.included?.find((inc: any) => inc.id === rel.relationships?.destination?.data?.id),
            })) || []
          );
        }
      } catch (e) { console.error(e); }
    };
    fetchTabData();
  }, [activeTab, isPreviewOpen, manga.id]);

  // ─── LOGIKA DINAMIS UNTUK STUDIO & MUSIM ───
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
    { label: 'Sinonim',       value: attributes?.abbreviatedTitles?.join(', ') },
    { label: 'Tipe',          value: attributes?.mangaType?.toUpperCase() },
    { label: 'Volume',        value: attributes?.volumeCount },
    { label: 'Bab',           value: attributes?.chapterCount },
    { label: 'Status',        value: attributes?.status === 'finished' ? 'Selesai Diterbitkan' : 'Sedang Terbit' },
    { label: 'Tgl Terbit',    value: attributes?.startDate ? `${formatDate(attributes.startDate)}${attributes.endDate ? ` — ${formatDate(attributes.endDate)}` : ' — Sekarang'}` : 'TBA' },
    { label: 'Musim',         value: displaySeason },
    { label: 'Studio',        value: getStudios() || 'TBA' },
    { label: 'Rating',        value: attributes?.ageRatingGuide },
  ];

  return (
    <>
      {/* ═══ CARD ═══ */}
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

          {attributes?.averageRating && (
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-md px-1.5 py-0.5">
              <span className="text-yellow-400 text-[8px] leading-none">★</span>
              <span className="text-white text-[8px] font-bold leading-none">{attributes.averageRating}%</span>
            </div>
          )}

          {attributes?.mangaType && (
            <div className="absolute top-2 left-2 bg-indigo-600/80 backdrop-blur-md rounded-md px-1.5 py-0.5">
              <span className="text-white text-[7px] font-black uppercase tracking-widest">{attributes.mangaType}</span>
            </div>
          )}

          <div className="absolute inset-0 flex items-end justify-start p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-2.5 py-1.5">
              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
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

      {/* ═══ MODAL ═══ */}
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
            <div className="sm:hidden absolute top-0 inset-x-0 flex justify-center pt-2.5 z-10 pointer-events-none">
              <div className="w-9 h-1 rounded-full bg-white/20" />
            </div>

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

            {/* SIDEBAR */}
            <aside
              className="shrink-0 w-full lg:w-[280px] xl:w-[320px]
                         flex flex-col overflow-y-auto no-scrollbar
                         max-h-[40vh] sm:max-h-[44vh] lg:max-h-none lg:h-full
                         px-4 pt-8 pb-4 sm:px-5 sm:pt-6 lg:px-7 lg:pt-8 lg:pb-8
                         border-b lg:border-b-0 lg:border-r border-white/[0.07]
                         bg-gradient-to-b from-[#0b0e18] to-[#07090f]"
            >
              <div className="flex gap-4 lg:block">
                <div className="relative shrink-0 w-[95px] sm:w-[120px] lg:w-full aspect-[3/4]
                                rounded-xl lg:rounded-2xl overflow-hidden
                                border border-white/[0.08] bg-black shadow-2xl">
                  <img src={posterImage} className="w-full h-full object-cover" alt="" />
                </div>

                <div className="flex flex-col justify-between flex-1 lg:hidden py-0.5 min-w-0">
                  <div>
                    <p className="text-indigo-400/60 text-[7px] font-black uppercase tracking-[0.4em] mb-1">Manga</p>
                    <h2 className="text-white text-[13px] sm:text-[15px] font-black italic uppercase tracking-tight leading-[1.05] line-clamp-3">
                      {attributes?.canonicalTitle}
                    </h2>
                  </div>
                  <button className="mt-3 w-full bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white py-2 rounded-lg font-black text-[8px] uppercase tracking-widest transition-all">
                    + Pustaka
                  </button>
                </div>
              </div>

              <button className="hidden lg:block mt-6 w-full bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all shadow-lg shadow-indigo-950/40">
                + Tambahkan ke Pustaka
              </button>

              <div className="hidden lg:block mt-8 pt-7 border-t border-white/[0.06] space-y-3.5">
                <p className="text-[9px] text-white font-black uppercase tracking-[0.35em] mb-5 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600 inline-block" />
                  Detail Manga
                </p>
                {detailData.map((d, i) =>
                  d.value ? (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="text-[7px] text-gray-600 font-black uppercase tracking-widest w-[58px] shrink-0 mt-0.5 leading-tight">{d.label}</span>
                      <span className="text-[11px] text-gray-200 font-medium leading-snug break-words flex-1">{d.value}</span>
                    </div>
                  ) : null
                )}
              </div>
            </aside>

            {/* MAIN */}
            <main className="flex-1 flex flex-col overflow-hidden bg-[#07090f] min-h-0">
              <header className="shrink-0 px-4 sm:px-7 pt-3 sm:pt-6 pb-0 border-b border-white/[0.07] bg-[#07090f]/95 backdrop-blur-md z-20">
                <div className="hidden lg:block mb-4 pr-10">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-px w-6 bg-indigo-500" />
                    <span className="text-indigo-400/70 text-[8px] font-black uppercase tracking-[0.5em]">Manga Node</span>
                  </div>
                  <h2 className="text-3xl xl:text-5xl font-black italic text-white uppercase tracking-tight leading-[0.9] line-clamp-2">
                    {attributes?.canonicalTitle}
                  </h2>
                </div>

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
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-500 rounded-full" />
                      )}
                    </button>
                  ))}
                </nav>
              </header>

              <div className="flex-1 overflow-y-auto no-scrollbar p-4 sm:p-7 pt-5 pb-8">
                {loadingDetail && activeTab === 'Ringkasan' ? (
                  <div className="flex flex-col items-center justify-center py-24 gap-3 opacity-25">
                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Memuat data...</span>
                  </div>
                ) : (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 text-left">
                    {activeTab === 'Ringkasan' && (
                      <div className="max-w-2xl space-y-5">
                        <p className="text-gray-300 text-[13px] sm:text-[14px] leading-relaxed">
                          {attributes?.synopsis || 'Deskripsi belum tersedia.'}
                        </p>
                      </div>
                    )}

                    {activeTab === 'Bab' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {chapters.map((ch: any, i: number) => (
                          <div key={i} className="flex gap-3 p-3 bg-white/[0.04] rounded-xl border border-white/[0.06]">
                            <div className="w-10 h-14 bg-gray-900 rounded-lg shrink-0 overflow-hidden">
                              <img src={ch.attributes?.thumbnail?.original || posterImage} className="w-full h-full object-cover" alt="" />
                            </div>
                            <div className="flex flex-col justify-center min-w-0">
                               <span className="text-indigo-400 text-[7px] font-black uppercase">Chapter {ch.attributes?.number}</span>
                               <h4 className="text-white text-xs font-bold truncate italic">{ch.attributes?.canonicalTitle || `Chapter ${ch.attributes?.number}`}</h4>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeTab === 'Karakter' && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {characters.map((char: any, i: number) => (
                          <div key={i} className="bg-gradient-to-br from-red-700 to-red-950 p-1.5 rounded-2xl">
                            <img src={char.image} className="w-full aspect-[3/4] object-cover rounded-xl" alt="" />
                            <div className="bg-white mt-1.5 rounded-lg py-2"><p className="text-[9px] font-black text-black uppercase text-center truncate px-2">{char.name}</p></div>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeTab === 'Reaksi' && (
                      <div className="space-y-4">
                        {reactions.map((rev: any, i: number) => (
                          <div key={i} className="bg-white/[0.04] p-5 rounded-2xl flex gap-4 border border-white/[0.07]">
                            <img src={rev.user?.attributes?.avatar?.tiny || 'https://placehold.co/100x100?text=U'} className="w-10 h-10 rounded-full object-cover" alt="" />
                            <div className="flex-1 border-l border-indigo-500/20 pl-4">
                               <p className="text-white text-xs font-bold mb-1">{rev.user?.attributes?.name} <span className="text-yellow-500 ml-2">★ {rev.attributes?.likesCount}</span></p>
                               <p className="text-gray-400 text-[12px] italic">"{rev.attributes?.content}"</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeTab === 'Franchise' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {franchise.map((f: any, i: number) => (
                          <div key={i} className="bg-white/[0.04] p-3 rounded-xl flex gap-3 items-center border border-white/[0.06]">
                            <img src={f.dest?.attributes?.posterImage?.tiny} className="w-10 h-14 rounded-lg object-cover" alt="" />
                            <div className="min-w-0"><p className="text-[7px] text-indigo-400 font-black uppercase mb-1">{f.role}</p><p className="text-xs text-white font-bold truncate">{f.dest?.attributes?.canonicalTitle}</p></div>
                          </div>
                        ))}
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