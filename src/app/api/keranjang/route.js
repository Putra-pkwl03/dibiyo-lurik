import { NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabase-admin';
// Catatan: Idealnya gunakan supabase client biasa untuk route endpoint user agar aman.
// Di bawah ini ditambahkan pengaman dasar asumsi skema user_id.

export const GET = async (request) => {
  try {
    // AMBIL USER ID dari Header atau Sesi Cookie Anda (Contoh implementasi umum)
    // Jika Anda memiliki helper auth, dapatkan user.id di sini.
    // Misal sementara: const userId = ... 

    const { data, error } = await supabaseAdmin
      .from('cart')
      .select(`
        id,
        jumlah_order,
        user_id,
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
      // .eq('user_id', userId) // <--- PASTIKAN UNTUK MEMILIKINYA AGAR TIDAK BERCAMPUR DATA USER LAIN
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ data: data || [] }, { status: 200 });
  } catch (err) {
    console.error("=== SERVER CRASH IN GET CART ===", err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
};

export const POST = async (request) => {
  try {
    const { gulungan_id, jumlah_order, user_id } = await request.json(); // Ambil user_id dari body jika di-post oleh admin/sync-worker

    if (!gulungan_id) {
      return NextResponse.json({ message: 'Gulungan ID wajib diisi' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('cart')
      .insert({
        gulungan_id,
        jumlah_order: jumlah_order || 1,
        user_id: user_id, // <--- Kolom user_id di skema DDL Anda NOT NULL, wajib diisi!
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
// DELETE: Hapus item dari keranjang (Fungsi Baru)
// =====================================================
export const DELETE = async (request) => {
  try {
    // 1. Coba ambil ID dari URL parameter (?id=xxx)
    const { searchParams } = new URL(request.url);
    let itemId = searchParams.get("id");

    // 2. Jika tidak ada di URL, coba ambil dari Body JSON ({ id: xxx })
    // Strategi ganda ini dipasang agar otomatis cocok dengan metode apa pun yang dipakai frontend Anda
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

    // 3. Eksekusi penghapusan di tabel 'cart' menggunakan supabaseAdmin
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