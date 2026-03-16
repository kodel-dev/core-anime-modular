export const getTrendingManga = async (query = '') => {
  const url = query 
    ? `https://kitsu.io/api/edge/manga?filter[text]=${encodeURIComponent(query)}&page[limit]=20`
    : `https://kitsu.io/api/edge/trending/manga`;

  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const result = await res.json();
    return result.data;
  } catch (error) {
    console.error("Manga Fetch Error:", error);
    return [];
  }
};