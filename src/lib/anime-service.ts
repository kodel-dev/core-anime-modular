import { JikanResponse } from '@/types/anime';

const JIKAN_BASE = 'https://api.jikan.moe/v4';

export const fetchAnimeData = async (type: string, query: string = ''): Promise<JikanResponse> => {
  let url = `${JIKAN_BASE}/top/anime?filter=bypopularity`;

  if (query) {
    url = `${JIKAN_BASE}/anime?q=${encodeURIComponent(query)}&order_by=popularity`;
  } else {
    switch (type) {
      case 'on-going': url = `${JIKAN_BASE}/seasons/now`; break;
      case 'summer': url = `${JIKAN_BASE}/seasons/2026/summer`; break;
      case 'winter': url = `${JIKAN_BASE}/seasons/2026/winter`; break;
      case 'ghibli': url = `${JIKAN_BASE}/anime?producers=21&order_by=score&sort=desc`; break;
      default: url = `${JIKAN_BASE}/top/anime?filter=bypopularity`;
    }
  }

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`ERR:CNT: Jikan Status ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Anime Fetch Error:", error);
    return { data: [] };
  }
};