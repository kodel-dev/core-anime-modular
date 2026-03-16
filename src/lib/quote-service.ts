export const getRandomQuote = async () => {
  try {
    const res = await fetch('https://animechan.xyz/api/random');
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.warn("Quote API unreachable");
    return null;
  }
};