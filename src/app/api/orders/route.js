import { NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabase-admin';

// Fungsi helper untuk generate nomor order unik (Contoh format: ORD-20260525-XXXXX)
const generateNomorOrder = () => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = Math.floor(10000 + Math.random() * 90000); 
  return `ORD-${dateStr}-${randomStr}`;
};

// =====================================================
// GET - list orders (BERSIH DARI KOMENTAR)
// =====================================================
export const GET = async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const filterMetode = searchParams.get('metode_pembayaran');
    
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('orders')
      .select(`
        id, 
        nomor_order, 
        tanggal_order, 
        metode_pembayaran, 
        diskon, 
        total_harga,
        items:item_order (
          jumlah_order, 
          subtotal,
          harga_per_meter,
          gulungan:gulungan_id (
            lebar, 
            produk:produk_id (
              kode_produk,  
              gambar_url, 
              kategori:kategori_id ( nama ),
              motif:motif_id ( nama )
            )
          )
        ),
        created_at
      `, { count: 'exact' });

    if (filterMetode) query = query.eq('metode_pembayaran', filterMetode);

    const { data, error, count } = await query
      .order('tanggal_order', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({ 
      data, 
      meta: { total: count, page, limit } 
    }, { status: 200 });
  } catch (err) {
    console.error("=== API ORDERS GET ERROR ===", err);
    return NextResponse.json({ message: 'Gagal memuat orders: ' + err.message }, { status: 500 });
  }
};


// =====================================================
// POST - checkout (multi-item) + SINKRONISASI STOK & HAPUS CART
// =====================================================
export const POST = async (request) => {
  try {
    const body = await request.json();
    const { metode_pembayaran, diskon, items } = body;

    // 1. Validasi Input Manual
    if (!metode_pembayaran || !['cash', 'transfer'].includes(metode_pembayaran)) {
      return NextResponse.json({ message: 'Metode pembayaran tidak valid' }, { status: 400 });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ message: 'Items tidak boleh kosong' }, { status: 400 });
    }

    // 2. Validasi Gulungan & Ambil Data dari DB
    const gulunganIds = items.map((i) => i.gulungan_id);
    const { data: gulunganList, error: glErr } = await supabaseAdmin
      .from('gulungan')
      .select('id, panjang_sisa, harga_per_meter, is_active, produk_id')
      .in('id', gulunganIds);

    if (glErr) throw glErr;
    if (!gulunganList || gulunganList.length !== items.length) {
      return NextResponse.json({ message: 'Salah satu gulungan tidak ditemukan di database' }, { status: 404 });
    }

    const gulunganMap = {};
    for (const g of gulunganList) gulunganMap[g.id] = g;

    let totalSubtotal = 0;
    const itemsToInsert = [];
    const updatesStokQueue = []; 

    for (const item of items) {
      const g = gulunganMap[item.gulungan_id];
      if (!g.is_active) {
        return NextResponse.json({ message: `Gulungan dengan ID ${item.gulungan_id} sedang tidak aktif` }, { status: 400 });
      }

      const jumlahOrder = Number(item.jumlah_order); 
      const panjangSisaDb = Number(g.panjang_sisa);

      if (jumlahOrder > panjangSisaDb) {
        return NextResponse.json({ 
          message: `Stok kain gulungan tidak cukup! Sisa: ${panjangSisaDb}m, Request: ${jumlahOrder}m.` 
        }, { status: 400 });
      }

      const subtotal = jumlahOrder * Number(g.harga_per_meter);
      totalSubtotal += subtotal;

      // Masukkan ke array persiapan insert `item_order`
      itemsToInsert.push({ 
        gulungan_id: item.gulungan_id, 
        jumlah_order: jumlahOrder, 
        harga_per_meter: g.harga_per_meter, 
        subtotal 
      });

      // Simpan data kalkulasi untuk eksekusi update stok
      updatesStokQueue.push({
        gulungan_id: g.id,
        produk_id: g.produk_id,
        panjang_baru: panjangSisaDb - jumlahOrder,
        tambahan_terjual: jumlahOrder
      });
    }

    // 3. Insert Header Order
    const totalHarga = totalSubtotal * (1 - (Number(diskon || 0) / 100));
    const uniqueNomorOrder = generateNomorOrder();

    const { data: order, error: orderErr } = await supabaseAdmin
      .from('orders')
      .insert({ 
        nomor_order: uniqueNomorOrder, 
        metode_pembayaran, 
        diskon, 
        total_harga: totalHarga 
      })
      .select()
      .single();

    if (orderErr) throw orderErr;

    // 4. Insert Detail Items Ke Tabel `item_order`
    const { error: itemsErr } = await supabaseAdmin
      .from('item_order')
      .insert(itemsToInsert.map(i => ({ ...i, order_id: order.id })));

    if (itemsErr) {
      await supabaseAdmin.from('orders').delete().eq('id', order.id);
      throw itemsErr;
    }

    // 5. EKSEKUSI UPDATE REALTIME: Potong Stok Gulungan & Tambah Terjual Produk
    for (const update of updatesStokQueue) {
      const { error: errG } = await supabaseAdmin
        .from('gulungan')
        .update({ panjang_sisa: update.panjang_baru, updated_at: new Date().toISOString() })
        .eq('id', update.gulungan_id);
      
      if (errG) throw errG;

      const { data: pData, error: errFetchP } = await supabaseAdmin
        .from('produk')
        .select('terjual')
        .eq('id', update.produk_id)
        .single();
        
      if (errFetchP) throw errFetchP;

      const terjualSaatIni = Number(pData.terjual || 0);
      const { error: errP } = await supabaseAdmin
        .from('produk')
        .update({ 
          terjual: terjualSaatIni + update.tambahan_terjual, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', update.produk_id);

      if (errP) throw errP;
    }

    // =====================================================
    // 6. AKSI UTAMA: Bersihkan Data Item dari Tabel 'cart'
    // =====================================================
    const cartIdsToDelete = items.map(i => i.cart_id).filter(id => id);
    
    if (cartIdsToDelete.length > 0) {
      const { error: cartDeleteErr } = await supabaseAdmin
        .from('cart') // Memastikan nama tabel sinkron dengan DB ('cart')
        .delete()
        .in('id', cartIdsToDelete);

      if (cartDeleteErr) {
        console.error("=== GAGAL MENGHAPUS DATA CART DI BACKEND ===", cartDeleteErr);
        // Kita tidak throw error di sini agar transaksi order yang sudah sukses tidak ikut hangus
      }
    }

    // 7. Return Response Lengkap beserta Data Relasi untuk Cetak Struk
    const { data: orderComplete, error: completeErr } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        items:item_order(
          id, jumlah_order, harga_per_meter, subtotal,
          gulungan:gulungan_id(id, nomor_gulungan, lebar, panjang_sisa)
        )
      `)
      .eq('id', order.id)
      .single();

    if (completeErr) throw completeErr;

    return NextResponse.json({ data: orderComplete, message: 'Order berhasil dibuat, stok diperbarui, dan keranjang dibersihkan' }, { status: 201 });

  } catch (err) {
    console.error("=== SYSTEM TRANSACTION ERROR ===", err);
    return NextResponse.json({ message: 'Gagal membuat order: ' + err.message }, { status: 500 });
  }
};