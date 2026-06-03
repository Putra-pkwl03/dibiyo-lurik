// D:\dibiyo-lurik\src\app\components\kp-produk\produk\stok-produk\ModalTambahProduk.jsx
'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Loader2, ThumbsUp, Plus, Lock, Upload } from 'lucide-react' // <-- Di sini letak perbaikannya, 'Upload' sudah ditambahkan
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

  // State baru untuk interaksi drag and drop gambar
  const [isDragging, setIsDragging] = useState(false)

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

  if ((!isOpen && !showSuccess) || !mounted) return null

  // ── HANDLERS ──
  const resetForm = () => {
    setImageFile(null); setImagePreview(null); setKategoriId(''); setMotifId('');
    setJenisPewarna('Sintetis'); setGulungans([]); setTempPanjang(''); setTempRakId('');
    setTempHarga(0); setInlineError(''); setErrorMsg(''); setIsDragging(false);
  }

  const handleClose = () => {
    if (isSubmitting) return
    resetForm()
    onClose()
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    processImageFile(file)
  }

  // Logika Drag & Drop Gambar
  const handleDragOver = (e) => {
    e.preventDefault()
    if (isSubmitting) return
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (isSubmitting) return

    const file = e.dataTransfer.files?.[0]
    processImageFile(file)
  }

  // Fungsi utilitas helper internal pemrosesan file gambar
  const processImageFile = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) return setErrorMsg('File harus berupa gambar')
    
    setErrorMsg('')
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  // Fungsi penanganan input panjang agar tidak menumpuk di angka 0
  const handlePanjangChange = (e) => {
    let val = e.target.value;
    
    // Ganti koma ke titik untuk standarisasi float desimal
    val = val.replace(',', '.');
    
    // Validasi regex: hanya izinkan angka dan satu buah titik desimal
    if (val !== '' && !/^\d*\.?\d*$/.test(val)) return;

    // Menghilangkan zero-padding di depan angka (contoh: "02" berubah jadi "2")
    if (val.length > 1 && val.startsWith('0') && val[1] !== '.') {
      val = val.replace(/^0+/, '');
    }

    setTempPanjang(val);
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

      // Tutup form utama terlebih dahulu lewat callback parent
      onClose()
      resetForm()
      
      // Munculkan modal sukses secara terpisah selama 3 detik (3000ms)
      setShowSuccess(true)
      setTimeout(() => { 
        setShowSuccess(false); 
        onSuccess(); 
      }, 3000)

    } catch (err) {
      Swal.fire({ title: 'Gagal Menyimpan', text: err.message, icon: 'error', confirmButtonColor: '#1A335A' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 w-screen h-screen z-[9998] flex items-center justify-center bg-[#1A335A]/20 backdrop-blur-[2px] p-4 cursor-default animate-in fade-in duration-100">
      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: rgba(26, 51, 90, 0.02); border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(26, 51, 90, 0.2); border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(26, 51, 90, 0.4); }
        `}
      </style>
      <div className="absolute inset-0" onClick={handleClose} />

      {/* Tampilan Modal Sukses yang disinkronkan tampil saat form utama close */}
      {showSuccess ? (
        <div className="bg-white rounded-[16px] shadow-2xl w-full max-w-[360px] py-10 px-6 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-150 border border-gray-100 z-[9999]">
          <ThumbsUp size={64} className="text-[#1A335A] mb-6" strokeWidth={1.5} />
          <p className="text-gray-800 text-[16px] font-bold text-center tracking-wide">
            Produk Berhasil Ditambah
          </p>
        </div>
      ) : (
        isOpen && (
          <div className="relative bg-white shadow-2xl rounded-[16px] w-full max-w-[760px] max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6 space-y-4 border border-gray-100">
            
            {/* Header Modal Title */}
            <div className="flex items-center justify-between flex-shrink-0 pb-1">
              <h3 className="text-[20px] font-bold text-gray-800 tracking-tight">Tambah Produk</h3>
              <button 
                onClick={handleClose} 
                disabled={isSubmitting} 
                className="p-1 text-gray-400 transition-colors rounded-full hover:text-gray-600 hover:bg-gray-100"
              >
                <X size={22} strokeWidth={2.5} />
              </button>
            </div>
            
            {/* Form Body Container */}
            <div className="flex-1 pr-1 space-y-5 overflow-y-auto text-xs text-gray-700 custom-scrollbar">
              
              {/* Uploader Gambar (Interactive Drag & Drop) */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-semibold text-gray-700">Gambar Produk <span className="text-red-500">*</span></label>
                <label 
                  className="block cursor-pointer"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div 
                    className={`w-full aspect-[16/6] rounded-[8px] overflow-hidden border-2 border-dashed flex items-center justify-center transition-all duration-150 shadow-xs ${
                      isDragging 
                        ? 'border-[#1A335A] bg-sky-100/50 scale-[1.01]' 
                        : 'border-gray-300 hover:bg-sky-50/50'
                    }`}
                    style={{ backgroundColor: imagePreview ? 'transparent' : (isDragging ? '' : '#EBF5FA') }}
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="object-cover w-full h-full" />
                    ) : (
                      <div className={`flex flex-col items-center gap-2 transition-transform ${isDragging ? 'scale-105 text-[#1A335A]' : 'text-[#1A335A]/70'}`}>
                        <Upload size={30} className={isDragging ? 'animate-bounce' : ''} strokeWidth={2.5} />
                        <span className="text-xs font-semibold">
                          {isDragging ? 'Lepaskan gambar di sini' : 'Klik area ini atau seret gambar motif produk untuk mengunggah'}
                        </span>
                      </div>
                    )}
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" disabled={isSubmitting} />
                </label>
              </div>

              {/* Form Fields Utama Produk */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <FormField label={<>Kategori <span className="text-red-500">*</span></>}>
                  <SelectInput value={kategoriId} onChange={(e) => setKategoriId(e.target.value)} disabled={isSubmitting} options={categories.map(c => ({ value: c.id, label: c.nama }))} placeholder="— Pilih Kategori —" customBg="#EBF5FA" />
                </FormField>
                <FormField label={<>Motif <span className="text-red-500">*</span></>}>
                  <SelectInput value={motifId} onChange={(e) => setMotifId(e.target.value)} disabled={isSubmitting} options={motifs.map(m => ({ value: m.id, label: m.nama }))} placeholder="— Pilih Motif —" customBg="#EBF5FA" />
                </FormField>
                <FormField label={<>Jenis Pewarna <span className="text-red-500">*</span></>}>
                  <SelectInput value={jenisPewarna} onChange={(e) => setJenisPewarna(e.target.value)} disabled={isSubmitting} options={JENIS_PEWARNA_OPTIONS.map(j => ({ value: j, label: j }))} customBg="#EBF5FA" />
                </FormField>
              </div>

              <div className="pt-1 border-t border-gray-200/60" />

              {/* Bagian Input Gulungan Kain Container */}
              <div className="space-y-4">
                <div className="p-4 rounded-[12px] border border-gray-200/80 space-y-4 bg-[#EBF5FA]/30">
                  
                  {!isProductInfoComplete && (
                    <div className="flex items-start gap-2 text-[#1A335A]">
                      <Lock size={15} className="flex-shrink-0 mt-0.5 opacity-90" strokeWidth={2.5} />
                      <span className="text-[13px] font-semibold leading-tight">
                        Lengkapi <b>Gambar, Kategori, Motif,</b> dan <b>Jenis Pewarna</b> terlebih dahulu untuk membuka form Data Gulungan.
                      </span>
                    </div>
                  )}

                  <div className={`space-y-4 transition-opacity duration-200 ${!isProductInfoComplete ? 'opacity-40 pointer-events-none select-none' : ''}`}>
                    
                    {/* Grid Input Gulungan Horizontal */}
                    <div className="grid items-end grid-cols-1 gap-3 sm:grid-cols-4 text-[#1A335A]">
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
                          type="text"
                          inputMode="decimal"
                          value={tempPanjang}
                          onChange={handlePanjangChange}
                          disabled={isSubmitting || !isProductInfoComplete}
                          placeholder="Masukkan Panjang"
                          className="w-full h-[40px] px-4 bg-white border border-gray-300 rounded-[8px] outline-none text-gray-700 font-medium placeholder-gray-400 focus:border-[#1A335A] focus:ring-1 focus:ring-[#1A335A] duration-150 text-xs shadow-xs"
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
                        <div className="relative flex items-center shadow-xs rounded-[8px] overflow-hidden">
                          <span className="absolute text-xs font-bold text-gray-400 left-4">Rp</span>
                          <input 
                            type="text" 
                            value={tempHarga > 0 ? tempHarga.toLocaleString('id-ID') : '-'} 
                            disabled 
                            className="w-full h-[40px] pl-10 pr-4 bg-gray-50 border border-gray-200 text-gray-800 font-bold cursor-not-allowed select-none outline-none text-xs" 
                          />
                        </div>
                      </FormField>
                    </div>

                    {inlineError && <p className="text-xs text-red-500 font-semibold pl-0.5">{inlineError}</p>}

                    <button
                      type="button"
                      onClick={handleAddGulunganInline}
                      disabled={isSubmitting || !isProductInfoComplete || !tempPanjang || tempHarga <= 0 || !tempRakId}
                      className="w-full h-[40px] rounded-[8px] bg-sky-100 hover:bg-sky-200 text-[#1A335A] text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Plus size={15} strokeWidth={2.5} />
                      <span>Tambah Gulungan ke Daftar</span>
                    </button>
                  </div>
                </div>

                {/* List Tampilan Gulungan Row */}
                <div className="rounded-[8px] border border-gray-200 overflow-hidden bg-[white] shadow-xs">
                  {gulungans.length === 0 ? (
                    <p className="px-4 py-6 font-medium text-center text-gray-400">Belum ada gulungan kain yang dimasukkan ke daftar.</p>
                  ) : (
                    <div className="divide-y divide-gray-100">
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
                className="bg-[#1A335A] hover:bg-[#11223d] text-white px-8 py-2.5 rounded-[8px] text-sm font-semibold flex items-center gap-2 transition-all shadow-md active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSubmitting ? <><Loader2 className="animate-spin" size={16}/><span>Menyimpan...</span></> : 'Simpan Produk'}
              </button>
            </div>
          </div>
        )
      )}
    </div>,
    document.body
  )
}