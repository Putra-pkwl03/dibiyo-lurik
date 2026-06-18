import { NextResponse } from "next/server";
import supabaseAdmin from '@/lib/supabase-admin';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const { items, user_id, totalNet } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ message: "Keranjang kosong" }, { status: 400 });
    }

    if (!user_id) {
      return NextResponse.json({ message: "User ID tidak ditemukan atau tidak valid" }, { status: 400 });
    }

    const rawServerKey = process.env.MIDTRANS_SERVER_KEY;
    const serverKey = rawServerKey ? rawServerKey.trim() : null;

    if (!serverKey) {
      console.error("[CHECKOUT ERROR] MIDTRANS_SERVER_KEY tidak terbaca di .env");
      return NextResponse.json(
        { message: "Konfigurasi server (Server Key) belum siap di file .env." }, 
        { status: 500 }
      );
    }

    const encodedSecret = Buffer.from(serverKey + ":").toString("base64");
    const orderId = `DIBIYO-${Date.now()}`;

    const itemDetails = items.map((item) => {
      const hargaKain = Number(item.harga_per_meter || item.gulungan?.harga_per_meter || item.harga || 0);
      const panjang = Number(item.panjang_dibeli || item.jumlah_order || item.input_panjang || 0);
      
      const namaProduk = item.kode_produk || item.gulungan?.produk?.kode_produk || "Kain Lurik";
      const noGulung = item.nomor_gulungan || item.gulungan?.nomor_gulungan || "-";
      const subtotalItem = Math.round(hargaKain * panjang);
      const dbGulunganId = item.gulungan_id || item.gulungan?.id || item.id;

      return {
        id: String(dbGulunganId).substring(0, 45), 
        price: subtotalItem, 
        quantity: 1, 
        name: `${namaProduk} (G-${noGulung})`.substring(0, 50),
        _idAsli: dbGulunganId, 
        _panjangAsli: panjang,
        _hargaAsli: hargaKain
      };
    });

    let totalGrossAmount = itemDetails.reduce((sum, item) => sum + item.price, 0);
    
    if (totalGrossAmount === 0 && totalNet) {
      totalGrossAmount = Number(totalNet);
    }

    if (totalGrossAmount <= 0) {
      return NextResponse.json({ message: "Gagal menghitung nominal transaksi. Panjang kain atau harga terbaca 0." }, { status: 400 });
    }

    const finalItemDetails = itemDetails.map(item => {
      if (item.price === 0 && totalGrossAmount > 0 && itemDetails.length === 1) {
        return { ...item, price: totalGrossAmount };
      }
      return item;
    });

    const payload = {
      transaction_details: {
        order_id: orderId,
        gross_amount: totalGrossAmount,
      },
      item_details: finalItemDetails.map(({ _idAsli, _panjangAsli, _hargaAsli, ...rest }) => rest),
      credit_card: { secure: true },
    };

    const midtransApiUrl = "https://app.sandbox.midtrans.com/snap/v1/transactions";

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
      throw new Error(data.error_messages?.[0] || data.status_message || "Akses ditolak oleh Midtrans.");
    }

    const formatJsonBackup = finalItemDetails.map(item => ({
      name: item.name,
      quantity: item._panjangAsli, 
      price: item.price
    }));

    // 7. Simpan ke Tabel Induk (transaksi) - 🌟 Kolom no_resi telah dihapus
    const { error: dbError } = await supabaseAdmin
      .from('transaksi')
      .insert({
        order_id: orderId,
        user_id: user_id,
        total_nominal: totalGrossAmount,
        status_transaksi: 'pending',
        snap_token: data.token,
        items_transaksi: formatJsonBackup,
        status_pengiriman: 'diproses'
      });

    if (dbError) {
      console.error("=== [SUPABASE INSERT TRANSACTION FAILED] ===");
      throw new Error(`Gagal mencatat transaksi utama: ${dbError.message}`);
    }

    // 8. Pecah array dan simpan ke Tabel Anak (item_transaksi)
    const rincianItemPayload = finalItemDetails.map((item) => {
      return {
        order_id: orderId,                                     
        gulungan_id: item._idAsli, 
        panjang_dibeli: Number(item._panjangAsli || 0),                      
        harga_per_meter: Number(item._hargaAsli || 0),                  
        subtotal: Number(item.price)                 
      };
    });

    const { error: itemDbError } = await supabaseAdmin
      .from('item_transaksi')
      .insert(rincianItemPayload);

    if (itemDbError) {
      console.error("=== [SUPABASE INSERT ITEM TRANSAKSI FAILED] ===");
      throw new Error(`Gagal mencatat rincian kain ke database: ${itemDbError.message}`);
    }

    console.log(`[DATABASE OK] Transaksi ${orderId} dan item rincian berhasil disinkronkan.`);

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