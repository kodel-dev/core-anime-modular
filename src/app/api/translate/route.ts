// src/app/api/translate/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Membaca body JSON dari request POST
    const body = await request.json();
    const text = body.text;

    if (!text) {
      return NextResponse.json({ translatedText: "" });
    }

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=id&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    
    // Pastikan response dari Google berhasil
    if (!res.ok) {
      throw new Error(`Google Translate API error: ${res.statusText}`);
    }

    const data = await res.json();
    
    // Gabungkan hasil translasi (Google mengembalikan array bagian-bagian teks)
    const translatedText = data[0].map((x: any) => x[0]).join('');
    
    // Kembalikan ke frontend dengan key "translatedText"
    return NextResponse.json({ translatedText: translatedText });
  } catch (error) {
    console.error("Translate Route Error:", error);
    // Jika terjadi error, kembalikan teks aslinya sebagai fallback agar UI tidak crash/kosong
    return NextResponse.json({ translatedText: "" }, { status: 500 });
  }
}