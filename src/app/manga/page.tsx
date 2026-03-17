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
  const [activeDay, setActiveDay] = useState(
    DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1].id
  );

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  const [selectedGenre, setSelectedGenre] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const scrollRefToday = useRef<HTMLDivElement>(null);
  const scrollRefWeekly = useRef<HTMLDivElement>(null);
  const isFetching = useRef(false);

  const handleScroll = (ref: any, direction: 'left' | 'right') => {
    if (!ref.current) return;
    const move = ref.current.clientWidth * 0.8;
    ref.current.scrollBy({
      left: direction === 'left' ? -move : move,
      behavior: 'smooth',
    });
  };

  const convertToWIB = (jstTime: string) => {
    if (!jstTime || jstTime === 'TBA') return 'TBA';
    const [h, m] = jstTime.split(':').map(Number);
    let wib = h - 2;
    if (wib < 0) wib += 24;
    return `${wib.toString().padStart(2, '0')}:${m
      .toString()
      .padStart(2, '0')} WIB`;
  };

  useEffect(() => {
    const loadSchedules = async () => {
      setLoadingSchedule(true);
      try {
        const res = await getWeeklySchedule(activeDay);
        setSchedule(res);

        const todayId =
          DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1].id;

        const todayRes = await getWeeklySchedule(todayId);
        setTodaySchedule(todayRes.slice(0, 10));
      } finally {
        setLoadingSchedule(false);
      }
    };
    loadSchedules();
  }, [activeDay]);

  const loadManga = useCallback(async (isMore = false) => {
    if (isFetching.current) return;
    isFetching.current = true;

    const target = isMore ? page + 1 : 0;

    try {
      const res = await getTrendingManga({
        query: searchQuery,
        genre: selectedGenre,
        page: target,
      });

      if (!res?.length) {
        setHasMore(false);
        if (!isMore) setData([]);
      } else {
        setHasMore(res.length >= 20);
        setData((prev) => (isMore ? [...prev, ...res] : res));
        setPage(target);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isFetching.current = false;
    }
  }, [page, searchQuery, selectedGenre]);

  useEffect(() => {
    const t = setTimeout(() => loadManga(false), 400);
    return () => clearTimeout(t);
  }, [searchQuery, selectedGenre]);

  return (
    <div className="min-h-screen bg-[#060910] text-white flex flex-col overflow-x-hidden">
      <Navbar />

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-24 md:pt-32 pb-16">

        {/* TODAY */}
        {todaySchedule.length > 0 && (
          <section className="mb-12">
            <h3 className="text-lg sm:text-xl md:text-2xl font-black mb-4">
              Rilis <span className="text-blue-500">Hari Ini</span>
            </h3>

            <div className="relative">
              <button
                onClick={() => handleScroll(scrollRefToday, 'left')}
                className="hidden md:flex absolute left-0 top-0 bottom-0 z-10 items-center px-3"
              >
                ◀
              </button>

              <div
                ref={scrollRefToday}
                className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2"
              >
                {todaySchedule.map((item, i) => (
                  <div key={i} className="snap-start shrink-0 w-[70%] sm:w-[45%] md:w-[300px]">
                    <ScheduleCard item={item} convertToWIB={convertToWIB} variant="large" />
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleScroll(scrollRefToday, 'right')}
                className="hidden md:flex absolute right-0 top-0 bottom-0 z-10 items-center px-3"
              >
                ▶
              </button>
            </div>
          </section>
        )}

        {/* WEEKLY */}
        <section className="mb-12">
          <h3 className="text-lg md:text-xl font-bold mb-4">
            Jadwal Mingguan
          </h3>

          <div className="flex gap-2 overflow-x-auto pb-4">
            {DAYS.map((d) => (
              <button
                key={d.id}
                onClick={() => setActiveDay(d.id)}
                className={`px-4 py-2 text-xs rounded-lg whitespace-nowrap ${
                  activeDay === d.id
                    ? 'bg-red-600'
                    : 'bg-white/10 text-gray-400'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          <div className="flex gap-4 overflow-x-auto">
            {schedule.map((item, i) => (
              <div key={i} className="shrink-0 w-[70%] sm:w-[45%] md:w-[250px]">
                <ScheduleCard item={item} convertToWIB={convertToWIB} />
              </div>
            ))}
          </div>
        </section>

        {/* LIBRARY */}
        <section>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <h2 className="text-2xl md:text-5xl font-black">
              Manga Library
            </h2>

            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari..."
              className="w-full md:max-w-sm px-4 py-2 rounded-lg bg-white/10 text-sm"
            />
          </div>

          <div className="flex gap-2 flex-wrap mb-6">
            {GENRES.map((g) => (
              <button
                key={g.id}
                onClick={() => setSelectedGenre(g.id)}
                className={`px-3 py-1 text-xs rounded ${
                  selectedGenre === g.id
                    ? 'bg-blue-600'
                    : 'bg-white/10 text-gray-400'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {data.map((m, i) => (
              <MangaCard key={i} manga={m} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}