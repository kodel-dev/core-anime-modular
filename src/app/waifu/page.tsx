'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WaifuCard from '@/components/Waifu/WaifuCard';
import { getWaifuGallery } from '@/lib/waifu-service';

// Menambahkan 'Trending' di urutan pertama
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
  // Default pencarian diatur ke 'trending'
  const [category, setCategory] = useState('trending');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNsfw, setIsNsfw] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const [offset, setOffset] = useState<number | null>(0);
  const [hasMore, setHasMore] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const requestIdRef = useRef(0);

  useEffect(() => {
    const hasToken = document.cookie.includes('da_access_token');
    setIsLoggedIn(hasToken);
  }, []);

  const fetchImages = useCallback(async (isMore = false, customOffset?: number) => {
    const requestId = ++requestIdRef.current;

    if (isMore) setLoadingMore(true);
    else {
      setLoading(true);
      setErrorMessage(null);
    }

    const currentOffset = isMore ? (offset ?? 0) : (customOffset ?? 0);
    const term = searchQuery.trim() || category;

    try {
      const result = await getWaifuGallery(term, currentOffset, isNsfw);

      if (requestId !== requestIdRef.current) return;

      if (result && 'error' in result && result.error) {
        if (result.error === 429) {
          setErrorMessage("Sesi berakhir atau terlalu banyak permintaan. Silakan segarkan halaman.");
        } else if (result.error === 401) {
          setErrorMessage("Akses ditolak. Anda belum login atau sesi telah berakhir.");
        } else {
          setErrorMessage(`Gagal memuat konten dari server (Error ${result.error}).`);
        }
        setHasMore(false);
        if (!isMore) setData([]);
        return;
      }

      const newItems = Array.isArray(result?.items) ? result.items : [];

      if (isMore) {
        setData(prev => {
          const safePrev = Array.isArray(prev) ? prev : [];
          const combined = [...safePrev, ...newItems];
          return combined.filter(
            (item, index, self) => index === self.findIndex(t => t?.id === item?.id)
          );
        });
      } else {
        setData(newItems);
      }

      setOffset(result?.nextOffset ?? null);
      setHasMore(result?.hasMore ?? false);
    } catch (err) {
      setErrorMessage("Terjadi kesalahan jaringan.");
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
    const timer = setTimeout(() => {
      fetchImages(false, 0); 
    }, 100);
    return () => clearTimeout(timer);
  }, [category, isNsfw]);

  const handleNsfwToggle = () => {
    if (!isLoggedIn) {
      window.location.href = '/login';
      return;
    }
    setIsNsfw(!isNsfw);
  };

  const safeData = Array.isArray(data) ? data : [];

  return (
    <div className="min-h-screen bg-[#060910] text-white flex flex-col selection:bg-blue-500/30">
      <Navbar />

      <main className="w-full max-w-7xl mx-auto px-6 pt-32 pb-20 flex-grow">
        <div className="relative mb-16">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-600/10 blur-[120px] rounded-full" />
          <div className="relative flex flex-col md:flex-row gap-8 items-end justify-between">
            <div className="space-y-2">
              <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">
                Visual <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Vault</span>
              </h1>
              <p className="text-gray-400 text-sm font-medium tracking-wide max-w-md">
                Galeri karya seni digital pilihan dari komunitas DeviantArt.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
              <form onSubmit={handleSearchSubmit} className="relative flex-1 md:flex-none flex items-center">
                <input
                  type="text"
                  placeholder="Cari karakter (ex: Gojo Satoru)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full md:w-64 bg-white/5 border border-white/10 rounded-2xl pl-5 pr-12 py-3.5 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder:text-gray-600"
                />
                <button 
                  type="submit" 
                  className="absolute right-2 p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors shadow-lg active:scale-95"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </button>
              </form>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="bg-white/5 border border-white/10 px-6 py-3.5 rounded-2xl text-sm font-bold flex items-center gap-3 hover:bg-white/10 transition-all active:scale-95 shadow-xl"
                >
                  {GENRES.find(g => g.id === category)?.label}
                  <svg className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full right-0 mt-3 w-56 bg-[#0d1117]/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden z-[100] shadow-2xl animate-in fade-in slide-in-from-top-2">
                    {GENRES.map(g => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => {
                          setCategory(g.id);
                          setSearchQuery('');
                          setIsDropdownOpen(false);
                        }}
                        className={`block w-full px-5 py-4 text-left text-sm transition-colors ${category === g.id ? 'bg-blue-600 text-white' : 'hover:bg-white/5 text-gray-300'}`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button 
                type="button"
                onClick={handleNsfwToggle}
                className={`px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase border transition-all duration-300 ${
                  isNsfw ? 'bg-red-500 border-red-400 text-white shadow-lg shadow-red-500/20' : 'bg-white/5 border-white/10 text-gray-500'
                } ${!isLoggedIn ? 'opacity-80 hover:border-blue-500 hover:text-blue-400' : ''}`}
              >
                {isLoggedIn ? `NSFW ${isNsfw ? 'ON' : 'OFF'}` : '🔒 Login for NSFW'}
              </button>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-10 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-center text-sm backdrop-blur-sm animate-pulse">
            {errorMessage}
            {errorMessage.includes("belum login") && (
              <div className="mt-3">
                <a href="/login" className="underline font-bold text-red-300 hover:text-white transition-colors">Masuk Sekarang</a>
              </div>
            )}
          </div>
        )}

        {loading && safeData.length === 0 && !errorMessage ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="aspect-[3/4.5] bg-white/5 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {safeData.map((item, idx) => (
                <WaifuCard key={`${item?.id || idx}-${idx}`} image={item} />
              ))}
            </div>

            {safeData.length === 0 && !loading && !errorMessage && (
              <div className="text-center py-20 text-gray-500 text-sm font-medium border border-white/5 rounded-3xl bg-white/5 backdrop-blur-sm">
                Tidak ada data yang ditemukan.
              </div>
            )}

            {hasMore && safeData.length > 0 && !errorMessage && (
              <div className="mt-20 text-center relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                <button
                  onClick={() => fetchImages(true)}
                  disabled={loadingMore}
                  className="relative bg-white text-black hover:bg-blue-500 hover:text-white px-12 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl transition-all active:scale-95 disabled:opacity-50"
                >
                  {loadingMore ? 'Memuat data...' : 'Muat Lebih Banyak'}
                </button>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}