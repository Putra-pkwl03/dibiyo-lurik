"use client"

import { useState, useEffect } from "react"
import { useCart } from "@/app/context/CartContext" 
import { useRouter } from "next/navigation" 

export default function ModalDetail({ isOpen, onClose, product }) {
  const [qty, setQty] = useState(1)
  const [gulunganDipilih, setGulunganDipilih] = useState(null)
  const { addToCart } = useCart()    // ← tambahkan
  const router = useRouter()          // ← tambahkan

  // Reset state setiap modal dibuka
  useEffect(() => {
    if (!isOpen || !product) return
    setQty(1)

    // Otomatis pilih gulungan pertama yang masih ada stoknya
    const gulunganAktif = product.gulungan?.find(g => g.panjang_sisa > 0)
    setGulunganDipilih(gulunganAktif ?? product.gulungan?.[0] ?? null)
  }, [isOpen, product])

  if (!isOpen || !product) return null

  const productTitle = product.motif?.nama && product.kategori?.nama
    ? `${product.motif.nama} ${product.kategori.nama}`
    : product.kode_produk || "Kain Lurik Premium"

  const handleTambahKeranjang = () => {
    addToCart(product, gulunganDipilih, qty)  
    onClose() 
    router.push("/cart")
  }

  const stok = product.stok ?? 0
  const stokPersen = Math.min((stok / 10) * 100, 100)
  const gulunganList = product.gulungan ?? []

  // Data dari gulungan yang dipilih
  const harga = gulunganDipilih?.harga ?? 0
  const lebar = gulunganDipilih?.lebar ?? 0
  const panjangSisa = gulunganDipilih?.panjang_sisa ?? 0
  const total = harga * qty

  const formatRupiah = (n) => "Rp " + Number(n).toLocaleString("id-ID")

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#1A1917] border border-[#E5BA73]/25 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tombol Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#A3A19E] hover:text-[#E5BA73] transition-colors p-1 z-10"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

        {/* ─── HEADER ─── */}
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

          {/* ─── SPESIFIKASI ─── */}
          <div>
            <p className="text-[11px] font-medium tracking-widest uppercase text-[#706E6B] mb-2">
              Spesifikasi Kain
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  label: "Lebar",
                  value: lebar ? `${lebar} cm` : "—"
                },
                {
                  label: "Panjang Tersisa",
                  value: panjangSisa ? `${panjangSisa} meter` : "Habis"
                },
                {
                  label: "Jenis Pewarna",
                  value: product.jenis_pewarna
                    ? product.jenis_pewarna.charAt(0).toUpperCase() + product.jenis_pewarna.slice(1)
                    : "—"
                }
              ].map(({ label, value }) => (
                <div key={label} className="bg-white/[0.025] border border-[#E5BA73]/20 rounded-lg px-3 py-2">
                  <p className="text-[11px] text-[#706E6B]">{label}</p>
                  <p className="text-[13px] font-medium text-[#C8C4BC] mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ─── PILIH GULUNGAN (kalau lebih dari 1) ─── */}
          {gulunganList.length > 1 && (
            <div>
              <p className="text-[11px] font-medium tracking-widest uppercase text-[#706E6B] mb-2">
                Pilih Gulungan
              </p>
              <div className="flex flex-wrap gap-2">
                {gulunganList.map((g) => {
                  const habis = g.panjang_sisa <= 0
                  const dipilih = gulunganDipilih?.id === g.id
                  return (
                    <button
                      key={g.id}
                      disabled={habis}
                      onClick={() => { setGulunganDipilih(g); setQty(1) }}
                      className={`px-3 py-2 rounded-lg border text-xs font-medium transition-colors
                        ${habis
                          ? "border-[#3a3835] text-[#4a4845] cursor-not-allowed"
                          : dipilih
                            ? "border-[#E5BA73] bg-[#E5BA73]/10 text-[#E5BA73]"
                            : "border-[#A3A19E]/20 text-[#A3A19E] hover:border-[#E5BA73]/50"
                        }`}
                    >
                      Gulungan {g.nomor_gulungan}
                      <span className="block text-[10px] mt-0.5 opacity-70">
                        {habis ? "Habis" : `${g.lebar}cm · ${g.panjang_sisa}m`}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* ─── STOK ─── */}
          <div>
            <p className="text-[11px] font-medium tracking-widest uppercase text-[#706E6B] mb-2">
              Stok Tersedia
            </p>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#E5BA73] rounded-full transition-all"
                style={{ width: `${stokPersen}%` }}
              />
            </div>
            <p className="text-xs text-[#706E6B] mt-1.5">{stok} gulungan tersisa</p>
          </div>

          {/* ─── JUMLAH ─── */}
          <div>
            <p className="text-[11px] font-medium tracking-widest uppercase text-[#706E6B] mb-2">
              Jumlah Gulungan
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-lg border border-[#E5BA73]/25 text-[#E5BA73] text-xl flex items-center justify-center hover:bg-[#E5BA73]/10 transition-colors"
              >
                −
              </button>
              <span className="text-lg font-semibold text-[#F9F6F0] min-w-[2rem] text-center">
                {qty}
              </span>
              <button
                onClick={() => setQty((q) => Math.min(stok, q + 1))}
                className="w-8 h-8 rounded-lg border border-[#E5BA73]/25 text-[#E5BA73] text-xl flex items-center justify-center hover:bg-[#E5BA73]/10 transition-colors"
              >
                +
              </button>
              <span className="text-xs text-[#706E6B]">maks. {stok} gulungan</span>
            </div>
          </div>

          {/* ─── RINGKASAN HARGA ─── */}
          <div className="flex justify-between items-baseline bg-[#E5BA73]/5 border border-[#E5BA73]/20 rounded-xl px-4 py-3">
            {gulunganDipilih ? (
              <>
                <span className="text-xs text-[#8a8780]">
                  {formatRupiah(harga)} × {qty} gulungan
                </span>
                <span className="text-xl font-semibold text-[#E5BA73]">
                  {formatRupiah(total)}
                </span>
              </>
            ) : (
              <span className="text-xs text-[#706E6B] w-full text-center">
                Tidak ada gulungan tersedia
              </span>
            )}
          </div>

        </div>

        {/* ─── FOOTER ─── */}
        <div className="flex gap-2 px-5 pb-5">
          <button
            onClick={() => {
              const pesan = encodeURIComponent(
                `Halo, saya ingin memesan ${productTitle} (${lebar}cm) sebanyak ${qty} gulungan. Total: ${formatRupiah(total)}`
              )
              window.open(`https://wa.me/6281234567890?text=${pesan}`, "_blank")
            }}
            className="flex-1 py-2.5 text-center rounded-xl border border-[#A3A19E]/20 text-xs font-semibold tracking-wider text-[#A3A19E] hover:text-[#E5BA73] hover:border-[#E5BA73] transition-colors"
          >
            WhatsApp
          </button>
          <button
            disabled={!gulunganDipilih || stok === 0}
            onClick={handleTambahKeranjang}
            className={`flex-[2] py-2.5 rounded-xl text-xs font-bold tracking-wider transition-all
              ${gulunganDipilih && stok > 0
                ? "bg-[#E5BA73] text-[#1A1917] hover:opacity-90 cursor-pointer"
                : "bg-[#2a2825] text-[#4a4845] cursor-not-allowed"
              }`}
          >
            {stok === 0 ? "Stok Habis" : "Tambah ke Keranjang"}
          </button>
        </div>

      </div>
    </div>
  )
}