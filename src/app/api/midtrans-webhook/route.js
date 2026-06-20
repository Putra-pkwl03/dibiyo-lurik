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

    console.log(`\n=== [WEBHOOK RECEIVED] ${order_id} [Status: ${transaction_status}] ===`);

    // 1. VERIFIKASI KEAMANAN SIGNATURE MIDTRANS
    const rawServerKey = process.env.MIDTRANS_SERVER_KEY;
    const serverKey = rawServerKey ? rawServerKey.trim() : '';
    
    // 💡 PERBAIKAN: Midtrans sering mengirim gross_amount dengan .00 (desimal string). 
    // Kita harus memastikan format gross_amount sama persis dengan string asli dari Midtrans agar signature cocok.
    const formattedAmount = String(gross_amount);

    const localSignature = crypto
      .createHash('sha512')
      .update(`${order_id}${status_code}${formattedAmount}${serverKey}`)
      .digest('hex');

    if (localSignature !== signature_key) {
      console.error(`[WEBHOOK SECURITY ALERT] Signature tidak valid untuk Order ID: ${order_id}`);
      // Jika signature gagal, kita kembalikan 401 agar tahu masalahnya ada di SERVER_KEY / format nominal.
      return NextResponse.json({ message: "Akses ditolak, signature tidak cocok." }, { status: 401 });
    }

    // 2. AMBIL DATA TRANSAKSI DARI DATABASE
    const { data: transaksiSaatIni, error: txError } = await supabaseAdmin
      .from('transaksi')
      .select('status_transaksi')
      .eq('order_id', order_id)
      .maybeSingle(); // 💡 Menggunakan maybeSingle() agar jika data kosong tidak langsung crash melempar error keras

    // 🔍 INVESTIGASI LOG 1: Apakah order_id ini benar-benar ada di database?
    console.log(`[DB CHECK] Mencari Order ID: ${order_id} | Ketemu: ${!!transaksiSaatIni} | Status Lama: ${transaksiSaatIni?.status_transaksi || 'tidak ada'}`);

    if (txError || !transaksiSaatIni) {
      console.warn(`[WEBHOOK WARNING] Order ID ${order_id} tidak ditemukan di database. Mengembalikan 200 OK agar Midtrans berhenti melakukan retry.`);
      return NextResponse.json({ message: "Data transaksi tidak terdaftar, diabaikan aman." }, { status: 200 });
    }

    // 3. PEMETAAN STATUS (SINKRON DENGAN CONSTRAINT DATABASE & FRONTEND)
    let statusBaru = 'pending';
    let statusKirimBaru = 'pesanan di proses'; 

    if (transaction_status === 'settlement' || (transaction_status === 'capture' && fraud_status === 'accept')) {
      statusBaru = 'berhasil'; 
    } else if (transaction_status === 'cancel' || transaction_status === 'deny' || transaction_status === 'expire') {
      statusBaru = 'gagal'; // Lolos CHECK CONSTRAINT DB
    } else if (transaction_status === 'pending') {
      statusBaru = 'pending';
    }

    console.log(`[STATUS MAPPING] Mengubah status transaksi dari [${transaksiSaatIni.status_transaksi}] menjadi [${statusBaru}]`);

    // 4. LOGIKA MUTASI POTONG PANJANG KAIN (Hanya jika status berubah dari pending ke sukses)
    const statusLamaSukses = ['settlement', 'capture', 'success', 'berhasil'].includes(transaksiSaatIni.status_transaksi?.toLowerCase());
    const statusBaruSukses = statusBaru === 'berhasil';

    if (statusBaruSukses && !statusLamaSukses) {
      console.log(`[PROSES STOK] Memulai pemotongan sisa kain untuk Order ID: ${order_id}`);
      
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
            console.error(`[STOK ERROR] Gulungan ID ${gulungan_id} tidak ditemukan.`);
            continue;
          }

          const panjangSisaLama = Number(dataGulungan.panjang_sisa) || 0;
          const panjangSisaBaru = Math.max(0, panjangSisaLama - Number(panjang_dibeli));

          // Jalankan update stok gulungan
          await supabaseAdmin
            .from('gulungan')
            .update({ panjang_sisa: panjangSisaBaru })
            .eq('id', gulungan_id);

          console.log(`[STOK OK] Gulungan ${gulungan_id}: ${panjangSisaLama}m -> ${panjangSisaBaru}m`);

          // Jalankan update angka terjual pada produk
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

    // 5. UPDATE TABEL TRANSAKSI KESELURUHAN
    const { error: updateError } = await supabaseAdmin
      .from('transaksi')
      .update({ 
        status_transaksi: statusBaru,
        status_pengiriman: statusKirimBaru 
      })
      .eq('order_id', order_id);

    if (updateError) {
      console.error(`[DB UPDATE ERROR] Gagal mengupdate tabel transaksi:`, updateError.message);
      throw updateError;
    }

    console.log(`[SUCCESS] Database berhasil diperbarui untuk Order ID: ${order_id}. Status akhir: ${statusBaru}`);
    return NextResponse.json({ message: "Webhook Midtrans berhasil diproses", status: statusBaru }, { status: 200 });

  } catch (err) {
    console.error("=== SERVER CRASH IN WEBHOOK MIDTRANS ===", err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}