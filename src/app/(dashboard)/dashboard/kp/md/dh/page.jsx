// /src/app/(dashboard)/dashboard/kepala-produksi/master-data/daftar-harga/page.jsx
import React from 'react'
import HargaList from '../../../../../components/kp-produk/produk/daftar-harga/HargaList'

export const metadata = {
  title: 'Daftar Harga Kain - Dibyo Lurik',
}

export default function DaftarHargaPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight text-gray-800">Manajemen Daftar Harga</h2>
        <p className="text-sm text-gray-500">
          Atur harga jual per meter kain berdasarkan kombinasi bahan pewarna, ukuran lebar, dan spesifikasi motif.
        </p>
      </div>

      <HargaList />
    </div>
  )
}