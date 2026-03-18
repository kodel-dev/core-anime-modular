import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

let cachedClientToken: string | null = null;
let clientTokenExpiry = 0;

async function getClientCredentialsToken() {
  if (cachedClientToken && Date.now() < clientTokenExpiry) {
    return cachedClientToken;
  }

  const clientId     = process.env.DEVIANTART_CLIENT_ID;
  const clientSecret = process.env.DEVIANTART_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Missing Credentials in .env.local');
  }

  const response = await fetch('https://www.deviantart.com/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type:    'client_credentials',
      client_id:     clientId,
      client_secret: clientSecret,
    }),
  });

  if (!response.ok) throw new Error('Gagal mengambil Client Token');

  const data = await response.json();
  cachedClientToken = data.access_token;
  clientTokenExpiry = Date.now() + (data.expires_in - 60) * 1000;

  return cachedClientToken;
}

function formatFileSize(bytes: number): string {
  if (!bytes) return '';
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  if (bytes >= 1024)        return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

// ── Metadata on-demand (dipanggil saat klik kartu) ────────────────────────────
async function fetchDeviationMeta(deviationId: string, token: string) {
  try {
    const [metaRes, contentRes, deviationRes] = await Promise.all([
      fetch(
        `https://www.deviantart.com/api/v1/oauth2/deviation/metadata` +
        `?deviationids[]=${deviationId}&ext_stats=1&ext_submission=1`,
        { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }
      ),
      fetch(
        `https://www.deviantart.com/api/v1/oauth2/deviation/content?deviationid=${deviationId}`,
        { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }
      ),
      fetch(
        `https://www.deviantart.com/api/v1/oauth2/deviation/${deviationId}`,
        { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }
      ),
    ]);

    let tags: string[] = [], description = '';
    let favorites = 0, views = 0, comments = 0, isAiGenerated = false;
    let authorAvatar = '', downloadFilesize = '', downloadWidth = 0;
    let downloadHeight = 0, downloadFilename = '';

    if (metaRes.ok) {
      const metaData = await metaRes.json();
      const meta = metaData.metadata?.[0];
      if (meta) {
        tags          = (meta.tags || []).map((t: any) => t.tag_name).filter(Boolean);
        favorites     = meta.stats?.favourites ?? 0;
        views         = meta.stats?.views      ?? 0;
        comments      = meta.stats?.comments   ?? 0;
        isAiGenerated = !!(meta.submission?.creation_tools?.some(
          (t: any) => typeof t === 'string' && t.toLowerCase().includes('ai')
        ));
        if (meta.description) {
          description = meta.description.replace(/<[^>]*>/g, '').trim().slice(0, 800);
        }
      }
    }

    if (contentRes.ok && !description) {
      const c = await contentRes.json();
      if (c.html) description = c.html.replace(/<[^>]*>/g, '').trim().slice(0, 800);
    }

    if (deviationRes.ok) {
      const dev = await deviationRes.json();
      authorAvatar     = dev.author?.usericon ?? '';
      downloadWidth    = dev.content?.width   ?? 0;
      downloadHeight   = dev.content?.height  ?? 0;
      downloadFilesize = formatFileSize(dev.content?.filesize ?? 0);
      try {
        const urlObj = new URL(dev.content?.src || '');
        downloadFilename = decodeURIComponent(urlObj.pathname.split('/').pop() || '');
      } catch { downloadFilename = ''; }
    }

    return {
      tags, description, favorites, views, comments,
      isAiGenerated, authorAvatar,
      downloadFilesize, downloadWidth, downloadHeight, downloadFilename,
    };
  } catch (e: any) {
    console.error('fetchDeviationMeta error:', e.message);
    return {
      tags: [], description: '', favorites: 0, views: 0, comments: 0,
      isAiGenerated: false, authorAvatar: '',
      downloadFilesize: '', downloadWidth: 0, downloadHeight: 0, downloadFilename: '',
    };
  }
}

// ── Format satu item deviation ─────────────────────────────────────────────────
function formatItem(item: any) {
  const imageUrl =
    item.content?.src ||
    item.preview?.src ||
    item.thumbs?.[0]?.src;

  if (!imageUrl) return null;

  return {
    id:           item.deviationid,
    url:          imageUrl,
    title:        item.title,
    author:       item.author?.username || 'Unknown',
    authorAvatar: item.author?.usericon || null,
    preview:      item.preview?.src || item.thumbs?.[0]?.src || imageUrl,
    publishedTime: item.published_time,
    isMature:     item.is_mature,
    width:        item.content?.width  || item.preview?.width  || 0,
    height:       item.content?.height || item.preview?.height || 0,
    filesize:     formatFileSize(item.content?.filesize || 0),
  };
}

// ── GET handler ────────────────────────────────────────────────────────────────
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const cookieStore = await cookies();
    const userToken = cookieStore.get('da_access_token')?.value;
    const token = userToken || await getClientCredentialsToken();

    // ── Mode detail: ?id=xxx ─────────────────────────────────────────────────
    const deviationId = searchParams.get('id');
    if (deviationId) {
      const meta = await fetchDeviationMeta(deviationId, token as string);
      return NextResponse.json(meta);
    }

    // ── Mode gallery ─────────────────────────────────────────────────────────
    const tag    = searchParams.get('tag')    || 'anime';
    const offset = searchParams.get('offset') || '0';
    const nsfw   = searchParams.get('nsfw')   === 'true';
    // sort: 'newest' | 'popular' | 'trending'
    // default ke 'newest' supaya data selalu segar
    const sort   = searchParams.get('sort')   || 'newest';

    let daUrl: URL;

    // Prioritas: tag=trending SELALU ke browse/home, tidak peduli sort
    if (tag === 'trending') {
      daUrl = new URL('https://www.deviantart.com/api/v1/oauth2/browse/home');

    } else if (sort === 'newest') {
      // browse/newest — diurut dari paling baru diunggah
      // endpoint ini pakai parameter `q` (query string), bukan `tag`
      daUrl = new URL('https://www.deviantart.com/api/v1/oauth2/browse/newest');
      daUrl.searchParams.set('q', tag);

    } else {
      // browse/tags — filter kategori spesifik, diurut popular
      daUrl = new URL('https://www.deviantart.com/api/v1/oauth2/browse/tags');
      // DeviantArt browse/tags tidak terima spasi — hapus spasi dari tag
      daUrl.searchParams.set('tag', tag.replace(/\s+/g, '').toLowerCase());
    }

    daUrl.searchParams.set('offset', offset);
    daUrl.searchParams.set('limit', '24');
    daUrl.searchParams.set('mature_content', String(nsfw));

    const res = await fetch(daUrl.toString(), {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error(`DeviantArt API Error ${res.status}:`, errorBody);
      return NextResponse.json(
        {
          error:  `API Error: ${res.status}`,
          detail: userToken
            ? 'Token expired atau izin ditolak'
            : 'Coba login untuk konten eksklusif',
        },
        { status: res.status }
      );
    }

    const data = await res.json();

    const formattedResults = (data.results || [])
      .map(formatItem)
      .filter(Boolean);

    return NextResponse.json({
      items:          formattedResults,
      nextOffset:     data.next_offset ?? null,
      hasMore:        data.has_more    ?? false,
      isUserLoggedIn: !!userToken,
    });

  } catch (error: any) {
    console.error('API Route Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}