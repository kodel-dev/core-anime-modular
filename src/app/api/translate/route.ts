// src/app/api/translate/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text');

  if (!text) return NextResponse.json({ translated: "" });

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=id&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json();
    
    // Gabungkan hasil translasi (Google mengembalikan array bagian-bagian teks)
    const translatedText = data[0].map((x: any) => x[0]).join('');
    
    return NextResponse.json({ translated: translatedText });
  } catch (error) {
    return NextResponse.json({ translated: text }); // Balikkan teks asli jika gagal
  }
}