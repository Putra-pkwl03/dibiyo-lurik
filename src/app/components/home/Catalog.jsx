// src/app/components/home/Catalog.jsx
"use client"

import { useState, useEffect } from 'react'
import ModalDetail from './catalog/ModalDetail' 

export default function Catalog() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // <-- 2. STATE UNTUK KONTROL MODAL
  const [selectedProduct, setSelectedProduct] = useState(null)

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
        const res = await fetch('/api/produk?page=1&limit=9')
        
        if (!res.ok) {
          throw new Error('Gagal mengambil data dari server')
        }
        
        const result = await res.json()
        setProducts(result.data || [])
      } catch (err) {
        console.error("Fetch Error:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const formatRupiah = (number) => {
    if (!number) return 'Rp 0'
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number)
  }

  return (
    <section id="produk" className="px-4 py-20 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto mb-16 space-y-3 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-[#F9F6F0]">Koleksi Eksklusif</h2>
        <p className="text-sm text-[#A3A19E] font-light">
          Temukan keindahan wastra Nusantara yang ditenun dengan presisi tinggi tingkat tinggi, memadukan tradisi berabad-abad dengan estetika kontemporer.
        </p>
      </div>

      {/* --- STATUS LOADING --- */}
      {loading && (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-[#1A1917]/50 border border-[#E5BA73]/5 rounded-2xl h-[400px] flex flex-col justify-between p-6">
              <div className="w-full aspect-[4/3] bg-white/5 rounded-xl"></div>
              <div className="w-2/3 h-4 mt-4 rounded bg-white/10"></div>
              <div className="w-1/2 h-3 mt-2 rounded bg-white/5"></div>
              <div className="w-full h-10 mt-auto rounded-lg bg-white/5"></div>
            </div>
          ))}
        </div>
      )}

      {/* --- STATUS ERROR --- */}
      {error && !loading && (
        <div className="py-12 text-center border border-red-500/20 bg-red-500/5 rounded-2xl">
          <p className="text-sm text-red-400">Gagal memuat katalog produk: {error}</p>
        </div>
      )}

      {/* --- KONDISI DATA KOSONG --- */}
      {products.length === 0 && !loading && !error && (
        <div className="py-12 text-center border border-white/5 bg-white/5 rounded-2xl">
          <p className="text-sm text-[#A3A19E]">Belum ada produk yang tersedia saat ini.</p>
        </div>
      )}

      {/* --- TAMPILAN DATA PRODUK UTAMA --- */}
      {!loading && !error && products.length > 0 && (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {products.map((prod) => {
            const hargaTertera = prod.gulungan?.[0]?.harga || 0
            
            const productTitle = prod.motif?.nama && prod.kategori?.nama
              ? `${prod.motif.nama} ${prod.kategori.nama}`
              : prod.kode_produk || "Kain Lurik Premium"

            return (
              <div key={prod.id} className="bg-[#1A1917] border border-[#E5BA73]/5 rounded-2xl overflow-hidden shadow-lg group flex flex-col h-full hover:border-[#E5BA73]/20 transition-all duration-300">
                
                {/* Visual Gambar Produk */}
                <div className="w-full aspect-[4/3] bg-[#12110F] relative flex items-center justify-center overflow-hidden">
                  <span className="absolute top-3 left-3 text-[9px] font-bold tracking-widest bg-[#12110F]/80 text-[#E5BA73] px-2 py-1 rounded border border-[#E5BA73]/20 uppercase z-10">
                    {prod.jenis_pewarna || prod.status || 'ATBM'}
                  </span>
                  
                  {prod.gambar_url ? (
                    <img 
                      src={prod.gambar_url} 
                      alt={productTitle}
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#1E293B] to-[#0F172A]">
                      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#fff_1px,transparent_1px)] bg-[size:6px]"></div>
                      <span className="text-2xl opacity-40">🧵</span>
                      <span className="text-[10px] text-[#A3A19E] mt-2 tracking-widest">{prod.kode_produk}</span>
                    </div>
                  )}
                </div>

                {/* Detail Informasi */}
                <div className="flex flex-col justify-between flex-1 p-6 space-y-4">
                  <div>
                    <h3 className="font-bold text-base text-[#F9F6F0] line-clamp-1">{productTitle}</h3>
                    <div className="flex items-center justify-between mt-1.5">
                      <p className="text-xs text-[#E5BA73] font-semibold">
                        {formatRupiah(hargaTertera)} <span className="text-[#A3A19E]/60 font-light">/ meter</span>
                      </p>
                      <span className="text-[10px] text-[#A3A19E] bg-white/5 px-2 py-0.5 rounded">
                        Stok: {prod.stok || 0}
                      </span>
                    </div>
                  </div>
                  
                  {/* <-- 3. DI SINI AKTIFKAN TRIGGER KLIK BUTTON */}
                  <button 
                    onClick={() => setSelectedProduct(prod)}
                    className="w-full py-2.5 bg-transparent border border-[#A3A19E]/20 text-xs font-semibold tracking-wider text-[#A3A19E] hover:text-[#E5BA73] hover:border-[#E5BA73] hover:bg-[#E5BA73]/5 rounded-lg transition-all duration-300 mt-auto"
                  >
                    Lihat Detail
                  </button>
                </div>

              </div>
            )
          })}
        </div>
      )}

      {/* <-- 4. RENDER MODALNYA DI BAWAH LUAR LOOPING GRID */}
      <ModalDetail 
        isOpen={Boolean(selectedProduct)} 
        product={selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
      />
    </section>
  )
}