import { NextResponse } from 'next/server'; // ✅ Import ini yang hilang

// ✅ Fungsi ini harus ada di file yang SAMA
let cachedToken: string | null = null;
let tokenExpiry = 0;

async function getDeviantArtToken() {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
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

  if (!response.ok) throw new Error('Gagal mengambil token DeviantArt');

  const data = await response.json();
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;

  return cachedToken;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get('tag') || 'anime';
    const offset = searchParams.get('offset') || '0';
    const nsfw = searchParams.get('nsfw') === 'true';

    const token = await getDeviantArtToken();

    const daUrl = new URL('https://www.deviantart.com/api/v1/oauth2/browse/tags');
    daUrl.searchParams.set('tag', tag);
    daUrl.searchParams.set('offset', offset);
    daUrl.searchParams.set('limit', '24');
    daUrl.searchParams.set('mature_content', String(nsfw));

    const res = await fetch(daUrl.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error(`DeviantArt ${res.status}:`, errorBody);
      return NextResponse.json(
        { error: `DeviantArt API Error: ${res.status}`, detail: errorBody },
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
          name: item.title,
        };
      })
      .filter(Boolean);

    return NextResponse.json({
      items: formattedResults,
      nextOffset: data.next_offset ?? null,
      hasMore: data.has_more ?? false,
    });

  } catch (error: any) {
    console.error('API Route Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}