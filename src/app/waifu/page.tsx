'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WaifuCard from '@/components/Waifu/WaifuCard';
import { getWaifuGallery } from '@/lib/waifu-service';

const GENRES = [
  { id: 'waifu', label: 'Waifu' },
  { id: 'neko', label: 'Neko' },
  { id: 'genshin impact', label: 'Genshin' },
  { id: 'anime scenery', label: 'Scenery' },
  { id: 'digital art', label: 'Digital' },
];

export default function WaifuPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [category, setCategory] = useState('waifu');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNsfw, setIsNsfw] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const [offset, setOffset] = useState<number | null>(0);
  const [hasMore, setHasMore] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requestIdRef = useRef(0);

  const fetchImages = useCallback(async (isMore = false, customOffset?: number) => {
    const requestId = ++requestIdRef.current;

    if (isMore) setLoadingMore(true);
    else {
      setLoading(true);
      setErrorMessage(null); // Reset error saat mulai pencarian baru
    }

    const currentOffset = isMore ? (offset ?? 0) : (customOffset ?? 0);
    const term = searchQuery.trim() || category;

    try {
      const result = await getWaifuGallery(term, currentOffset, isNsfw);

      if (requestId !== requestIdRef.current) return;

      // Cek jika ada error dari service
      if ('error' in result && result.error === 429) {
        setErrorMessage("Terlalu banyak permintaan atau sesi berakhir. Silakan refresh halaman atau login kembali.");
        setHasMore(false);
        return;
      }

      if (isMore) {
        setData(prev => {
          const combined = [...prev, ...result.items];
          return combined.filter(
            (item, index, self) =>
              index === self.findIndex(t => t.id === item.id)
          );
        });
      } else {
        setData(result.items);
      }

      setOffset(result.nextOffset);
      setHasMore(result.hasMore);
    } catch (err) {
      console.error("Fetch error on Page:", err);
      setErrorMessage("Terjadi kesalahan koneksi.");
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, [category, searchQuery, offset, isNsfw]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchImages(false, 0); 
    }, 500); // Debounce ditingkatkan sedikit agar lebih aman dari rate limit

    return () => clearTimeout(timer);
  }, [category, searchQuery, isNsfw]);

  return (
    <div className="min-h-screen bg-[#060910] text-white flex flex-col overflow-x-hidden">
      <Navbar />

      <main className="w-full max-w-7xl mx-auto px-4 pt-28 pb-20 flex-grow">
        <div className="flex flex-col md:flex-row gap-6 mb-12 items-start md:items-center justify-between">
          <div className="flex-1 text-left">
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-left">
              Visual <span className="text-blue-500 text-left">Vault</span>
            </h1>
            <p className="text-gray-500 text-xs text-left">Temukan inspirasi karya seni digital.</p>
          </div>

          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <input
              type="text"
              placeholder="Cari..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm focus:border-blue-500 outline-none text-white"
            />

            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="bg-white/5 border border-white/10 px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 text-white"
              >
                {GENRES.find(g => g.id === category)?.label}
                <svg className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-[#0d1117] border border-white/10 rounded-xl overflow-hidden z-[50]">
                  {GENRES.map(g => (
                    <button
                      key={g.id}
                      onClick={() => {
                        setCategory(g.id);
                        setSearchQuery('');
                        setIsDropdownOpen(false);
                      }}
                      className="block w-full px-4 py-3 text-left text-sm hover:bg-blue-600 transition-colors text-white"
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button 
              onClick={() => setIsNsfw(!isNsfw)}
              className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase border transition-all ${
                isNsfw ? 'bg-red-600/20 border-red-500 text-red-500' : 'bg-white/5 border-white/10 text-gray-500'
              }`}
            >
              NSFW {isNsfw ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-center text-sm">
            {errorMessage}
            <button 
              onClick={() => window.location.href = '/api/auth/login'} 
              className="ml-4 underline font-bold"
            >
              Login Ulang
            </button>
          </div>
        )}

        {loading && data.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-5 animate-pulse">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-white/5 rounded-2xl" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
              {data.map((item, idx) => (
                <WaifuCard key={`${item.id}-${idx}`} image={item} />
              ))}
            </div>

            {hasMore && !errorMessage && (
              <div className="mt-16 text-center">
                <button
                  onClick={() => fetchImages(true)}
                  disabled={loadingMore}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-3 rounded-full font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50"
                >
                  {loadingMore ? 'Memuat...' : 'Load More Content'}
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