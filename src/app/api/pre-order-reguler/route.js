import { NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabase-admin';
import { realtime } from '@/lib/realtime';

// =====================================================
// HELPER LOKAL (Pengganti @/lib/preorder-helper)
// =====================================================

// 1. Menghitung subtotal per item (panjang * jumlah * harga_per_meter)
function localCalculateItemSubtotal(panjang, jumlah, hargaPerMeter) {
  return Number(panjang || 0) * Number(jumlah || 0) * Number(hargaPerMeter || 0);
}

// 2. TENTUKAN HARGA BERDASARKAN JENIS PEWARNA, MOTIF_ID, DAN LEBAR
async function localLookupHargaPerMeter(jenisPewarna, motifId, lebar) {
  const { data: hargaData, error } = await supabaseAdmin
    .from('daftar_harga') 
    .select('harga_per_meter')
    .eq('jenis_pewarna', jenisPewarna)
    .eq('motif_id', motifId) 
    .eq('lebar', Number(lebar))
    .maybeSingle();

  if (error) {
    console.error("Error saat lookup daftar_harga:", error.message);
  }

  return hargaData ? Number(hargaData.harga_per_meter) : 0;
}

// 3. Menghitung ulang total harga header berdasarkan semua item_pre_order_reguler
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
// GET - list PO reguler (Fleksibel untuk Antrean & Riwayat)
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
      created_at,
      items:item_pre_order_reguler(
        id,
        jumlah,
        panjang,
        lebar,
        harga_per_meter,
        subtotal,
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
// POST - create PO reguler (Dengan Notifikasi Realtime)
// =====================================================
export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: 'Items wajib diisi' }, { status: 400 });
    }

    // 1. Insert header PO
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
        catatan: body.catatan || null,
        total_harga: 0,
        status: 'dalam_proses',
        status_penerimaan: 'belum_diambil',
      })
      .select()
      .single();

    if (headerErr) throw new Error(headerErr.message);

    // 2. Process items
    const itemsToInsert = [];
    for (const item of body.items) {
      const { data: produk } = await supabaseAdmin
        .from('produk')
        .select('id, jenis_pewarna, motif_id')
        .eq('id', item.produk_id)
        .maybeSingle();

      if (!produk) throw new Error(`Produk tidak ditemukan: ${item.produk_id}`);

      const hargaPerMeter = await localLookupHargaPerMeter(produk.jenis_pewarna, produk.motif_id, item.lebar);
      
      if (hargaPerMeter === 0) throw new Error(`Harga untuk ${produk.jenis_pewarna} ${item.lebar}cm belum diset`);

      itemsToInsert.push({
        pre_order_reguler_id: poHeader.id,
        produk_id: item.produk_id,
        lebar: item.lebar,
        panjang: Number(item.panjang),
        jumlah: Number(item.jumlah),
        harga_per_meter: hargaPerMeter,
        subtotal: localCalculateItemSubtotal(item.panjang, item.jumlah, hargaPerMeter),
      });
    }

    const { error: itemsErr } = await supabaseAdmin
      .from('item_pre_order_reguler')
      .insert(itemsToInsert);

    if (itemsErr) throw new Error(itemsErr.message);

    // 3. Recalculate & Finalize menggunakan helper lokal
    await localRecalculateTotalPOR(poHeader.id);

    const { data: poComplete } = await supabaseAdmin
      .from('pre_order_reguler')
      .select(`*, items:item_pre_order_reguler(*)`)
      .eq('id', poHeader.id)
      .single();

    // =====================================================
    // TRIGGER UPSTASH REALTIME NOTIFICATION FOR KP
    // =====================================================
    try {
      console.log("🚀 [REALTIME] Mengirim sinyal notifikasi ke Kepala Produksi...");

      await realtime.emit("notification.created", {
        id_order: String(poComplete?.id),
        tipe: "POR", // Tetap POR agar di sidebar dibaca sebagai reguler
        nama_customer: poComplete?.nama_customer || 'Pelanggan',
        pesan: `Pesanan Pre Order Reguler baru atas nama ${poComplete?.nama_customer || 'Pelanggan'} telah dibuat.`,
        waktu: new Date().toISOString()
      });

      console.log("✅ [REALTIME] Sinyal notifikasi berhasil dipancarkan!");
    } catch (realtimeErr) {
      console.error("⚠️ [REALTIME-ERROR] Gagal memancarkan notifikasi:", realtimeErr);
    }
    // =====================================================

    return NextResponse.json({ data: poComplete }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// =====================================================
// PATCH - Konfirmasi Penerimaan Barang oleh Customer
// =====================================================
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID Pesanan wajib disertakan' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('pre_order_reguler')
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
      message: 'Status penerimaan barang berhasil dikonfirmasi', 
      data 
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}