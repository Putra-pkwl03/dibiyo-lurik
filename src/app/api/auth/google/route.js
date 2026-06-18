import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// 🌟 PERBAIKAN: Tambahkan parameter 'request' untuk membaca URL asal secara dinamis
export async function GET(request) {
  const cookieStore = await cookies();
  
  // 🌟 PERBAIKAN: Ambil 'origin' (misal: http://localhost:3000 atau https://pants-unkind-plus.ngrok-free.dev)
  const { origin } = new URL(request.url);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) },
      },
    }
  );

  // 🌟 PERBAIKAN: Sekarang redirectUrl akan selalu pas mengikuti lingkungan Anda saat itu
  const redirectUrl = `${origin}/api/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      queryParams: {
        access_type: 'offline',
        prompt: 'select_account',
      },
    },
  });

  if (error) {
    console.error('Google Auth Error:', error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, url: data.url });
}