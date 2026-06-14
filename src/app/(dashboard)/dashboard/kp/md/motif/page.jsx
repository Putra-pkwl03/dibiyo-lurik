// /src/app/(dashboard)/dashboard/kepala-produksi/motif/page.jsx
import React from 'react'
// PERBAIKAN: Ubah nama variabel 'KategoriList' menjadi 'MotifList'
import MotifList from '../../../../../components/kp-produk/produk/motif/MotifList' 

export const metadata = {
  title: 'Manajemen Motif - Dibyo Lurik',
}

export default function MotifPage() {
  return (
       <div className="w-full mx-auto space-y-4 text-black font-inter">
      {/* Header Utama Navigasi & Deskripsi Alur Informasi */}
      <div className="relative overflow-x-visible">
        <h2 className="text-lg sm:text-[24px] font-medium text-black pb-2 sm:pb-0.5 border-b border-gray-500 tracking-wide -mx-4 px-4 sm:-mx-6 sm:px-6">
          Motif Produk
        <p className="max-w-2xl text-xs leading-relaxed text-gray-500">
         Pusat Informasi Motif — Kelola Motif Produk Anda di sini.
        </p>
        </h2>
      </div>

      {/* Komponen Tabel & Modal */}
      <MotifList />
    </div>
  )
}