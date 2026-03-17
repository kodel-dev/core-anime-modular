export const fetchAnimeData = async (type: string, params?: { q?: string; status?: string; season?: string; year?: string; genres?: string; page?: number }) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Tambahkan parameter page ke query string
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.q) queryParams.append('q', params.q);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.season) queryParams.append('season', params.season);
    if (params?.year) queryParams.append('year', params.year);
    if (params?.genres) queryParams.append('genres', params.genres);
    
    // Gunakan endpoint anime jika ada keyword 'q', jika tidak gunakan top
    let endpoint = params?.q 
      ? 'https://api.jikan.moe/v4/anime' 
      : 'https://api.jikan.moe/v4/top/anime';

    if (params?.season && params?.year) {
      endpoint = `https://api.jikan.moe/v4/seasons/${params.year}/${params.season}`;
    }

    const res = await fetch(`${endpoint}?${queryParams.toString()}`);
    return await res.json();
  } catch (error) {
    console.error("Core Service Error:", error);
    return { data: [] };
  }
};