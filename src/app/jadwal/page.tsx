'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimeCard from '@/components/Anime/AnimeCard';
import { getWeeklyAnimeSchedule } from '@/lib/anime-service';

const DAYS = [
  { id: 'monday', label: 'Senin' },
  { id: 'tuesday', label: 'Selasa' },
  { id: 'wednesday', label: 'Rabu' },
  { id: 'thursday', label: 'Kamis' },
  { id: 'friday', label: 'Jumat' },
  { id: 'saturday', label: 'Sabtu' },
  { id: 'sunday', label: 'Minggu' },
];

const todayIndex = () => {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
};

export default function JadwalPage() {
  const router = useRouter();
  const [schedule, setSchedule] = useState<any[]>([]);
  const [activeDay, setActiveDay] = useState(DAYS[todayIndex()].id);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSchedule = async () => {
      setLoading(true);
      try {
        const res = await getWeeklyAnimeSchedule(activeDay);
        // Filter duplikat berdasarkan mal_id
        const uniqueSchedule = Array.from(
          new Map(res.map((item: any) => [item.mal_id, item])).values()
        );
        setSchedule(uniqueSchedule);
      } catch (error) {
        console.error("Gagal memuat jadwal:", error);
      } finally {
        setLoading(false);
      }
    };
    loadSchedule();
  }, [activeDay]);

  return (
    <div className="min-h-screen bg-[#060910] text-white flex flex-col overflow-x-hidden">
      <Navbar />
      
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-24 md:pt-32 pb-16 space-y-8 flex-grow">
        
        {/* Tombol Kembali */}
        <button 
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-gray-500 hover:text-white transition-colors w-fit"
        >
          <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-[11px] font-black uppercase tracking-[0.2em]">Kembali</span>
        </button>

        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-2 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.8)]" />
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
              Jadwal <span className="text-blue-500">Rilis Anime</span>
            </h1>
          </div>
          <p className="text-gray-400 text-sm md:text-base max-w-2xl">
            Pantau terus jadwal rilis anime favoritmu setiap harinya. Jangan sampai terlewat episode terbaru dari seri yang sedang kamu ikuti!
          </p>
        </div>

        {/* Day Selector */}
        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar border-b border-white/5 pt-4">
          {DAYS.map((d) => (
            <button
              key={d.id}
              onClick={() => setActiveDay(d.id)}
              className={`px-8 py-4 text-xs font-black uppercase tracking-widest rounded-t-2xl transition-all duration-300 whitespace-nowrap ${
                activeDay === d.id 
                  ? 'bg-blue-600 text-white shadow-[0_-5px_20px_rgba(37,99,235,0.3)]' 
                  : 'bg-transparent text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Grid Jadwal */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 pt-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-white/[0.03] rounded-2xl animate-pulse border border-white/5" />
            ))}
          </div>
        ) : schedule.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 pt-4">
            {schedule.map((item, i) => (
              <AnimeCard key={`jadwal-${item.mal_id}-${i}`} anime={{ 
                id: item.mal_id,
                attributes: { 
                  canonicalTitle: item.title, 
                  posterImage: { large: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url },
                  averageRating: item.score ? item.score * 10 : null,
                  status: item.airing ? 'current' : 'finished',
                  synopsis: item.synopsis,
                  startDate: item.aired?.from
                }
              }} />
            ))}
          </div>
        ) : (
          <div className="w-full py-32 flex flex-col items-center justify-center text-gray-500 bg-white/[0.02] rounded-3xl border border-white/5 mt-4">
            <span className="text-5xl mb-4">📭</span>
            <span className="text-lg font-bold uppercase tracking-widest text-gray-400">Jadwal Kosong</span>
            <span className="text-sm mt-2">Tidak ada anime yang dijadwalkan rilis pada hari ini.</span>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}