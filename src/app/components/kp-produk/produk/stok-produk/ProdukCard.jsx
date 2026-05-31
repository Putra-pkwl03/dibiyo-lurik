'use client'

import React, { useState } from 'react'
import { Eye, Edit3, Trash2, Loader2, Trash, X, ThumbsUp, ImageOff } from 'lucide-react'
import Swal from 'sweetalert2'

const BACKDROP_STYLE = {
  backgroundColor: 'rgba(174, 131, 78, 0.53)',
  backdropFilter: 'blur(2px)',
  WebkitBackdropFilter: 'blur(2px)',
}

export default function ProdukCard({ produk, onRefresh, onEditClick, onDetailClick }) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [imageError, setImageError] = useState(false)

  const kodeProduk   = produk?.kode_produk   || '-'
  const kategoriNama = produk?.kategori?.nama || '-'
  const motifNama    = produk?.motif?.nama    || '-'
  const stok         = produk?.stok ?? 0
  const terjual      = produk?.terjual ?? 0
  const gambarUrl    = produk?.gambar_url
  const status       = (produk?.status || 'ready').toLowerCase()

  // Mapping status baru ke Tersedia / Habis tanpa merusak logika data backend
  const normalizedStatus = (status === 'ready' || status === 'tersedia') ? 'tersedia' : 'habis'

  const statusStyle = {
    tersedia: { bg: '#76cbf9', label: 'Tersedia' },
    habis:    { bg: '#ff695e', label: 'Habis' },
  }[normalizedStatus] || { bg: '#A3704C', label: status.charAt(0).toUpperCase() + status.slice(1) }

  const handleConfirmDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/produk/${produk.id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Gagal menghapus produk')

      setIsDeleteModalOpen(false)
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        if (onRefresh) onRefresh()
      }, 1500)
    } catch (err) {
      setIsDeleteModalOpen(false)
      Swal.fire({
        title: 'Gagal Hapus',
        text: err.message,
        icon: 'error',
        confirmButtonColor: '#A3704C'
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="bg-white rounded-[16px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col border border-gray-100">

        {/* Bagian Gambar Atas */}
        <div className="p-3.5 pb-0">
          <div className="w-full aspect-[16/8] rounded-[12px] overflow-hidden bg-[#F5EBE1] flex items-center justify-center relative shadow-sm">
            {gambarUrl && !imageError ? (
              <img
                src={gambarUrl}
                alt={motifNama}
                className="object-cover w-full h-full"
                onError={() => setImageError(true)}
              />
            ) : (
              <ImageOff size={32} className="text-[#a47352]/40" />
            )}
          </div>
        </div>

        {/* Bagian Informasi Konten Utama Sesuai Mockup Susunan Vertikal 3 Kolom */}
        <div className="flex-1 px-4 pt-4 pb-3 text-xs">
          <div className="grid grid-cols-3 gap-x-2 gap-y-3.5">
            {/* Kolom 1 */}
            <div className="space-y-3.5">
              <InfoBlock label="Kode Produksi" value={kodeProduk} />
              <InfoBlock label="Stok" value={stok === 0 ? '0' : `${stok} gulungan`} />
            </div>

            {/* Kolom 2 */}
            <div className="space-y-3.5">
              <InfoBlock label="Kategori" value={kategoriNama} />
              <InfoBlock label="Jumlah Terjual" value={`${terjual} gulungan`} />
            </div>

            {/* Kolom 3 */}
            <div className="space-y-3.5">
              <InfoBlock label="Motif" value={motifNama} />
              {/* Baris kedua kolom 3 dikosongkan agar presisi dengan mockup figma */}
            </div>
          </div>
        </div>

        {/* Footer: Status Badge + Action Buttons Menu */}
        <div className="flex items-center justify-between gap-2 px-4 pt-2 pb-4">
          <span
            className="px-5 py-2 rounded-full text-white text-xs font-bold min-w-[90px] text-center shadow-sm select-none"
            style={{ backgroundColor: statusStyle.bg }}
          >
            {statusStyle.label}
          </span>

          <div className="flex items-center gap-2">
            <ActionButton
              color="#3FCFAE"
              icon={<Eye size={18} strokeWidth={2.5} />}
              label="Detail"
              onClick={() => onDetailClick && onDetailClick(produk.id)}
            />
            <ActionButton
              color="#EFAA52"
              icon={<Edit3 size={18} strokeWidth={2.5} />}
              label="Edit"
              onClick={() => onEditClick && onEditClick(produk.id)}
            />
            <ActionButton
              color="#FF695E"
              icon={<Trash2 size={18} strokeWidth={2.5} />}
              label="Hapus"
              onClick={() => setIsDeleteModalOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* Modal Konfirmasi Hapus */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={BACKDROP_STYLE}>
          <div className="bg-white rounded-[20px] shadow-2xl w-full max-w-[360px] relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
              className="absolute top-4 right-4 text-[#a47352] hover:text-[#8c5f3f] disabled:opacity-50"
            >
              <X size={20} strokeWidth={2.5} />
            </button>

            <div className="flex flex-col items-center px-6 pt-10 pb-6">
              <Trash size={42} strokeWidth={1.8} className="text-[#a47352] mb-4" />
              <p className="text-[#a47352] text-[15px] font-bold text-center leading-snug mb-6">
                Apakah Anda Yakin Ingin<br />Menghapus Produk ini
              </p>

              <div className="flex items-center w-full gap-3">
                <button
                  disabled={isDeleting}
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 h-[44px] rounded-[10px] bg-[#D4C5B9] text-[#5C4033] font-bold text-sm transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="flex-1 h-[44px] rounded-[10px] bg-[#A3704C] hover:bg-[#8c5f3f] text-white font-bold text-sm transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {isDeleting ? <Loader2 size={18} className="animate-spin" /> : 'Ya, Hapus'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Sukses */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={BACKDROP_STYLE}>
          <div className="bg-white rounded-[20px] shadow-2xl w-full max-w-[360px] py-12 px-6 flex flex-col items-center animate-in fade-in zoom-in-95 duration-150">
            <ThumbsUp size={54} className="text-[#A3704C] mb-4" strokeWidth={2} />
            <p className="text-[#A3704C] text-[17px] font-bold text-center">
              Produk Berhasil Dihapus
            </p>
          </div>
        </div>
      )}
    </>
  )
}

function InfoBlock({ label, value, className = '' }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <p className="text-[#cda483] text-[11px] font-medium tracking-wide leading-tight mb-1">
        {label}
      </p>
      <p className="text-[#8C5F3F] text-[13px] font-bold leading-tight truncate">
        {value}
      </p>
    </div>
  )
}

function ActionButton({ color, icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{ backgroundColor: color }}
      className="flex flex-col items-center justify-center gap-0.5 w-[56px] h-[52px] rounded-[10px] text-white transition-all hover:opacity-90 active:scale-95 shadow-sm"
    >
      {icon}
      <span className="text-[10px] font-bold leading-none mt-1">{label}</span>
    </button>
  )
}