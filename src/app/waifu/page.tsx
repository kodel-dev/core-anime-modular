'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WaifuCard from '@/components/Waifu/WaifuCard';
import { getWaifuGallery } from '@/lib/waifu-service';

const GENRES = [
  { id: 'trending', label: '🔥 Trending' },
  { id: 'waifu', label: 'Waifu' },
  { id: 'neko', label: 'Neko' },
  { id: 'genshin impact', label: 'Genshin' },
  { id: 'anime scenery', label: 'Scenery' },
  { id: 'digital art', label: 'Digital art' },
];

export default function WaifuPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [category, setCategory] = useState('trending');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNsfw, setIsNsfw] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [offset, setOffset] = useState<number | null>(0);
  const [hasMore, setHasMore] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isFetchingMeta, setIsFetchingMeta] = useState(false);
  const [translatedDesc, setTranslatedDesc] = useState('');
  const [isTranslatingDesc, setIsTranslatingDesc] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  // Translate deskripsi ke Bahasa Indonesia via /api/translate (POST)
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
      const data = await res.json();
      setTranslatedDesc(data.translatedText || text);
    } catch {
      setTranslatedDesc(text); // fallback teks asli
    } finally {
      setIsTranslatingDesc(false);
    }
  };

  // Klik kartu → fetch metadata dulu, baru buka modal
  const handleCardClick = async (img: any) => {
    setSelectedImage(img);
    setTranslatedDesc(''); // reset translate dari kartu sebelumnya
    setIsFetchingMeta(true);
    try {
      const res = await fetch(`/api/deviantart?id=${img.id}`);
      if (res.ok) {
        const meta = await res.json();
        setSelectedImage((prev: any) => prev ? { ...prev, ...meta } : prev);
        // Auto-translate deskripsi begitu metadata datang
        if (meta.description) translateDescription(meta.description);
      }
    } catch {
      // metadata gagal, modal tetap terbuka dengan data dasar
    } finally {
      setIsFetchingMeta(false);
    }
  };

  const requestIdRef = useRef(0);

  useEffect(() => {
    const hasToken = document.cookie.includes('da_access_token');
    setIsLoggedIn(hasToken);
    if (selectedImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
      setTranslatedDesc(''); // reset terjemahan saat modal ditutup
      setIsDescExpanded(false);
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [selectedImage]);

  // Tutup modal dengan Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedImage(null);
    };
    if (selectedImage) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedImage]);

  const fetchImages = useCallback(async (isMore = false, customOffset?: number) => {
    const requestId = ++requestIdRef.current;
    if (isMore) setLoadingMore(true);
    else { setLoading(true); setErrorMessage(null); }

    const currentOffset = isMore ? (offset ?? 0) : (customOffset ?? 0);
    // "trending" bukan tag valid, kirim keyword khusus supaya API route tahu pakai endpoint /browse/popular
    const term = searchQuery.trim() || category;

    try {
      const result = await getWaifuGallery(term, currentOffset, isNsfw);
      if (requestId !== requestIdRef.current) return;

      if (result && 'error' in result && result.error) {
        if (result.error === 429) setErrorMessage("Terlalu banyak permintaan. Coba lagi sebentar ya.");
        else if (result.error === 401) setErrorMessage("Sesi kamu habis, silakan login ulang.");
        else setErrorMessage(`Gagal memuat konten (Error ${result.error}).`);
        setHasMore(false);
        if (!isMore) setData([]);
        return;
      }

      const newItems = Array.isArray(result?.items) ? result.items : [];
      if (isMore) {
        setData(prev => {
          const safePrev = Array.isArray(prev) ? prev : [];
          const combined = [...safePrev, ...newItems];
          return combined.filter((item, i, self) => i === self.findIndex(t => t?.id === item?.id));
        });
      } else {
        setData(newItems);
      }
      setOffset(result?.nextOffset ?? null);
      setHasMore(result?.hasMore ?? false);
    } catch {
      setErrorMessage("Koneksi bermasalah, coba refresh halaman.");
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
    const timer = setTimeout(() => { fetchImages(false, 0); }, 100);
    return () => clearTimeout(timer);
  }, [category, isNsfw]);

  const handleNsfwToggle = () => {
    if (!isLoggedIn) { window.location.href = '/login'; return; }
    setIsNsfw(!isNsfw);
  };

  const handleDownload = async () => {
    if (!selectedImage || isDownloading) return;
    setIsDownloading(true);
    try {
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(selectedImage.url)}`;
      const response = await fetch(proxyUrl);
      const blob = await response.blob();
      let extension = 'jpg';
      if (blob.type) {
        const type = blob.type.split('/')[1];
        if (type === 'jpeg') extension = 'jpg';
        else if (type) extension = type;
      }
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const safeFileName = (selectedImage.title || 'coreanime-artwork').replace(/[^a-z0-9]/gi, '_').toLowerCase();
      link.download = `${safeFileName}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      alert('Gagal mengunduh. Coba lagi ya!');
    } finally {
      setIsDownloading(false);
    }
  };

  // Konten terkunci (butuh subscribe DeviantArt) sudah difilter di API route
  // isMature tetap ditampilkan dengan lock jika NSFW off
  const safeData = Array.isArray(data) ? data : [];

  const formatPublishedDate = (unixTimestamp: number) => {
    if (!unixTimestamp) return '—';
    return new Date(unixTimestamp * 1000).toLocaleDateString('id-ID', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
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

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-28 sm:pt-32 pb-20 flex-grow">

        {/* ── HEADER ── */}
        <div className="relative mb-10 sm:mb-14">
          {/* Ambient glow */}
          <div className="absolute -top-16 -left-10 w-72 h-72 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)' }}
          />

          <div className="relative flex flex-col gap-5 sm:gap-0 sm:flex-row sm:items-end sm:justify-between">
            {/* Judul */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[9px] text-pink-400/70 font-black uppercase tracking-[0.3em]">CoreAnime</span>
                <div className="h-px w-8 bg-pink-500/30" />
              </div>
              <h1
                className="text-4xl sm:text-5xl md:text-6xl font-black uppercase leading-none"
                style={{ letterSpacing: '-0.03em', fontStyle: 'italic' }}
              >
                Visual{' '}
                <span
                  className="text-transparent bg-clip-text"
                  style={{ backgroundImage: 'linear-gradient(135deg, #f472b6, #ec4899, #be185d)' }}
                >
                  Vault
                </span>
              </h1>
              <p className="text-gray-500 text-xs sm:text-sm font-medium tracking-wide max-w-xs sm:max-w-md">
                Galeri karya seni digital anime pilihan dari seluruh dunia.
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-2.5 w-full sm:w-auto">
              {/* Search */}
              <form onSubmit={handleSearchSubmit} className="relative flex items-center flex-1 sm:flex-none">
                <input
                  type="text"
                  placeholder="Cari karakter, genre..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full sm:w-56 md:w-64 pl-4 pr-11 py-3 text-sm rounded-xl outline-none transition-all placeholder:text-gray-600"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                  onFocus={e => ((e.target as HTMLElement).style.border = '1px solid rgba(236,72,153,0.5)')}
                  onBlur={e => ((e.target as HTMLElement).style.border = '1px solid rgba(255,255,255,0.08)')}
                />
                <button
                  type="submit"
                  className="absolute right-2 w-7 h-7 flex items-center justify-center rounded-lg text-white transition-all active:scale-90"
                  style={{ background: 'linear-gradient(135deg,#ec4899,#be185d)' }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </form>

              {/* Dropdown Kategori */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full sm:w-auto px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-between sm:justify-start gap-2 transition-all active:scale-95"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <span>{GENRES.find(g => g.id === category)?.label}</span>
                  <svg
                    className="w-4 h-4 transition-transform duration-300 flex-shrink-0"
                    style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div
                    className="absolute top-full left-0 sm:left-auto sm:right-0 mt-2 w-full sm:w-52 rounded-2xl overflow-hidden z-50"
                    style={{
                      background: 'rgba(10,14,22,0.98)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      backdropFilter: 'blur(20px)',
                      boxShadow: '0 20px 60px -10px rgba(0,0,0,0.8)',
                    }}
                  >
                    {GENRES.map(g => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => { setCategory(g.id); setSearchQuery(''); setIsDropdownOpen(false); }}
                        className="block w-full px-5 py-3.5 text-left text-sm font-medium transition-colors"
                        style={{
                          background: category === g.id ? 'linear-gradient(135deg,rgba(236,72,153,0.2),rgba(190,24,93,0.1))' : 'transparent',
                          color: category === g.id ? '#f472b6' : 'rgba(255,255,255,0.7)',
                          borderLeft: category === g.id ? '2px solid #ec4899' : '2px solid transparent',
                        }}
                        onMouseEnter={e => {
                          if (category !== g.id) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                        }}
                        onMouseLeave={e => {
                          if (category !== g.id) (e.currentTarget as HTMLElement).style.background = 'transparent';
                        }}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* NSFW Toggle */}
              <button
                type="button"
                onClick={handleNsfwToggle}
                className="px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 active:scale-95 whitespace-nowrap"
                style={{
                  background: isNsfw ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)',
                  border: isNsfw ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.08)',
                  color: isNsfw ? '#f87171' : 'rgba(255,255,255,0.35)',
                  boxShadow: isNsfw ? '0 0 20px -5px rgba(239,68,68,0.3)' : 'none',
                }}
              >
                {isLoggedIn ? `NSFW ${isNsfw ? 'ON' : 'OFF'}` : '🔒 Login for NSFW'}
              </button>
            </div>
          </div>
        </div>

        {/* ── ERROR STATE ── */}
        {errorMessage && (
          <div
            className="mb-8 px-5 py-4 rounded-2xl text-sm text-center"
            style={{
              background: 'rgba(239,68,68,0.07)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: '#fca5a5',
            }}
          >
            <span>{errorMessage}</span>
            {errorMessage.includes("login") && (
              <a href="/login" className="ml-2 font-bold underline hover:text-white transition-colors">
                Masuk Sekarang →
              </a>
            )}
          </div>
        )}

        {/* ── GRID ── */}
        {loading && safeData.length === 0 && !errorMessage ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4.5] rounded-2xl animate-pulse"
                style={{
                  background: 'linear-gradient(110deg,#0f1219 30%,#1a2030 50%,#0f1219 70%)',
                  animationDelay: `${i * 60}ms`,
                }}
              />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
              {safeData.map((item, idx) => (
                <WaifuCard
                  key={`${item?.id || idx}-${idx}`}
                  image={item}
                  onCardClick={handleCardClick}
                />
              ))}
            </div>

            {safeData.length === 0 && !loading && !errorMessage && (
              <div
                className="text-center py-20 text-gray-600 text-sm font-medium rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
              >
                Tidak ada karya yang ditemukan.
              </div>
            )}

            {hasMore && safeData.length > 0 && !errorMessage && (
              <div className="mt-16 text-center">
                <button
                  onClick={() => fetchImages(true)}
                  disabled={loadingMore}
                  className="px-10 sm:px-14 py-3.5 sm:py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 disabled:opacity-50"
                  style={{
                    background: loadingMore ? 'rgba(255,255,255,0.07)' : 'white',
                    color: loadingMore ? 'rgba(255,255,255,0.5)' : '#060910',
                    boxShadow: loadingMore ? 'none' : '0 8px 32px -8px rgba(255,255,255,0.3)',
                  }}
                >
                  {loadingMore ? (
                    <span className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Memuat...
                    </span>
                  ) : 'Muat Lebih Banyak'}
                </button>
              </div>
            )}
          </>
        )}

        {/* ════════════════════════════════════════
            MODAL DETAIL
        ════════════════════════════════════════ */}
        {selectedImage && (
          <div
            className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center sm:p-4 md:p-6 lg:p-10"
            style={{ background: 'rgba(3,5,11,0.94)', backdropFilter: 'blur(28px)', animation: 'coreModalIn 0.2s ease forwards' }}
            onClick={() => setSelectedImage(null)}
          >
            <div
              className="relative w-full sm:max-w-[920px] flex flex-col md:flex-row overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, #0e1320 0%, #0a0d14 100%)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 'clamp(1rem, 3vw, 1.5rem)',
                boxShadow: '0 40px 100px -20px rgba(236,72,153,0.18), 0 0 0 1px rgba(255,255,255,0.04)',
                animation: 'coreSlideUp 0.32s cubic-bezier(.22,.68,0,1.2) forwards',
                maxHeight: '92vh',
                // Desktop: tinggi penuh agar gambar tidak terpotong
                height: 'min(92vh, 600px)',
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Garis aksen atas */}
              <div className="absolute top-0 left-0 right-0 h-[2px] z-10"
                style={{ background: 'linear-gradient(90deg, transparent 0%, #ec4899 40%, #f472b6 60%, transparent 100%)' }}
              />

              {/* Drag handle mobile */}
              <div className="md:hidden flex justify-center pt-3 absolute top-0 left-0 right-0 z-10">
                <div className="w-8 h-1 rounded-full bg-white/15" />
              </div>

              {/* Tombol Close */}
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-3 right-3 z-30 w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-white transition-all duration-300"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'rotate(90deg)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'rotate(0deg)')}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* ══ KIRI: Gambar ══ */}
              <div
                className="relative w-full md:w-[50%] flex-shrink-0 overflow-hidden"
                style={{
                  minHeight: '240px',
                  // Mobile: batasi tinggi. Desktop (md+): isi penuh tinggi modal
                  height: 'clamp(240px, 42vw, 100%)',
                  background: 'radial-gradient(ellipse at center, #12162090 0%, #06090f 100%)',
                }}
              >
                <div className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse at 50% 70%, rgba(236,72,153,0.2) 0%, transparent 70%)' }}
                />
                <Image
                  src={`/api/proxy?url=${encodeURIComponent(selectedImage.url)}`}
                  alt={selectedImage.title}
                  fill
                  className="object-contain p-4 sm:p-6"
                  style={{ filter: 'drop-shadow(0 8px 40px rgba(0,0,0,0.7))' }}
                  unoptimized
                />

                {/* Stats floating di bawah gambar */}
                {(selectedImage.favorites > 0 || selectedImage.views > 0) && (
                  <div className="absolute bottom-3 left-3 flex gap-2">
                    {selectedImage.favorites > 0 && (
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold"
                        style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.08)', color: '#f472b6' }}
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                        {selectedImage.favorites}
                      </div>
                    )}
                    {selectedImage.views > 0 && (
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold"
                        style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                        {selectedImage.views > 999 ? `${(selectedImage.views/1000).toFixed(1)}k` : selectedImage.views}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ══ KANAN: Panel Info ══ */}
              <div className="flex flex-col flex-1 min-h-0 overflow-hidden"
                style={{ borderLeft: '1px solid rgba(255,255,255,0.05)' }}
              >
                {/* Scrollable area */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 min-h-0">

                  {/* Brand label */}
                  <div className="flex items-center gap-2 pt-1">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: '#ec4899', boxShadow: '0 0 8px #ec4899' }}
                    />
                    <span className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: '#ec4899' }}>
                      CoreAnime · Kodel Dev
                    </span>
                  </div>

                  {/* Judul */}
                  <div>
                    <h2
                      className="text-base sm:text-lg font-black text-white leading-snug break-words"
                      style={{ fontStyle: 'italic', letterSpacing: '-0.02em', wordBreak: 'break-word' }}
                    >
                      {selectedImage.title}
                    </h2>

                    {/* Author row */}
                    <div className="flex items-center gap-2 mt-2">
                      {selectedImage.authorAvatar && (
                        <img
                          src={selectedImage.authorAvatar}
                          alt=""
                          className="w-5 h-5 rounded-full object-cover flex-shrink-0"
                          style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                        />
                      )}
                      <span className="text-[11px] text-gray-500 font-medium">
                        oleh{' '}
                        <span className="text-gray-300 font-bold">
                          {selectedImage.author}
                        </span>
                      </span>
                      {selectedImage.publishedTime && (
                        <span className="text-[10px] text-gray-700 ml-auto flex-shrink-0">
                          {formatPublishedDate(selectedImage.publishedTime)}
                        </span>
                      )}
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {selectedImage.isMature && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest"
                          style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}
                        >
                          🔞 18+ Mature
                        </span>
                      )}
                      {selectedImage.isAiGenerated && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest"
                          style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', color: '#a5b4fc' }}
                        >
                          🤖 AI Generated
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stats row */}
                  {(selectedImage.favorites > 0 || selectedImage.views > 0 || selectedImage.comments > 0) && (
                    <div className="flex gap-3">
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                          </svg>
                          {selectedImage.views > 999 ? `${(selectedImage.views/1000).toFixed(1)}k` : selectedImage.views}
                        </div>
                      )}
                      {selectedImage.comments > 0 && (
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                          </svg>
                          {selectedImage.comments}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Info file (resolusi + ukuran) */}
                  {(selectedImage.downloadWidth > 0 || selectedImage.downloadFilesize) && (
                    <div className="rounded-xl overflow-hidden text-xs"
                      style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      {[
                        selectedImage.downloadWidth > 0 && {
                          icon: '📐',
                          label: 'Ukuran',
                          value: `${selectedImage.downloadWidth} × ${selectedImage.downloadHeight} px`,
                        },
                        selectedImage.downloadFilesize && {
                          icon: '📦',
                          label: 'File',
                          value: selectedImage.downloadFilesize,
                        },
                        selectedImage.downloadFilename && {
                          icon: '📄',
                          label: 'Nama File',
                          value: selectedImage.downloadFilename,
                        },
                      ].filter(Boolean).map((row: any, i: number) => (
                        <div key={i} className="flex items-center gap-3 px-4 py-2.5"
                          style={{
                            background: i % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent',
                            borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                          }}
                        >
                          <span className="text-sm flex-shrink-0">{row.icon}</span>
                          <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider flex-shrink-0 w-16">{row.label}</span>
                          <span className="text-[11px] font-medium ml-auto text-right break-all" style={{ color: 'rgba(255,255,255,0.65)' }}>
                            {row.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Deskripsi (auto-translate) */}
                  {isFetchingMeta ? (
                    <div className="space-y-2">
                      <div className="h-3 w-16 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
                      <div className="space-y-1.5">
                        <div className="h-2.5 w-full rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
                        <div className="h-2.5 w-4/5 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
                        <div className="h-2.5 w-3/5 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
                      </div>
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
                          WebkitLineClamp: isDescExpanded ? 'unset' : 5,
                          WebkitBoxOrient: 'vertical',
                          overflow: isDescExpanded ? 'visible' : 'hidden',
                          color: isTranslatingDesc ? 'rgba(255,255,255,0.2)' : 'rgba(156,163,175,1)',
                          transition: 'color 0.3s ease',
                        } as any}
                      >
                        {translatedDesc || selectedImage.description}
                      </p>
                      {/* Tombol Baca Selengkapnya */}
                      {(translatedDesc || selectedImage.description).length > 200 && (
                        <button
                          onClick={() => setIsDescExpanded(v => !v)}
                          className="mt-1 text-[10px] font-black uppercase tracking-widest transition-colors"
                          style={{ color: '#ec4899' }}
                          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#f9a8d4')}
                          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#ec4899')}
                        >
                          {isDescExpanded ? '↑ Tutup' : '↓ Baca Selengkapnya'}
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="px-4 py-3 rounded-xl text-[11px] text-gray-600 leading-relaxed"
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
                    >
                      Karya seni digital yang dikurasi oleh tim <span style={{ color: '#ec4899' }}>CoreAnime</span>.{' '}
                      {selectedImage.isMature ? 'Konten 18+.' : 'Konten aman untuk umum.'}
                    </div>
                  )}

                  {/* Tags */}
                  {isFetchingMeta ? (
                    <div className="space-y-1.5">
                      <div className="h-3 w-10 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
                      <div className="flex flex-wrap gap-1.5">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="h-5 rounded-md animate-pulse"
                            style={{ width: `${48 + i * 12}px`, background: 'rgba(236,72,153,0.08)', animationDelay: `${i * 60}ms` }}
                          />
                        ))}
                      </div>
                    </div>
                  ) : selectedImage.tags?.length > 0 ? (
                    <div className="space-y-1.5">
                      <p className="text-[9px] text-gray-600 font-black uppercase tracking-[0.2em]">Tags</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedImage.tags.slice(0, 20).map((t: string, i: number) => (
                          <span key={i}
                            className="px-2 py-0.5 rounded-md text-[9px] font-bold lowercase"
                            style={{
                              background: 'rgba(236,72,153,0.07)',
                              border: '1px solid rgba(236,72,153,0.15)',
                              color: 'rgba(244,114,182,0.7)',
                            }}
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {generateTags(selectedImage).map((t, i) => (
                        <span key={i}
                          className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider"
                          style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.07)',
                            color: 'rgba(255,255,255,0.35)',
                          }}
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tombol Unduh — sticky bawah */}
                <div className="p-4 flex-shrink-0"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(8,11,18,0.9)' }}
                >
                  <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="w-full py-3.5 rounded-xl font-black text-[11px] uppercase tracking-widest text-white transition-all active:scale-[0.97] flex items-center justify-center gap-2 disabled:opacity-60"
                    style={{
                      background: isDownloading
                        ? 'rgba(236,72,153,0.35)'
                        : 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
                      boxShadow: isDownloading ? 'none' : '0 6px 24px -6px rgba(236,72,153,0.55)',
                    }}
                  >
                    {isDownloading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sedang Mengunduh...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"
                            d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M7 10l5 5 5-5M12 15V3" />
                        </svg>
                        Unduh Gambar Original
                        {selectedImage.filesize && (
                          <span className="ml-1 opacity-60 font-medium normal-case tracking-normal text-[10px]">
                            ({selectedImage.filesize})
                          </span>
                        )}
                      </>
                    )}
                  </button>
                  <p className="mt-2 text-center text-[9px] font-bold uppercase tracking-widest"
                    style={{ color: 'rgba(255,255,255,0.12)' }}
                  >
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
        @keyframes coreModalIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes coreSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}