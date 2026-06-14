// /src/app/api/rak/route.js
import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase-admin'

// =====================================================
// GET: Ambil Semua Daftar Rak (Tanpa Helper)
// =====================================================
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('rak')
      .select('id, nama, created_at')
      .order('nama', { ascending: true })

    if (error) throw error

    return NextResponse.json({ 
      data: data || [], 
      message: 'Berhasil memuat data rak' 
    }, { status: 200 })

  } catch (err) {
    return NextResponse.json({ 
      message: 'Gagal memuat rak: ' + err.message 
    }, { status: 500 })
  }
}

// =====================================================
// POST: Tambah Rak Baru (Selalu Disimpan UPPERCASE)
// =====================================================
export async function POST(request) {
  try {
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
      .insert({ nama })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ message: 'Nama rak sudah ada' }, { status: 409 })
      }
      throw error
    }

    return NextResponse.json({ 
      data, 
      message: 'Rak berhasil dibuat' 
    }, { status: 201 })

  } catch (err) {
    return NextResponse.json({ 
      message: 'Internal Server Error: ' + err.message 
    }, { status: 500 })
  }
}