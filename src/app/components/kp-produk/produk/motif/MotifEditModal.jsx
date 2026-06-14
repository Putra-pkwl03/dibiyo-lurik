'use client'

import React, { useState, useEffect } from 'react'
import { X, Loader2, ThumbsUp } from 'lucide-react'
import Swal from 'sweetalert2'

// Style backdrop disesuaikan: Navy semi-transparan (#1A335A7A) + blur
const BACKDROP_STYLE = {
  backgroundColor: '#1A335A7A',
  backdropFilter: 'blur(2px)',
  WebkitBackdropFilter: 'blur(2px)',
}

export default function MotifEditModal({ isOpen, onClose, onSuccess, motifData }) {
  const [namaMotif, setNamaMotif] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // State untuk Modal Success (menggantikan Swal success)
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
        confirmButtonColor: '#1A335A'
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

      // Tampilkan custom success modal, auto-close 1.6s
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        onClose()
        if (onSuccess) onSuccess()
      }, 1600)

    } catch (err) {
      setErrorMessage(err.message)
      setIsSubmitting(false)

      // Error tetap pakai Swal dengan tema Navy primer
      Swal.fire({
        title: 'Gagal Memperbarui',
        text: err.message,
        icon: 'error',
        confirmButtonColor: '#1A335A'
      })
    }
  }

  const handleClose = () => {
    if (isSubmitting) return
    setErrorMessage('')
    onClose()
  }

  const namaAsli = motifData?.nama || ''

  // ── SUCCESS STATE — Tema Baru ──
  if (showSuccess) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={BACKDROP_STYLE}
      >
        <div className="bg-white rounded-[20px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] w-[372px] relative animate-in fade-in zoom-in-95 duration-150">
          <button
            type="button"
            onClick={() => {
              setShowSuccess(false)
              onClose()
              if (onSuccess) onSuccess()
            }}
            className="absolute top-4 right-4 text-[#1A335A] hover:opacity-80 transition-opacity"
          >
            <X size={18} strokeWidth={2.5} />
          </button>

          <div className="flex flex-col items-center justify-center py-12 px-6">
            <ThumbsUp size={56} className="text-[#1A335A] mb-5" strokeWidth={1.5} />
            <p className="text-[#000000] text-[18px] font-bold text-center">
              Motif Berhasil Diperbarui
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── FORM STATE — Mockup Edit Motif ──
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={BACKDROP_STYLE}
    >
      <div className="bg-white rounded-[20px] shadow-[2px_4px_4px_0px_rgba(0,0,0,0.25)] w-[372px] relative animate-in fade-in zoom-in-95 duration-150">

        {/* Header: Title + Close X */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h4 className="text-[#000000] text-[20px] font-bold tracking-tight">
            Edit Motif
          </h4>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-[#1A335A] hover:opacity-80 transition-opacity disabled:opacity-50"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Divider tipis warna Navy */}
        <div className="border-t border-[#1A335A]/10 mx-5" />

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 pt-4 pb-5">

          <label className="block text-xs font-bold text-[#000000] uppercase tracking-wider mb-2">
            Nama Motif
          </label>

          <input
            type="text"
            value={namaMotif}
            onChange={(e) => {
              const val = e.target.value;
              const formatted = val
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
              
              setNamaMotif(formatted);
            }}
            disabled={isSubmitting}
            maxLength={255}
            autoFocus
            className="w-full h-[46px] px-3 rounded-[10px] border border-[#1A335A] text-[#000000] text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#1A335A] transition-all disabled:opacity-60"
            style={{ backgroundColor: '#5AE3ED1C' }} // Latar belakang kolom cyan tipis
            required
          />

          {/* Error inline (kalau ada) */}
          {errorMessage && (
            <p className="text-xs text-red-500 mt-2 font-medium">{errorMessage}</p>
          )}

          {/* Tombol Simpan (Kanan Bawah) */}
          <div className="flex justify-end mt-6">
            <button
              type="submit"
              disabled={isSubmitting || !namaMotif.trim() || namaMotif.trim() === namaAsli}
              className="min-w-[89px] h-[33px] px-3 rounded-md bg-[#1A335A] hover:bg-[#122440] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm active:scale-[0.98] disabled:opacity-70"
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