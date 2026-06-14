'use client';

import React from 'react';
import { Package } from 'lucide-react';
import ProductItemRow from './ProductItemRow';

export default function ProductItemsList({
  items,
  daftarHarga,
  updateItem,
  removeItem,
  addItem,
  handleImageChange,
  calculateTotal
}) {
  return (
    <div className="space-y-3 font-inter">
      {/* Judul Sub-bab Data Produk */}
    
      {/* Kotak Utama List Elemen Item - Menggunakan palet warna #E3C2AC59 & #A47352 */}
      <div className="border border-black bg-[#5AE3ED1C] rounded-lg p-5 space-y-4">
        
        {/* Kontainer Judul + Ikon (Sejajar horizontal dan konsisten secara UI/UX) */}
        <div className="flex items-center gap-2 px-1 text-black">
          <Package size={18} strokeWidth={2.5} className="text-black shrink-0" />
          <h2 className="text-sm font-bold">Data Produk</h2>
        </div>
        
        {/* Loop Daftar Item */}
        {items.map((item) => (
          <ProductItemRow
            key={item.id}
            item={item}
            daftarHarga={daftarHarga}
            updateItem={updateItem}
            removeItem={removeItem}
            handleImageChange={handleImageChange}
            calculateTotal={calculateTotal}
            canRemove={items.length > 1}
          />
        ))}
        
        {/* Tombol Tambah Item Sesuai Desain Mockup */}
        <button 
          type="button"
          onClick={addItem} 
          className="w-full h-[48px] border border-dashed border-black bg-transparent text-black hover:bg-black/10 rounded-[10px] font-semibold text-xs transition-all flex items-center justify-center gap-1.5 active:scale-[0.99]"
        >
          <span>+ Tambah Item</span>
        </button>
      </div>
    </div>
  );
}