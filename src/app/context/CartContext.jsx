"use client"

import { createContext, useContext, useState, useEffect, useMemo } from "react"

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userId, setUserId] = useState(null)
  const [loading, setLoading] = useState(true)

  // 1. Inisialisasi Auth & Sinkronisasi
  useEffect(() => {
    const checkAuthAndInit = async () => {
      try {
        const res = await fetch('/api/auth/profile')
        if (res.ok) {
          const profile = await res.json()
          const currentUserId = profile.data?.id
          
          setIsLoggedIn(true)
          setUserId(currentUserId)
          
          // Cek localStorage segera setelah kita tahu user sudah login
          const localData = localStorage.getItem("biyo_guest_cart")
          if (localData) {
            console.log("🔄 Sinkronisasi ditemukan: Memulai migrasi data guest ke akun user...");
            await syncGuestCartToDatabase(currentUserId)
          } else {
            await fetchCartFromDatabase()
          }
        } else {
          setIsLoggedIn(false)
          setUserId(null)
          // Mode Guest biasa
          const localData = localStorage.getItem("biyo_guest_cart")
          if (localData) setCartItems(JSON.parse(localData))
        }
      } catch (err) {
        console.error("Auth check error:", err)
      } finally {
        setLoading(false)
      }
    }
    checkAuthAndInit()
  }, [])

  const fetchCartFromDatabase = async () => {
    try {
      const res = await fetch('/api/keranjang')
      if (res.ok) {
        const result = await res.json()
        const normalized = (result.data || []).map((dbItem) => {
          if (dbItem.is_custom) {
            let parsedMetadata = typeof dbItem.custom_metadata === 'string' ? JSON.parse(dbItem.custom_metadata) : (dbItem.custom_metadata || {});
            let parsedKonfigurasi = typeof dbItem.konfigurasi === 'string' ? JSON.parse(dbItem.konfigurasi) : dbItem.konfigurasi;
            return {
              id: dbItem.id,
              input_panjang: Number(dbItem.jumlah_order || 1),
              isCustom: true,
              gulungan: { 
                id: `CUSTOM-${dbItem.id}`, nomor_gulungan: "CUSTOM", lebar: parsedMetadata?.lebar || 70, 
                harga: parsedMetadata?.harga || 500000, configurasi: parsedKonfigurasi 
              },
              product: { kode_produk: parsedMetadata?.kode_produk || "Lurik Kustom", isCustom: true }
            }
          }
          return {
            id: dbItem.id, 
            input_panjang: Number(dbItem.jumlah_order || 1),
            gulungan: dbItem.gulungan,
            product: dbItem.gulungan?.produk
          }
        })
        setCartItems(normalized)
      }
    } catch (err) { console.error("Gagal fetch DB:", err) }
  }

  const syncGuestCartToDatabase = async (loggedInUserId) => {
    const localData = localStorage.getItem("biyo_guest_cart")
    if (!localData) return

    const parsedItems = JSON.parse(localData)
    try {
      for (const item of parsedItems) {
        const isCustomItem = item.isCustom || false;
        await fetch('/api/keranjang', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jumlah_order: item.input_panjang,
            is_custom: isCustomItem,
            gulungan_id: isCustomItem ? null : item.gulungan?.id,
            konfigurasi: isCustomItem ? item.gulungan?.configurasi : null,
            custom_metadata: isCustomItem ? {
              kode_produk: item.product?.kode_produk,
              harga: item.gulungan?.harga,
              lebar: item.gulungan?.lebar
            } : null
          })
        })
      }
      localStorage.removeItem("biyo_guest_cart")
      console.log("✅ Sinkronisasi selesai. LocalStorage dibersihkan.");
      await fetchCartFromDatabase()
    } catch (error) { console.error("Error sync:", error) }
  }

  const addToCart = async (product, gulungan, qty) => {
    if (isLoggedIn) {
      await fetch('/api/keranjang', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jumlah_order: qty,
          is_custom: product.isCustom || false,
          gulungan_id: product.isCustom ? null : gulungan.id,
          konfigurasi: product.isCustom ? gulungan.configurasi : null,
          custom_metadata: product.isCustom ? { kode_produk: product.kode_produk, harga: gulungan.harga } : null
        })
      })
      await fetchCartFromDatabase()
    } else {
      const updated = [...cartItems, { id: `guest-${Date.now()}`, input_panjang: qty, gulungan, product, isCustom: product.isCustom }]
      setCartItems(updated)
      localStorage.setItem("biyo_guest_cart", JSON.stringify(updated))
    }
  }

  const removeFromCart = async (cartItemId) => {
    setCartItems(prev => prev.filter(item => item.id !== cartItemId))
    if (isLoggedIn && !String(cartItemId).startsWith('guest-')) {
      await fetch(`/api/keranjang?id=${cartItemId}`, { method: 'DELETE' })
      await fetchCartFromDatabase()
    } else {
      localStorage.setItem("biyo_guest_cart", JSON.stringify(cartItems.filter(i => i.id !== cartItemId)))
    }
  }

  const updateQty = async (cartItemId, qty) => {
    setCartItems(prev => prev.map(i => i.id === cartItemId ? { ...i, input_panjang: qty } : i))
    if (isLoggedIn && !String(cartItemId).startsWith('guest-')) {
      await fetch('/api/keranjang', { method: 'PATCH', body: JSON.stringify({ id: cartItemId, jumlah_order: qty }) })
    } else {
      localStorage.setItem("biyo_guest_cart", JSON.stringify(cartItems.map(i => i.id === cartItemId ? { ...i, input_panjang: qty } : i)))
    }
  }

  // 🌟 SINKRONISASI: Fungsi untuk membersihkan state lokal setelah checkout berhasil
  const clearCartState = () => {
    setCartItems([])
    localStorage.removeItem("biyo_guest_cart")
  }

  // ─── AMANKAN TOTAL HARGA DENGAN USEMEMO ───
  const totalHarga = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const hargaKain = item.gulungan?.harga || 0;
      const panjangOrder = Number(item.input_panjang || 0);
      return acc + (hargaKain * panjangOrder);
    }, 0);
  }, [cartItems]);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQty, isLoggedIn, loading, totalHarga, clearCartState }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() { return useContext(CartContext) }