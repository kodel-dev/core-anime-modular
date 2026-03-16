export const getRandomQuote = async () => {
  try {
    // Kodel Engine: Mengambil kutipan acak dari AnimeChan API
    const res = await fetch('https://animechan.xyz/api/random', {
      cache: 'no-store' // Memastikan kutipan selalu baru setiap di-refresh
    });
    
    if (!res.ok) throw new Error('Kodel Engine: Quote API Reach Error');
    
    return await res.json();
  } catch (error) {
    console.warn("Kodel Insights: Quote Service is currently unreachable");
    return null;
  }
};