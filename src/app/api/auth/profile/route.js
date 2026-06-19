﻿// /api/auth/profile/route.js
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = await cookies();
  
  const accessToken = cookieStore.get('sb-access-token')?.value;
  const refreshToken = cookieStore.get('sb-refresh-token')?.value;

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

  if (accessToken) {
    await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken || '',
    });
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('Auth User Error:', userError);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Gabungkan data profil dengan email dari auth user
  return NextResponse.json({ 
    data: { 
      ...profile, 
      email: user.email 
    } 
  });
}

export async function PATCH(request) {
  const cookieStore = await cookies();
  
  const accessToken = cookieStore.get('sb-access-token')?.value;
  const refreshToken = cookieStore.get('sb-refresh-token')?.value;

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

  if (accessToken) {
    await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken || '',
    });
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  // ✨ PERBAIKAN: latitude dan longitude telah dihapus total dari destrukturisasi body
  const { username, alamat_lengkap } = body; 

  try {
    const updatePayload = {};
    if (username) updatePayload.username = username.trim();
    if (alamat_lengkap !== undefined) updatePayload.alamat_lengkap = alamat_lengkap.trim();

    if (Object.keys(updatePayload).length > 0) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('id', user.id);
      
      if (profileError) throw profileError;
    }

    return NextResponse.json({ message: 'Profil dan alamat berhasil diperbarui' });
  } catch (error) {
    console.error('Update Error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}