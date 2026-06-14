import React from 'react'
import KategoriList from '../../../../../components/kp-produk/produk/kategori/KategoritList'

export default function KategoriPage() {
  return (
     <div className="w-full mx-auto space-y-4 text-black font-inter">
      {/* Header Utama Navigasi & Deskripsi Alur Informasi */}
      <div className="relative overflow-x-visible">
        <h2 className="text-lg sm:text-[24px] font-medium text-black pb-2 sm:pb-0.5 border-b border-gray-500 tracking-wide -mx-4 px-4 sm:-mx-6 sm:px-6">
          Kategori Produk
        <p className="max-w-2xl text-xs leading-relaxed text-gray-500">
          Pusat Informasi Kategori — Kelola Kategori Produk Anda di sini.
        </p>
        </h2>
      </div>

      {/* Komponen Tabel & Modal */}
      <KategoriList />
    </div>
  )
}