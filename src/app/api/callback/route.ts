import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=no_code', request.url));
  }

  try {
    const response = await fetch('https://www.deviantart.com/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.DEVIANTART_CLIENT_ID || '',
        client_secret: process.env.DEVIANTART_CLIENT_SECRET || '',
        code,
        redirect_uri: `${baseUrl}/api/callback`,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Token Exchange Error:', data);
      return NextResponse.redirect(new URL('/login?error=token_failed', request.url));
    }

    // WAJIB: Simpan token di Cookie agar browser tahu user sudah login
    const res = NextResponse.redirect(new URL('/waifu', request.url));
    res.cookies.set('da_access_token', data.access_token, {
      httpOnly: false, // Set false agar bisa dibaca di client-side Navbar
      secure: process.env.NODE_ENV === 'production',
      maxAge: data.expires_in,
      path: '/',
    });

    return res;
  } catch (error) {
    return NextResponse.redirect(new URL('/login?error=server_error', request.url));
  }
}