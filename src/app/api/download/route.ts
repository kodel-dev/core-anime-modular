import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    const response = await fetch(imageUrl);
    const blob = await response.arrayBuffer();
    
    const headers = new Headers();
    headers.set('Content-Type', response.headers.get('Content-Type') || 'image/png');
    headers.set('Content-Disposition', `attachment; filename="kodel-asset-${Date.now()}.png"`);

    return new NextResponse(blob, { headers });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to download image' }, { status: 500 });
  }
}