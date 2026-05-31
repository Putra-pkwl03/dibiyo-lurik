import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase-admin'

// =====================================================
// GET: Detail gulungan
// =====================================================
export async function GET(request, { params }) {
  try {
    const { id } = await params

    if (!id) return NextResponse.json({ message: 'ID wajib diisi' }, { status: 400 })

    const { data, error } = await supabaseAdmin
      .from('gulungan')
      .select(`
        id,
        produk_id,
        nomor_gulungan,
        lebar,
        panjang_total,
        panjang_sisa,
        harga_per_meter,
        is_active,
        created_at,
        updated_at,
        produk:produk_id(
          id,
          kode_produk,
          jenis_pewarna,
          kategori:kategori_id(id, nama),
          motif:motif_id(id, nama),
          rak:rak_id(id, nama)
        )
      `)
      .eq('id', id)
      .single()

    if (error || !data) return NextResponse.json({ message: 'Gulungan tidak ditemukan' }, { status: 404 })

    return NextResponse.json({ data }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ message: 'Error: ' + err.message }, { status: 500 })
  }
}

// =====================================================
// PATCH: Update gulungan
// =====================================================
export async function PATCH(request, { params }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { lebar, panjang_total, harga_per_meter, is_active } = body

    // 1. Cek data existing
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('gulungan')
      .select('id, panjang_sisa, panjang_total')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ message: 'Gulungan tidak ditemukan' }, { status: 404 })
    }

    // 2. Logic Update
    const updateData = {}
    if (lebar !== undefined) updateData.lebar = parseInt(lebar)
    if (harga_per_meter !== undefined) updateData.harga_per_meter = parseFloat(harga_per_meter)
    if (is_active !== undefined) updateData.is_active = is_active

    // 3. Logic Panjang (jika diubah)
    if (panjang_total !== undefined) {
      const newPanjangTotal = parseFloat(panjang_total)
      const selisih = newPanjangTotal - existing.panjang_total
      const newPanjangSisa = existing.panjang_sisa + selisih

      if (newPanjangSisa < 0) {
        return NextResponse.json({ 
          message: `Panjang total tidak boleh kurang dari panjang yang sudah terjual. Min: ${existing.panjang_total - existing.panjang_sisa} m` 
        }, { status: 400 })
      }

      updateData.panjang_total = newPanjangTotal
      updateData.panjang_sisa = newPanjangSisa
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: 'Tidak ada data untuk diupdate' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('gulungan')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data, message: 'Gulungan berhasil diupdate' }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ message: 'Error: ' + err.message }, { status: 500 })
  }
}

// =====================================================
// DELETE: Hapus gulungan
// =====================================================
export async function DELETE(request, { params }) {
  try {
    const { id } = await params

    const { error } = await supabaseAdmin
      .from('gulungan')
      .delete()
      .eq('id', id)

    if (error) {
      // Kode 23503 adalah Foreign Key Violation di PostgreSQL/Supabase
      if (error.code === '23503') {
        return NextResponse.json({ message: 'Gulungan tidak bisa dihapus karena sudah digunakan dalam transaksi order.' }, { status: 409 })
      }
      throw error
    }

    return NextResponse.json({ message: 'Gulungan berhasil dihapus' }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ message: 'Error: ' + err.message }, { status: 500 })
  }
}