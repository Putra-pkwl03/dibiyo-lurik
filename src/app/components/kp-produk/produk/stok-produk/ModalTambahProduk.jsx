// D:\dibiyo-lurik\src\app\components\kp-produk\produk\stok-produk\ModalTambahProduk.jsx
'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Loader2, ThumbsUp, Plus, Trash2, Upload, Lock } from 'lucide-react'
import Swal from 'sweetalert2'
import { 
  BACKDROP_STYLE, 
  JENIS_PEWARNA_OPTIONS, 
  FormField, 
  SelectInput, 
  GulunganRow 
} from './ProdukFormHelper'

export default function ModalTambahProduk({
  isOpen, onClose, onSuccess, categories = [], motifs = [], raks = [], prices = []
}) {
  // ── Form state utama ──
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [kategoriId, setKategoriId] = useState('')
  const [motifId, setMotifId] = useState('')
  const [jenisPewarna, setJenisPewarna] = useState('Sintetis')
  
  const [gulungans, setGulungans] = useState([])

  // ── Form gulungan inline ──
  const [tempLebar, setTempLebar] = useState('110')
  const [tempPanjang, setTempPanjang] = useState('')
  const [tempRakId, setTempRakId] = useState('') 
  const [tempHarga, setTempHarga] = useState(0)
  const [inlineError, setInlineError] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Logika pembuka Gate Kunci Gulungan
  const isProductInfoComplete = imageFile && kategoriId && motifId && jenisPewarna

  // ── PRE-COMPUTE MENGGUNAKAN Loose Equality (==) AGAR COCOK DENGAN DATA PARENT ──
  const selectedMotifNama = motifs.find(m => m.id == motifId)?.nama || '';
  const pricesSerialized = JSON.stringify(prices); 

  const isBlokLurik = selectedMotifNama.toLowerCase() === 'blok lurik';
  
  useEffect(() => {
    if (isBlokLurik) {
      setTempLebar('110')
    }
  }, [isBlokLurik])

  // ── LOGIKA AUTO-FILL HARGA UTAMANYA (Menggunakan == untuk mitigasi string vs number) ──
  useEffect(() => {
    if (!isOpen || !jenisPewarna || !tempLebar || !isProductInfoComplete) {
      setTempHarga(0)
      return
    }

    if (isBlokLurik && tempLebar !== '110') {
      setTempHarga(0)
      return
    }

    const lebarInt = parseInt(tempLebar)
    const pewarnaLower = jenisPewarna.toLowerCase()

    // Mencari harga berdasarkan kecocokan motif spesifik
    let matchedPrice = prices.find(p => 
      p.jenis_pewarna?.toLowerCase() === pewarnaLower &&
      p.lebar === lebarInt &&
      p.motif?.id == motifId
    )

    // Jika tidak ada harga spesifik motif, cari harga default (motif null)
    if (!matchedPrice) {
      matchedPrice = prices.find(p => 
        p.jenis_pewarna?.toLowerCase() === pewarnaLower &&
        p.lebar === lebarInt &&
        (p.motif === null || p.motif_id === null)
      )
    }

    setTempHarga(matchedPrice?.harga_per_meter || 0)
    setInlineError(matchedPrice ? '' : 'Harga tidak ditemukan untuk kombinasi ini.')
  }, [isOpen, jenisPewarna, motifId, tempLebar, pricesSerialized, isProductInfoComplete, isBlokLurik])

  useEffect(() => {
    if (!isProductInfoComplete && gulungans.length > 0) {
      setGulungans([])
    }
  }, [isProductInfoComplete])

  if (!isOpen || !mounted) return null

  // ── HANDLERS ──
  const resetForm = () => {
    setImageFile(null); setImagePreview(null); setKategoriId(''); setMotifId('');
    setJenisPewarna('Sintetis'); setGulungans([]); setTempPanjang(''); setTempRakId('');
    setTempHarga(0); setInlineError(''); setErrorMsg('');
  }

  const handleClose = () => {
    if (isSubmitting) return
    resetForm()
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

  const handleAddGulunganInline = () => {
    setInlineError('')

    if (isBlokLurik && tempLebar !== '110') {
      return setInlineError('Untuk motif Blok Lurik, hanya tersedia ukuran lebar 110 cm.')
    }

    if (!tempPanjang || tempHarga <= 0 || !tempRakId) {
      return setInlineError('Lengkapi panjang, lokasi rak & pastikan harga valid')
    }
    
    setGulungans(prev => [...prev, {
      lebar: parseInt(tempLebar),
      panjang_total: parseFloat(tempPanjang),
      harga_per_meter: tempHarga,
      rak_id: tempRakId 
    }])
    setTempPanjang('')
    setTempRakId('')
  }

  const handleRemoveGulungan = (idx) => {
    setGulungans(prev => prev.filter((_, i) => i !== idx))
  }

  const isFormValid = isProductInfoComplete && gulungans.length > 0

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('kategori_id', kategoriId)
      formData.append('motif_id', motifId)
      formData.append('jenis_pewarna', jenisPewarna.toLowerCase())
      if (imageFile) formData.append('image', imageFile)

      const gulungansForApi = gulungans.map(g => ({
        lebar_gulungan: g.lebar,
        panjang_gulungan: g.panjang_total,
        harga_per_meter: g.harga_per_meter,
        rak_id: g.rak_id,
      }))
      formData.append('gulungans', JSON.stringify(gulungansForApi))

      const response = await fetch('/api/produk', { method: 'POST', credentials: 'include', body: formData })
      const result = await response.json().catch(() => ({}))
      
      if (!response.ok) throw new Error(result.message || 'Gagal menyimpan produk')

      setShowSuccess(true)
      setTimeout(() => { setShowSuccess(false); resetForm(); onClose(); onSuccess(); }, 1600)
    } catch (err) {
      Swal.fire({ title: 'Gagal Menyimpan', text: err.message, icon: 'error', confirmButtonColor: '#A3704C' })
    } finally {
      setIsSubmitting(false)
    }
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
      <div className="absolute inset-0" onClick={handleClose} />

      {/* Tampilan Modal Sukses */}
      {showSuccess ? (
        <div className="bg-white rounded-[24px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.15)] w-full max-w-[360px] py-10 px-6 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-150 border border-gray-50 z-[9999]">
          <ThumbsUp size={64} className="text-[#A3704C] mb-6" strokeWidth={1.5} />
          <p className="text-[#A3704C] text-[16px] font-medium text-center tracking-wide">
            Produk Berhasil ditambah
          </p>
        </div>
      ) : (
        <div className="relative bg-white shadow-2xl rounded-[24px] w-full max-w-[760px] max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6 space-y-4">
          
          {/* Header Modal Title */}
          <div className="flex items-center justify-between flex-shrink-0">
            <h3 className="text-[22px] font-medium text-[#a47352] tracking-tight">Tambah Produk</h3>
            <button 
              onClick={handleClose} 
              disabled={isSubmitting} 
              className="text-[#a47352] hover:text-[#8c5f3f] transition-colors rounded-full"
            >
              <X size={24} strokeWidth={2.5} />
            </button>
          </div>
          
          {/* Form Body Container */}
          <div className="overflow-y-auto custom-scrollbar flex-1 pr-1 space-y-5 text-xs text-[#5C4033]">
            
            {/* Uploader Gambar */}
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-[#a47352]">Gambar Produk <span className="text-red-500">*</span></label>
              <label className="block cursor-pointer">
                <div 
                  className="w-full aspect-[16/6] rounded-[14px] overflow-hidden border-2 border-dashed border-[#D4C5B9] flex items-center justify-center hover:bg-[#F5EBE1]/40 transition-colors shadow-sm"
                  style={{ backgroundColor: imagePreview ? 'transparent' : '#F5EBE1' }}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="object-cover w-full h-full" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-[#a47352]/70">
                      <Upload size={32} strokeWidth={2} />
                      <span className="text-xs font-semibold">Klik area ini untuk unggah gambar motif produk</span>
                    </div>
                  )}
                </div>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" disabled={isSubmitting} />
              </label>
            </div>

            {/* Form Fields Utama Produk */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField label={<>Kategori <span className="text-red-500">*</span></>}>
                <SelectInput value={kategoriId} onChange={(e) => setKategoriId(e.target.value)} disabled={isSubmitting} options={categories.map(c => ({ value: c.id, label: c.nama }))} placeholder="— Pilih Kategori —" />
              </FormField>
              <FormField label={<>Motif <span className="text-red-500">*</span></>}>
                <SelectInput value={motifId} onChange={(e) => setMotifId(e.target.value)} disabled={isSubmitting} options={motifs.map(m => ({ value: m.id, label: m.nama }))} placeholder="— Pilih Motif —" />
              </FormField>
              <FormField label={<>Jenis Pewarna <span className="text-red-500">*</span></>}>
                <SelectInput value={jenisPewarna} onChange={(e) => setJenisPewarna(e.target.value)} disabled={isSubmitting} options={JENIS_PEWARNA_OPTIONS.map(j => ({ value: j, label: j }))} />
              </FormField>
            </div>

            <div className="border-t border-[#D4C5B9]/40 pt-1" />

            {/* Bagian Input Gulungan Kain Container */}
            <div className="space-y-4">
              <div className="p-4 rounded-[16px] border border-[#D4C5B9]/40 space-y-4 bg-[#F5EBE1]/40">
                
                {!isProductInfoComplete && (
                  <div className="flex items-start gap-2 text-[#a47352]">
                    <Lock size={16} className="flex-shrink-0 mt-0.5 opacity-80" strokeWidth={2.5} />
                    <span className="text-[13px] font-medium leading-tight">
                      Lengkapi <b>Gambar, Kategori, Motif,</b> dan <b>Jenis Pewarna</b> terlebih dahulu untuk membuka form Data Gulungan.
                    </span>
                  </div>
                )}

                <div className={`space-y-4 transition-opacity duration-200 ${!isProductInfoComplete ? 'opacity-40 pointer-events-none select-none' : ''}`}>
                  
                  {/* Grid Input Gulungan Horizontal */}
                  <div className="grid items-end grid-cols-1 gap-3 sm:grid-cols-4">
                    <FormField label="Lebar (cm)">
                      <SelectInput 
                        value={tempLebar} 
                        onChange={(e) => setTempLebar(e.target.value)} 
                        disabled={isSubmitting || !isProductInfoComplete} 
                        options={
                          isBlokLurik 
                            ? [{ value: '110', label: '110 cm' }] 
                            : [{ value: '70', label: '70 cm' }, { value: '110', label: '110 cm' }]
                        } 
                        customBg="white" 
                      />
                    </FormField>

                    <FormField label="Panjang (m)">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={tempPanjang}
                        onChange={(e) => setTempPanjang(e.target.value)}
                        disabled={isSubmitting || !isProductInfoComplete}
                        placeholder="Masukkan Panjang"
                        className="w-full h-[40px] px-4 bg-white border border-[#D4C5B9] rounded-[12px] outline-none text-[#a47352] font-semibold placeholder-[#a47352]/40 focus:border-[#a47352] duration-150 text-xs shadow-sm"
                      />
                    </FormField>

                    <FormField label="Lokasi Rak">
                      <SelectInput 
                        value={tempRakId} 
                        onChange={(e) => setTempRakId(e.target.value)} 
                        disabled={isSubmitting || !isProductInfoComplete} 
                        options={raks.map(r => ({ value: r.id, label: `Rak ${r.nama}` }))} 
                        placeholder="Pilih Rak" 
                        customBg="white"
                      />
                    </FormField>

                    <FormField label="Harga/Meter (Auto)">
                      <div className="relative flex items-center shadow-sm rounded-[12px] overflow-hidden">
                        <span className="absolute text-xs font-bold text-[#a47352]/60 left-4">Rp</span>
                        <input 
                          type="text" 
                          value={tempHarga > 0 ? tempHarga.toLocaleString('id-ID') : '-'} 
                          disabled 
                          className="w-full h-[40px] pl-10 pr-4 bg-white/70 border border-[#D4C5B9] text-[#a47352] font-bold cursor-not-allowed select-none outline-none text-xs" 
                        />
                      </div>
                    </FormField>
                  </div>

                  {inlineError && <p className="text-xs text-red-500 font-semibold pl-0.5">{inlineError}</p>}

                  <button
                    type="button"
                    onClick={handleAddGulunganInline}
                    disabled={isSubmitting || !isProductInfoComplete || !tempPanjang || tempHarga <= 0 || !tempRakId}
                    className="w-full h-[40px] rounded-[12px] bg-[#A3704C] hover:bg-[#8c5f3f] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Plus size={15} strokeWidth={2.5} />
                    <span>Tambah Gulungan ke Daftar</span>
                  </button>
                </div>
              </div>

              {/* List Tampilan Gulungan Row (Menggunakan == untuk pencarian nama rak) */}
              <div className="rounded-[14px] border border-[#D4C5B9]/50 overflow-hidden bg-white shadow-sm">
                {gulungans.length === 0 ? (
                  <p className="text-center text-[#a47352]/50 font-medium py-6 px-4">Belum ada gulungan kain yang dimasukkan ke daftar.</p>
                ) : (
                  <div className="divide-y divide-[#D4C5B9]/30">
                    {gulungans.map((g, idx) => (
                      <GulunganRow
                        key={idx}
                        index={idx}
                        gulungan={g}
                        rakName={raks.find(r => r.id == g.rak_id)?.nama ? `Rak ${raks.find(r => r.id == g.rak_id).nama}` : '-'}
                        onRemove={() => handleRemoveGulungan(idx)}
                        disabled={isSubmitting}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {errorMsg && <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-[8px] px-3 py-2 mt-2 font-medium">{errorMsg}</p>}
          </div>

          {/* Action Footer Button Submit Simpan */}
          <div className="flex justify-end flex-shrink-0 pt-2">
            <button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !isFormValid} 
              className="bg-[#A3704C] hover:bg-[#8c5f3f] text-white px-8 py-2.5 rounded-[12px] text-sm font-medium flex items-center gap-2 transition-all shadow-md active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <><Loader2 className="animate-spin" size={16}/><span>Menyimpan...</span></> : 'Simpan Produk'}
            </button>
          </div>
        </div>
      )}
    </div>,
    document.body
  )
}