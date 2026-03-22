'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WaifuCard from '@/components/Waifu/WaifuCard';
import { getWaifuGallery } from '@/lib/waifu-service';

const GENRES = [
  { id: 'trending',               label: '🔥 Trending'       },
  { id: 'anime',                  label: '🎌 Anime'           },
  { id: 'waifu',                  label: '✨ Waifu'           },
  { id: 'video game fan art',     label: '🎮 Video Game'      },
  { id: 'boku no hero academia',  label: '🦸 MHA'             },
  { id: 'naruto',                 label: '🍥 Naruto'          },
  { id: 'league of legends',      label: '⚔️ LoL'             },
  { id: 'genshin impact',         label: '🌸 Genshin'         },
  { id: 'overwatch',              label: '🎯 Overwatch'       },
  { id: 'digimon',                label: '👾 Digimon'         },
  { id: 'demon',                  label: '😈 Demons'          },
  { id: 'angel',                  label: '👼 Angels'          },
  { id: 'mecha',                  label: '🤖 Mecha'           },
  { id: 'concept art',            label: '🖌️ Concept Art'     },
  { id: 'drawings and paintings', label: '🎨 Ilustrasi'       },
  { id: 'skyscape',               label: '🌅 Landscape'       },
  { id: 'neko',                   label: '🐱 Neko'            },
  { id: 'spider-man',             label: '🕷️ Spider-Man'      },
];

export default function WaifuPage() {
  const [data,            setData]            = useState<any[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [loadingMore,     setLoadingMore]     = useState(false);
  const [category,        setCategory]        = useState('trending');
  const [searchQuery,     setSearchQuery]     = useState('');
  const [isNsfw,          setIsNsfw]          = useState(false);
  const [isDropdownOpen,  setIsDropdownOpen]  = useState(false);
  const [offset,          setOffset]          = useState<number | null>(0);
  const [hasMore,         setHasMore]         = useState(true);
  const [errorMessage,    setErrorMessage]    = useState<string | null>(null);
  const [isLoggedIn,      setIsLoggedIn]      = useState(false);
  const [selectedImage,   setSelectedImage]   = useState<any | null>(null);
  const [isDownloading,   setIsDownloading]   = useState(false);
  const [isFetchingMeta,  setIsFetchingMeta]  = useState(false);
  const [translatedDesc,  setTranslatedDesc]  = useState('');
  const [isTranslatingDesc, setIsTranslatingDesc] = useState(false);
  const [isDescExpanded,  setIsDescExpanded]  = useState(false);
  const [imgRatio,        setImgRatio]        = useState<'portrait' | 'landscape' | 'square'>('portrait');
  const [searchedAs,      setSearchedAs]      = useState<string>('');
  const [isFullscreen,    setIsFullscreen]    = useState(false);
  const [sortMode,        setSortMode]        = useState<'newest' | 'popular'>('newest');

  const dropdownRef   = useRef<HTMLDivElement>(null);
  const requestIdRef  = useRef(0);

  const translateDescription = async (text: string) => {
    if (!text) return;
    setIsTranslatingDesc(true);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error('Translate failed');
      const d = await res.json();
      setTranslatedDesc(d.translatedText || text);
    } catch {
      setTranslatedDesc(text);
    } finally {
      setIsTranslatingDesc(false);
    }
  };

  const handleCardClick = async (img: any) => {
    setSelectedImage(img);
    setTranslatedDesc('');
    setImgRatio('portrait');
    setIsFetchingMeta(true);

    if (img.url || img.preview) {
      const probeUrl = `/api/proxy?url=${encodeURIComponent(img.preview || img.url)}`;
      const tempImg = new window.Image();
      tempImg.onload = () => {
        const ratio = tempImg.naturalWidth / tempImg.naturalHeight;
        if (ratio > 1.15) setImgRatio('landscape');
        else if (ratio < 0.87) setImgRatio('portrait');
        else setImgRatio('square');
      };
      tempImg.src = probeUrl;
    }
    try {
      const res = await fetch(`/api/deviantart?id=${img.id}`);
      if (res.ok) {
        const meta = await res.json();
        setSelectedImage((prev: any) => prev ? { ...prev, ...meta } : prev);
        if (meta.description) translateDescription(meta.description);
      }
    } catch { /* tetap tampilkan modal dengan data dasar */ }
    finally { setIsFetchingMeta(false); }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    setIsLoggedIn(document.cookie.includes('da_access_token'));
    document.body.style.overflow = selectedImage ? 'hidden' : 'auto';
    if (!selectedImage) { setTranslatedDesc(''); setIsDescExpanded(false); setIsFullscreen(false); }
    return () => { document.body.style.overflow = 'auto'; };
  }, [selectedImage]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedImage(null); };
    if (selectedImage) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedImage]);

  const fetchImages = useCallback(async (isMore = false, customOffset?: number) => {
    const requestId = ++requestIdRef.current;
    if (isMore) setLoadingMore(true);
    else { setLoading(true); setErrorMessage(null); }

    const currentOffset = isMore ? (offset ?? 0) : (customOffset ?? 0);
    const term = searchQuery.trim() || category;

    try {
      const result = await getWaifuGallery(term, currentOffset, isNsfw, sortMode);
      if (requestId !== requestIdRef.current) return;

      if (result && 'error' in result && result.error) {
        if (result.error === 429) setErrorMessage('Terlalu banyak permintaan. Tunggu sebentar ya.');
        else if (result.error === 401) setErrorMessage('Sesi kamu habis, silakan login ulang.');
        else setErrorMessage(`Gagal memuat konten (Error ${result.error}).`);
        setHasMore(false);
        if (!isMore) setData([]);
        return;
      }

      const newItems = Array.isArray(result?.items) ? result.items : [];
      if (isMore) {
        setData(prev => {
          const combined = [...(Array.isArray(prev) ? prev : []), ...newItems];
          return combined.filter((item, i, self) => i === self.findIndex(t => t?.id === item?.id));
        });
      } else {
        setData(newItems);
        if (result?.searchedAs && result.searchedAs !== (searchQuery.trim() || category)) {
          setSearchedAs(result.searchedAs);
        } else {
          setSearchedAs('');
        }
      }
      setOffset(result?.nextOffset ?? null);
      setHasMore(result?.hasMore ?? false);
    } catch {
      setErrorMessage('Koneksi bermasalah, coba refresh halaman ya!');
      if (!isMore) setData([]);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, [category, searchQuery, offset, isNsfw]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOffset(0);
    fetchImages(false, 0);
  };

  useEffect(() => {
    setOffset(0);
    const t = setTimeout(() => fetchImages(false, 0), 100);
    return () => clearTimeout(t);
  }, [category, isNsfw, sortMode]);

  // Search hanya jalan saat tekan Enter atau klik tombol cari

  const handleNsfwToggle = () => {
    if (!isLoggedIn) { window.location.href = '/login'; return; }
    setIsNsfw(v => !v);
  };

  const handleDownload = async () => {
    if (!selectedImage || isDownloading) return;
    setIsDownloading(true);
    try {
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(selectedImage.url)}`;
      const response = await fetch(proxyUrl);
      const blob = await response.blob();
      let ext = 'jpg';
      if (blob.type) { const t = blob.type.split('/')[1]; ext = t === 'jpeg' ? 'jpg' : (t || 'jpg'); }
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${(selectedImage.title || 'coreanime').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      alert('Gagal mengunduh gambar. Coba lagi ya!');
    } finally {
      setIsDownloading(false);
    }
  };

  const safeData = Array.isArray(data) ? data : [];

  const formatDate = (ts: number) => {
    if (!ts) return '—';
    return new Date(ts * 1000).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const generateTags = (image: any) => {
    const tags = ['coreanime', 'digitalart', 'anime'];
    if (category !== 'trending') tags.push(category.replace(/\s+/g, ''));
    if (searchQuery) tags.push(searchQuery.replace(/\s+/g, ''));
    if (image.isMature) tags.push('mature');
    return [...new Set(tags)];
  };

  return (
    <div className="min-h-screen bg-[#060910] text-white flex flex-col selection:bg-pink-500/30">
      <Navbar />

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 md:pt-28 pb-16 sm:pb-20 flex-grow">

        {/* ── HEADER ── */}
        <div className="relative mb-6 sm:mb-10 md:mb-12">
          <div className="absolute -top-16 -left-10 w-72 h-72 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.06) 0%, transparent 70%)' }} />

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            {/* Judul */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[9px] text-pink-400/70 font-black uppercase tracking-[0.3em]">CoreAnime</span>
                <div className="h-px w-6 bg-pink-500/30" />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase leading-none italic"
                style={{ letterSpacing: '-0.03em' }}>
                Visual{' '}
                <span className="text-transparent bg-clip-text"
                  style={{ backgroundImage: 'linear-gradient(135deg, #f472b6, #ec4899, #be185d)' }}>
                  Vault
                </span>
              </h1>
              <p className="text-gray-500 text-xs sm:text-sm font-medium max-w-xs sm:max-w-md">
                Galeri karya seni digital anime pilihan dari seluruh dunia.
              </p>
            </div>

            {/* Controls — mobile: stack vertikal, desktop: row */}
            <div className="flex flex-col gap-2 w-full sm:w-auto sm:items-end">
              {/* Baris 1: Search bar — full width di mobile */}
              <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full sm:w-64 md:w-72">
                <input
                  type="text"
                  placeholder="Cari karakter, genre... (tekan Enter)"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-11 py-3 text-sm rounded-xl outline-none transition-all placeholder:text-gray-600"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  onFocus={e => (e.target.style.border = '1px solid rgba(236,72,153,0.5)')}
                  onBlur={e  => (e.target.style.border  = '1px solid rgba(255,255,255,0.08)')}
                />
                <button type="submit"
                  className="absolute right-2 w-7 h-7 flex items-center justify-center rounded-lg text-white transition-all active:scale-90"
                  style={{ background: 'linear-gradient(135deg,#ec4899,#be185d)' }}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </form>

              {/* Baris 2: Filter chips — scroll horizontal di mobile */}
              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
                {/* Dropdown Kategori */}
                <div className="relative flex-shrink-0" ref={dropdownRef}>
                  <button type="button" onClick={() => setIsDropdownOpen(v => !v)}
                    className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 whitespace-nowrap"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <span className="max-w-[120px] truncate">{GENRES.find(g => g.id === category)?.label}</span>
                    <svg className="w-3.5 h-3.5 opacity-50 flex-shrink-0 transition-transform duration-200"
                      style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-52 rounded-2xl overflow-hidden z-50"
                      style={{
                        background: 'rgba(8,11,18,0.98)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        backdropFilter: 'blur(24px)',
                        boxShadow: '0 20px 60px -10px rgba(0,0,0,0.9)',
                      }}>
                      {GENRES.map(g => (
                        <button key={g.id} type="button"
                          onClick={() => { setCategory(g.id); setSearchQuery(''); setIsDropdownOpen(false); }}
                          className="block w-full px-4 py-2.5 text-left text-sm font-medium transition-colors"
                          style={{
                            background:  category === g.id ? 'rgba(236,72,153,0.12)' : 'transparent',
                            color:       category === g.id ? '#f472b6' : 'rgba(255,255,255,0.7)',
                            borderLeft:  category === g.id ? '2px solid #ec4899' : '2px solid transparent',
                          }}
                          onMouseEnter={e => { if (category !== g.id) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
                          onMouseLeave={e => { if (category !== g.id) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                        >{g.label}</button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sort toggle */}
                <div className="flex rounded-xl overflow-hidden flex-shrink-0"
                  style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
                  {(['newest', 'popular'] as const).map(mode => (
                    <button key={mode} type="button" onClick={() => setSortMode(mode)}
                      className="px-3 py-2.5 text-[9px] font-black uppercase tracking-widest transition-all duration-200 active:scale-95 whitespace-nowrap"
                      style={{
                        background:  sortMode === mode ? 'linear-gradient(135deg,rgba(236,72,153,0.25),rgba(190,24,93,0.15))' : 'transparent',
                        color:       sortMode === mode ? '#f472b6' : 'rgba(255,255,255,0.3)',
                        borderRight: mode === 'newest' ? '1px solid rgba(255,255,255,0.06)' : 'none',
                      }}>
                      {mode === 'newest' ? '🆕 Baru' : '🔥 Top'}
                    </button>
                  ))}
                </div>

                {/* NSFW toggle */}
                <button type="button" onClick={handleNsfwToggle}
                  className="px-3 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-300 active:scale-95 whitespace-nowrap flex-shrink-0"
                  style={{
                    background: isNsfw ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)',
                    border:     isNsfw ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.08)',
                    color:      isNsfw ? '#f87171' : 'rgba(255,255,255,0.35)',
                    boxShadow:  isNsfw ? '0 0 16px -4px rgba(239,68,68,0.3)' : 'none',
                  }}>
                  {isLoggedIn ? (isNsfw ? '🔞 ON' : 'NSFW') : '🔒'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── ERROR ── */}
        {errorMessage && (
          <div className="mb-6 px-5 py-4 rounded-2xl text-sm text-center"
            style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
            {errorMessage}
            {errorMessage.includes('login') && (
              <a href="/login" className="ml-2 font-bold underline hover:text-white transition-colors">Masuk Sekarang →</a>
            )}
          </div>
        )}

        {/* ── FALLBACK NOTIF ── */}
        {searchedAs && !loading && safeData.length > 0 && (
          <div className="mb-5 px-4 py-3 rounded-2xl flex items-start gap-3"
            style={{ background: 'rgba(236,72,153,0.07)', border: '1px solid rgba(236,72,153,0.15)' }}>
            <span className="text-lg flex-shrink-0">🔍</span>
            <div>
              <p className="text-[11px] sm:text-xs font-bold text-pink-300">
                Hasil untuk <span className="text-white">"{searchedAs}"</span>
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">
                Kami tidak menemukan hasil persis, tapi ini yang paling mendekati.
              </p>
            </div>
          </div>
        )}

        {/* ── GRID ── */}
        {loading && safeData.length === 0 && !errorMessage ? (
          <div className="space-y-3">
            <p className="text-[10px] text-pink-400/50 font-black uppercase tracking-widest animate-pulse flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full border-2 border-pink-500 border-t-transparent animate-spin" />
              {searchQuery ? `Nyari "${searchQuery}"...` : 'Memuat galeri...'}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-xl sm:rounded-2xl animate-pulse"
                  style={{ background: 'linear-gradient(110deg,#0f1219 30%,#1a2030 50%,#0f1219 70%)', animationDelay: `${i * 60}ms` }} />
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
              {safeData.map((item, i) => (
                <WaifuCard key={`${item?.id || i}-${i}`} image={item} onCardClick={handleCardClick} />
              ))}
            </div>

            {safeData.length === 0 && !loading && !errorMessage && (
              <div className="text-center py-14 sm:py-20 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="text-4xl mb-3">😕</div>
                <p className="text-white text-sm sm:text-base font-bold mb-1.5">Hasilnya masih kosong nih</p>
                <p className="text-gray-500 text-xs sm:text-sm px-4 mb-4 max-w-sm mx-auto">
                  Coba kata yang lebih umum seperti nama karakter atau genre anime.
                </p>
                <div className="flex flex-wrap justify-center gap-2 px-4">
                  {['anime girl', 'zero two', 'sakura', 'mecha', 'neko'].map(sug => (
                    <button key={sug} onClick={() => setSearchQuery(sug)}
                      className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all active:scale-95"
                      style={{ background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.2)', color: '#f472b6' }}>
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {hasMore && safeData.length > 0 && !errorMessage && (
              <div className="mt-10 sm:mt-16 text-center">
                <button onClick={() => fetchImages(true)} disabled={loadingMore}
                  className="px-8 sm:px-12 py-3.5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 disabled:opacity-50"
                  style={{
                    background: loadingMore ? 'rgba(255,255,255,0.07)' : 'white',
                    color:      loadingMore ? 'rgba(255,255,255,0.5)' : '#060910',
                    boxShadow:  loadingMore ? 'none' : '0 8px 32px -8px rgba(255,255,255,0.3)',
                  }}>
                  {loadingMore ? (
                    <span className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Tunggu sebentar...
                    </span>
                  ) : 'Muat Lebih Banyak'}
                </button>
              </div>
            )}
          </>
        )}

        {/* ════════════ MODAL ════════════
            Selalu flex-row di desktop (gambar kiri, info kanan)
            flex-col di mobile (gambar atas, info bawah scroll)
        ══════════════════════════════ */}
        {selectedImage && (
          <div
            className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center sm:p-3 md:p-6"
            style={{ background: 'rgba(3,5,11,0.94)', backdropFilter: 'blur(28px)' }}
            onClick={() => setSelectedImage(null)}
          >
            <div
              className="relative w-full flex flex-col sm:flex-row overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, #0e1320 0%, #0a0d14 100%)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 'clamp(1rem,3vw,1.5rem)',
                boxShadow: '0 40px 100px -20px rgba(236,72,153,0.18)',
                // Lebar modal: landscape lebih lebar
                maxWidth: imgRatio === 'landscape' ? 'min(96vw, 1020px)' : 'min(96vw, 860px)',
                // Tinggi: mobile = 92dvh, desktop = auto (konten menentukan) tapi max 90vh
                height: '92dvh',
                maxHeight: '92dvh',
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Aksen atas */}
              <div className="absolute top-0 left-0 right-0 h-[2px] z-10"
                style={{ background: 'linear-gradient(90deg, transparent, #ec4899 40%, #f472b6 60%, transparent)' }} />
              {/* Drag handle mobile */}
              <div className="sm:hidden flex justify-center pt-3 absolute top-0 left-0 right-0 z-10 pointer-events-none">
                <div className="w-8 h-1 rounded-full bg-white/15" />
              </div>

              {/* Tombol tutup */}
              <button onClick={() => setSelectedImage(null)}
                className="absolute top-3 right-3 z-30 w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-white transition-all duration-300"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'rotate(90deg)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'rotate(0deg)')}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* ── Panel Gambar ──
                  Mobile: lebar penuh, tinggi terbatas (max 45% layar)
                  Desktop portrait/square: 46% lebar, tinggi penuh
                  Desktop landscape: 58% lebar (gambar lebih lega), tinggi penuh
              */}
              <div
                className="relative flex-shrink-0 overflow-hidden"
                style={{
                  background: '#06080f',
                  // Mobile: full width, tinggi proporsional agar info masih keliatan
                  width: '100%',
                  height: 'clamp(200px, 48vw, 300px)',
                  // Desktop override via className sm:
                }}
              >
                {/* Override desktop */}
                <style>{`
                  @media (min-width: 640px) {
                    .modal-img-panel {
                      width: ${imgRatio === 'landscape' ? '58%' : '46%'} !important;
                      height: 100% !important;
                    }
                  }
                `}</style>
                <div className="modal-img-panel absolute inset-0">
                  <Image src={`/api/proxy?url=${encodeURIComponent(selectedImage.url)}`} alt=""
                    fill className="object-cover scale-110 blur-xl opacity-30" unoptimized aria-hidden />
                  <Image src={`/api/proxy?url=${encodeURIComponent(selectedImage.url)}`} alt={selectedImage.title}
                    fill className="object-contain relative z-10"
                    style={{ filter: 'drop-shadow(0 4px 32px rgba(0,0,0,0.6))' }} unoptimized />

                  {(selectedImage.favorites > 0 || selectedImage.views > 0) && (
                    <div className="absolute bottom-3 left-3 flex gap-2 z-20">
                      {selectedImage.favorites > 0 && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold"
                          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.08)', color: '#f472b6' }}>
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                          </svg>
                          {selectedImage.favorites}
                        </div>
                      )}
                      {selectedImage.views > 0 && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold"
                          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                          </svg>
                          {selectedImage.views > 999 ? `${(selectedImage.views / 1000).toFixed(1)}k` : selectedImage.views}
                        </div>
                      )}
                    </div>
                  )}

                  <button onClick={() => setIsFullscreen(true)}
                    className="absolute bottom-3 right-3 z-20 w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-200 active:scale-90 hover:scale-110"
                    style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)' }}>
                    <svg className="w-3.5 h-3.5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Fullscreen overlay */}
              {isFullscreen && (
                <div className="absolute inset-0 z-50 flex items-center justify-center"
                  style={{ background: 'rgba(0,0,0,0.97)', backdropFilter: 'blur(4px)' }}
                  onClick={() => setIsFullscreen(false)}>
                  <button onClick={e => { e.stopPropagation(); setIsFullscreen(false); }}
                    className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-xl z-10 transition-all active:scale-90"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
                    <svg className="w-4 h-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                        d="M9 9V4m0 5H4m0 0l5 5M15 9h5m-5 0V4m0 5l5-5M9 15H4m5 0v5m0-5l-5 5M15 15l5 5m-5-5v5m0-5h5" />
                    </svg>
                  </button>
                  <p className="absolute top-4 left-4 text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Ketuk untuk kembali</p>
                  <div className="relative w-full h-full" onClick={() => setIsFullscreen(false)}>
                    <Image src={`/api/proxy?url=${encodeURIComponent(selectedImage.url)}`} alt={selectedImage.title}
                      fill className="object-contain" style={{ padding: '48px 16px 16px' }} unoptimized />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-10 text-center"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)' }}>
                    <p className="text-white text-xs sm:text-sm font-bold truncate">{selectedImage.title}</p>
                    <p className="text-[10px] mt-0.5 font-medium" style={{ color: '#f472b6' }}>@{selectedImage.author}</p>
                  </div>
                </div>
              )}

              {/* ── Info panel — SELALU tampil (kanan desktop, bawah mobile) ── */}
              <div className="flex flex-col flex-1 min-h-0 overflow-hidden"
                style={{ borderLeft: '1px solid rgba(255,255,255,0.05)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 min-h-0">

                  <div className="flex items-center gap-2 pt-1">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#ec4899', boxShadow: '0 0 8px #ec4899' }} />
                    <span className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: '#ec4899' }}>CoreAnime · Kodel Dev</span>
                  </div>

                  <div>
                    <h2 className="text-sm sm:text-base md:text-lg font-black text-white leading-snug break-words italic" style={{ letterSpacing: '-0.02em' }}>
                      {selectedImage.title}
                    </h2>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {selectedImage.authorAvatar && (
                        <img src={selectedImage.authorAvatar} alt="" className="w-5 h-5 rounded-full object-cover flex-shrink-0"
                          style={{ border: '1px solid rgba(255,255,255,0.1)' }} />
                      )}
                      <span className="text-[11px] text-gray-500 font-medium">
                        oleh <span className="text-gray-300 font-bold">{selectedImage.author}</span>
                      </span>
                      {selectedImage.publishedTime && (
                        <span className="text-[10px] text-gray-700 ml-auto flex-shrink-0">{formatDate(selectedImage.publishedTime)}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {selectedImage.isMature && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest"
                          style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
                          🔞 18+ Mature
                        </span>
                      )}
                      {selectedImage.isAiGenerated && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest"
                          style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', color: '#a5b4fc' }}>
                          🤖 AI Generated
                        </span>
                      )}
                    </div>
                  </div>

                  {(selectedImage.favorites > 0 || selectedImage.views > 0 || selectedImage.comments > 0) && (
                    <div className="flex gap-3 flex-wrap">
                      {selectedImage.favorites > 0 && (
                        <div className="flex items-center gap-1.5 text-[11px] font-bold" style={{ color: '#f472b6' }}>
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                          </svg>
                          {selectedImage.favorites} Favorit
                        </div>
                      )}
                      {selectedImage.views > 0 && (
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                          </svg>
                          {selectedImage.views > 999 ? `${(selectedImage.views / 1000).toFixed(1)}k` : selectedImage.views}
                        </div>
                      )}
                    </div>
                  )}

                  {(selectedImage.downloadWidth > 0 || selectedImage.downloadFilesize) && (
                    <div className="rounded-xl overflow-hidden text-xs" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                      {[
                        selectedImage.downloadWidth > 0 && { icon: '📐', label: 'Ukuran', value: `${selectedImage.downloadWidth} × ${selectedImage.downloadHeight} px` },
                        selectedImage.downloadFilesize && { icon: '📦', label: 'File', value: selectedImage.downloadFilesize },
                        selectedImage.downloadFilename && { icon: '📄', label: 'Nama', value: selectedImage.downloadFilename },
                      ].filter(Boolean).map((row: any, i: number) => (
                        <div key={i} className="flex items-center gap-3 px-3 sm:px-4 py-2.5"
                          style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                          <span className="text-sm flex-shrink-0">{row.icon}</span>
                          <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider flex-shrink-0 w-14">{row.label}</span>
                          <span className="text-[11px] font-medium ml-auto text-right break-all" style={{ color: 'rgba(255,255,255,0.65)' }}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {isFetchingMeta ? (
                    <div className="space-y-2">
                      <div className="h-3 w-16 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-2.5 rounded animate-pulse"
                          style={{ background: 'rgba(255,255,255,0.04)', width: `${100 - i * 15}%` }} />
                      ))}
                    </div>
                  ) : selectedImage.description ? (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <p className="text-[9px] text-gray-600 font-black uppercase tracking-[0.2em]">Deskripsi</p>
                        {isTranslatingDesc && (
                          <span className="flex items-center gap-1 text-[9px] text-pink-400/60 font-bold uppercase tracking-wider">
                            <svg className="w-2.5 h-2.5 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                            Menerjemahkan...
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] sm:text-xs leading-relaxed"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: isDescExpanded ? 'unset' : 4,
                          WebkitBoxOrient: 'vertical',
                          overflow: isDescExpanded ? 'visible' : 'hidden',
                          color: isTranslatingDesc ? 'rgba(255,255,255,0.2)' : 'rgba(156,163,175,1)',
                          transition: 'color 0.3s ease',
                        } as any}>
                        {translatedDesc || selectedImage.description}
                      </p>
                      {(translatedDesc || selectedImage.description).length > 160 && (
                        <button onClick={() => setIsDescExpanded(v => !v)}
                          className="mt-1 text-[10px] font-black uppercase tracking-widest transition-colors"
                          style={{ color: '#ec4899' }}
                          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#f9a8d4')}
                          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#ec4899')}>
                          {isDescExpanded ? '↑ Tutup' : '↓ Baca Selengkapnya'}
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="px-4 py-3 rounded-xl text-[11px] text-gray-600 leading-relaxed"
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                      Karya seni digital dikurasi oleh <span style={{ color: '#ec4899' }}>CoreAnime</span>.{' '}
                      {selectedImage.isMature ? 'Konten 18+.' : 'Aman untuk semua usia.'}
                    </div>
                  )}

                  {isFetchingMeta ? (
                    <div className="flex flex-wrap gap-1.5">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-5 rounded-md animate-pulse"
                          style={{ width: `${48 + i * 12}px`, background: 'rgba(236,72,153,0.08)', animationDelay: `${i * 60}ms` }} />
                      ))}
                    </div>
                  ) : selectedImage.tags?.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedImage.tags.slice(0, 20).map((t: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded-md text-[9px] font-bold lowercase"
                          style={{ background: 'rgba(236,72,153,0.07)', border: '1px solid rgba(236,72,153,0.15)', color: 'rgba(244,114,182,0.7)' }}>
                          #{t}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {generateTags(selectedImage).map((t, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.35)' }}>
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tombol Unduh */}
                <div className="p-3 sm:p-4 flex-shrink-0"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(8,11,18,0.9)' }}>
                  <button onClick={handleDownload} disabled={isDownloading}
                    className="w-full py-3 sm:py-3.5 rounded-xl font-black text-[11px] uppercase tracking-widest text-white transition-all active:scale-[0.97] flex items-center justify-center gap-2 disabled:opacity-60"
                    style={{
                      background: isDownloading ? 'rgba(236,72,153,0.35)' : 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
                      boxShadow:  isDownloading ? 'none' : '0 6px 24px -6px rgba(236,72,153,0.55)',
                    }}>
                    {isDownloading ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sedang Mengunduh...</>
                    ) : (
                      <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M7 10l5 5 5-5M12 15V3" />
                      </svg>Unduh Gambar Original</>
                    )}
                  </button>
                  <p className="mt-2 text-center text-[9px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.1)' }}>
                    © CoreAnime · Kodel Dev · Visual Vault
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes coreModalIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes coreSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}