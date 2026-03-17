'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MangaCard from '@/components/Manga/MangaCard';
import ScheduleCard from '@/components/Manga/ScheduleCard';
import { getTrendingManga, getWeeklySchedule } from '@/lib/manga-service';

const DAYS = [
  { id: 'monday', label: 'Senin' },
  { id: 'tuesday', label: 'Selasa' },
  { id: 'wednesday', label: 'Rabu' },
  { id: 'thursday', label: 'Kamis' },
  { id: 'friday', label: 'Jumat' },
  { id: 'saturday', label: 'Sabtu' },
  { id: 'sunday', label: 'Minggu' },
];

const GENRES = [
  { id: '', label: 'Semua Koleksi' },
  { id: 'action', label: 'Action' },
  { id: 'adventure', label: 'Adventure' },
  { id: 'comedy', label: 'Comedy' },
  { id: 'fantasy', label: 'Fantasy' },
  { id: 'romance', label: 'Romance' },
  { id: 'horror', label: 'Horror' },
];

export default function MangaPage() {
  const [data, setData] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<any[]>([]);
  const [activeDay, setActiveDay] = useState(DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1].id);
  
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [showEndToast, setShowEndToast] = useState(false);
  
  const [selectedGenre, setSelectedGenre] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [showButtonsToday, setShowButtonsToday] = useState({ left: false, right: true });
  const [showButtonsWeekly, setShowButtonsWeekly] = useState({ left: false, right: true });

  const scrollRefToday = useRef<HTMLDivElement>(null);
  const scrollRefWeekly = useRef<HTMLDivElement>(null);
  const isFetching = useRef(false);

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
        const scheduleData = await getWeeklySchedule(activeDay);
        setSchedule(scheduleData.filter((v: any, i: number, a: any[]) => a.findIndex(t => t.mal_id === v.mal_id) === i));
        const todayId = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1].id;
        const todayData = await getWeeklySchedule(todayId);
        setTodaySchedule(todayData.slice(0, 10));
      } catch (err) { console.error(err); } finally { setLoadingSchedule(false); }
    };
    loadSchedules();
  }, [activeDay]);

  const loadManga = useCallback(async (isMore = false) => {
    if (isFetching.current) return;
    isFetching.current = true;
    const targetPage = isMore ? page + 1 : 0;
    if (isMore) setLoadingMore(true); else setLoading(true);

    try {
      const responseData = await getTrendingManga({ query: searchQuery, genre: selectedGenre, page: targetPage });
      if (!responseData || responseData.length === 0) {
        if (!isMore) setData([]);
        setHasMore(false);
        if (isMore) { setShowEndToast(true); setTimeout(() => setShowEndToast(false), 3000); }
      } else {
        setHasMore(responseData.length >= 20);
        if (isMore) {
          setData(prev => {
            const combined = [...prev, ...responseData];
            return combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
          });
          setPage(targetPage);
        } else {
          setData(responseData);
          setPage(0);
        }
      }
    } catch (err) { console.error("Fetch Error:", err); } finally { setLoading(false); setLoadingMore(false); isFetching.current = false; }
  }, [page, searchQuery, selectedGenre]);

  useEffect(() => {
    const timer = setTimeout(() => { if (!loadingMore) loadManga(false); }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedGenre]); 

  return (
    <div className="min-h-screen bg-[#060910] text-gray-100 flex flex-col selection:bg-blue-600/30 overflow-x-hidden">
      <Navbar />

      <div className={`fixed bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-[999] transition-opacity duration-200 w-[90%] md:w-auto ${showEndToast ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-2xl border border-white/10 flex items-center justify-center">
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">Database End Reached</span>
        </div>
      </div>

      <main className="container mx-auto px-4 md:px-6 pt-32 md:pt-40 pb-10 md:pb-20 flex-grow relative z-10">
        
        {/* TODAY SECTION */}
        {todaySchedule.length > 0 && (
          <section className="mb-12 md:mb-24 relative">
            <h3 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter mb-6 text-white">Rilis <span className="text-blue-500">Hari Ini</span></h3>
            <div className="relative group/slider">
              {showButtonsToday.left && (
                <button onClick={() => handleScroll(scrollRefToday, 'left')} className="absolute left-0 top-0 bottom-0 z-30 w-12 md:w-20 bg-gradient-to-r from-[#060910] via-[#060910]/80 to-transparent flex items-center justify-start pl-2 transition-opacity">
                  <div className="p-2 rounded-full bg-white/10 border border-white/10 hover:bg-blue-600">
                    <svg className="w-4 h-4 md:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"/></svg>
                  </div>
                </button>
              )}
              <div ref={scrollRefToday} onScroll={() => checkScrollPos(scrollRefToday, setShowButtonsToday)} className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory px-1 touch-pan-x">
                {todaySchedule.map((item, idx) => (
                  <ScheduleCard key={`today-${idx}`} item={item} convertToWIB={convertToWIB} variant="large" />
                ))}
              </div>
              {showButtonsToday.right && (
                <button onClick={() => handleScroll(scrollRefToday, 'right')} className="absolute right-0 top-0 bottom-0 z-30 w-12 md:w-20 bg-gradient-to-l from-[#060910] via-[#060910]/80 to-transparent flex items-center justify-end pr-2 transition-opacity">
                  <div className="p-2 rounded-full bg-white/10 border border-white/10 hover:bg-blue-600">
                    <svg className="w-4 h-4 md:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"/></svg>
                  </div>
                </button>
              )}
            </div>
          </section>
        )}

        {/* WEEKLY SECTION - FIX SCROLL HARI (Horizontal Scrollable) */}
        <section className="mb-12 md:mb-24 relative">
          <h3 className="text-lg md:text-xl font-black uppercase italic text-gray-400 mb-6">Jadwal <span className="text-white">Mingguan</span></h3>
          
          {/* DAY SELECTOR: Container diperbaiki agar bisa di-scroll jari di mobile */}
          <div className="w-full overflow-x-auto no-scrollbar touch-pan-x flex flex-nowrap gap-2 pb-6">
            {DAYS.map((day) => (
              <button 
                key={day.id} 
                onClick={() => setActiveDay(day.id)} 
                className={`flex-shrink-0 min-w-[100px] md:min-w-[110px] py-3 md:py-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors border ${activeDay === day.id ? 'bg-red-600 border-red-500 text-white' : 'bg-white/5 border-white/5 text-gray-500'}`}
              >
                {day.label}
              </button>
            ))}
          </div>

          <div className="relative group/slider-weekly mt-4">
            {showButtonsWeekly.left && (
              <button onClick={() => handleScroll(scrollRefWeekly, 'left')} className="absolute left-0 top-0 bottom-0 z-30 w-12 bg-gradient-to-r from-[#060910] to-transparent flex items-center justify-start pl-1">
                <div className="p-2 rounded-full bg-white/10 border border-white/10 hover:bg-red-600 text-white">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"/></svg>
                </div>
              </button>
            )}
            <div 
              ref={scrollRefWeekly} 
              onScroll={() => checkScrollPos(scrollRefWeekly, setShowButtonsWeekly)} 
              className={`flex gap-4 md:gap-6 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory touch-pan-x transition-opacity duration-200 ${loadingSchedule ? 'opacity-30' : 'opacity-100'}`}
            >
              {schedule.map((item, idx) => (
                <ScheduleCard key={`sch-${activeDay}-${idx}`} item={item} convertToWIB={convertToWIB} />
              ))}
            </div>
            {showButtonsWeekly.right && (
              <button onClick={() => handleScroll(scrollRefWeekly, 'right')} className="absolute right-0 top-0 bottom-0 z-30 w-12 bg-gradient-to-l from-[#060910] to-transparent flex items-center justify-end pr-1">
                <div className="p-2 rounded-full bg-white/10 border border-white/10 hover:bg-red-600 text-white">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"/></svg>
                </div>
              </button>
            )}
          </div>
        </section>

        {/* LIBRARY SECTION */}
        <div className="pt-12 border-t border-white/5">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <h2 className="text-3xl md:text-7xl font-black italic uppercase tracking-tighter text-white">Manga <span className="text-blue-600 opacity-50">Library</span></h2>
            <input type="text" placeholder="Cari Koleksi..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-[11px] text-white outline-none focus:border-blue-600 transition-colors placeholder:text-gray-600" />
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {GENRES.map((genre) => (
              <button key={genre.id} onClick={() => setSelectedGenre(genre.id)} className={`px-3 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest border ${selectedGenre === genre.id ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white/5 border-white/5 text-gray-500'}`}>{genre.label}</button>
            ))}
          </div>

          <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-8 mb-16 transition-opacity duration-200 ${loading && !loadingMore ? 'opacity-30' : 'opacity-100'}`}>
            {data.length > 0 ? (
              data.map((item, idx) => (
                <MangaCard key={`manga-${item.id}-${idx}`} manga={item} />
              ))
            ) : !loading && (
              <div className="col-span-full py-16 text-center text-gray-600 text-[10px] font-black uppercase tracking-widest">No Data Found</div>
            )}
          </div>

          {hasMore && (
            <div className="flex flex-col items-center justify-center pb-10 gap-6">
              <button onClick={() => loadManga(true)} disabled={loadingMore || loading} className="group flex flex-col items-center gap-4 active:scale-95 transition-transform">
                <div className="relative px-12 py-4 rounded-2xl bg-blue-600 shadow-xl">
                  <div className="relative z-10 text-[9px] font-black uppercase tracking-[0.4em] text-white">
                    {loadingMore ? 'Syncing...' : 'Expand Data'}
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