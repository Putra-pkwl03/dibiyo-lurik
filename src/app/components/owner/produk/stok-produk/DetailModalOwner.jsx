'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Loader2, X, Trash2 } from 'lucide-react'
import Swal from 'sweetalert2'

export default function DetailModalKp({ isOpen, onClose, productId, raks = []}) {
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [produk, setProduk] = useState(null)
  
  // State Input Form
  const [tempLebar, setTempLebar] = useState('110')
  const [tempPanjang, setTempPanjang] = useState('')
  const [tempRakId, setTempRakId] = useState('') 
  const [tempHarga, setTempHarga] = useState(0)
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [daftarHarga, setDaftarHarga] = useState([]) 

  useEffect(() => { setMounted(true) }, [])

// 1. Fetch Detail Produk (Hanya fetch data, jangan set loading di sini)
  const fetchDetail = async () => {
    try {
      const res = await fetch(`/api/produk/${productId}`, { credentials: 'include' })
      const result = await res.json()
      if (!res.ok) throw new Error(result.message)
      setProduk(result.data)
      setTempPanjang('')
      setTempRakId('')
    } catch (err) {
      Swal.fire({ title: 'Gagal Memuat', text: err.message, icon: 'error', confirmButtonColor: '#A47352' })
    }
  }

  // 2. Fetch Daftar Harga (Hanya fetch data)
  const fetchDaftarHarga = async () => {
    try {
      const res = await fetch('/api/daftar-harga')
      const result = await res.json()
      if (res.ok) {
        setDaftarHarga(result.data || [])
      }
    } catch (err) {
      console.error("Gagal memuat daftar harga:", err)
    }
  }
  
  // SATU-SATUNYA useEffect untuk fetch data saat modal terbuka
  useEffect(() => {
    if (isOpen && productId) {
      const loadAllData = async () => {
        setIsLoading(true);
        // Jalankan bersamaan agar jauh lebih cepat
        await Promise.all([fetchDetail(), fetchDaftarHarga()]);
        setIsLoading(false); // Loading selesai hanya setelah keduanya beres
      };
      loadAllData();
    }
  }, [isOpen, productId]);
  
  // 3. Logika Auto-Fill Harga Berdasarkan Lebar & Karakteristik Kain
  useEffect(() => {
    if (!produk || !tempLebar || daftarHarga.length === 0) return
    
    const lebarInt = parseInt(tempLebar)
    const pewarnaLower = (produk?.jenis_pewarna || '').toLowerCase()
    const motifId = produk?.motif?.id

    // KANDIDAT 1: Cari yang COCOK SPESIFIK (Pewarna + Lebar + Motif ID sama)
    let matchedPrice = daftarHarga.find(p => {
      const isMatchPewarna = p.jenis_pewarna?.toLowerCase() === pewarnaLower
      const isMatchLebar = p.lebar === lebarInt
      const isMatchMotifSpesifik = p.motif?.id === motifId

      return isMatchPewarna && isMatchLebar && isMatchMotifSpesifik
    })
      
    // KANDIDAT 2: Jika harga khusus motif tidak ada, gunakan harga DEFAULT (Motif null)
    if (!matchedPrice) {
      matchedPrice = daftarHarga.find(p => {
        const isMatchPewarna = p.jenis_pewarna?.toLowerCase() === pewarnaLower
        const isMatchLebar = p.lebar === lebarInt
        const isMatchMotifDefault = !p.motif 

        return isMatchPewarna && isMatchLebar && isMatchMotifDefault
      })
    }

    setTempHarga(matchedPrice?.harga_per_meter || 0)
  }, [produk, tempLebar, daftarHarga])

  // const handleSimpanGulungan = async () => {
  //   if (!tempPanjang || !tempRakId || tempHarga <= 0) {
  //     Swal.fire({ title: 'Oops', text: 'Lengkapi semua data (Lebar, Panjang, Rak) dan pastikan harga ditemukan', icon: 'warning', confirmButtonColor: '#A47352' })
  //     return
  //   }
    
  //   setIsProcessing(true)
  //   try {
  //     const formData = new FormData()
  //     formData.append('gulungan_data', JSON.stringify([{
  //       lebar: parseInt(tempLebar),
  //       panjang_total: parseFloat(tempPanjang),
  //       harga_per_meter: tempHarga,
  //       rak_id: tempRakId 
  //     }]))

  //     const res = await fetch(`/api/produk/${productId}`, { method: 'PATCH', body: formData })
  //     if (!res.ok) throw new Error('Gagal menyimpan gulungan')
      
  //     fetchDetail()
  //     Swal.fire({ title: 'Berhasil', icon: 'success', timer: 1500, showConfirmButton: false })
  //   } catch (err) {
  //     Swal.fire({ title: 'Gagal', text: err.message, icon: 'error', confirmButtonColor: '#A47352' })
  //   } finally {
  //     setIsProcessing(false)
  //   }
  // }

// const handleDeleteGulungan = async (gulunganId) => {
//   const result = await Swal.fire({
//     title: 'Hapus Gulungan?',
//     text: "Data yang dihapus tidak dapat dikembalikan.",
//     icon: 'warning',
//     showCancelButton: true,
//     confirmButtonText: 'Ya, Hapus',
//     cancelButtonText: 'Batal',
//     confirmButtonColor: '#1A335A', 
//     cancelButtonColor: '#94a3b8',   
//     reverseButtons: true,
//     customClass: {
//       popup: 'rounded-[20px] shadow-2xl',
//       confirmButton: 'px-6 py-2.5 rounded-[10px] font-semibold',
//       cancelButton: 'px-6 py-2.5 rounded-[10px] font-semibold',
//       title: 'text-[#1A335A] font-bold text-[20px]',
//       text: 'text-gray-600'
//     },
//     // Memastikan tetap di atas modal
//     didOpen: () => {
//       document.querySelector('.swal2-container').style.zIndex = '99999';
//     }
//   });

//   if (!result.isConfirmed) return;

//   setIsProcessing(true);
//   try {
//     const formData = new FormData();
//     formData.append('deleted_gulungan_ids', JSON.stringify([gulunganId]));
//     const res = await fetch(`/api/produk/${productId}`, { method: 'PATCH', body: formData });
    
//     if (!res.ok) throw new Error('Gagal menghapus data.');
    
//     // Sukses
//     Swal.fire({
//       title: 'Berhasil!',
//       text: 'Gulungan telah dihapus.',
//       icon: 'success',
//       confirmButtonColor: '#1A335A',
//       customClass: { popup: 'rounded-[20px]' }
//     });
    
//     fetchDetail();
//   } catch (err) {
//     // Error
//     Swal.fire({ 
//       title: 'Terjadi Kesalahan', 
//       text: err.message, 
//       icon: 'error', 
//       confirmButtonColor: '#1A335A',
//       customClass: { popup: 'rounded-[20px]' }
//     });
//   } finally {
//     setIsProcessing(false);
//   }
// };

  if (!mounted || !isOpen) return null

return createPortal(
    /* Backdrop diubah menjadi Navy transparan */
    <div className="fixed inset-0 w-screen h-screen z-[9998] flex items-center justify-center bg-[#1A335A]/40 backdrop-blur-[2px] p-4 cursor-default animate-in fade-in duration-100">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative bg-white shadow-2xl rounded-[24px] w-full max-w-[760px] max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between flex-shrink-0">
          <h3 className="text-[22px] font-semibold text-[#1A335A] tracking-tight">Detail Produk</h3>
          <button onClick={onClose} className="text-[#1A335A]/70 hover:text-[#1A335A] transition-colors rounded-full">
            <X size={24} strokeWidth={2.5} />
          </button>
        </div>

        {/* Body Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-3 py-20">
            <Loader2 className="animate-spin text-[#1A335A]" size={36} />
          </div>
        ) : (
          <div className="flex-1 pr-1 space-y-5 overflow-y-auto custom-scrollbar">
            
            {/* Tampilan Gambar Produk */}
            {produk?.gambar_url && (
              <div className="w-full overflow-hidden rounded-[16px] border border-[#1A335A]/20 bg-[#F4F7FA] flex items-center justify-center max-h-[260px] shadow-sm animate-in fade-in duration-200">
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
              
            {/* Informasi Teks */}
            <div className="space-y-4 text-[#1A335A] py-2">
              <div className="text-base">
                <span className="font-medium">Kode Produk : </span>
                <span className="text-lg font-bold tracking-wide">{produk?.kode_produk}</span>
              </div>

              <div className="flex flex-wrap gap-12 pt-2 text-sm">
                <div>
                  <span className="block text-xs font-bold text-[#1A335A]/60 uppercase mb-1">Kategori</span>
                  <span className="text-base font-semibold capitalize">{produk?.kategori?.nama || '-'}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-[#1A335A]/60 uppercase mb-1">Motif</span>
                  <span className="text-base font-semibold capitalize">{produk?.motif?.nama || '-'}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-[#1A335A]/60 uppercase mb-1">Jenis Pewarna</span>
                  <span className="text-base font-semibold lowercase">{produk?.jenis_pewarna || '-'}</span>
                </div>
              </div>
            </div>

            {/* Form Tambah Gulungan */}
            {/* <div className="bg-[#EBF5FA]/50 p-4 border border-[#1A335A]/10 rounded-[14px] grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase font-bold text-[#1A335A] tracking-wide">Lebar</label>
                <select className="w-full border border-gray-300 p-2.5 rounded-lg text-[#1A335A] text-sm bg-white focus:border-[#1A335A] outline-none" value={tempLebar} onChange={(e) => setTempLebar(e.target.value)}>
                    <option value="70">70 cm</option>
                    <option value="110">110 cm</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase font-bold text-[#1A335A] tracking-wide">Panjang (m)</label>
                <input type="number" className="w-full border border-gray-300 p-2.5 rounded-lg text-[#1A335A] text-sm bg-white focus:border-[#1A335A] outline-none" value={tempPanjang} onChange={(e) => setTempPanjang(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase font-bold text-[#1A335A] tracking-wide">Rak</label>
                <select className="w-full border border-gray-300 p-2.5 rounded-lg text-[#1A335A] text-sm bg-white focus:border-[#1A335A] outline-none" value={tempRakId} onChange={(e) => setTempRakId(e.target.value)}>
                    <option value="">Pilih Rak</option>
                    {raks.map(r => <option key={r.id} value={r.id}>{r.nama}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase font-bold text-[#1A335A] tracking-wide">Harga (Auto)</label>
                <div className="w-full border border-gray-200 p-2.5 rounded-lg bg-gray-50 text-[#1A335A] font-semibold text-sm">
                    {tempHarga > 0 ? `Rp ${tempHarga.toLocaleString()}` : '-'}
                </div>
              </div>
            </div>

            <button 
                onClick={handleSimpanGulungan} 
                disabled={isProcessing || tempHarga === 0}
                className="w-full bg-[#1A335A] text-white p-3 rounded-lg font-semibold hover:bg-[#132644] transition-all disabled:opacity-50"
            >
                {isProcessing ? 'Menyimpan...' : 'Simpan Gulungan'}
            </button> */}

            {/* Tabel Gulungan */}
            <div className="overflow-hidden border border-gray-200 rounded-[14px]">
              <table className="w-full text-xs">
                <thead className="bg-[#1A335A] text-white">
                  <tr>
                    {['No', 'Lebar', 'Panjang', 'Rak', 'Harga', 'Aksi'].map(h => <th key={h} className="p-3 font-semibold text-left">{h}</th>)}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {produk?.gulungan.map((g, i) => (
                    <tr key={g.id} className="hover:bg-[#EBF5FA]/40">
                      <td className="p-3 text-[#1A335A]">{i + 1}</td>
                      <td className="p-3 text-[#1A335A]">{g.lebar} cm</td>
                      <td className="p-3 text-[#1A335A]">{g.panjang_total} m</td>
                      <td className="p-3 text-[#1A335A]">{g.rak?.nama || '-'}</td>
                      <td className="p-3 text-[#1A335A]">Rp {Number(g.harga_per_meter).toLocaleString()}</td>
                      {/* <td className="p-3">
                        <button onClick={() => handleDeleteGulungan(g.id)} className="text-red-500 transition-colors hover:text-red-700">
                          <Trash2 size={16}/>
                        </button>
                      </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}