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

// 🛠️ PERBAIKAN: Mengambil dan melakukan normalisasi dengan proteksi JSON.parse()
  const fetchCartFromDatabase = async () => {
    try {
      const res = await fetch('/api/keranjang')
      if (res.ok) {
        const result = await res.json()
        
        const normalized = (result.data || []).map((dbItem) => {
          // JIKA PRODUK KUSTOM: Bangun struktur tiruan terpadu agar seragam di UI frontend
          if (dbItem.is_custom) {
            
            // 🌟 AMAN KAN PARSING STRING TO JSON OBJECT 🌟
            let parsedMetadata = {};
            let parsedKonfigurasi = null;

            try {
              parsedMetadata = typeof dbItem.custom_metadata === 'string' 
                ? JSON.parse(dbItem.custom_metadata) 
                : (dbItem.custom_metadata || {});
            } catch (e) {
              console.error("Gagal parse custom_metadata:", e);
            }

            try {
              parsedKonfigurasi = typeof dbItem.konfigurasi === 'string' 
                ? JSON.parse(dbItem.konfigurasi) 
                : dbItem.konfigurasi;
            } catch (e) {
              console.error("Gagal parse konfigurasi:", e);
            }

            return {
              id: dbItem.id,
              input_panjang: Number(dbItem.jumlah_order || 1),
              isCustom: true,
              gulungan: {
                id: `CUSTOM-${dbItem.id}`,
                nomor_gulungan: "CUSTOM",
                lebar: parsedMetadata?.lebar || 70,
                harga_per_meter: parsedMetadata?.harga_per_meter || 500000,
                harga: parsedMetadata?.harga || 500000,
                panjang_sisa: 999,
                configurasi: parsedKonfigurasi // Pola benang aman ter-load kembali
              },
              product: {
                kode_produk: parsedMetadata?.kode_produk || "Lurik Desain Kustom",
                gambar_url: parsedMetadata?.gambar_url || '/placeholder-kain.jpg',
                isCustom: true
              }
            }
          }

          // JIKA PRODUK REGULAR/READY STOCK TOKO:
          return {
            id: dbItem.id, 
            input_panjang: Number(dbItem.jumlah_order || 1),
            gulungan: dbItem.gulungan,
            product: dbItem.gulungan?.produk ? {
              id: dbItem.gulungan.produk.id,
              kode_produk: dbItem.gulungan.produk.kode_produk,
              gambar_url: dbItem.gulungan.produk.gambar_url,
              jenis_pewarna: dbItem.gulungan.produk.jenis_pewarna,
              kategori: dbItem.gulungan.produk.kategori, 
              motif: dbItem.gulungan.produk.motif        
            } : null
          }
        })

        setCartItems(normalized)
      }
    } catch (err) {
      console.error("Gagal sinkron database:", err)
    }
  }

  // 🔥 UPDATE: Mendukung push data guest kustom ke DB saat login
  const syncGuestCartToDatabase = async (loggedInUserId) => {
    const localData = localStorage.getItem("biyo_guest_cart")
    if (!localData) return

    const parsedItems = JSON.parse(localData) || []
    
    try {
      for (const item of parsedItems) {
        const isCustomItem = item.product?.isCustom || false;

        const payload = {
          user_id: loggedInUserId,
          jumlah_order: item.input_panjang,
          is_custom: isCustomItem,
          gulungan_id: isCustomItem ? null : item.gulungan?.id,
          konfigurasi: isCustomItem ? item.gulungan?.configurasi : null,
          custom_metadata: isCustomItem ? {
            kode_produk: item.product?.kode_produk,
            gambar_url: item.product?.gambar_url,
            lebar: item.gulungan?.lebar,
            harga_per_meter: item.gulungan?.harga_per_meter,
            harga: item.gulungan?.harga
          } : null
        }

        await fetch('/api/keranjang', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      }
    } catch (error) {
      console.error("Gagal saat memproses push data guest ke DB:", error)
    } finally {
      localStorage.removeItem("biyo_guest_cart")
      await fetchCartFromDatabase()
    }
  }

  // 🔥 UPDATE: Penyesuaian skema payload post database untuk item kustom
  const addToCart = async (product, gulungan, qty) => {
    const maxSisa = gulungan.panjang_sisa ?? 100
    
    if (isLoggedIn) {
      // Jalur Database
      try {
        // Jika produk kustom, jangan samakan pencarian berdasarkan gulungan ID toko biasa
        const existing = product.isCustom 
          ? null 
          : cartItems.find(item => item.gulungan?.id === gulungan.id)
          
        const targetQty = existing ? Math.min(existing.input_panjang + qty, maxSisa) : qty

        const payload = {
          user_id: userId,
          jumlah_order: targetQty,
          is_custom: product.isCustom || false,
          gulungan_id: product.isCustom ? null : gulungan.id,
          konfigurasi: product.isCustom ? gulungan.configurasi : null,
          custom_metadata: product.isCustom ? {
            kode_produk: product.kode_produk,
            gambar_url: product.gambar_url,
            lebar: gulungan.lebar,
            harga_per_meter: gulungan.harga_per_meter,
            harga: gulungan.harga
          } : null
        }

        await fetch('/api/keranjang', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
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