export const getWaifuGallery = async (category: string = 'waifu') => {
  try {
    // Kodel Engine: Meminta koleksi berdasarkan kategori spesifik
    const res = await fetch(`https://api.waifu.pics/many/sfw/${category}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}), 
    });

    if (!res.ok) return [];
    
    const json = await res.json();
    return json.files.map((url: string, index: number) => ({
      id: `${category}-${index}-${Date.now()}`,
      url: url,
      category: category
    }));
  } catch (error) {
    console.error("Gallery Service Error:", error);
    return [];
  }
};