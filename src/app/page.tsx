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

const todayIndex = () => {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
};

export default function DiscoveryPage() {
  const [data, setData] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<any[]>([]);
  const [activeDay, setActiveDay] = useState(DAYS[todayIndex()].id);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const scrollRefToday = useRef<HTMLDivElement>(null);
  const scrollRefWeekly = useRef<HTMLDivElement>(null);
  const isFetching = useRef(false);

  /* 🔥 FIX UTAMA ADA DI SINI */
  const convertToWIB = (jst: string) => {
    if (!jst || jst === 'TBA') return 'TBA';
    const [h, m] = jst.split(':').map(Number);
    const wib = ((h - 2) + 24) % 24;
    return `${String(wib).padStart(2, '0')}:${String(m).padStart(2, '0')} WIB`;
  };

  const scroll = (ref: any, dir: 'left' | 'right') => {
    if (!ref.current) return;
    ref.current.scrollBy({
      left: dir === 'left'
        ? -ref.current.clientWidth * 0.8
        : ref.current.clientWidth * 0.8,
      behavior: 'smooth',
    });
  };

  /* schedule */
  useEffect(() => {
    const load = async () => {
      setLoadingSchedule(true);
      try {
        const res = await getWeeklyAnimeSchedule(activeDay);
        setSchedule(res);

        const todayId = DAYS[todayIndex()].id;
        const todayRes =
          activeDay === todayId ? res : await getWeeklyAnimeSchedule(todayId);

        setTodaySchedule(todayRes.slice(0, 10));
      } finally {
        setLoadingSchedule(false);
      }
    };
    load();
  }, [activeDay]);

  /* anime */
  const loadAnime = useCallback(async (isMore = false) => {
    if (isFetching.current) return;
    isFetching.current = true;

    const target = isMore ? page + 1 : 0;

    try {
      const res = await getTrendingAnime({
        query: searchQuery,
        category: selectedCategory,
        page: target,
      });

      if (!res?.length) {
        setHasMore(false);
        if (!isMore) setData([]);
      } else {
        setHasMore(res.length >= 20);
        setData(prev => (isMore ? [...prev, ...res] : res));
        setPage(target);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isFetching.current = false;
    }
  }, [page, searchQuery, selectedCategory]);

  useEffect(() => {
    const t = setTimeout(() => loadAnime(false), 400);
    return () => clearTimeout(t);
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#060910] text-white flex flex-col overflow-x-hidden">
      <Navbar />

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-24 md:pt-32 pb-16 space-y-14 md:space-y-20">

        {/* TODAY */}
        {todaySchedule.length > 0 && (
          <section>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-4">
              Tayang <span className="text-blue-500">Hari Ini</span>
            </h3>

            <div className="relative">
              <button
                onClick={() => scroll(scrollRefToday, 'left')}
                className="hidden md:flex absolute left-0 top-0 bottom-0 z-10 px-3 items-center"
              >◀</button>

              <div
                ref={scrollRefToday}
                className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2"
              >
                {todaySchedule.map((item, i) => (
                  <div key={i} className="snap-start shrink-0 w-[75%] sm:w-[50%] md:w-[320px]">
                    <ScheduleCard
                      item={item}
                      convertToWIB={convertToWIB}  {/* 🔥 FIX */}
                      variant="large"
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={() => scroll(scrollRefToday, 'right')}
                className="hidden md:flex absolute right-0 top-0 bottom-0 z-10 px-3 items-center"
              >▶</button>
            </div>
          </section>
        )}

        {/* WEEKLY */}
        <section>
          <div className="flex gap-2 overflow-x-auto pb-4">
            {DAYS.map((d) => (
              <button
                key={d.id}
                onClick={() => setActiveDay(d.id)}
                className={`px-4 py-2 text-sm rounded-lg whitespace-nowrap ${
                  activeDay === d.id ? 'bg-red-600' : 'bg-white/10 text-gray-400'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          <div className="flex gap-4 overflow-x-auto">
            {schedule.map((item, i) => (
              <div key={i} className="shrink-0 w-[75%] sm:w-[50%] md:w-[260px]">
                <ScheduleCard
                  item={item}
                  convertToWIB={convertToWIB}  {/* 🔥 FIX */}
                />
              </div>
            ))}
          </div>
        </section>

        {/* GRID */}
        <section>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari anime..."
            className="w-full md:max-w-sm mb-6 px-4 py-2 rounded-lg bg-white/10"
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {data.map((item, i) => (
              <AnimeCard key={i} anime={item} />
            ))}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}