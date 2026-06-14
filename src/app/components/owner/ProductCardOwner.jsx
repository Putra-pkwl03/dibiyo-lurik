'use client'

import React from 'react'
import { Eye } from 'lucide-react'

export default function ProductCardOwner({ product, onDetail }) {
  const isSoldOut = product.stok === 0

  return (
    <div className="flex flex-col overflow-hidden transition-shadow duration-300 bg-white border shadow-md rounded-2xl border-stone-100 hover:shadow-lg">
      {/* Container Gambar Motif Kain */}
      <div className="relative flex items-center justify-center w-full h-48 bg-stone-100 text-stone-400">
        <span className="font-mono text-xs">[ Foto Kain Lurik ]</span>
      </div>

      {/* Detail Informasi Kain */}
      <div className="flex flex-col justify-between flex-1 p-4">
        <div>
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-[10px] font-bold text-stone-400 tracking-wider uppercase">Kode Produk</p>
              <h4 className="text-sm font-bold text-stone-700">{product.kode}</h4>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-stone-400 tracking-wider uppercase">Rak</p>
              <span className="text-xs font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
                {product.rak}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 py-2 my-3 border-t border-b gap-y-2 gap-x-1 border-stone-50">
            <div>
              <p className="text-[10px] text-stone-400">Jenis Pewarna</p>
              <p className="text-xs font-medium text-stone-600">{product.jenisPewarna}</p>
            </div>
            <div>
              <p className="text-[10px] text-stone-400">Stok</p>
              <p className={`text-xs font-bold ${isSoldOut ? 'text-red-500' : 'text-stone-600'}`}>
                {product.stok} gulungan
              </p>
            </div>
            <div>
              <p className="text-[10px] text-stone-400">Kategori</p>
              <p className="text-xs font-medium text-[#8B5E3C]">{product.kategori}</p>
            </div>
            <div>
              <p className="text-[10px] text-stone-400">Jumlah Terjual</p>
              <p className="text-xs font-medium text-stone-600">{product.terjual} gulungan</p>
            </div>
            <div className="col-span-2">
              <p className="text-[10px] text-stone-400">Motif</p>
              <p className="text-xs font-medium truncate text-stone-700">{product.motif}</p>
            </div>
          </div>
        </div>

        {/* Bagian Tombol Aksi Bawah Sesuai Gambar mockup owner */}
        <div className="flex items-center justify-between pt-2 mt-auto">
          {isSoldOut ? (
            <span className="px-3 py-1.5 bg-red-100 text-red-600 font-bold rounded-xl text-xs uppercase tracking-wider">
              Sold
            </span>
          ) : (
            <span className="px-3 py-1.5 bg-sky-100 text-sky-600 font-bold rounded-xl text-xs uppercase tracking-wider">
              Ready
            </span>
          )}

          {/* Tombol Detail Berwarna Hijau Tosca */}
          <button
            onClick={() => onDetail(product)}
            className="flex items-center gap-1.5 py-1.5 px-3 bg-[#42BA96] hover:bg-[#359a7c] text-white rounded-lg text-xs font-medium transition-colors shadow-sm"
          >
            <Eye size={14} />
            <span>Detail</span>
          </button>
        </div>
      </div>
    </div>
  )
}