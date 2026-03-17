'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimeCard from '@/components/Anime/AnimeCard';
import ScheduleCard from '@/components/Manga/ScheduleCard';
import { getTrendingAnime, getWeeklyAnimeSchedule } from '@/lib/anime-service';

const DAYS = [
  { id: 'monday', label: 'Senin' },
  { id: 'tuesday', label: 'Selasa' },
  { id: 'wednesday', label: 'Rabu' },
  { id: 'thursday', label: 'Kamis' },
  { id: 'friday', label: 'Jumat' },
  { id: 'saturday', label: 'Sabtu' },
  { id: 'sunday', label: 'Minggu' },
];

// Daftar Kategori yang diperluas dengan penamaan profesional
const CATEGORIES = [
  { id: '', label: 'Utama' },
  { id: 'action', label: 'Aksi & Tempur' },
  { id: 'adventure', label: 'Petualangan' },
  { id: 'comedy', label: 'Komedi' },
  { id: 'drama', label: 'Drama Visual' },
  { id: 'fantasy', label: 'Fantasi Epic' },
  { id: 'horror', label: 'Horor & Mistis' },
  { id: 'mystery', label: 'Misteri' },
  { id: 'romance', label: 'Romansa' },
  { id: 'sci-fi', label: 'Sains Fiksi' },
  { id: 'slice-of-life', label: 'Realitas Kehidupan' },
  { id: 'sports', label: 'Olahraga' },
  { id: 'supernatural', label: 'Supranatural' },
  { id: 'thriller', label: 'Thriller' },
  { id: 'mecha', label: 'Mecha & Robot' },
  { id: 'psychological', label: 'Psikologis' },
];

export default function DiscoveryPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [showEndToast, setShowEndToast] = useState(false);

  const [schedule, setSchedule] = useState<any[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<any[]>([]);
  const [activeDay, setActiveDay] = useState(DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1].id);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  const isFetching = useRef(false);
  const scrollRefToday = useRef<HTMLDivElement>(null);
  const scrollRefWeekly = useRef<HTMLDivElement>(null);

  const [showButtonsToday, setShowButtonsToday] = useState({ left: false, right: true });
  const [showButtonsWeekly, setShowButtonsWeekly] = useState({ left: false, right: true });

  const checkScrollPos = (ref: React.RefObject<HTMLDivElement>, setBtnState: Function) => {
    if (ref.current) {
      const { scrollLeft, scrollWidth, clientWidth } = ref.current;
      setBtnState({
        left: scrollLeft > 10,
        right: scrollLeft + clientWidth < scrollWidth - 10,
      });
    }
  };

  const handleScroll = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (ref.current) {
      const { clientWidth } = ref.current;
      const move = direction === 'left' ? -clientWidth : clientWidth;
      ref.current.scrollBy({ left: move, behavior: 'smooth' });
    }
  };

  const convertToWIB = (jstTime: string) => {
    if (!jstTime || jstTime === 'TBA') return 'TBA';
    const [hours, minutes] = jstTime.split(':').map(Number);
    let wibHours = hours - 2;
    if (wibHours < 0) wibHours += 24;
    return `${wibHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} WIB`;
  };

  useEffect(() => {
    const loadSchedules = async () => {
      setLoadingSchedule(true);
      try {
        const scheduleData = await getWeeklyAnimeSchedule(activeDay);
        setSchedule(scheduleData);
        const todayId = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1].id;
        if (todaySchedule.length === 0) {
          const todayData = activeDay === todayId ? scheduleData : await getWeeklyAnimeSchedule(todayId);
          setTodaySchedule(todayData.slice(0, 10));
        }
      } catch (err) { console.error(err); } finally { setLoadingSchedule(false); }
    };
    loadSchedules();
  }, [activeDay]);

  const loadAnime = useCallback(async (isMore = false) => {
    if (isFetching.current) return;
    isFetching.current = true;
    const targetPage = isMore ? page + 1 : 0;
    if (isMore) setLoadingMore(true); else setLoading(true);

    try {
      const responseData = await getTrendingAnime({ query: searchQuery, category: selectedCategory, page: targetPage });
      if (!responseData || responseData.length === 0) {
        if (!isMore) setData([]);
        setHasMore(false);
        if (isMore) { setShowEndToast(true); setTimeout(() => setShowEndToast(false), 3000); }
      } else {
        setHasMore(responseData.length >= 20);
        if (isMore) {
          setData(prev => [...prev, ...responseData].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i));
          setPage(targetPage);
        } else { setData(responseData); setPage(0); }
      }
    } finally { setLoading(false); setLoadingMore(false); isFetching.current = false; }
  }, [page, searchQuery, selectedCategory]);

  useEffect(() => {
    const timer = setTimeout(() => { if (!loadingMore) loadAnime(false); }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#060910] text-gray-100 flex flex-col selection:bg-blue-600/30 overflow-x-hidden">
      <Navbar />

      <main className="container mx-auto px-4 md:px-6 pt-32 md:pt-40 pb-20 flex-grow relative z-10">
        
        {/* TAYANG HARI INI */}
        {todaySchedule.length > 0 && (
          <section className="mb-12 md:mb-20">
            <h3 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter mb-6 text-white">
              Tayang <span className="text-blue-500">Hari Ini</span>
            </h3>
            
            <div className="relative group/slider">
              {showButtonsToday.left && (
                <button 
                  onClick={() => handleScroll(scrollRefToday, 'left')} 
                  className="absolute left-0 top-0 bottom-0 z-[40] w-12 md:w-16 bg-gradient-to-r from-[#060910] to-transparent flex items-center justify-start pl-1 opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300"
                >
                  <div className="p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 hover:bg-blue-600 text-white shadow-xl">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"/></svg>
                  </div>
                </button>
              )}

              <div 
                ref={scrollRefToday} 
                onScroll={() => checkScrollPos(scrollRefToday, setShowButtonsToday)}
                className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory touch-pan-x px-1"
              >
                {todaySchedule.map((item, idx) => (
                  <ScheduleCard key={`today-${idx}`} item={item} convertToWIB={convertToWIB} variant="large" />
                ))}
              </div>

              {showButtonsToday.right && (
                <button 
                  onClick={() => handleScroll(scrollRefToday, 'right')} 
                  className="absolute right-0 top-0 bottom-0 z-[40] w-12 md:w-16 bg-gradient-to-l from-[#060910] to-transparent flex items-center justify-end pr-1 opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300"
                >
                  <div className="p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 hover:bg-blue-600 text-white shadow-xl">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"/></svg>
                  </div>
                </button>
              )}
            </div>
          </section>
        )}

        {/* JADWAL MINGGUAN */}
        <section className="mb-16 md:mb-24">
          <h3 className="text-lg md:text-xl font-black uppercase italic text-gray-400 mb-6">Jadwal <span className="text-white">Mingguan</span></h3>
          
          <div className="w-full overflow-x-auto no-scrollbar flex flex-nowrap gap-2 mb-8 pb-2">
            {DAYS.map((day) => (
              <button key={day.id} onClick={() => setActiveDay(day.id)} className={`flex-shrink-0 min-w-[100px] md:min-w-[110px] py-3 md:py-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors border ${activeDay === day.id ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/20' : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/20'}`}>{day.label}</button>
            ))}
          </div>

          <div className="relative group/slider-weekly">
            {showButtonsWeekly.left && (
              <button 
                onClick={() => handleScroll(scrollRefWeekly, 'left')} 
                className="absolute left-0 top-0 bottom-0 z-[40] w-12 md:w-16 bg-gradient-to-r from-[#060910] to-transparent flex items-center justify-start pl-1 opacity-0 group-hover/slider-weekly:opacity-100 transition-opacity duration-300"
              >
                <div className="p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 hover:bg-red-600 text-white shadow-xl">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"/></svg>
                </div>
              </button>
            )}

            <div 
              ref={scrollRefWeekly} 
              onScroll={() => checkScrollPos(scrollRefWeekly, setShowButtonsWeekly)}
              className={`flex gap-4 md:gap-6 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory touch-pan-x px-1 transition-opacity duration-200 ${loadingSchedule ? 'opacity-30' : 'opacity-100'}`}
            >
              {schedule.map((item, idx) => (
                <ScheduleCard key={`sch-${activeDay}-${idx}`} item={item} convertToWIB={convertToWIB} />
              ))}
            </div>

            {showButtonsWeekly.right && (
              <button 
                onClick={() => handleScroll(scrollRefWeekly, 'right')} 
                className="absolute right-0 top-0 bottom-0 z-[40] w-12 md:w-16 bg-gradient-to-l from-[#060910] to-transparent flex items-center justify-end pr-1 opacity-0 group-hover/slider-weekly:opacity-100 transition-opacity duration-300"
              >
                <div className="p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 hover:bg-red-600 text-white shadow-xl">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"/></svg>
                </div>
              </button>
            )}
          </div>
        </section>

        {/* KATALOG UTAMA */}
        <div className="pt-12 border-t border-white/5">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-[2px] w-8 bg-blue-600"></div>
                <span className="text-blue-500 text-[10px] font-bold uppercase tracking-[0.4em]">Eksplorasi Katalog</span>
              </div>
              <h2 className="text-3xl md:text-7xl font-black italic uppercase tracking-tighter text-white leading-none">
                Katalog <span className="text-blue-600 opacity-50">Utama</span>
              </h2>
            </div>
            
            <div className="relative w-full md:w-96">
              <input 
                type="text" 
                placeholder="Cari judul anime..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-[11px] text-white outline-none focus:border-blue-600 transition-colors placeholder:text-gray-600 shadow-2xl" 
              />
            </div>
          </div>

          {/* Kategori Berjumlah Banyak & Scrollable */}
          <div className="w-full overflow-x-auto no-scrollbar flex flex-nowrap gap-2 mb-10 pb-2">
            {CATEGORIES.map((cat) => (
              <button 
                key={cat.id} 
                onClick={() => setSelectedCategory(cat.id)} 
                className={`flex-shrink-0 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300 ${selectedCategory === cat.id ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/20 hover:text-white'}`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-8 mb-16 transition-opacity duration-200 ${loading && !loadingMore ? 'opacity-30' : 'opacity-100'}`}>
            {data.map((item, idx) => (
              <AnimeCard key={`anime-${item.id}-${idx}`} anime={item} />
            ))}
          </div>

          {hasMore && (
            <div className="flex flex-col items-center justify-center pb-10 gap-6">
              <button 
                onClick={() => loadAnime(true)} 
                disabled={loadingMore || loading} 
                className="group flex flex-col items-center gap-4 active:scale-95 transition-transform"
              >
                <div className="relative px-12 py-4 overflow-hidden rounded-2xl bg-blue-600 shadow-xl shadow-blue-600/20">
                  <div className="relative z-10 text-[9px] font-black uppercase tracking-[0.4em] text-white">
                    {loadingMore ? 'Memproses...' : 'Tampilkan Lebih Banyak'}
                  </div>
                </div>
                <div className="w-px bg-gradient-to-b from-blue-600 to-transparent h-10"></div>
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}