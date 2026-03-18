import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');

  if (!code) return NextResponse.json({ error: 'No code' }, { status: 400 });

  try {
    const response = await fetch('https://www.deviantart.com/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.DEVIANTART_CLIENT_ID || '',
        client_secret: process.env.DEVIANTART_CLIENT_SECRET || '',
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/callback`,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error_description);

    const res = NextResponse.redirect(new URL('/waifu', request.url));
    // Simpan token di cookie agar API route lain bisa menggunakannya
    res.cookies.set('da_access_token', data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: data.expires_in,
      path: '/',
    });
    return res;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}