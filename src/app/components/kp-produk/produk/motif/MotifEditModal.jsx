'use client'

import React, { useState, useEffect } from 'react'
import { X, Loader2, ThumbsUp } from 'lucide-react'
import Swal from 'sweetalert2'

// Style backdrop konsisten dengan Figma: cokelat semi-transparan + blur
const BACKDROP_STYLE = {
  backgroundColor: 'rgba(174, 131, 78, 0.53)',
  backdropFilter: 'blur(2px)',
  WebkitBackdropFilter: 'blur(2px)',
}

export default function MotifEditModal({ isOpen, onClose, onSuccess, motifData }) {
  const [namaMotif, setNamaMotif] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // State untuk Modal Success (menggantikan Swal success) — pola Figma 1310-12284
  const [showSuccess, setShowSuccess] = useState(false)

  // Sinkronisasikan input form ketika data motif dari baris tabel dipilih
  useEffect(() => {
    if (motifData) {
      setNamaMotif(motifData.nama || '')
      setErrorMessage('')
    }
  }, [motifData, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()

    const trimmedNama = namaMotif.trim()
    if (!trimmedNama) {
      setErrorMessage('Nama motif wajib diisi')
      return
    }

    const targetId = motifData?.id || motifData?.ID
    if (!targetId) {
      Swal.fire({
        title: 'Error Sistem ❌',
        text: 'ID Motif tidak ditemukan pada baris data ini. Silakan muat ulang halaman.',
        icon: 'error',
        confirmButtonColor: '#a47352'
      })
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')

    try {
      // Mengirim request PATCH ke route dinamis /api/motif/[id]
      const response = await fetch(`/api/motif/${targetId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nama: trimmedNama }),
        credentials: 'include'
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Gagal memperbarui data motif')
      }

      setIsSubmitting(false)

      // Tampilkan custom success modal sesuai Figma, auto-close 1.6s
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        onClose()
        if (onSuccess) onSuccess()
      }, 1600)

    } catch (err) {
      setErrorMessage(err.message)
      setIsSubmitting(false)

      // Error tetap pakai Swal (tidak ada design di Figma)
      Swal.fire({
        title: 'Gagal Memperbarui',
        text: err.message,
        icon: 'error',
        confirmButtonColor: '#a47352'
      })
    }
  }

  const handleClose = () => {
    if (isSubmitting) return
    setErrorMessage('')
    onClose()
  }

  const namaAsli = motifData?.nama || ''

  // ── SUCCESS STATE — pola Figma node 1310-12284 ──
  if (showSuccess) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={BACKDROP_STYLE}
      >
        <div className="bg-white rounded-[20px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] w-[372px] relative">
          <button
            onClick={() => {
              setShowSuccess(false)
              onClose()
              if (onSuccess) onSuccess()
            }}
            className="absolute top-3.5 right-3.5 text-[#a47352] hover:text-[#8c5f3f] transition-colors"
          >
            <X size={18} strokeWidth={2.5} />
          </button>

          <div className="flex flex-col items-center justify-center py-12 px-6">
            <ThumbsUp size={56} className="text-[#a47352] mb-5" strokeWidth={1.5} />
            <p className="text-[#a47352] text-[18px] font-medium tracking-[0.18px] text-center">
              Motif Berhasil Diperbarui
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── FORM STATE — Figma node 1310-12179 ──
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={BACKDROP_STYLE}
    >
      <div className="bg-white rounded-[20px] shadow-[2px_4px_4px_0px_rgba(0,0,0,0.25)] w-[372px] relative">

        {/* Header: Title + Close X */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <h4 className="text-[#a47352] text-[22px] font-medium tracking-[-0.24px]">
            Edit Motif
          </h4>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-[#a47352] hover:text-[#8c5f3f] transition-colors disabled:opacity-50"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Divider */}
        <div className="border-t border-[#a47352]/40 mx-5" />

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 pt-4 pb-5">

          <label className="block text-[15px] font-medium text-[#a47352] tracking-[0.18px] mb-2">
            Nama Motif
          </label>

          <input
            type="text"
            value={namaMotif}
            onChange={(e) => {
              const val = e.target.value;
              // Logika: pecah per kata, huruf pertama kapital, sisanya kecil, lalu gabungkan kembali
              const formatted = val
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
              
              setNamaMotif(formatted);
            }}
            disabled={isSubmitting}
            maxLength={255}
            autoFocus
            className="w-full h-[46px] px-3 rounded-[10px] border border-[#a47352] text-[#a47352] text-sm focus:outline-none focus:ring-1 focus:ring-[#a47352] transition-all disabled:opacity-60"
            style={{ backgroundColor: 'rgba(227, 194, 172, 0.35)' }}
            required
          />

          {/* Error inline (kalau ada) */}
          {errorMessage && (
            <p className="text-xs text-red-500 mt-2 font-medium">{errorMessage}</p>
          )}

          {/* Tombol Simpan (kanan bawah) */}
          <div className="flex justify-end mt-6">
            <button
              type="submit"
              disabled={isSubmitting || !namaMotif.trim() || namaMotif.trim() === namaAsli}
              className="min-w-[89px] h-[33px] px-3 rounded-[10px] bg-[#a47352] hover:bg-[#8c5f3f] text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={14} />
                  <span>Menyimpan...</span>
                </>
              ) : (
                'Simpan'
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}