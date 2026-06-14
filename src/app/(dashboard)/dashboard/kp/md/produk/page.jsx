import React from 'react'
import ProdukList from '../../../../../components/kp-produk/produk/stok-produk/ProdukList'

export const metadata = {
  title: 'Stok Produk | Dibyo Lurik Store'
}

export default function ProdukPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-black text-gray-800">Stok Produk</h2>
        <p className="text-xs text-gray-400 mt-0.5">Kelola data komprehensif master kain lurik beserta gulungan stok gudang.</p>
      </div>
      <ProdukList />
    </div>
  )
}