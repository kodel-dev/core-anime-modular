import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.DEVIANTART_CLIENT_ID;
  const redirectUri = 'http://localhost:3000/api/callback';
  const scope = encodeURIComponent('browse user');

  const authUrl = `https://www.deviantart.com/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}`;

  return NextResponse.redirect(authUrl);
}