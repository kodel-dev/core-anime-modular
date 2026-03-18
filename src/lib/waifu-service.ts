export const getWaifuGallery = async (category: string, offset: number = 0, isNsfw: boolean = false) => {
  try {
    const response = await fetch(
      `/api/deviantart?tag=${encodeURIComponent(category)}&offset=${offset}&nsfw=${isNsfw}`,
      { cache: 'no-store' }
    );

    // Menangani error dari API tanpa melakukan throw (mencegah aplikasi crash)
    if (response.status === 429) {
      return { items: [], nextOffset: null, hasMore: false, error: 429 };
    }

    if (response.status === 401) {
      return { items: [], nextOffset: null, hasMore: false, error: 401 };
    }

    if (!response.ok) {
      return { items: [], nextOffset: null, hasMore: false, error: response.status };
    }

    const data = await response.json();

    return {
      items: data.items ?? [],
      nextOffset: data.nextOffset ?? null,
      hasMore: data.hasMore ?? false,
    };
  } catch (error) {
    // Menangkap error jika server API mati, timeout, atau koneksi internet pengguna terputus
    console.error("Waifu Service Error:", error);
    return { items: [], nextOffset: null, hasMore: false, error: 500 };
  }
};