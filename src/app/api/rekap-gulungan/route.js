import { NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabase-admin';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const filterLebar = searchParams.get('lebar');

  // Validasi lebar
  if (filterLebar && !['70', '110'].includes(filterLebar)) {
    return NextResponse.json({ error: 'Lebar harus 70 atau 110' }, { status: 400 });
  }

  let query = supabaseAdmin
    .from('gulungan')
    .select(`
      id, nomor_gulungan, lebar, panjang_sisa,
      rak:rak_id(id, nama),
      produk:produk_id(
        id, kode_produk, jenis_pewarna, gambar_url,
        motif:motif_id(id, nama)
      )
    `)
    .eq('is_active', true);

  if (filterLebar) {
    query = query.eq('lebar', parseInt(filterLebar));
  }

  const { data, error } = await query
    .order('rak_id', { ascending: true })
    .order('nomor_gulungan', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data: { items: data || [] }
  });
}