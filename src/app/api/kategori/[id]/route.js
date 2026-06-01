// /api/kategori/[id]/route.js
import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase-admin'

// =====================================================
// PATCH: Update Kategori Berdasarkan ID
// =====================================================
export async function PATCH(request, { params }) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ message: 'ID kategori wajib diisi' }, { status: 400 })
    }

    const body = await request.json()
    const nama = body.nama?.trim()

    // Validasi input nama
    if (!nama) {
      return NextResponse.json({ message: 'Nama kategori wajib diisi' }, { status: 400 })
    }
    if (nama.length > 255) {
      return NextResponse.json({ message: 'Nama kategori terlalu panjang (maksimal 255 karakter)' }, { status: 400 })
    }

    // Eksekusi update langsung ke Supabase
    const { data, error } = await supabaseAdmin
      .from('kategori')
      .update({ nama })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      // Handle jika nama kategori kembar (Unique Constraint Error)
      if (error.code === '23505') {
        return NextResponse.json({ message: 'Nama kategori sudah ada' }, { status: 409 })
      }
      throw error
    }

    if (!data) {
      return NextResponse.json({ message: 'Kategori tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({ data, message: 'Kategori berhasil diupdate' }, { status: 200 })

  } catch (err) {
    return NextResponse.json({ message: 'Internal Server Error: ' + err.message }, { status: 500 })
  }
}

// =====================================================
// DELETE: Hapus Kategori Berdasarkan ID
// =====================================================
export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ message: 'ID kategori wajib diisi' }, { status: 400 })
    }

    // 1. PERBAIKAN: Ambil properti 'count' langsung dari Supabase
    const { count, error: countError } = await supabaseAdmin
      .from('produk')
      .select('*', { count: 'exact', head: true })
      .eq('kategori_id', id) // <-- Pastikan nama kolom di DB kamu memang 'kategori_id'

    if (countError) throw countError

    // 2. PERBAIKAN: Cek berdasarkan nilai count angka
    if (count && count > 0) {
      return NextResponse.json(
        { message: 'Gagal menghapus: Kategori ini masih digunakan oleh data produk.' },
        { status: 409 } // Conflict
      )
    }

    // Eksekusi hapus data jika lolos validasi awal
    const { error } = await supabaseAdmin
      .from('kategori')
      .delete()
      .eq('id', id)

    if (error) {
      // 3. TAMBAHAN: Jaga-jaga jika lolos cek manual tapi database tetap menolak (Foreign Key Error Code: 23503)
      if (error.code === '23503') {
        return NextResponse.json(
          { message: 'Gagal menghapus: Kategori ini masih terikat dengan relasi data produk lain di database.' },
          { status: 409 }
        )
      }
      throw error
    }

    return NextResponse.json({ message: 'Kategori berhasil dihapus' }, { status: 200 })

  } catch (err) {
    return NextResponse.json({ message: 'Internal Server Error: ' + err.message }, { status: 500 })
  }
}