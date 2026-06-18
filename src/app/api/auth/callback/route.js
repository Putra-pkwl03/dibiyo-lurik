import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
// 🌟 PERBAIKAN: Import supabaseAdmin untuk bypass RLS pada tabel profiles
import supabaseAdmin from '@/lib/supabase-admin'; 

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // Ambil parameter next untuk redirect setelah berhasil (default ke homepage)
  const next = searchParams.get('next') ?? '/';

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=Missing+code`);
  }

  const cookieStore = await cookies();
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

  // 1. Tukar code dengan Session Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.exchangeCodeForSession(code);

  if (authError || !authData.session) {
    console.error('Exchange Code Error:', authError);
    return NextResponse.redirect(`${origin}/auth/login?error=Authentication+failed`);
  }

  const { session, user } = authData;

  try {
    // 2. ✨ PERBAIKAN: Gunakan supabaseAdmin (Bypass RLS) untuk memeriksa data profil
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    let finalRole = 'customer';

    if (!profile) {
      // 3. ✨ PERBAIKAN: Gunakan supabaseAdmin untuk membuat baris baru agar bebas dari hadangan RLS
      const { error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: user.id,
          username: null, // Diizinkan NULL sesuai rancangan tabel baru
          nama: user.user_metadata.full_name || user.user_metadata.name || 'Customer Google',
          role: 'customer', // Mengunci default role sebagai customer
          email: user.email,
          avatar_url: user.user_metadata.avatar_url || user.user_metadata.picture || null,
        });

      if (insertError) {
        throw new Error(`Gagal membuat data profil via Admin: ${insertError.message}`);
      }
    } else {
      // Jika sudah ada, ambil role yang tersimpan di database
      finalRole = profile.role;
    }

    // 4. Set Cookie Manual sesuai standarisasi sistem Dibyo Lurik Anda
    const response = NextResponse.redirect(`${origin}${next}`);

    response.cookies.set('sb-access-token', session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 300, // 5 Menit
    });

    response.cookies.set('sb-refresh-token', session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 Hari
    });

    response.cookies.set('user-role', finalRole, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;

  } catch (err) {
    console.error('Callback Logic Error:', err.message);
    return NextResponse.redirect(`${origin}/auth/login?error=Internal+Server+Error`);
  }
}