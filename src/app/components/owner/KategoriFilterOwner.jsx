'use client'

import React from 'react'

export default function KategoriFilterOwner({ categories, activeCategory, setActiveCategory }) {
  return (
    <div className="flex gap-2 pb-4 overflow-x-auto select-none no-scrollbar">
      <button
        onClick={() => setActiveCategory('All')}
        className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
          activeCategory === 'All'
            ? 'bg-[#8B5E3C] text-white shadow-md'
            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
        }`}
      >
        Semua Produk
      </button>
      
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => setActiveCategory(cat)}
          className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all duration-200 ${
            activeCategory === cat
              ? 'bg-[#8B5E3C] text-white shadow-md'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}