// /api/kategori/route.js
import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase-admin'

// =====================================================
// GET: Ambil List Kategori (Keamanan sudah dihandle Middleware)
// =====================================================
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const offset = (page - 1) * limit

    let query = supabaseAdmin
      .from('kategori')
      .select('id, nama, created_at', { count: 'exact' })
      .order('nama', { ascending: true })

    if (search) query = query.ilike('nama', `%${search}%`)

    const { data, count, error } = await query.range(offset, offset + limit - 1)
    if (error) throw error

    return NextResponse.json({
      data: {
        items: data || [],
        meta: { page, limit, totalItems: count || 0 }
      }
    })

  } catch (err) {
    return NextResponse.json({ message: 'Gagal memuat kategori: ' + err.message }, { status: 500 })
  }
}

// =====================================================
// POST: Buat Kategori Baru (Keamanan sudah dihandle Middleware)
// =====================================================
export async function POST(request) {
  try {
    const body = await request.json()
    const nama = body.nama?.trim()

    if (!nama) {
      return NextResponse.json({ message: 'Nama kategori wajib diisi' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('kategori')
      .insert({ nama })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ message: 'Nama kategori sudah ada' }, { status: 409 })
      }
      throw error
    }

    return NextResponse.json({ data, message: 'Kategori berhasil dibuat' }, { status: 201 })

  } catch (err) {
    return NextResponse.json({ message: 'Internal Server Error: ' + err.message }, { status: 500 })
  }
}