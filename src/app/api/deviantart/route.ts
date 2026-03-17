import { NextResponse } from 'next/server';

async function getDeviantArtToken() {
  const clientId = process.env.DEVIANTART_CLIENT_ID;
  const clientSecret = process.env.DEVIANTART_CLIENT_SECRET;

  const response = await fetch('https://www.deviantart.com/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId!,
      client_secret: clientSecret!,
    }),
  });

  const data = await response.json();
  return data.access_token;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('tag') || 'anime';
    const offset = searchParams.get('offset') || '0';
    const isNsfw = searchParams.get('nsfw') === 'true';

    const token = await getDeviantArtToken();

    const daUrl = `https://www.deviantart.com/api/v1/oauth2/browse/popular?q=${encodeURIComponent(query)}&offset=${offset}&limit=24&mature_content=${isNsfw}`;
    
    const res = await fetch(daUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    const formattedResults = data.results?.map((item: any) => {
      const imageUrl = item.content?.src || item.preview?.src || (item.thumbs?.[0]?.src);
      if (!imageUrl) return null;
      return {
        id: item.deviationid,
        url: imageUrl,
        name: item.title,
      };
    }).filter((i: any) => i !== null) || [];

    return NextResponse.json({ 
      items: formattedResults,
      nextOffset: data.next_offset,
      hasMore: data.has_more
    });

  } catch (error) {
    return NextResponse.json({ items: [], hasMore: false }, { status: 500 });
  }
}