import { NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabase-admin';
import nodemailer from 'nodemailer'; 
import { realtime } from '@/lib/realtime';

// =====================================================
// KONFIGURASI TRANSPORTER NODEMAILER (SMTP)
// =====================================================
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// =====================================================
// GET - list PO custom (Fleksibel untuk Antrean & Riwayat)
// =====================================================
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;
    
    const filterStatus = searchParams.get('status');
    const filterPembayaran = searchParams.get('status_pembayaran');
    
    // PERUBAHAN 1: Ambil parameter status_penerimaan, default ke 'belum_diambil'
    const filterPenerimaan = searchParams.get('status_penerimaan') || 'belum_diambil';

    let query = supabaseAdmin
      .from('pre_order_custom')
      .select(`
        id, 
        nama_customer, 
        kontak_customer, 
        alamat_customer,
        tanggal_selesai, 
        status, 
        metode_pembayaran, 
        status_pembayaran, 
        status_penerimaan,
        total_dp, 
        diskon, 
        total_harga, 
        catatan,
        created_at,
        item_pre_order_custom (
          id,
          lebar,
          panjang,
          jumlah,
          harga_per_meter,
          subtotal,
          gambar_custom
        )
      `, { count: 'exact' });

    // Terapkan filter status_penerimaan secara dinamis
    query = query.eq('status_penerimaan', filterPenerimaan);

    if (filterStatus) query = query.eq('status', filterStatus);
    if (filterPembayaran) query = query.eq('status_pembayaran', filterPembayaran);

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({
      data: data || [],
      meta: { 
        total: count, 
        page, 
        limit 
      }
    }, { status: 200 });

  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

// =====================================================
// POST - create PO custom & its detail items
// =====================================================
export async function POST(request) {
  try {
    const body = await request.json();

    // LOG DEBUG 1: Melihat data mentah yang dikirim oleh frontend
    console.log("=== [DEBUG PO CUSTOM] DATA MASUK FROM FRONTEND ===");
    console.log(JSON.stringify(body, null, 2));

    // 1. Validasi data utama wajib diisi
    if (!body.nama_customer || !body.metode_pembayaran || !body.status_pembayaran) {
      console.log("❌ [DEBUG PO CUSTOM] Gagal Validasi: Data utama tidak lengkap.");
      return NextResponse.json({ message: 'Data wajib diisi tidak lengkap' }, { status: 400 });
    }

    // 2. Validasi minimal harus ada 1 item yang didaftarkan
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      console.log("❌ [DEBUG PO CUSTOM] Gagal Validasi: Array items kosong atau tidak valid.");
      return NextResponse.json({ message: 'Gagal: Pre-Order custom harus memiliki minimal 1 item produk' }, { status: 400 });
    }

    console.log("🚀 [DEBUG PO CUSTOM] Menjalankan TAHAP 1: Insert tabel pre_order_custom...");
    
    // TAHAP 1: Masukkan data utama ke tabel 'pre_order_custom'
    const { data: poCustom, error: poError } = await supabaseAdmin
      .from('pre_order_custom')
      .insert({
        nama_customer: body.nama_customer.trim(),
        kontak_customer: body.kontak_customer || null,
        alamat_customer: body.alamat_customer || null,
        tanggal_selesai: body.tanggal_selesai || null, 
        metode_pembayaran: body.metode_pembayaran.toString().toLowerCase(),
        status_pembayaran: body.status_pembayaran.toString().toLowerCase(),
        status: body.status ? body.status.toString().toLowerCase() : 'dalam_proses',
        total_dp: Number(body.nominal_bayar || body.total_dp || 0), 
        diskon: Number(body.diskon || 0),
        total_harga: Number(body.total_harga || 0),
        catatan: body.catatan || null,
      })
      .select()
      .single();

    if (poError) {
      console.error("❌ [DEBUG PO CUSTOM] ERROR TAHAP 1 (pre_order_custom):", poError);
      throw poError;
    }

    console.log("✅ [DEBUG PO CUSTOM] TAHAP 1 Berhasil. ID PO Baru:", poCustom.id);
    console.log("🚀 [DEBUG PO CUSTOM] Menjalankan TAHAP 2: Mapping items...");

    // TAHAP 2: Mapping Items
    const preparedItems = body.items.map((item) => {
      return {
        pre_order_custom_id: poCustom.id,
        lebar: Number(item.lebar),
        panjang: Number(item.panjang || 0),
        jumlah: Number(item.jumlah || item.qty || 1),
        harga_per_meter: Number(item.harga_per_meter || item.hargaPerMeter || 0),
        subtotal: Number(item.subtotal || item.totalHargaItem || 0),
        gambar_custom: item.image || null 
      };
    });

    console.log("📋 [DEBUG PO CUSTOM] Hasil Mapping Items siap insert:");
    console.log(JSON.stringify(preparedItems, null, 2));

    console.log("🚀 [DEBUG PO CUSTOM] Menjalankan TAHAP 3: Bulk Insert ke item_pre_order_custom...");

    // TAHAP 3: Simpan seluruh item secara massal (Bulk Insert) ke 'item_pre_order_custom'
    const { error: itemsError } = await supabaseAdmin
      .from('item_pre_order_custom')
      .insert(preparedItems);

    if (itemsError) {
      console.error("❌ [DEBUG PO CUSTOM] ERROR TAHAP 3 (item_pre_order_custom):", itemsError);
      console.log("🧹 [DEBUG PO CUSTOM] Menjalankan Rollback: Menghapus kembali data induk ID:", poCustom.id);
      
      await supabaseAdmin.from('pre_order_custom').delete().eq('id', poCustom.id);
      throw itemsError;
    }

    console.log("🎉 [DEBUG PO CUSTOM] DATABASE INSERT SUCCESS. ID:", poCustom.id);


    try {
      console.log("🚀 [REALTIME] Mengirim sinyal notifikasi ke Kepala Produksi...");

      await realtime.emit("notification.created", {
        id_order: poCustom.id.toString(),
        tipe: "POC", // Pre-Order Custom
        nama_customer: poCustom.nama_customer,
        pesan: `Ada pesanan Custom baru dari ${poCustom.nama_customer} (Estimasi: ${poCustom.tanggal_selesai || '-'})`,
        waktu: new Date().toISOString(),
      });

      console.log("✅ [REALTIME] Sinyal notifikasi berhasil dipancarkan!");
    } catch (realtimeErr) {
      // Kita bungkus try-catch terpisah agar jika Upstash ada kendala, 
      // transaksi utama CS di aplikasi TIDAK IKUT GAGAL/ERROR.
      console.error("⚠️ [REALTIME-ERROR] Gagal memancarkan notifikasi:", realtimeErr);
    }

    // =====================================================
    // 2. TAHAP OTOMATIS KIRIM EMAIL KE KEPALA PRODUKSI
    // =====================================================
    try {
      console.log("📧 [EMAIL] Memulai penyusunan template email notifikasi...");
      
      const daftarItemHtml = preparedItems.map((item, index) => `
        <tr>
          <td style="padding: 10px; border: 1px solid #DDB892; text-align: center; color: #555;">${index + 1}</td>
          <td style="padding: 10px; border: 1px solid #DDB892; text-align: center; font-weight: bold; color: #8B5E3C;">${item.lebar} cm</td>
          <td style="padding: 10px; border: 1px solid #DDB892; text-align: center; color: #555;">${item.panjang ? `${item.panjang} m` : '-'}</td>
          <td style="padding: 10px; border: 1px solid #DDB892; text-align: center; font-weight: bold; color: #333;">${item.jumlah} Pcs</td>
          <td style="padding: 10px; border: 1px solid #DDB892; text-align: center;">
            ${item.gambar_custom 
              ? `<a href="${item.gambar_custom}" target="_blank" style="color: #4D90FF; font-weight: bold; text-decoration: underline;">Lihat Desain</a>` 
              : '<span style="color: #aaa; font-style: italic;">Tidak ada file</span>'}
          </td>
        </tr>
      `).join('');

      const emailHtmlContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; max-width: 650px; margin: 0 auto; border: 1px solid #DDB892; padding: 24px; border-radius: 12px; background-color: #fdfbf7;">
          <h2 style="color: #A47352; border-bottom: 2px solid #A47352; padding-bottom: 12px; margin-top: 0; font-size: 20px;">
            📢 Notifikasi Pre-Order Custom Baru (#POC-${poCustom.id})
          </h2>
          <p style="font-size: 14px; line-height: 1.5; color: #555;">
            Halo Kepala Produksi, sistem mendeteksi adanya pesanan bertipe <b>Custom</b> yang baru saja diselesaikan pembayarannya oleh Customer Service. Mohon segera dicek dan jadwalkan ke antrean lini workshop.
          </p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; background-color: #F4EAE1/30;">
            <tr>
              <td style="width: 160px; padding: 8px 0; font-weight: bold; color: #A47352;">Nama Pelanggan</td>
              <td style="color: #333;">: ${poCustom.nama_customer}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #A47352;">Status Pembayaran</td>
              <td>: <span style="background-color: ${poCustom.status_pembayaran === 'lunas' ? '#10B981' : '#FFAA00'}; color: white; padding: 3px 8px; font-size: 11px; font-weight: bold; border-radius: 4px; text-transform: uppercase;">${poCustom.status_pembayaran}</span></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #A47352;">Estimasi Selesai</td>
              <td>: <span style="color: #EF4444; font-weight: bold;">${poCustom.tanggal_selesai || '-'}</span></td>
            </tr>
          </table>

          <h3 style="color: #8B5E3C; margin-top: 24px; margin-bottom: 12px; font-size: 16px; border-left: 4px solid #B58253; padding-left: 8px;">
            Rincian Spesifikasi Teknis Produksi:
          </h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #B58253; color: white;">
                <th style="padding: 10px; border: 1px solid #DDB892;">No</th>
                <th style="padding: 10px; border: 1px solid #DDB892;">Lebar Kain</th>
                <th style="padding: 10px; border: 1px solid #DDB892;">Panjang</th>
                <th style="padding: 10px; border: 1px solid #DDB892;">Jumlah Qty</th>
                <th style="padding: 10px; border: 1px solid #DDB892;">Link Lampiran</th>
              </tr>
            </thead>
            <tbody>
              ${daftarItemHtml}
            </tbody>
          </table>

          <div style="margin-top: 20px; background-color: #F4EAE1; padding: 12px; border-left: 4px solid #A47352; border-radius: 4px; font-size: 13px;">
            <b style="color: #8B5E3C;">Catatan dari CS:</b><br/>
            <span style="color: #555; font-style: italic;">${poCustom.catatan || 'Tidak ada catatan tambahan khusus.'}</span>
          </div>

          <div style="margin-top: 25px; text-align: center;">
            <a href="https://dibiyo-lurik.vercel.app/dashboard/kp/po?tipe=custom" 
              target="_blank" 
              style="background-color: #A47352; color: white; padding: 12px 24px; font-size: 14px; font-weight: bold; text-decoration: none; border-radius: 6px; display: inline-block; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              Buka Dashboard Produksi ↗
            </a>
          </div>

          <p style="margin-top: 32px; font-size: 11px; color: #aaa; text-align: center; border-top: 1px solid #E4D5C9; padding-top: 12px; font-style: italic;">
            Email ini dihasilkan otomatis oleh Modul Manajemen Dibiyo Lurik.
          </p>
        </div>
      `;

      console.log(`📧 [EMAIL] Mengirimkan email ke: ${process.env.EMAIL_KEPALA_PRODUKSI}`);
      
      await transporter.sendMail({
        from: `"Dibiyo Lurik Notifikasi" <${process.env.SMTP_USER}>`,
        to: process.env.EMAIL_KEPALA_PRODUKSI,
        subject: `🚨 [PRODUKSI] Pre-Order Custom Baru - POC-${poCustom.id} (${poCustom.nama_customer})`,
        html: emailHtmlContent,
      });

      console.log("✅ [EMAIL] Notifikasi berhasil terkirim ke Kepala Produksi!");
    } catch (emailErr) {
      console.error("⚠️ [EMAIL-ERROR] Gagal mengirimkan email notifikasi:", emailErr);
    }

    return NextResponse.json({ 
      data: {
        ...poCustom,
        items: preparedItems
      }, 
      message: 'Berhasil menyimpan Pre-Order Custom beserta item produksinya.' 
    }, { status: 201 });

  } catch (err) {
    console.error("💥 [DEBUG PO CUSTOM] GLOBAL CATCH ERROR STACK TRACE:");
    console.error(err);

    return NextResponse.json({ 
      message: 'Gagal: ' + err.message,
      debug_details: err 
    }, { status: 500 });
  }
}


// =====================================================
// PATCH - Konfirmasi Penerimaan Barang Custom oleh Customer
// =====================================================
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID Pesanan wajib disertakan' }, { status: 400 });
    }

    // PERUBAHAN 3: Mengubah target tabel ke 'pre_order_custom'
    const { data, error } = await supabaseAdmin
      .from('pre_order_custom')
      .update({ 
        status_penerimaan: 'sudah_diambil',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Status penerimaan barang custom berhasil dikonfirmasi', 
      data 
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}