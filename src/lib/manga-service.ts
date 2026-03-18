/**
 * Core Manga Service - Kitsu Engine (Stable & Fresh)
 */

interface MangaParams {
  query?: string;
  genre?: string;
  page?: number;
}

export const getTrendingManga = async (params?: MangaParams): Promise<any[]> => {
  const limit = 20;
  const offset = (params?.page || 0) * limit;

  let url = `https://kitsu.io/api/edge/manga?page[limit]=${limit}&page[offset]=${offset}&sort=-userCount`;

  if (params?.query) {
    url = `https://kitsu.io/api/edge/manga?filter[text]=${encodeURIComponent(params.query)}&page[limit]=${limit}&page[offset]=${offset}`;
  } else if (params?.genre) {
    url = `https://kitsu.io/api/edge/manga?filter[categories]=${encodeURIComponent(params.genre)}&page[limit]=${limit}&page[offset]=${offset}&sort=-userCount`;
  }

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
      },
      cache: 'no-store',
    });

    if (!res.ok) throw new Error("Kitsu API error");

    const result = await res.json();
    return result.data || [];
  } catch (error) {
    console.error("Manga Fetch Error:", error);
    return [];
  }
};

export const getWeeklySchedule = async (day: string): Promise<any[]> => {
  try {
    const res = await fetch(`https://api.jikan.moe/v4/schedules?filter=${day.toLowerCase()}`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const result = await res.json();
    return result.data || [];
  } catch (error) {
    return [];
  }
};