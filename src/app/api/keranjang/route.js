import { NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabase-admin';

// =====================================================
// GET: Mengambil daftar isi keranjang belanja
// =====================================================
export const GET = async (request) => {
  try {
    // AMBIL USER ID dari Header atau Sesi Cookie Anda
    // const userId = ... 

    // 🌟 KOMENTAR DI DALAM .SELECT() SUDAH DIHAPUS AGAR TIDAK SYNTAX ERROR 🌟
    const { data, error } = await supabaseAdmin
      .from('cart')
      .select(`
        id,
        jumlah_order,
        user_id,
        is_custom,          
        konfigurasi,        
        custom_metadata,    
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
      // .eq('user_id', userId) // <--- Aktifkan ini jika sistem auth sudah siap
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ data: data || [] }, { status: 200 });
  } catch (err) {
    console.error("=== SERVER CRASH IN GET CART ===", err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
};

// =====================================================
// POST: Memasukkan item regular atau kustom ke keranjang
// =====================================================
export const POST = async (request) => {
  try {
    const body = await request.json();
    const { 
      gulungan_id, 
      jumlah_order, 
      user_id, 
      is_custom,       
      konfigurasi,     
      custom_metadata  
    } = body;

    if (!is_custom && !gulungan_id) {
      return NextResponse.json({ message: 'Gulungan ID wajib diisi untuk produk regular toko.' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('cart')
      .insert({
        gulungan_id: is_custom ? null : gulungan_id, 
        jumlah_order: jumlah_order || 1,
        user_id: user_id, 
        is_custom: is_custom || false,               
        konfigurasi: is_custom ? konfigurasi : null, 
        custom_metadata: is_custom ? custom_metadata : null, 
        created_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error("=== SUPABASE ERROR IN POST CART ===", error);
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Berhasil', data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
};

// =====================================================
// DELETE: Hapus item dari keranjang 
// =====================================================
export const DELETE = async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    let itemId = searchParams.get("id");

    if (!itemId) {
      try {
        const body = await request.json();
        itemId = body.id || body.cartId || body.gulungan_id;
      } catch (e) {
        // Abaikan jika request tidak membawa body JSON
      }
    }

    if (!itemId) {
      console.error("[DELETE CART ERROR] Frontend tidak mengirimkan ID item yang akan dihapus.");
      return NextResponse.json(
        { message: "ID item wajib dikirim (bisa via query ?id= atau body JSON)" },
        { status: 400 } 
      );
    }

    console.log(`=== MENCOBA HAPUS ITEM CART DENGAN ID: ${itemId} ===`);

    const { error } = await supabaseAdmin
      .from('cart')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error("=== SUPABASE ERROR IN DELETE CART ===", error);
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Item berhasil dihapus dari keranjang' }, { status: 200 });

  } catch (err) {
    console.error("=== SERVER CRASH IN DELETE CART ===", err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
};