import { JikanResponse } from '@/types/anime';

const JIKAN_BASE = 'https://api.jikan.moe/v4';

export const getGhibliMovies = async (): Promise<JikanResponse> => {
  // Kita gunakan producer ID 21 untuk Studio Ghibli agar data akurat
  const url = `${JIKAN_BASE}/anime?producers=21&order_by=score&sort=desc`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Ghibli Sync Error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Ghibli Fetch Error:", error);
    return { data: [] };
  }
};