export const getAnimeFact = async (animeName: string) => {
  try {
    // Kodel Engine: Membersihkan judul agar sesuai format slug API
    const slug = animeName
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^\w\s]/gi, '');
    
    const res = await fetch(`https://anime-facts-rest-api.herokuapp.com/api/v1/${slug}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    // Jika status 404 (Tidak ditemukan), kembalikan null secara aman
    if (res.status === 404) {
      console.warn(`Kodel Engine: Fakta untuk "${slug}" tidak tersedia di database API.`);
      return null;
    }

    if (!res.ok) return null;
    
    const json = await res.json();
    return json.data; // Mengembalikan array fakta
  } catch (error) {
    // Menangani error jaringan (Failed to fetch)
    console.error("Kodel Knowledge Sector: Koneksi API terputus.");
    return null;
  }
};