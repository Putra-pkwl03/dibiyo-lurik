"use client"

import { createContext, useContext, useState, useEffect } from "react"

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userId, setUserId] = useState(null)
  const [loading, setLoading] = useState(true)

  // Ambil profil login saat pertama kali aplikasi dimuat
  useEffect(() => {
    const checkAuthAndInit = async () => {
      try {
        const res = await fetch('/api/auth/profile') // Endpoint cek session profile Anda
        if (res.ok) {
          const profile = await res.json()
          const currentUserId = profile.data?.id
          
          setIsLoggedIn(true)
          setUserId(currentUserId)
          
          // Cek apakah ada data guest yang tertinggal di localStorage
          const localData = localStorage.getItem("biyo_guest_cart")
          if (localData && currentUserId) {
            // Jika ada, lakukan sinkronisasi (push ke DB) terlebih dahulu
            await syncGuestCartToDatabase(currentUserId)
          } else {
            // Jika tidak ada data guest, langsung get biasa dari DB
            await fetchCartFromDatabase()
          }
          
        } else {
          setIsLoggedIn(false)
          // Jika mode guest, ambil langsung dari localStorage
          const localData = localStorage.getItem("biyo_guest_cart")
          if (localData) {
            setCartItems(JSON.parse(localData))
          }
        }
      } catch (err) {
        console.error("Auth check error:", err)
      } finally {
        setLoading(false)
      }
    }
    checkAuthAndInit()
  }, [])

  // Mengambil dan melakukan normalisasi data dari Database Supabase
  const fetchCartFromDatabase = async () => {
    try {
      const res = await fetch('/api/keranjang')
      if (res.ok) {
        const result = await res.json()
        
        const normalized = (result.data || []).map((dbItem) => ({
          id: dbItem.id, 
          input_panjang: dbItem.jumlah_order,
          gulungan: dbItem.gulungan,
          product: dbItem.gulungan?.produk ? {
            id: dbItem.gulungan.produk.id,
            kode_produk: dbItem.gulungan.produk.kode_produk,
            gambar_url: dbItem.gulungan.produk.gambar_url,
            jenis_pewarna: dbItem.gulungan.produk.jenis_pewarna,
            kategori: dbItem.gulungan.produk.kategori, 
            motif: dbItem.gulungan.produk.motif        
          } : null
        }))
        setCartItems(normalized)
      }
    } catch (err) {
      console.error("Gagal sinkron database:", err)
    }
  }

  // Fungsi sinkronisasi item dari Guest ke Database
  const syncGuestCartToDatabase = async (loggedInUserId) => {
    const localData = localStorage.getItem("biyo_guest_cart")
    if (!localData) return

    const parsedItems = JSON.parse(localData) || []
    
    try {
      // Loop semua data guest dan push satu per satu ke database via API POST
      for (const item of parsedItems) {
        if (item.gulungan?.id) {
          await fetch('/api/keranjang', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              gulungan_id: item.gulungan.id,
              jumlah_order: item.input_panjang,
              user_id: loggedInUserId // Push data menyertakan user id target
            })
          })
        }
      }
    } catch (error) {
      console.error("Gagal saat memproses push data guest ke DB:", error)
    } finally {
      // Setelah selesai di-push atau jika terjadi error, bersihkan localStorage agar tidak ter-push ganda
      localStorage.removeItem("biyo_guest_cart")
      // Baru lakukan GET data paling mutakhir dari DB yang sudah terisi
      await fetchCartFromDatabase()
    }
  }

  const addToCart = async (product, gulungan, qty) => {
    const maxSisa = gulungan.panjang_sisa ?? 100
    
    if (isLoggedIn) {
      // Jalur Database
      try {
        const existing = cartItems.find(item => item.gulungan?.id === gulungan.id)
        const targetQty = existing ? Math.min(existing.input_panjang + qty, maxSisa) : qty

        await fetch('/api/keranjang', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gulungan_id: gulungan.id, jumlah_order: targetQty, user_id: userId })
        })
        await fetchCartFromDatabase()
      } catch (err) {
        console.error(err)
      }
    } else {
      // Jalur Guest (Local Storage)
      let updated = []
      const existing = cartItems.find(item => item.gulungan?.id === gulungan.id)
      
      if (existing) {
        updated = cartItems.map(item => 
          item.gulungan?.id === gulungan.id 
            ? { ...item, input_panjang: Math.min(item.input_panjang + qty, maxSisa) }
            : item
        )
      } else {
        updated = [...cartItems, {
          id: `guest-${Date.now()}-${gulungan.id}`,
          input_panjang: qty,
          gulungan: gulungan,
          product: product
        }]
      }
      setCartItems(updated)
      localStorage.setItem("biyo_guest_cart", JSON.stringify(updated))
    }
  }

  const removeFromCart = async (cartItemId) => {
    const updated = cartItems.filter(item => item.id !== cartItemId)
    setCartItems(updated)

    if (isLoggedIn && !String(cartItemId).startsWith('guest-')) {
      try {
        await fetch(`/api/keranjang?id=${cartItemId}`, { method: 'DELETE' })
        await fetchCartFromDatabase()
      } catch (err) {
        console.error(err)
      }
    } else {
      localStorage.setItem("biyo_guest_cart", JSON.stringify(updated))
    }
  }

  const updateQty = async (cartItemId, qty) => {
    if (qty < 1) return
    
    const target = cartItems.find(item => item.id === cartItemId)
    if (!target) return
    const maxSisa = target.gulungan?.panjang_sisa || 100
    const safeValue = Math.min(maxSisa, qty)

    const updated = cartItems.map(item => 
      item.id === cartItemId ? { ...item, input_panjang: safeValue } : item
    )
    setCartItems(updated)

    if (isLoggedIn && !String(cartItemId).startsWith('guest-')) {
      try {
        await fetch('/api/keranjang', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: cartItemId, jumlah_order: safeValue })
        })
      } catch (err) {
        console.error(err)
      }
    } else {
      localStorage.setItem("biyo_guest_cart", JSON.stringify(updated))
    }
  }

  const totalItem = cartItems.length
  
  // PERBAIKAN FORMULA TOTAL HARGA: Mendukung properti 'harga_per_meter' ATAU 'harga' murni dari local storage
  const totalHarga = cartItems.reduce((acc, item) => {
    const hargaKain = item.gulungan?.harga_per_meter || item.gulungan?.harga || 0
    return acc + (hargaKain * (item.input_panjang || 0))
  }, 0)

  return (
    <CartContext.Provider value={{ 
      cartItems, addToCart, removeFromCart, updateQty, totalItem, totalHarga, 
      isLoggedIn, loading, syncGuestCartToDatabase 
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}