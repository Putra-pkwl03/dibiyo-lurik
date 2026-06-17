import { NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabase-admin';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Properti bawaan dari payload Webhook Midtrans
    const { 
      order_id, 
      status_code, 
      gross_amount, 
      signature_key, 
      transaction_status, 
      fraud_status 
    } = body;

    // 1. VERIFIKASI KEAMANAN: Validasi Signature Key dari Midtrans
    // Langkah ini wajib agar endpoint Anda tidak bisa ditembak sembarangan oleh robot/pihak luar.
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

    // 2. AMBIL DATA TRANSAKSI: Cari data pesanan di tabel Anda saat ini
    const { data: transaksiSaatIni, error: txError } = await supabaseAdmin
      .from('transaksi')
      .select('status_transaksi, items_transaksi')
      .eq('order_id', order_id)
      .single();

    if (txError || !transaksiSaatIni) {
      console.error(`[WEBHOOK ERROR] Order ID ${order_id} tidak ditemukan di database.`);
      return NextResponse.json({ message: "Data transaksi tidak terdaftar" }, { status: 404 });
    }

    // 3. PEMETAAN STATUS: Terjemahkan status Midtrans ke sistem Anda
    let statusBaru = 'pending';
    if (transaction_status === 'settlement' || (transaction_status === 'capture' && fraud_status === 'accept')) {
      statusBaru = 'settlement'; // Pembayaran Sukses Berhasil
    } else if (transaction_status === 'cancel' || transaction_status === 'deny' || transaction_status === 'expire') {
      statusBaru = 'batal';      // Pembayaran Gagal / Kedaluwarsa
    } else if (transaction_status === 'pending') {
      statusBaru = 'pending';
    }

    // 4. LOGIKA UPDATE STOK & TERJUAL (Hanya jika status berubah dari PENDING ke SETTLEMENT)
    // Pengaman: Cek jika status di DB Anda sebelumnya memang belum sukses (agar tidak terjadi double reduction jika webhook memanggil ulang)
    const statusLamaSukses = ['settlement', 'capture', 'success'].includes(transaksiSaatIni.status_transaksi?.toLowerCase());
    const statusBaruSukses = statusBaru === 'settlement';

    if (statusBaruSukses && !statusLamaSukses) {
      console.log(`[PROSES STOK] Mengurangi stok kain untuk Order ID: ${order_id}`);
      
      const daftarItem = transaksiSaatIni.items_transaksi || [];
      
      for (const item of daftarItem) {
        // Ekstraksi ID produk secara cerdas (baik format mentah cart ataupun format ringkas checkout)
        let produkId = item.produk_id || item.produk?.id || item.gulungan?.produk_id || item.gulungan?.produk?.id;
        const kuantitasBeli = Number(item.quantity) || 1;

        // Jembatan Otomatis: Jika item hanya membawa gulungan_id (pada properti item.id), kita cari produk_id lewat tabel gulungan
        if (!produkId && item.id) {
          const { data: dataGulungan } = await supabaseAdmin
            .from('gulungan')
            .select('produk_id')
            .eq('id', item.id)
            .single();
          
          if (dataGulungan) {
            produkId = dataGulungan.produk_id;
          }
        }

        // Jika produkId berhasil diidentifikasi, lakukan mutasi data stok & terjual
        if (produkId) {
          const { data: produkDB } = await supabaseAdmin
            .from('produk')
            .select('stok, terjual')
            .eq('id', produkId)
            .single();

          if (produkDB) {
            const stokLama = Number(produkDB.stok) || 0;
            const terjualLama = Number(produkDB.terjual) || 0;

            // Kalkulasi nilai baru
            const stokBaru = Math.max(0, stokLama - kuantitasBeli);
            const terjualBaru = terjualLama + kuantitasBeli;
            
            // Sinkronisasi dengan constraint CHECK status produk Anda ('ready' atau 'sold')
            const statusStokBaru = stokBaru === 0 ? 'sold' : 'ready';

            // Eksekusi pembaruan ke tabel produk Anda
            await supabaseAdmin
              .from('produk')
              .update({
                stok: stokBaru,
                terjual: terjualBaru,
                status: statusStokBaru,
                updated_at: new Date().toISOString()
              })
              .eq('id', produkId);
            
            console.log(`[STOK OK] Produk ${produkId} berhasil diupdate. Stok: ${stokLama} -> ${stokBaru} (${statusStokBaru})`);
          }
        } else {
          console.warn(`[STOK WARNING] Gagal mendeteksi referensi produk_id untuk item:`, item);
        }
      }
    }

    // 5. UPDATE TABEL TRANSAKSI: Simpan status_transaksi terbaru Anda
    const { error: updateError } = await supabaseAdmin
      .from('transaksi')
      .update({ status_transaksi: statusBaru })
      .eq('order_id', order_id);

    if (updateError) throw updateError;

    // Berikan respons status 200 OK ke server Midtrans sebagai tanda webhook berhasil diterima
    return NextResponse.json({ message: "Webhook Midtrans berhasil diproses", status: statusBaru }, { status: 200 });

  } catch (err) {
    console.error("=== SERVER CRASH IN WEBHOOK MIDTRANS ===", err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}