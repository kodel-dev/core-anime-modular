export const getWaifuGallery = async () => {
  const providers = [
    { name: 'im', url: 'https://api.waifu.im/search?included_tags=waifu' },
    { name: 'pics', url: 'https://api.waifu.pics/sfw/waifu' }
  ];

  for (const provider of providers) {
    try {
      const res = await fetch(provider.url);
      if (res.ok) {
        const data = await res.json();
        // Normalisasi data ke format yang konsisten
        return provider.name === 'im' 
          ? data.images.map((img: any) => ({ id: img.image_id, url: img.url, tags: img.tags.map((t: any) => t.name) })) 
          : [{ id: Date.now(), url: data.url, tags: ['waifu'] }];
      }
    } catch (e) {
      console.warn(`Provider ${provider.name} failed, trying next...`);
    }
  }
  return [];
};