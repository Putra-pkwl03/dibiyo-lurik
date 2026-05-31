import React from 'react'
import { Package, ShoppingBag, RefreshCw, ClipboardList } from 'lucide-react'

export default function StatCards({ stats }) {
  // Array warna background untuk kontainer ikon berdasarkan urutan card
  const iconBgColors = [
    'bg-[#2900A6]',   // Card 1
    'bg-[#FF7F7F]',   // Card 2
    'bg-[#B639FFC7]', // Card 3
    'bg-[#4F8A3F]'    // Card 4
  ]

  // Fungsi pembantu untuk merender ikon yang sesuai dengan warna putih seragam di dalam pembungkusnya
  const getIcon = (stat) => {
    if (stat.icon) {
      const IconComponent = stat.icon
      return <IconComponent size={24} className="text-white stroke-[2]" />
    }

    switch (stat.label) {
      case 'Produk Tersedia':
        return <Package size={24} className="text-white stroke-[2]" />
      case 'Produk Sold':
        return <ShoppingBag size={24} className="text-white stroke-[2]" />
      case 'Produk Belum di-Proses':
        return <RefreshCw size={22} className="text-white stroke-[2]" />
      case 'Produk Sedang di-Proses':
        return <ClipboardList size={24} className="text-white stroke-[2]" />
      default:
        return <Package size={24} className="text-white stroke-[2]" />
    }
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        // Cek apakah ini card pertama (indeks 0 atau label Produk Tersedia)
        const isGradientCard = index === 0 || stat.label === 'Produk Tersedia'
        
        // Ambil warna bg icon berdasarkan indeks (jika overload, kembali ke indeks 0)
        const currentIconBg = iconBgColors[index] || iconBgColors[0]

        return (
          <div 
            key={stat.label} 
            className={`flex justify-between items-start p-5 h-32 border rounded-lg shadow-md transform transition-all duration-300 ease-in-out hover:-translate-y-1.5 hover:shadow-md ${
              isGradientCard 
                ? 'bg-gradient-to-r from-[#FFE176] to-[#FFBF00] border-[#FFBF00]/30 hover:brightness-105' 
                : 'bg-white border-gray-100 hover:bg-gray-50/50'
            }`}
          >
            {/* Sisi Kiri: Label Status & Angka Nilai Utama */}
            <div className="flex flex-col justify-between h-full">
              <p className={`text-sm font-semibold tracking-wide ${
                isGradientCard ? 'text-white/90' : 'text-black/80'
              }`}>
                {stat.label}
              </p>
              {/* mt-auto mendorong nilai angka agar selalu konsisten berada di bagian bawah */}
              <p className={`text-3xl font-bold tracking-tight mt-auto ${
                isGradientCard ? 'text-white' : 'text-[#F2B600]'
              }`}>
                {stat.value}
              </p>
            </div>

            {/* Sisi Kanan: Kontainer Ikon Bulat Berwarna */}
            <div className="pt-0.5 pl-3 transition-transform duration-300 shrink-0 hover:scale-105">
              <div className={`p-2.5 rounded-lg flex items-center justify-center shadow-xs ${currentIconBg}`}>
                {getIcon(stat)}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}