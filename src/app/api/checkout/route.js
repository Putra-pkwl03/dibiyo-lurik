import { NextResponse } from "next/server";
import supabaseAdmin from '@/lib/supabase-admin'; // 1. ✨ TAMBAHAN: Import Supabase Admin
import crypto from 'crypto';

export async function POST(request) {
  try {
    // 2. ✨ TAMBAHAN: Ambil user_id dari body yang dikirim frontend
    const { items, user_id } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ message: "Keranjang kosong" }, { status: 400 });
    }

    if (!user_id) {
      return NextResponse.json({ message: "User ID tidak ditemukan atau tidak valid" }, { status: 400 });
    }

    // Ambil Server Key & bersihkan dari spasi/baris baru liar dengan .trim()
    const rawServerKey = process.env.MIDTRANS_SERVER_KEY;
    const serverKey = rawServerKey ? rawServerKey.trim() : null;

    if (!serverKey) {
      console.error("[CHECKOUT ERROR] MIDTRANS_SERVER_KEY tidak terbaca di .env");
      return NextResponse.json(
        { message: "Konfigurasi server (Server Key) belum siap di file .env." }, 
        { status: 500 }
      );
    }

    // Proses konversi basic auth token Midtrans
    const encodedSecret = Buffer.from(serverKey + ":").toString("base64");

    // Buat ID Order unik khusus untuk transaksi ini
    const orderId = `DIBIYO-${Date.now()}`;

    // 3. Petakan item belanja ke format yang dikenali Midtrans
    const itemDetails = items.map((item) => {
      const namaProduk = item.gulungan?.produk?.kode_produk || "Kain Lurik";
      const noGulung = item.gulungan?.nomor_gulungan || "-";
      const hargaKain = item.gulungan?.harga_per_meter || item.gulungan?.harga || 0;
      const panjang = item.input_panjang || item.gulungan?.panjang_sisa || 1;

      return {
        id: item.gulungan?.id || item.id,
        price: Math.round(hargaKain * panjang), 
        quantity: 1, 
        name: `${namaProduk} (G-${noGulung})`.substring(0, 50), 
      };
    });

    // 4. Hitung TOTAL BERSIH langsung dari itemDetails
    const totalGrossAmount = itemDetails.reduce((sum, item) => sum + item.price, 0);

    // 5. Struktur Payload Transaksi Midtrans Snap
    const payload = {
      transaction_details: {
        order_id: orderId,
        gross_amount: totalGrossAmount,
      },
      item_details: itemDetails,
      credit_card: {
        secure: true,
      },
    };

    // KUNCI LANGSUNG KE URL SANDBOX
    const midtransApiUrl = "https://app.sandbox.midtrans.com/snap/v1/transactions";

    // 6. Tembak ke API Midtrans Sandbox
    const response = await fetch(midtransApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Basic ${encodedSecret}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("=== [MIDTRANS REJECTED TRANSMISSION] ===");
      console.error("Detail Error dari Midtrans:", data);
      throw new Error(data.error_messages?.[0] || data.status_message || "Akses ditolak oleh Midtrans.");
    }

    // 7. ✨ TAMBAHAN UTAMA: Simpan data pesanan ke dalam tabel transaksi Supabase
    // Disimpan di sini karena data.token dan orderId sudah terkonfirmasi valid oleh Midtrans
    const { error: dbError } = await supabaseAdmin
      .from('transaksi')
      .insert({
        order_id: orderId,
        user_id: user_id,
        total_nominal: totalGrossAmount,
        status_transaksi: 'pending',
        snap_token: data.token,
        items_transaksi: items // Kita simpan array 'items' asli agar file webhook Anda nanti bisa mendeteksi produk_id / gulungan_id dengan lancar!
      });

    if (dbError) {
      console.error("=== [SUPABASE INSERT TRANSACTION FAILED] ===");
      console.error(dbError);
      throw new Error(`Gagal mencatat transaksi ke database: ${dbError.message}`);
    }

    console.log(`[DATABASE OK] Transaksi ${orderId} berhasil dicatat di Supabase.`);

    return NextResponse.json({ 
      token: data.token, 
      redirect_url: data.redirect_url,
      orderId: orderId 
    });

  } catch (error) {
    console.error("Midtrans Checkout Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}