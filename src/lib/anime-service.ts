/**
 * Mengambil rincian super lengkap (Karakter, Studio, Genre, Episode, dll)
 * dalam satu kali panggil menggunakan teknik JSON:API Include
 */
export const getAnimeFullDetail = async (id: string): Promise<any> => {
  try {
    // Kita tambahkan parameter include agar Kitsu mengirimkan semua data relasi sekaligus
    const includes = [
      'genres',
      'productions.producer',
      'episodes',
      'streamingLinks',
      'mediaRelationships.destination'
    ].join(',');

    const res = await fetch(`https://kitsu.io/api/edge/anime/${id}?include=${includes}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json'
      },
      cache: 'no-store'
    });

    if (!res.ok) return null;
    const result = await res.json();
    
    // Kita kembalikan data utama + data included-nya
    return {
      main: result.data,
      included: result.included || []
    };
  } catch (error) {
    console.error("Full Detail Fetch Error:", error);
    return null;
  }
};