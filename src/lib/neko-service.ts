export const getNekoGallery = async () => {
  try {
    // Mengambil 20 gambar sekaligus agar konten terlihat banyak
    const res = await fetch('https://nekos.best/api/v2/neko?amount=20');
    if (!res.ok) throw new Error('Kodel Engine: Neko API Error');
    
    const data = await res.json();
    
    // Normalisasi data agar sesuai dengan format WaifuCard
    return data.results.map((img: any, index: number) => ({
      id: `neko-${index}-${Date.now()}`,
      url: img.url,
      tags: ['neko', img.artist_name || 'artist']
    }));
  } catch (error) {
    console.error("Neko Service Error:", error);
    return [];
  }
};