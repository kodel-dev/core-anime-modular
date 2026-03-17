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
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  const attributes = anime.attributes || anime; 
  const posterImage = attributes?.posterImage?.large || attributes?.posterImage?.original || attributes?.images?.jpg?.large_image_url;
  const youtubeId = attributes?.youtubeVideoId || attributes?.trailer?.youtube_id;

  const TABS = ['Ringkasan', 'Episode', 'Karakter', 'Reaksi', 'Franchise', 'Streaming'];

  const KITSU_HEADERS = {
    'Accept': 'application/vnd.api+json',
    'Content-Type': 'application/vnd.api+json',
  };

  const convertToWIB = (timeString: string) => {
    if (!timeString || timeString === 'TBA') return 'TBA';
    try {
      const [hours, minutes] = timeString.split(':').map(Number);
      if (isNaN(hours)) return timeString;
      let localHours = hours - 2; 
      if (localHours < 0) localHours += 24;
      return `${localHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} WIB`;
    } catch (e) { return timeString; }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'TBA';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const fetchEpisodesRecursive = async (offset = 0) => {
    if (offset === 0) {
      setLoadingEpisodes(true);
      setEpisodes([]); 
    }
    try {
      const res = await fetch(`https://kitsu.io/api/edge/anime/${anime.id}/episodes?page[limit]=20&page[offset]=${offset}`, { headers: KITSU_HEADERS });
      if (!res.ok) { setLoadingEpisodes(false); return; }
      const result = await res.json();
      const newBatch = result.data || [];
      if (newBatch.length > 0) {
        setEpisodes(prev => [...prev, ...newBatch]);
        if (newBatch.length === 20) fetchEpisodesRecursive(offset + 20);
        else setLoadingEpisodes(false);
      } else setLoadingEpisodes(false);
    } catch (e) { console.error(e); setLoadingEpisodes(false); }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!isPreviewOpen || !anime.id) return;
      if (activeTab === 'Ringkasan' && attributes?.synopsis && !translatedSynopsis) {
        setIsTranslating(true);
        try {
          const res = await fetch(`/api/translate?text=${encodeURIComponent(attributes.synopsis)}`);
          const data = await res.json();
          setTranslatedSynopsis(data.translated);
        } catch (err) { setTranslatedSynopsis(attributes.synopsis); }
        finally { setIsTranslating(false); }
      }

      setLoadingDetail(true);
      try {
        if (productions.studios.length === 0) {
          const resProd = await fetch(`https://kitsu.io/api/edge/anime/${anime.id}/productions?include=producer`, { headers: KITSU_HEADERS });
          if (resProd.ok) {
            const dataProd = await resProd.json();
            const studios = dataProd.data?.filter((p: any) => p.attributes.role === 'studio')
              .map((p: any) => dataProd.included?.find((inc: any) => inc.type === 'producers' && inc.id === p.relationships.producer.data.id)?.attributes?.name)
              .filter(Boolean);
            setProductions({ studios: studios || [] });
          }
        }

        if (activeTab === 'Episode' && episodes.length === 0) {
          fetchEpisodesRecursive(0);
        } 
        else if (activeTab === 'Streaming' && streamingLinks.length === 0) {
          const res = await fetch(`https://kitsu.io/api/edge/anime/${anime.id}/streaming-links`, { headers: KITSU_HEADERS });
          if (res.ok) {
            const data = await res.json();
            setStreamingLinks(data?.data || []);
          }
        } 
        else if (activeTab === 'Karakter' && characters.length === 0) {
          const res = await fetch(`https://kitsu.io/api/edge/castings?filter[media_id]=${anime.id}&filter[media_type]=Anime&filter[is_character]=true&filter[language]=Japanese&include=character,person&page[limit]=15`, { headers: KITSU_HEADERS });
          if (res.ok) {
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
          }
        } else if (activeTab === 'Franchise' && franchise.length === 0) {
          const res = await fetch(`https://kitsu.io/api/edge/anime/${anime.id}/media-relationships?include=destination`, { headers: KITSU_HEADERS });
          if (res.ok) {
            const data = await res.json();
            if (data.data) {
              const mapped = data.data.map((rel: any) => {
                const dest = data.included?.find((inc: any) => (inc.type === 'anime' || inc.type === 'manga') && inc.id === rel.relationships.destination.data.id);
                return { role: rel.attributes.role, attributes: dest?.attributes };
              }).filter((f: any) => f.attributes);
              setFranchise(mapped);
            }
          }
        } else if (activeTab === 'Reaksi' && reactions.length === 0) {
          const res = await fetch(`https://kitsu.io/api/edge/anime/${anime.id}/reviews?include=user&page[limit]=10&sort=-likesCount`, { headers: KITSU_HEADERS });
          if (res.ok) {
            const data = await res.json();
            if (data?.data) {
              const reviewsWithUsers = data.data.map((review: any) => ({
                ...review,
                user: data.included?.find((inc: any) => inc.type === 'users' && inc.id === review.relationships?.user?.data?.id),
              }));
              setReactions(reviewsWithUsers);
            }
          }
        }
      } catch (e) { console.error(e); } 
      finally { setLoadingDetail(false); }
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
    if (link.includes('netflix')) return { label: 'Netflix', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg', color: 'from-red-700/20 to-red-900/5 border-red-500/20' };
    if (link.includes('hulu')) return { label: 'Hulu', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Hulu_Logo.svg', color: 'from-green-700/20 to-green-900/5 border-green-500/20' };
    if (link.includes('disney')) return { label: 'Disney+', logo: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg', color: 'from-blue-700/20 to-blue-900/5 border-blue-500/20' };
    return { label: 'Official Stream', logo: null, color: 'from-indigo-700/20 to-indigo-900/5 border-indigo-500/20' };
  };

  const seasonName = attributes?.season ? attributes.season.charAt(0).toUpperCase() + attributes.season.slice(1) : '';
  const releaseYear = attributes?.startDate ? new Date(attributes.startDate).getFullYear() : '';

  const detailData = [
    { label: 'Status', value: attributes?.status === 'finished' ? 'Selesai' : 'Sedang Tayang' },
    { label: 'Tipe', value: attributes?.showType?.toUpperCase() || attributes?.type },
    { label: 'Episode', value: attributes?.episodeCount },
    { label: 'Rilis', value: attributes?.broadcast?.time ? convertToWIB(attributes.broadcast.time) : formatDate(attributes?.startDate) },
    { label: 'Musim', value: seasonName || releaseYear ? `${seasonName} ${releaseYear}`.trim() : 'TBA' },
    { label: 'Studio', value: productions.studios.length > 0 ? productions.studios.join(', ') : 'TBA' },
    { label: 'Rating', value: attributes?.ageRatingGuide || attributes?.rating },
  ];

  return (
    <>
      <div onClick={() => setIsPreviewOpen(true)} className="group relative overflow-hidden rounded-2xl bg-[#0d1117] border border-white/5 hover:border-indigo-500/50 hover:shadow-[0_8px_40px_rgba(99,102,241,0.12)] cursor-pointer transition-all duration-500">
        <div className="aspect-[3/4] overflow-hidden relative">
          <img src={posterImage} alt="" className="h-full w-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
          {attributes?.averageRating && (
            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-md px-1.5 py-0.5 text-white text-[8px] font-bold">★ {attributes.averageRating}%</div>
          )}
        </div>
        <div className="px-3 pt-2.5 pb-3">
          <h3 className="text-[10px] font-bold text-gray-400 group-hover:text-white truncate uppercase tracking-tight transition-colors">{attributes?.canonicalTitle || attributes?.title}</h3>
        </div>
      </div>

      {isPreviewOpen && (
        <div className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md p-0 sm:p-4" onClick={() => setIsPreviewOpen(false)}>
          <div className="relative w-full sm:max-w-5xl xl:max-w-6xl h-[93dvh] sm:h-[88vh] bg-[#07090f] border border-white/[0.07] rounded-t-[28px] sm:rounded-3xl flex flex-col lg:flex-row overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
            
            <button onClick={() => setIsPreviewOpen(false)} className="absolute top-4 right-4 z-50 w-8 h-8 flex items-center justify-center bg-white/[0.06] hover:bg-red-500 rounded-xl text-gray-400 hover:text-white transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>

            <aside className="shrink-0 w-full lg:w-[350px] xl:w-[400px] flex flex-col overflow-y-auto no-scrollbar px-4 pt-8 pb-4 sm:px-5 lg:h-full border-b lg:border-b-0 lg:border-r border-white/[0.07] bg-gradient-to-b from-[#0b0e18] to-[#07090f]">
              {/* PERUBAHAN DISINI: aspect-video untuk tampilan lebar */}
              <div className="relative shrink-0 w-full aspect-video rounded-xl lg:rounded-2xl overflow-hidden border border-white/[0.08] bg-black shadow-2xl mx-auto">
                {!isPlayingTrailer ? (
                  <>
                    <img src={posterImage} className="w-full h-full object-cover" alt="" />
                    {youtubeId && (
                      <button onClick={() => setIsPlayingTrailer(true)} className="absolute inset-0 flex items-center justify-center group/play">
                        <div className="bg-red-600 p-4 rounded-full shadow-2xl group-hover:scale-110 transition-all shadow-red-950/60"><svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.841z" /></svg></div>
                      </button>
                    )}
                  </>
                ) : (
                  <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`} allowFullScreen />
                )}
              </div>

              <div className="hidden lg:block mt-8 pt-7 border-t border-white/[0.06] space-y-3.5">
                <p className="text-[9px] text-white font-black uppercase tracking-[0.35em] mb-5 flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm bg-indigo-600" /> Detail Anime</p>
                {detailData.map((d, i) => d.value && (
                  <div key={i} className="flex items-start gap-2.5 text-left">
                    <span className="text-[7px] text-gray-600 font-black uppercase tracking-widest w-[50px] shrink-0 mt-0.5">{d.label}</span>
                    <span className="text-[11px] text-gray-200 font-medium leading-snug break-words flex-1">{d.value}</span>
                  </div>
                ))}
              </div>
            </aside>

            <main className="flex-1 flex flex-col overflow-hidden bg-[#07090f]">
              <header className="shrink-0 px-4 sm:px-7 pt-3 sm:pt-6 border-b border-white/[0.07] bg-[#07090f]/95 backdrop-blur-md z-20">
                <h2 className="text-2xl sm:text-4xl font-black italic text-white uppercase tracking-tighter leading-[0.9] mb-6 text-left">{attributes?.canonicalTitle || attributes?.title}</h2>
                <nav className="flex overflow-x-auto no-scrollbar gap-4">
                  {TABS.map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`px-2 pb-3.5 text-[9px] font-black uppercase tracking-widest relative transition-all shrink-0 ${activeTab === tab ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-gray-600 hover:text-gray-400'}`}>{tab}</button>
                  ))}
                </nav>
              </header>

              <div className="flex-1 overflow-y-auto p-4 sm:p-7 no-scrollbar pb-10">
                {(loadingDetail && activeTab !== 'Ringkasan' && activeTab !== 'Episode') ? (
                  <div className="py-20 text-center animate-pulse text-[10px] font-black uppercase tracking-widest opacity-20">Memuat data...</div>
                ) : (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 text-left">
                    {activeTab === 'Ringkasan' && (
                      <div className="space-y-6">
                        <p className="text-gray-300 text-[13px] sm:text-base leading-relaxed">{isTranslating ? 'Menerjemahkan...' : translatedSynopsis || attributes?.synopsis}</p>
                      </div>
                    )}

                    {activeTab === 'Episode' && (
                      <>
                        {loadingEpisodes && episodes.length === 0 ? (
                          <div className="py-20 text-center animate-pulse text-[10px] font-black uppercase tracking-widest opacity-20">Menghubungkan ke arsip...</div>
                        ) : episodes.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {episodes.map((ep: any, i: number) => (
                              <div key={i} className="flex gap-3 p-3 bg-white/[0.04] rounded-xl border border-white/[0.06]">
                                <img src={ep.attributes?.thumbnail?.original || posterImage} className="w-20 aspect-video object-cover rounded-lg" alt="" />
                                <div className="flex flex-col justify-center min-w-0">
                                  <span className="text-indigo-400 text-[7px] font-black uppercase">EP {ep.attributes?.number}</span>
                                  <h4 className="text-white text-xs font-bold truncate italic">{ep.attributes?.canonicalTitle || `Episode ${ep.attributes?.number}`}</h4>
                                </div>
                              </div>
                            ))}
                            {loadingEpisodes && <div className="col-span-full py-4 text-center text-[8px] font-black uppercase tracking-widest opacity-30 animate-pulse">Memuat sisa episode lainnya...</div>}
                          </div>
                        ) : <p className="py-10 text-center text-gray-600 text-[10px] font-black uppercase tracking-widest italic">Data episode tidak ditemukan.</p>}
                      </>
                    )}

                    {activeTab === 'Karakter' && (
                      characters.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-5 gap-4">
                          {characters.map((char: any, i: number) => (
                            <div key={i} className="flex flex-col gap-2">
                              <img src={char.image} className="aspect-[3/4] object-cover rounded-xl border border-white/5 shadow-lg" alt="" />
                              <p className="text-[10px] font-black text-white uppercase text-center truncate">{char.name}</p>
                              <div className="flex items-center gap-2 justify-center opacity-60">
                                <img src={char.vaImage} className="w-5 h-5 rounded-full border border-indigo-500/30 object-cover" alt="" />
                                <span className="text-[8px] font-bold text-gray-400 uppercase truncate">{char.vaName}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : <p className="py-10 text-center text-gray-600 text-[10px] font-black uppercase tracking-widest italic">Data karakter kosong.</p>
                    )}

                    {activeTab === 'Reaksi' && (
                      reactions.length > 0 ? (
                        <div className="space-y-6 max-w-5xl">
                          {reactions.map((review: any, i: number) => (
                            <div key={i} className="bg-white/4 p-6 sm:p-8 rounded-[2rem] border border-white/8 flex flex-col sm:flex-row gap-8">
                              <div className="w-full sm:w-32 shrink-0 flex flex-row sm:flex-col items-center gap-4 text-center">
                                <img src={review.user?.attributes?.avatar?.tiny || 'https://placehold.co/100x100?text=U'} className="w-14 h-14 rounded-full border-2 border-indigo-500/20" alt="" />
                                <div className="flex-1 sm:flex-none">
                                  <p className="text-white text-[13px] font-bold truncate mb-1">{review.user?.attributes?.name || 'User'}</p>
                                  <p className="text-yellow-400 text-[10px] font-black uppercase tracking-widest">★ {review.attributes?.likesCount || 0} Votes</p>
                                </div>
                              </div>
                              <div className="flex-1 relative">
                                <div className="absolute top-0 left-[-15px] sm:left-[-25px] w-1 h-6 bg-indigo-600 rounded-full" />
                                <p className="text-gray-300 text-[14px] leading-relaxed italic font-medium break-words">"{review.attributes?.content}"</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : <p className="py-10 text-center text-gray-600 text-[10px] font-black uppercase tracking-widest italic">Belum ada reaksi pengguna.</p>
                    )}

                    {activeTab === 'Franchise' && (
                      franchise.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                          {franchise.map((item: any, i: number) => (
                            <div key={i} className="bg-white/[0.04] hover:bg-indigo-600/10 hover:border-indigo-500/25 transition-all p-3 rounded-xl sm:rounded-2xl border border-white/[0.06] flex gap-3.5 items-center group/fr">
                              <div className="w-10 aspect-[2/3] shrink-0 overflow-hidden rounded-lg border border-white/[0.08]">
                                <img src={item.attributes?.posterImage?.tiny || posterImage} className="w-full h-full object-cover" alt="" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[7px] text-indigo-400 font-black uppercase mb-1 tracking-widest">{item.role}</p>
                                <p className="text-[11px] text-white font-black line-clamp-2 uppercase italic leading-tight">{item.attributes?.canonicalTitle}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : <p className="py-10 text-center text-gray-600 text-[10px] font-black uppercase tracking-widest italic">Tidak ada anime terkait.</p>
                    )}

                    {activeTab === 'Streaming' && (
                      streamingLinks.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {streamingLinks.map((link: any, i: number) => {
                            const platform = getPlatformInfo(link.attributes?.url);
                            return (
                              <button key={i} onClick={() => window.open(link.attributes?.url, '_blank')} className={`flex items-center justify-between bg-gradient-to-r ${platform.color} p-5 rounded-2xl border border-white/5 hover:brightness-125 transition-all`}>
                                <div className="flex items-center gap-3">
                                  {platform.logo ? <img src={platform.logo} className="h-4 object-contain" alt="" /> : <div className="w-1 h-4 bg-indigo-500 rounded-full" />}
                                  <span className="text-xs font-black uppercase tracking-widest text-white">{platform.label}</span>
                                </div>
                                <svg className="w-4 h-4 text-white/50" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" /><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" /></svg>
                              </button>
                            );
                          })}
                        </div>
                      ) : <p className="py-10 text-center text-gray-600 text-[10px] font-black uppercase tracking-widest italic">Link streaming tidak ditemukan.</p>
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