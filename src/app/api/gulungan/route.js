import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase-admin'

// =====================================================
// GET: Ambil Semua Gulungan Dikelompokkan Per Produk
// =====================================================
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')?.toLowerCase() || ''

    let query = supabaseAdmin
      .from('gulungan')
      .select(`
        id,
        produk_id,
        rak_id,
        nomor_gulungan,
        lebar,
        panjang_total,
        panjang_sisa,
        harga_per_meter,
        is_active,
        rak:rak_id(id, nama),
        produk:produk_id(
          id,
          kode_produk,
          gambar_url,
          jenis_pewarna,
          kategori:kategori_id(nama),
          motif:motif_id(nama)
        )
      `)

    const { data: gulungans, error } = await query
      .order('nomor_gulungan', { ascending: true })

    if (error) throw error

    const groupedData = {}
    
    gulungans?.forEach((g) => {
      const prod = g.produk
      if (!prod) return

      const matchSearch = !search || 
        prod.kode_produk?.toLowerCase().includes(search) || 
        prod.motif?.nama?.toLowerCase().includes(search)

      if (matchSearch) {
        if (!groupedData[g.produk_id]) {
          groupedData[g.produk_id] = {
            id: prod.id,
            kode_produk: prod.kode_produk,
            gambar_url: prod.gambar_url,
            jenis_pewarna: prod.jenis_pewarna,
            kategori_nama: prod.kategori?.nama || '',
            motif_nama: prod.motif?.nama || '',
            items: []
          }
        }
        groupedData[g.produk_id].items.push({
          id: g.id,
          rak_id: g.rak_id,
          nomor_gulungan: g.nomor_gulungan,
          lebar: g.lebar,
          panjang_total: g.panjang_total,
          panjang_sisa: g.panjang_sisa,
          harga_per_meter: g.harga_per_meter,
          is_active: g.is_active,
          nama_rak: g.rak?.nama || '-'
        })
      }
    })

    return NextResponse.json({ data: Object.values(groupedData) }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ message: 'Internal Server Error: ' + err.message }, { status: 500 })
  }
}

// =====================================================
// POST: Membuat Gulungan Tunggal Baru Berdasarkan Produk
// =====================================================
export async function POST(request) {
  try {
    const body = await request.json()
    const { produk_id, lebar, panjang_total, harga_per_meter, rak_id } = body

    if (!produk_id || !lebar || !panjang_total) {
      return NextResponse.json({ message: 'Field data wajib diisi!' }, { status: 400 })
    }

    // 1. Amankan urutan nomor_gulungan = max + 1
    const { data: maxGulungan } = await supabaseAdmin
      .from('gulungan')
      .select('nomor_gulungan')
      .eq('produk_id', produk_id)
      .order('nomor_gulungan', { ascending: false })
      .limit(1)
      .maybeSingle()

    const nomorGulungan = (maxGulungan?.nomor_gulungan || 0) + 1

    // 2. Tentukan harga per meter (Gunakan input manual atau otomatis lookup fallback)
    let finalHarga = parseFloat(harga_per_meter)
    if (!finalHarga || isNaN(finalHarga)) {
      const { data: prod } = await supabaseAdmin
        .from('produk')
        .select('jenis_pewarna, motif_id')
        .eq('id', produk_id)
        .single()

      const { data: hargaResult } = await supabaseAdmin.rpc('get_harga_per_meter', {
        p_jenis_pewarna: prod?.jenis_pewarna || 'sintetis',
        p_motif_id: prod?.motif_id,
        p_lebar: parseInt(lebar)
      })
      finalHarga = parseFloat(hargaResult) || 0
    }

    // 3. Masukkan data ke Database
    const { data, error } = await supabaseAdmin
      .from('gulungan')
      .insert({
        produk_id,
        nomor_gulungan: nomorGulungan,
        lebar: parseInt(lebar),
        panjang_total: parseFloat(panjang_total),
        panjang_sisa: parseFloat(panjang_total),
        harga_per_meter: finalHarga,
        rak_id: rak_id || null,
        is_active: true
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ message: 'Nomor gulungan sudah terdaftar.' }, { status: 409 })
      }
      throw error
    }

    return NextResponse.json({ data, message: 'Gulungan kain berhasil ditambahkan' }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ message: 'Error: ' + err.message }, { status: 500 })
  }
}