// /src/app/api/rak/[id]/route.js
import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase-admin'

// =====================================================
// PATCH: Update Nama Rak (Murni Tanpa Helper)
// =====================================================
export async function PATCH(request, { params }) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ message: 'ID rak wajib diisi' }, { status: 400 })
    }

    const body = await request.json()
    const nama = body.nama?.toString().trim().toUpperCase() 

    if (!nama) {
      return NextResponse.json({ message: 'Nama rak wajib diisi' }, { status: 400 })
    }

    if (nama.length > 100) {
      return NextResponse.json({ message: 'Nama terlalu panjang (maks 100 karakter)' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('rak')
      .update({ nama })
      .eq('id', id)
      .select()
      .single()

    if (error) {

      if (error.code === '23505') {
        return NextResponse.json({ message: 'Nama rak sudah ada' }, { status: 409 })
      }
      throw error
    }

    if (!data) {
      return NextResponse.json({ message: 'Rak tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({ data, message: 'Rak berhasil diupdate' }, { status: 200 })

  } catch (err) {
    return NextResponse.json({ message: 'Internal Server Error: ' + err.message }, { status: 500 })
  }
}

// =====================================================
// DELETE: Hapus Rak dengan Proteksi Relasi Data
// =====================================================
export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ message: 'ID rak wajib diisi' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('rak')
      .delete()
      .eq('id', id)

    if (error) {
      if (error.code === '23503') {
        return NextResponse.json({ 
          message: 'Gagal menghapus! Lokasi rak ini masih digunakan pada data produk.' 
        }, { status: 409 })
      }
      throw error
    }

    return NextResponse.json({ message: 'Rak berhasil dihapus' }, { status: 200 })

  } catch (err) {
    return NextResponse.json({ message: 'Gagal menghapus rak: ' + err.message }, { status: 500 })
  }
}