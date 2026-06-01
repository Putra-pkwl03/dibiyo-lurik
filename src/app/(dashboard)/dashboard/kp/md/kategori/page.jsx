import React from 'react'
import KategoriList from '../../../../../components/kp-produk/produk/kategori/KategoritList'

export default function KategoriPage() {
  return (
    <div className="space-y-3">
      {/* Header Utama Navigasi & Deskripsi Alur Informasi */}
      <header className="border-b border-gray-150 pb-1">
        <h2 className="text-2xl font-bold text-[#1A335A]">Kategori Produk</h2>
        <p className="text-xs text-gray-500 mt-1.5 max-w-2xl leading-relaxed">
          Pusat Informasi Kategori — Kelola Kategori Produk Anda di sini.
        </p>
      </header>

      {/* Komponen Tabel & Modal */}
      <KategoriList />
    </div>
  )
}