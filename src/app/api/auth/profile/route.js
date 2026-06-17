﻿import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = await cookies();
  
  // 1. Ambil nilai token secara manual dari cookie
  const accessToken = cookieStore.get('sb-access-token')?.value;
  const refreshToken = cookieStore.get('sb-refresh-token')?.value;

  // 2. Inisialisasi Supabase Client
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

  // 3. PAKSA Set Session agar SDK mengenali cookie kustom Anda
  if (accessToken) {
    await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken || '',
    });
  }

  // 4. ✨ PERBAIKAN: Gunakan getUser() untuk verifikasi data otentik langsung ke server auth
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('Auth User Error:', userError);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 5. Query profil user berdasarkan user.id yang aman
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: profile });
}


export async function PATCH(request) {
  const cookieStore = await cookies();
  
  // 1. Ambil nilai token secara manual dari cookie
  const accessToken = cookieStore.get('sb-access-token')?.value;
  const refreshToken = cookieStore.get('sb-refresh-token')?.value;

  // 2. Inisialisasi Supabase Client
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

  // 3. PAKSA Set Session (Penting agar update dikenali)
  if (accessToken) {
    await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken || '',
    });
  }

  // 4. ✨ PERBAIKAN: Gunakan getUser() untuk verifikasi user sebelum mengubah data
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('Auth User Error:', userError);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { username, password } = body;

  try {
    // 5. Update Profile (Username)
    if (username) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ username: username.trim() })
        .eq('id', user.id);
      
      if (profileError) throw profileError;
    }

    // 6. Update Password (jika ada)
    if (password && password.length >= 6) {
      const { error: authError } = await supabase.auth.updateUser({ password });
      if (authError) throw authError;
    }

    return NextResponse.json({ message: 'Profil berhasil diperbarui' });
  } catch (error) {
    console.error('Update Error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}