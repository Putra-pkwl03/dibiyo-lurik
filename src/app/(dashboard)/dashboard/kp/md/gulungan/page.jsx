'use client'

import React, { useEffect } from 'react'
import GulunganList from '../../../../../components/kp-produk/produk/gulungan/GulunganList'

export default function GulunganPage() {
  useEffect(() => {
    document.title = 'Manajemen Gulungan Kain - Dibyo Lurik'
  }, [])

  return (
    <div className="space-y-3">
      {/* Header Utama Navigasi & Deskripsi Alur Informasi — IDENTIK DENGAN KATEGORI */}
      <header className="border-b border-gray-150 pb-1">
        <h2 className="text-2xl font-bold text-[#8B5E3C]">Gulungan Kain</h2>
        <p className="text-xs text-gray-500 mt-1.5 max-w-2xl leading-relaxed">
          Pusat Informasi Gulungan — Kelola stok dan ketersediaan gulungan kain produk Anda di sini.
        </p>
      </header>

      {/* Komponen Logika Utama, Toolbar, dan Tabel Accordion */}
      <GulunganList />
    </div>
  )
}