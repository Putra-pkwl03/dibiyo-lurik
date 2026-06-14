import React from 'react'
import DetailProduk from '../../../../../../components/kp-produk/produk/stok-produk/DetailModalKp'

export const metadata = {
  title: 'Detail Produk - Dibyo Lurik',
}

// Catatan: Jika menggunakan [id], 'id' akan ada di params
// Untuk saat ini, kita akan menangkapnya dari searchParams atau ID dummy 
// jika belum menggunakan dynamic routing
export default async function DetailProdukPage({ searchParams }) {
  // Mengambil ID dari URL query string (misal: .../Detail-Produk?id=123)
  const resolvedSearchParams = await searchParams;
  const productId = resolvedSearchParams?.id;

  return (
    <div className="space-y-3">
      {/* Header Utama Navigasi */}
      <header className="pb-1 border-b border-gray-150">
        <h2 className="text-2xl font-bold text-[#8B5E3C]">Detail Produk</h2>
        <p className="text-xs text-gray-500 mt-1.5 max-w-2xl leading-relaxed">
          Pusat Informasi Produk — Lihat detail dan kelola gulungan stok Anda di sini.
        </p>
      </header>

      {/* Komponen Detail */}
      {productId ? (
        <DetailProduk productId={productId} />
      ) : (
        <div className="p-10 text-center text-gray-400">
          ID Produk tidak ditemukan.
        </div>
      )}
    </div>
  )
}