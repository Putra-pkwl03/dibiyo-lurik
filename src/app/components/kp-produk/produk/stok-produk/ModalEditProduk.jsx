'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Loader2, ThumbsUp, Upload } from 'lucide-react'
import Swal from 'sweetalert2'
import { 
  BACKDROP_STYLE, 
  JENIS_PEWARNA_OPTIONS, 
  FormField, 
  SelectInput 
} from './ProdukFormHelper'

export default function ModalEditProduk({
  isOpen, 
  productId, 
  onClose, 
  onSuccess, 
  categories = [], 
  motifs = [], 
  raks = [], 
  prices = []  
}) {
  // ── State Form Utama ──
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [kategoriId, setKategoriId] = useState('')
  const [motifId, setMotifId] = useState('')
  const [jenisPewarna, setJenisPewarna] = useState('Sintetis')
  
  // State untuk mengunci tanggal + karakter random asli bawaan produk
  const [existingSuffix, setExistingSuffix] = useState('')

  // ── State Kontrol UI ──
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const isFormValid = kategoriId && motifId && jenisPewarna

  // ── 1. LIVE GENERATE KODE PRODUKSI UPSTREAM ──
  const selectedKategori = categories.find(c => c.id === kategoriId)
  const selectedMotif = motifs.find(m => m.id === motifId)

  const motifInitials = (selectedMotif?.nama || "M")
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase();

  const catInitial = (selectedKategori?.nama || "K").charAt(0).toUpperCase();

  const kodeProduksiPreview = existingSuffix 
    ? `${motifInitials}-${catInitial}${existingSuffix}`
    : '— Melengkapi Data —'

  // ── 2. AMBIL DETAIL DATA PRODUK DARI DATABASE ──
  useEffect(() => {
    if (!isOpen || !productId) return

    const loadProduk = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/produk/${productId}`, { credentials: 'include' })
        const result = await res.json()
        if (!res.ok) throw new Error(result.message || 'Gagal memuat data produk')

        const p = result.data
        setImagePreview(p.gambar_url || null)
        setKategoriId(p.kategori?.id || '')
        setMotifId(p.motif?.id || '')
        setJenisPewarna(p.jenis_pewarna ? (p.jenis_pewarna.charAt(0).toUpperCase() + p.jenis_pewarna.slice(1)) : 'Sintetis')

        if (p.kode_produksi && p.kode_produksi.includes('-')) {
          const parts = p.kode_produksi.split('-')
          const suffix = parts[1] ? parts[1].substring(1) : '' 
          setExistingSuffix(suffix)
        } else {
          const now = new Date()
          const dateStr = `${String(now.getDate()).padStart(2, '0')}${String(now.getMonth() + 1).padStart(2, '0')}${now.getFullYear()}`
          const randomStr = Math.random().toString(36).substring(2, 4).toUpperCase()
          setExistingSuffix(`${dateStr}${randomStr}`)
        }

      } catch (err) {
        Swal.fire({ title: 'Gagal Memuat', text: err.message, icon: 'error', confirmButtonColor: '#A3704C' })
        onClose()
      } finally {
        setIsLoading(false)
      }
    }

    loadProduk()
  }, [isOpen, productId])

  if (!isOpen || !mounted) return null

  // ── HANDLER UTAMA FORM ──
  const handleClose = () => {
    if (isSubmitting) return
    setImageFile(null)
    setImagePreview(null)
    setExistingSuffix('')
    setErrorMsg('')
    onClose()
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return setErrorMsg('File harus berupa gambar')
    
    setErrorMsg('')
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  // ── SUBMIT UPDATE (PATCH DATA) ──
  const handleSubmit = async (e) => {
    e.preventDefault?.()
    setErrorMsg('')

    if (!isFormValid) return setErrorMsg('Pastikan seluruh informasi produk telah dilengkapi')

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('kategori_id', kategoriId)
      formData.append('motif_id', motifId)
      formData.append('jenis_pewarna', jenisPewarna.toLowerCase())
      formData.append('kode_produksi', kodeProduksiPreview) 
      if (imageFile) formData.append('image', imageFile)

      const response = await fetch(`/api/produk/${productId}`, {
        method: 'PATCH',
        credentials: 'include',
        body: formData
      })
      const result = await response.json().catch(() => ({}))

      if (!response.ok) throw new Error(result.message || 'Gagal memperbarui produk')

      setIsSubmitting(false)
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        handleClose()
        if (onSuccess) onSuccess()
      }, 1600)

    } catch (err) {
      setIsSubmitting(false)
      Swal.fire({ title: 'Gagal', text: err.message, icon: 'error', confirmButtonColor: '#A3704C' })
    }
  }

  // ── MODAL SUCCESS VIEW ──
  if (showSuccess) {
    return createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ ...BACKDROP_STYLE, backgroundColor: 'rgba(26, 51, 90, 0.4)' }}>
        <div className="bg-white rounded-[20px] shadow-xl w-full max-w-[372px] py-12 px-6 flex flex-col items-center relative animate-in fade-in zoom-in-95 duration-150">
          <button 
            type="button"
            onClick={() => { 
              setShowSuccess(false); 
              handleClose(); 
              if (onSuccess) onSuccess(); 
            }} 
            className="absolute top-4 right-4 text-[#1A335A] hover:opacity-80 transition-opacity"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
          <ThumbsUp size={56} className="text-[#1A335A] mb-5" strokeWidth={1.5} />
          <p className="text-[#1A335A] text-[18px] font-bold text-center">Produk Berhasil Diperbarui</p>
        </div>
      </div>,
      document.body
    )
  }

// ── MAIN MODAL FORM VIEW ──
  return createPortal(
    <div className="fixed inset-0 w-screen h-screen z-[9998] flex items-center justify-center bg-[#1A335A]/40 backdrop-blur-[2px] p-4 cursor-default animate-in fade-in duration-100">
      <div className="absolute inset-0" onClick={!isSubmitting ? handleClose : undefined} />

      {/* Padding disesuaikan jadi p-4, max-w dibuat 640px agar grid 2 kolom di bawahnya presisi */}
      <div className="relative bg-white shadow-2xl rounded-[24px] w-full max-w-[640px] max-h-[95vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-4 space-y-4">
        
        {/* Header Title */}
        <div className="flex items-center justify-between flex-shrink-0">
          <h3 className="text-[20px] font-semibold text-[#1A335A] tracking-tight">Edit Informasi Produk</h3>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-[#1A335A]/70 hover:text-[#1A335A] transition-colors rounded-full"
          >
            <X size={22} strokeWidth={2.5} />
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-3 py-24">
            <Loader2 className="animate-spin text-[#1A335A]" size={36} />
            <p className="text-xs font-semibold text-[#1A335A]/60">Memuat detail data kain...</p>
          </div>
        ) : (
          <>
            {/* Wrapper Content Area */}
            <div className="flex-1 flex flex-col gap-4 text-xs text-gray-700">
              
              {/* 1. GAMBAR PRODUK (DI BAGIAN ATAS - BANNER MELEBAR BANGET BIAR GA SCROLL) */}
              <div className="space-y-1.5 flex-shrink-0">
                <label className="block text-[13px] font-semibold text-[#1A335A]">Gambar Produk</label>
                <label className="block cursor-pointer">
                  <div className="w-full aspect-[16/5] rounded-[14px] overflow-hidden border-2 border-dashed border-[#1A335A]/30 flex items-center justify-center hover:bg-[#EBF5FA]/40 transition-colors shadow-sm"
                    style={{ backgroundColor: imagePreview ? 'transparent' : '#F4F7FA' }}>
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="object-cover w-full h-full" />
                    ) : (
                      <div className="flex items-center gap-2 text-[#1A335A]/70 p-4">
                        <Upload size={20} strokeWidth={2} />
                        <span className="text-xs font-semibold">Klik area ini untuk mengganti gambar produk</span>
                      </div>
                    )}
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" disabled={isSubmitting} />
                </label>
              </div>

              {/* 2. KOLOM INPUT DI BAWAH (GRID: KIRI 2, KANAN 2) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4 items-start">
                
                {/* [KANAN - BARIS 2] Live Preview Kode Produksi */}
                <div className="bg-[#EBF5FA] border border-blue-100 rounded-[14px] p-3 flex flex-col gap-0.5 shadow-sm h-[58px] justify-center md:mt-1">
                  <span className="text-[10px] font-bold text-[#1A335A]/60 uppercase tracking-wider">Preview Kode Produksi</span>
                  <div className="text-[15px] font-mono font-bold text-[#1A335A] tracking-wide truncate">
                    {kodeProduksiPreview}
                  </div>
                  </div>
                  
                {/* [KIRI - BARIS 1] Kategori */}
                <FormField label="Kategori">
                  <SelectInput
                    value={kategoriId}
                    onChange={(e) => setKategoriId(e.target.value)}
                    disabled={isSubmitting}
                    options={categories.map(c => ({ value: c.id, label: c.nama }))}
                    placeholder="— Pilih Kategori —"
                    customBg="#EBF5FA"
                    textColor="#1A335A"
                  />
                </FormField>

                {/* [KANAN - BARIS 1] Motif */}
                <FormField label="Motif">
                  <SelectInput
                    value={motifId}
                    onChange={(e) => setMotifId(e.target.value)}
                    disabled={isSubmitting}
                    options={motifs.map(m => ({ value: m.id, label: m.nama }))}
                    placeholder="— Pilih Motif —"
                    customBg="#EBF5FA"
                    textColor="#1A335A"
                  />
                </FormField>

                {/* [KIRI - BARIS 2] Jenis Pewarna */}
                <FormField label="Jenis Pewarna">
                  <SelectInput
                    value={jenisPewarna}
                    onChange={(e) => setJenisPewarna(e.target.value)}
                    disabled={isSubmitting}
                    options={JENIS_PEWARNA_OPTIONS.map(j => ({ value: j, label: j }))}
                    customBg="#EBF5FA"
                    textColor="#1A335A"
                  />
                </FormField>


              </div>

              {errorMsg && (
                <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-[8px] px-3 py-2 font-medium animate-in fade-in duration-200">
                  {errorMsg}
                </p>
              )}
            </div>

            {/* Footer Form Simpan Aksi */}
            <div className="flex justify-end flex-shrink-0 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !isFormValid}
                className={`px-8 py-2.5 rounded-[12px] text-sm font-semibold flex items-center gap-2 transition-all shadow-md ${
                  !isFormValid || isSubmitting
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-70'
                    : 'bg-[#1A335A] hover:bg-[#132644] text-white active:scale-[0.98]'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  'Simpan Perubahan'
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  )
}
  