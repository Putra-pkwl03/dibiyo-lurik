import { NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabase-admin';

// =====================================================
// GET - Detail Pre-Order Custom (POC) Beserta Items
// =====================================================
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ message: 'ID wajib diisi' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
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
        updated_at,
        item_pre_order_custom (
          id,
          lebar,
          jenis_pewarna,
          panjang,
          jumlah,
          harga_per_meter,
          subtotal,
          gambar_custom
        )
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ message: 'Pre-Order Custom tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ data }, { status: 200 });

  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

// =====================================================
// PATCH - Update Field Umum & Sinkronisasi Items POC
// =====================================================
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ message: 'ID wajib diisi' }, { status: 400 });
    }

    const body = await request.json();
    
    // 1. Ekstrak data untuk tabel induk (STATUS DIHAPUS DARI CONTROL CS)
    const allowedFields = [
      'nama_customer', 
      'kontak_customer', 
      'alamat_customer', 
      'tanggal_selesai', 
      'metode_pembayaran', 
      'status_pembayaran', 
      // 'status', <-- Dihapus total agar status produksi tidak ter-overwrite secara sengaja/tidak sengaja
      'total_dp', 
      'diskon', 
      'total_harga', 
      'catatan'
    ];

    const updateData = {};
    
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        if (key === 'nama_customer' && typeof body[key] === 'string') {
          updateData[key] = body[key].trim();
        } else if (['metode_pembayaran', 'status_pembayaran'].includes(key) && body[key] !== null) {
          updateData[key] = body[key].toString().toLowerCase();
        } else if (['total_dp', 'diskon', 'total_harga'].includes(key)) {
          updateData[key] = Number(body[key] || 0);
        } else {
          updateData[key] = body[key];
        }
      }
    }

    updateData.updated_at = new Date().toISOString();

    // Jalankan update data induk
    const { error: poError } = await supabaseAdmin
      .from('pre_order_custom')
      .update(updateData)
      .eq('id', id);

    if (poError) throw poError;

    // 2. PROSES SINKRONISASI ITEMS
    if (body.items && Array.isArray(body.items)) {
      
      const { data: currentDbItems, error: fetchItemsError } = await supabaseAdmin
        .from('item_pre_order_custom')
        .select('id')
        .eq('pre_order_custom_id', id);

      if (fetchItemsError) throw fetchItemsError;

      // Filter Item terhapus
      const incomingIds = body.items.filter(i => i.id).map(i => i.id);
      const idsToDelete = currentDbItems
        .filter(dbItem => !incomingIds.includes(dbItem.id))
        .map(dbItem => dbItem.id);

      if (idsToDelete.length > 0) {
        const { error: deleteError } = await supabaseAdmin
          .from('item_pre_order_custom')
          .delete()
          .in('id', idsToDelete);
          
        if (deleteError) throw deleteError;
      }

      // Pisahkan Data Baru (Insert) & Data Lama (Update) untuk menjamin struktur key JSON seragam
      const itemsToInsert = [];
      const itemsToUpdate = [];

      body.items.forEach(item => {
        const payload = {
          pre_order_custom_id: id,
          lebar: Number(item.lebar),
          jenis_pewarna: item.jenis_pewarna || null,
          panjang: Number(item.panjang),
          jumlah: Number(item.jumlah),
          harga_per_meter: Number(item.harga_per_meter),
          subtotal: Number(item.subtotal),
          gambar_custom: item.gambar_custom || null,
        };

        if (item.id) {
          payload.id = item.id;
          itemsToUpdate.push(payload);
        } else {
          itemsToInsert.push(payload);
        }
      });

      // Eksekusi Insert untuk item-item baru
      if (itemsToInsert.length > 0) {
        const { error: insertError } = await supabaseAdmin
          .from('item_pre_order_custom')
          .insert(itemsToInsert);

        if (insertError) throw insertError;
      }

      // Eksekusi Upsert untuk meng-update item-item lama yang diubah
      if (itemsToUpdate.length > 0) {
        const { error: upsertError } = await supabaseAdmin
          .from('item_pre_order_custom')
          .upsert(itemsToUpdate);

        if (upsertError) throw upsertError;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Pre-Order Custom beserta item spesifikasinya berhasil diperbarui', 
    }, { status: 200 });

  } catch (err) {
    return NextResponse.json({ message: 'Gagal update: ' + err.message }, { status: 500 });
  }
}

// =====================================================
// DELETE - Hapus Data Pre-Order Custom Beserta Items-nya
// =====================================================
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ message: 'ID wajib diisi' }, { status: 400 });
    }

    const { error: itemsError } = await supabaseAdmin
      .from('item_pre_order_custom')
      .delete()
      .eq('pre_order_custom_id', id);

    if (itemsError) throw itemsError;

    const { error: poError } = await supabaseAdmin
      .from('pre_order_custom')
      .delete()
      .eq('id', id);

    if (poError) throw poError;

    return NextResponse.json({ 
      success: true, 
      message: 'Pre-Order Custom beserta seluruh item spesifikasinya berhasil dihapus' 
    }, { status: 200 });

  } catch (err) {
    return NextResponse.json({ message: 'Gagal hapus: ' + err.message }, { status: 500 });
  }
}