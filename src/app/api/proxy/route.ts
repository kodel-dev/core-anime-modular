import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const filename = searchParams.get('filename') || 'image.jpg';

  if (!url) {
    return NextResponse.json({ error: 'URL tidak ditemukan' }, { status: 400 });
  }

  // Whitelist domain yang boleh diproxy
  const allowedDomains = ['deviantart.net', 'wixmp.com', 'deviantart.com'];
  const isAllowed = allowedDomains.some(domain => url.includes(domain));

  if (!isAllowed) {
    return NextResponse.json({ error: 'Domain tidak diizinkan' }, { status: 403 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        // Beberapa CDN butuh Referer agar tidak diblokir
        Referer: 'https://www.deviantart.com/',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Gagal mengambil gambar: ${response.status}` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        // Force download dengan nama file yang bersih
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error: any) {
    console.error('Proxy Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}