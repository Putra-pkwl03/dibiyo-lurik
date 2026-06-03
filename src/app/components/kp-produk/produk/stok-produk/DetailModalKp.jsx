'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Loader2, X, Trash2, ThumbsUp } from 'lucide-react'
import Swal from 'sweetalert2'

export default function DetailModalKp({ isOpen, onClose, productId, raks = [] }) {
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [produk, setProduk] = useState(null)

  // ── State Lokal Penampung Gulungan & Deletions ──
  const [gulungans, setGulungans] = useState([])
  const [deletedGulunganIds, setDeletedGulunganIds] = useState([])

  // ── State Input Form Tambah Baru ──
  const [tempLebar, setTempLebar] = useState('110')
  const [tempPanjang, setTempPanjang] = useState('')
  const [tempRakId, setTempRakId] = useState('')
  const [tempHarga, setTempHarga] = useState(0)

  const [isProcessing, setIsProcessing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [daftarHarga, setDaftarHarga] = useState([])
  const [errorMsg, setErrorMsg] = useState('') 

  useEffect(() => {
    setMounted(true)
  }, [])

  // ── 1. AMBIL DETAIL DATA UTAMA & DAFTAR HARGA ──
  useEffect(() => {
    if (isOpen && productId) {
      const loadAllData = async () => {
        setIsLoading(true)
        setErrorMsg('')
        try {
          const [resProd, resPrice] = await Promise.all([
            fetch(`/api/produk/${productId}`, { credentials: 'include' }),
            fetch('/api/daftar-harga')
          ])

          const dataProd = await resProd.json()
          const dataPrice = await resPrice.json()

          if (!resProd.ok) throw new Error(dataProd.message || 'Gagal memuat detail produk')

          setProduk(dataProd.data)
          setGulungans(dataProd.data?.gulungan || [])
          setDaftarHarga(dataPrice.data || [])
          setDeletedGulunganIds([])

          // Reset form input penambahan
          setTempPanjang('')
          setTempRakId('')
        } catch (err) {
          Swal.fire({
            title: 'Gagal Memuat',
            text: err.message,
            icon: 'error',
            confirmButtonColor: '#A47352'
          })
          onClose()
        } finally { 
          setIsLoading(false)
        }
      }
      loadAllData()
    }
  }, [isOpen, productId, onClose])

  // ── 2. AUTO-FILL HARGA UNTUK FORM TAMBAH BARU ──
  useEffect(() => {
    if (!produk || !tempLebar || daftarHarga.length === 0) return

    const lebarInt = parseInt(tempLebar)
    const pewarnaLower = (produk?.jenis_pewarna || '').toLowerCase()
    const motifId = produk?.motif?.id

    let matchedPrice = daftarHarga.find(p =>
      p.jenis_pewarna?.toLowerCase() === pewarnaLower &&
      p.lebar === lebarInt &&
      p.motif?.id === motifId
    )

    if (!matchedPrice) {
      matchedPrice = daftarHarga.find(p =>
        p.jenis_pewarna?.toLowerCase() === pewarnaLower &&
        p.lebar === lebarInt &&
        !p.motif
      )
    }

    setTempHarga(matchedPrice?.harga_per_meter || 0)
  }, [produk, tempLebar, daftarHarga])

  // ── 3. HANDLER UPSTREAM UNTUK PERUBAHAN DIREK PADA TABEL (LOKAL STATE) ──
  const handleUpstreamLebarChange = (idx, val) => {
    const lebarInt = parseInt(val)
    setGulungans(prev => prev.map((g, i) => {
      if (i !== idx) return g

      const pewarnaLower = (produk?.jenis_pewarna || '').toLowerCase()
      const motifId = produk?.motif?.id

      let matchedPrice = daftarHarga.find(p =>
        p.jenis_pewarna?.toLowerCase() === pewarnaLower &&
        p.lebar === lebarInt &&
        p.motif?.id === motifId
      )

      if (!matchedPrice) {
        matchedPrice = daftarHarga.find(p =>
          p.jenis_pewarna?.toLowerCase() === pewarnaLower &&
          p.lebar === lebarInt &&
          !p.motif
        )
      }

      return {
        ...g,
        lebar: lebarInt,
        harga_per_meter: matchedPrice?.harga_per_meter || 0
      }
    }))
  }

  const handleUpstreamPanjangChange = (idx, val) => {
    setGulungans(prev => prev.map((g, i) => i === idx ? { ...g, panjang_total: parseFloat(val) || 0 } : g))
  }

  const handleUpstreamRakChange = (idx, val) => {
    setGulungans(prev => prev.map((g, i) => i === idx ? { ...g, rak_id: val } : g))
  }

  // ── 4. AKSI MASUKKAN GULUNGAN KE TABEL LOKAL (BELUM KE QUERY DB) ──
  const handlePushGulunganLokal = () => {
    if (!tempPanjang || !tempRakId || tempHarga <= 0) {
      Swal.fire({
        title: 'Oops',
        text: 'Lengkapi semua data (Lebar, Panjang, Rak) dan pastikan harga ditemukan',
        icon: 'warning',
        confirmButtonColor: '#A47352'
      })
      return
    }

    const targetRak = raks.find(r => r.id === tempRakId)
    const newG = {
      id: null,
      lebar: parseInt(tempLebar),
      panjang_total: parseFloat(tempPanjang),
      harga_per_meter: tempHarga,
      rak_id: tempRakId,
      rak: targetRak ? { id: targetRak.id, nama: targetRak.nama } : null
    }

    setGulungans(prev => [...prev, newG])
    setTempPanjang('')
    setTempRakId('')
  }

  // ── 5. AKSI HAPUS GULUNGAN DARI TABEL LOKAL ──
  const handleDeleteGulunganLokal = async (index, dbId) => {
    const result = await Swal.fire({
      title: 'Hapus Gulungan?',
      text: 'Gulungan akan dihapus dari daftar sementara ini.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Lepas',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#1A335A',
      cancelButtonColor: '#94a3b8',
      reverseButtons: true,
      didOpen: () => {
        if (document.querySelector('.swal2-container')) {
          document.querySelector('.swal2-container').style.zIndex = '99999';
        }
      }
    })

    if (!result.isConfirmed) return

    if (dbId) {
      setDeletedGulunganIds(prev => [...prev, dbId])
    }

    setGulungans(prev => prev.filter((_, i) => i !== index))
  }

  // ── 6. EKSEKUSI UTAMA: SIMPAN PERUBAHAN KOLEKTIF KE DB ──
  const handleSubmitAllChanges = async () => {
    // FIX: Validasi disesuaikan agar mengecek properti rak_id DAN objek rak?.id bawaan backend
    const adaRakKosong = gulungans.some(g => !g.rak_id && !g.rak?.id)
    if (adaRakKosong) {
      Swal.fire({
        title: 'Oops',
        text: 'Harap pastikan lokasi Rak terisi untuk seluruh gulungan.',
        icon: 'warning',
        confirmButtonColor: '#1A335A'
      })
      return
    }

    setIsProcessing(true)
    setErrorMsg('')
    try {
      const formData = new FormData()

      // FIX: Gunakan fallback rak_id || g.rak?.id saat mapping payload ke backend
      const gulunganPayload = gulungans.map(g => ({
        id: g.id || undefined,
        lebar: g.lebar,
        panjang_total: g.panjang_total,
        harga_per_meter: g.harga_per_meter,
        rak_id: g.rak_id || g.rak?.id
      }))

      formData.append('gulungan_data', JSON.stringify(gulunganPayload))
      formData.append('deleted_gulungan_ids', JSON.stringify(deletedGulunganIds))

      const res = await fetch(`/api/produk/${productId}`, { method: 'PATCH', body: formData })
      const result = await res.json().catch(() => ({}))

      if (!res.ok) throw new Error(result.message || 'Gagal menyimpan seluruh perubahan produk.')

      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        onClose()
      }, 1600)
    } catch (err) {
      Swal.fire({
        title: 'Gagal',
        text: err.message,
        icon: 'error',
        confirmButtonColor: '#1A335A'
      })
      setErrorMsg(err.message)
    } finally { 
      setIsProcessing(false)
    }
  }

  if (!mounted || !isOpen) return null

  // ── VIEW MODAL SUCCESS PORTAL ──
  if (showSuccess) {
    return createPortal(
      <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4" 
        style={{ backgroundColor: 'rgba(26, 51, 90, 0.4)', backdropFilter: 'blur(2px)' }}
      >
        <div className="bg-white rounded-[20px] shadow-xl w-full max-w-[372px] py-12 px-6 flex flex-col items-center relative animate-in fade-in zoom-in-95 duration-150">
          <ThumbsUp size={56} className="text-[#1A335A] mb-5" strokeWidth={1.5} />
          <p className="text-[#1A335A] text-[18px] font-bold text-center">Perubahan Berhasil Disimpan</p>
        </div>
      </div>,
      document.body
    )
  }

  // ── MAIN VIEW MODAL DETAIL ──
  return createPortal(
    <div className="fixed inset-0 w-screen h-screen z-[9998] flex items-center justify-center bg-[#1A335A]/40 backdrop-blur-[2px] p-4 cursor-default animate-in fade-in duration-100">
      <div className="absolute inset-0" onClick={!isProcessing ? onClose : undefined} />
      
      <div className="relative bg-white shadow-2xl rounded-[24px] w-full max-w-[1180px] max-h-[96vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between flex-shrink-0">
          <h3 className="text-[22px] font-semibold text-[#1A335A] tracking-tight">Detail Produk & Gulungan</h3>
          <button onClick={onClose} disabled={isProcessing} className="text-[#1A335A]/70 hover:text-[#1A335A] transition-colors rounded-full">
            <X size={24} strokeWidth={2.5} />
          </button>
        </div>

        {/* Body Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-3 py-32">
            <Loader2 className="animate-spin text-[#1A335A]" size={36} />
          </div>
        ) : (
          <>
            {/* Grid Container Utama */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-xs text-gray-700 overflow-y-auto lg:overflow-visible pr-1">
              
              {/* ── SEKTOR KIRI (5 KOLOM) ── */}
              <div className="lg:col-span-5 space-y-4 w-full">
                {produk?.gambar_url && (
                  <div className="w-full overflow-hidden rounded-[16px] border border-[#1A335A]/20 bg-[#F4F7FA] flex items-center justify-center max-h-[160px] shadow-sm animate-in fade-in duration-200">
                    <img 
                      src={produk.gambar_url} 
                      alt={`Gambar ${produk?.kode_produk}`} 
                      className="w-full h-full object-cover rounded-[16px]"
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/600x300?text=Gambar+Produk+Tidak+Ditemukan';
                      }}
                    />
                  </div>
                )}
                  
                <div className="space-y-2.5 text-[#1A335A] bg-[#F4F7FA] p-3.5 rounded-[14px] border border-gray-100 shadow-sm">
                  <div className="text-sm">
                    <span className="font-medium text-gray-500">Kode Produk : </span>
                    <span className="text-base font-bold tracking-wide">{produk?.kode_produk}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-0.5 text-xs">
                    <div>
                      <span className="block text-[10px] font-bold text-[#1A335A]/60 uppercase mb-0.5">Kategori</span>
                      <span className="text-xs font-semibold capitalize truncate block">{produk?.kategori?.nama || '-'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-[#1A335A]/60 uppercase mb-0.5">Motif</span>
                      <span className="text-xs font-semibold capitalize truncate block">{produk?.motif?.nama || '-'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-[#1A335A]/60 uppercase mb-0.5">Pewarna</span>
                      <span className="text-xs font-semibold capitalize truncate block">{produk?.jenis_pewarna || '-'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#EBF5FA]/60 p-4 border border-[#1A335A]/10 rounded-[14px] space-y-3 shadow-sm">
                  <h4 className="text-[11px] font-bold text-[#1A335A] uppercase tracking-wider">Tambah Gulungan Baru</h4>
                  <div className="grid grid-cols-2 gap-3 items-end">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#1A335A]">Lebar</label>
                      <select className="w-full border border-gray-300 p-2 rounded-lg text-[#1A335A] text-xs bg-white outline-none" value={tempLebar} onChange={(e) => setTempLebar(e.target.value)}>
                        <option value="70">70 cm</option>
                        <option value="110">110 cm</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#1A335A]">Panjang (m)</label>
                      <input type="number" step="0.1" min="0" className="w-full border border-gray-300 p-2 rounded-lg text-[#1A335A] text-xs bg-white outline-none" value={tempPanjang} onChange={(e) => setTempPanjang(e.target.value)} placeholder="0.0" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#1A335A]">Rak Simpan</label>
                      <select className="w-full border border-gray-300 p-2 rounded-lg text-[#1A335A] text-xs bg-white outline-none" value={tempRakId} onChange={(e) => setTempRakId(e.target.value)}>
                        <option value="">Pilih Rak</option>
                        {raks.map(r => <option key={r.id} value={r.id}>Rak {r.nama}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#1A335A]">Harga (Auto)</label>
                      <div className="w-full border border-gray-200 p-2 rounded-lg bg-gray-50 text-[#1A335A] font-bold text-xs h-[38px] flex items-center">
                        {tempHarga > 0 ? `Rp ${tempHarga.toLocaleString('id-ID')}` : '-'}
                      </div>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={handlePushGulunganLokal} 
                    disabled={tempHarga === 0}
                    className="w-full bg-[#1A335A]/10 text-[#1A335A] border border-[#1A335A]/20 p-2 rounded-lg text-xs font-bold hover:bg-[#1A335A] hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    + Masukkan Ke Daftar Tabel
                  </button>
                </div>
              </div>

              {/* ── SEKTOR KANAN (7 KOLOM) ── */}
              <div className="lg:col-span-7 space-y-2 w-full lg:pt-1">
                <div className="flex justify-between items-center px-1">
                  <h4 className="text-[11px] font-bold text-[#1A335A] uppercase tracking-wider">
                    Daftar Gulungan Kain ({gulungans.length})
                  </h4>
                </div>

                {/* Kontainer Utama */}
                <div className="block overflow-y-auto border border-gray-200 rounded-[14px] bg-white shadow-sm max-h-[400px] min-h-[350px] relative 
                  [&::-webkit-scrollbar]:w-2 
                  [&::-webkit-scrollbar-track]:bg-gray-50
                  [&::-webkit-scrollbar-track]:rounded-[14px]
                  [&::-webkit-scrollbar-thumb]:bg-[#1A335A]/20 
                  [&::-webkit-scrollbar-thumb]:rounded-full 
                  hover:[&::-webkit-scrollbar-thumb]:bg-[#1A335A]/40"
                >
                  <table className="w-full text-xs table-fixed border-collapse">
                    <thead className="bg-[#1A335A] text-white sticky top-0 z-10 shadow-[0_1px_0_rgba(0,0,0,0.1)]">
                      <tr>
                        <th className="p-3 font-semibold text-center w-[45px] bg-[#1A335A]">No</th>
                        <th className="p-3 font-semibold text-left w-[120px] bg-[#1A335A]">Lebar (Ubah)</th>
                        <th className="p-3 font-semibold text-left w-[110px] bg-[#1A335A]">Panjang (m)</th>
                        <th className="p-3 font-semibold text-left w-[140px] bg-[#1A335A]">Lokasi Rak</th>
                        <th className="p-3 font-semibold text-left bg-[#1A335A]">Harga/m (Auto)</th>
                        <th className="p-3 font-semibold text-center w-[55px] bg-[#1A335A]">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {gulungans.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-12 text-center text-gray-400 font-medium h-[300px]">
                            Belum ada gulungan kain dimasukkan.
                          </td>
                        </tr>
                      ) : (
                        gulungans.map((g, i) => (
                          <tr key={g.id || i} className="hover:bg-[#EBF5FA]/30 transition-colors">
                            <td className="p-3 text-center text-[#1A335A] font-bold">{i + 1}</td>
                            
                            {/* Ubah Lebar Direk */}
                            <td className="p-2">
                              <select 
                                value={g.lebar}
                                onChange={(e) => handleUpstreamLebarChange(i, e.target.value)}
                                className="w-full border border-gray-300 p-1.5 rounded-md text-[#1A335A] bg-white outline-none font-medium"
                              >
                                <option value="70">70 cm</option>
                                <option value="110">110 cm</option>
                              </select>
                            </td>

                            {/* Ubah Panjang Direk */}
                            <td className="p-2">
                              <input 
                                type="number"
                                step="0.1"
                                min="0"
                                value={g.panjang_total}
                                onChange={(e) => handleUpstreamPanjangChange(i, e.target.value)}
                                className="w-full border border-gray-300 p-1.5 rounded-md text-[#1A335A] bg-white outline-none font-medium"
                              />
                            </td>

                            {/* Ubah Rak Direk */}
                            <td className="p-2">
                              <select
                                value={g.rak_id || g.rak?.id || ''} 
                                onChange={(e) => handleUpstreamRakChange(i, e.target.value)}
                                className="w-full border border-gray-300 p-1.5 rounded-md text-[#1A335A] bg-white outline-none font-medium"
                              >
                                <option value="">Pilih Rak</option>
                                {raks.map(r => (
                                  <option key={r.id} value={r.id}>Rak {r.nama}</option>
                                ))}
                              </select>
                            </td>

                            {/* Auto Harga Output */}
                            <td className="p-3 text-[#1A335A] font-bold whitespace-nowrap">
                              Rp {g.harga_per_meter > 0 ? Number(g.harga_per_meter).toLocaleString('id-ID') : '-'}
                            </td>

                            {/* Lepas Aksi */}
                            <td className="p-3 text-center">
                              <button 
                                type="button"
                                onClick={() => handleDeleteGulunganLokal(i, g.id)} 
                                className="text-red-500 transition-colors hover:text-red-700 p-1"
                              >
                                <Trash2 size={16}/>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {errorMsg && (
                  <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-[8px] px-3 py-2 font-medium animate-in fade-in duration-200 mt-2">
                    {errorMsg}
                  </p>
                )}
              </div>

            </div>

            {/* Footer Form Tetap */}
            <div className="flex justify-end pt-3 border-t border-gray-100 flex-shrink-0">
              <button
                type="button"
                onClick={handleSubmitAllChanges}
                disabled={isProcessing}
                className="px-8 py-2.5 bg-[#1A335A] text-white rounded-[12px] text-sm font-semibold flex items-center gap-2 hover:bg-[#132644] transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    <span>Menyimpan Perubahan...</span>
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