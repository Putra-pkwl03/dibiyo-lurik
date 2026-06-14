'use client'
import React from 'react'
import { X } from 'lucide-react'

export default function PORegulerDetailModal({ isOpen, onClose, item }) {
  if (!isOpen || !item) return null

  const getStatusProduksiLabel = (status) => {
    const map = {
      'belum_diproses': { text: 'Belum diproses', cls: 'bg-[#A63636]' },
      'sedang_diproses': { text: 'Sedang diproses', cls: 'bg-[#E0A21B]' },
      'dalam_proses': { text: 'Sedang diproses', cls: 'bg-[#E0A21B]' },
      'selesai_diproses': { text: 'Selesai diproses', cls: 'bg-[#409643]' }
    }
    return map[status] || { text: status, cls: 'bg-gray-500' }
  }

  const statusProd = getStatusProduksiLabel(item.status)
  
  // Memeriksa apakah status pembayaran saat ini adalah lunas
  const isLunas = item.status_pembayaran?.toLowerCase() === 'lunas'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A335A7A] backdrop-blur-xs font-inter animate-fade-in">
      {/* Box Modal */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto flex flex-col">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-[#1A335A]">Pre-Order Reguler Detail</h3>
          <button 
            onClick={onClose} 
            className="p-1 text-gray-400 transition-colors rounded-lg hover:text-black bg-gray-50"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Konten Modal */}
        <div className="p-6 space-y-5 overflow-y-auto text-[11px] text-black">
          
          {/* Baris Atas: Data Customer & Detail Pembayaran */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            
            {/* Kotak Data Customer */}
            <div className="md:col-span-3 bg-[#FFECA7] border border-[#FFEBAA] rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-1.5 font-bold text-sm text-amber-900 pb-1.5">
                <span className="text-xs">👤</span> Data Customer
              </div>
              
              <div className="grid grid-cols-3 pt-2 pb-2 border-t border-b border-black">
                <div className="pr-3 border-r border-black">
                  <p className="text-gray-500 text-[10px]">Nama Customer</p>
                  <p className="font-bold mt-0.5 break-words">{item.nama_customer || '-'}</p>
                </div>
                
                <div className="px-3 border-r border-black">
                  <p className="text-gray-500 text-[10px]">No Telpon</p>
                  <p className="font-bold mt-0.5">{item.kontak_customer || '-'}</p>
                </div>
                
                <div className="pl-3">
                  <p className="text-gray-500 text-[10px]">Tanggal Pre-Order Reguler</p>
                  <p className="font-bold mt-0.5">
                    {item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : '-'}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-gray-500 text-[10px]">Alamat</p>
                <p className="font-medium mt-0.5 leading-relaxed">{item.alamat_customer || '-'}</p>
              </div>
            </div>

            {/* Kotak Detail Pembayaran */}
            <div className="md:col-span-2 bg-[#FFECA7] border border-[#FFEBAA] rounded-lg p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 font-bold text-sm text-amber-900 pb-1.5 mb-3">
                  <span>💳</span> Detail Pembayaran
                </div>
                
                <div className="grid grid-cols-3 pt-2 pb-2 mb-3 border-t border-b border-black">
                  <div className="pr-3 border-r border-black">
                    <p className="text-gray-500 text-[10px]">Status Pembayaran</p>
                    <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-md mt-1 text-white ${
                      isLunas ? 'bg-[#1DB793]' : 'bg-[#F0A864]'
                    }`}>{item.status_pembayaran?.toUpperCase() || 'DP'}</span>
                  </div>
                  
                  {/* KOLOM NOMINAL DP (Hanya muncul jika status BUKAN lunas) */}
                  <div className="px-3 border-r border-black">
                    <p className="text-gray-500 text-[10px]">Nominal DP</p>
                    <p className="mt-1 font-bold">
                      {isLunas ? '-' : `Rp.${item.total_dp?.toLocaleString('id-ID') || '0'}`}
                    </p>
                  </div>
                  
                  <div className="pl-3">
                    <p className="text-gray-500 text-[10px]">Metode Pembayaran</p>
                    <p className="mt-1 font-bold">{item.metode_pembayaran || 'Cash'}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2">
                <div className="pr-3 border-r border-black">
                  <p className="text-gray-500 text-[10px]">Diskon</p>
                  <p className="font-bold mt-0.5">{item.diskon ? `${item.diskon}%` : '0%'}</p>
                </div>
                <div className="pl-3">
                  <p className="text-gray-500 text-[10px]">Total Harga</p>
                  <p className="font-bold text-amber-900 mt-0.5">Rp.{item.total_harga?.toLocaleString('id-ID')},00</p>
                </div>
              </div>
            </div>

          </div>

          {/* Bagian Tengah: Data Produk */}
          <div className="p-4 space-y-3 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center gap-1.5 font-bold text-gray-700 border-b border-gray-100 pb-2">
              <span>📦</span> Data Produk
            </div>

            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {item.items && item.items.length > 0 ? (
                item.items.map((prod, idx) => (
                  <div key={idx} className="flex flex-col justify-between gap-4 p-3 rounded-lg sm:flex-row sm:items-center bg-[#5AE3ED]/5 border border-gray-100">
                    
                    <div className="flex items-center gap-3 min-w-[200px]">
                      <div className="relative flex items-center justify-center w-12 h-12 overflow-hidden bg-gray-100 border border-gray-200 rounded-md shrink-0">
                        {prod.produk?.gambar_url ? (
                          <img 
                            src={prod.produk.gambar_url} 
                            alt={prod.produk.kode_produk || 'Produk'} 
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <span className="text-[9px] font-bold text-gray-400">No Image</span>
                        )}
                      </div>
                      <div>
                        <p className="text-gray-400 text-[9px]">Kode Produksi</p>
                        <p className="font-bold text-gray-800">{prod.produk?.kode_produk || '-'}</p>
                        <p className="text-gray-500 text-[10px]">Kategori: Reguler</p>
                      </div>
                    </div>

                    <div className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-4">
                      <div>
                        <p className="text-gray-400 text-[9px]">Lebar Kain</p>
                        <div className="mt-1 px-3 py-1 bg-[#5AE3ED]/5 border border-[#1A335A]/20 rounded text-center font-bold">
                          Lebar {prod.lebar || 70} cm
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-400 text-[9px]">Jumlah PO</p>
                        <div className="mt-1 px-3 py-1 bg-[#5AE3ED]/5 border border-[#1A335A]/20 rounded text-center font-bold">
                          {prod.jumlah || 1}
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-400 text-[9px]">Panjang Kain</p>
                        <div className="mt-1 px-3 py-1 bg-[#5AE3ED]/5 border border-[#1A335A]/20 rounded text-center font-bold">
                          {prod.panjang || 0} m
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-400 text-[9px]">Harga</p>
                        <div className="mt-1 px-2 py-1 bg-[#5AE3ED1C] border border-[#1A335A]/20 rounded text-center font-bold text-gray-700">
                          Rp.{Number(prod.subtotal || 0).toLocaleString('id-ID')},00
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-4 text-center text-gray-400">Tidak ada item detail produk.</p>
              )}
            </div>
          </div>

          {/* Baris Bawah: Estimasi Jadi & Status Produksi */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            <div className="p-4 bg-[#5AE3ED]/5 border border-gray-100 rounded-lg md:col-span-2">
              <p className="font-bold text-gray-700 border-b border-gray-100 pb-1.5 mb-2">🕒 Estimasi Produk Jadi</p>
              <div className="bg-[#F2B600C4] text-black font-bold text-center py-2 rounded-md tracking-wider">
                {item.tanggal_selesai ? new Date(item.tanggal_selesai).toLocaleDateString('id-ID') : '00/00/0000'}
              </div>
            </div>

            <div className="p-4 bg-[#5AE3ED]/5 border border-gray-100 rounded-lg md:col-span-3">
              <p className="font-bold text-gray-700 border-b border-gray-100 pb-1.5 mb-2">⚙️ Status Produksi</p>
              <div className={`${statusProd.cls} text-white font-bold text-center py-2 rounded-md`}>
                {statusProd.text}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}