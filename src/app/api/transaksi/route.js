import { NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabase-admin';

// =====================================================
// GET: Mengambil riwayat transaksi dengan Join Profile
// =====================================================
export const GET = async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");

    let query = supabaseAdmin
      .from('transaksi')
      .select(`
        *,
        profiles (
          username,
          nama,
          nomor_telp,
          alamat_lengkap
        ),
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
  let transactionCreated = false;
  const body = await request.json();
  const { order_id, user_id, gross_amount, snap_token, items } = body;

  try {
    if (!order_id || !user_id || !gross_amount || !items || items.length === 0) {
      return NextResponse.json(
        { message: 'Data order_id, user_id, gross_amount, dan items wajib diisi.' }, 
        { status: 400 }
      );
    }

    const { data: transaksiData, error: transaksiError } = await supabaseAdmin
      .from('transaksi')
      .insert({
        order_id: order_id,
        user_id: user_id,
        total_nominal: Math.round(gross_amount),
        status_transaksi: 'pending', // Awal mula pending, nanti diupdate midtrans webhook menjadi 'berhasil' atau 'gagal'
        snap_token: snap_token || null,
        status_pengiriman: 'pesanan di proses', // Sesuai dengan value baru di database
        created_at: new Date().toISOString()
      })
      .select();

    if (transaksiError) {
      console.error("=== SUPABASE ERROR IN POST TRANSAKSI ===", transaksiError);
      return NextResponse.json({ message: transaksiError.message }, { status: 400 });
    }

    transactionCreated = true;

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
      await supabaseAdmin.from('transaksi').delete().eq('order_id', order_id);
      return NextResponse.json(
        { message: `Gagal menyimpan daftar item. Transaksi dibatalkan: ${itemsError.message}` }, 
        { status: 400 }
      );
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
    if (transactionCreated) {
      await supabaseAdmin.from('transaksi').delete().eq('order_id', order_id);
    }
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
};

// =====================================================
// PATCH: Update Status Pengiriman
// =====================================================
export const PATCH = async (request) => {
  try {
    const body = await request.json();
    const { order_id, status_pengiriman } = body; 

    if (!order_id || !status_pengiriman) {
      return NextResponse.json({ message: "Order ID dan Status Pengiriman wajib dilampirkan." }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('transaksi')
      .update({ status_pengiriman })
      .eq('order_id', order_id)
      .select();

    if (error) throw error;

    return NextResponse.json({ message: "Status pengiriman berhasil diperbarui", data: data[0] }, { status: 200 });
  } catch (err) {
    console.error("=== SERVER CRASH IN PATCH TRANSAKSI ===", err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
};