'use client'

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Trash, Loader2 } from 'lucide-react'

// Style backdrop disesuaikan dengan tema Navy semi-transparan (#1A335A7A)
const BACKDROP_STYLE = {
  backgroundColor: '#1A335A7A',
  backdropFilter: 'blur(2px)',
  WebkitBackdropFilter: 'blur(2px)',
}

export default function HargaModalDelete({ isOpen, hargaItem, isDeleting, onConfirm, onClose }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!isOpen || !hargaItem || !mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={BACKDROP_STYLE}>
      <div className="absolute inset-0" onClick={!isDeleting ? onClose : undefined} />

      <div className="relative bg-white rounded-[20px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] w-[372px] overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex flex-col items-center pt-10 pb-7 px-6">
          
          {/* Icon diubah ke warna Navy utama */}
          <div className="text-[#1A335A] mb-4">
            <Trash size={40} strokeWidth={1.8} />
          </div>

          {/* Teks pesan menggunakan warna Black pekat */}
          <p className="text-[#000000] text-[16px] font-bold text-center leading-snug mb-7">
            Apakah Anda Yakin Ingin<br />Menghapus Daftar Harga ini?
          </p>

          <div className="flex items-center gap-3 w-full">
            {/* Tombol Batal dibuat sekunder (netral) agar kontras */}
            <button
              type="button"
              disabled={isDeleting}
              onClick={onClose}
              className="flex-1 h-[47px] rounded-[10px] bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-base transition-colors disabled:opacity-50 active:scale-[0.98]"
            >
              Batal
            </button>
            
            {/* Tombol Konfirmasi Hapus menggunakan warna Navy utama */}
            <button
              type="button"
              disabled={isDeleting}
              onClick={onConfirm}
              className="flex-1 h-[47px] rounded-[10px] bg-[#1A335A] hover:bg-[#122440] text-white font-bold text-base transition-colors disabled:opacity-50 flex items-center justify-center active:scale-[0.98]"
            >
              {isDeleting ? (
                <Loader2 size={18} className="text-white animate-spin" />
              ) : (
                'Ya, Hapus'
              )}
            </button>
          </div>

        </div>
      </div>
    </div>,
    document.body
  )
}