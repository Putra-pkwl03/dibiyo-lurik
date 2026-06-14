import { NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabase-admin';

function localCalculateItemSubtotal(panjang, jumlah, hargaPerMeter) {
  return Number(panjang || 0) * Number(jumlah || 0) * Number(hargaPerMeter || 0);
}

async function localLookupHargaPerMeter(jenisPewarna, motifId, lebar) {
  const { data: hargaData } = await supabaseAdmin
    .from('daftar_harga')
    .select('harga_per_meter')
    .eq('jenis_pewarna', jenisPewarna)
    .eq('motif_id', motifId)
    .eq('lebar', Number(lebar))
    .maybeSingle();

  return hargaData ? Number(hargaData.harga_per_meter) : 0;
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
// GET - Ambil Detail Single Pre-Order Reguler Berdasarkan ID
// =====================================================
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ message: 'ID wajib diisi' }, { status: 400 });

    const { data, error } = await supabaseAdmin
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
        status_pengambilan,
        total_dp, 
        diskon, 
        total_harga, 
        catatan,
        created_at,
        updated_at,
        items:item_pre_order_reguler(
          id,
          jumlah,
          panjang,
          lebar,
          harga_per_meter,
          subtotal,
          jenis_pewarna,
          produk_id,
          produk:produk(
            id,
            gambar_url,
            kode_produk
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ message: 'Data Pre-Order Reguler tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ message: 'ID wajib diisi' }, { status: 400 });

    const body = await request.json();

    if (!body.customer) {
      return NextResponse.json({ message: 'Data customer tidak ditemukan dalam payload' }, { status: 400 });
    }

    // 1. Update data induk Pre-Order Reguler (Termasuk Logika Finansial & DP Baru)
    const updateData = {
      nama_customer: body.customer.nama ? body.customer.nama.trim() : null,
      kontak_customer: body.customer.telpon || null,
      alamat_customer: body.customer.alamat ? body.customer.alamat.trim() : null,
      status: body.status || 'dalam_proses',
      status_pembayaran: body.status_pembayaran || 'dp',
      metode_pembayaran: body.metode_pembayaran || 'cash',
      diskon: Number(body.diskon || 0),
      total_dp: Number(body.total_dp || 0),        // Menyimpan total_dp baru dari client
      total_harga: Number(body.total_harga || 0),  // Menyimpan total_harga baru setelah diskon
      tanggal_selesai: body.tanggal_selesai || null,
      catatan: body.catatan || null,
      updated_at: new Date().toISOString()
    };

    const { error: poError } = await supabaseAdmin
      .from('pre_order_reguler')
      .update(updateData)
      .eq('id', id);

    if (poError) throw poError;

    // 2. PROSES SINKRONISASI ITEMS POR (Hanya Edit / Hapus)
    if (body.items && Array.isArray(body.items)) {
      
      const { data: currentDbItems, error: fetchItemsError } = await supabaseAdmin
        .from('item_pre_order_reguler')
        .select('id')
        .eq('pre_order_reguler_id', id);

      if (fetchItemsError) throw fetchItemsError;

      const currentDbIds = currentDbItems.map(dbItem => dbItem.id);
      const incomingIds = body.items.filter(i => i.id && currentDbIds.includes(i.id)).map(i => i.id);
      
      // Filter item yang sengaja dihapus lewat UI (jika ada)
      const idsToDelete = currentDbItems
        .filter(dbItem => !incomingIds.includes(dbItem.id))
        .map(dbItem => dbItem.id);

      if (idsToDelete.length > 0) {
        const { error: deleteError } = await supabaseAdmin
          .from('item_pre_order_reguler')
          .delete()
          .in('id', idsToDelete);

        if (deleteError) throw deleteError;
      }

      const itemsToUpdate = [];

      for (const item of body.items) {
        const currentProdukId = item.produk_id || item.produk?.id || item.id_produk;

        if (!currentProdukId) {
          throw new Error(`ID Produk tidak valid atau tidak ditemukan pada baris transaksi.`);
        }

        const qty = Number(item.jumlah || item.qty || 1);
        const panjang = Number(item.panjang || 0);
        const hargaPerMeter = Number(item.harga_per_meter || item.harga || 0);
        const subtotalItem = Number(item.subtotal || (panjang * qty * hargaPerMeter));

        const payload = {
          id: item.id, // Pastikan ID baris lama ikut dikirim untuk memicu update
          pre_order_reguler_id: id,
          produk_id: currentProdukId,
          lebar: item.lebar ? Number(item.lebar) : null,
          panjang: panjang,
          jumlah: qty,
          harga_per_meter: hargaPerMeter,
          subtotal: subtotalItem,
          jenis_pewarna: item.jenis_pewarna || null
        };

        if (item.id) {
          itemsToUpdate.push(payload);
        }
      }

      // Lakukan Upsert massal hanya untuk data item yang diperbarui harganya/panjangnya
      if (itemsToUpdate.length > 0) {
        const { error: upsertError } = await supabaseAdmin
          .from('item_pre_order_reguler')
          .upsert(itemsToUpdate);

        if (upsertError) throw upsertError;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Pre-Order Reguler berhasil diperbarui' 
    }, { status: 200 });

  } catch (err) {
    return NextResponse.json({ message: 'Gagal update: ' + err.message }, { status: 500 });
  }
}

// =====================================================
// DELETE - Hapus Data Pre-Order Reguler Beserta Items-nya
// =====================================================
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ message: 'ID wajib diisi' }, { status: 400 });

    // Hapus item-item terlebih dahulu demi konsistensi data sebelum menghapus record induk
    const { error: itemsError } = await supabaseAdmin
      .from('item_pre_order_reguler')
      .delete()
      .eq('pre_order_reguler_id', id);

    if (itemsError) throw itemsError;

    const { error: poError } = await supabaseAdmin
      .from('pre_order_reguler')
      .delete()
      .eq('id', id);

    if (poError) throw poError;

    return NextResponse.json({ 
      success: true, 
      message: 'Pre-Order Reguler beserta seluruh item spesifikasinya berhasil dihapus' 
    }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: 'Gagal hapus: ' + err.message }, { status: 500 });
  }
}