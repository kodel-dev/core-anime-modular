/**
 * Waifu Gallery Service — Multi-Strategy Search
 * 
 * Strategi pencarian berlapis supaya hasil tidak pernah kosong:
 * 1. Tag exact → coba keyword persis sebagai tag DeviantArt
 * 2. Tag per kata → pecah keyword jadi kata-kata individual, coba tiap kata
 * 3. Browse popular → fallback ke trending "anime" kalau semua gagal
 */

const BASE = '/api/deviantart';

interface GalleryResult {
  items: any[];
  nextOffset: number | null;
  hasMore: boolean;
  searchedAs?: string; // label strategi yang berhasil, untuk ditampilkan di UI
  error?: number;
}

// ── Helper: satu kali fetch ke API ────────────────────────────────────────────
async function fetchGallery(tag: string, offset: number, isNsfw: boolean): Promise<GalleryResult | null> {
  try {
    const res = await fetch(
      `${BASE}?tag=${encodeURIComponent(tag)}&offset=${offset}&nsfw=${isNsfw}`,
      { cache: 'no-store' }
    );

    if (res.status === 429) return { items: [], nextOffset: null, hasMore: false, error: 429 };
    if (res.status === 401) return { items: [], nextOffset: null, hasMore: false, error: 401 };
    if (!res.ok) return null; // coba strategi berikutnya

    const data = await res.json();
    const items = data.items ?? [];

    if (items.length === 0) return null; // kosong = coba strategi berikutnya

    return {
      items,
      nextOffset: data.nextOffset ?? null,
      hasMore: data.hasMore ?? false,
    };
  } catch {
    return null;
  }
}

// ── Fungsi utama dengan fallback berlapis ─────────────────────────────────────
export const getWaifuGallery = async (
  category: string,
  offset: number = 0,
  isNsfw: boolean = false
): Promise<GalleryResult> => {
  const raw = category.trim();

  // ── Strategi 1: Keyword lengkap sebagai tag ───────────────────────────────
  const s1 = await fetchGallery(raw, offset, isNsfw);
  if (s1?.error) return s1; // error fatal (429/401), stop
  if (s1 && s1.items.length > 0) return { ...s1, searchedAs: raw };

  // ── Strategi 2: Coba variasi keyword — tambah "anime" supaya lebih relevan ─
  // Contoh: "freya jkt" → "freya jkt anime"
  if (!raw.includes('anime') && !raw.includes('trending')) {
    const withAnime = `${raw} anime`;
    const s2 = await fetchGallery(withAnime, offset, isNsfw);
    if (s2?.error) return s2;
    if (s2 && s2.items.length > 0) return { ...s2, searchedAs: withAnime };
  }

  // ── Strategi 3: Pecah per kata, coba kata terpanjang dulu ─────────────────
  // Contoh: "freya jkt" → coba "freya" dulu, lalu "jkt"
  const words = raw.split(/\s+/).filter(w => w.length > 2).sort((a, b) => b.length - a.length);
  for (const word of words) {
    const s3 = await fetchGallery(word, offset, isNsfw);
    if (s3?.error) return s3;
    if (s3 && s3.items.length > 0) return { ...s3, searchedAs: word };
  }

  // ── Strategi 4: Keyword + "fanart" ────────────────────────────────────────
  const withFanart = `${raw.split(' ')[0]} fanart`;
  const s4 = await fetchGallery(withFanart, offset, isNsfw);
  if (s4?.error) return s4;
  if (s4 && s4.items.length > 0) return { ...s4, searchedAs: withFanart };

  // ── Strategi 5: Fallback ke "anime" umum ─────────────────────────────────
  const fallback = await fetchGallery('anime', offset, isNsfw);
  if (fallback && fallback.items.length > 0) {
    return { ...fallback, searchedAs: 'anime (hasil terkait)' };
  }

  // Benar-benar kosong
  return { items: [], nextOffset: null, hasMore: false };
};