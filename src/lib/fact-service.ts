export const getAnimeFact = async (animeName: string) => {
  try {
    // Menghapus spasi dan mengubah ke lowercase agar API mengenali judul
    const slug = animeName.toLowerCase().replace(/\s+/g, '_');
    const res = await fetch(`https://anime-facts-rest-api.herokuapp.com/api/v1/${slug}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data; // Mengembalikan array fakta
  } catch (error) {
    return null;
  }
};