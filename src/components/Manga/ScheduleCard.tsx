'use client';

import React, { useState, useEffect } from 'react';

interface ScheduleCardProps {
  item: any;
  variant?: 'default' | 'large';
}

export default function ScheduleCard({ item, variant = 'default' }: ScheduleCardProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [episodes,  setEpisodes]  = useState<any[]>([]);
  const [characters, setCharacters] = useState<any[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [activeTab, setActiveTab] = useState('Ringkasan');

  const isLarge = variant === 'large';
  const TABS    = ['Ringkasan', 'Episode', 'Karakter'];

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

  const title    = item?.title || item?.title_english || 'Judul tidak diketahui';
  const imgSrc   = item?.images?.jpg?.large_image_url || item?.images?.jpg?.image_url || '/placeholder.jpg';
  const type     = item?.type || 'TV';
  const score    = item?.score || 'N/A';
  const airTime  = convertToWIB(item?.broadcast?.time || 'TBA');
  const broadcastString = item?.broadcast?.string || 'Jadwal belum tersedia';
  const synopsis = item?.synopsis || 'Deskripsi untuk anime ini belum tersedia. Nantikan info selanjutnya!';

  // ── Fetch detail saat modal terbuka ──────────────────────────
  useEffect(() => {
    if (!isPreviewOpen || !item?.mal_id) return;

    const fetchAnimeExtra = async () => {
      setLoadingDetail(true);
      try {
        const [charRes, epRes] = await Promise.all([
          fetch(`https://api.jikan.moe/v4/anime/${item.mal_id}/characters`),
          fetch(`https://api.jikan.moe/v4/anime/${item.mal_id}/episodes`),
        ]);

        if (charRes.ok) {
          const charData = await charRes.json();
          setCharacters(charData.data?.slice(0, 8) || []);
        }
        if (epRes.ok) {
          const epData = await epRes.json();
          setEpisodes(epData.data?.slice(0, 12) || []);
        }
      } catch (e) {
        console.error('Gagal memuat detail anime:', e);
      } finally {
        setLoadingDetail(false);
      }
    };

    fetchAnimeExtra();
  }, [isPreviewOpen, item?.mal_id]);

  useEffect(() => {
    document.body.style.overflow = isPreviewOpen ? 'hidden' : 'unset';
    if (!isPreviewOpen) setActiveTab('Ringkasan');
    return () => { document.body.style.overflow = 'unset'; };
  }, [isPreviewOpen]);

  return (
    <>
      {/* ── KARTU ──────────────────────────────────────────────── */}
      <div
        onClick={() => setIsPreviewOpen(true)}
        className={`
          flex-shrink-0 snap-start group relative overflow-hidden rounded-xl sm:rounded-2xl
          bg-[#0d1117] border border-white/5
          hover:border-blue-500/40 hover:shadow-[0_4px_24px_rgba(59,130,246,0.15)]
          transition-all duration-300 cursor-pointer
          ${isLarge ? 'w-[260px] sm:w-[300px] md:w-[320px]' : 'w-[180px] sm:w-[210px] md:w-[240px]'}
        `}
      >
        <div className={`relative overflow-hidden ${isLarge ? 'aspect-video' : 'aspect-[16/10]'}`}>
          <img
            src={imgSrc}
            alt={title}
            className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-transparent to-transparent" />
          <div className="absolute top-2 left-2 bg-blue-600/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-lg">
            <span className="text-[8px] font-black text-white uppercase tracking-wider">{airTime}</span>
          </div>
        </div>

        <div className="px-3 sm:px-3.5 py-2.5 sm:py-3">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="h-px w-3 bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.5)]" />
            <span className="text-blue-500 text-[7px] font-black uppercase tracking-widest">{type}</span>
          </div>
          <h4 className="text-[10px] sm:text-[11px] font-bold text-white uppercase italic tracking-tight line-clamp-2 leading-snug">
            {title}
          </h4>
        </div>
      </div>

      {/* ── MODAL ──────────────────────────────────────────────── */}
      {isPreviewOpen && (
        <div
          className="fixed inset-0 z-[999999] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-3 md:p-4 lg:p-6"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div
            className="relative w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl
                       h-[90dvh] sm:h-[85vh] md:h-[82vh]
                       bg-[#080b12] border border-white/[0.07]
                       rounded-t-[28px] sm:rounded-2xl md:rounded-3xl
                       overflow-hidden flex flex-col lg:flex-row
                       shadow-[0_-30px_100px_rgba(0,0,0,0.9)] sm:shadow-2xl
                       animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-300"
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
              className="absolute top-3 right-3 sm:top-3.5 sm:right-3.5 z-50
                         w-8 h-8 flex items-center justify-center
                         bg-white/5 hover:bg-red-500 active:scale-90
                         border border-white/10 rounded-xl
                         text-white transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* ── Sidebar poster ──────────────────────────────── */}
            <div className="relative lg:w-[280px] xl:w-[300px] shrink-0 h-[32vh] sm:h-[38vh] lg:h-full overflow-hidden border-b lg:border-b-0 lg:border-r border-white/5">
              <img src={imgSrc} alt={title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080b12] via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#080b12]/60" />
              <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 bg-blue-600 px-2.5 sm:px-3 py-1.5 rounded-lg shadow-xl">
                <span className="text-[9px] sm:text-[10px] font-black text-white uppercase tracking-wide">{airTime}</span>
              </div>
            </div>

            {/* ── Area konten ─────────────────────────────────── */}
            <div className="flex-1 flex flex-col min-h-0">
              <header className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-7 pb-0">
                <p className="text-blue-500 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.4em] mb-1.5">
                  Jadwal Simulcast
                </p>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black italic text-white uppercase tracking-tighter leading-tight mb-4 sm:mb-5 pr-8">
                  {title}
                </h2>
                <nav className="flex gap-4 sm:gap-6 border-b border-white/5">
                  {TABS.map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-2.5 sm:pb-3 text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${
                        activeTab === tab
                          ? 'text-blue-400 border-b-2 border-blue-500'
                          : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </nav>
              </header>

              <div className="flex-1 overflow-y-auto no-scrollbar px-4 sm:px-6 lg:px-8 py-4 sm:py-5 pb-8">
                {loadingDetail ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3 opacity-40">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                      Sebentar ya, lagi disiapkan...
                    </span>
                  </div>
                ) : (
                  <div className="text-left animate-in fade-in duration-300">

                    {/* Ringkasan */}
                    {activeTab === 'Ringkasan' && (
                      <div className="space-y-5 sm:space-y-6">
                        <p className="text-gray-300 text-sm sm:text-[15px] leading-relaxed font-normal">
                          {synopsis}
                        </p>
                        <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-5 border-t border-white/5">
                          <div>
                            <p className="text-[8px] text-gray-500 font-black uppercase mb-1 tracking-widest">Skor</p>
                            <p className="text-lg sm:text-xl font-black text-blue-400">★ {score}</p>
                          </div>
                          <div>
                            <p className="text-[8px] text-gray-500 font-black uppercase mb-1 tracking-widest">Jadwal Tayang</p>
                            <p className="text-xs sm:text-sm text-white font-semibold leading-snug">{broadcastString}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Episode */}
                    {activeTab === 'Episode' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                        {episodes.length > 0 ? (
                          episodes.map((ep, i) => (
                            <div key={i} className="p-2.5 sm:p-3 bg-white/5 hover:bg-white/[0.08] transition-colors rounded-xl border border-white/5">
                              <p className="text-blue-400 text-[8px] font-black uppercase tracking-widest mb-0.5">
                                Episode {ep.mal_id}
                              </p>
                              <p className="text-white text-xs sm:text-sm font-semibold truncate">{ep.title}</p>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-full text-center py-12">
                            <p className="text-gray-500 text-sm font-medium">
                              Daftar episode belum tersedia untuk anime ini.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Karakter */}
                    {activeTab === 'Karakter' && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                        {characters.length > 0 ? (
                          characters.map((c, i) => (
                            <div key={i} className="text-center group">
                              <img
                                src={c.character.images.jpg.image_url}
                                className="w-full aspect-[3/4] object-cover rounded-xl mb-1.5 sm:mb-2 border border-white/5 group-hover:scale-105 transition-transform duration-300"
                                alt={c.character.name}
                              />
                              <p className="text-[9px] sm:text-[10px] font-black text-white uppercase truncate leading-tight">
                                {c.character.name}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-full text-center py-12">
                            <p className="text-gray-500 text-sm font-medium">
                              Info karakter belum tersedia.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}