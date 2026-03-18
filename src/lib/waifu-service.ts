/**
 * Waifu Gallery Service — Smart Multi-Strategy Search
 *
 * Perbaikan utama:
 * - Kategori "trending" langsung ke browse/home, tidak di-fallback
 * - 404 dari DeviantArt (tag tidak ada) ≠ error fatal, lanjut ke strategi berikut
 * - Fallback hanya jalan untuk pencarian kata kunci bebas, bukan kategori bawaan
 */

const BASE = '/api/deviantart';

export interface GalleryResult {
  items:       any[];
  nextOffset:  number | null;
  hasMore:     boolean;
  searchedAs?: string;
  error?:      number;
}

// ── Satu request ke API ────────────────────────────────────────────────────────
async function fetchGallery(
  tag:    string,
  offset: number,
  isNsfw: boolean,
  sort:   string = 'newest'
): Promise<GalleryResult | null> {
  try {
    const url = `${BASE}?tag=${encodeURIComponent(tag)}&offset=${offset}&nsfw=${isNsfw}&sort=${sort}`;
    const res = await fetch(url, { cache: 'no-store' });

    // Error fatal — hentikan seluruh proses
    if (res.status === 429) return { items: [], nextOffset: null, hasMore: false, error: 429 };
    if (res.status === 401) return { items: [], nextOffset: null, hasMore: false, error: 401 };

    // 404 / error lain — artinya tag ini tidak ada, coba strategi berikutnya
    if (!res.ok) return null;

    const data  = await res.json();
    const items = data.items ?? [];

    // Kosong — coba strategi berikutnya
    if (items.length === 0) return null;

    return {
      items,
      nextOffset: data.nextOffset ?? null,
      hasMore:    data.hasMore    ?? false,
    };
  } catch {
    return null;
  }
}

// ── Fungsi utama ───────────────────────────────────────────────────────────────
export const getWaifuGallery = async (
  category: string,
  offset:   number  = 0,
  isNsfw:   boolean = false,
  sort:     'newest' | 'popular' = 'newest'
): Promise<GalleryResult> => {
  const raw = category.trim().toLowerCase();

  // ── Kategori "bawaan" — langsung ke endpoint yang tepat, tanpa fallback ──────
  // trending → browse/home (sudah ditangani di route.ts dengan tag=trending)
  // kategori lain (anime, waifu, naruto, dll) → browse/tags atau browse/newest
  const BUILTIN_CATEGORIES = [
    'trending', 'anime', 'waifu', 'neko', 'mecha',
    'naruto', 'overwatch', 'digimon', 'demon', 'angel',
    'skyscape', 'spider-man', 'genshin impact',
    'league of legends', 'boku no hero academia',
    'concept art', 'drawings and paintings',
    'video game fan art',
  ];

  if (BUILTIN_CATEGORIES.includes(raw)) {
    // Satu request langsung, tidak perlu fallback
    const result = await fetchGallery(raw, offset, isNsfw, sort);

    // Error fatal
    if (result?.error) return result;

    // Berhasil
    if (result && result.items.length > 0) return result;

    // Kosong dari kategori bawaan → coba 'anime' sebagai safety net
    const safeNet = await fetchGallery('anime', offset, isNsfw, sort);
    if (safeNet && safeNet.items.length > 0) {
      return { ...safeNet, searchedAs: 'anime (hasil terkait)' };
    }

    return { items: [], nextOffset: null, hasMore: false };
  }

  // ── Mode pencarian bebas — fallback berlapis ───────────────────────────────

  // Strategi 1: keyword persis
  const s1 = await fetchGallery(raw, offset, isNsfw, sort);
  if (s1?.error) return s1;
  if (s1 && s1.items.length > 0) return { ...s1, searchedAs: raw };

  // Strategi 2: keyword + "anime"
  if (!raw.includes('anime')) {
    const withAnime = `${raw} anime`;
    const s2 = await fetchGallery(withAnime, offset, isNsfw, sort);
    if (s2?.error) return s2;
    if (s2 && s2.items.length > 0) return { ...s2, searchedAs: withAnime };
  }

  // Strategi 3: pecah per kata, terpanjang dulu
  const words = raw.split(/\s+/).filter(w => w.length > 2).sort((a, b) => b.length - a.length);
  for (const word of words) {
    const s3 = await fetchGallery(word, offset, isNsfw, sort);
    if (s3?.error) return s3;
    if (s3 && s3.items.length > 0) return { ...s3, searchedAs: word };
  }

  // Strategi 4: kata pertama + "fanart"
  const firstWord = raw.split(' ')[0];
  if (firstWord.length > 2) {
    const withFanart = `${firstWord} fanart`;
    const s4 = await fetchGallery(withFanart, offset, isNsfw, sort);
    if (s4?.error) return s4;
    if (s4 && s4.items.length > 0) return { ...s4, searchedAs: withFanart };
  }

  // Strategi 5: fallback umum ke "anime"
  const fallback = await fetchGallery('anime', offset, isNsfw, sort);
  if (fallback && fallback.items.length > 0) {
    return { ...fallback, searchedAs: 'anime (hasil terkait)' };
  }

  return { items: [], nextOffset: null, hasMore: false };
};