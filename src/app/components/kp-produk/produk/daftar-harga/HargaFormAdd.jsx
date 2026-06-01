'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Plus, Loader2, X, ThumbsUp } from 'lucide-react'

// Style backdrop disesuaikan: Navy semi-transparan (#1A335A7A) + blur
const BACKDROP_STYLE = {
  backgroundColor: '#1A335A7A',
  backdropFilter: 'blur(2px)',
  WebkitBackdropFilter: 'blur(2px)',
}

// Stroke warna SVG diubah ke Navy (%231A335A)
const ARROW_UP_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%231A335A' stroke-width='3'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M4.5 15.75l7.5-7.5 7.5 7.5'/%3E%3C/svg%3E")`;
const ARROW_DOWN_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%231A335A' stroke-width='3'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E")`;

export default function HargaFormAdd({ motifs, onRefresh, swal }) {
  const [jenisPewarna, setJenisPewarna] = useState('Sintetis')
  const [lebar, setLebar] = useState('110')
  const [selectedMotif, setSelectedMotif] = useState('')
  const [hargaPerMeter, setHargaPerMeter] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  const resetSelectArrow = (target) => {
    target.style.backgroundImage = ARROW_UP_SVG;
  }

  const toggleSelectArrow = (target) => {
    const isUp = target.style.backgroundImage.includes("M4.5");
    target.style.backgroundImage = isUp ? ARROW_DOWN_SVG : ARROW_UP_SVG;
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!hargaPerMeter || parseFloat(hargaPerMeter) <= 0) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/daftar-harga', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jenis_pewarna: jenisPewarna.toLowerCase(),
          lebar: parseInt(lebar),
          motif_id: selectedMotif || null,
          harga_per_meter: parseFloat(hargaPerMeter)
        }),
        credentials: 'include'
      })
      const result = await response.json()

      if (!response.ok) throw new Error(result.message || 'Gagal menyimpan aturan harga')

      setHargaPerMeter('')
      setSelectedMotif('')
      setIsSubmitting(false)
      setShowSuccess(true)
      
      setTimeout(() => {
        setShowSuccess(false)
        if (onRefresh) onRefresh()
      }, 1600)

    } catch (err) {
      setIsSubmitting(false)
      swal.fire({
        title: 'Gagal Menyimpan ❌',
        text: err.message,
        icon: 'error',
        confirmButtonColor: '#1A335A'
      })
    }
  }

  return (
    <div className="rounded-[10px] border border-[#1A335A]/10 overflow-hidden" style={{ backgroundColor: '#5AE3ED1C' }}>
      <div className="p-5">
        <h3 className="mb-4 text-[16px] font-bold text-[#000000] tracking-tight">
          Tambah Aturan Harga Baru
        </h3>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            
            {/* Dropdown Jenis Pewarna */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#000000] uppercase tracking-wider">Jenis Pewarna</label>
              <select
                value={jenisPewarna}
                onChange={(e) => { setJenisPewarna(e.target.value); resetSelectArrow(e.target); }}
                disabled={isSubmitting}
                required
                className="w-full h-[40px] px-3 rounded-[10px] border border-[#1A335A] text-[#000000] text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-[#1A335A] transition-all disabled:opacity-50 appearance-none bg-no-repeat duration-200 cursor-pointer"
                style={{ 
                  backgroundColor: '#ffffff',
                  backgroundImage: ARROW_UP_SVG,
                  backgroundPosition: 'right 12px center',
                  backgroundSize: '14px'
                }}
                onClick={(e) => toggleSelectArrow(e.target)}
                onBlur={(e) => resetSelectArrow(e.target)}
              >
                <option value="Sintetis">Sintetis</option>
                <option value="Alami">Alami</option>
              </select>
            </div>

            {/* Dropdown Lebar */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#000000] uppercase tracking-wider">Lebar</label>
              <select
                value={lebar}
                onChange={(e) => { setLebar(e.target.value); resetSelectArrow(e.target); }}
                disabled={isSubmitting}
                required
                className="w-full h-[40px] px-3 rounded-[10px] border border-[#1A335A] text-[#000000] text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-[#1A335A] transition-all disabled:opacity-50 appearance-none bg-no-repeat duration-200 cursor-pointer"
                style={{ 
                  backgroundColor: '#ffffff',
                  backgroundImage: ARROW_UP_SVG,
                  backgroundPosition: 'right 12px center',
                  backgroundSize: '14px'
                }}
                onClick={(e) => toggleSelectArrow(e.target)}
                onBlur={(e) => resetSelectArrow(e.target)}
              >
                <option value="70">70 cm</option>
                <option value="110">110 cm</option>
              </select>
            </div>

            {/* Dropdown Motif */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#000000] uppercase tracking-wider">Motif (Opsional)</label>
              <select
                value={selectedMotif}
                onChange={(e) => { setSelectedMotif(e.target.value); resetSelectArrow(e.target); }}
                disabled={isSubmitting}
                className="w-full h-[40px] px-3 rounded-[10px] border border-[#1A335A] text-[#000000] text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-[#1A335A] transition-all disabled:opacity-50 appearance-none bg-no-repeat duration-200 cursor-pointer"
                style={{ 
                  backgroundColor: '#ffffff',
                  backgroundImage: ARROW_UP_SVG,
                  backgroundPosition: 'right 12px center',
                  backgroundSize: '14px'
                }}
                onClick={(e) => toggleSelectArrow(e.target)}
                onBlur={(e) => resetSelectArrow(e.target)}
              >
                <option value="">Umum (Semua Motif)</option>
                {Array.isArray(motifs) && motifs.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nama}
                  </option>
                ))}
              </select>
            </div>

            {/* Input Harga Per Meter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#000000] uppercase tracking-wider">Harga Per Meter</label>
              <div className="relative flex items-center">
                <span className="absolute text-sm font-bold text-gray-500 left-3">Rp</span>
                <input
                  type="number"
                  value={hargaPerMeter}
                  onChange={(e) => setHargaPerMeter(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full h-[40px] pl-9 pr-3 rounded-[10px] border border-[#1A335A] text-[#000000] text-sm focus:outline-none focus:ring-1 focus:ring-[#1A335A] transition-all font-semibold disabled:opacity-50 placeholder:font-normal placeholder:text-gray-400"
                  style={{ backgroundColor: '#ffffff' }}
                  required
                />
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-end mt-6">
            <button
              type="submit"
              disabled={isSubmitting || !hargaPerMeter}
              className="min-w-[212px] h-[33px] px-3 rounded-md bg-[#1A335A] hover:bg-[#122440] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-70 shadow-sm active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Plus size={14} strokeWidth={2.5} />
                  <span>Simpan Aturan Harga</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal Portal */}
      {showSuccess && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={BACKDROP_STYLE}>
          <div className="bg-white rounded-[20px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] w-[372px] relative overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <button 
              type="button"
              onClick={() => setShowSuccess(false)} 
              className="absolute top-4 right-4 text-[#1A335A] hover:opacity-80 transition-opacity"
            >
              <X size={18} strokeWidth={2.5} />
            </button>
            <div className="flex flex-col items-center justify-center py-12 px-6">
              <ThumbsUp size={56} className="text-[#1A335A] mb-5" strokeWidth={1.5} />
              <p className="text-[#000000] text-[18px] font-bold text-center leading-snug">
                Daftar Harga Berhasil di<br />Tambah
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}