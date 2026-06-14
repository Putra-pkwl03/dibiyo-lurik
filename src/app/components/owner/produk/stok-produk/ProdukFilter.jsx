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

  // Komponen Tombol Pilihan Opsi Filter - Disesuaikan ke Tema Navy Blue Terbaru
  const FilterButton = ({ active, onClick, children }) => (
    <button
      type="button"
      onClick={onClick}
      className={`w-full px-3 py-2.5 rounded-[8px] text-xs font-semibold tracking-wide transition-all duration-150 active:scale-[0.97] ${
        active
          ? 'bg-[#1A335A] text-white shadow-md shadow-[#1A335A]/10'
          : 'bg-[#EBF5FA] text-[#1A335A] hover:bg-sky-100 border border-transparent'
      }`}
    >
      {children}
    </button>
  )

return (
    <>
      {/* 1. Backdrop Overlay */}
      <div 
        className="fixed inset-0 z-40 bg-black/5 backdrop-blur-xs md:bg-transparent" 
        onClick={onClose} 
      />

      {/* 2. Responsive Container Panel - DIPERBARUI UNTUK POSISI TENGAH DI DESKTOP */}
      <div className="fixed inset-x-4 bottom-6 top-auto md:absolute md:inset-auto md:left-1/2 md:-translate-x-1/2 md:top-full md:mt-2 z-50 p-5 space-y-4 bg-white border border-gray-200 shadow-xl w-auto md:w-[300px] rounded-[10px] animate-in fade-in slide-in-from-bottom-5 md:slide-in-from-top-2 duration-200">
        
        {/* Header Dropdown */}
        <div className="flex items-center justify-between pb-1">
          <h4 className="text-[15px] font-bold text-gray-800">Pilih Filter</h4>
          <button 
            onClick={onClose} 
            className="p-1 text-gray-400 transition-colors rounded-full hover:text-gray-600 hover:bg-gray-100"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>
        
        {/* Kategori Filter */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">
            Kategori
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <div key={cat.id} className="w-[calc(50%-4px)] sm:w-auto min-w-[95px] sm:min-w-0">
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
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">
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
<div className="space-y-2">
  <label className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">
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
        <div className="pt-2 border-t border-gray-100">
          <button
            onClick={() => setFilters({ kategori_id: '', jenis_pewarna: '', status: '' })}
            className="w-full py-2.5 text-center text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-[8px] transition-colors active:scale-[0.98] duration-150"
          >
            Reset Filter
          </button>
        </div>
      </div>
    </>
  )
}