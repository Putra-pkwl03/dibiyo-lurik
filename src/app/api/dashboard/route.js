import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase-admin'

export async function GET(request) {
  try {
    const roleCookie = request.cookies.get('user-role')?.value || ''
    const isOwner = roleCookie.toLowerCase() === 'owner'

    const [summaryData, produkTerlarisData] = await Promise.all([
      getSummary(),
      getProdukTerlaris(),
    ])

    return NextResponse.json({
      summary: summaryData,
      produkTerlaris: produkTerlarisData,
      isOwner,
    })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function getSummary() {
  try {
    const { data, error } = await supabaseAdmin.from('v_dashboard_summary').select('*').single()
    if (error) throw error
    
    return {
      produkTersedia: Number(data?.produk_tersedia || 0),
      produkSold: Number(data?.produk_sold || 0),
      poDalamProses: Number(data?.belum_diproses || 0), 
      poSedangDiproses: Number(data?.sedang_diproses || 0),
    }
  } catch (err) { 
    console.error('Error fetching summary:', err)
    return { produkTersedia: 0, produkSold: 0, poDalamProses: 0, poSedangDiproses: 0 } 
  }
}

async function getProdukTerlaris() {
  try {
    const { data, error } = await supabaseAdmin
      .from('v_produk_terlaris')
      .select('id, kode_produk, nama_kategori, nama_motif, terjual, daftar_lebar')
      .limit(5)
      
    if (error) throw error
    return (data || []).map((p) => ({
      kode_produk: p.kode_produk || '-',
      motif: p.nama_motif || '-',
      kategori: p.nama_kategori || '-',
      lebar: p.daftar_lebar,
      jumlah_terjual: Number(p.terjual || 0),
    }))
  } catch { return [] }
}