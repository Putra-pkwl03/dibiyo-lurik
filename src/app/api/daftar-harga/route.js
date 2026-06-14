// /src/app/api/daftar-harga/route.js
import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase-admin'

// =====================================================
// GET: Ambil Semua Daftar Harga (Murni Tanpa Helper)
// =====================================================
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('daftar_harga')
      .select(`
        id,
        jenis_pewarna,
        lebar,
        harga_per_meter,
        created_at,
        updated_at,
        motif:motif_id(id, nama)
      `)
      .order('jenis_pewarna', { ascending: true })
      .order('lebar', { ascending: true })

    if (error) throw error

    return NextResponse.json({
      data: data || [],
      message: 'Berhasil memuat daftar harga'
    }, { status: 200 })

  } catch (err) {
    return NextResponse.json({
      message: 'Gagal memuat daftar harga: ' + err.message
    }, { status: 500 })
  }
}

// =====================================================
// POST: Tambah Harga Baru 
// =====================================================
export async function POST(request) {
  try {
    const body = await request.json()
    const { jenis_pewarna, lebar, harga_per_meter, motif_id } = body

    if (!jenis_pewarna || !['sintetis', 'alami'].includes(jenis_pewarna)) {
      return NextResponse.json({ message: 'Jenis pewarna tidak valid' }, { status: 400 })
    }
    if (!lebar || ![70, 110].includes(parseInt(lebar))) {
      return NextResponse.json({ message: 'Lebar kain harus 70 atau 110 cm' }, { status: 400 })
    }
    const harga = parseFloat(harga_per_meter)
    if (isNaN(harga) || harga < 0) {
      return NextResponse.json({ message: 'Harga per meter tidak valid' }, { status: 400 })
    }

    const targetMotifId = motif_id || null

    let queryCek = supabaseAdmin
      .from('daftar_harga')
      .select('id')
      .eq('jenis_pewarna', jenis_pewarna)
      .eq('lebar', parseInt(lebar))

    if (targetMotifId === null) {
      queryCek = queryCek.is('motif_id', null)
    } else {
      queryCek = queryCek.eq('motif_id', targetMotifId)
    }

    const { data: dataLama, error: errorCek } = await queryCek.maybeSingle()
    if (errorCek) throw errorCek

    let hasilData = null

    if (dataLama) {
      const { data: dataUpdate, error: errorUpdate } = await supabaseAdmin
        .from('daftar_harga')
        .update({
          harga_per_meter: harga,
          updated_at: new Date().toISOString()
        })
        .eq('id', dataLama.id)
        .select(`
          id,
          jenis_pewarna,
          lebar,
          harga_per_meter,
          motif:motif_id(id, nama)
        `)
        .single()

      if (errorUpdate) throw errorUpdate
      hasilData = dataUpdate
    } else {
      const { data: dataInsert, error: errorInsert } = await supabaseAdmin
        .from('daftar_harga')
        .insert({
          jenis_pewarna,
          motif_id: targetMotifId,
          lebar: parseInt(lebar),
          harga_per_meter: harga
        })
        .select(`
          id,
          jenis_pewarna,
          lebar,
          harga_per_meter,
          motif:motif_id(id, nama)
        `)
        .single()

      if (errorInsert) throw errorInsert
      hasilData = dataInsert
    }

    return NextResponse.json({
      data: hasilData,
      message: 'Aturan daftar harga berhasil disimpan/diperbarui'
    }, { status: 200 })

  } catch (err) {
    return NextResponse.json({
      message: 'Internal Server Error: ' + err.message
    }, { status: 500 })
  }
}