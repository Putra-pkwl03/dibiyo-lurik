import React from 'react'

export default function SkeletonKatalog() {
  return (
    /* Grid container dipertahankan sesuai struktur layout halaman */
    <div className="max-w-7xl mx-auto grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 animate-pulse">
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <div 
          key={n} 
          /* ✨ KOTAK KARTU SKELETON: Menggunakan basis putih dengan border krem pucat lembut */
          className="bg-white border border-[#EBE7E0] rounded-2xl h-[460px] p-6 flex flex-col justify-between shadow-sm"
        >
          {/* Skeleton Gambar: Area pratinjau kain menggunakan warna abu-krem hangat */}
          <div className="w-full aspect-[4/3] bg-[#F5F1E9] rounded-xl"></div>
          
          {/* Skeleton Nama Produk */}
          <div className="w-2/3 h-5 mt-5 bg-[#EBE7E0] rounded"></div>
          
          {/* Skeleton Harga per Meter */}
          <div className="w-1/3 h-4 mt-2 bg-[#F5F1E9] rounded"></div>
          
          {/* Skeleton Tombol Aksi Bawah (Grid 2 Tombol: Kombinasi & Beli) */}
          <div className="grid grid-cols-2 gap-4 mt-auto pt-4">
            <div className="h-11 bg-[#EBE7E0] rounded-xl"></div>
            <div className="h-11 bg-[#EBE7E0] rounded-xl"></div>
          </div>
        </div>
      ))}
    </div>
  )
}