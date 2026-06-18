'use client'

import React, { useState, useEffect } from 'react'
import { Search, Eye, ShoppingBag, Truck, Package, Save, Loader2 } from 'lucide-react'
import Swal from 'sweetalert2'

export default function CSManagePesananPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOrderId, setSelectedOrderId] = useState(null)

  // Ambil data transaksi yang aktif terpilih
  const selectedOrder = orders.find(o => o.order_id === selectedOrderId)

  const [inputStatusPengerjaan, setInputStatusPengerjaan] = useState('diproses')
  const [inputNoResi, setInputNoResi] = useState('')

  // 1. FETCH DATA UTAMA DARI DATABASE (Via API /api/transaksi)
  const fetchTransaksi = async () => {
    try {
      setLoading(true)
      // Mengambil semua data transaksi (baik pending maupun lunas untuk di-manage CS)
      const res = await fetch('/api/transaksi')
      const data = await res.json()
      
      if (res.ok) {
        setOrders(data)
        if (data.length > 0 && !selectedOrderId) {
          setSelectedOrderId(data[0].order_id)
          setInputStatusPengerjaan(data[0].status_pengerjaan || 'diproses')
          setInputNoResi(data[0].no_resi || '')
        }
      }
    } catch (err) {
      console.error("Gagal mengambil data transaksi:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransaksi()
  }, [])

  // 2. LIVE MONITORING REALTIME (Mendengarkan update otomatis dari server)
  useEffect(() => {
    const eventSource = new EventSource('/api/realtime')

    eventSource.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        
        if (message.event === 'notification.status_changed') {
          const { id_order, status_baru, pesan } = message.data

          setOrders(prevOrders => 
            prevOrders.map(o => 
              o.order_id === id_order ? { ...o, status_pengerjaan: status_baru } : o
            )
          )

          Swal.fire({
            title: 'Info Produksi Baru!',
            text: pesan,
            icon: 'success',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 5000
          })
        }
      } catch (err) {
        console.error("Gagal membaca update realtime produksi:", err)
      }
    }

    return () => eventSource.close()
  }, [])

  // Synchronize input fields when selected order changes
  useEffect(() => {
    if (selectedOrder) {
      setInputStatusPengerjaan(selectedOrder.status_pengerjaan || 'diproses')
      setInputNoResi(selectedOrder.no_resi || '')
    }
  }, [selectedOrderId, orders])

  // 3. AKSI KETIKA BARIS TABEL DIKLIK
  const handleSelectOrder = async (order) => {
    setSelectedOrderId(order.order_id)
    
    // Jika ada sistem sinkronisasi badge notifikasi pembacaan
    if (order.notification_id) {
      try {
        await fetch('/api/notifikasi', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: order.notification_id }),
        })
      } catch (err) {
        console.error("Gagal sinkronisasi badge notifikasi:", err)
      }
    }
  }

  // Filter pencarian berdasarkan Order ID atau User ID (bisa dikembangkan ke Nama Profil jika di-join)
  const filteredOrders = orders.filter(order =>
    order.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.user_id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // 4. SIMPAN PERUBAHAN STATUS KE DATABASE
  const handleSimpanPerubahanStatus = async (e) => {
    e.preventDefault()

    if (inputStatusPengerjaan === 'dikirim' && !inputNoResi.trim()) {
      Swal.fire({
        title: 'Gagal!',
        text: 'Mohon isi nomor resi pengiriman terlebih dahulu jika status diganti menjadi dikirim.',
        icon: 'warning',
        confirmButtonColor: '#1A335A',
      })
      return
    }

    Swal.fire({
      title: 'Simpan Perubahan?',
      text: `Apakah Anda ingin memperbarui status pengerjaan untuk order ${selectedOrder.order_id}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#1A335A',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Perbarui!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Lakukan PUT/PATCH request ke API database Supabase Anda
          const response = await fetch('/api/transaksi', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              order_id: selectedOrder.order_id,
              status_pengerjaan: inputStatusPengerjaan,
              no_resi: inputStatusPengerjaan === 'dikirim' ? inputNoResi : null
            })
          })

          if (response.ok) {
            // Update state lokal biar UI langsung berubah tanpa full reload
            setOrders(prevOrders => 
              prevOrders.map(o => o.order_id === selectedOrder.order_id 
                ? { ...o, status_pengerjaan: inputStatusPengerjaan, no_resi: inputStatusPengerjaan === 'dikirim' ? inputNoResi : '' } 
                : o
              )
            )

            Swal.fire({
              title: 'Berhasil Diperbarui!',
              text: 'Status pengerjaan kain lurik berhasil disimpan ke database.',
              icon: 'success',
              confirmButtonColor: '#1A335A',
            })
          } else {
            throw new Error("Gagal menyimpan data ke server")
          }
        } catch (error) {
          Swal.fire({
            title: 'Error!',
            text: 'Terjadi kesalahan saat menyinkronkan data ke Supabase.',
            icon: 'error',
          })
        }
      }
    })
  }

  // Format tanggal lokal Indonesia
  const formatTanggal = (isoString) => {
    if (!isoString) return "-";
    return new Date(isoString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-2">
        <Loader2 className="w-8 h-8 text-[#1A335A] animate-spin" />
        <p className="text-xs text-gray-500 font-medium">Memuat data transaksi dari Supabase...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen gap-6 p-6 bg-gray-50 lg:flex-row">
      
      {/* KIRI: MONITORING ANTRIAN PRODUKSI & PENGIRIMAN */}
      <div className="flex flex-col flex-1 p-4 bg-white border border-gray-100 shadow-sm rounded-xl">
        <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#1A335A] flex items-center gap-2">
              <ShoppingBag size={22} /> Manajemen Transaksi & Alur Kain
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">Memproses seluruh invoice masuk dari sistem database pusat.</p>
          </div>

          {/* Pencarian */}
          <div className="relative w-full sm:w-60">
            <Search className="absolute w-4 h-4 text-gray-400 top-2.5 left-3" />
            <input
              type="text"
              placeholder="Cari ID order / User ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="py-1.5 pr-4 pl-10 w-full text-xs rounded-lg border border-gray-200 outline-none transition-all focus:border-[#1A335A] focus:ring-1 focus:ring-[#1A335A]"
            />
          </div>
        </div>

        {/* Tabel Antrean */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs font-semibold text-gray-600 border-b border-gray-100 bg-gray-50">
                <th className="p-3">ID Pesanan (Order ID)</th>
                <th className="p-3">Tanggal & User</th>
                <th className="p-3">Status Pembayaran</th>
                <th className="p-3">Status Alur Kain</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-gray-50">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-400 italic">Tidak ada data transaksi ditemukan</td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const statusTx = order.status_transaksi?.toLowerCase();
                  const isPaid = statusTx === 'settlement' || statusTx === 'success' || statusTx === 'capture';

                  return (
                    <tr 
                      key={order.order_id} 
                      onClick={() => handleSelectOrder(order)}
                      className={`cursor-pointer transition-colors ${
                        selectedOrderId === order.order_id ? 'bg-[#1A335A]/5 font-medium' : 'hover:bg-gray-50/50'
                      }`}
                    >
                      <td className="p-3 font-mono font-bold text-gray-700">{order.order_id}</td>
                      <td className="p-3 text-gray-800">
                        <div className="font-mono text-[10px] text-gray-500 max-w-[120px] truncate">{order.user_id}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">{formatTanggal(order.created_at)}</div>
                      </td>
                      <td className="p-3">
                        {isPaid ? (
                          <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                            Berhasil
                          </span>
                        ) : (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                            {order.status_transaksi || 'Pending'}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {order.status_pengerjaan === 'dikirim' ? (
                          <span className="inline-flex items-center gap-1 text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                            <Truck size={12} /> Dikirim
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                            <Package size={12} /> Diproses ATBM
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <button className="p-1 bg-gray-100 text-gray-600 rounded hover:bg-[#1A335A] hover:text-white transition-colors">
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* KANAN: FORM UPDATE PROGRESS */}
      <div className="w-full lg:w-96 shrink-0">
        {selectedOrder ? (
          <div className="sticky top-6 bg-white rounded-xl border border-gray-100 shadow-md p-4 flex flex-col h-[calc(100vh-5rem)]">
            
            {/* Header Profil */}
            <div className="pb-3 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-[#1A335A]">{selectedOrder.order_id}</span>
                <span className="text-[10px] text-gray-500">{formatTanggal(selectedOrder.created_at)}</span>
              </div>
              <h2 className="mt-1 text-xs text-gray-400 font-mono truncate">UID: {selectedOrder.user_id}</h2>
            </div>

            {/* Form Kontrol Progress */}
            <form onSubmit={handleSimpanPerubahanStatus} className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
              <h3 className="text-xs font-bold text-[#1A335A] uppercase tracking-wider">Update Alur Pengerjaan Kain</h3>
              
              <div>
                <label className="block text-[11px] text-gray-500 font-medium mb-1.5">Pilih Status Sekarang:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setInputStatusPengerjaan('diproses'); setInputNoResi(''); }}
                    className={`p-2 text-xs rounded-lg font-bold border flex items-center justify-center gap-1 ${
                      inputStatusPengerjaan === 'diproses'
                        ? 'bg-amber-100 border-amber-300 text-amber-800'
                        : 'bg-white border-gray-200 text-gray-600'
                    }`}
                  >
                    <Package size={14} /> Diproses
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputStatusPengerjaan('dikirim')}
                    className={`p-2 text-xs rounded-lg font-bold border flex items-center justify-center gap-1 ${
                      inputStatusPengerjaan === 'dikirim'
                        ? 'bg-blue-100 border-blue-300 text-blue-800'
                        : 'bg-white border-gray-200 text-gray-600'
                    }`}
                  >
                    <Truck size={14} /> Dikirim
                  </button>
                </div>
              </div>

              {inputStatusPengerjaan === 'dikirim' && (
                <div className="space-y-1 animate-fadeIn">
                  <label className="block text-[11px] text-gray-600 font-bold">Input Nomor Resi Logistik:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: REG-ATBM-XXXXX"
                    value={inputNoResi}
                    onChange={(e) => setInputNoResi(e.target.value)}
                    className="w-full p-2 text-xs border border-gray-300 rounded-lg outline-none uppercase font-mono font-bold bg-white focus:border-blue-500"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full mt-2 bg-[#1A335A] text-white py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-all text-xs flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Save size={13} /> Simpan Perubahan Status
              </button>
            </form>

            {/* List Item Barang (Membaca JSONB Array) */}
            <div className="mt-4 text-xs font-semibold text-gray-500">Daftar Item Belanja:</div>
            <div className="flex-1 overflow-y-auto my-2 space-y-2 pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
              {Array.isArray(selectedOrder.items_transaksi) && selectedOrder.items_transaksi.length > 0 ? (
                selectedOrder.items_transaksi.map((item, idx) => {
                  const namaProduk = item.name || item.nama || "Kain Lurik Eksklusif";
                  const kuantitas = item.quantity || item.qty || item.panjang_dibeli || 1;
                  const hargaItem = item.price || item.harga || item.harga_per_meter || 0;

                  return (
                    <div key={idx} className="flex gap-3 p-2 border border-gray-100 rounded-lg bg-gray-50/50">
                      <div className="w-10 h-10 bg-[#1A335A]/10 border border-gray-200 rounded shrink-0 flex items-center justify-center text-[10px] font-bold text-[#1A335A]">
                        ATBM
                      </div>
                      <div className="flex flex-col justify-center flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-gray-800 truncate">{namaProduk}</h4>
                        <div className="flex items-center justify-between mt-0.5 text-[10px] text-gray-500">
                          <span>{kuantitas} Meter / Pcs</span>
                          <span className="font-bold text-[#1A335A]">Rp {Number(hargaItem).toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-xs italic text-gray-400 p-2">Tidak ada rincian produk (JSONB kosong)</div>
              )}
            </div>

            {/* Total Ringkasan */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">Total Transaksi</span>
              <span className="text-base font-bold text-[#1A335A]">
                Rp {Number(selectedOrder.total_nominal).toLocaleString('id-ID')}
              </span>
            </div>
            
          </div>
        ) : (
          <div className="sticky p-8 text-center text-gray-400 bg-white border border-gray-100 top-6 rounded-xl">
            Pilih salah satu transaksi untuk mengelola data produksi & resi.
          </div>
        )}
      </div>

    </div>
  )
}