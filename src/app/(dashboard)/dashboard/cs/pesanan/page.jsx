'use client'

import React, { useState } from 'react'
import { Search, Eye, ShoppingBag, Clock, CheckCircle2, AlertCircle, ArrowLeft, ArrowUpRight } from 'lucide-react'
import Swal from 'sweetalert2'

// Data Dummy Antrean Pesanan Masuk (Simulasi hasil checkout pembeli)
const DUMMY_PESANAN_MASUK = [
  {
    id: 'ORD-2026-001',
    customer: 'Budi Santoso',
    telpon: '081234567890',
    tgl: '18 Juni 2026',
    status: 'Menunggu Konfirmasi',
    tipe: 'Reguler',
    items: [
      { id: 1, kode_produk: 'PRD-001', nama: 'Lurik Klasik ATBM Gerimis', kategori: 'Klasik', harga: 120000, qty: 3, image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=150' },
      { id: 2, kode_produk: 'PRD-002', nama: 'Lurik Modern Prasojo Indigo', kategori: 'Modern', harga: 150000, qty: 1, image: 'https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=150' }
    ]
  },
  {
    id: 'ORD-2026-002',
    customer: 'Siti Rahma',
    telpon: '085711223344',
    tgl: '17 Juni 2026',
    status: 'Diproses',
    tipe: 'Reguler',
    items: [
      { id: 4, kode_produk: 'PRD-004', nama: 'Lurik Pedan Garis Cokelat', kategori: 'Klasik', harga: 95000, qty: 5, image: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?q=80&w=150' }
    ]
  },
  {
    id: 'PO-2026-003',
    customer: 'Lestari Kain',
    telpon: '089988776655',
    tgl: '15 Juni 2026',
    status: 'Pre-Order',
    tipe: 'Pre Order',
    items: [
      { id: 3, kode_produk: 'PRD-003', nama: 'Lurik Hujan Gerimis Lebar 110 (Stok Habis)', kategori: 'Premium', harga: 185000, qty: 10, image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=150' }
    ]
  }
]

export default function CSManagePesananPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(DUMMY_PESANAN_MASUK[0]) // Default menampilkan pesanan pertama

  // Hitung total harga pesanan yang sedang dipilih
  const totalBayar = selectedOrder
    ? selectedOrder.items.reduce((sum, item) => sum + item.harga * item.qty, 0)
    : 0

  // Filter list pesanan berdasarkan nama customer atau ID Pesanan
  const filteredOrders = DUMMY_PESANAN_MASUK.filter(order =>
    order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Aksi CS mengonfirmasi pesanan yang di-checkout pembeli
  const handleKonfirmasiPesanan = (orderId) => {
    Swal.fire({
      title: 'Konfirmasi Pesanan?',
      text: `Apakah Anda sudah memvalidasi item checkout untuk pesanan ${orderId}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#1A335A',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Setujui!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Berhasil!',
          text: 'Pesanan berhasil dikonfirmasi dan diteruskan ke bagian gudang/produksi.',
          icon: 'success',
          confirmButtonColor: '#1A335A',
        })
      }
    })
  }

  return (
    <div className="flex flex-col min-h-screen gap-6 p-6 bg-gray-50 lg:flex-row">
      
      {/* KIRI: Daftar Antrean Checkout Pembeli */}
      <div className="flex flex-col flex-1 p-4 bg-white border border-gray-100 shadow-sm rounded-xl">
        <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#1A335A] flex items-center gap-2">
              <ShoppingBag size={22} /> Monitor Antrean Checkout
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">Daftar pesanan masuk yang perlu divalidasi oleh CS.</p>
          </div>

          {/* Pencarian */}
          <div className="relative w-full sm:w-60">
            <Search className="absolute w-4 h-4 text-gray-400 top-2.5 left-3" />
            <input
              type="text"
              placeholder="Cari pembeli / ID order..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="py-1.5 pr-4 pl-10 w-full text-xs rounded-lg border border-gray-200 outline-none transition-all focus:border-[#1A335A] focus:ring-1 focus:ring-[#1A335A]"
            />
          </div>
        </div>

        {/* Tabel / List Antrean */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs font-semibold text-gray-600 border-b border-gray-100 bg-gray-50">
                <th className="p-3">ID Pesanan</th>
                <th className="p-3">Nama Pembeli</th>
                <th className="p-3 text-center">Tipe</th>
                <th className="p-3">Status Sistem</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-gray-50">
              {filteredOrders.map((order) => (
                <tr 
                  key={order.id} 
                  onClick={() => setSelectedOrder(order)}
                  className={`cursor-pointer transition-colors ${
                    selectedOrder?.id === order.id ? 'bg-[#1A335A]/5 font-medium' : 'hover:bg-gray-50/50'
                  }`}
                >
                  <td className="p-3 font-mono font-bold text-gray-700">{order.id}</td>
                  <td className="p-3 text-gray-800">
                    <div>{order.customer}</div>
                    <div className="text-[10px] text-gray-400">{order.tgl}</div>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 text-[10px] rounded-full ${
                      order.tipe === 'Pre Order' ? 'bg-purple-50 text-purple-600 border border-purple-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                    }`}>
                      {order.tipe}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`flex items-center gap-1 text-[11px] ${
                      order.status === 'Menunggu Konfirmasi' ? 'text-amber-600 font-medium' : 'text-green-600'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${order.status === 'Menunggu Konfirmasi' ? 'bg-amber-500' : 'bg-green-500'}`} />
                      {order.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button className="p-1 bg-gray-100 text-gray-600 rounded hover:bg-[#1A335A] hover:text-white transition-colors">
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* KANAN: Detail Item Barang yang Di-checkout */}
      <div className="w-full lg:w-96 shrink-0">
        {selectedOrder ? (
          <div className="sticky top-6 bg-white rounded-xl border border-gray-100 shadow-md p-4 flex flex-col h-[calc(100vh-5rem)]">
            {/* Header Informasi Pelanggan */}
            <div className="pb-3 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-gray-400">{selectedOrder.id}</span>
                <span className="text-[10px] text-gray-500">{selectedOrder.tgl}</span>
              </div>
              <h2 className="mt-1 text-base font-bold text-gray-800">{selectedOrder.customer}</h2>
              <p className="text-xs text-gray-500">{selectedOrder.telpon}</p>
            </div>

            {/* List Barang Pembelian */}
            <div className="mt-3 text-xs font-semibold text-gray-500">Daftar Item Barang:</div>
            <div className="flex-1 overflow-y-auto my-2 space-y-3 pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
              {selectedOrder.items.map((item) => (
                <div key={item.id} className="flex gap-3 p-2 border border-gray-100 rounded-lg bg-gray-50">
                  <img src={item.image} alt={item.nama} className="object-cover w-12 h-12 bg-white border border-gray-200 rounded shrink-0" />
                  <div className="flex flex-col justify-between flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-gray-800 truncate">{item.nama}</h4>
                    <p className="text-[10px] font-mono text-gray-400">{item.kode_produk} • {item.kategori}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-bold text-[#F2B600]">
                        Rp {item.harga.toLocaleString('id-ID')} <span className="text-[10px] font-normal text-gray-400">/m</span>
                      </span>
                      <span className="text-xs font-bold text-gray-700 bg-white px-2 py-0.5 border border-gray-200 rounded">
                        {item.qty} meter
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Panel Ringkasan Harga & Tombol Approval */}
            <div className="pt-3 space-y-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">Total Pembayaran</span>
                <span className="text-lg font-bold text-[#1A335A]">Rp {totalBayar.toLocaleString('id-ID')}</span>
              </div>
              
              {selectedOrder.status === 'Menunggu Konfirmasi' ? (
                <button
                  onClick={() => handleKonfirmasiPesanan(selectedOrder.id)}
                  className="w-full bg-[#1A335A] text-white py-2.5 rounded-lg font-semibold hover:bg-[#1A335A]/90 transition-all text-center text-xs shadow-md shadow-blue-900/10"
                >
                  Konfirmasi & Setujui Pesanan
                </button>
              ) : (
                <div className="w-full bg-green-50 text-green-700 border border-green-200 py-2 rounded-lg font-medium text-center text-xs flex items-center justify-center gap-1.5">
                  <CheckCircle2 size={14} /> Pesanan Sudah Disetujui
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="sticky p-8 text-center text-gray-400 bg-white border border-gray-100 top-6 rounded-xl">
            Pilih salah satu pesanan untuk melihat daftar barang.
          </div>
        )}
      </div>

    </div>
  )
}