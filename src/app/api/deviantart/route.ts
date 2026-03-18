import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// ✅ Cache untuk Client Credentials (Tetap ada sebagai fallback)
let cachedClientToken: string | null = null;
let clientTokenExpiry = 0;

async function getClientCredentialsToken() {
  if (cachedClientToken && Date.now() < clientTokenExpiry) {
    return cachedClientToken;
  }

  const clientId = process.env.DEVIANTART_CLIENT_ID;
  const clientSecret = process.env.DEVIANTART_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Missing DeviantArt Credentials in .env.local');
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get('tag') || 'trending'; 
    const offset = searchParams.get('offset') || '0';
    const nsfw = searchParams.get('nsfw') === 'true';

    // ✅ AMBIL TOKEN DARI LOGIN USER (Jika ada di Cookie)
    const cookieStore = await cookies();
    const userToken = cookieStore.get('da_access_token')?.value;

    const token = userToken || await getClientCredentialsToken();

    let daUrl: URL;

    // 🔥 LOGIKA BARU: Penyesuaian dengan API DeviantArt terbaru
    if (tag.toLowerCase() === 'trending') {
      // Gunakan /browse/home untuk data terpopuler/terbaru di halaman awal
      daUrl = new URL('https://www.deviantart.com/api/v1/oauth2/browse/home');
    } else {
      // Gunakan /browse/tags untuk pencarian
      daUrl = new URL('https://www.deviantart.com/api/v1/oauth2/browse/tags');
      
      // Trik untuk spasi: "Gojo Satoru" -> "gojosatoru" agar API DeviantArt bisa membacanya
      const formattedTag = tag.replace(/\s+/g, '').toLowerCase();
      daUrl.searchParams.set('tag', formattedTag);
    }
    
    daUrl.searchParams.set('offset', offset);
    daUrl.searchParams.set('limit', '24');
    daUrl.searchParams.set('mature_content', String(nsfw));

    const res = await fetch(daUrl.toString(), {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store'
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error(`DeviantArt ${res.status}:`, errorBody);
      return NextResponse.json(
        { 
          error: `DeviantArt API Error: ${res.status}`, 
          detail: userToken ? "Token expired atau izin ditolak" : "Wajib Login untuk konten NSFW" 
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
          id: item.deviationid,
          url: imageUrl,
          title: item.title, 
          author: item.author?.username || 'Unknown',
          preview: imageUrl 
        };
      })
      .filter(Boolean);

    return NextResponse.json({
      items: formattedResults,
      nextOffset: data.next_offset ?? null,
      hasMore: data.has_more ?? false,
      isUserLoggedIn: !!userToken 
    });

  } catch (error: any) {
    console.error('API Route Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}