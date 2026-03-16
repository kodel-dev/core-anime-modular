export const getWaifuGallery = async () => {
  try {
    // Kodel Engine: Meminta banyak gambar (type: 'sfw', category: 'waifu')
    // Menggunakan POST karena API waifu.pics/many memerlukan body JSON
    const res = await fetch('https://api.waifu.pics/many/sfw/waifu', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}), // Body kosong akan memberikan daftar gambar acak
    });

    if (!res.ok) return [];
    
    const json = await res.json();
    return json.files.map((url: string, index: number) => ({
      id: `waifu-${index}`,
      url: url
    }));
  } catch (error) {
    console.error("Kodel Gallery Error:", error);
    return [];
  }
};