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

    // 🌟 PERBAIKAN 1: Filter ID Gulungan secara akurat langsung memeriksa objek itemnya (`i`), bukan string ID-nya
    const gulunganIds = items
      .filter(i => {
        const isCustom = i.is_custom === true || i.isCustom === true || String(i.gulungan_id || i.id).startsWith('CUSTOM-');
        return !isCustom;
      })
      .map(i => i.gulungan_id || i.gulungan?.id || i.id)
      .filter(id => id);

    let dbGulunganList = [];
    if (gulunganIds.length > 0) {
      const { data: fetchGulungan } = await supabaseAdmin
        .from('gulungan')
        .select('id, nomor_gulungan, harga_per_meter, produk(kode_produk, gambar_url)')
        .in('id', gulunganIds);
      
      dbGulunganList = fetchGulungan || [];
    }

    const rawServerKey = process.env.MIDTRANS_SERVER_KEY;
    const serverKey = rawServerKey ? rawServerKey.trim() : null;

    if (!serverKey) {
      return NextResponse.json({ message: "Konfigurasi server belum siap." }, { status: 500 });
    }

    const encodedSecret = Buffer.from(serverKey + ":").toString("base64");
    const orderId = `DIBIYO-${Date.now()}`;

    // 🌟 SINKRONKAN DATA DENGAN DETEKSI CUSTOM YANG RELEVAN
    const itemDetails = items.map((item) => {
      const dbGulunganId = item.gulungan_id || item.gulungan?.id || item.id;
      const matchedDbData = dbGulunganList.find(g => g.id === dbGulunganId);

      // Deteksi mutlak item kustom dari payload frontend
      const benarBenarCustom = 
        item.is_custom === true || 
        item.isCustom === true ||
        String(dbGulunganId).startsWith('CUSTOM-') ||
        (!item.gulungan_id && !item.gulungan);

      const hargaKain = Number(matchedDbData?.harga_per_meter || item.harga_per_meter || item.harga || 0);
      const panjang = Number(item.panjang_dibeli || item.jumlah_order || item.input_panjang || 0);
      
      // Ambil kode produk asli kustom jika ada
      const namaProduk = benarBenarCustom 
        ? (item.custom_metadata?.kode_produk || item.kode_produk || "Kain Lurik Custom")
        : (matchedDbData?.produk?.kode_produk || item.kode_produk || "Kain Lurik Premium");

      const noGulung = matchedDbData?.nomor_gulungan || item.nomor_gulungan || "-";
      const subtotalItem = Math.round(hargaKain * panjang);

      return {
        id: String(dbGulunganId).substring(0, 45), 
        price: subtotalItem, 
        quantity: 1, 
        name: benarBenarCustom ? `${namaProduk}`.substring(0, 50) : `${namaProduk} (G-${noGulung})`.substring(0, 50),
        _idAsli: dbGulunganId, 
        _panjangAsli: panjang,
        _hargaAsli: hargaKain,
        _dbImageUrl: matchedDbData?.produk?.gambar_url || item.image_url || item.gambar_url || null,
        _isCustom: benarBenarCustom,
        // 🌟 PERBAIKAN 2: Mengamankan data dari payload JSON log kustom yang kita kirim dari frontend sebelumnya
        _konfigurasiAsli: item.konfigurasi || item.configuration || item.gulungan?.configurasi || null
      };
    });

    let totalGrossAmount = itemDetails.reduce((sum, item) => sum + item.price, 0);
    if (totalGrossAmount === 0 && totalNet) totalGrossAmount = Number(totalNet);

    if (totalGrossAmount <= 0) {
      return NextResponse.json({ message: "Gagal menghitung nominal transaksi." }, { status: 400 });
    }

    const finalItemDetails = itemDetails.map(item => {
      if (item.price === 0 && totalGrossAmount > 0 && itemDetails.length === 1) {
        return { ...item, price: totalGrossAmount };
      }
      return item;
    });

    const payload = {
      transaction_details: { order_id: orderId, gross_amount: totalGrossAmount },
      item_details: finalItemDetails.map(({ _idAsli, _panjangAsli, _hargaAsli, _dbImageUrl, _isCustom, _konfigurasiAsli, ...rest }) => rest),
      credit_card: { secure: true },
    };

    const response = await fetch("https://app.sandbox.midtrans.com/snap/v1/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Basic ${encodedSecret}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) throw new Error("Akses ditolak oleh Midtrans.");

    // 🌟 RE-KONSTRUKSI BACKUP TRANSAKSI SECARA AKURAT KE SUPABASE
    const formatJsonBackup = finalItemDetails.map((item) => {
      let konfigurasiObj = null;
      if (item._konfigurasiAsli) {
        konfigurasiObj = typeof item._konfigurasiAsli === 'string' 
          ? JSON.parse(item._konfigurasiAsli) 
          : item._konfigurasiAsli;
      }

      return {
        name: item.name,
        quantity: item._panjangAsli, 
        price: item.price,
        image_url: item._isCustom ? null : item._dbImageUrl, 
        is_custom: item._isCustom, 
        konfigurasi: konfigurasiObj // ✨ Dijamin objek utuh (bgColor, stripes, patternDensity) masuk ke database
      };
    });

    // 7. Simpan ke Tabel Induk (transaksi)
    const { error: dbError } = await supabaseAdmin
      .from('transaksi')
      .insert({
        order_id: orderId,
        user_id: user_id,
        total_nominal: totalGrossAmount,
        status_transaksi: 'pending',
        snap_token: data.token,
        items_transaksi: formatJsonBackup, // Objek Array JSON murni (Supabase otomatis mendeteksi kolom jsonb)
        status_pengiriman: 'pesanan di proses'
      });

    if (dbError) throw new Error(`Gagal mencatat transaksi utama: ${dbError.message}`);

    // 8. Simpan ke Tabel Anak (item_transaksi)
    const rincianItemPayload = finalItemDetails.map((item) => {
      return {
        order_id: orderId,                                     
        gulungan_id: item._isCustom ? null : item._idAsli, 
        panjang_dibeli: Number(item._panjangAsli || 0),                      
        harga_per_meter: Number(item._hargaAsli || 0),                  
        subtotal: Number(item.price)                 
      };
    });

    await supabaseAdmin.from('item_transaksi').insert(rincianItemPayload);

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