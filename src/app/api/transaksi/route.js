import { NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabase-admin';

// =====================================================
// GET: Mengambil riwayat transaksi milik user tertentu
// =====================================================
export const GET = async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");

    if (!userId) {
      return NextResponse.json(
        { message: "User ID wajib dikirim via query parameter (?user_id=...)" }, 
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('transaksi')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data: data || [] }, { status: 200 });
  } catch (err) {
    console.error("=== SERVER CRASH IN GET TRANSAKSI ===", err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
};

// =====================================================
// POST: Mencatat transaksi baru (Awal: Pending) ke Database
// =====================================================
export const POST = async (request) => {
  try {
    const body = await request.json();
    const { 
      order_id, 
      user_id, 
      gross_amount, // Data mentah dari payload checkout/Midtrans
      snap_token, 
      items 
    } = body;

    if (!order_id || !user_id || !gross_amount) {
      return NextResponse.json(
        { message: 'Data order_id, user_id, dan gross_amount wajib diisi.' }, 
        { status: 400 }
      );
    }

    // 🌟 Pemetaan ke nama kolom baru Anda yang familiar
    const { data, error } = await supabaseAdmin
      .from('transaksi')
      .insert({
        order_id: order_id,
        user_id: user_id,
        total_nominal: Math.round(gross_amount), // gross_amount disimpan ke total_nominal
        status_transaksi: 'pending',             // status disimpan ke status_transaksi
        snap_token: snap_token || null,
        items_transaksi: items || [],            // items disimpan ke items_transaksi
        created_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error("=== SUPABASE ERROR IN POST TRANSAKSI ===", error);
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    // Otomatis bersihkan keranjang setelah transaksi dicatat
    try {
      await supabaseAdmin
        .from('cart')
        .delete()
        .eq('user_id', user_id);
    } catch (cartErr) {
      console.error("[CLEANUP WARNING] Gagal mengosongkan keranjang:", cartErr.message);
    }

    return NextResponse.json({ message: 'Transaksi berhasil dicatat', data: data[0] }, { status: 201 });
  } catch (err) {
    console.error("=== SERVER CRASH IN POST TRANSAKSI ===", err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
};