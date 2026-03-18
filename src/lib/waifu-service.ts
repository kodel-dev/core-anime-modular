export const getWaifuGallery = async (category: string, offset: number = 0, isNsfw: boolean = false) => {
  try {
    const response = await fetch(
      `/api/deviantart?tag=${encodeURIComponent(category)}&offset=${offset}&nsfw=${isNsfw}`,
      { cache: 'no-store' } // Memastikan kita tidak mengambil data lama yang rusak
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Fetch error status: ${response.status}`, errorText);
      
      // Jika error 429, kita beri tahu UI untuk berhenti mencoba sementara
      return { items: [], nextOffset: null, hasMore: false, error: response.status };
    }

    const data = await response.json();

    return {
      items: data.items ?? [],
      nextOffset: data.nextOffset ?? null,
      hasMore: data.hasMore ?? false,
    };
  } catch (error) {
    console.error("Waifu Service Error:", error);
    return { items: [], nextOffset: null, hasMore: false };
  }
};