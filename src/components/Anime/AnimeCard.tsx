'use client';

import React, { useState, useEffect } from 'react';
import { getAnimeFullDetail } from '@/services/AnimeService'; // Sesuaikan path-nya

interface AnimeCardProps {
  anime: any;
}

export default function AnimeCard({ anime }: AnimeCardProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Ringkasan');
  const [loadingDetail, setLoadingDetail] = useState(false);
  
  // State Data Dinamis
  const [fullData, setFullData] = useState<any>(null);
  const [translatedSynopsis, setTranslatedSynopsis] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isPlayingTrailer, setIsPlayingTrailer] = useState(false);

  // Variabel Shortcut
  const attributes = anime.attributes;
  const posterImage = attributes?.posterImage?.large || attributes?.posterImage?.original;
  const youtubeId = attributes?.youtubeVideoId;
  const TABS = ['Ringkasan', 'Episode', 'Karakter', 'Reaksi', 'Franchise', 'Streaming'];

  useEffect(() => {
    const fetchEverything = async () => {
      if (!isPreviewOpen) return;
      setLoadingDetail(true);
      
      const data = await getAnimeFullDetail(anime.id);
      if (data) {
        setFullData(data);
        
        // Auto Translate Sinopsis jika di tab Ringkasan
        if (attributes?.synopsis && !translatedSynopsis) {
          setIsTranslating(true);
          try {
            const res = await fetch(`/api/translate?text=${encodeURIComponent(attributes.synopsis)}`);
            const d = await res.json();
            setTranslatedSynopsis(d.translated);
          } catch (err) { setTranslatedSynopsis(attributes.synopsis); }
          finally { setIsTranslating(false); }
        }
      }
      setLoadingDetail(false);
    };

    fetchEverything();
  }, [isPreviewOpen, anime.id]);

  // Helper Pemetaan Data Included
  const getGenres = () => fullData?.included?.filter((i: any) => i.type === 'genres') || [];
  const getStudios = () => {
    const prods = fullData?.included?.filter((i: any) => i.type === 'productions' && i.attributes.role === 'studio') || [];
    return prods.map((p: any) => {
      const producerId = p.relationships?.producer?.data?.id;
      return fullData?.included?.find((inc: any) => inc.type === 'producers' && inc.id === producerId)?.attributes?.name;
    }).filter(Boolean);
  };

  const detailData = [
    { label: 'Jepang', value: attributes?.titles?.ja_jp },
    { label: 'Romaji', value: attributes?.titles?.en_jp },
    { label: 'Tipe', value: attributes?.showType?.toUpperCase() },
    { label: 'Episode', value: attributes?.episodeCount },
    { label: 'Status', value: attributes?.status === 'finished' ? 'Selesai' : 'Tayang' },
    { label: 'Musim', value: attributes?.season ? `${attributes.season.toUpperCase()} ${attributes.startDate?.substring(0,4)}` : attributes?.startDate?.substring(0,4) },
    { label: 'Studio', value: getStudios().join(', ') || 'TBA' },
    { label: 'Rating', value: attributes?.ageRatingGuide },
  ];

  return (
    <>
      {/* Thumbnail Card */}
      <div onClick={() => setIsPreviewOpen(true)} className="group relative overflow-hidden rounded-2xl bg-[#0d1117] border border-white/5 transition-all hover:border-indigo-500/60 cursor-pointer shadow-lg">
        <div className="aspect-[3/4] overflow-hidden relative">
          <img src={posterImage} className="h-full w-full object-cover group-hover:scale-105 transition-all duration-700" alt="" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent" />
          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm border border-white/10 rounded-lg px-2 py-1 text-white text-[9px] font-bold">★ {attributes?.averageRating}%</div>
        </div>
        <div className="p-3">
          <h3 className="text-[10px] font-bold text-gray-400 group-hover:text-white truncate uppercase tracking-tighter transition-colors">{attributes?.canonicalTitle}</h3>
        </div>
      </div>

      {/* Full Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[999999] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setIsPreviewOpen(false)}>
          <div className="relative w-full sm:max-w-6xl bg-[#080b12] border border-white/8 rounded-t-3xl sm:rounded-3xl flex flex-col lg:flex-row overflow-hidden h-[100dvh] sm:h-[90vh] shadow-2xl animate-in slide-in-from-bottom-6 duration-300" onClick={(e) => e.stopPropagation()}>
            
            <button onClick={() => setIsPreviewOpen(false)} className="absolute top-4 right-4 z-[70] bg-black/40 hover:bg-white/10 rounded-xl p-2 text-gray-400 hover:text-white transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>

            {/* Sidebar Kiri */}
            <aside className="w-full lg:w-[320px] xl:w-[380px] shrink-0 p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-white/8 bg-gradient-to-b from-[#0c101a] to-[#080b12] overflow-y-auto lg:h-full">
              <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black max-w-[200px] lg:max-w-full mx-auto">
                <img src={posterImage} className="w-full h-full object-cover" alt="" />
                {youtubeId && !isPlayingTrailer && (
                  <button onClick={() => setIsPlayingTrailer(true)} className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-red-600 p-5 rounded-full shadow-2xl hover:scale-110 transition-all"><svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.841z" /></svg></div>
                  </button>
                )}
                {isPlayingTrailer && (
                  <iframe className="absolute inset-0 w-full h-full" src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`} allowFullScreen />
                )}
              </div>

              <div className="w-full mt-10 space-y-5 text-left border-t border-white/6 pt-8 pb-10 lg:pb-0">
                <h4 className="text-white text-[11px] font-black uppercase tracking-[0.3em] mb-4 opacity-50">Technical Specs</h4>
                {detailData.map((d, i) => d.value && (
                  <div key={i} className="flex flex-col gap-1">
                    <span className="text-[8px] text-indigo-400 font-black uppercase tracking-widest">{d.label}</span>
                    <span className="text-[11px] text-gray-200 font-bold leading-tight break-words">{d.value}</span>
                  </div>
                ))}
              </div>
            </aside>

            {/* Konten Kanan */}
            <main className="flex-1 flex flex-col lg:overflow-hidden bg-[#080b12]">
              <header className="px-6 sm:px-10 pt-6 sm:pt-10 bg-[#080b12] sticky top-0 z-30">
                <h2 className="text-3xl sm:text-5xl font-black italic text-white uppercase tracking-tighter leading-[0.9] mb-10 text-left">{attributes?.canonicalTitle}</h2>
                <nav className="flex gap-2 overflow-x-auto no-scrollbar border-b border-white/6">
                  {TABS.map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 pb-6 text-[10px] font-black uppercase tracking-[0.3em] transition-all shrink-0 ${activeTab === tab ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-gray-600'}`}>
                      {tab}
                    </button>
                  ))}
                </nav>
              </header>

              <div className="flex-1 overflow-y-auto p-6 sm:p-10 no-scrollbar pb-32 text-left">
                {loadingDetail ? (
                   <div className="py-20 text-center text-gray-500 uppercase text-[10px] font-black animate-pulse">Syncing Database...</div>
                ) : (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {activeTab === 'Ringkasan' && (
                      <div className="space-y-8">
                        <div className="flex flex-wrap gap-2">
                           {getGenres().map((g: any) => <span key={g.id} className="bg-white/5 px-3 py-1 rounded-full border border-white/5 text-[9px] text-gray-400 font-black uppercase">{g.attributes.name}</span>)}
                        </div>
                        <p className="text-gray-300 text-[14px] leading-relaxed font-medium">{isTranslating ? 'Menerjemahkan...' : translatedSynopsis || attributes?.synopsis}</p>
                      </div>
                    )}
                    
                    {activeTab === 'Episode' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(fullData?.included?.filter((i: any) => i.type === 'episodes') || []).map((ep: any, i: number) => (
                          <div key={i} className="flex gap-4 p-4 bg-white/4 rounded-3xl border border-white/8">
                             <div className="w-24 sm:w-32 aspect-video bg-gray-900 rounded-xl overflow-hidden shrink-0">
                               <img src={ep.attributes?.thumbnail?.original || posterImage} className="w-full h-full object-cover" alt="" />
                             </div>
                             <div className="min-w-0 flex flex-col justify-center">
                                <span className="text-indigo-400 text-[8px] font-black uppercase">EP {ep.attributes?.number}</span>
                                <h4 className="text-white text-[11px] font-black uppercase truncate">{ep.attributes?.canonicalTitle}</h4>
                             </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Tab Lainnya Bisa Mengikuti Logika yang Sama */}
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