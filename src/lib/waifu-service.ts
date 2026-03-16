export const getWaifuGallery = async (type: 'waifu' | 'nekos' = 'waifu') => {
  const providers = type === 'waifu' ? [
    { name: 'im', url: 'https://api.waifu.im/search?included_tags=waifu&limit=32' },
    { name: 'pics', url: 'https://api.waifu.pics/sfw/waifu' }
  ] : [
    { name: 'nekos', url: 'https://nekos.best/api/v2/neko?amount=20' }
  ];

  for (const provider of providers) {
    try {
      const res = await fetch(provider.url);
      if (res.ok) {
        const data = await res.json();
        if (provider.name === 'im') {
          return data.images.map((img: any) => ({ 
            id: img.image_id, 
            url: img.url, 
            tags: img.tags.map((t: any) => t.name) 
          }));
        }
        if (provider.name === 'nekos') {
          return data.results.map((img: any, index: number) => ({ 
            id: `neko-${index}-${Date.now()}`, 
            url: img.url, 
            tags: ['neko'] 
          }));
        }
        return [{ id: Date.now(), url: data.url, tags: [type] }];
      }
    } catch (e) {
      console.warn(`Kodel Provider ${provider.name} failed`);
    }
  }
  return [];
};