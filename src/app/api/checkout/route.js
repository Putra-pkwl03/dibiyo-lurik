import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { items } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ message: "Keranjang kosong" }, { status: 400 });
    }

    // 1. Ambil Server Key & bersihkan dari spasi/baris baru liar dengan .trim()
    const rawServerKey = process.env.MIDTRANS_SERVER_KEY;
    const serverKey = rawServerKey ? rawServerKey.trim() : null;

    if (!serverKey) {
      console.error("[CHECKOUT ERROR] MIDTRANS_SERVER_KEY tidak terbaca di .env");
      return NextResponse.json(
        { message: "Konfigurasi server (Server Key) belum siap di file .env." }, 
        { status: 500 }
      );
    }

    // INSPEKSI KEAMANAN: Tampilkan data key di terminal backend
    console.log("=== VERIFIKASI KEY DI TERMINAL ===");
    console.log("Awalan Key:", serverKey.substring(0, 14));
    console.log("Total Karakter:", serverKey.length);

    // Proses konversi basic auth token Midtrans (Username: ServerKey, Password: Di-kosongkan)
    const encodedSecret = Buffer.from(serverKey + ":").toString("base64");

    // 2. Buat ID Order unik khusus untuk transaksi ini
    const orderId = `DIBIYO-${Date.now()}`;

    // 3. Petakan item belanja ke format yang dikenali Midtrans
    const itemDetails = items.map((item) => {
      const namaProduk = item.gulungan?.produk?.kode_produk || "Kain Lurik";
      const noGulung = item.gulungan?.nomor_gulungan || "-";
      const hargaKain = item.gulungan?.harga_per_meter || item.gulungan?.harga || 0;
      const panjang = item.input_panjang || item.gulungan?.panjang_sisa || 1;

      return {
        id: item.gulungan?.id || item.id,
        price: Math.round(hargaKain * panjang), // Pembulatan harga item satuan ke Integer
        quantity: 1, 
        name: `${namaProduk} (G-${noGulung})`.substring(0, 50), // Batasan maksimal 50 karakter dari Midtrans
      };
    });

    // 4. Hitung TOTAL BERSIH langsung dari itemDetails untuk menghindari selisih desimal dengan frontend
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

    // 6. Tembak ke API Midtrans Snap Sandbox
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

    if (!response.ok) {
      // LOG TAMBAHAN: Cetak objek eror mentah dari Midtrans ke terminal Anda jika otentikasi gagal
      console.error("=== [MIDTRANS REJECTED TRANSMISSION] ===");
      console.error("Status Code Response:", response.status);
      console.error("Detail Error dari Midtrans:", data);
      console.error("========================================");
      
      throw new Error(data.error_messages?.[0] || data.status_message || "Akses ditolak oleh Midtrans. Periksa keselarasan Server Key Anda.");
    }

    // Kembalikan token snap ke frontend CheckoutSection.jsx
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