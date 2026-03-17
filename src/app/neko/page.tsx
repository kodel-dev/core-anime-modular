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
  
  // Kodel Engine: Ref stabil untuk mengunci proses fetch agar tidak terjadi duplikasi data
  const isFetching = useRef(false);

  const loadData = useCallback(async (isMore = false) => {
    if (isFetching.current) return;
    isFetching.current = true;
    
    if (isMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const responseData = await getNekoGallery();
      
      if (isMore) {
        setData(prev => {
          const combined = [...prev, ...responseData];
          // Filter duplikat URL untuk memastikan grid tetap unik
          return combined.filter((v, i, a) => a.findIndex(t => t.url === v.url) === i);
        });
      } else {
        setData(responseData);
      }
    } catch (err) {
      console.error("Core Neko Sync Error:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isFetching.current = false;
    }
  }, []);

  // PERBAIKAN: Dependency array dijaga agar tetap konstan [loadData] untuk stabilitas render
  useEffect(() => {
    // Initial Load saat halaman pertama kali dibuka
    loadData();

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const currentPos = window.innerHeight + window.scrollY;
      
      // Load 1000px sebelum mencapai bawah untuk UX yang terasa instan (tidak menunggu loading)
      if (currentPos >= scrollHeight - 1000 && !isFetching.current) {
        loadData(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadData]); 

  return (
    <div className="min-h-screen bg-[#060910] text-gray-100 flex flex-col selection:bg-blue-600/30">
      <Navbar />
      
      <main className="container mx-auto px-6 pt-40 pb-20 flex-grow relative z-10">
        <div className="flex items-center gap-6 mb-16">
          {/* Core Visual Indicator */}
          <div className="h-12 w-2 bg-blue-600 rounded-full shadow-[0_0_30px_rgba(37,99,235,0.5)]"></div>
          <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white">
            Neko <span className="text-blue-600 opacity-50">Archive</span>
          </h2>
        </div>

        {/* State 1: Loading Awal (Hanya saat data benar-benar kosong) */}
        {loading && data.length === 0 ? (
          <div className="py-40 text-center animate-in fade-in zoom-in duration-500">
            <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
            <p className="text-[10px] font-black tracking-[1em] text-blue-500 uppercase italic">Accessing Core Database...</p>
          </div>
        ) : (
          /* State 2: Grid Display (Tidak akan hilang saat loadMore, mencegah flicker) */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8 animate-in fade-in duration-1000">
            {data.map((item, idx) => (
              <NekoCard 
                key={`${item.url}-${idx}`} 
                image={item} 
                // Optimasi Kecepatan: 12 item pertama diprioritaskan untuk render instan
                priority={idx < 12} 
              />
            ))}
          </div>
        )}

        {/* State 3: Infinite Scroll Loading Indicator */}
        {loadingMore && (
          <div className="mt-20 py-10 flex flex-col items-center gap-4 animate-in slide-in-from-bottom-4">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[8px] font-black tracking-[0.5em] text-blue-500 uppercase">Expanding Neko Archive...</p>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}