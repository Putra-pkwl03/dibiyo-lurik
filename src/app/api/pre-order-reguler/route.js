import { NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabase-admin';
import nodemailer from 'nodemailer'; 
import { realtime } from '@/lib/realtime';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

function localCalculateItemSubtotal(panjang, jumlah, hargaPerMeter) {
  return Number(panjang || 0) * Number(jumlah || 0) * Number(hargaPerMeter || 0);
}

async function localLookupHargaPerMeter(jenisPewarna, motifId, lebar) {
  // 1. Coba cari harga spesifik motif
  if (motifId) {
    const { data: hargaMotif } = await supabaseAdmin
      .from('daftar_harga')
      .select('harga_per_meter')
      .eq('jenis_pewarna', jenisPewarna)
      .eq('motif_id', motifId)
      .eq('lebar', Number(lebar))
      .maybeSingle();
      
    if (hargaMotif) return Number(hargaMotif.harga_per_meter);
  }

  // 2. Jika tidak ada harga motif (atau motifId null), cari harga standar (motif_id = NULL)
  const { data: hargaGeneral } = await supabaseAdmin
    .from('daftar_harga')
    .select('harga_per_meter')
    .eq('jenis_pewarna', jenisPewarna)
    .is('motif_id', null)
    .eq('lebar', Number(lebar))
    .maybeSingle();

  return hargaGeneral ? Number(hargaGeneral.harga_per_meter) : 0;
}

async function localRecalculateTotalPOR(poId) {
  const { data: items } = await supabaseAdmin
    .from('item_pre_order_reguler')
    .select('subtotal')
    .eq('pre_order_reguler_id', poId);

  const sumItems = (items || []).reduce((acc, curr) => acc + Number(curr.subtotal || 0), 0);

  const { data: header } = await supabaseAdmin
    .from('pre_order_reguler')
    .select('diskon')
    .eq('id', poId)
    .single();

  const diskon = header ? Number(header.diskon || 0) : 0;
  const totalHarga = Math.max(0, sumItems - (sumItems * (diskon / 100)));

  await supabaseAdmin
    .from('pre_order_reguler')
    .update({ total_harga: totalHarga })
    .eq('id', poId);
}

// =====================================================
// GET - list PO reguler (Dengan Kolom jenis_pewarna)
// =====================================================
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const offset = (page - 1) * limit;
  const filterStatus = searchParams.get('status');
  const filterPembayaran = searchParams.get('status_pembayaran');
  const filterPenerimaan = searchParams.get('status_penerimaan') || 'belum_diambil';

  let query = supabaseAdmin
    .from('pre_order_reguler')
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
      items:item_pre_order_reguler(
        id,
        jumlah,
        panjang,
        lebar,
        harga_per_meter,
        subtotal,
        jenis_pewarna,
        produk:produk(
          id,
          gambar_url,
          kode_produk
        )
      )
    `, { count: 'exact' });

  query = query.eq('status_penerimaan', filterPenerimaan);

  if (filterStatus) query = query.eq('status', filterStatus);
  if (filterPembayaran) query = query.eq('status_pembayaran', filterPembayaran);

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, meta: { total: count, page, limit } });
}

// =====================================================
// POST - create PO reguler (Menyimpan jenis_pewarna ke Item)
// =====================================================
export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: 'Items wajib diisi' }, { status: 400 });
    }

    const { data: poHeader, error: headerErr } = await supabaseAdmin
      .from('pre_order_reguler')
      .insert({
        nama_customer: body.nama_customer?.trim(),
        kontak_customer: body.kontak_customer || null,
        alamat_customer: body.alamat_customer || null,
        tanggal_selesai: body.tanggal_selesai || null,
        metode_pembayaran: body.metode_pembayaran,
        status_pembayaran: body.status_pembayaran,
        total_dp: Number(body.total_dp || 0),
        diskon: Number(body.diskon || 0),
        // catatan: body.catatan || null,
        total_harga: 0, 
        status: 'dalam_proses',
        status_penerimaan: 'belum_diambil',
      })
      .select()
      .single();

    if (headerErr) throw new Error(headerErr.message);

    const itemsToInsert = [];
    const emailItemsDetails = []; 

    for (const item of body.items) {
      const { data: produk } = await supabaseAdmin
        .from('produk')
        .select('id, jenis_pewarna, motif_id, kode_produk, gambar_url')
        .eq('id', item.produk_id)
        .maybeSingle();

      if (!produk) throw new Error(`Produk tidak ditemukan: ${item.produk_id}`);

      const hargaPerMeter = await localLookupHargaPerMeter(produk.jenis_pewarna, produk.motif_id, item.lebar);
      
      if (hargaPerMeter === 0) throw new Error(`Harga untuk ${produk.jenis_pewarna} ${item.lebar}cm belum diset`);

      const subtotalItem = localCalculateItemSubtotal(item.panjang, item.jumlah, hargaPerMeter);

      itemsToInsert.push({
        pre_order_reguler_id: poHeader.id,
        produk_id: item.produk_id,
        lebar: item.lebar,
        panjang: Number(item.panjang),
        jumlah: Number(item.jumlah),
        harga_per_meter: hargaPerMeter,
        subtotal: subtotalItem,
        jenis_pewarna: produk.jenis_pewarna // Simpan jenis_pewarna di sini
      });

      emailItemsDetails.push({
        kode_produk: produk.kode_produk || 'N/A',
        gambar_url: produk.gambar_url || null,
        lebar: item.lebar,
        panjang: item.panjang,
        jumlah: item.jumlah
      });
    }

    const { error: itemsErr } = await supabaseAdmin
      .from('item_pre_order_reguler')
      .insert(itemsToInsert);

    if (itemsErr) {
      await supabaseAdmin.from('pre_order_reguler').delete().eq('id', poHeader.id);
      throw new Error(itemsErr.message);
    }

    await localRecalculateTotalPOR(poHeader.id);

    const { data: poComplete } = await supabaseAdmin
      .from('pre_order_reguler')
      .select(`*`)
      .eq('id', poHeader.id)
      .single();

    try {
      await supabaseAdmin
        .from('notifikasi_sistem')
        .insert({
          penerima_role: 'kp',
          tipe_order: 'POR',
          id_order: poComplete.id.toString(),
          judul: 'Pesanan Reguler Baru',
          pesan: `Ada pesanan Reguler baru dari ${poComplete.nama_customer} (Estimasi: ${poComplete.tanggal_selesai || '-'}).`,
          status_dibaca: false
        });
    } catch (dbNotifErr) {
      console.error("⚠️ [DATABASE-NOTIFIKASI-ERROR]:", dbNotifErr);
    }

    realtime.emit("notification.created", {
      id_order: poComplete.id.toString(),
      tipe: "POR", 
      nama_customer: poComplete.nama_customer,
      pesan: `Ada pesanan Reguler baru dari ${poComplete.nama_customer} (Estimasi: ${poComplete.tanggal_selesai || '-'})`,
      waktu: new Date().toISOString()
    }).catch(realtimeErr => {
      console.error("⚠️ [BACKGROUND-REALTIME-ERROR]", realtimeErr);
    });

    (async () => {
      try {
        const daftarItemHtml = emailItemsDetails.map((item, index) => `
          <tr>
            <td style="padding: 10px; border: 1px solid #DDB892; text-align: center; color: #555;">${index + 1}</td>
            <td style="padding: 10px; border: 1px solid #DDB892; text-align: center; font-weight: bold; color: #1A335A;">${item.kode_produk}</td>
            <td style="padding: 10px; border: 1px solid #DDB892; text-align: center; color: #8B5E3C; font-weight: bold;">${item.lebar} cm</td>
            <td style="padding: 10px; border: 1px solid #DDB892; text-align: center; color: #555;">${item.panjang} m</td>
            <td style="padding: 10px; border: 1px solid #DDB892; text-align: center; font-weight: bold; color: #333;">${item.jumlah} Pcs</td>
          </tr>
        `).join('');

        const emailHtmlContent = `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; max-width: 650px; margin: 0 auto; border: 1px solid #1A335A; padding: 24px; border-radius: 12px; background-color: #f7f9fc;">
            <h2 style="color: #1A335A; border-bottom: 2px solid #1A335A; padding-bottom: 12px; margin-top: 0; font-size: 20px;">
              📢 Notifikasi Pre-Order Reguler Baru (#POR-${poComplete.id.substring(0, 8)}...)
            </h2>
            <p style="font-size: 14px; line-height: 1.5; color: #555;">
              Halo Kepala Produksi, terdapat pesanan kain bertipe <b>Reguler (Katalog Standar)</b> baru yang telah divalidasi oleh Customer Service. Mohon siapkan kebutuhan logistik bahan baku kain terkait.
            </p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
              <tr>
                <td style="width: 160px; padding: 8px 0; font-weight: bold; color: #1A335A;">Nama Pelanggan</td>
                <td style="color: #333;">: ${poComplete.nama_customer}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #1A335A;">Status Pembayaran</td>
                <td>: <span style="background-color: ${poComplete.status_pembayaran === 'lunas' ? '#10B981' : '#FFAA00'}; color: white; padding: 3px 8px; font-size: 11px; font-weight: bold; border-radius: 4px; text-transform: uppercase;">${poComplete.status_pembayaran}</span></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #1A335A;">Target Penyelesaian</td>
                <td>: <span style="color: #EF4444; font-weight: bold;">${poComplete.tanggal_selesai || '-'}</span></td>
              </tr>
            </table>
            <h3>Rincian Item Katalog yang Harus Diproses:</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
              <thead>
                <tr style="background-color: #1A335A; color: white;">
                  <th style="padding: 10px; border: 1px solid #DDB892;">No</th>
                  <th style="padding: 10px; border: 1px solid #DDB892;">Kode Produk</th>
                  <th style="padding: 10px; border: 1px solid #DDB892;">Lebar</th>
                  <th style="padding: 10px; border: 1px solid #DDB892;">Panjang</th>
                  <th style="padding: 10px; border: 1px solid #DDB892;">Qty</th>
                </tr>
              </thead>
              <tbody>
                ${daftarItemHtml}
              </tbody>
            </table>
            <div style="margin-top: 20px; background-color: #EBF3FF; padding: 12px; border-left: 4px solid #1A335A; border-radius: 4px; font-size: 13px;">
              <b style="color: #1A335A;">Memo Tambahan CS:</b><br/>
              <span style="color: #555; font-style: italic;">${poComplete.catatan || 'Tidak ada instruksi khusus.'}</span>
            </div>
          </div>
        `;

        await transporter.sendMail({
          from: `"Dibiyo Lurik Notifikasi" <${process.env.SMTP_USER}>`,
          to: process.env.EMAIL_KEPALA_PRODUKSI,
          subject: `🚨 [PRODUKSI REGULER] PO Baru - POR-${poComplete.id.substring(0,8)} (${poComplete.nama_customer})`,
          html: emailHtmlContent,
        });
      } catch (emailErr) {
        console.error("⚠️ [BACKGROUND-EMAIL-ERROR]", emailErr);
      }
    })();

    return NextResponse.json({ 
      message: 'Pre-Order Reguler berhasil dibuat', 
      data: poComplete 
    }, { status: 201 });

  } catch (err) {
    console.error("💥 [POST POR ERROR]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) return NextResponse.json({ error: 'ID Pesanan wajib disertakan' }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from('pre_order_reguler')
      .update({ 
        status_penerimaan: 'sudah_diambil',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, message: 'Status penerimaan barang berhasil dikonfirmasi', data }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}