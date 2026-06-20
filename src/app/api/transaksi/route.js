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

    // 🌟 GENERATE BACKUP JSON UNTUK DITAMPILKAN DI LIST PESANAN FRONTEND
    const formatJsonBackup = items.map((item) => {
      // Deteksi nama produk
      const namaProduk = item.kode_produk || item.gulungan?.produk?.kode_produk || item.name || item.nama || "Kain Lurik";
      const noGulung = item.nomor_gulungan || item.gulungan?.nomor_gulungan || "-";
      const finalName = item.is_custom ? namaProduk : `${namaProduk} (G-${noGulung})`;

      // Di dalam POST api/transaksi/route.js
const imageUrl = item.gulungan?.produk?.gambar_url || 
                 item.produk?.gambar_url || 
                 item.gambar_url || 
                 null;

      // Parsing konfigurasi warna/garis jika item tersebut kustom
      let konfigurasiObj = null;
      if (item.konfigurasi) {
        konfigurasiObj = typeof item.konfigurasi === 'string' 
          ? JSON.parse(item.konfigurasi) 
          : item.konfigurasi;
      }

      return {
        name: finalName,
        quantity: Number(item.panjang_dibeli || item.jumlah_order || item.panjang || 1),
        price: Number(item.subtotal || item.harga || item.price || 0),
        image_url: imageUrl,
        is_custom: item.is_custom || false,
        konfigurasi: konfigurasiObj
      };
    });

    // 🌟 MASUKKAN KE TABEL TRANSAKSI (IKUT SERTAKAN ITEMS_TRANSAKSI)
    const { data: transaksiData, error: transaksiError } = await supabaseAdmin
      .from('transaksi')
      .insert({
        order_id: order_id,
        user_id: user_id,
        total_nominal: Math.round(gross_amount),
        status_transaksi: 'pending', 
        snap_token: snap_token || null,
        items_transaksi: formatJsonBackup, // ✨ Data visualisasi masuk ke sini
        status_pengiriman: 'pesanan di proses', 
        created_at: new Date().toISOString()
      })
      .select();

    if (transaksiError) {
      console.error("=== SUPABASE ERROR IN POST TRANSAKSI ===", transaksiError);
      return NextResponse.json({ message: transaksiError.message }, { status: 400 });
    }

    transactionCreated = true;

    const itemsData = items.map((item) => {
      const isCustomProduct = String(item.gulungan_id || item.id).startsWith('CUSTOM-') || item.is_custom;
      
      return {
        order_id: order_id,
        // Jika kustom set null agar tipe UUID database aman
        gulungan_id: isCustomProduct ? null : (item.gulungan_id || item.id),
        panjang_dibeli: Number(item.panjang_dibeli || item.jumlah_order || item.panjang || 0),
        harga_per_meter: Number(item.harga_per_meter || item.harga || 0),
        subtotal: Number(item.subtotal || 0)
      };
    });

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
// PATCH: Update Status Pengiriman (SUDAH AMAN)
// =====================================================
export const PATCH = async (request) => {
  try {
    const body = await request.json();
    let { order_id, status_pengiriman } = body; 

    if (!order_id || !status_pengiriman) {
      return NextResponse.json({ message: "Order ID dan Status Pengiriman wajib dilampirkan." }, { status: 400 });
    }

    // 🌟 1. PEMETAAN NILAI: Ubah keyword singkat dari frontend menjadi teks valid database
    const statusClean = status_pengiriman.toLowerCase().trim();
    let statusFinal = statusClean;

    if (statusClean === 'dikirim') {
      statusFinal = 'pesanan bisa diambil di toko sekarang';
    } else if (statusClean === 'selesai') {
      statusFinal = 'pesanan di terima';
    }

    // 🌟 2. PROTEKSI: Validasi kecocokan dengan check constraint Supabase
    const nilaiValid = [
      'pesanan di proses',
      'pesanan bisa diambil di toko sekarang',
      'pesanan di terima'
    ];

    if (!nilaiValid.includes(statusFinal)) {
      return NextResponse.json({ 
        message: `Status '${status_pengiriman}' tidak valid. Database hanya menerima: ${nilaiValid.join(', ')}` 
      }, { status: 400 });
    }

    // 🌟 3. EKSEKUSI UPDATE: Menggunakan status yang sudah divalidasi aman
    const { data, error } = await supabaseAdmin
      .from('transaksi')
      .update({ status_pengiriman: statusFinal })
      .eq('order_id', order_id)
      .select();

    if (error) throw error;

    return NextResponse.json({ message: "Status pengiriman berhasil diperbarui", data: data[0] }, { status: 200 });
  } catch (err) {
    console.error("=== SERVER CRASH IN PATCH TRANSAKSI ===", err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
};