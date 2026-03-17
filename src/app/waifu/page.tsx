'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WaifuCard from '@/components/Waifu/WaifuCard';

const GENRES = [
  { id: 'anime', label: 'Semua Anime' },
  { id: 'waifu', label: 'Waifu' },
  { id: 'neko', label: 'Neko' },
  { id: 'vocaloid', label: 'Vocaloid' },
  { id: 'genshin impact', label: 'Genshin Impact' },
  { id: 'cyberpunk', label: 'Cyberpunk' },
  { id: 'landscape anime', label: 'Scenery' },
];

export default function WaifuPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [category, setCategory] = useState('waifu');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const [offset, setOffset] = useState<number | null>(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchImages = useCallback(async (isMore = false) => {
    if (isMore) setLoadingMore(true);
    else setLoading(true);

    const currentOffset = isMore ? offset : 0;
    const term = searchQuery.trim() || category;

    try {
      // Panggil API Route lokal
      const response = await fetch(`/api/deviantart?tag=${encodeURIComponent(term)}&offset=${currentOffset}&nsfw=false`);
      const responseData = await response.json();
      
      // SYNC: Pastikan mengambil properti 'items' sesuai return dari API Route
      const newItems = responseData.items || [];

      if (isMore) {
        setData(prev => {
          const combined = [...prev, ...newItems];
          // Filter ID duplikat agar tidak error saat render key
          return combined.filter((item, index, self) => 
            index === self.findIndex((t) => t.id === item.id)
          );
        });
      } else {
        setData(newItems);
      }
      
      setOffset(responseData.nextOffset);
      setHasMore(responseData.hasMore);
    } catch (err) {
      console.error("Gagal Render Galeri:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [category, offset, searchQuery]);

  // Debounce search agar tidak terlalu sering menembak API
  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(0);
      fetchImages(false);
    }, 500);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, searchQuery]);

  return (
    <div className="min-h-screen bg-[#060910] text-white flex flex-col overflow-x-hidden">
      <Navbar />
      <main className="w-full max-w-7xl mx-auto px-4 pt-28 pb-20 flex-grow">
        
        <div className="flex flex-col md:flex-row gap-6 mb-12 items-start md:items-center">
          <div className="flex-1 space-y-2">
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-left">
              Visual <span className="text-blue-500">Vault</span>
            </h1>
            <p className="text-gray-500 text-xs font-medium text-left">Eksplorasi karya seni digital dari komunitas global.</p>
          </div>

          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <input 
                type="text" 
                placeholder="Cari karakter spesifik..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm focus:border-blue-500 outline-none transition-all placeholder:text-gray-600"
              />
            </div>

            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="bg-white/5 border border-white/10 px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-3 hover:bg-white/10 text-white"
              >
                {GENRES.find(g => g.id === category)?.label || 'Kategori'}
                <svg className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M19 9l-7 7-7-7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              
              {isDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-52 bg-[#0d1117] border border-white/10 rounded-xl overflow-hidden z-[100] shadow-2xl">
                  {GENRES.map(g => (
                    <button 
                      key={g.id}
                      onClick={() => { setCategory(g.id); setIsDropdownOpen(false); setSearchQuery(''); }}
                      className="w-full text-left px-5 py-3.5 text-xs font-bold hover:bg-blue-600 transition-colors border-b border-white/5 last:border-0 text-gray-300 hover:text-white"
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- KONTEN GRID --- */}
        {loading && data.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : data.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {data.map((item, idx) => (
              <WaifuCard key={`${item.id}-${idx}`} image={item} />
            ))}
          </div>
        ) : (
          <div className="py-40 text-center text-gray-600 italic">
            {loading ? "Sedang mencari karya..." : "Wah, hasil pencarian kosong. Coba kata kunci lain ya!"}
          </div>
        )}

        {/* --- LOAD MORE --- */}
        {hasMore && !loading && data.length > 0 && (
          <div className="mt-16 flex justify-center">
            <button 
              onClick={() => fetchImages(true)} 
              disabled={loadingMore}
              className="bg-blue-600/10 border border-blue-500/20 text-blue-400 px-10 py-4 rounded-full text-xs font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-lg active:scale-95 disabled:opacity-50"
            >
              {loadingMore ? 'Mengumpulkan data...' : 'Lihat Lebih Banyak'}
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}