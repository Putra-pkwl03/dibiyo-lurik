import { NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabase-admin';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const body = await request.json();
    
    const { 
      order_id, 
      status_code, 
      gross_amount, 
      signature_key, 
      transaction_status, 
      fraud_status 
    } = body;

    // 1. VERIFIKASI KEAMANAN SIGNATURE MIDTRANS
    const rawServerKey = process.env.MIDTRANS_SERVER_KEY;
    const serverKey = rawServerKey ? rawServerKey.trim() : '';
    
    const localSignature = crypto
      .createHash('sha512')
      .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
      .digest('hex');

    if (localSignature !== signature_key) {
      console.error(`[WEBHOOK SECURITY ALERT] Signature tidak valid untuk Order ID: ${order_id}`);
      return NextResponse.json({ message: "Akses ditolak, signature tidak cocok." }, { status: 401 });
    }

    console.log(`=== WEBHOOK MIDTRANS MASUK: ${order_id} [Status: ${transaction_status}] ===`);

    // 2. AMBIL DATA TRANSAKSI DARI DATABASE
    const { data: transaksiSaatIni, error: txError } = await supabaseAdmin
      .from('transaksi')
      .select('status_transaksi')
      .eq('order_id', order_id)
      .single();

    // 💡 MITIGASI ERROR 404: Jika order_id palsu/pengujian Midtrans, berikan 200 OK agar Midtrans tidak mencap endpoint mati
    if (txError || !transaksiSaatIni) {
      console.warn(`[WEBHOOK WARNING] Order ID ${order_id} tidak ditemukan di database. Kemungkinan transaksi simulasi.`);
      return NextResponse.json({ message: "Data transaksi tidak terdaftar, diabaikan aman." }, { status: 200 });
    }

    // 3. PEMETAAN STATUS (SINKRON DENGAN CONSTRAINT DATABASE & FRONTEND)
    let statusBaru = 'pending';
    let statusKirimBaru = 'pesanan di proses'; // Default disamakan dengan aturan ENUM database

    if (transaction_status === 'settlement' || (transaction_status === 'capture' && fraud_status === 'accept')) {
      statusBaru = 'berhasil'; // ✨ Diubah menjadi 'berhasil' agar lolos check_status_transaksi Supabase
      statusKirimBaru = 'pesanan di proses'; // Sesuai dengan langkah ke-1 Tracker UI
    } else if (transaction_status === 'cancel' || transaction_status === 'deny' || transaction_status === 'expire') {
      statusBaru = 'batal';
      statusKirimBaru = 'pesanan di proses'; // Tetap biarkan default agar tidak melanggar CHECK CONSTRAINT DB
    } else if (transaction_status === 'pending') {
      statusBaru = 'pending';
      statusKirimBaru = 'pesanan di proses';
    }

    // 4. LOGIKA MUTASI POTONG PANJANG KAIN (Hanya jika status berubah dari pending ke sukses)
    const statusLamaSukses = ['settlement', 'capture', 'success', 'berhasil'].includes(transaksiSaatIni.status_transaksi?.toLowerCase());
    const statusBaruSukses = statusBaru === 'berhasil'; // ✨ Disesuaikan dengan pemetaan baru

    if (statusBaruSukses && !statusLamaSukses) {
      console.log(`[PROSES STOK] Menghitung pemotongan sisa kain untuk Order ID: ${order_id}`);
      
      const { data: daftarItem, error: itemError } = await supabaseAdmin
        .from('item_transaksi')
        .select('gulungan_id, panjang_dibeli')
        .eq('order_id', order_id);

      if (itemError) {
        console.error(`[STOK ERROR] Gagal mengambil item_transaksi untuk ${order_id}:`, itemError.message);
      } else if (daftarItem && daftarItem.length > 0) {
        
        for (const item of daftarItem) {
          const { gulungan_id, panjang_dibeli } = item;
          if (!gulungan_id) continue;

          const { data: dataGulungan, error: gulunganFetchError } = await supabaseAdmin
            .from('gulungan')
            .select('panjang_sisa, produk_id')
            .eq('id', gulungan_id)
            .single();

          if (gulunganFetchError || !dataGulungan) {
            console.error(`[STOK ERROR] Gulungan ID ${gulungan_id} tidak ditemukan di database.`);
            continue;
          }

          const panjangSisaLama = Number(dataGulungan.panjang_sisa) || 0;
          const panjangSisaBaru = Math.max(0, panjangSisaLama - Number(panjang_dibeli));

          const { error: gulunganUpdateError } = await supabaseAdmin
            .from('gulungan')
            .update({ panjang_sisa: panjangSisaBaru })
            .eq('id', gulungan_id);

          if (gulunganUpdateError) {
            console.error(`[STOK ERROR] Gagal memotong panjang gulungan ${gulungan_id}:`, gulunganUpdateError.message);
          } else {
            console.log(`[STOK OK] Gulungan ${gulungan_id} dipotong ${panjang_dibeli}m. Sisa gudang: ${panjangSisaLama}m -> ${panjangSisaBaru}m`);
          }

          const produkId = dataGulungan.produk_id;
          if (produkId) {
            const { data: produkDB } = await supabaseAdmin
              .from('produk')
              .select('terjual')
              .eq('id', produkId)
              .single();

            if (produkDB) {
              const terjualLama = Number(produkDB.terjual) || 0;
              await supabaseAdmin
                .from('produk')
                .update({
                  terjual: terjualLama + Number(panjang_dibeli),
                  updated_at: new Date().toISOString()
                })
                .eq('id', produkId);
            }
          }
        }
      }
    }

    // 5. UPDATE TABEL TRANSAKSI KESELURUHAN (AMAN DARI CONSTRAINT VIOLATION)
    const { error: updateError } = await supabaseAdmin
      .from('transaksi')
      .update({ 
        status_transaksi: statusBaru,
        status_pengiriman: statusKirimBaru 
      })
      .eq('order_id', order_id);

    if (updateError) throw updateError;

    return NextResponse.json({ message: "Webhook Midtrans berhasil diproses", status: statusBaru }, { status: 200 });

  } catch (err) {
    console.error("=== SERVER CRASH IN WEBHOOK MIDTRANS ===", err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}