'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Swal from 'sweetalert2'
import { X, User, Box, CreditCard, Calendar } from 'lucide-react'
import CustomerFormSection from '../../../../components/cs/po/por/CustomerFormSection'
import ProductListSection from '../../../../components/cs/po/por/roductListSection'
import 'react-datepicker/dist/react-datepicker.css'

export default function PoRegulerEditPortal({ isOpen, onClose, item, onRefresh }) {
  const [daftarHarga, setDaftarHarga] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mounted, setMounted] = useState(false)

  // ================= STATE FORM LOKAL =================
  const [customer, setCustomer] = useState({ nama: '', telpon: '', tgl: '', alamat: '' })
  const [status, setStatus] = useState('dalam_proses')
  const [items, setItems] = useState([])
  
  const [pembayaran, setPembayaran] = useState({ 
    status_pembayaran: 'dp', 
    total_dp: 0, 
    metode_pembayaran: 'cash', 
    diskon: 0 
  })
  const [produksi, setProduksi] = useState({ tanggal_selesai: '', catatan: '' })

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Master Data Fetcher
  useEffect(() => {
    if (isOpen) {
      fetch('/api/daftar-harga')
        .then((res) => res.json())
        .then((res) => setDaftarHarga(res.data || []))
        .catch((err) => console.error('Gagal ambil daftar harga:', err))
    }
  }, [isOpen])

  // ================= ENGINE UTAMA PEMILIHAN HARGA =================
  const hitungHargaItem = (lebar, jenisPewarna, itemData) => {
    if (!lebar || !jenisPewarna || daftarHarga.length === 0) return 0
    let targetPewarna = String(jenisPewarna).trim().toLowerCase()
    if (targetPewarna === "alam") targetPewarna = "alami"

    const currentMotifId = itemData.motif_id || itemData.motif?.id || itemData.produk?.motif_id || itemData.id

    let match = daftarHarga.find((d) => {
      return String(d.lebar) === String(lebar) &&
             String(d.jenis_pewarna).trim().toLowerCase() === targetPewarna &&
             d.motif?.id && String(d.motif.id) === String(currentMotifId)
    })

    if (!match) {
      match = daftarHarga.find((d) => {
        return String(d.lebar) === String(lebar) &&
               String(d.jenis_pewarna).trim().toLowerCase() === targetPewarna &&
               !d.motif?.id
      })
    }
    return match ? parseFloat(match.harga_per_meter) || 0 : 0
  }

  // ================= SINKRONISASI INITIAL DATA DARI DB =================
  useEffect(() => {
    if (isOpen && item) {
      setCustomer({
        nama: item.nama_customer || '',
        telpon: item.kontak_customer || '',
        tgl: item.created_at ? new Date(item.created_at) : '',
        alamat: item.alamat_customer || '',
      })
      
      setStatus(item.status || 'dalam_proses')

      setPembayaran({
        status_pembayaran: (item.status_pembayaran || 'dp').toLowerCase(),
        total_dp: Number(item.total_dp || 0),
        metode_pembayaran: item.metode_pembayaran?.toLowerCase() || 'cash',
        diskon: Number(item.diskon || 0),
      })

      setProduksi({
        box: item.box || '',
        tanggal_selesai: item.tanggal_selesai || '',
        catatan: item.catatan || ''
      })
      
      const rawItems = item.items || item.item_pre_order_reguler || []
      const existingItems = Array.isArray(rawItems) ? rawItems.map((prod) => {
        const qtyAktif = parseInt(prod.jumlah || prod.qty) || 1
        const panjangAktif = parseFloat(prod.panjang) || 0
        const hargaDb = parseFloat(prod.harga_per_meter || prod.harga) || 0

        return {
          ...prod,
          id: prod.id,
          produk_id: prod.produk_id || prod.produk?.id || prod.id_produk,
          kode_produk: prod.produk?.kode_produk || prod.kode_produk || '-',
          motif: prod.motif || { nama: prod.produk?.nama_motif || prod.nama_motif || '-' },
          lebar: String(prod.lebar || ''), 
          jenis_pewarna: prod.jenis_pewarna || '',
          qty: qtyAktif,
          panjang: panjangAktif,
          harga: hargaDb,              
          totalHargaItem: hargaDb * panjangAktif * qtyAktif,
          subtotal: hargaDb * panjangAktif * qtyAktif
        }
      }) : []

      setItems(existingItems)
    } else {
      setCustomer({ nama: '', telpon: '', tgl: '', alamat: '' })
      setStatus('dalam_proses')
      setItems([])
    }
  }, [item, isOpen])

  // ================= DERIVED VALUES =================
  const hitungSubtotalPerBaris = (it) => Number(it.harga || 0) * Number(it.panjang || 0) * Number(it.qty || 1);
  const subTotalTotal = items.reduce((acc, c) => acc + hitungSubtotalPerBaris(c), 0);

  const nilaiDiskon = subTotalTotal * (Number(pembayaran.diskon || 0) / 100);
  const totalHargaAkhir = Math.max(0, subTotalTotal - nilaiDiskon);
  const minDpRequired = totalHargaAkhir * 0.3;

  const isLunas = pembayaran.status_pembayaran === 'lunas';
  const dpFinal = isLunas ? totalHargaAkhir : pembayaran.total_dp;
  const sisaTagihan = Math.max(0, totalHargaAkhir - dpFinal);

  // ================= INTERACTION HANDLERS =================
  const updateProductField = (index, field, value) => {
    setItems(prev => {
      const newItems = [...prev]
      if (!newItems[index]) return prev

      newItems[index] = { ...newItems[index], [field]: value }
      const prod = newItems[index]
      
      const currentLebar = field === 'lebar' ? value : prod.lebar
      const currentPewarna = field === 'jenis_pewarna' ? value : prod.jenis_pewarna
      
      const hargaMurni = hitungHargaItem(currentLebar, currentPewarna, prod)
      const panjang = field === 'panjang' ? parseFloat(value) || 0 : parseFloat(prod.panjang) || 0
      const qty = field === 'qty' ? parseInt(value) || 1 : parseInt(prod.qty) || 1

      newItems[index].harga = hargaMurni > 0 ? hargaMurni : (parseFloat(prod.harga_per_meter) || 0)
      newItems[index].totalHargaItem = newItems[index].harga * panjang * qty
      newItems[index].subtotal = newItems[index].totalHargaItem
      newItems[index].harga_per_meter = newItems[index].harga

      return newItems
    })
  }

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(prev => prev.filter((_, i) => i !== index))
    } else {
      Swal.fire({ title: 'Perhatian', text: 'Minimal harus ada satu item dalam order.', icon: 'warning', confirmButtonColor: '#1A335A' })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (items.length === 0) return Swal.fire({ title: 'Gagal!', text: 'Daftar produk tidak boleh kosong.', icon: 'error' })
    
    if (pembayaran.status_pembayaran === 'dp' && dpFinal < minDpRequired) {
      return Swal.fire("Akses Ditolak", `Nominal DP total minimal 30%: Rp ${Math.ceil(minDpRequired).toLocaleString("id-ID")}`, "error");
    }

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/pre-order-reguler/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            nama: customer.nama.trim(),
            telpon: customer.telpon,
            tgl: customer.tgl,
            alamat: customer.alamat.trim(),
          },
          status,
          status_pembayaran: pembayaran.status_pembayaran,
          metode_pembayaran: pembayaran.metode_pembayaran,
          diskon: pembayaran.diskon,
          total_dp: dpFinal,
          total_harga: totalHargaAkhir,
          tanggal_selesai: produksi.tanggal_selesai,
          catatan: produksi.catatan,
          items: items.map(i => ({
            id: i.id,
            produk_id: i.produk_id,
            lebar: parseInt(i.lebar) || null,
            jenis_pewarna: i.jenis_pewarna || null,
            harga_per_meter: i.harga,
            subtotal: i.totalHargaItem,
            panjang: parseFloat(i.panjang) || 0,
            jumlah: i.qty 
          })),
        }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'Gagal memperbarui data')

      Swal.fire({ title: 'Berhasil!', text: 'Data Pre-Order Reguler berhasil diperbarui.', icon: 'success' })
      onRefresh()
      onClose()
    } catch (error) {
      Swal.fire({ title: 'Error!', text: error.message || 'Terjadi kesalahan sistem.', icon: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen || !mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto text-black bg-[#1A335A7A] backdrop-blur-[2px] font-inter">
      {/* GAYA SCROLLBAR CUSTOM */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: #1A335A transparent; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(26, 51, 90, 0.4); border-radius: 10px; }
        .react-datepicker-wrapper { width: 100% !important; }
        .react-datepicker { font-family: 'Inter', sans-serif !important; border: 1px solid #f1f1f1 !important; border-radius: 12px !important; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05) !important; overflow: hidden; }
        .react-datepicker__header { background-color: #1A335A !important; border-bottom: 1px solid #1A335A !important; padding: 8px 0 !important; }
        .react-datepicker__current-month, .react-datepicker__day-name { color: white !important; font-weight: 700 !important; }
        .react-datepicker__day-name { color: rgba(255,255,255,0.7) !important; }
        .react-datepicker__navigation-icon::before { border-color: white !important; }
        .react-datepicker__day--selected, .react-datepicker__day--keyboard-selected { background-color: #F59E0B !important; color: white !important; font-weight: bold !important; border-radius: 6px !important; }
        .react-datepicker__day:hover { background-color: rgba(90, 227, 237, 0.15) !important; border-radius: 6px !important; }
      `}} />

      <div className="flex flex-col w-full max-w-4xl max-h-[94vh] overflow-hidden bg-white rounded-2xl shadow-2xl border border-stone-200">
        
        {/* Header - Bersih & Minimalis */}
        <div className="relative flex items-center justify-center px-6 py-4 border-b border-stone-100 shrink-0">
          <h3 className="text-sm font-bold tracking-wide text-stone-800">Pre-Order Reguler</h3>
          <button type="button" onClick={onClose} className="absolute transition-colors right-5 text-stone-400 hover:text-stone-700">
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Form Body - Diterapkan kelas 'custom-scrollbar' di sini */}
        <form onSubmit={handleSubmit} className="flex-1 p-5 space-y-5 overflow-y-auto bg-[#F8FAFC] custom-scrollbar">
          
          {/* SECTION 1: DATA CUSTOMER */}
          <CustomerFormSection customer={customer} setCustomer={setCustomer} status={status} setStatus={setStatus} />
          
          {/* SECTION 2: DATA PRODUK */}
          <div className="p-5 space-y-3 bg-white border rounded-xl border-stone-100">
            <div className="flex items-center gap-2 mb-1 text-xs font-bold tracking-wider uppercase text-stone-800">
              <Box size={15} className="text-stone-700" />
              <span>Data Produk</span>
            </div>
            <ProductListSection items={items} onUpdateField={updateProductField} onRemoveItem={removeItem} />
          </div>

          {/* SECTION 3: DETAIL PEMBAYARAN */}
          <div className="p-5 space-y-4 text-xs bg-white border rounded-xl border-stone-100">
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-stone-800">
              <CreditCard size={15} className="text-stone-700" />
              <span>Detail Pembayaran</span>
            </div>

            <div className="bg-[#EBF9FB] rounded-xl p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 font-medium text-stone-600 text-[11px]">Status Pembayaran</label>
                  <div className="grid grid-cols-2 gap-0 overflow-hidden bg-white border rounded-lg border-stone-200">
                    <button 
                      type="button" 
                      onClick={() => setPembayaran({ ...pembayaran, status_pembayaran: 'dp' })} 
                      className={`py-2 text-xs font-bold transition-all ${pembayaran.status_pembayaran === 'dp' ? 'bg-[#1E3A8A] text-white' : 'bg-white text-stone-600 hover:bg-stone-50'}`}
                    >
                      DP
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setPembayaran({ ...pembayaran, status_pembayaran: 'lunas' })} 
                      className={`py-2 text-xs font-bold transition-all ${isLunas ? 'bg-[#1E3A8A] text-white' : 'bg-white text-stone-600 hover:bg-stone-50'}`}
                    >
                      Lunas
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block mb-1.5 font-medium text-stone-600 text-[11px]">
                    {isLunas ? "Nominal Pelunasan" : "Nominal DP"}
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute text-xs font-semibold left-3 text-stone-500">Rp</span>
                    <input 
                      type="text" 
                      value={isLunas ? totalHargaAkhir.toLocaleString('id-ID') : (pembayaran.total_dp ? pembayaran.total_dp.toLocaleString('id-ID') : '')}
                      disabled={isLunas}
                      onChange={(e) => setPembayaran({ ...pembayaran, total_dp: Number(e.target.value.replace(/\D/g, '')) || 0 })}
                      className="w-full p-2 text-xs font-semibold bg-white border rounded-lg border-stone-200 pl-9 focus:outline-none focus:border-stone-400 disabled:bg-stone-100 disabled:text-stone-500" 
                    />
                  </div>
                  {!isLunas && (
                    <span className="text-[9px] text-stone-400 block mt-1">Min DP (30%): <strong className="text-stone-600">Rp {Math.ceil(minDpRequired).toLocaleString("id-ID")}</strong></span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="block mb-1.5 font-medium text-stone-600 text-[11px]">Metode Pembayaran</label>
                  <select value={pembayaran.metode_pembayaran} onChange={(e) => setPembayaran({ ...pembayaran, metode_pembayaran: e.target.value })} className="w-full border border-stone-200 bg-white rounded-lg p-2 text-xs focus:outline-none focus:border-stone-400 cursor-pointer h-[35px]">
                    <option value="cash">Cash</option>
                    <option value="transfer">Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1.5 font-medium text-stone-600 text-[11px]">Diskon (opsional)</label>
                  <div className="relative flex items-center">
                    <input 
                      type="number" 
                      value={pembayaran.diskon || ''} 
                      placeholder="0" 
                      onChange={(e) => setPembayaran({ ...pembayaran, diskon: Number(e.target.value) || 0 })}
                      className="w-full border border-stone-200 bg-white rounded-lg p-2 pr-6 text-xs text-left focus:outline-none focus:border-stone-400 h-[35px]" 
                    />
                    <span className="absolute text-xs right-3 text-stone-400">%</span>
                  </div>
                </div>
                
                {/* Kotak Ringkasan Total Harga Kanan */}
                <div className="flex flex-col justify-between p-3 bg-white border rounded-lg border-stone-200">
                  <div className="flex justify-between items-center text-[11px] text-stone-500">
                    <span>Sub Total</span>
                    <span className="font-semibold">Rp {subTotalTotal.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-stone-500 border-b border-dashed pb-1.5 mb-1.5">
                    <span>Diskon</span>
                    <span className="font-semibold text-red-500">{pembayaran.diskon || 0}%</span>
                  </div>
                  <div className="flex items-center justify-between font-bold text-stone-800">
                    <span className="text-[11px]">Total</span>
                    <span className="text-xs text-stone-900">Rp {totalHargaAkhir.toLocaleString("id-ID")}</span>
                  </div>
                </div>
              </div>

              {!isLunas && (
                <div className="flex justify-between items-center bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-[10px]">
                  <span className="font-medium text-red-700">Sisa Tagihan / Kurang Bayar:</span>
                  <span className="text-xs font-bold text-red-600">Rp {sisaTagihan.toLocaleString("id-ID")}</span>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 4 & 5: ESTIMASI & STATUS */}
          <div className="grid grid-cols-1 gap-4 text-xs md:grid-cols-2">
            {/* Estimasi Jadi */}
            <div className="p-5 space-y-3 bg-white border rounded-xl border-stone-100">
              <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-stone-800">
                <Calendar size={15} className="text-stone-700" />
                <span>Estimasi Produk Jadi</span>
              </div>
              <div className="bg-[#FFF8E7] rounded-xl p-3 border border-amber-100">
                <label className="block mb-1.5 font-medium text-stone-600 text-[11px]">Tanggal Estimasi Selesai</label>
                <input 
                  type="date" 
                  value={produksi.tanggal_selesai} 
                  onChange={(e) => setProduksi({ ...produksi, tanggal_selesai: e.target.value })} 
                  className="w-full border border-amber-200 bg-white rounded-lg p-2 focus:outline-none text-xs h-[35px]"
                />
              </div>
            </div>

            {/* Catatan dan Tombol */}
            <div className="flex flex-col justify-between p-5 space-y-3 bg-white border rounded-xl border-stone-100">
              <div>
                <label className="block mb-1.5 font-bold tracking-wider uppercase text-stone-800 text-[11px]">Catatan Tambahan</label>
                <textarea
                  rows={2}
                  value={produksi.catatan}
                  onChange={(e) => setProduksi({ ...produksi, catatan: e.target.value })}
                  className="w-full bg-[#F1F5F9] rounded-xl p-2.5 focus:outline-none text-xs resize-none font-medium text-stone-700 border-none"
                  placeholder="Tambahkan instruksi pengerjaan jika diperlukan..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-10 mt-2 bg-[#F59E0B] hover:bg-[#D97706] text-white rounded-xl font-bold text-xs transition-all tracking-wider uppercase shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>,
    document.body
  )
}