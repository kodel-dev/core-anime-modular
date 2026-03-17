'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WaifuCard from '@/components/Waifu/WaifuCard';
import { getWaifuGallery } from '@/lib/waifu-service';

// Daftar kategori yang tersedia
const CATEGORIES = [
  { id: 'waifu', label: 'Waifu' },
  { id: 'neko', label: 'Neko' },
  { id: 'shinobu', label: 'Shinobu' },
  { id: 'megumin', label: 'Megumin' },
  { id: 'bully', label: 'Bully' },
  { id: 'cuddle', label: 'Cuddle' },
];

export default function WaifuPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [category, setCategory] = useState('waifu');
  const [isModalOpen, setIsModalOpen] = useState(false); // State untuk kontrol Navbar

  const fetchImages = useCallback(async (isMore = false) => {
    if (isMore) setLoadingMore(true);
    else setLoading(true);

    try {
      const responseData = await getWaifuGallery(category);
      if (isMore) {
        setData(prev => {
          const combined = [...prev, ...responseData];
          return combined.filter((item, index, self) => 
            index === self.findIndex((t) => t.url === item.url)
          );
        });
      } else {
        setData(responseData);
      }
    } catch (err) {
      console.error("Gagal memuat galeri:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [category]);

  // Reset data saat kategori berubah
  useEffect(() => {
    fetchImages(false);
  }, [category, fetchImages]);

  return (
    <div className="min-h-screen bg-[#060910] text-gray-100 flex flex-col">
      {/* Navbar akan hilang jika modal terbuka */}
      {!isModalOpen && <Navbar />}
      
      <main className={`container mx-auto px-4 sm:px-6 pb-20 flex-grow relative z-10 ${!isModalOpen ? 'pt-24 md:pt-32' : 'pt-0'}`}>
        
        {/* Header & Filter Kategori */}
        <div className="mb-12 space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-10 w-1.5 bg-blue-600 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.4)]"></div>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white italic">
              Galeri <span className="text-blue-500">Koleksi</span>
            </h2>
          </div>

          {/* Navigasi Kategori */}
          <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all shrink-0 border 
                  ${category === cat.id 
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20' 
                    : 'bg-white/5 border-white/10 text-gray-500 hover:text-white hover:bg-white/10'
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid Konten */}
        {loading && data.length === 0 ? (
          <div className="py-40 text-center">
            <div className="inline-block w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[10px] font-bold tracking-widest text-blue-500 uppercase">Mengambil data kategori {category}...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-6">
            {data.map((item, idx) => (
              <WaifuCard 
                key={`${item.url}-${idx}`} 
                image={item} 
                onToggleModal={(isOpen) => setIsModalOpen(isOpen)} 
              />
            ))}
          </div>
        )}

        {/* Tombol Muat Lebih Banyak */}
        {!loading && data.length > 0 && (
          <div className="mt-16 flex justify-center">
            <button
              onClick={() => fetchImages(true)}
              disabled={loadingMore}
              className="group relative px-10 py-4 bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all hover:border-blue-500/50 active:scale-95 disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                {loadingMore && <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 group-hover:text-blue-400">
                  {loadingMore ? 'Sedang Memuat...' : 'Muat Lebih Banyak'}
                </span>
              </div>
            </button>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}