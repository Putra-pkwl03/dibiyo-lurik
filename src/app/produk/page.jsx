"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SkeletonKatalog from '@/app/components/produk/SkeletonKatalog'
import CardProdukKatalog from '@/app/components/produk/CardProdukKatalog'
import ModalBeliKain from '@/app/components/produk/ModalBeliKain'

export default function ProdukPage() {
  const router = useRouter()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // State untuk Dropdown Pre-Order per produk
  const [activePoDropdown, setActivePoDropdown] = useState(null)

  // State untuk Modal Beli (Hanya menyimpan data produk yang dipilih)
  const [selectedProductForBuy, setSelectedProductForBuy] = useState(null)

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

  // Fungsi Format Mata Uang untuk CardProdukKatalog
  const formatRupiah = (number) => {
    if (!number) return 'Rp 0'
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number)
  }

  // Handle ketika tombol Beli di Card diklik
  const openBuyModal = (product) => {
    setSelectedProductForBuy(product)
  }

  // Handle Tombol Kombinasi (Redirect ke Customizer)
  const handleKombinasi = (product) => {
    localStorage.setItem('customizer_preset_motif', JSON.stringify(product.motif))
    router.push(`/customizer?produk_id=${product.id}`)
  }

  return (
    <div className="min-h-screen bg-[#0A1715] text-[#F9F6F0] antialiased pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      
      {/* Header Section */}
      <div className="max-w-4xl mx-auto mb-16 text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-[#E5BA73] sm:text-5xl">
          Katalog Kain Lurik Premium
        </h1>
        <p className="max-w-2xl mx-auto text-sm text-[#A3A19E] font-light leading-relaxed">
          Koleksi lengkap kain lurik hasil karya perajin lokal menggunakan ATBM (Alat Tenun Bukan Mesin). Silakan pilih kain siap pakai atau lakukan kustomisasi pola.
        </p>
      </div>

      {/* Loading Skeleton */}
      {loading && <SkeletonKatalog />}

      {/* Error / Empty Handler */}
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

      {/* Main Grid Products */}
      {!loading && !error && products.length > 0 && (
        <div className="max-w-7xl mx-auto grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {products.map((prod) => (
            <CardProdukKatalog 
              key={prod.id}
              prod={prod}
              formatRupiah={formatRupiah}
              onBuyClick={openBuyModal}
              onKombinasiClick={handleKombinasi}
              isActivePo={activePoDropdown === prod.id}
              onTogglePoDropdown={() => setActivePoDropdown(activePoDropdown === prod.id ? null : prod.id)}
            />
          ))}
        </div>
      )}

      {/* MODAL BELI OVERLAY (Mendukung Framer Motion & AnimatePresence) */}
      <ModalBeliKain 
        isOpen={!!selectedProductForBuy}
        product={selectedProductForBuy}
        onClose={() => setSelectedProductForBuy(null)}
        onConfirm={(totalItem) => {
          console.log(`${totalItem} gulungan berhasil ditambahkan.`);
          // Tempatkan fungsi tambahan di sini jika butuh refresh counter navbar dll.
        }}
      />

    </div>
  )
}