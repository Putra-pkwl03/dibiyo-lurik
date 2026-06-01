'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Edit, Trash2, Plus } from 'lucide-react'
import Swal from 'sweetalert2'
import ModalEditGulungan from './ModalEditGulungan'

export default function ProductAccordionRow({ product, onTambahGulunganKlik, onRefresh }) {
  const [isOpen, setIsOpen] = useState(false)

  // State untuk kontrol visibilitas Modal Edit Gulungan
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedGulungan, setSelectedGulungan] = useState(null)

  const formatRupiah = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num || 0)
  }

  // Handler Hapus Gulungan Tunggal
  const handleHapusGulungan = async (gulunganId, nomorUrut) => {
    try {
      const result = await Swal.fire({
        title: 'Apakah Anda yakin? ⚠️',
        text: `Gulungan ke-${nomorUrut} dari produk ${product.kode_produk} akan dihapus secara permanen!`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#DC2626',
        cancelButtonColor: '#1A335A', 
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal'
      })

      if (result.isConfirmed) {
        const res = await fetch(`/api/gulungan/${gulunganId}`, {
          method: 'DELETE',
          credentials: 'include'
        })
        const json = await res.json()

        if (!res.ok) throw new Error(json.message || 'Gagal menghapus gulungan')

        Swal.fire({
          title: 'Terhapus! 🗑️',
          text: 'Data gulungan berhasil dibersihkan.',
          icon: 'success',
          timer: 1300,
          showConfirmButton: false
        })
        onRefresh()
      }
    } catch (err) {
      Swal.fire('Gagal Hapus ❌', err.message, 'error')
    }
  }

  const handleEditClick = (item) => {
    setSelectedGulungan(item)
    setIsEditModalOpen(true)
  }

  return (
    <>
      {/* KONTEN WRAPPER UTAMA: Menggunakan bg #1A335A14 (Opasitas 8%) dan border #1A335A1F (Opasitas 12%) */}
      <div className="bg-[#1A335A14] border border-[#1A335A1F] rounded-[10px] overflow-hidden shadow-[0px_4px_10px_rgba(26,51,90,0.04)] transition-all duration-200">
        
        {/* BARIS UTAMA PRODUK ACCORDION */}
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-[#1A335A1F] transition-colors select-none"
        >
          <div className="flex items-center gap-4">
            <img 
              src={product.gambar_url || '/placeholder-fabric.png'} 
              alt={product.kode_produk} 
              className="object-cover w-14 h-14 border border-[#1A335A1F] rounded-[8px] shadow-sm bg-white"
            />
            <div className="flex items-center gap-2">
              <div>
                <span className="text-[11px] text-[#1A335A]/70 block font-bold uppercase tracking-wider">Kode Produksi</span>
                <h5 className="text-sm font-bold text-[#1A335A] uppercase tracking-wide flex items-center gap-2">
                  {product.kode_produk}
                  <div className="text-[#1A335A] transition-transform duration-200 inline-block">
                    {isOpen ? <ChevronUp size={14} strokeWidth={3} /> : <ChevronDown size={14} strokeWidth={3} />}
                  </div>
                </h5>
              </div>
            </div>
          </div>

          {/* Tombol Tambah Gulungan */}
          <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={onTambahGulunganKlik}
              className="flex items-center gap-1.5 bg-[#1A335A] hover:bg-[#11223C] text-white px-4 py-3 rounded-[8px] text-xs font-bold transition-all shadow-sm active:scale-[0.98]"
            >
              <Plus size={14} strokeWidth={3} />
              <span>Tambah Gulungan</span>
            </button>
          </div>
        </div>

        {/* DROPDOWN TABEL GULUNGAN KAIN ANAK */}
        {isOpen && (
          <div className="border-t border-[#1A335A1F] bg-white/60 p-4 animate-in fade-in duration-200">
            <div className="overflow-hidden rounded-[8px] border border-[#1A335A1F] bg-white shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1A335A] text-white text-xs font-bold uppercase tracking-wider">
                    <th className="w-14 p-3 text-center">No.</th>
                    <th className="p-3">Lebar</th>
                    <th className="p-3">Panjang Total</th>
                    <th className="p-3">Panjang Sisa</th>
                    <th className="p-3">Rak</th>
                    <th className="p-3">Harga</th>
                    <th className="p-3 text-center w-32"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm text-gray-800 font-semibold">
                  {(!product.items || product.items.length === 0) ? (
                    <tr>
                      <td colSpan="7" className="p-8 italic text-center text-[#1A335A]/80 bg-gray-50/50">
                        Belum ada gulungan terdaftar untuk kain ini. Silakan klik tombol tambah gulungan kain.
                      </td>
                    </tr>
                  ) : (
                    product.items.map((item, index) => (
                      <tr key={item.id} className="transition-colors hover:bg-gray-50/60">
                        <td className="p-3 font-bold text-center text-gray-500">{index + 1}.</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            String(item.lebar) === '110' ? 'bg-[#DBEAFE] text-[#1E40AF]' : 'bg-[#CCFBF1] text-[#0F766E]'
                          }`}>
                            {item.lebar} cm
                          </span>
                        </td>
                        <td className="p-3 font-bold text-gray-800">{item.panjang_total} Meter</td>
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1.5 font-bold ${
                            Number(item.panjang_sisa) > 0 ? 'text-[#15803D]' : 'text-[#DC2626]'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              Number(item.panjang_sisa) > 0 ? 'bg-[#22C55E]' : 'bg-[#EF4444]'
                            }`} />
                            {item.panjang_sisa} Meter
                          </span>
                        </td>
                        <td className="p-3 font-bold text-gray-600 uppercase">{item.nama_rak || item.rak_id || '-'}</td>
                        <td className="p-3 font-bold text-gray-900">{formatRupiah(item.harga_per_meter || item.harga)}</td>
                        
                        {/* AKSI TOMBOL EDIT & HAPUS */}
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleEditClick(item)}
                              title="Edit gulungan"
                              className="flex flex-col items-center gap-1 bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#B45309] px-3 py-2 rounded-[6px] text-[11px] font-bold transition-all active:scale-[0.95]"
                            >
                              <Edit size={14} strokeWidth={2.5} />
                              <span>Edit</span>
                            </button>

                            <button
                              onClick={() => handleHapusGulungan(item.id, index + 1)}
                              title="Hapus gulungan"
                              className="flex flex-col items-center gap-1 bg-[#FEE2E2] hover:bg-[#FECACA] text-[#DC2626] px-3 py-2 rounded-[6px] text-[11px] font-bold transition-all active:scale-[0.95]"
                            >
                              <Trash2 size={14} strokeWidth={2.5} />
                              <span>Hapus</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* RENDER MODAL EDIT GULUNGAN KAIN */}
      {isEditModalOpen && selectedGulungan && (
        <ModalEditGulungan
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedGulungan(null)
          }}
          onSuccess={onRefresh}
          currentProduct={product}
          currentGulungan={selectedGulungan}
        />
      )}
    </>
  )
}