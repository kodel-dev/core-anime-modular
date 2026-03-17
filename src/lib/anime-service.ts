/**
 * Anime Service - Katalog Utama & Jadwal Resmi
 * Mengelola pengambilan data anime dan rincian lengkap dari Kitsu & Jikan API.
 */

interface AnimeParams {
  query?: string;
  category?: string;
  page?: number;
}

const KITSU_BASE = 'https://kitsu.io/api/edge';

/**
 * Mengambil daftar anime trending atau hasil pencarian (Dibutuhkan oleh page.tsx)
 */
export const getTrendingAnime = async (params?: AnimeParams): Promise<any[]> => {
  const limit = 20;
  const offset = (params?.page || 0) * limit;
  
  let url = `${KITSU_BASE}/anime?page[limit]=${limit}&page[offset]=${offset}&sort=-userCount`;

  if (params?.query) {
    url = `${KITSU_BASE}/anime?filter[text]=${encodeURIComponent(params.query)}&page[limit]=${limit}&page[offset]=${offset}`;
  } 
  else if (params?.category) {
    url = `${KITSU_BASE}/anime?filter[categories]=${params.category}&page[limit]=${limit}&page[offset]=${offset}&sort=-userCount`;
  }

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json'
      },
      cache: 'no-store' 
    });

    if (!res.ok) throw new Error("Gagal memuat data dari Kitsu");
    const result = await res.json();
    return result.data || [];
  } catch (error) {
    console.error("Trending Fetch Error:", error);
    return [];
  }
};

/**
 * Mengambil jadwal penayangan mingguan (Dibutuhkan oleh page.tsx)
 */
export const getWeeklyAnimeSchedule = async (day: string): Promise<any[]> => {
  try {
    const res = await fetch(`https://api.jikan.moe/v4/schedules?filter=${day.toLowerCase()}`, {
      method: 'GET',
      cache: 'no-store'
    });

    if (!res.ok) throw new Error("Gagal memuat jadwal mingguan");
    const result = await res.json();
    return result.data || [];
  } catch (error) {
    console.error("Schedule Fetch Error:", error);
    return [];
  }
};

/**
 * Mengambil rincian super lengkap (Karakter, Studio, Genre, Episode, dll)
 * Digunakan di dalam AnimeCard untuk modal detail
 */
export const getAnimeFullDetail = async (id: string): Promise<any> => {
  try {
    const includes = [
      'genres',
      'productions.producer',
      'episodes',
      'streamingLinks',
      'mediaRelationships.destination'
    ].join(',');

    const res = await fetch(`${KITSU_BASE}/anime/${id}?include=${includes}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json'
      },
      cache: 'no-store'
    });

    if (!res.ok) return null;
    const result = await res.json();
    
    return {
      main: result.data,
      included: result.included || []
    };
  } catch (error) {
    console.error("Full Detail Fetch Error:", error);
    return null;
  }
};