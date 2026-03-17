'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WaifuCard from '@/components/Waifu/WaifuCard';
import { getWaifuGallery } from '@/lib/waifu-service';

export default function WaifuPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Ref untuk mengunci proses fetch agar tidak double request
  const isFetching = useRef(false);

  // loadData dibungkus useCallback agar referensi fungsinya stabil
  const loadData = useCallback(async (isMore = false) => {
    if (isFetching.current) return;
    isFetching.current = true;
    
    if (isMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const responseData = await getWaifuGallery('waifu');
      if (isMore) {
        setData(prev => {
          const combined = [...prev, ...responseData];
          // Filter duplikat URL
          return combined.filter((v, i, a) => a.findIndex(t => t.url === v.url) === i);
        });
      } else {
        setData(responseData);
      }
    } catch (err) {
      console.error("Gallery Sync Error:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isFetching.current = false;
    }
  }, []); // Dependency array kosong agar fungsi tidak berubah-ubah

  // useEffect untuk Initial Load & Infinite Scroll
  useEffect(() => {
    // Jalankan load pertama kali
    loadData();

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const currentPos = window.innerHeight + window.scrollY;
      
      // Trigger jika sudah mendekati bawah (sisa 800px)
      if (currentPos >= scrollHeight - 800 && !isFetching.current) {
        loadData(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadData]); // Hanya bergantung pada loadData yang sudah stabil

  return (
    <div className="min-h-screen bg-[#060910] text-gray-100 flex flex-col">
      <Navbar />
      
      <main className="container mx-auto px-6 pt-40 pb-20 flex-grow relative z-10">
        <div className="flex items-center gap-6 mb-16">
          <div className="h-12 w-2 bg-blue-600 rounded-full shadow-[0_0_30px_rgba(37,99,235,0.5)]"></div>
          <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white">
            Waifu <span className="text-blue-600 opacity-50">Gallery</span>
          </h2>
        </div>

        {loading && data.length === 0 ? (
          <div className="py-40 text-center">
            <div className="inline-block w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[10px] font-black tracking-[1em] text-blue-500 uppercase italic">Accessing Core...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8 animate-in fade-in duration-700">
            {data.map((item, idx) => (
              <WaifuCard key={`${item.url}-${idx}`} image={item} />
            ))}
          </div>
        )}

        {loadingMore && (
          <div className="mt-20 flex flex-col items-center gap-4 py-10">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[8px] font-black tracking-[0.5em] text-blue-500 uppercase">Expanding Archive...</p>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}