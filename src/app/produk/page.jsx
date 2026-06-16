"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SkeletonKatalog from '@/app/components/produk/SkeletonKatalog'
import CardProdukKatalog from '@/app/components/produk/CardProdukKatalog'
import ModalBeliKain from '@/app/components/produk/ModalBeliKain'
import FloatingComboBar from '@/app/components/produk/FloatingComboBar'
import { useComboStore } from '@/app/store/useComboStore'

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

  // CORE LOGIC: Animasi Bintang Melesat Tebal Berantai Keluar dari Card
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

    // Tangkap koordinat absolut posisi Card / Tombol yang sedang diklik oleh pengguna
    const rect = e?.currentTarget?.getBoundingClientRect()
    const startX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2
    const startY = rect ? rect.top + rect.height / 2 : window.innerHeight / 2

    const batchId = Date.now()

    // Amunisi 3 lapis ekor bintang (Staggered particles) agar visual tebal & meriah
    const tripleStars = [
      { id: `${batchId}-core`, x: startX, y: startY, img: product.gambar_url, delay: 0, size: 76 },
      { id: `${batchId}-tail1`, x: startX, y: startY, img: product.gambar_url, delay: 0.06, size: 56 },
      { id: `${batchId}-tail2`, x: startX, y: startY, img: product.gambar_url, delay: 0.12, size: 36 }
    ]

    // Luncurkan gugusan partikel berkilau ke angkasa
    setFlyingStars((prev) => [...prev, ...tripleStars])
    setSlot(targetSlot, fabricData)

    // Bersihkan data setelah seluruh rangkaian ekor mendarat sempurna (durasi dinaikkan ke 1 detik)
    setTimeout(() => {
      setFlyingStars((prev) => prev.filter((star) => !star.id.startsWith(batchId.toString())))
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-[#0A1715] text-[#F9F6F0] antialiased pt-24 pb-28 px-4 sm:px-6 lg:px-8">
      
      <div className="max-w-3xl mx-auto text-center mb-12 space-y-2">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#E5BA73]">
          Katalog Kain Lurik Premium
        </h1>
        <p className="text-xs md:text-sm text-[#A3A19E] max-w-xl mx-auto">
          Koleksi lengkap kain lurik hasil karya perajin lokal menggunakan ATBM. Silakan pilih kain siap pakai atau lakukan kustomisasi pola.
        </p>
      </div>

      {loading && <SkeletonKatalog />}

      {error && !loading && (
        <div className="max-w-md mx-auto py-8 text-center border border-red-500/20 bg-red-500/5 rounded-2xl text-red-400 text-sm">
          Gagal memuat produk: {error}
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="max-w-md mx-auto py-12 text-center border border-white/5 bg-white/5 rounded-2xl text-[#A3A19E] text-sm">
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

      {/* Kontainer Transit Pojok Kiri Atas */}
      <FloatingComboBar />

      {/* ─── STAGE TEATER UTAMA: ULTRA SHOOTING METEOR COBALT GLOW ─── */}
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
              left: 45,       // Mendarat presisi di titik tumpu X kontainer kiri atas
              top: 130,       // Mendarat presisi di titik tumpu Y kontainer kiri atas
              scale: [0.4, 1.4, 0.1], // Meledak membesar saat melesat keluar, lalu menyusut tajam saat terhisap masuk kontainer
              opacity: [0, 1, 1, 0],
              rotate: 720,    // Efek putaran puting beliung supersonik sepanjang lintasan terbang
              filter: ["blur(0px)", "blur(0.5px)", "blur(3px)"],
              // Ketebalan Cahaya Ganda Ekstrim (Campuran Amber Emas & Intisari Putih Bersinar)
              boxShadow: [
                "0 0 20px 5px rgba(229,186,115,0.5)",
                "0 0 55px 25px #E5BA73, 0 0 90px 45px rgba(255, 255, 255, 0.7)", 
                "0 0 5px 0px rgba(229,186,115,0)"
              ]
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 0.75, 
              delay: star.delay,
              ease: [0.16, 1, 0.3, 1] // Kurva akselerasi kilat untuk kesan aerodinamis yang nyata
            }}
            style={{ width: star.size, height: star.size }}
            className="fixed z-[99999] pointer-events-none rounded-full border-2 border-[#E5BA73] bg-[#12110F] overflow-hidden flex items-center justify-center mix-blend-screen shadow-2xl"
          >
            {/* Visual Mini Kain di Dalam Inti Api Meteor */}
            <img src={star.img} className="w-full h-full object-cover" alt="flying-fabric-node" />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#E5BA73]/70 via-amber-500/30 to-transparent animate-pulse" />
          </motion.div>
        ))}
      </AnimatePresence>

    </div>
  )
}