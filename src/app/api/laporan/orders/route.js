import { NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabase-admin';

export const GET = async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');
    const search = searchParams.get('search'); 

    // 1. Tarik data order beserta item_order dan relasi kainnya secara mendalam
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
          id,
          jumlah_order,
          subtotal,
          gulungan:gulungan_id (
            nomor_gulungan,
            lebar,
            produk:produk_id (
              kode_produk,
              motif:motif_id (nama),
              kategori:kategori_id (nama)
            )
          )
        )
      `);

    // Filter tanggal order jika ada
    if (startDate) query = query.gte('tanggal_order', startDate);
    if (endDate) query = query.lte('tanggal_order', `${endDate}T23:59:59`);

    const { data: orders, error } = await query.order('tanggal_order', { ascending: false });

    if (error) throw error;

    // 2. Transformasi data agar berbentuk FLAT per item sesuai kebutuhan tampilan tabel di gambar
    let reportData = [];
    orders?.forEach((order) => {
      order.items?.forEach((item) => {
        const namaMotif = item.gulungan?.produk?.motif?.nama || '-';
        const namaKategori = item.gulungan?.produk?.kategori?.nama || '-';

        if (search) {
          const term = search.toLowerCase();
          if (!namaMotif.toLowerCase().includes(term) && !namaKategori.toLowerCase().includes(term)) {
            return; 
          }
        }

        reportData.push({
          id_pesanan: order.nomor_order,
          tanggal: order.tanggal_order,
          motif: namaMotif,
          kategori: namaKategori,
          jumlah_order: 1, 
          lebar: item.gulungan?.lebar || 0,
          panjang: item.jumlah_order, 
          total_harga: item.subtotal
        });
      });
    });

    // 3. Cek format ekspor: Jika ada param `export=pdf`, jalankan generator PDF
    const exportType = searchParams.get('export');
    if (exportType === 'pdf') {
      let dateRange = 'Semua Periode';
      if (startDate && endDate) dateRange = `${startDate} s/d ${endDate}`;
      else if (startDate) dateRange = `Mulai ${startDate}`;
      else if (endDate) dateRange = `Sampai ${endDate}`;

      const pdfBuffer = await generateLaporanOrders(reportData, { dateRange });

      return new Response(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="laporan-orders-${Date.now()}.pdf"`,
        },
      });
    }

    // Default: Kembalikan data dalam bentuk JSON untuk di-render oleh komponen React Client
    return NextResponse.json({ data: reportData }, { status: 200 });

  } catch (err) {
    console.error('[Laporan Orders] error:', err);
    return NextResponse.json({ message: 'Gagal memuat laporan: ' + err.message }, { status: 500 });
  }
};