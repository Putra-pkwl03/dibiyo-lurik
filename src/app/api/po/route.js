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

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tipePO = searchParams.get('tipe') || 'reguler';
  
  const isCustom = tipePO === 'custom';
  const table = isCustom ? 'pre_order_custom' : 'pre_order_reguler';
  
  const relationTable = isCustom ? 'item_pre_order_custom' : 'item_pre_order_reguler';
  
  const qtyColumn = 'jumlah'; 

  const { data, error } = await supabaseAdmin
    .from(table)
    .select(`*, ${relationTable}(${qtyColumn})`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Supabase Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const dataWithCount = (data || []).map(item => {
    const items = item[relationTable] || [];
    const totalQty = items.reduce((sum, row) => sum + (Number(row[qtyColumn]) || 0), 0);
    return { ...item, jumlah_item: totalQty };
  });

  return NextResponse.json({ data: dataWithCount });
}

// =====================================================
// PATCH - Update Status PO (Dari KP ke CS) - OPTIMIZED
// =====================================================
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, tipe, status } = body; 

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing ID or Status' }, { status: 400 });
    }

    const kodePrefix = tipe === 'custom' ? 'POC' : 'POR';
    const table = tipe === 'custom' ? 'pre_order_custom' : 'pre_order_reguler';

    const { data, error } = await supabaseAdmin
      .from(table)
      .update({ status: status })
      .eq('id', id)
      .select()
      .single(); 

    if (error) {
      console.error("Supabase Patch Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // =====================================================
    // LOGIKA PERUBAHAN STATUS KE "SELESAI DIPROSES"
    // =====================================================
    if (status === 'selesai_diproses') {
      
      // 1. LOGIKA SIMPAN NOTIFIKASI KE DATABASE (WAJIB AWAIT agar log tabel tetap valid)
      try {
        console.log(`🗄️ [DB-NOTIF] Menyimpan riwayat notifikasi ${kodePrefix} selesai...`);
        
        const { error: dbNotifError } = await supabaseAdmin
          .from('notifikasi_sistem')
          .insert([
            {
              penerima_role: 'cs',
              tipe_order: kodePrefix,
              id_order: id.toString(),
              judul: 'Produksi Selesai',
              pesan: `Pesanan ${tipe === 'custom' ? 'Custom' : 'Reguler'} #${kodePrefix}-${id} (${data?.nama_customer || 'Tanpa Nama'}) telah SELESAI DIPROSES!`,
              status_dibaca: false
            }
          ]);

        if (dbNotifError) throw dbNotifError;
      } catch (dbErr) {
        console.error("⚠️ [DB-NOTIF-ERROR] Gagal menyimpan ke tabel notifikasi_sistem:", dbErr);
      }

      // =========================================================================
      // BACKGROUND PROCESS: OPERASI ASINKRONUS (TANPA AWAIT AGAR RESPONS INSTAN)
      // =========================================================================
      
      // A. Transmisi Real-time via Websocket (Lepas await)
      realtime.emit("notification.completed", {
        id_order: id.toString(),
        tipe: tipe.toLowerCase(), 
        kode_display: `${kodePrefix}-${id}`, 
        nama_customer: data?.nama_customer || 'Pelanggan',
        pesan: `Pesanan ${tipe === 'custom' ? 'Custom' : 'Reguler'} #${kodePrefix}-${id} (${data?.nama_customer || 'Tanpa Nama'}) telah SELESAI DIPROSES!`,
        waktu: new Date().toISOString(),
      }).catch(realtimeErr => {
        console.error(" [BACKGROUND-REALTIME-ERROR] Gagal pancar sinyal ke CS:", realtimeErr);
      });

      // B. Penarikan Data Detail dan Pengiriman Email Khusus PO Custom (IIFE)
      if (tipe === 'custom') {
        (async () => {
          try {
            console.log(` [BACKGROUND-EMAIL-PATCH] Menarik data lengkap untuk PO Custom #${id}...`);

            const { data: detailPO, error: detailError } = await supabaseAdmin
              .from('pre_order_custom')
              .select(`
                id,
                nama_customer,
                total_harga,
                status_pembayaran,
                catatan,
                item_pre_order_custom (lebar, panjang, jumlah)
              `)
              .eq('id', id)
              .single();

            if (detailError || !detailPO) throw new Error("Gagal mengambil detail order");

            const itemRowsHtml = (detailPO.item_pre_order_custom || []).map((item, index) => `
              <tr>
                <td style="padding: 8px; border: 1px solid #DDB892; text-align: center;">${index + 1}</td>
                <td style="padding: 8px; border: 1px solid #DDB892; text-align: center; font-weight: bold;">${item.lebar} cm</td>
                <td style="padding: 8px; border: 1px solid #DDB892; text-align: center;">${item.panjang ? `${item.panjang} m` : '-'}</td>
                <td style="padding: 8px; border: 1px solid #DDB892; text-align: center; font-weight: bold;">${item.jumlah} Pcs</td>
              </tr>
            `).join('');

            const emailHtmlContent = `
              <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #10B981; padding: 24px; border-radius: 12px; background-color: #f4fbf7;">
                <h2 style="color: #10B981; border-bottom: 2px solid #10B981; padding-bottom: 12px; margin-top: 0; font-size: 20px;">
                  Produksi Pre-Order Custom Selesai! (#POC-${detailPO.id})
                </h2>
                <p style="font-size: 14px; line-height: 1.5; color: #444;">
                  Halo Tim Customer Service, diberitahukan bahwa Kepala Produksi telah menandai pesanan berikut ini dengan status <b>Selesai Diproses (Siap Diambil/Dikirim)</b>.
                </p>
                
                <table style="width: 100%; border-collapse: collapse; margin: 18px 0; font-size: 14px;">
                  <tr>
                    <td style="width: 150px; padding: 6px 0; font-weight: bold; color: #A47352;">ID Pre-Order</td>
                    <td style="font-weight: bold; color: #333;">: POC-${detailPO.id}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-weight: bold; color: #A47352;">Nama Pelanggan</td>
                    <td style="color: #333;">: ${detailPO.nama_customer}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-weight: bold; color: #A47352;">Status Pembayaran</td>
                    <td>: <span style="background-color: ${detailPO.status_pembayaran === 'lunas' ? '#10B981' : '#FFAA00'}; color: white; padding: 2px 6px; font-size: 11px; font-weight: bold; border-radius: 4px; text-transform: uppercase;">${detailPO.status_pembayaran}</span></td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-weight: bold; color: #A47352;">Total Tagihan</td>
                    <td style="font-weight: bold; color: #8B5E3C;">: Rp ${Number(detailPO.total_harga).toLocaleString('id-ID')},00</td>
                  </tr>
                </table>

                <h3 style="color: #8B5E3C; margin-top: 20px; margin-bottom: 10px; font-size: 15px;">Daftar Item yang Selesai:</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 15px;">
                  <thead>
                    <tr style="background-color: #A47352; color: white;">
                      <th style="padding: 8px; border: 1px solid #DDB892;">No</th>
                      <th style="padding: 8px; border: 1px solid #DDB892;">Lebar Kain</th>
                      <th style="padding: 8px; border: 1px solid #DDB892;">Panjang</th>
                      <th style="padding: 8px; border: 1px solid #DDB892;">Jumlah Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemRowsHtml}
                  </tbody>
                </table>

                ${detailPO.status_pembayaran !== 'lunas' ? `
                  <div style="margin-top: 20px; background-color: #FFF3CD; border-left: 4px solid #FFAA00; padding: 12px; border-radius: 4px; color: #856404; font-size: 13px; font-weight: bold;">
                    ⚠️ Perhatian CS: Status pembayaran pelanggan saat ini masih DP. Mohon segera hubungi pelanggan untuk proses PELUNASAN sebelum barang diserahkan atau dikirim.
                  </div>
                ` : `
                  <div style="margin-top: 20px; background-color: #D1E7DD; border-left: 4px solid #10B981; padding: 12px; border-radius: 4px; color: #0F5132; font-size: 13px; font-weight: bold;">
                    🎉 Info CS: Pembayaran sudah LUNAS. Barang dapat langsung diserahkan kepada pelanggan atau diserahkan ke bagian ekspedisi pengiriman.
                  </div>
                `}

                <div style="margin-top: 25px; text-align: center;">
                  <a href="https://dibiyo-lurik.vercel.app/dashboard/cs/po/custom" 
                     target="_blank" 
                     style="background-color: #10B981; color: white; padding: 10px 20px; font-size: 13px; font-weight: bold; text-decoration: none; border-radius: 6px; display: inline-block;">
                    Buka Dashboard CS Pre-Order ↗
                  </a>
                </div>
              </div>
            `;

            await transporter.sendMail({
              from: `"Dibiyo Lurik Produksi" <${process.env.SMTP_USER}>`,
              to: process.env.EMAIL_CUSTOMER_SERVICE, 
              subject: `[PRODUKSI SELESAI] PO Custom - POC-${detailPO.id} (${detailPO.nama_customer})`,
              html: emailHtmlContent,
            });

            console.log("[BACKGROUND-EMAIL-PATCH] Email produksi selesai sukses terkirim ke CS!");
          } catch (emailErr) {
            console.error("[BACKGROUND-EMAIL-ERROR] Gagal memproses background email patch:", emailErr);
          }
        })();
      }
    }

    // =========================================================================
    // RESPONS INSTAN: KEPALA PRODUKSI TIDAK PERLU MENUNGGU PROSES EMAIL SELESAI
    // =========================================================================
    return NextResponse.json({ message: 'Status updated successfully', data });
    
  } catch (err) {
    console.error("💥 [PATCH-CRASH]:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}