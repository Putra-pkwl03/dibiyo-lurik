"use client";

import React from "react";
import { X } from "lucide-react";

// ====================================================================
// UTILITY: Generator Gradient CSS Lurik (Sama seperti di Modal)
// ====================================================================
const generateLurikGradient = (stripes) => {
  let gradientString = '';
  let currentOffset = 0;

  if (!stripes || stripes.length === 0) return { gradient: 'none', totalWidth: 0 };

  stripes.forEach((stripe) => {
    const startPoint = currentOffset;
    const endPoint = currentOffset + stripe.thickness;
    gradientString += `${stripe.color} ${startPoint}px, ${stripe.color} ${endPoint}px, `;
    gradientString += `transparent ${endPoint}px, transparent ${endPoint + 2}px, `;
    currentOffset = endPoint + 2; 
  });

  return {
    gradient: `linear-gradient(90deg, ${gradientString.slice(0, -2)})`,
    totalWidth: currentOffset
  };
};

export default function CartItem({ item, onChange, onRemove }) {
  // Deteksi apakah ini item kustom berdasarkan bendera atau format ID
  const isCustomItem = item.isCustom || item.gulungan?.nomor_gulungan === "CUSTOM";

  const nomorGulungan = item.gulungan?.nomor_gulungan ?? "-";
  const lebar         = item.gulungan?.lebar ?? 0;
  // Sisa stok tidak relevan untuk item kustom yang belum dibuat
  const panjangSisa   = isCustomItem ? "-" : (item.gulungan?.panjang_sisa ?? 0);
  
  const kodeProduk = item.product?.kode_produk || item.gulungan?.produk?.kode_produk || (isCustomItem ? "Lurik Kustom" : "Kain Lurik");
  
  const hargaPerMeter = item.gulungan?.harga_per_meter || item.gulungan?.harga || 0; 
  const totalHarga = (item.input_panjang || 0) * hargaPerMeter;

  // ====================================================================
  // LOGIKA VISUAL KUSTOM (CSS Murni) vs REGULAR (Image)
  // ====================================================================
  let visualPreview;

  if (isCustomItem && item.gulungan?.configurasi) {
    // --- MODE KUSTOM: Generate Pratinjau CSS Berlipat ---
    const { bgColor, patternDensity, stripes } = item.gulungan.configurasi;
    const { gradient, totalWidth } = generateLurikGradient(stripes);
    const ukuranKerapatanDinamis = (totalWidth * (patternDensity / 100)) || 20;

    const patternStyle = {
      backgroundColor: bgColor, 
      backgroundImage: gradient,
      backgroundSize: `${ukuranKerapatanDinamis}px 100%`,
      // 🔥 MASKING: Potong pola CSS sesuai bentuk lipatan kain gantung
      maskImage: "url('/mockups/kain-gantung-mask.png')",
      WebkitMaskImage: "url('/mockups/kain-gantung-mask.png')",
      maskSize: 'contain',
      WebkitMaskSize: 'contain',
      maskRepeat: 'no-repeat',
      maskPosition: 'center',
    };

    visualPreview = (
      <div className="relative flex items-center justify-center w-full h-full overflow-hidden transition-all duration-300 ease-in-out">
        {/* Layer 1: Pola Vektor CSS yang dipotong (masked) */}
        <div style={patternStyle} className="absolute inset-0 w-full h-full" />
        
        {/* Layer 2: Gambar bayangan (shading overlay) untuk efek 3D lipatan */}
        <img 
          src="/mockups/kain-gantung-mask.png" 
          alt="Tekstur Lipatan Kustom" 
          className="absolute inset-0 object-contain w-full h-full pointer-events-none mix-blend-multiply opacity-90" 
        />
        
        {/* Layer 3: Ambient Shadow tambahan untuk kedalaman */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.3)_100%)] pointer-events-none" />
      </div>
    );
  } else {
    // --- MODE REGULAR: Gunakan Gambar Statis Teroptimasi ---
    const gambarKain = item.product?.gambar_url || item.gulungan?.produk?.gambar_url || '/placeholder-kain.jpg';
    visualPreview = (
      <img
        src={gambarKain} 
        className="object-cover w-full h-full transition-opacity opacity-80 group-hover:opacity-100"
        alt={`Gulungan kain lurik ${kodeProduk}`}
      />
    );
  }

  return (
    <div className="group bg-[#ffffff] p-3 rounded-xl flex flex-col sm:flex-row items-center gap-4 shadow-md border border-white/5 transition-all hover:border-[#E5BA73]/20">
      
      {/* AREA PRATINJAU VISUAL (Sesuai Ukuran Asli) */}
      <div className="relative flex items-center justify-center w-full h-24 overflow-hidden border rounded-lg shadow-inner sm:w-28 shrink-0 border-white/5 bg-zinc-900">
        
        {visualPreview} 
        
        {/* 🔥 BADGE PINDAH KE KIRI ATAS & DIPERKECIL */}
        <div className="absolute top-1.5 left-1.5 z-10 pointer-events-none">
          <span className={`text-[8px] font-extrabold tracking-wider uppercase px-1.5 py-0.5 rounded border shadow-sm ${
            isCustomItem 
              ? "bg-[#F5F2EB] text-[#E5BA73] border-[#E5BA73]/20" 
              : "bg-[#F5F2EB] text-[#E5BA73] border-[#E5BA73]/20"
          }`}>
            {isCustomItem ? "K" : `G-${nomorGulungan}`}
          </span>
        </div>

        {/* Overlay Hover Tipis Efek Gelap */}
        <div className="absolute inset-0 transition-colors pointer-events-none bg-black/10 group-hover:bg-black/0" />
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

        {/* Kolom 3: Sisa Stok / Status */}
        <div>
          <p className="text-[9px] text-[#A3A19E] uppercase tracking-wider mb-0.5">Sisa Kain</p>
          <p className={`font-bold ${isCustomItem ? "text-sky-400" : "text-amber-500"}`}>
            {panjangSisa} {isCustomItem ? "" : "m"}
          </p>
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
              min="0.5"
              step="0.5"
              max={isCustomItem ? 999 : panjangSisa} 
              value={item.input_panjang || ""}
              onChange={(e) => onChange("input_panjang", Number(e.target.value))}
              className="w-full px-2 py-1 bg-[#F5F2EB] border border-white/10 rounded-lg text-[#E5BA73] font-bold text-center focus:outline-none focus:border-[#E5BA73] focus:ring-1 focus:ring-[#E5BA73] text-xs"
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

        {/* Tampilan Mobile: Kode Produk */}
        <div className="col-span-2 pt-2 mt-1 border-t md:hidden border-white/5">
          <p className="text-[9px] text-[#A3A19E] uppercase tracking-wider mb-0.5">Kode Kain</p>
          <p className="font-bold text-[#F9F6F0]/90 truncate">
            {kodeProduk}
          </p>
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