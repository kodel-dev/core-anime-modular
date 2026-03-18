import { NextResponse, NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const clientId = process.env.DEVIANTART_CLIENT_ID;
  
  // Mengambil host secara dinamis (misal: localhost:3000 atau core-anime.vercel.app)
  const host = request.headers.get('host');
  // Deteksi protokol: http untuk localhost, https untuk produksi
  const protocol = host?.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;
  
  const redirectUri = `${baseUrl}/api/callback`;
  const scope = encodeURIComponent('browse user');

  // Pastikan URL redirect di-encode dengan benar agar diterima oleh DeviantArt
  const authUrl = `https://www.deviantart.com/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}`;

  return NextResponse.redirect(authUrl);
}