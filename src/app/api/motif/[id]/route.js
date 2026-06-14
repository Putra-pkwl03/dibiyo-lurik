// /src/app/api/motif/[id]/route.js
import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase-admin'

// =====================================================
// PATCH: Update Nama Motif
// =====================================================
export async function PATCH(request, { params }) {
  try {
    const { id } = await params
    
    if (!id) {
      return NextResponse.json({ message: 'ID motif wajib diisi' }, { status: 400 })
    }

    const body = await request.json()
    const nama = body.nama?.trim()

    if (!nama) {
      return NextResponse.json({ message: 'Nama motif wajib diisi' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('motif')
      .update({ nama })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ message: 'Nama motif sudah ada' }, { status: 409 })
      }
      throw error
    }

    if (!data) {
      return NextResponse.json({ message: 'Motif tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({ data, message: 'Motif berhasil diupdate' }, { status: 200 })

  } catch (err) {
    return NextResponse.json({ message: 'Internal Server Error: ' + err.message }, { status: 500 })
  }
}

// =====================================================
// DELETE: Hapus Motif
// =====================================================
export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    
    if (!id) {
      return NextResponse.json({ message: 'ID motif wajib diisi' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('motif')
      .delete()
      .eq('id', id)

    if (error) {
      if (error.code === '23503') {
        return NextResponse.json({ 
          message: 'Gagal menghapus! Data motif ini masih digunakan pada data produk atau daftar harga.' 
        }, { status: 409 })
      }
      throw error
    }

    return NextResponse.json({ message: 'Motif berhasil dihapus' }, { status: 200 })

  } catch (err) {
    return NextResponse.json({ message: 'Gagal menghapus motif: ' + err.message }, { status: 500 })
  }
}