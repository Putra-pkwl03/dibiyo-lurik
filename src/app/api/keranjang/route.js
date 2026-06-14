import { NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabase-admin';

// =====================================================
// GET: Ambil isi keranjang (Semua data)
// =====================================================
export const GET = async () => {
  try {
    const { data, error } = await supabaseAdmin
      .from('cart')
      .select(`
        id,
        jumlah_order,
        gulungan:gulungan_id (
          id, 
          nomor_gulungan, 
          lebar, 
          panjang_total,
          panjang_sisa, 
          harga_per_meter,
          produk:produk_id (
            id, 
            kode_produk, 
            gambar_url, 
            motif:motif_id(nama), 
            kategori:kategori_id(nama)
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      // Log ini akan muncul di TERMINAL VS Code kamu
      console.error("=== SUPABASE ERROR IN GET CART ===", error);
      throw error;
    }

    return NextResponse.json({ data: data || [] }, { status: 200 });
  } catch (err) {
    // Log ini membantu melacak jika ada crash code lain
    console.error("=== SERVER CRASH IN GET CART ===", err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
};

export const POST = async (request) => {
  try {
    // Menyesuaikan dengan apa yang dikirim oleh Frontend
    const { gulungan_id, jumlah_order } = await request.json();

    if (!gulungan_id) {
      return NextResponse.json({ message: 'Gulungan ID wajib diisi' }, { status: 400 });
    }

    // Insert data ke tabel cart (sesuai relasi di fungsi GET kamu)
    const { data, error } = await supabaseAdmin
      .from('cart')
      .insert({
        gulungan_id,
        jumlah_order: jumlah_order || 1,
        created_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error("=== SUPABASE ERROR IN POST CART ===", error);
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({ 
      message: 'Berhasil menambahkan item ke keranjang',
      data: data 
    }, { status: 201 });

  } catch (err) {
    console.error("=== SERVER CRASH IN POST CART ===", err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
};