import { JikanResponse } from '@/types/anime';

const JIKAN_BASE = 'https://api.jikan.moe/v4';

export const fetchAnimeData = async (type: string, query: string = ''): Promise<JikanResponse> => {
  // Menambah limit menjadi 25 agar konten lebih padat
  let url = `${JIKAN_BASE}/top/anime?filter=bypopularity&limit=25`;

  if (query) {
    url = `${JIKAN_BASE}/anime?q=${encodeURIComponent(query)}&order_by=popularity&limit=25`;
  } else {
    switch (type) {
      case 'on-going': url = `${JIKAN_BASE}/seasons/now?limit=25`; break;
      case 'ghibli': url = `${JIKAN_BASE}/anime?producers=21&order_by=score&sort=desc`; break;
      default: url = `${JIKAN_BASE}/top/anime?filter=bypopularity&limit=25`;
    }
  }

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`ERR:KODEL: Status ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Anime Fetch Error:", error);
    return { data: [] };
  }
};