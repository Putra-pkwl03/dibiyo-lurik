import { NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabase-admin';

// =====================================================
// GET: Mengambil riwayat transaksi milik user tertentu (Relasional)
// =====================================================
export const GET = async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");

    let query = supabaseAdmin
      .from('transaksi')
      .select(`
        *,
        item_transaksi (
          id,
          gulungan_id,
          panjang_dibeli,
          harga_per_meter,
          subtotal,
          gulungan (
            nomor_gulungan,
            produk (
              kode_produk,
              jenis_pewarna,
              motif ( nama ),
              kategori ( nama )
            )
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data || [], { status: 200 });
  } catch (err) {
    console.error("=== SERVER CRASH IN GET TRANSAKSI ===", err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
};

// =====================================================
// POST: Mencatat transaksi baru secara manual
// =====================================================
export const POST = async (request) => {
  try {
    const body = await request.json();
    const { order_id, user_id, gross_amount, snap_token, items } = body;

    if (!order_id || !user_id || !gross_amount) {
      return NextResponse.json(
        { message: 'Data order_id, user_id, dan gross_amount wajib diisi.' }, 
        { status: 400 }
      );
    }

    // 🌟 Kolom no_resi telah dihapus dari objek insert
    const { data: transaksiData, error: transaksiError } = await supabaseAdmin
      .from('transaksi')
      .insert({
        order_id: order_id,
        user_id: user_id,
        total_nominal: Math.round(gross_amount),
        status_transaksi: 'pending',
        snap_token: snap_token || null,
        status_pengiriman: 'diproses', 
        created_at: new Date().toISOString()
      })
      .select();

    if (transaksiError) {
      console.error("=== SUPABASE ERROR IN POST TRANSAKSI ===", transaksiError);
      return NextResponse.json({ message: transaksiError.message }, { status: 400 });
    }

    if (items && items.length > 0) {
      const itemsData = items.map((item) => ({
        order_id: order_id,
        gulungan_id: item.gulungan_id,
        panjang_dibeli: Number(item.panjang_dibeli || item.jumlah_order || item.panjang || 0),
        harga_per_meter: Number(item.harga_per_meter || item.harga || 0),
        subtotal: Number(item.subtotal || 0)
      }));

      const { error: itemsError } = await supabaseAdmin
        .from('item_transaksi')
        .insert(itemsData);

      if (itemsError) {
        console.error("=== SUPABASE ERROR IN POST ITEM TRANSAKSI ===", itemsError);
        return NextResponse.json(
          { message: `Transaksi utama berhasil dibuat, tetapi gagal menyimpan daftar item: ${itemsError.message}` }, 
          { status: 400 }
        );
      }
    }

    try {
      await supabaseAdmin.from('cart').delete().eq('user_id', user_id);
    } catch (cartErr) {
      console.error("[CLEANUP WARNING] Gagal mengosongkan keranjang:", cartErr.message);
    }

    return NextResponse.json(
      { message: 'Transaksi berhasil dicatat', data: transaksiData[0] }, 
      { status: 201 }
    );
  } catch (err) {
    console.error("=== SERVER CRASH IN POST TRANSAKSI ===", err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
};

// =====================================================
// PATCH: Hanya Update Status Pengiriman (Tanpa Resi)
// =====================================================
export const PATCH = async (request) => {
  try {
    const body = await request.json();
    // 🌟 no_resi dihapus dari destructuring
    const { order_id, status_pengerjaan } = body;

    if (!order_id) {
      return NextResponse.json({ message: "Order ID wajib dilampirkan." }, { status: 400 });
    }

    // 🌟 no_resi dihapus dari query update
    const { data, error } = await supabaseAdmin
      .from('transaksi')
      .update({
        status_pengiriman: status_pengerjaan 
      })
      .eq('order_id', order_id)
      .select();

    if (error) throw error;

    return NextResponse.json({ message: "Alur pengiriman berhasil diperbarui", data: data[0] }, { status: 200 });
  } catch (err) {
    console.error("=== SERVER CRASH IN PATCH TRANSAKSI ===", err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
};