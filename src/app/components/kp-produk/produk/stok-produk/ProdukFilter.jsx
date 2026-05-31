// D:\dibiyo-lurik\src\app\components\kp-produk\produk\stok-produk\ProdukFilter.jsx
'use client'

import React from 'react'
import { X } from 'lucide-react'

export default function ProdukFilter({ categories, currentFilters, setFilters, onClose }) {
  
  // Fungsi utama untuk update filter (Logika Asli)
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key] === value ? '' : value
    }))
  }

  // Komponen Tombol Pilihan Opsi Filter
  const FilterButton = ({ active, onClick, children }) => (
    <button
      type="button"
      onClick={onClick}
      className={`w-full px-3 py-2.5 rounded-[12px] text-xs font-bold tracking-wide transition-all duration-150 active:scale-[0.97] ${
        active
          ? 'bg-[#A3704C] text-white shadow-md shadow-[#A3704C]/20'
          : 'bg-[#A3704C]/10 text-[#A3704C] hover:bg-[#A3704C]/15'
      }`}
    >
      {children}
    </button>
  )

  return (
    <>
      {/* 1. Backdrop Overlay: Menutup filter saat klik di luar area */}
      <div 
        className="fixed inset-0 z-40 bg-stone-900/10 backdrop-blur-xs md:bg-transparent" 
        onClick={onClose} 
      />

      {/* 2. Responsive Container Panel (Fix Lebar Eksplisit agar Tidak Gepeng) */}
      <div className="fixed inset-x-4 bottom-6 top-auto md:absolute md:inset-auto md:right-0 md:top-full md:mt-3 z-50 p-6 space-y-5 bg-white border border-[#A3704C]/15 shadow-2xl w-auto md:w-[350px] rounded-[24px] animate-in fade-in slide-in-from-bottom-5 md:slide-in-from-top-2 duration-200">
        
        {/* Header Dropdown */}
        <div className="flex items-center justify-between pb-1">
          <h4 className="text-[16px] font-bold text-[#A3704C]">Pilih Filter</h4>
          <button 
            onClick={onClose} 
            className="text-[#A3704C]/50 hover:text-[#A3704C] p-1.5 rounded-full hover:bg-stone-50 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Kategori Filter */}
        <div className="space-y-2.5">
          <label className="text-[11px] font-bold text-[#A3704C]/60 block uppercase tracking-wider">
            Kategori
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <div key={cat.id} className="w-[calc(50%-4px)] sm:w-auto min-w-[100px] sm:min-w-0">
                <FilterButton
                  active={currentFilters.kategori_id === cat.id}
                  onClick={() => handleFilterChange('kategori_id', cat.id)}
                >
                  {cat.nama}
                </FilterButton>
              </div>
            ))}
          </div>
        </div>

        {/* Pewarna Filter */}
        <div className="space-y-2.5">
          <label className="text-[11px] font-bold text-[#A3704C]/60 block uppercase tracking-wider">
            Pewarna
          </label>
          <div className="grid grid-cols-2 gap-2">
            {['sintetis', 'alami'].map((type) => (
              <FilterButton
                key={type}
                active={currentFilters.jenis_pewarna === type}
                onClick={() => handleFilterChange('jenis_pewarna', type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </FilterButton>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div className="space-y-2.5">
          <label className="text-[11px] font-bold text-[#A3704C]/60 block uppercase tracking-wider">
            Status Produk
          </label>
          <div className="grid grid-cols-2 gap-2">
            {['ready', 'sold'].map((st) => (
              <FilterButton
                key={st}
                active={currentFilters.status === st}
                onClick={() => handleFilterChange('status', st)}
              >
                {st === 'ready' ? 'Ready' : 'Sold'}
              </FilterButton>
            ))}
          </div>
        </div>

        {/* Tombol Reset Utama */}
        <div className="pt-2 border-t border-stone-100">
          <button
            onClick={() => setFilters({ kategori_id: '', jenis_pewarna: '', status: '' })}
            className="w-full py-3 text-center text-sm font-bold bg-[#A3704C]/10 text-[#A3704C] rounded-[12px] hover:bg-[#A3704C]/15 transition-colors active:scale-[0.98] duration-150"
          >
            Reset Filter
          </button>
        </div>
      </div>
    </>
  )
}