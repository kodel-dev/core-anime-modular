/**
 * Anime Service - Katalog Utama & Jadwal Resmi
 */

interface AnimeParams {
  query?:    string;
  genre?:    string; // alias untuk category, dipakai di DiscoveryPage
  category?: string;
  page?:     number;
}

const KITSU_BASE = 'https://kitsu.io/api/edge';

export const getTrendingAnime = async (params?: AnimeParams): Promise<any[]> => {
  const limit  = 20;
  const offset = (params?.page || 0) * limit;
  // Terima baik `genre` maupun `category` agar kompatibel dengan semua pemanggil
  const filterCat = params?.genre || params?.category || '';

  let url = `${KITSU_BASE}/anime?page[limit]=${limit}&page[offset]=${offset}&sort=-userCount`;

  if (params?.query) {
    url = `${KITSU_BASE}/anime?filter[text]=${encodeURIComponent(params.query)}&page[limit]=${limit}&page[offset]=${offset}`;
  } else if (filterCat) {
    url = `${KITSU_BASE}/anime?filter[categories]=${encodeURIComponent(filterCat)}&page[limit]=${limit}&page[offset]=${offset}&sort=-userCount`;
  }

  try {
    const res = await fetch(url, {
      headers: {
        'Accept':       'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
      },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Gagal memuat data dari Kitsu');
    const result = await res.json();
    return result.data || [];
  } catch (error) {
    console.error('Trending Fetch Error:', error);
    return [];
  }
};

export const getWeeklyAnimeSchedule = async (day: string): Promise<any[]> => {
  try {
    const res = await fetch(
      `https://api.jikan.moe/v4/schedules?filter=${day.toLowerCase()}`,
      { cache: 'no-store' }
    );
    if (!res.ok) throw new Error('Gagal memuat jadwal mingguan');
    const result = await res.json();
    return result.data || [];
  } catch (error) {
    console.error('Schedule Fetch Error:', error);
    return [];
  }
};

export const getAnimeFullDetail = async (id: string): Promise<any> => {
  try {
    const includes = [
      'genres',
      'productions.producer',
      'episodes',
      'streamingLinks',
      'mediaRelationships.destination',
    ].join(',');

    const res = await fetch(`${KITSU_BASE}/anime/${id}?include=${includes}`, {
      headers: {
        'Accept':       'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
      },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const result = await res.json();
    return { main: result.data, included: result.included || [] };
  } catch (error) {
    console.error('Full Detail Fetch Error:', error);
    return null;
  }
};