import { NextResponse, NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const clientId = process.env.DEVIANTART_CLIENT_ID;
  
  // Deteksi host secara dinamis (localhost atau core-anime.vercel.app)
  const host = request.headers.get('host');
  const protocol = host?.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;
  
  const redirectUri = `${baseUrl}/api/callback`;
  const scope = encodeURIComponent('browse user');

  // URL Auth dengan redirect_uri yang dinamis
  const authUrl = `https://www.deviantart.com/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}`;

  return NextResponse.redirect(authUrl);
}