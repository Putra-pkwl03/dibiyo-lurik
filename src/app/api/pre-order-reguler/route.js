import { NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabase-admin';

// =====================================================
// HELPER LOKAL (Pengganti @/lib/preorder-helper)
// =====================================================

// 1. Menghitung subtotal per item (panjang * jumlah * harga_per_meter)
function localCalculateItemSubtotal(panjang, jumlah, hargaPerMeter) {
  return Number(panjang || 0) * Number(jumlah || 0) * Number(hargaPerMeter || 0);
}

// 2. Mencari harga per meter berdasarkan jenis pewarna, motif, dan lebar data
async function localLookupHargaPerMeter(jenisPewarna, motifId, lebar) {
  const { data: hargaData } = await supabaseAdmin
    .from('master_harga_reguler')
    .select('harga_per_meter')
    .eq('jenis_pewarna', jenisPewarna)
    .eq('motif_id', motifId)
    .eq('lebar', lebar)
    .maybeSingle();

  return hargaData ? Number(hargaData.harga_per_meter) : 0;
}

// 3. Menghitung ulang total harga header berdasarkan semua item_pre_order_reguler
async function localRecalculateTotalPOR(poId) {
  // Ambil semua item terkait
  const { data: items } = await supabaseAdmin
    .from('item_pre_order_reguler')
    .select('subtotal')
    .eq('pre_order_reguler_id', poId);

  // Hitung total item
  const sumItems = (items || []).reduce((acc, curr) => acc + Number(curr.subtotal || 0), 0);

  // Ambil data diskon dari header
  const { data: header } = await supabaseAdmin
    .from('pre_order_reguler')
    .select('diskon')
    .eq('id', poId)
    .single();

  const diskon = header ? Number(header.diskon || 0) : 0;
  const totalHarga = Math.max(0, sumItems - diskon);

  // Update kembali header-nya
  await supabaseAdmin
    .from('pre_order_reguler')
    .update({ total_harga: totalHarga })
    .eq('id', poId);
}


// =====================================================
// GET - list PO reguler (Tanpa nomor_po dan created_by)
// =====================================================
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const offset = (page - 1) * limit;
  const filterStatus = searchParams.get('status');
  const filterPembayaran = searchParams.get('status_pembayaran');

  let query = supabaseAdmin
    .from('pre_order_reguler')
    .select(`
      id, nama_customer, kontak_customer, tanggal_selesai, status, 
      metode_pembayaran, status_pembayaran, total_dp, diskon, total_harga, 
      created_at
    `, { count: 'exact' });

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
// POST - create PO reguler (Tanpa Auth)
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

      // Menggunakan helper lokal
      const hargaPerMeter = await localLookupHargaPerMeter(produk.jenis_pewarna, produk.motif_id, item.lebar);
      
      if (hargaPerMeter === 0) throw new Error(`Harga untuk ${produk.jenis_pewarna} ${item.lebar}cm belum diset`);

      itemsToInsert.push({
        pre_order_reguler_id: poHeader.id,
        produk_id: item.produk_id,
        lebar: item.lebar,
        panjang: Number(item.panjang),
        jumlah: Number(item.jumlah),
        harga_per_meter: hargaPerMeter,
        subtotal: localCalculateItemSubtotal(item.panjang, item.jumlah, hargaPerMeter), // Menggunakan helper lokal
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

    return NextResponse.json({ data: poComplete }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}