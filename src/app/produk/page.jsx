"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SkeletonKatalog from '@/app/components/produk/SkeletonKatalog'
import CardProdukKatalog from '@/app/components/produk/CardProdukKatalog'
import ModalBeliKain from '@/app/components/produk/ModalBeliKain'
import FloatingComboBar from '@/app/components/produk/FloatingComboBar'
import { useComboStore } from '@/app/store/useComboStore'

import Footer from '../components/home/Footer'

export default function ProdukPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activePoDropdown, setActivePoDropdown] = useState(null)
  const [selectedProductForBuy, setSelectedProductForBuy] = useState(null)
  
  // State Penampung Multi-Partikel Bintang Melesat
  const [flyingStars, setFlyingStars] = useState([])

  const { setSlot, combination } = useComboStore()

  // Fetch Data Produk
  useEffect(() => {
    async function fetchProduk() {
      try {
        setLoading(true)
        const res = await fetch('/api/produk?page=1&limit=15')
        if (!res.ok) throw new Error('Gagal mengambil data produk terbaru.')
        const result = await res.json()
        setProducts(result.data || [])
      } catch (err) {
        console.error(err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchProduk()
  }, [])

  const formatRupiah = (number) => {
    if (!number) return 'Rp 0'
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number)
  }

  const openBuyModal = (product) => {
    setSelectedProductForBuy(product)
  }

  // CORE LOGIC: Animasi Bintang Melesat yang disesuaikan ke Warm Amber Gold
  const handleKombinasi = (product, e) => {
    let targetSlot = null
    if (!combination.badan) targetSlot = 'badan'
    else if (!combination.lengan) targetSlot = 'lengan'
    else if (!combination.aksen) targetSlot = 'aksen'

    if (!targetSlot) targetSlot = 'badan'

    const roll = product.gulungan?.find(g => (g.panjang_sisa || 0) > 0) || product.gulungan?.[0]
    
    const fabricData = {
      id: roll?.id || product.id,
      gulungan_id: roll?.id || product.id,
      nomor_gulungan: roll?.nomor_gulungan || "01",
      harga: roll?.harga || roll?.harga_per_meter || 0,
      gambar_url: product.gambar_url,
      panjang_order: 1
    }

    const rect = e?.currentTarget?.getBoundingClientRect()
    const startX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2
    const startY = rect ? rect.top + rect.height / 2 : window.innerHeight / 2

    const batchId = Date.now()

    const tripleStars = [
      { id: `${batchId}-core`, x: startX, y: startY, img: product.gambar_url, delay: 0, size: 76 },
      { id: `${batchId}-tail1`, x: startX, y: startY, img: product.gambar_url, delay: 0.06, size: 56 },
      { id: `${batchId}-tail2`, x: startX, y: startY, img: product.gambar_url, delay: 0.12, size: 36 }
    ]

    setFlyingStars((prev) => [...prev, ...tripleStars])
    setSlot(targetSlot, fabricData)

    setTimeout(() => {
      setFlyingStars((prev) => prev.filter((star) => !star.id.startsWith(batchId.toString())))
    }, 1000)
  }

  return (
    <>
    /* ✨ BACKGROUND UTAMA: Diubah menjadi warna gading soft cream khas kain Linen alami Biyo Lurik */
    <div className="min-h-screen bg-[#FDFCFA] text-[#3E3431] antialiased pt-24 pb-28 px-4 sm:px-6 lg:px-8">
      
      {/* HEADER SECTION */}
      <div className="max-w-3xl mx-auto text-center mb-12 space-y-3">
        {/* Judul utama menggunakan Cokelat Gelap Mewah */}
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#3E3431]">
          Katalog Kain Lurik Premium
        </h1>
        {/* Sub-deskripsi menggunakan warna abu-cokelat arang yang halus */}
        <p className="text-xs md:text-sm text-[#706965] font-light max-w-xl mx-auto leading-relaxed">
          Koleksi lengkap kain lurik hasil karya perajin lokal menggunakan ATBM. Silakan pilih kain siap pakai atau lakukan kustomisasi pola.
        </p>
      </div>

      {loading && <SkeletonKatalog />}

      {error && !loading && (
        <div className="max-w-md mx-auto py-8 text-center border border-red-200 bg-red-50/50 rounded-2xl text-red-600 text-sm font-medium shadow-sm">
          Gagal memuat produk: {error}
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="max-w-md mx-auto py-12 text-center border border-[#EBE7E0] bg-[#FAF7F2] rounded-2xl text-[#706965] text-sm shadow-sm">
          Belum ada produk yang diterbitkan oleh Kepala Produksi.
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="max-w-7xl mx-auto grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {products.map((prod) => (
            <CardProdukKatalog 
              key={prod.id}
              product={prod}
              formatRupiah={formatRupiah}
              onBuyClick={openBuyModal}
              onKombinasiClick={(e) => handleKombinasi(prod, e)}
              isActivePo={activePoDropdown === prod.id}
              onTogglePoDropdown={() => setActivePoDropdown(activePoDropdown === prod.id ? null : prod.id)}
            />
          ))}
        </div>
      )}

      <ModalBeliKain 
        isOpen={!!selectedProductForBuy}
        product={selectedProductForBuy}
        onClose={() => setSelectedProductForBuy(null)}
        onConfirm={(totalItem) => console.log(`${totalItem} gulungan diproses.`)}
      />

      {/* Kontainer Transit Kombo */}
      <FloatingComboBar />

      {/* ─── STAGE TEATER UTAMA: INTERAKSI METEOR WARM AMBER GOLD GLOW ─── */}
      <AnimatePresence>
        {flyingStars.map((star) => (
          <motion.div
            key={star.id}
            initial={{ 
              left: star.x - star.size / 2, 
              top: star.y - star.size / 2, 
              scale: 0.2, 
              opacity: 0,
              rotate: 0 
            }}
            animate={{ 
              left: 45,      
              top: 130,      
              scale: [0.4, 1.4, 0.1], 
              opacity: [0, 1, 1, 0],
              rotate: 720,    
              filter: ["blur(0px)", "blur(0.5px)", "blur(2px)"],
              /* ✨ CAHAYA METEOR: Disesuaikan dari efek gelap menjadi pijaran emas bronze luxury (#C49A6C) */
              boxShadow: [
                "0 0 20px 5px rgba(196,154,108,0.4)",
                "0 0 45px 20px #C49A6C, 0 0 70px 35px rgba(255, 255, 255, 0.9)", 
                "0 0 5px 0px rgba(196,154,108,0)"
              ]
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 0.75, 
              delay: star.delay,
              ease: [0.16, 1, 0.3, 1] 
            }}
            style={{ width: star.size, height: star.size }}
            /* Mengubah border partikel menjadi Emas Bronze Lembut dan isi latar belakang menjadi Putih Alami */
            className="fixed z-[99999] pointer-events-none rounded-full border-2 border-[#C49A6C] bg-white overflow-hidden flex items-center justify-center mix-blend-multiply shadow-xl"
          >
            {/* Visual Mini Kain */}
            <img src={star.img} className="w-full h-full object-cover" alt="flying-fabric-node" />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#C49A6C]/50 via-amber-500/20 to-transparent animate-pulse" />
          </motion.div>
        ))}
      </AnimatePresence>

    </div>
    <Footer />
    </>
  )
}