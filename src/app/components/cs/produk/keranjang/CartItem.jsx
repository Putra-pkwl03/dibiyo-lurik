"use client";

import React from "react";
import { X } from "lucide-react";

export default function CartItem({ item, onChange, onRemove }) {
  const nomorGulungan = item.gulungan?.nomor_gulungan ?? "-";
  const lebar         = item.gulungan?.lebar ?? 0;
  const panjangTotal  = item.gulungan?.panjang_total ?? 0;
  const panjangSisa   = item.gulungan?.panjang_sisa ?? 0;
  const hargaPerMeter = item.gulungan?.harga_per_meter ?? 0; 

  // Rumus total harga: Panjang yang diinput * Harga per meter
  const totalHarga = (item.input_panjang || 0) * hargaPerMeter;

  return (
    <div className="bg-[#5AE3ED]/5 p-2 rounded-lg flex items-center gap-4 shadow-sm border border-[#E3C2AC]/20">
      
      {/* Gambar Mini Status Gulungan */}
      <div className="w-28 h-20 shrink-0 relative rounded-lg overflow-hidden border border-[#E3C2AC]/30 bg-stone-100 flex items-center justify-center">
        <img
          src={item.gulungan?.produk?.gambar_url || '/placeholder-kain.jpg'}
          className="object-cover w-full h-full opacity-80"
          alt="gulungan"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <span className="text-[10px] font-bold text-white tracking-wide">
            G-{nomorGulungan}
          </span>
        </div>
      </div>

      {/* Grid Informasi Utama (7 Kolom Sejajar) */}
      <div className="grid items-center flex-1 grid-cols-7 gap-4 text-xs text-stone-700">
        
        {/* Kolom 1: No Gulungan */}
        <div>
          <p className="text-[9px] text-stone-400 uppercase tracking-wider mb-0.5">No Gulungan</p>
          <p className="font-bold text-stone-800">G-{nomorGulungan}</p>
        </div>

        {/* Kolom 2: Lebar */}
        <div>
          <p className="text-[9px] text-stone-400 uppercase tracking-wider mb-0.5">Lebar</p>
          <p className="font-semibold text-stone-800">{lebar} cm</p>
        </div>
        
        {/* Kolom 3: Panjang Total */}
        <div>
          <p className="text-[9px] text-stone-400 uppercase tracking-wider mb-0.5">Pjg Total</p>
          <p className="font-medium text-stone-600">{panjangTotal} m</p>
        </div>

        {/* Kolom 4: Panjang Sisa */}
        <div>
          <p className="text-[9px] text-stone-400 uppercase tracking-wider mb-0.5">Pjg Sisa</p>
          <p className="font-bold text-amber-700">{panjangSisa} m</p>
        </div>

        {/* Kolom 5: Harga Per Meter */}
        <div>
          <p className="text-[9px] text-stone-400 uppercase tracking-wider mb-0.5">Harga/m</p>
          <p className="font-semibold text-stone-800">Rp{hargaPerMeter.toLocaleString()}</p>
        </div>

        {/* Kolom 6: Input Panjang Pemesanan */}
        <div>
          <p className="text-[9px] text-stone-500 font-semibold uppercase tracking-wider mb-1">
            Panjang Diorder (m)
          </p>
          <div className="relative flex items-center">
            <input
              type="number"
              min="1"
              max={panjangSisa}
              value={item.input_panjang || ""}
              onChange={(e) => onChange("input_panjang", Number(e.target.value))}
              className="w-full max-w-[100px] px-2 py-1.5 bg-white border border-[#E3C2AC] rounded-lg text-stone-800 font-bold text-center focus:outline-none focus:border-[#8B5E3C] focus:ring-1 focus:ring-[#8B5E3C]"
            />
            <span className="absolute right-3 text-[10px] text-stone-400 font-medium pointer-events-none">
              m
            </span>
          </div>
        </div>

        {/* Kolom 7: Subtotal Harga */}
        <div>
          <p className="text-[9px] text-stone-400 uppercase tracking-wider mb-0.5">Total Harga</p>
          <p className="font-bold text-[#8B5E3C] text-sm">Rp{totalHarga.toLocaleString()}</p>
        </div>

      </div>

      {/* Tombol Hapus Gulungan */}
      <button 
        onClick={onRemove} 
        className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors align-middle"
        title="Hapus dari keranjang"
      >
        <X size={18} />
      </button>
      
    </div>
  );
}