'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Loader2, ThumbsUp } from 'lucide-react'

// Style backdrop disesuaikan: Navy semi-transparan (#1A335A7A) + blur
const BACKDROP_STYLE = {
  backgroundColor: '#1A335A7A',
  backdropFilter: 'blur(2px)',
  WebkitBackdropFilter: 'blur(2px)',
}

// 💡 HELPER: Ditaruh di luar komponen agar tidak dibuat ulang tiap render & bebas bug hoisting
const formatRibuan = (nilai) => {
  if (nilai === undefined || nilai === null || nilai === '') return ''
  // Hapus semua karakter yang BUKAN angka
  const angkaBersih = nilai.toString().replace(/[^0-9]/g, '')
  // Berikan titik setiap 3 digit angka dari belakang
  return angkaBersih.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

export default function HargaEditModal({ isOpen, onClose, onSuccess, hargaData, swal, motifOptions = [] }) {
  const [hargaPerMeter, setHargaPerMeter] = useState('')
  const [jenisPewarna, setJenisPewarna] = useState('sintetis')
  const [lebar, setLebar] = useState(110)
  const [motifId, setMotifId] = useState('')
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [mounted, setMounted] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (isOpen && hargaData) {
      // 💡 PERBAIKAN 1: Langsung format harga dengan titik saat modal terbuka agar UX rapi
      setHargaPerMeter(formatRibuan(hargaData.harga_per_meter) || '')
      setJenisPewarna(hargaData.jenis_pewarna || 'sintetis')
      setLebar(hargaData.lebar ? parseInt(hargaData.lebar) : 110)
      
      // PERBAIKAN 1 (Bawaan): Paksa id motif menjadi string agar sinkron dengan value <select>
      const idMotifAsli = hargaData.motif_id || hargaData.motif?.id
      setMotifId(idMotifAsli !== undefined && idMotifAsli !== null ? String(idMotifAsli) : '')
      
      setErrorMessage('')
    }
  }, [isOpen, hargaData])

  if (!isOpen || !mounted) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // 💡 PERBAIKAN 2: Hilangkan titik pemisah ribuan sebelum validasi angka dilakukan
    const hargaBersihStr = hargaPerMeter.toString().replace(/\./g, '').trim()
    if (!hargaBersihStr || parseFloat(hargaBersihStr) < 0) {
      setErrorMessage('Harga per meter wajib diisi dengan benar')
      return
    }

    const targetId = hargaData?.id
    if (!targetId) {
      swal.fire({ 
        title: 'Error ❌', 
        text: 'ID Aturan Harga tidak valid atau tidak ditemukan.', 
        icon: 'error',
        confirmButtonColor: '#1A335A'
      })
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')

    // PERBAIKAN 2 (Bawaan): Jika ID berupa angka di database, konversi kembali sebelum dikirim ke BE
    const finalMotifId = motifId === "" ? null : (isNaN(motifId) ? motifId : parseInt(motifId))

    try {
      const response = await fetch(`/api/daftar-harga/${targetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          harga_per_meter: parseFloat(hargaBersihStr), // 💡 Mengirim nilai angka asli tanpa titik ke API
          lebar: parseInt(lebar),
          jenis_pewarna: jenisPewarna,
          motif_id: finalMotifId
        }),
        credentials: 'include'
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Gagal mengubah data harga')

      setIsSubmitting(false)
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        onClose()
        if (onSuccess) onSuccess()
      }, 1600)

    } catch (err) {
      setErrorMessage(err.message)
      setIsSubmitting(false)
      swal.fire({
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

  // Ambil nilai asli untuk perbandingan awal
  const hargaAsli = hargaData?.harga_per_meter || ''
  const pewarnaAsli = hargaData?.jenis_pewarna || 'sintetis'
  const lebarAsli = hargaData?.lebar ? parseInt(hargaData.lebar) : 110
  const motifAsli = hargaData?.motif_id || hargaData?.motif?.id

  // PERBAIKAN 3: Normalisasi perbandingan agar membandingkan string vs string / null vs null
  const normalisasiMotifInput = motifId === "" ? null : String(motifId)
  const normalisasiMotifAsli = motifAsli !== undefined && motifAsli !== null ? String(motifAsli) : null

  // 💡 PERBAIKAN 3: Bersihkan titik pada string input sebelum dibandingkan dengan nilai murni dari DB
  const hargaInputAngka = parseFloat(hargaPerMeter.toString().replace(/\./g, '')) || 0
  const hargaAsliAngka = parseFloat(hargaAsli) || 0

  const adaPerubahan = 
    hargaInputAngka !== hargaAsliAngka ||
    jenisPewarna !== pewarnaAsli ||
    parseInt(lebar) !== lebarAsli ||
    normalisasiMotifInput !== normalisasiMotifAsli

  // ── SUCCESS STATE — Tema Baru ──
  if (showSuccess) {
    return createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={BACKDROP_STYLE}>
        <div className="bg-white rounded-[20px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] w-[372px] relative animate-in fade-in zoom-in-95 duration-150">
          <button 
            type="button"
            onClick={() => { setShowSuccess(false); onClose(); if (onSuccess) onSuccess(); }} 
            className="absolute top-4 right-4 text-[#1A335A] hover:opacity-80 transition-opacity"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <ThumbsUp size={56} className="text-[#1A335A] mb-5" strokeWidth={1.5} />
            <p className="text-[#000000] text-[18px] font-bold text-center leading-snug">
              Harga Berhasil Diperbarui
            </p>
          </div>
        </div>
      </div>,
      document.body
    )
  }

  // ── FORM STATE — Tema Baru ──
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={BACKDROP_STYLE}>
      <div className="absolute inset-0" onClick={!isSubmitting ? handleClose : undefined} />
      <div className="relative z-10 bg-white rounded-[20px] shadow-[2px_4px_4px_0px_rgba(0,0,0,0.25)] w-[390px] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header: Title + Close X */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h4 className="text-[#000000] text-[20px] font-bold tracking-tight">Edit Aturan Harga</h4>
          <button type="button" onClick={handleClose} disabled={isSubmitting} className="text-[#1A335A] hover:opacity-80 transition-opacity disabled:opacity-50">
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>
        
        {/* Divider tipis warna Navy */}
        <div className="border-t border-[#1A335A]/10 mx-5" />
        
        <form onSubmit={handleSubmit} className="px-5 pt-4 pb-5 space-y-4">
          
          {/* Box Kombinasi Aturan (Cyan Tint background) */}
          <div className="p-4 rounded-[10px] border border-[#1A335A]/10 space-y-3" style={{ backgroundColor: '#5AE3ED1C' }}>
            <div className="text-[11px] font-bold text-[#000000] tracking-wide uppercase mb-1">
              Ubah Kombinasi Aturan:
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Dropdown Pewarna */}
              <div>
                <label className="block text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-1">Pewarna</label>
                <select
                  value={jenisPewarna}
                  onChange={(e) => setJenisPewarna(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full h-[36px] px-2 rounded-[6px] border border-[#1A335A] text-[#000000] text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1A335A] font-semibold cursor-pointer disabled:opacity-60"
                >
                  <option value="alami">Alami</option>
                  <option value="sintetis">Sintetis</option>
                </select>
              </div>

              {/* Dropdown Lebar */}
              <div>
                <label className="block text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-1">Lebar Kain</label>
                <select
                  value={lebar}
                  onChange={(e) => setLebar(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full h-[36px] px-2 rounded-[6px] border border-[#1A335A] text-[#000000] text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1A335A] font-semibold cursor-pointer disabled:opacity-60"
                >
                  <option value="70">70 cm</option>
                  <option value="110">110 cm</option>
                </select>
              </div>
            </div>

            {/* Dropdown Pilihan Motif */}
            <div>
              <label className="block text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-1">Motif Aturan</label>
              <select
                value={motifId}
                onChange={(e) => setMotifId(e.target.value)}
                disabled={isSubmitting}
                className="w-full h-[36px] px-2 rounded-[6px] border border-[#1A335A] text-[#000000] text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1A335A] font-semibold cursor-pointer disabled:opacity-60"
              >
                <option value="">Umum (Tanpa Motif)</option>
                {motifOptions.map((mot) => (
                  <option key={mot.id} value={String(mot.id)}>
                    {mot.nama}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Input Nominal Harga Per Meter */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#000000] uppercase tracking-wider mb-1">Harga Per Meter Baru</label>
            <div className="relative flex items-center">
              <span className="absolute text-sm font-bold text-gray-500 left-3">Rp</span>
              <input
                type="text"
                value={hargaPerMeter}
                onChange={(e) => setHargaPerMeter(formatRibuan(e.target.value))}
                disabled={isSubmitting}
                placeholder="0"
                className="w-full h-[46px] pl-9 pr-3 rounded-[10px] border border-[#1A335A] text-[#000000] text-sm focus:outline-none focus:ring-1 focus:ring-[#1A335A] transition-all font-semibold disabled:opacity-60"
                style={{ backgroundColor: '#5AE3ED1C' }}
                required
              />
            </div>
            <div className="text-[12px] text-gray-500 font-medium pl-0.5 pt-0.5">
              Harga Sebelumnya: Rp {hargaAsli ? parseFloat(hargaAsli).toLocaleString('id-ID') : '0'},00
            </div>
          </div>

          {errorMessage && <p className="text-xs text-red-500 mt-2 font-medium">{errorMessage}</p>}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1A335A]/10 mt-5">
            <button 
              type="button" 
              onClick={handleClose} 
              disabled={isSubmitting} 
              className="min-w-[89px] h-[33px] px-4 rounded-md border border-[#1A335A] text-[#1A335A] hover:bg-[#1A335A]/5 text-xs font-bold transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting || !hargaPerMeter || !adaPerubahan} 
              className="min-w-[89px] h-[33px] px-4 rounded-md bg-[#1A335A] hover:bg-[#122440] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={14} />
                  <span>Update...</span>
                </>
              ) : (
                'Simpan'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}