// src/lib/waifu-service.ts
export const getWaifuGallery = async (category: string, offset: number = 0) => {
  try {
    const response = await fetch(`/api/deviantart?tag=${encodeURIComponent(category)}&offset=${offset}`);
    const data = await response.json();
    
    // Pastikan ini me-return objek dengan properti 'items'
    return {
      items: data.items || [],
      nextOffset: data.nextOffset || null,
      hasMore: data.hasMore || false
    };
  } catch (error) {
    console.error(error);
    return { items: [], nextOffset: null, hasMore: false };
  }
};