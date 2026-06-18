import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import supabaseAdmin from '@/lib/supabase-admin';

// Helper: Mengambil user dari cookie Supabase
const getAuthenticatedUser = async () => {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) { try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {} },
      },
    }
  );
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch { return null; }
};

// GET: Mengambil daftar isi keranjang user yang login
export const GET = async () => {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ data: [] }, { status: 200 });

    const { data, error } = await supabaseAdmin
      .from('cart')
      .select(`
        id, jumlah_order, user_id, is_custom, konfigurasi, custom_metadata,
        gulungan:gulungan_id (
          id, nomor_gulungan, lebar, harga_per_meter,
          produk:produk_id (id, kode_produk, gambar_url)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ data: data || [] }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
};

// POST: Menambah item ke keranjang (untuk user login)
export const POST = async (request) => {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { gulungan_id, jumlah_order, is_custom, konfigurasi, custom_metadata } = body;

    const { data, error } = await supabaseAdmin
      .from('cart')
      .insert({
        user_id: user.id,
        gulungan_id: is_custom ? null : gulungan_id,
        jumlah_order: jumlah_order || 1,
        is_custom: is_custom || false,
        konfigurasi: is_custom ? konfigurasi : null,
        custom_metadata: is_custom ? custom_metadata : null
      })
      .select();

    if (error) throw error;
    return NextResponse.json({ message: 'Berhasil', data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
};

// PATCH: Mengupdate kuantitas
export const PATCH = async (request) => {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { id, jumlah_order } = await request.json();
    const { error } = await supabaseAdmin
      .from('cart')
      .update({ jumlah_order })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
    return NextResponse.json({ message: 'Berhasil update' }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
};

// DELETE: Hapus item
export const DELETE = async (request) => {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    const { error } = await supabaseAdmin
      .from('cart')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
    return NextResponse.json({ message: 'Berhasil hapus' }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
};