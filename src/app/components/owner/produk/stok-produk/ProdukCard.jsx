// D:\dibiyo-lurik\src\app\components\kp-produk\produk\stok-produk\ProdukCard.jsx
'use client'

import React, { useState } from 'react'
import { Eye, ImageOff } from 'lucide-react'
import Swal from 'sweetalert2'

const BACKDROP_STYLE = {
  backgroundColor: 'rgba(26, 51, 90, 0.4)',
  backdropFilter: 'blur(3px)',
  WebkitBackdropFilter: 'blur(3px)',
}

export default function ProdukCard({ produk, onRefresh, onEditClick, onDetailClick }) {
  // const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  // // const [isDeleting, setIsDeleting] = useState(false)
  // const [showSuccess, setShowSuccess] = useState(false)
  const [imageError, setImageError] = useState(false)

  const kodeProduk   = produk?.kode_produk   || '-'
  const kategoriNama = produk?.kategori?.nama || '-'
  const motifNama    = produk?.motif?.nama    || '-'
  const stok         = produk?.stok ?? 0
  const terjual      = produk?.terjual ?? 0
  const gambarUrl    = produk?.gambar_url
  const status       = (produk?.status || 'ready').toLowerCase()

  // Mapping status sesuai mockup figma terbaru
  const normalizedStatus = (status === 'ready' || status === 'tersedia') ? 'tersedia' : 'habis'

  const statusStyle = {
    tersedia: { bg: 'rgba(26, 51, 90, 0.6)', label: 'Produk Tersedia' },
    habis:    { bg: '#FF4D4D', label: 'Produk Habis' },   
  }[normalizedStatus]

  // const handleConfirmDelete = async () => {
  //   setIsDeleting(true)
  //   try {
  //     const response = await fetch(`/api/produk/${produk.id}`, {
  //       method: 'DELETE',
  //       credentials: 'include'
  //     })
  //     const result = await response.json()
  //     if (!response.ok) throw new Error(result.message || 'Gagal menghapus produk')

  //     setIsDeleteModalOpen(false)
  //     setShowSuccess(true)
  //     setTimeout(() => {
  //       setShowSuccess(false)
  //       if (onRefresh) onRefresh()
  //     }, 1500)
  //   } catch (err) {
  //     setIsDeleteModalOpen(false)
  //     Swal.fire({
  //       title: 'Gagal Hapus',
  //       text: err.message,
  //       icon: 'error',
  //       confirmButtonColor: '#1A335A'
  //     })
  //   } finally {
  //     setIsDeleting(false)
  //   }
  // }

  return (
    <>
      <div className="bg-white rounded-[12px] shadow-[2px_8px_28px_0px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col border border-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        {/* Bagian Gambar Atas dengan Absolute Badge Status */}
        <div className="relative p-3 pb-0">
          <div className="w-full aspect-[2.2/1] rounded-[8px] overflow-hidden bg-gray-100 flex items-center justify-center relative shadow-inner">
            {gambarUrl && !imageError ? (
              <img
                src={gambarUrl}
                alt={motifNama}
                className="object-cover w-full h-full transition-transform duration-500 hover:scale-105"
                onError={() => setImageError(true)}
              />
            ) : (
              <ImageOff size={32} className="text-gray-300" />
            )}
            
            {/* Status Badge Overlaid on Image Top-Left (Sesuai Desain Figma) */}
            <span
              className="absolute top-3 left-3 px-3 py-2 rounded-full text-white text-[10px] font-bold shadow-sm select-none tracking-wide"
              style={{ backgroundColor: statusStyle.bg }}
            >
              {statusStyle.label}
            </span>
          </div>
        </div>

        {/* Bagian Informasi Konten Utama Sesuai Susunan Vertikal 3 Kolom */}
        <div className="flex-1 px-4 pt-4 pb-2 text-xs">
          <div className="grid grid-cols-3 gap-x-2 gap-y-3">
            {/* Kolom 1 */}
            <div className="space-y-3">
              <InfoBlock label="Kode Produksi" value={kodeProduk} />
              <InfoBlock label="Stok" value={stok === 0 ? '0' : `${stok} gulungan`} />
            </div>

            {/* Kolom 2 */}
            <div className="space-y-3">
              <InfoBlock label="Kategori" value={kategoriNama} />
              <InfoBlock label="Jumlah Terjual" value={`${terjual} gulungan`} />
            </div>

            {/* Kolom 3 */}
            <div className="space-y-3">
              <InfoBlock label="Motif" value={motifNama} />
            </div>
          </div>
        </div>

        {/* Footer: Action Buttons Menu di Sebelah Kanan */}
        <div className="flex items-center justify-end gap-2 px-4 pt-2 pb-4 mt-6">
          <ActionButton
            color="#FFA630" // Orange Detail
            icon={<Eye size={16} strokeWidth={2.5} />}
            label="Detail"
            onClick={() => onDetailClick && onDetailClick(produk.id)}
          />
          {/* <ActionButton
            color="#4A7BB0" // Blue Navy Soft Edit
            icon={<Edit3 size={16} strokeWidth={2.5} />}
            label="Edit"
            onClick={() => onEditClick && onEditClick(produk.id)}
          />
          <ActionButton
            color="#FF5C5C" // Red Coral Hapus
            icon={<Trash2 size={16} strokeWidth={2.5} />}
            label="Hapus"
            onClick={() => setIsDeleteModalOpen(true)}
          /> */}
        </div>
      </div>

      {/* Modal Konfirmasi Hapus */}
      {/* {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={BACKDROP_STYLE}>
          <div className="bg-white rounded-[16px] shadow-2xl w-full max-w-[350px] relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
              className="absolute text-gray-400 top-4 right-4 hover:text-gray-600 disabled:opacity-50"
            >
              <X size={20} strokeWidth={2.5} />
            </button>

            <div className="flex flex-col items-center px-6 pt-10 pb-6">
              <Trash size={40} strokeWidth={1.8} className="text-[#FF5C5C] mb-4" />
              <p className="text-gray-800 text-[14px] font-bold text-center leading-snug mb-6">
                Apakah Anda Yakin Ingin<br />Menghapus Produk ini?
              </p>

              <div className="flex items-center w-full gap-3">
                <button
                  disabled={isDeleting}
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 h-[40px] rounded-[6px] bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-colors"
                >
                  Batal
                </button>
                <button
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="flex-1 h-[40px] rounded-[6px] bg-[#1A335A] hover:bg-[#11223d] text-white font-bold text-xs transition-colors flex items-center justify-center"
                >
                  {isDeleting ? <Loader2 size={16} className="animate-spin" /> : 'Ya, Hapus'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )} */}

      {/* Toast Sukses
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={BACKDROP_STYLE}>
          <div className="bg-white rounded-[16px] shadow-2xl w-full max-w-[350px] py-10 px-6 flex flex-col items-center animate-in fade-in zoom-in-95 duration-150">
            <ThumbsUp size={48} className="text-[#1A335A] mb-4" strokeWidth={2} />
            <p className="text-[#1A335A] text-[15px] font-bold text-center">
              Produk Berhasil Dihapus
            </p>
          </div>
        </div>
      )} */}
    </>
  )
}

function InfoBlock({ label, value, className = '' }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <p className="text-gray-400 text-[10px] font-medium tracking-wide mb-0.5">
        {label}
      </p>
      <p className="text-gray-800 text-[12px] font-bold leading-tight truncate">
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
      className="flex flex-col items-center justify-center gap-0.5 w-[50px] h-[46px] rounded-[6px] text-white transition-all hover:opacity-90 active:scale-95 shadow-xs"
    >
      {icon}
      <span className="text-[9px] font-bold leading-none mt-0.5">{label}</span>
    </button>
  )
}