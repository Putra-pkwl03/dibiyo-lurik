"use client"

import { useState, useEffect } from "react"
import { useCart } from "@/app/context/CartContext" 
import { useRouter } from "next/navigation" 
import { motion, AnimatePresence } from "framer-motion"
import Swal from "sweetalert2" // Tetap diimport hanya jika terjadi error sistem pada catch block

const formatRupiah = (angka) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(angka)
}

// ─── SKELETON INTERNAL UNTUK MODAL DETAIL ───
function SkeletonModalDetail({ onClose }) {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#F5F2EB] backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-[#1A1917] border border-[#E5BA73]/25 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl relative p-6 space-y-6 animate-pulse"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute w-6 h-6 rounded top-4 right-4 bg-white/5" />
        <div className="flex gap-4 p-5 border-b border-[#E5BA73]/10">
          <div className="flex-shrink-0 w-20 h-20 rounded-xl bg-white/5" />
          <div className="flex flex-col justify-center flex-1 gap-2">
            <div className="w-24 h-5 rounded-full bg-white/10" />
            <div className="w-3/4 h-6 rounded bg-white/10" />
            <div className="w-1/2 h-4 rounded bg-white/5" />
          </div>
        </div>
        <div className="p-5 space-y-6">
          <div>
            <div className="h-3 mb-3 rounded w-28 bg-white/5" />
            <div className="grid grid-cols-2 gap-2">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white/[0.025] border border-white/5 rounded-lg px-3 py-3 h-14" />
              ))}
            </div>
          </div>
          <div>
            <div className="w-32 h-3 mb-3 rounded bg-white/5" />
            <div className="flex flex-wrap gap-2">
              <div className="w-24 h-12 rounded-lg bg-white/5" />
              <div className="w-24 h-12 rounded-lg bg-white/5" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="w-40 h-3 rounded bg-white/5" />
            <div className="h-1.5 bg-white/5 rounded-full w-full" />
          </div>
          <div className="flex items-center gap-3 pt-2">
            <div className="w-8 h-8 rounded-lg bg-white/5" />
            <div className="w-12 h-6 rounded bg-white/5" />
            <div className="w-8 h-8 rounded-lg bg-white/5" />
          </div>
          <div className="h-12 bg-white/[0.025] border border-white/5 rounded-xl" />
        </div>
        <div className="flex gap-2 px-5 pb-5">
          <div className="flex-1 h-10 bg-white/5 rounded-xl" />
          <div className="flex-[2] h-10 bg-white/10 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export default function ModalDetail({ isOpen, onClose, product }) {
  const [qty, setQty] = useState(1) 
  const [gulunganDipilih, setGulunganDipilih] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false) 
  const [isCrumpling, setIsCrumpling] = useState(false)
  const { addToCart } = useCart() 
  const router = useRouter() 

  useEffect(() => {
    if (!isOpen || !product) return
    setQty(1)

    const gulunganAktif = product.gulungan?.find(g => g.panjang_sisa > 0)
    setGulunganDipilih(gulunganAktif ?? product.gulungan?.[0] ?? null)
  }, [isOpen, product])

  if (!isOpen) return null
  if (!product) return <SkeletonModalDetail onClose={onClose} />

  const productTitle = product.nama ?? "Lurik Premium"
  const gulunganList = product.gulungan ?? []
  
  const lebar = gulunganDipilih?.lebar ?? product.lebar ?? "—"
  const panjangSisa = gulunganDipilih?.panjang_sisa ?? 0
  const panjangTotal = gulunganDipilih?.panjang_total ?? 1 
  
  const stokPersen = (panjangSisa / panjangTotal) * 100
  const hargaPerMeter = gulunganDipilih?.harga_per_meter ?? gulunganDipilih?.harga ?? 0
  const total = hargaPerMeter * qty

  // ─── VARIAN ANIMASI REMAS & TERBANG (MENUJU TOP-RIGHT / ICON NAVBAR) ───
  const modalVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      borderRadius: "16px",
      x: 0,
      y: 0,
      rotate: 0,
      skewX: 0,
      skewY: 0,
      transition: { type: "spring", duration: 0.5 }
    },
    crumpleAndFly: {
      scale: [1, 0.7, 0.4, 0.15, 0],
      borderRadius: ["16px", "24px", "60px", "100px", "100px"],
      skewX: [0, 15, -10, 5, 0],
      skewY: [0, -10, 15, -5, 0],
      rotate: [0, -35, 75, -360, -720], 
      x: [0, 20, -15, 350, 680], // Mengarah ke kanan atas (lokasi umum badge keranjang navbar)
      y: [0, -10, 30, -160, -380], 
      opacity: [1, 1, 0.9, 0.7, 0],
      transition: {
        duration: 0.9, 
        times: [0, 0.2, 0.5, 0.75, 1],
        ease: [
          [0.36, 0.07, 0.19, 0.97], 
          [0.36, 0.07, 0.19, 0.97],
          [0.42, 0, 0.58, 1],       
          [0.25, 1, 0.5, 1]       
        ]
      }
    }
  }

  const handleTambahKeranjang = async () => {
    if (!gulunganDipilih || panjangSisa <= 0) return
    
    try {
      setIsSubmitting(true)

      // WAJIB menggunakan await agar Next.js menyelesaikan request POST ke database terlebih dahulu
      if (addToCart) {
        await addToCart(product, gulunganDipilih, qty)
      }

      // Memicu animasi setelah dipastikan proses await di atas selesai/sukses
      setIsCrumpling(true)

      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("updateCartCount", { detail: { itemCount: 1 } }))
        setIsCrumpling(false)
        onClose()
        router.refresh() // Sekarang aman di-refresh karena request POST sudah selesai sepenuhnya
      }, 900)

    } catch (err) {
      console.error("Gagal menambahkan ke keranjang:", err)
      setIsCrumpling(false)
      Swal.fire({
        title: 'Oops!',
        text: 'Terjadi kesalahan saat menambahkan ke keranjang.',
        icon: 'error',
        background: '#1A1917',
        color: '#F9F6F0',
        confirmButtonColor: '#d33'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={() => !isCrumpling && onClose()} 
      >
        <motion.div 
          variants={modalVariants}
          initial="hidden"
          animate={isCrumpling ? "crumpleAndFly" : "visible"}
          exit="hidden"
          className="bg-[#F5F2EB] border border-[#E5BA73]/25 w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row max-h-[90vh]" // max-w diperbesar & flex-row
          onClick={(e) => e.stopPropagation()} 
        >
          
          {/* KOLOM KIRI: GAMBAR BESAR — FULL TAMPIL DENGAN PADDING */}
          <div className="w-full md:w-5/12 bg-[#EAE7E0] md:border-r border-b md:border-b-0 border-[#E5BA73]/10 min-h-[280px] md:min-h-full p-4">
            <div className="relative w-full h-full">
              {product.gambar_url
                ? (
                  <img 
                    src={product.gambar_url} 
                    alt={productTitle} 
                    className="absolute inset-0 w-full h-full object-cover rounded-lg"
                  />
                )
                : (
                  <div className="flex items-center justify-center w-full h-full">
                    <span className="text-[#E5BA73]/30 text-6xl">◈</span>
                  </div>
                )
              }
            </div>
          </div>

          {/* KOLOM KANAN: INFORMASI & INTERAKSI */}
          <div className="w-full md:w-7/12 flex flex-col overflow-y-auto">
            
            {/* Header Internal */}
            <div className="p-6 border-b border-[#E5BA73]/10 flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-[#E5BA73] uppercase bg-[#E5BA73]/5 px-3 py-1 rounded-full border border-[#E5BA73]/10 w-fit">
                  {product.kategori?.nama ?? "Lurik Premium"}
                </span>
                <h2 className="text-xl font-semibold text-[#000000] mt-2">{productTitle}</h2>
                <p className="text-xs text-[#706E6B] mt-1">Kode: {product.kode_produk ?? "—"} · Motif: {product.motif?.nama ?? "—"}</p>
              </div>
              <button onClick={onClose} disabled={isCrumpling} className="text-[#A3A19E] hover:text-[#E5BA73]">✕</button>
            </div>

            <div className="p-5 space-y-5">
              {/* SPESIFIKASI */}
              <div>
                <p className="text-[11px] font-medium tracking-widest uppercase text-[#171717] mb-2">Spesifikasi Kain</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Lebar Kain", value: lebar ? `${lebar} cm` : "—" },
                    { label: "Sisa di Gulungan Ini", value: panjangSisa > 0 ? `${panjangSisa} meter` : "Habis" },
                    { label: "Jenis Pewarna", value: product.jenis_pewarna ? product.jenis_pewarna.charAt(0).toUpperCase() + product.jenis_pewarna.slice(1) : "—" }
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-white/[0.025] border border-[#E5BA73]/20 rounded-lg px-3 py-2">
                      <p className="text-[11px] text-[#000000]">{label}</p>
                      <p className="text-[13px] font-medium text-[#000000] mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* PILIH GULUNGAN */}
              {gulunganList.length > 0 && (
                <div>
                  <p className="text-[11px] font-medium tracking-widest uppercase text-[#706E6B] mb-2">Pilih Gulungan Kain</p>
                  <div className="flex flex-wrap gap-2">
                    {gulunganList.map((g) => {
                      const habis = g.panjang_sisa <= 0
                      const dipilih = gulunganDipilih?.id === g.id
                      return (
                        <button
                          key={g.id}
                          disabled={habis || isCrumpling}
                          onClick={() => { setGulunganDipilih(g); setQty(1) }}
                          className={`px-3 py-2 rounded-lg border text-xs font-medium transition-colors text-left
                            ${habis
                              ? "border-[#3a3835] text-[#4a4845] cursor-not-allowed"
                              : dipilih
                                ? "border-[#E5BA73] bg-[#E5BA73]/10 text-[#5a3e10]"
                                : "border-[#A3A19E]/20 text-[#A3A19E] hover:border-[#E5BA73]/50"
                            }`}
                        >
                          Gulungan {g.nomor_gulungan}
                          <span className="block text-[10px] mt-0.5 opacity-70">
                            {habis ? "Habis" : `L: ${g.lebar}cm · Sisa: ${g.panjang_sisa}m`}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* STATUS SISA KAIN */}
              <div>
                <p className="text-[11px] font-medium tracking-widest uppercase text-[#706E6B] mb-2">Ketersediaan Panjang Kain</p>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-[#E5BA73] rounded-full transition-all" style={{ width: `${stokPersen}%` }} />
                </div>
                <p className="text-xs text-[#706E6B] mt-1.5">
                  Tersisa {panjangSisa} meter pada Gulungan No. {gulunganDipilih?.nomor_gulungan ?? "—"}
                </p>
              </div>

              {/* JUMLAH METER */}
              <div>
                <p className="text-[11px] font-medium tracking-widest uppercase text-[#000000] mb-2">Jumlah Panjang Pesanan (Meter)</p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={isCrumpling}
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-lg border border-[#E5BA73]/25 text-[#E5BA73] text-xl flex items-center justify-center hover:bg-[#E5BA73]/10 transition-colors disabled:opacity-30"
                  >
                    −
                  </button>
                  <span className="text-lg font-semibold text-[#000000] min-w-[2.5rem] text-center">
                    {qty} <span className="text-xs font-normal text-[#706E6B]">m</span>
                  </span>
                  <button
                    type="button"
                    disabled={qty >= panjangSisa || isCrumpling}
                    onClick={() => setQty((q) => Math.min(panjangSisa, q + 1))}
                    className={`w-8 h-8 rounded-lg border text-xl flex items-center justify-center transition-colors
                      ${qty >= panjangSisa 
                        ? "border-[#3a3835] text-[#4a4845] cursor-not-allowed" 
                        : "border-[#E5BA73]/25 text-[#E5BA73] hover:bg-[#E5BA73]/10"
                      }`}
                  >
                    +
                  </button>
                  <span className="text-xs text-[#706E6B]">maksimal pembelian {panjangSisa} meter</span>
                </div>
              </div>

              {/* RINGKASAN HARGA */}
              <div className="flex justify-between items-baseline bg-[#E5BA73]/5 border border-[#E5BA73]/20 rounded-xl px-4 py-3">
                {gulunganDipilih && panjangSisa > 0 ? (
                  <>
                    <span className="text-xs text-[#8a8780]">
                      {formatRupiah(hargaPerMeter)} × {qty} meter
                    </span>
                    <span className="text-xl font-semibold text-[#E5BA73]">
                      {formatRupiah(total)}
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-[#706E6B] w-full text-center">
                    Gulungan ini telah habis atau tidak tersedia
                  </span>
                )}
              </div>
            </div>

            {/* FOOTER TOMBOL AKSI */}
            <div className="flex gap-2 px-5 pb-5">
              <button
                type="button"
                disabled={panjangSisa <= 0 || isCrumpling}
                onClick={() => {
                  if (panjangSisa <= 0) return
                  const pesan = encodeURIComponent(
                    `Halo Biyo Lurik, saya tertarik memesan kain "${productTitle}" (Lebar ${lebar}cm) dari Gulungan No. ${gulunganDipilih?.nomor_gulungan} sepanjang ${qty} meter. Total: ${formatRupiah(total)}`
                  )
                  window.open(`https://wa.me/6281234567890?text=${pesan}`, "_blank")
                }}
                className={`flex-1 py-2.5 text-center rounded-xl border text-xs font-semibold tracking-wider transition-colors
                  ${panjangSisa > 0 
                    ? "border-[#A3A19E]/20 text-[#A3A19E] hover:text-[#E5BA73] hover:border-[#E5BA73] cursor-pointer" 
                    : "border-[#3a3835] text-[#4a4845] cursor-not-allowed"
                  }`}
              >
                WhatsApp
              </button>
              
              <button
                type="button"
                disabled={!gulunganDipilih || panjangSisa <= 0 || isSubmitting || isCrumpling}
                onClick={handleTambahKeranjang}
                className={`flex-[2] py-2.5 rounded-xl text-xs font-bold tracking-wider transition-all
                  ${gulunganDipilih && panjangSisa > 0 && !isSubmitting
                    ? "bg-[#E5BA73] text-[#1A1917] hover:opacity-90 cursor-pointer"
                    : "bg-[#2a2825] text-[#4a4845] cursor-not-allowed"
                  }`}
              >
                {isSubmitting ? "Memproses..." : panjangSisa <= 0 ? "Stok Habis" : "Tambah ke Keranjang"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
