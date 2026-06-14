import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase-admin'

export async function GET() {
  try {
    const [regResult, cusResult] = await Promise.all([
      // 1. Ambil data reguler beserta item_pre_order_reguler
      supabaseAdmin
        .from('pre_order_reguler')
        .select('id, nama_customer, status_pembayaran, status, created_at, items:item_pre_order_reguler(jumlah)')
        .order('created_at', { ascending: false })
        .limit(5),
      
      // 2. Ambil data custom beserta item_pre_order_custom (DIPERBAIKI DI SINI)
      supabaseAdmin
        .from('pre_order_custom')
        .select('id, nama_customer, status_pembayaran, status, created_at, items:item_pre_order_custom(jumlah)')
        .order('created_at', { ascending: false })
        .limit(5),
    ])

    // Helper fungsi untuk standarisasi Status Pembayaran
    const formatPembayaran = (status) => {
      if (!status) return 'DP'
      const s = status.toLowerCase()
      if (s === 'lunas') return 'Lunas'
      if (s === 'dp') return 'DP'
      return 'DP'
    }

    // Helper fungsi untuk standarisasi Status Order / Pengerjaan
    const formatStatusOrder = (status) => {
      if (!status) return 'Belum diproses'
      const s = status.toLowerCase()
      
      if (s === 'selesai_diproses' || s === 'selesai') return 'Selesai'
      if (s === 'sedang_diproses' || s === 'diproses') return 'Sedang Diproses'
      if (s === 'dalam_proses') return 'Dalam Proses'
      return 'Belum diproses'
    }

    // Map data reguler
    const reguler = (regResult.data || []).map((row) => ({
      id_preorder: row.id ? `PO-${row.id.substring(0, 8).toUpperCase()}` : '-',
      nama_pelanggan: row.nama_customer,
      qty: (row.items || []).reduce((sum, item) => sum + (Number(item.jumlah) || 0), 0),
      jenis: 'Reguler',
      status_pembayaran: formatPembayaran(row.status_pembayaran),
      tanggal_pemesanan: row.created_at,
      status_order: formatStatusOrder(row.status),
    }))

    // Map data custom (DIPERBAIKI DI SINI)
    const custom = (cusResult.data || []).map((row) => ({
      id_preorder: row.id ? `POC-${row.id.substring(0, 8).toUpperCase()}` : '-',
      nama_pelanggan: row.nama_customer,
      // Sekarang menghitung jumlah asli dari table item_pre_order_custom menggunakan kolom 'jumlah'
      qty: (row.items || []).reduce((sum, item) => sum + (Number(item.jumlah) || 0), 0),
      jenis: 'Custom',
      status_pembayaran: formatPembayaran(row.status_pembayaran),
      tanggal_pemesanan: row.created_at,
      status_order: formatStatusOrder(row.status),
    }))

    // Gabungkan data dan ambil 5 baris teratas berdasarkan tanggal terbaru
    const combined = [...reguler, ...custom]
      .sort((a, b) => new Date(b.tanggal_pemesanan) - new Date(a.tanggal_pemesanan))
      .slice(0, 5)

    return NextResponse.json(combined)
  } catch (err) {
    console.error('Error dashboard pre-order API:', err)
    return NextResponse.json([], { status: 500 })
  }
}