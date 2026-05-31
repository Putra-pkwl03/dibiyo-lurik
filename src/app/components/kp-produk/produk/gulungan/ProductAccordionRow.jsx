'use client'

import React, { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, Edit, Trash2, Plus } from 'lucide-react'
import Swal from 'sweetalert2'
import ModalEditGulungan from './ModalEditGulungan'

export default function ProductAccordionRow({ product, onTambahGulunganKlik, onRefresh }) {
  // Amankan logging untuk meninjau struktur objek data
  useEffect(() => {
    console.log("Product object di row:", product);
  }, [product]);
  
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
        confirmButtonColor: '#d33',
        cancelButtonColor: '#A3704C',
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
      {/* KONTEN WRAPPER UTAMA:
        - Menggunakan warna latar #E3C2AC dengan Opacity 35% 
        - Border radius disamakan menjadi 10px (rounded-[10px])
        - Drop shadow kustom disesuaikan dengan nilai Figma: X=2, Y=4, Blur=8, Color Black 25%
      */}
      <div className="bg-[#E3C2AC]/35 border border-[#D4C5B9]/40 rounded-[10px] overflow-hidden shadow-[2px_4px_8px_rgba(0,0,0,0.25)] transition-all duration-200">
        
        {/* BARIS UTAMA PRODUK ACCORDION */}
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-[#E3C2AC]/20 transition-colors select-none"
        >
          <div className="flex items-center gap-4">
            <img 
              src={product.gambar_url || '/placeholder-fabric.png'} 
              alt={product.kode_produk} 
              className="object-cover w-14 h-14 border border-[#D4C5B9]/40 rounded-[8px] shadow-sm bg-white"
            />
            <div className="flex items-center gap-2">
              <div>
                <span className="text-[10px] text-[#A3704C] block font-bold uppercase tracking-wider">Kode Produksi</span>
                <h5 className="text-sm font-bold text-[#5C4033] uppercase tracking-wide flex items-center gap-2">
                  {product.kode_produk}
                  <div className="text-[#A3704C] transition-transform duration-200 inline-block">
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
              className="flex items-center gap-1.5 bg-[#A3704C] hover:bg-[#8e603f] text-white px-4 py-2.5 rounded-[8px] text-xs font-bold transition-all shadow-sm active:scale-[0.98]"
            >
              <Plus size={14} strokeWidth={3} />
              <span>Tambah Gulungan</span>
            </button>
          </div>
        </div>

        {/* DROPDOWN TABEL GULUNGAN KAIN ANAK */}
        {isOpen && (
          <div className="border-t border-[#D4C5B9]/30 bg-white/40 p-4 animate-in fade-in duration-200">
            <div className="overflow-hidden rounded-[8px] border border-[#D4C5B9]/30 bg-white shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  {/* Warna Header Tabel Utama Cokelat Tegas (#A3704C) */}
                  <tr className="bg-[#A3704C] text-white text-[11px] font-bold uppercase tracking-wider">
                    <th className="w-14 p-3 text-center">No.</th>
                    <th className="p-3">Lebar</th>
                    <th className="p-3">Panjang Total</th>
                    <th className="p-3">Panjang Sisa</th>
                    <th className="p-3">Rak</th>
                    <th className="p-3">Harga</th>
                    <th className="p-3 text-center w-32">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs text-[#5C4033] font-semibold">
                  {(!product.items || product.items.length === 0) ? (
                    <tr>
                      <td colSpan="7" className="p-8 italic text-center text-[#A3704C]/70 bg-gray-50/50">
                        Belum ada gulungan terdaftar untuk kain ini. Silakan klik tombol tambah gulungan kain.
                      </td>
                    </tr>
                  ) : (
                    product.items.map((item, index) => (
                      <tr key={item.id} className="transition-colors hover:bg-gray-50/60">
                        <td className="p-3 font-bold text-center text-gray-400">{index + 1}.</td>
                        <td className="p-3">
                          {/* Warna Badge Lebar Kain Menyesuaikan Spek Biru & Ungu */}
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold text-white shadow-sm ${
                            String(item.lebar) === '110' ? 'bg-[#3B82F6]' : 'bg-[#A855F7]'
                          }`}>
                            {item.lebar} cm
                          </span>
                        </td>
                        <td className="p-3 text-gray-500 font-medium">{item.panjang_total} Meter</td>
                        <td className="p-3 font-bold text-[#A3704C]">{item.panjang_sisa} Meter</td>
                        <td className="p-3 font-bold text-gray-600 uppercase">{item.nama_rak || item.rak_id || '-'}</td>
                        <td className="p-3 font-bold text-[#5C4033]">{formatRupiah(item.harga_per_meter || item.harga)}</td>
                        
                        {/* AKSI TOMBOL EDIT & HAPUS (Warna Soft Khas Mockup) */}
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleEditClick(item)}
                              className="flex items-center gap-1 bg-[#EFAA52] hover:bg-[#df993f] text-white px-2.5 py-1.5 rounded-[6px] text-[10px] font-bold transition-all active:scale-[0.95]"
                            >
                              <Edit size={12} strokeWidth={2.5} />
                              <span>Edit</span>
                            </button>
                            
                            <button
                              onClick={() => handleHapusGulungan(item.id, index + 1)}
                              className="flex items-center gap-1 bg-[#FF6B6B] hover:bg-red-500 text-white px-2.5 py-1.5 rounded-[6px] text-[10px] font-bold transition-all active:scale-[0.95]"
                            >
                              <Trash2 size={12} strokeWidth={2.5} />
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