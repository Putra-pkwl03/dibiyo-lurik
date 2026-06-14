"use client"

import { useCart } from "@/app/context/CartContext"
import { useRouter } from "next/navigation"

export default function CartPage() {
  const { cartItems, removeFromCart, updateQty, totalHarga } = useCart()
  const router = useRouter()

  const formatRupiah = (n) => "Rp " + Number(n).toLocaleString("id-ID")

  // Tampilan kalau keranjang kosong
  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 pt-20 gap-4">
        <h1 className="text-3xl font-bold text-[#E5BA73]">Keranjang Kosong</h1>
        <p className="text-[#A3A19E] font-light">Belum ada produk yang ditambahkan.</p>
        <button
          onClick={() => router.push("/")}
          className="mt-2 px-6 py-2.5 bg-[#E5BA73] text-[#1A1917] text-sm font-bold rounded-xl"
        >
          Lihat Produk
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-[#E5BA73] mb-6">Keranjang Belanja</h1>

      <div className="flex gap-6 items-start">

        {/* ─── DAFTAR ITEM ─── */}
        <div className="flex-1 space-y-3">
          {cartItems.map(({ itemId, product, gulungan, qty }) => {
            const nama = product.motif?.nama && product.kategori?.nama
              ? `${product.motif.nama} ${product.kategori.nama}`
              : product.kode_produk

            return (
              <div key={itemId} className="bg-[#1A1917] border border-[#E5BA73]/20 rounded-xl p-4 flex gap-4">

                {/* Gambar */}
                <div className="w-16 h-16 rounded-lg bg-[#252220] border border-[#E5BA73]/15 flex-shrink-0 overflow-hidden">
                  {product.gambar_url
                    ? <img src={product.gambar_url} alt={nama} className="w-full h-full object-cover" />
                    : <span className="flex items-center justify-center h-full text-[#E5BA73]/30 text-2xl">◈</span>
                  }
                </div>

                {/* Info */}
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#F9F6F0]">{nama}</p>
                  <p className="text-xs text-[#706E6B] mt-0.5">
                    {product.kode_produk} · {gulungan.lebar}cm · {product.jenis_pewarna}
                  </p>
                  <p className="text-xs text-[#706E6B]">
                    Gulungan {gulungan.nomor_gulungan} · sisa {gulungan.panjang_sisa}m
                  </p>

                  {/* Qty control */}
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => updateQty(itemId, qty - 1)}
                      className="w-6 h-6 rounded border border-[#E5BA73]/25 text-[#E5BA73] flex items-center justify-center hover:bg-[#E5BA73]/10 transition-colors"
                    >
                      −
                    </button>
                    <span className="text-sm font-medium text-[#F9F6F0] min-w-[1.5rem] text-center">
                      {qty}
                    </span>
                    <button
                      onClick={() => updateQty(itemId, qty + 1)}
                      className="w-6 h-6 rounded border border-[#E5BA73]/25 text-[#E5BA73] flex items-center justify-center hover:bg-[#E5BA73]/10 transition-colors"
                    >
                      +
                    </button>
                    <span className="text-xs text-[#706E6B]">gulungan</span>
                  </div>
                </div>

                {/* Harga + Hapus */}
                <div className="flex flex-col items-end justify-between">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#E5BA73]">
                      {formatRupiah(gulungan.harga * qty)}
                    </p>
                    <p className="text-xs text-[#706E6B]">
                      {formatRupiah(gulungan.harga)} × {qty}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCart(itemId)}
                    className="text-xs text-[#5a5855] hover:text-red-400 transition-colors"
                  >
                    Hapus
                  </button>
                </div>

              </div>
            )
          })}
        </div>

        {/* ─── RINGKASAN ─── */}
        <div className="w-72 bg-[#1A1917] border border-[#E5BA73]/20 rounded-xl p-4 sticky top-24">
          <p className="text-[11px] font-medium tracking-widest uppercase text-[#706E6B] mb-3">
            Ringkasan Pesanan
          </p>

          <div className="space-y-1.5 mb-3">
            {cartItems.map(({ itemId, product, gulungan, qty }) => (
              <div key={itemId} className="flex justify-between text-xs text-[#A3A19E]">
                <span className="truncate mr-2">{product.motif?.nama} × {qty}</span>
                <span className="flex-shrink-0">{formatRupiah(gulungan.harga * qty)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-[#E5BA73]/15 pt-3 flex justify-between items-baseline">
            <span className="text-sm font-medium text-[#F9F6F0]">Total</span>
            <span className="text-lg font-semibold text-[#E5BA73]">{formatRupiah(totalHarga)}</span>
          </div>

          <button className="w-full mt-4 py-2.5 bg-[#E5BA73] text-[#1A1917] text-xs font-bold tracking-wider rounded-xl hover:opacity-90 transition-opacity">
            Checkout
          </button>
          <button
            onClick={() => router.push("/")}
            className="w-full mt-2 py-2 border border-[#A3A19E]/20 text-[#A3A19E] text-xs rounded-xl hover:border-[#E5BA73] hover:text-[#E5BA73] transition-colors"
          >
            ← Lanjut Belanja
          </button>
        </div>

      </div>
    </div>
  )
}