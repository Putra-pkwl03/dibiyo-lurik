"use client";

import React from "react";
import { X } from "lucide-react";

export default function CartItem({ item, onChange, onRemove }) {
  const nomorGulungan = item.gulungan?.nomor_gulungan ?? "-";
  const lebar         = item.gulungan?.lebar ?? 0;
  const panjangSisa   = item.gulungan?.panjang_sisa ?? 0;
  
  // ====================================================================
  // KUNCI PERBAIKAN: Fallback Adaptif untuk Gambar dan Kode Produk
  // ====================================================================
  const gambarKain = item.product?.gambar_url || item.gulungan?.produk?.gambar_url || '/placeholder-kain.jpg';
  const kodeProduk = item.product?.kode_produk || item.gulungan?.produk?.kode_produk || "Kain Lurik";
  
  const hargaPerMeter = item.gulungan?.harga_per_meter || item.gulungan?.harga || 0; 
  const totalHarga = (item.input_panjang || 0) * hargaPerMeter;

  return (
    <div className="bg-[#0A1715]/60 p-3 rounded-xl flex flex-col sm:flex-row items-center gap-4 shadow-md border border-white/5 transition-all hover:border-[#E5BA73]/20">
      
      <div className="relative flex items-center justify-center w-full h-24 overflow-hidden border rounded-lg sm:w-28 shrink-0 border-white/5 bg-zinc-900">
        <img
          src={gambarKain} 
          className="object-cover w-full h-full opacity-70"
          alt={`Gulungan kain lurik ${kodeProduk}`}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <span className="text-[10px] font-bold text-[#E5BA73] tracking-widest uppercase bg-[#12110F]/90 px-2 py-0.5 rounded border border-[#E5BA73]/20">
            G-{nomorGulungan}
          </span>
        </div>
      </div>

      {/* Grid Informasi Kain */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 flex-1 w-full text-xs text-[#F9F6F0]">
        
        {/* Kolom 1: No Gulungan / Kode Produk */}
        <div className="hidden md:block">
          <p className="text-[9px] text-[#A3A19E] uppercase tracking-wider mb-0.5">Kode Kain</p>
          <p className="font-bold text-[#E5BA73] truncate max-w-[100px]" title={kodeProduk}>
            {kodeProduk}
          </p>
        </div>

        {/* Kolom 2: Lebar */}
        <div>
          <p className="text-[9px] text-[#A3A19E] uppercase tracking-wider mb-0.5">Lebar Kain</p>
          <p className="font-semibold text-[#F9F6F0]/90">{lebar} cm</p>
        </div>

        {/* Kolom 3: Sisa Stok */}
        <div>
          <p className="text-[9px] text-[#A3A19E] uppercase tracking-wider mb-0.5">Sisa Kain</p>
          <p className="font-bold text-amber-500">{panjangSisa} m</p>
        </div>

        {/* Kolom 4: Harga Per Meter */}
        <div>
          <p className="text-[9px] text-[#A3A19E] uppercase tracking-wider mb-0.5">Harga / Meter</p>
          <p className="font-semibold text-[#F9F6F0]/90">Rp{hargaPerMeter.toLocaleString('id-ID')}</p>
        </div>

        {/* Kolom 5: Input Panjang Pemesanan */}
        <div className="col-span-1">
          <p className="text-[9px] text-[#E5BA73] font-semibold uppercase tracking-wider mb-1">
            Panjang Diorder
          </p>
          <div className="relative flex items-center max-w-[110px]">
            <input
              type="number"
              min="1"
              max={panjangSisa}
              value={item.input_panjang || ""}
              onChange={(e) => onChange("input_panjang", Number(e.target.value))}
              className="w-full px-2 py-1 bg-[#12110F] border border-white/10 rounded-lg text-[#E5BA73] font-bold text-center focus:outline-none focus:border-[#E5BA73] focus:ring-1 focus:ring-[#E5BA73] text-xs"
            />
            <span className="absolute right-2 text-[10px] text-[#A3A19E] font-medium pointer-events-none">
              m
            </span>
          </div>
        </div>

        {/* Kolom 6: Subtotal Harga */}
        <div className="col-span-1 text-right md:text-left md:col-span-1">
          <p className="text-[9px] text-[#A3A19E] uppercase tracking-wider mb-0.5">Subtotal</p>
          <p className="font-black text-[#E5BA73] text-sm">Rp{totalHarga.toLocaleString('id-ID')}</p>
        </div>

      </div>

      {/* Tombol Hapus */}
      <button 
        onClick={onRemove} 
        className="p-2 text-[#A3A19E] hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors shrink-0 self-end sm:self-center"
        title="Hapus kain dari keranjang"
      >
        <X size={16} />
      </button>
      
    </div>
  );
}