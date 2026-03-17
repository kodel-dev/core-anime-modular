export const getAnimeFact = async (animeName: string) => {
  try {
    // Kodel Engine: Format slug yang didukung API
    const slug = animeName
      .toLowerCase()
      .replace(/_brotherhood/g, '')
      .replace(/\s+/g, '_')
      .replace(/[^\w\s]/gi, '');
    
    const res = await fetch(`https://anime-facts-rest-api.herokuapp.com/api/v1/${slug}`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000) // Timeout 5 detik agar tidak menggantung
    });

    if (!res.ok) return null;
    
    const json = await res.json();
    return json.data;
  } catch (error) {
    // Silent fail: Jika API mati, fitur fakta disembunyikan tanpa error mengganggu
    return null;
  }
};