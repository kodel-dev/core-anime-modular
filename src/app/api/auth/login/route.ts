import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.DEVIANTART_CLIENT_ID;
  // Gunakan localhost untuk dev, atau URL Vercel untuk prod
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const redirectUri = `${baseUrl}/api/callback`;
  
  const scope = encodeURIComponent('browse user');

  // Pastikan URL redirect di-encode dengan benar
  const authUrl = `https://www.deviantart.com/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}`;

  return NextResponse.redirect(authUrl);
}