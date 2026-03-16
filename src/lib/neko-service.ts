export const getNekoGallery = async () => {
  try {
    // Kodel Engine: Mengambil koleksi gambar Neko (sfw)
    const res = await fetch('https://api.waifu.pics/many/sfw/neko', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}), // Body kosong untuk mendapatkan list acak
    });

    if (!res.ok) return [];
    
    const json = await res.json();
    // Transformasi data agar sesuai dengan format komponen Card
    return json.files.map((url: string, index: number) => ({
      id: `neko-${index}`,
      url: url
    }));
  } catch (error) {
    console.error("Kodel Neko Sector Error:", error);
    return [];
  }
};