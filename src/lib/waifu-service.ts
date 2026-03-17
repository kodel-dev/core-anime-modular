export const getWaifuGallery = async (category: string, offset: number = 0, isNsfw: boolean = false) => {
  try {
    const response = await fetch(
      `/api/deviantart?tag=${encodeURIComponent(category)}&offset=${offset}&nsfw=${isNsfw}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Fetch error status: ${response.status}`, errorText);
      return { items: [], nextOffset: null, hasMore: false };
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