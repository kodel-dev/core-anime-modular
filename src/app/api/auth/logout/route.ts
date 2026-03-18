import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const response = NextResponse.redirect(new URL('/', baseUrl));

  // Menghapus cookie dengan mengatur masa berlakunya ke waktu lampau
  response.cookies.set('da_access_token', '', {
    path: '/',
    expires: new Date(0),
  });

  return response;
}