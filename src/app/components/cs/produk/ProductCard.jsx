'use client'

import React from 'react'

export default function ProductCard({ product, onAddReguler, onBuy }) {
  const kodeProduk   = product?.kode_produk   || '-'
  const kategoriNama = product?.kategori?.nama || '-'
  const motifNama    = product?.motif?.nama    || '-'
  const terjual      = product?.terjual ?? 0
  const gambarUrl    = product?.gambar_url

  // MANAGE STOK: Hitung total gulungan yang memiliki sisa kain (panjang_sisa > 0)
  const hitungGulunganAktif = () => {
    if (Array.isArray(product?.gulungan)) {
      return product.gulungan.filter(g => (g.panjang_sisa ?? 0) > 0).length
    }
    // Fallback jika array gulungan kosong, gunakan properti stok bawaan
    return product?.stok ?? 0
  }

  const jumlahGulungan = hitungGulunganAktif()
  const isReady = jumlahGulungan > 0

  return (
    <div className="bg-white rounded-md shadow-[1px_4px_8px_0px_rgba(0,0,0,0.25)] overflow-hidden flex flex-col font-inter border border-gray-100/50 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-[1px_12px_20px_0px_rgba(0,0,0,0.3)]">
      
      {/* Bagian Gambar Atas */}
      <div className="p-3.5 pb-0">
        <div className="w-full aspect-[16/7] rounded-md overflow-hidden bg-[#E3C2AC]/10 flex items-center justify-center relative shadow-sm">
          <img 
            src={gambarUrl || '/placeholder-kain.jpg'} 
            alt={motifNama} 
            className="object-cover w-full h-full transition-transform duration-500 ease-out hover:scale-110"
          />

          {/* BADGE STATUS: Sekarang dipindah ke sini agar tumpang tindih di kanan atas depan gambar  backgroundColor: 'rgba(26, 51, 90, 0.4)', */}
          <span
            style={{ backgroundColor: isReady ? 'rgba(26, 51, 90, 0.4)' : '#FC4B4B' }}
            className="absolute top-3 left-3 z-10 px-2.5 py-2 rounded-full text-white text-[9px] font-bold min-w-[80px] text-center shadow-md select-none backdrop-blur-[1px]"
          >
            {isReady ? 'Produk Tersedia' : 'Produk Habis'}
          </span>
        </div>
      </div>

      {/* Bagian Grid Konten Utama */}
      <div className="flex-1 px-4 pt-4 pb-3 text-xs">
        <div className="grid grid-cols-3 gap-x-2 gap-y-3.5">
          <InfoBlock label="Kode Produksi" value={kodeProduk} />
          <InfoBlock label="Motif" value={motifNama} />
          <InfoBlock label="Kategori" value={kategoriNama} />

          {/* Stok dinamis berdasarkan sisa meter kain di gulungan */}
          <InfoBlock label="Stok" value={jumlahGulungan > 0 ? `${jumlahGulungan} Gulungan` : '0 Gulungan'} />
          <InfoBlock label="Jumlah Terjual" value={`${terjual} Meter`} />
          <div className="min-w-0" />
        </div>
      </div>

      {/* Footer Aksi (Sekarang hanya berisi tombol, membuat space tombol jadi lebih lega) */}
      <div className="flex items-center justify-end gap-2 px-4 pt-3 pb-4 mt-6">
        <div className="flex items-center gap-2">
          {/* Tombol Pre-Order Reguler */}
          <button 
            type="button"
            onClick={() => onAddReguler && onAddReguler(product)}
            className="h-[30px] px-4 rounded-md bg-[#1DB793] hover:bg-[#15755f] text-white text-[9px] font-bold transition-all duration-200 shadow-sm flex items-center justify-center hover:shadow-md active:scale-[0.96]"
          >
            + Pre Order Reguler
          </button>
          
          {/* Tombol Beli */}
          <button 
            type="button"
            onClick={() => onBuy && onBuy(product)} 
            className="h-[30px] px-4 rounded-md bg-[#F0A864] hover:bg-[#df9955] text-white text-[9px] font-bold transition-all duration-200 shadow-sm flex items-center justify-center hover:shadow-md active:scale-[0.96]"
          >
            Beli
          </button>
        </div>
      </div>
    </div>
  )
}

function InfoBlock({ label, value, className = '' }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <p className="text-[#00000040] text-[10px] font-medium tracking-wide leading-tight mb-1">
        {label}
      </p>
      <p className="text-[#1A335A] text-[11px] font-bold leading-tight truncate">
        {value}
      </p>
    </div>
  )
}