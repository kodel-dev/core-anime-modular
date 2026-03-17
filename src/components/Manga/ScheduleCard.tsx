'use client';

import React, { useState, useEffect } from 'react';

interface ScheduleCardProps {
  item: any;
  variant?: 'default' | 'large';
}

export default function ScheduleCard({ item, variant = 'default' }: ScheduleCardProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [characters, setCharacters] = useState<any[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [activeTab, setActiveTab] = useState('Ringkasan');

  const isLarge = variant === 'large';
  const TABS = ['Ringkasan', 'Episode', 'Karakter'];

  // ─── FUNGSI INTERNAL convertToWIB ───
  const convertToWIB = (timeString: string) => {
    if (!timeString || timeString === 'TBA') return 'TBA';
    try {
      const [hours, minutes] = timeString.split(':').map(Number);
      if (isNaN(hours)) return timeString;
      let localHours = hours - 2; // Konversi JST ke WIB
      if (localHours < 0) localHours += 24;
      return `${localHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} WIB`;
    } catch (e) {
      return timeString;
    }
  };

  const title = item?.title || item?.title_english || 'Unknown Anime';
  const imgSrc = item?.images?.jpg?.large_image_url || item?.images?.jpg?.image_url || '/placeholder.jpg';
  const type = item?.type || 'TV';
  const source = item?.source || 'Original';
  const score = item?.score || 'N/A';
  const airTime = convertToWIB(item?.broadcast?.time || 'TBA');
  const broadcastString = item?.broadcast?.string || 'TBA';
  const synopsis = item?.synopsis || 'Deskripsi untuk simulcast ini belum tersedia.';

  // Fetch data detail saat modal dibuka
  useEffect(() => {
    if (!isPreviewOpen || !item?.mal_id) return;

    const fetchAnimeExtra = async () => {
      setLoadingDetail(true);
      try {
        // Fetch Characters
        const charRes = await fetch(`https://api.jikan.moe/v4/anime/${item.mal_id}/characters`);
        const charData = await charRes.json();
        setCharacters(charData.data?.slice(0, 8) || []);

        // Fetch Episodes
        const epRes = await fetch(`https://api.jikan.moe/v4/anime/${item.mal_id}/episodes`);
        const epData = await epRes.json();
        setEpisodes(epData.data?.slice(0, 12) || []);
      } catch (e) {
        console.error("Error fetching anime detail:", e);
      } finally {
        setLoadingDetail(false);
      }
    };

    fetchAnimeExtra();
  }, [isPreviewOpen, item?.mal_id]);

  useEffect(() => {
    document.body.style.overflow = isPreviewOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isPreviewOpen]);

  return (
    <>
      {/* ── CARD ── */}
      <div
        onClick={() => setIsPreviewOpen(true)}
        className={`flex-shrink-0 snap-start group relative overflow-hidden rounded-2xl
                    bg-[#0d1117] border border-white/5
                    hover:border-blue-500/40 hover:shadow-[0_4px_24px_rgba(59,130,246,0.15)]
                    transition-all duration-300 cursor-pointer
                    ${isLarge ? 'w-[280px] md:w-[320px]' : 'w-[200px] md:w-[240px]'}`}
      >
        <div className={`relative overflow-hidden ${isLarge ? 'aspect-video' : 'aspect-[16/10]'}`}>
          <img
            src={imgSrc}
            alt={title}
            className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-transparent to-transparent" />
          <div className="absolute top-2.5 left-2.5 bg-blue-600/90 backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-lg">
            <span className="text-[8px] font-black text-white uppercase tracking-wider">{airTime}</span>
          </div>
        </div>

        <div className="px-3.5 py-3">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="h-px w-3 bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.5)]" />
            <span className="text-blue-500 text-[7px] font-black uppercase tracking-widest">{type}</span>
          </div>
          <h4 className="text-[11px] font-bold text-white uppercase italic tracking-tight line-clamp-1">{title}</h4>
        </div>
      </div>

      {/* ── MODAL ── */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[999999] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setIsPreviewOpen(false)}>
          <div className="relative w-full sm:max-w-5xl bg-[#080b12] border border-white/[0.07] rounded-t-[28px] sm:rounded-3xl overflow-hidden flex flex-col lg:flex-row h-[90dvh] sm:h-[85vh] shadow-2xl animate-in slide-in-from-bottom-6 duration-300" onClick={(e) => e.stopPropagation()}>
            
            <button onClick={() => setIsPreviewOpen(false)} className="absolute top-4 right-4 z-50 p-2 bg-white/5 hover:bg-red-500 rounded-full text-white transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>

            {/* Poster Sidebar */}
            <div className="relative lg:w-[300px] shrink-0 h-[35vh] lg:h-full overflow-hidden border-b lg:border-b-0 lg:border-r border-white/5">
              <img src={imgSrc} alt={title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080b12] via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 bg-blue-600 px-3 py-1.5 rounded-lg shadow-xl"><span className="text-[10px] font-black text-white uppercase">{airTime}</span></div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col min-h-0">
              <header className="p-6 sm:p-8 pb-0">
                <p className="text-blue-500 text-[9px] font-black uppercase tracking-[0.4em] mb-2">Simulcast Schedule</p>
                <h2 className="text-2xl sm:text-4xl font-black italic text-white uppercase tracking-tighter leading-none mb-6">{title}</h2>
                <nav className="flex gap-6 border-b border-white/5">
                  {TABS.map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}>{tab}</button>
                  ))}
                </nav>
              </header>

              <div className="flex-1 overflow-y-auto p-6 sm:p-8 no-scrollbar">
                {loadingDetail ? (
                  <p className="text-center py-20 text-[10px] font-black uppercase animate-pulse tracking-widest">Fetching Data...</p>
                ) : (
                  <div className="text-left animate-in fade-in duration-500">
                    {activeTab === 'Ringkasan' && (
                      <div className="space-y-6">
                        <p className="text-gray-300 text-sm leading-relaxed font-medium">{synopsis}</p>
                        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
                          <div><p className="text-[8px] text-gray-500 font-black uppercase mb-1">Score</p><p className="text-lg font-black text-blue-500">★ {score}</p></div>
                          <div><p className="text-[8px] text-gray-500 font-black uppercase mb-1">Broadcast</p><p className="text-xs text-white font-bold">{broadcastString}</p></div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'Episode' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {episodes.length > 0 ? episodes.map((ep, i) => (
                          <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5">
                            <p className="text-blue-500 text-[8px] font-black uppercase">Episode {ep.mal_id}</p>
                            <p className="text-white text-xs font-bold truncate">{ep.title}</p>
                          </div>
                        )) : <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">No episode data available.</p>}
                      </div>
                    )}

                    {activeTab === 'Karakter' && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {characters.length > 0 ? characters.map((c, i) => (
                          <div key={i} className="text-center group">
                            <img src={c.character.images.jpg.image_url} className="w-full aspect-[3/4] object-cover rounded-xl mb-2 grayscale group-hover:grayscale-0 transition-all border border-white/5" alt="" />
                            <p className="text-[9px] font-black text-white uppercase truncate">{c.character.name}</p>
                          </div>
                        )) : <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">No character data available.</p>}
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