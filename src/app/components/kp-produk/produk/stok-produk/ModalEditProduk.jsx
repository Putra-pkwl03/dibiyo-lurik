'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Loader2, ThumbsUp, Trash2, Upload } from 'lucide-react'
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
  // ── State Form Utama (Tanpa rakId di tingkat Produk) ──
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [kategoriId, setKategoriId] = useState('')
  const [motifId, setMotifId] = useState('')
  const [jenisPewarna, setJenisPewarna] = useState('Sintetis')
  
  // ── Gulungan Tracking ──
  const [gulungans, setGulungans] = useState([])
  const [deletedGulunganIds, setDeletedGulunganIds] = useState([])

  // ── State Kontrol UI ──
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const isProductInfoComplete = kategoriId && motifId && jenisPewarna

  // ── PRE-COMPUTE UNTUK MENGAMANKAN DEPENDENCY ARRAY EFFECT DARI RESET SIZE RENDERS ──
  const selectedMotifNama = motifs.find(m => m.id === motifId)?.nama || '';
  const isBlokLurik = selectedMotifNama.toLowerCase() === 'blok lurik';
  const pricesSerialized = JSON.stringify(prices); 

  // ── 1. AMBIL DETAIL DATA PRODUK DARI DATABASE ──
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

        // Map data dari DB ke state agar properti harga_per_meter konsisten
        setGulungans((p.gulungan || []).map(g => ({
          id: g.id,
          nomor_gulungan: g.nomor_gulungan,
          lebar: g.lebar || 110,
          panjang_total: g.panjang_total || 0, 
          harga_per_meter: g.harga || g.harga_per_meter || 0, 
          rak_id: g.rak_id || (g.rak?.id || '')
        })))
        setDeletedGulunganIds([])
      } catch (err) {
        Swal.fire({ title: 'Gagal Memuat', text: err.message, icon: 'error', confirmButtonColor: '#A3704C' })
        onClose()
      } finally {
        setIsLoading(false)
      }
    }

    loadProduk()
  }, [isOpen, productId])

  // ── 2. LOGIKA AUTO-FILL HARGA & SYNC UKURAN ATURAN KHUSUS BLOK LURIK ──
  useEffect(() => {
    if (!isOpen || !isProductInfoComplete || gulungans.length === 0) return

    setGulungans(prevGulungans => 
      prevGulungans.map(g => {
        // Aturan Khusus: Jika motif diubah ke Blok Lurik, otomatis kunci lebar ke 110 cm
        const targetLebar = isBlokLurik ? 110 : g.lebar;
        const pewarnaLower = jenisPewarna.toLowerCase()
        
        let matchedPrice = prices.find(p => 
          p.jenis_pewarna?.toLowerCase() === pewarnaLower &&
          p.lebar === targetLebar &&
          p.motif?.id === motifId
        )

        if (!matchedPrice) {
          matchedPrice = prices.find(p => 
            p.jenis_pewarna?.toLowerCase() === pewarnaLower &&
            p.lebar === targetLebar &&
            (p.motif === null || p.motif_id === null)
          )
        }

        return {
          ...g,
          lebar: targetLebar,
          harga_per_meter: matchedPrice?.harga_per_meter || g.harga_per_meter
        }
      })
    )
  }, [jenisPewarna, motifId, pricesSerialized, isProductInfoComplete, isBlokLurik, isOpen])

  if (!isOpen || !mounted) return null

  // ── HANDLER UTAMA FORM ──
  const handleClose = () => {
    if (isSubmitting) return
    setImageFile(null)
    setImagePreview(null)
    setDeletedGulunganIds([])
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

  // Handler Perubahan Lebar per Gulungan + Auto Kalkulasi Harga Master
  const handleUpstreamLebarChange = (idx, val) => {
    const lebarInt = parseInt(val)
    setGulungans(prev => prev.map((g, i) => {
      if (i !== idx) return g

      const pewarnaLower = jenisPewarna.toLowerCase()
      let matchedPrice = prices.find(p => 
        p.jenis_pewarna?.toLowerCase() === pewarnaLower &&
        p.lebar === lebarInt &&
        p.motif?.id === motifId
      )

      if (!matchedPrice) {
        matchedPrice = prices.find(p => 
          p.jenis_pewarna?.toLowerCase() === pewarnaLower &&
          p.lebar === lebarInt &&
          (p.motif === null || p.motif_id === null)
        )
      }

      return {
        ...g,
        lebar: lebarInt,
        harga_per_meter: matchedPrice?.harga_per_meter || 0
      }
    }))
  }

  // Handler Perubahan Panjang per Gulungan
  const handleUpstreamPanjangChange = (idx, val) => {
    setGulungans(prev => prev.map((g, i) => i === idx ? { ...g, panjang_total: parseFloat(val) || 0 } : g))
  }

  // Handler Perubahan Lokasi Rak per Gulungan
  const handleUpstreamRakChange = (idx, val) => {
    setGulungans(prev => prev.map((g, i) => i === idx ? { ...g, rak_id: val } : g))
  }

  const handleRemoveGulungan = (idx) => {
    const g = gulungans[idx]
    if (g.id) {
      setDeletedGulunganIds(prev => [...prev, g.id])
    }
    setGulungans(prev => prev.filter((_, i) => i !== idx))
  }

  const isFormValid = isProductInfoComplete && gulungans.length > 0

  // ── SUBMIT UPDATE (PATCH DATA) ──
  const handleSubmit = async (e) => {
    e.preventDefault?.()
    setErrorMsg('')

    if (!isFormValid) return setErrorMsg('Pastikan informasi lengkap dan minimal menyisakan 1 gulungan kain')

    // Validasi Akhir untuk Aturan Khusus Blok Lurik
    if (isBlokLurik) {
      const adaLebarIlegal = gulungans.some(g => g.lebar !== 110)
      if (adaLebarIlegal) {
        return setErrorMsg('Untuk motif Blok Lurik, seluruh lebar gulungan kain wajib berukuran 110 cm.')
      }
    }

    // Pastikan semua gulungan sudah memilih lokasi rak penyimpanan
    const adaRakKosong = gulungans.some(g => !g.rak_id)
    if (adaRakKosong) {
      return setErrorMsg('Harap tentukan Lokasi Rak untuk setiap gulungan kain yang terdaftar.')
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('kategori_id', kategoriId)
      formData.append('motif_id', motifId)
      formData.append('jenis_pewarna', jenisPewarna.toLowerCase())
      if (imageFile) formData.append('image', imageFile)

      // Payload dipetakan agar sesuai dengan skema 'gulungan_data' pada API PATCH
      const gulunganPayload = gulungans.map(g => ({
        id: g.id || undefined,
        lebar: g.lebar,
        panjang_total: g.panjang_total,
        harga_per_meter: g.harga_per_meter,
        rak_id: g.rak_id
      }))

      formData.append('gulungan_data', JSON.stringify(gulunganPayload))
      formData.append('deleted_gulungan_ids', JSON.stringify(deletedGulunganIds))

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

  if (showSuccess) {
    return createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={BACKDROP_STYLE}>
        <div className="bg-white rounded-[20px] shadow-xl w-full max-w-[372px] py-12 px-6 flex flex-col items-center animate-in fade-in zoom-in-95 duration-150">
          <ThumbsUp size={56} className="text-[#A3704C] mb-5" strokeWidth={1.5} />
          <p className="text-[#A3704C] text-[18px] font-bold text-center">Produk Berhasil Diperbarui</p>
        </div>
      </div>,
      document.body
    )
  }

  return createPortal(
    <div className="fixed inset-0 w-screen h-screen z-[9998] flex items-center justify-center bg-[#ae834e]/53 backdrop-blur-[2px] p-4 cursor-default animate-in fade-in duration-100">
      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: rgba(164, 115, 82, 0.05); border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(164, 115, 82, 0.4); border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(164, 115, 82, 0.6); }
        `}
      </style>
      <div className="absolute inset-0" onClick={!isSubmitting ? handleClose : undefined} />

      <div className="relative bg-white shadow-2xl rounded-[24px] w-full max-w-[760px] max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6 space-y-4">
        
        {/* Header Title */}
        <div className="flex justify-between items-center flex-shrink-0">
          <h3 className="text-[22px] font-medium text-[#a47352] tracking-tight">Edit Produk</h3>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-[#a47352] hover:text-[#8c5f3f] transition-colors rounded-full"
          >
            <X size={24} strokeWidth={2.5} />
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3 flex-1">
            <Loader2 className="animate-spin text-[#A3704C]" size={36} />
            <p className="text-xs font-semibold text-[#a47352]/60">Memuat detail data kain...</p>
          </div>
        ) : (
          <>
            <div className="overflow-y-auto custom-scrollbar flex-1 pr-1 space-y-5 text-xs text-[#5C4033]">
              
              {/* Gambar Uploader Banner Melengkung */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-[#a47352]">Gambar Produk</label>
                <label className="block cursor-pointer">
                  <div className="w-full aspect-[16/6] rounded-[14px] overflow-hidden border-2 border-dashed border-[#D4C5B9] flex items-center justify-center hover:bg-[#F5EBE1]/40 transition-colors shadow-sm"
                    style={{ backgroundColor: imagePreview ? 'transparent' : '#F5EBE1' }}>
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-[#a47352]/70">
                        <Upload size={32} strokeWidth={2} />
                        <span className="text-xs font-semibold">Klik area ini untuk mengganti gambar produk</span>
                      </div>
                    )}
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" disabled={isSubmitting} />
                </label>
              </div>

              {/* Grid Form Input Utama Produk (3 Kolom Tanpa Rak Utama) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField label="Kategori">
                  <SelectInput
                    value={kategoriId}
                    onChange={(e) => setKategoriId(e.target.value)}
                    disabled={isSubmitting}
                    options={categories.map(c => ({ value: c.id, label: c.nama }))}
                    placeholder="— Pilih Kategori —"
                  />
                </FormField>

                <FormField label="Motif">
                  <SelectInput
                    value={motifId}
                    onChange={(e) => setMotifId(e.target.value)}
                    disabled={isSubmitting}
                    options={motifs.map(m => ({ value: m.id, label: m.nama }))}
                    placeholder="— Pilih Motif —"
                  />
                </FormField>

                <FormField label="Jenis Pewarna">
                  <SelectInput
                    value={jenisPewarna}
                    onChange={(e) => setJenisPewarna(e.target.value)}
                    disabled={isSubmitting}
                    options={JENIS_PEWARNA_OPTIONS.map(j => ({ value: j, label: j }))}
                  />
                </FormField>
              </div>

              <div className="border-t border-[#D4C5B9]/40 pt-1" />

              {/* ── BAGIAN LIST UPSTREAM EDIT GULUNGAN KAIN ── */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#a47352]">Daftar Gulungan Kain ({gulungans.length})</h4>
                  {deletedGulunganIds.length > 0 && (
                    <span className="text-[11px] text-red-500 font-semibold animate-pulse">
                      ({deletedGulunganIds.length} gulungan kain akan dihapus permanent dari sistem saat disimpan)
                    </span>
                  )}
                </div>

                <div className="rounded-[14px] border border-[#D4C5B9]/50 overflow-hidden bg-white shadow-sm">
                  {gulungans.length === 0 ? (
                    <p className="text-center text-[#a47352]/50 font-medium py-6">Tidak ada gulungan kain yang tersisa pada produk ini.</p>
                  ) : (
                    <div className="divide-y divide-[#D4C5B9]/30">
                      {gulungans.map((g, idx) => (
                        <div key={g.id || idx} className="grid grid-cols-[30px_1fr_1fr_1fr_1.2fr_auto] gap-3 items-end px-4 py-3.5 bg-white hover:bg-[#F5EBE1]/10 transition-colors">
                          
                          {/* Nomor Urut (Tanpa #) */}
                          <span className="text-[#a47352]/80 font-bold text-xs pb-2.5 text-center">{idx + 1}</span>
                          
                          {/* Upstream Input Lebar Dropdown */}
                          <div>
                            <label className="block text-[11px] text-[#A3704C]/80 font-semibold mb-1.5">Lebar</label>
                            <select
                              value={g.lebar}
                              disabled={isSubmitting || isBlokLurik}
                              onChange={(e) => handleUpstreamLebarChange(idx, e.target.value)}
                              className="w-full h-[38px] px-3 bg-[#F5EBE1] border border-[#D4C5B9] rounded-[10px] outline-none text-[#a47352] font-semibold text-xs focus:border-[#a47352] cursor-pointer appearance-none disabled:opacity-80 disabled:cursor-not-allowed"
                            >
                              {isBlokLurik ? (
                                <option value="110">110 cm</option>
                              ) : (
                                <>
                                  <option value="70">70 cm</option>
                                  <option value="110">110 cm</option>
                                </>
                              )}
                            </select>
                          </div>

                          {/* Upstream Input Panjang */}
                          <div>
                            <label className="block text-[11px] text-[#A3704C]/80 font-semibold mb-1.5">Panjang (m)</label>
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              value={g.panjang_total}
                              disabled={isSubmitting}
                              onChange={(e) => handleUpstreamPanjangChange(idx, e.target.value)}
                              className="w-full h-[38px] px-3 bg-white border border-[#D4C5B9] rounded-[10px] outline-none text-[#a47352] font-semibold text-xs focus:border-[#a47352] duration-150"
                            />
                          </div>

                          {/* Upstream Input Lokasi Rak Penyimpanan */}
                          <div>
                            <label className="block text-[11px] text-[#A3704C]/80 font-semibold mb-1.5">Lokasi Rak</label>
                            <select
                              value={g.rak_id}
                              disabled={isSubmitting}
                              onChange={(e) => handleUpstreamRakChange(idx, e.target.value)}
                              className="w-full h-[38px] px-3 bg-white border border-[#D4C5B9] rounded-[10px] outline-none text-[#a47352] font-semibold text-xs focus:border-[#a47352] cursor-pointer"
                            >
                              <option value="">Pilih Rak</option>
                              {raks.map(r => (
                                <option key={r.id} value={r.id}>Rak {r.nama}</option>
                              ))}
                            </select>
                          </div>

                          {/* Preview Harga Otomatis */}
                          <div>
                            <label className="block text-[11px] text-[#A3704C]/80 font-semibold mb-1.5">Harga/m (Auto)</label>
                            <div className="h-[38px] px-3 bg-[#F5EBE1]/60 border border-[#D4C5B9] rounded-[10px] flex items-center text-[#a47352] font-bold text-xs select-none cursor-not-allowed">
                              Rp {g.harga_per_meter > 0 ? g.harga_per_meter.toLocaleString('id-ID') : '-'}
                            </div>
                          </div>

                          {/* Tombol Hapus Gulungan */}
                          <div className="pb-0.5">
                            <button
                              type="button"
                              onClick={() => handleRemoveGulungan(idx)}
                              disabled={isSubmitting}
                              className="p-2 rounded-[8px] bg-rose-500 hover:bg-rose-600 text-white transition-all shadow-sm active:scale-95 disabled:opacity-40"
                              title="Hapus Gulungan"
                            >
                              <Trash2 size={16} strokeWidth={2.5} />
                            </button>
                          </div>

                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-[8px] px-3 py-2 font-medium mt-2">
                {errorMsg}
              </p>
            )}

            {/* Footer Form Simpan Aksi */}
            <div className="flex justify-end pt-2 flex-shrink-0">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !isFormValid}
                className="bg-[#A3704C] hover:bg-[#8c5f3f] text-white px-8 py-2.5 rounded-[12px] text-sm font-medium flex items-center gap-2 transition-all shadow-md active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
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