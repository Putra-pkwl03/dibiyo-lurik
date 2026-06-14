"use client"

import { createContext, useContext, useState } from "react"

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])

  const addToCart = (product, gulungan, qty) => {
    // Buat ID unik berdasarkan produk + gulungan yang dipilih
    const itemId = `${product.id}-${gulungan.id}`

    setCartItems((prev) => {
      const sudahAda = prev.find((item) => item.itemId === itemId)

      if (sudahAda) {
        // Kalau produk + gulungan yang sama sudah ada, tambah qty-nya
        return prev.map((item) =>
          item.itemId === itemId
            ? { ...item, qty: item.qty + qty }
            : item
        )
      }

      // Kalau belum ada, tambahkan sebagai item baru
      return [...prev, {
        itemId,
        product,       // seluruh data produk
        gulungan,      // gulungan yang dipilih (berisi harga, lebar, dll)
        qty,
      }]
    })
  }

  const removeFromCart = (itemId) => {
    setCartItems((prev) => prev.filter((item) => item.itemId !== itemId))
  }

  const updateQty = (itemId, qty) => {
    if (qty < 1) return
    setCartItems((prev) =>
      prev.map((item) => item.itemId === itemId ? { ...item, qty } : item)
    )
  }

  const totalItem = cartItems.reduce((acc, item) => acc + item.qty, 0)

  const totalHarga = cartItems.reduce(
    (acc, item) => acc + item.gulungan.harga * item.qty, 0
  )

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQty, totalItem, totalHarga }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}