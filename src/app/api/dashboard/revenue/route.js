import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase-admin'

export async function GET(request) {
  try {
    const roleCookie = request.cookies.get('user-role')?.value || ''
    if (roleCookie.toLowerCase() !== 'owner') {
      return NextResponse.json({
        graphData: Array(12).fill(0),
        totals: { orders: 0, por: 0, poc: 0 }
      })
    }

    const tahunIni = new Date().getFullYear()

    // 1. Ambil data gabungan view untuk grafik bulanan
    const { data: viewData, error: viewError } = await supabaseAdmin
      .from('v_pendapatan_bulanan')
      .select('tahun_bulan, total_pendapatan')
      .gte('tahun_bulan', `${tahunIni}-01`)
      .lte('tahun_bulan', `${tahunIni}-12`)

    if (viewError) throw viewError

    const monthlyTotal = Array(12).fill(0)
    if (viewData) {
      for (const row of viewData) {
        const [, bulan] = row.tahun_bulan.split('-')
        const monthIndex = parseInt(bulan, 10) - 1
        if (monthIndex >= 0 && monthIndex < 12) {
          monthlyTotal[monthIndex] += Number(row.total_pendapatan || 0)
        }
      }
    }

// 2. Hitung total akumulasi tahunan masing-masing kategori untuk informasi kanan atas
const [ordersRes, porRes, pocRes] = await Promise.all([
  supabaseAdmin.from('orders').select('total_harga').gte('created_at', `${tahunIni}-01-01`),
  
  supabaseAdmin.from('pre_order_reguler').select('total_harga').eq('status', 'selesai_diproses').gte('created_at', `${tahunIni}-01-01`),
  
  // PERBAIKAN DI SINI: Hapus string 'eq' yang pertama
  supabaseAdmin.from('pre_order_custom').select('total_harga').eq('status', 'selesai_diproses').gte('created_at', `${tahunIni}-01-01`)
])

    const totalOrders = ordersRes.data?.reduce((sum, item) => sum + Number(item.total_harga || 0), 0) || 0
    const totalPor = porRes.data?.reduce((sum, item) => sum + Number(item.total_harga || 0), 0) || 0
    const totalPoc = pocRes.data?.reduce((sum, item) => sum + Number(item.total_harga || 0), 0) || 0

    return NextResponse.json({
      graphData: monthlyTotal,
      totals: {
        orders: totalOrders,
        por: totalPor,
        poc: totalPoc
      }
    })
  } catch {
    return NextResponse.json({
      graphData: Array(12).fill(0),
      totals: { orders: 0, por: 0, poc: 0 }
    })
  }
}