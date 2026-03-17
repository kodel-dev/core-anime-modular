'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import NekoCard from '@/components/Neko/NekoCard';
import { getNekoGallery } from '@/lib/neko-service';

export default function NekoPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); 
  
  const isFetching = useRef(false);

  // Gunakan useCallback agar fungsi ini tidak berubah-ubah saat re-render
  const toggleNavbar = useCallback((isOpen: boolean) => {
    setIsModalOpen(isOpen);
  }, []);

  const loadData = useCallback(async (isMore = false) => {
    if (isFetching.current) return;
    isFetching.current = true;
    if (isMore) setLoadingMore(true);
    else setLoading(true);

    try {
      const responseData = await getNekoGallery();
      if (isMore) {
        setData(prev => {
          const combined = [...prev, ...responseData];
          return combined.filter((v, i, a) => a.findIndex(t => t.url === v.url) === i);
        });
      } else {
        setData(responseData);
      }
    } catch (err) {
      console.error("Gagal memuat galeri:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isFetching.current = false;
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]); 

  return (
    <div className={`min-h-screen bg-[#060910] text-gray-100 flex flex-col ${isModalOpen ? 'overflow-hidden' : ''}`}>
      
      {/* Paksa Hilang Total */}
      {!isModalOpen && <Navbar />}
      
      <main className={`container mx-auto px-4 sm:px-6 pb-20 flex-grow relative z-10 ${!isModalOpen ? 'pt-24 md:pt-32' : 'pt-0'}`}>
        
        {!isModalOpen && (
          <div className="mb-12 space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-10 md:h-12 w-1.5 bg-blue-600 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.4)]"></div>
              <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white">
                Galeri <span className="text-blue-500">Neko</span>
              </h2>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-6">
          {data.map((item, idx) => (
            <NekoCard 
              key={`${item.url}-${idx}`} 
              image={item} 
              onToggleModal={toggleNavbar} 
            />
          ))}
        </div>

        {!loading && data.length > 0 && !isModalOpen && (
          <div className="mt-16 flex justify-center">
            <button
              onClick={() => loadData(true)}
              disabled={loadingMore}
              className="px-10 py-5 bg-white/5 border border-white/10 rounded-2xl transition-all hover:bg-white/10 active:scale-95"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">
                {loadingMore ? 'Memproses...' : 'Muat Lebih Banyak'}
              </span>
            </button>
          </div>
        )}
      </main>
      
      {!isModalOpen && <Footer />}
    </div>
  );
}