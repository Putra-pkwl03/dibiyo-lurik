// src/app/components/home/Catalog.jsx
"use client"

import { useState, useEffect } from 'react'
import ModalDetail from './catalog/ModalDetail' 

export default function Catalog() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
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
      {/* --- HEADER SEKSI --- */}
      <div className="max-w-2xl mx-auto mb-16 space-y-3 text-center">
        {/* Perubahan: text-[#F9F6F0] -> text-[#2D2219] */}
        <h2 className="text-3xl font-bold tracking-tight text-[#2D2219]">Koleksi Eksklusif</h2>
        {/* Perubahan: text-[#A3A19E] -> text-[#6E655C] */}
        <p className="text-sm text-[#6E655C] font-light">
          Temukan keindahan wastra Nusantara yang ditenun dengan presisi tinggi tingkat tinggi, memadukan tradisi berabad-abad dengan estetika kontemporer.
        </p>
      </div>

      {/* --- STATUS LOADING (SKELETON LIGHT MODE) --- */}
      {loading && (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-[#EFEBE3]/60 border border-[#2D2219]/5 rounded-2xl h-[420px] flex flex-col justify-between p-6">
              <div className="w-full aspect-[4/3] bg-[#2D2219]/5 rounded-xl"></div>
              <div className="w-2/3 h-4 mt-4 rounded bg-[#2D2219]/10"></div>
              <div className="w-1/2 h-3 mt-2 rounded bg-[#2D2219]/5"></div>
              <div className="w-full h-10 mt-auto rounded-lg bg-[#2D2219]/10"></div>
            </div>
          ))}
        </div>
      )}

      {/* --- STATUS ERROR --- */}
      {error && !loading && (
        <div className="py-12 text-center border border-red-500/20 bg-red-500/5 rounded-2xl">
          <p className="text-sm text-red-600">Gagal memuat katalog produk: {error}</p>
        </div>
      )}

      {/* --- KONDISI DATA KOSONG --- */}
      {products.length === 0 && !loading && !error && (
        <div className="py-12 text-center border border-[#2D2219]/5 bg-[#F5F2EB]/50 rounded-2xl">
          <p className="text-sm text-[#6E655C]">Belum ada produk yang tersedia saat ini.</p>
        </div>
      )}

      {/* --- TAMPILAN DATA PRODUK UTAMA (SESUAI REF) --- */}
      {!loading && !error && products.length > 0 && (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {products.map((prod) => {
            const hargaTertera = prod.gulungan?.[0]?.harga || 0
            
            const productTitle = prod.motif?.nama && prod.kategori?.nama
              ? `${prod.motif.nama} ${prod.kategori.nama}`
              : prod.kode_produk || "Kain Lurik Premium"

            return (
              <div 
                key={prod.id} 
                /* Perubahan Card Luar:
                  - bg-[#1A1917] -> bg-[#F5F2EB]/70 (Warna krem kontras lembut)
                  - shadow-lg -> shadow-md dengan transisi hover melayang tipis
                  - border disesuaikan agar menyatu rapi dengan warna latar
                */
                className="bg-[#F5F2EB]/70 border border-[#2D2219]/5 rounded-2xl overflow-hidden shadow-md hover:shadow-xl group flex flex-col h-full transition-all duration-300 transform hover:-translate-y-1"
              >
                
                {/* Visual Gambar Produk */}
                <div className="w-full aspect-[4/3] bg-[#EFEBE3] relative flex items-center justify-center overflow-hidden">
                  {/* Perubahan Badge Kain:
                    - Diubah warnanya menjadi Jingga Terrakota Bumi asli sesuai penanda 'SINTETIS' / 'ALAMI' di mockup gambar
                  */}
                  <span className="absolute top-3 left-3 text-[9px] font-bold tracking-widest bg-[#D48C45] text-white px-2 py-1 rounded shadow-sm uppercase z-10">
                    {prod.jenis_pewarna || prod.status || 'ATBM'}
                  </span>
                  
                  {prod.gambar_url ? (
                    <img 
                      src={prod.gambar_url} 
                      alt={productTitle}
                      className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#E5E1D7] to-[#D8D3C5]">
                      <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#2D2219_1px,transparent_1px)] bg-[size:6px]"></div>
                      <span className="text-2xl opacity-30">🧵</span>
                      <span className="text-[10px] text-[#6E655C] mt-2 tracking-widest font-mono">{prod.kode_produk}</span>
                    </div>
                  )}
                </div>

                {/* Detail Informasi & Tombol Aksi */}
                <div className="flex flex-col justify-between flex-1 p-5 space-y-4">
                  <div className="space-y-1">
                    {/* Perubahan Judul: text-[#F9F6F0] -> text-[#2D2219] */}
                    <h3 className="font-bold text-base text-[#2D2219] tracking-tight line-clamp-1">
                      {productTitle}
                    </h3>
                    
                    <div className="flex items-center justify-between pt-0.5">
                      {/* Perubahan Harga: text-[#E5BA73] -> text-[#A67D45] (Tone emas bumi gelap) */}
                      <p className="text-sm text-[#A67D45] font-bold">
                        {formatRupiah(hargaTertera)} <span className="text-[#6E655C]/70 text-xs font-light">/ meter</span>
                      </p>
                      {/* Perubahan Container Stok: Dibungkus pill warna abu-krem transparan */}
                      <span className="text-[10px] font-medium text-[#6E655C] bg-[#2D2219]/5 px-2.5 py-0.5 rounded-md border border-[#2D2219]/5">
                        Stok: {prod.stok || 0}
                      </span>
                    </div>
                  </div>
                  
                  {/* Perubahan Tombol Beli:
                    - Mengubah style outline lama menjadi tombol solid tebal abu-cokelat gelap pekat sesuai mockup referensi (`bg-[#362E26]`)
                  */}
                  <button 
                    onClick={() => setSelectedProduct(prod)}
                    className="w-full py-2.5 bg-[#362E26] hover:bg-[#1A1510] text-white text-xs font-bold tracking-wider rounded-xl shadow-sm transition-all duration-300 mt-auto text-center"
                  >
                    Beli
                  </button>
                </div>

              </div>
            )
          })}
        </div>
      )}

      {/* --- MODAL DETAIL PRODUK --- */}
      <ModalDetail 
        isOpen={Boolean(selectedProduct)} 
        product={selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
      />
    </section>
  )
}