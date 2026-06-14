"use client"

import { useState, useEffect } from "react"
import { useCart } from "@/app/context/CartContext" 
import { useRouter } from "next/navigation" 
import Swal from "sweetalert2" // Menggunakan SweetAlert agar serasi dengan CartPage Anda

const formatRupiah = (angka) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(angka)
}

export default function ModalDetail({ isOpen, onClose, product }) {
  const [qty, setQty] = useState(1) 
  const [gulunganDipilih, setGulunganDipilih] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false) // State loading tombol
  const { addToCart } = useCart() 
  const router = useRouter() 

  useEffect(() => {
    if (!isOpen || !product) return
    setQty(1)

    const gulunganAktif = product.gulungan?.find(g => g.panjang_sisa > 0)
    setGulunganDipilih(gulunganAktif ?? product.gulungan?.[0] ?? null)
  }, [isOpen, product])

  if (!isOpen || !product) return null

  const productTitle = product.nama ?? "Lurik Premium"
  const gulunganList = product.gulungan ?? []
  
  const lebar = gulunganDipilih?.lebar ?? product.lebar ?? "—"
  const panjangSisa = gulunganDipilih?.panjang_sisa ?? 0
  const panjangTotal = gulunganDipilih?.panjang_total ?? 1 
  
  const stokPersen = (panjangSisa / panjangTotal) * 100
  const hargaPerMeter = gulunganDipilih?.harga_per_meter ?? gulunganDipilih?.harga ?? 0
  const total = hargaPerMeter * qty

  // ─── PERBAIKAN UTAMA: SINKRONISASI KE API DATABASE (POST) ───
  const handleTambahKeranjang = async () => {
    if (!gulunganDipilih || panjangSisa <= 0) return
    
    try {
      setIsSubmitting(true)

      // 1. Kirim data ke API Backend agar masuk ke Database Keranjang
      const res = await fetch('/api/keranjang', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          produk_id: product.id,
          gulungan_id: gulunganDipilih.id,
          jumlah_order: qty // Mengirimkan kuantitas meteran kain
        })
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "Gagal menyimpan ke database keranjang")
      }

      // 2. Perbarui state Context Global (Jika digunakan untuk komponen lain)
      if (addToCart) {
        addToCart(product, gulunganDipilih, qty)
      }

      // 3. Picu event global untuk memperbarui angka badge counter di Navbar
      window.dispatchEvent(new CustomEvent("updateCartCount", { detail: { count: 1 } }))

      // 4. Beri notifikasi sukses kepada pelanggan
      await Swal.fire({
        title: 'Berhasil Masuk Keranjang',
        text: `${productTitle} (Gulungan ${gulunganDipilih.nomor_gulungan}) sebanyak ${qty} meter telah ditambahkan.`,
        icon: 'success',
        background: '#1A1917',
        color: '#F9F6F0',
        confirmButtonColor: '#E5BA73',
        confirmButtonText: 'Lihat Keranjang'
      }).then((result) => {
        if (result.isConfirmed) {
          router.push('/cart') // Redirect ke halaman keranjang belanja
        }
      })

      onClose() // Tutup modal dtail
    } catch (err) {
      console.error("Gagal menambahkan ke keranjang:", err)
      Swal.fire({
        title: 'Oops!',
        text: err.message || 'Terjadi kesalahan sistem.',
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
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose} 
    >
      <div 
        className="bg-[#1A1917] border border-[#E5BA73]/25 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl relative p-6 space-y-6 animate-scale-up"
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Tombol Close */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[#A3A19E] hover:text-[#E5BA73] transition-colors p-1"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

        {/* HEADER */}
        <div className="flex gap-4 p-5 border-b border-[#E5BA73]/10">
          <div className="w-20 h-20 rounded-xl bg-[#252220] border border-[#E5BA73]/15 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {product.gambar_url
              ? <img src={product.gambar_url} alt={productTitle} className="w-full h-full object-cover" />
              : <span className="text-[#E5BA73]/30 text-3xl">◈</span>
            }
          </div>
          <div className="flex flex-col justify-center gap-1">
            <span className="text-[10px] font-bold tracking-widest text-[#E5BA73] uppercase bg-[#E5BA73]/5 px-3 py-1 rounded-full border border-[#E5BA73]/10 w-fit">
              {product.kategori?.nama ?? "Lurik Premium"}
            </span>
            <h2 className="text-lg font-semibold text-[#F9F6F0]">{productTitle}</h2>
            <p className="text-xs text-[#706E6B]">
              Kode: {product.kode_produk ?? "—"} · Motif: {product.motif?.nama ?? "—"}
            </p>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* SPESIFIKASI */}
          <div>
            <p className="text-[11px] font-medium tracking-widest uppercase text-[#706E6B] mb-2">Spesifikasi Kain</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Lebar Kain", value: lebar ? `${lebar} cm` : "—" },
                { label: "Sisa di Gulungan Ini", value: panjangSisa > 0 ? `${panjangSisa} meter` : "Habis" },
                { label: "Jenis Pewarna", value: product.jenis_pewarna ? product.jenis_pewarna.charAt(0).toUpperCase() + product.jenis_pewarna.slice(1) : "—" }
              ].map(({ label, value }) => (
                <div key={label} className="bg-white/[0.025] border border-[#E5BA73]/20 rounded-lg px-3 py-2">
                  <p className="text-[11px] text-[#706E6B]">{label}</p>
                  <p className="text-[13px] font-medium text-[#C8C4BC] mt-0.5">{value}</p>
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
                      disabled={habis}
                      onClick={() => { setGulunganDipilih(g); setQty(1) }}
                      className={`px-3 py-2 rounded-lg border text-xs font-medium transition-colors text-left
                        ${habis
                          ? "border-[#3a3835] text-[#4a4845] cursor-not-allowed"
                          : dipilih
                            ? "border-[#E5BA73] bg-[#E5BA73]/10 text-[#E5BA73]"
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
            <p className="text-[11px] font-medium tracking-widest uppercase text-[#706E6B] mb-2">Jumlah Panjang Pesanan (Meter)</p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-lg border border-[#E5BA73]/25 text-[#E5BA73] text-xl flex items-center justify-center hover:bg-[#E5BA73]/10 transition-colors"
              >
                −
              </button>
              <span className="text-lg font-semibold text-[#F9F6F0] min-w-[2.5rem] text-center">
                {qty} <span className="text-xs font-normal text-[#706E6B]">m</span>
              </span>
              <button
                type="button"
                disabled={qty >= panjangSisa}
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
            disabled={panjangSisa <= 0}
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
            disabled={!gulunganDipilih || panjangSisa <= 0 || isSubmitting}
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
    </div>
  )
}