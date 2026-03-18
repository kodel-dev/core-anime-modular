import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

let cachedClientToken: string | null = null;
let clientTokenExpiry = 0;

async function getClientCredentialsToken() {
  if (cachedClientToken && Date.now() < clientTokenExpiry) {
    return cachedClientToken;
  }

  const clientId = process.env.DEVIANTART_CLIENT_ID;
  const clientSecret = process.env.DEVIANTART_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Missing Credentials in .env.local');
  }

  const response = await fetch('https://www.deviantart.com/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!response.ok) throw new Error('Gagal mengambil Client Token');

  const data = await response.json();
  cachedClientToken = data.access_token;
  clientTokenExpiry = Date.now() + (data.expires_in - 60) * 1000;

  return cachedClientToken;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: format bytes → "8.28 MB"
// ─────────────────────────────────────────────────────────────────────────────
function formatFileSize(bytes: number): string {
  if (!bytes) return '';
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Fetch metadata lengkap satu deviation — dipanggil HANYA saat klik detail card
// Tujuan: agar load gallery tetap cepat (1 request), metadata di-fetch on-demand
// ─────────────────────────────────────────────────────────────────────────────
async function fetchDeviationMeta(deviationId: string, token: string) {
  try {
    const [metaRes, contentRes, deviationRes] = await Promise.all([
      // tags, stats (favorites, views, comments), isAiGenerated
      fetch(
        `https://www.deviantart.com/api/v1/oauth2/deviation/metadata` +
        `?deviationids[]=${deviationId}&ext_stats=1&ext_submission=1`,
        { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }
      ),
      // deskripsi HTML
      fetch(
        `https://www.deviantart.com/api/v1/oauth2/deviation/content?deviationid=${deviationId}`,
        { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }
      ),
      // resolusi asli, ukuran file, nama file, avatar author
      fetch(
        `https://www.deviantart.com/api/v1/oauth2/deviation/${deviationId}`,
        { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }
      ),
    ]);

    let tags: string[]    = [];
    let description       = '';
    let favorites         = 0;
    let views             = 0;
    let comments          = 0;
    let isAiGenerated     = false;
    let authorAvatar      = '';
    let downloadFilesize  = '';
    let downloadWidth     = 0;
    let downloadHeight    = 0;
    let downloadFilename  = '';

    // /deviation/metadata
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

    // /deviation/content — fallback deskripsi
    if (contentRes.ok && !description) {
      const c = await contentRes.json();
      if (c.html) description = c.html.replace(/<[^>]*>/g, '').trim().slice(0, 800);
    }

    // /deviation/:id — file info + avatar
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

// ─────────────────────────────────────────────────────────────────────────────
// GET handler
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const cookieStore = await cookies();
    const userToken = cookieStore.get('da_access_token')?.value;
    const token = userToken || await getClientCredentialsToken();

    // ── Mode detail: ?id=xxx → metadata on-demand saat klik kartu ────────────
    const deviationId = searchParams.get('id');
    if (deviationId) {
      const meta = await fetchDeviationMeta(deviationId, token as string);
      return NextResponse.json(meta);
    }

    // ── Mode gallery (kode asli tidak diubah) ─────────────────────────────────
    const tag    = searchParams.get('tag')    || 'trending';
    const offset = searchParams.get('offset') || '0';
    const nsfw   = searchParams.get('nsfw')   === 'true';

    let daUrl: URL;

    if (tag.toLowerCase() === 'trending') {
      daUrl = new URL('https://www.deviantart.com/api/v1/oauth2/browse/home');
    } else {
      daUrl = new URL('https://www.deviantart.com/api/v1/oauth2/browse/tags');
      const formattedTag = tag.replace(/\s+/g, '').toLowerCase();
      daUrl.searchParams.set('tag', formattedTag);
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
      console.error(`API Error ${res.status}:`, errorBody);
      return NextResponse.json(
        {
          error: `API Error: ${res.status}`,
          detail: userToken ? 'Token expired atau izin ditolak' : 'Wajib Login untuk konten NSFW',
        },
        { status: res.status }
      );
    }

    const data = await res.json();

    const formattedResults = (data.results || [])
      .map((item: any) => {
        const imageUrl =
          item.content?.src ||
          item.preview?.src ||
          item.thumbs?.[0]?.src;

        if (!imageUrl) return null;

        return {
          id:            item.deviationid,
          url:           imageUrl,
          title:         item.title,
          author:        item.author?.username || 'Unknown',
          authorAvatar:  item.author?.usericon || null,
          preview:       item.preview?.src || item.thumbs?.[0]?.src || imageUrl,
          publishedTime: item.published_time,
          isMature:      item.is_mature,
          width:         item.content?.width  || item.preview?.width  || 0,
          height:        item.content?.height || item.preview?.height || 0,
          filesize:      formatFileSize(item.content?.filesize || 0),
          // tags, description, favorites, views, comments, isAiGenerated
          // → di-fetch on-demand via GET /api/deviantart?id=xxx saat klik kartu
        };
      })
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