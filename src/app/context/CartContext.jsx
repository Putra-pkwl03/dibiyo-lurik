"use client"

import { createContext, useContext, useState } from "react"

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])

  const addToCart = (product, gulungan, qty) => {
    // ID unik gabungan produk + gulungan
    const itemId = `${product.id}-${gulungan.id}`

    setCartItems((prev) => {
      const sudahAda = prev.find((item) => item.itemId === itemId)
      const panjangMaksimal = gulungan.panjang_sisa ?? 100

      if (sudahAda) {
        // Tambah meteran kain dengan batas maksimal panjang_sisa
        return prev.map((item) =>
          item.itemId === itemId
            ? { ...item, qty: Math.min(item.qty + qty, panjangMaksimal) }
            : item
        )
      }

      // Tambahkan sebagai item meteran baru
      return [...prev, {
        itemId,
        product,       
        gulungan,      
        qty, // qty bertindak sebagai jumlah meter
      }]
    })
  }

  const removeFromCart = (itemId) => {
    setCartItems((prev) => prev.filter((item) => item.itemId !== itemId))
  }

  const updateQty = (itemId, qty) => {
    if (qty < 1) return
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.itemId === itemId) {
          const panjangMaksimal = item.gulungan?.panjang_sisa ?? 100
          return { ...item, qty: Math.min(qty, panjangMaksimal) }
        }
        return item
      })
    )
  }

  // Menghitung total panjang meter dari seluruh kain di keranjang
  const totalItem = cartItems.reduce((acc, item) => acc + item.qty, 0)

  // ─── SINKRONISASI: TOTAL HARGA BERDASARKAN HARGA PER METER GULUNGAN ───
  const totalHarga = cartItems.reduce((acc, item) => {
    const hargaKain = item.gulungan?.harga_per_meter ?? item.product?.harga ?? 0
    return acc + (hargaKain * item.qty)
  }, 0)

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQty, totalItem, totalHarga }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}