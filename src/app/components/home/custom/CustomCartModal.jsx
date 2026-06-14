"use client";

import React, { useState } from 'react';
import { X, ShoppingBag } from 'lucide-react';

// Taruh fungsi generator di luar komponen agar rapi
const generateLurikGradient = (stripes) => {
  let gradientString = '';
  let currentOffset = 0;

  stripes.forEach((stripe) => {
    const startPoint = currentOffset;
    const endPoint = currentOffset + stripe.thickness;
    gradientString += `${stripe.color} ${startPoint}px, ${stripe.color} ${endPoint}px, `;
    gradientString += `transparent ${endPoint}px, transparent ${endPoint + 2}px, `;
    currentOffset = endPoint + 2; 
  });

  return {
    gradient: gradientString ? `linear-gradient(90deg, ${gradientString.slice(0, -2)})` : 'none',
    totalWidth: currentOffset
  };
};

export default function CustomCartModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  customProperties = { bgColor: '#132237', patternDensity: 80, stripes: [] } 
}) {
  const [lebar, setLebar] = useState(70);
  const [panjang, setPanjang] = useState(1);

  if (!isOpen) return null;

  const { bgColor, patternDensity, stripes } = customProperties;

  // Hitung gradient CSS murni secara real-time di dalam modal
  const { gradient, totalWidth } = generateLurikGradient(stripes);
  const ukuranKerapatanDinamis = (totalWidth * (patternDensity / 100)) || 20;

  const miniPatternStyle = {
    backgroundColor: bgColor, 
    backgroundImage: gradient,
    backgroundSize: `${ukuranKerapatanDinamis}px 100%`,
    maskImage: "url('/mockups/kain-gantung-mask.png')",
    WebkitMaskImage: "url('/mockups/kain-gantung-mask.png')",
    maskSize: 'contain',
    WebkitMaskSize: 'contain',
    maskRepeat: 'no-repeat',
    maskPosition: 'center',
  };

  const hargaPerMeter = lebar === 70 ? 500000 : 700000;
  const totalHarga = panjang * hargaPerMeter;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (panjang <= 0) return;
    
    onConfirm({
      lebar,
      panjang,
      hargaPerMeter,
      totalHarga
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      {/* 🔥 PERUBAHAN UKURAN: Mengubah max-w-md menjadi max-w-lg (bisa diganti max-w-xl jika dirasa kurang besar)
        Serta menambah padding internal container menjadi p-7 untuk ruang tata letak yang lebih lega.
      */}
      <div className="w-full max-w-lg bg-[#12110F] border border-[#E5BA73]/20 rounded-2xl p-7 relative shadow-2xl text-[#F9F6F0] font-sans">
        
        {/* Tombol Tutup */}
        <button 
          onClick={onClose}
          className="absolute top-5 'right-5' text-[#A3A19E] hover:text-[#E5BA73] transition-colors"
        >
          <X size={22} />
        </button>

        <div className="mb-6">
          <h3 className="text-xl font-bold text-[#E5BA73] tracking-wide flex items-center gap-2">
            <ShoppingBag size={20} /> Spesifikasi Kain Kustom
          </h3>
          <p className="text-xs text-[#A3A19E] mt-1">
            Tentukan dimensi ukuran kain tenun hasil rancangan Anda.
          </p>
        </div>

        {/* REPLIKA VISUAL CSS MURNI DENGAN EMULASI LIPATAN REALISTIS */}
        <div className="mb-6 flex items-center gap-5 p-4 bg-[#0A1715] rounded-xl border border-white/5">
          {/* 🔥 PERUBAHAN UTAMA: Ukuran preview kotak kain dinaikkan menjadi w-32 h-32 
            agar visualisasi anyaman bergelombangnya terlihat jauh lebih jelas & eksklusif.
          */}
          <div className="relative flex items-center justify-center w-32 h-32 overflow-hidden border rounded-lg border-white/5 bg-black/20 shrink-0">
            
            {/* Layer 1: Pola Vektor CSS yang dipotong (masked) sesuai lekukan kain */}
            <div style={miniPatternStyle} className="absolute inset-0 w-full h-full transition-all duration-300" />
            
            {/* Layer 2: Gambar cetakan bayangan (shading overlay) untuk memberikan efek 3D lipatan */}
            <img 
              src="/mockups/kain-gantung-mask.png" 
              alt="Tekstur Lipatan" 
              className="absolute inset-0 object-contain w-full h-full pointer-events-none mix-blend-multiply opacity-90" 
            />
            
            {/* Layer 3: Ambient Shadow tambahan */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.3)_100%)] pointer-events-none" />
          
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-[#E5BA73]">Hasil Desain Studio (Live Vektor)</p>
            <p className="text-xs text-[#A3A19E] leading-relaxed">
              Pola anyaman benang Anda ter-render sempurna, siap diproduksi oleh pengrajin menggunakan ATBM (Alat Tenun Bukan Mesin).
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Pilihan Lebar Kain */}
          <div className="space-y-2.5">
            <label className="text-[10px] font-bold tracking-widest text-[#E5BA73] uppercase block">
              Pilih Lebar Kain
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setLebar(70)}
                className={`p-3.5 rounded-xl border text-xs font-bold transition-all text-center flex flex-col justify-center items-center gap-1 ${
                  lebar === 70
                    ? 'bg-[#E5BA73]/10 border-[#E5BA73] text-[#E5BA73]'
                    : 'bg-black/20 border-white/5 text-[#A3A19E] hover:border-white/10'
                }`}
              >
                <span className="text-sm">Lebar 70 cm</span>
                <span className="text-[11px] font-normal text-[#A3A19E]">Rp 500.000 /m</span>
              </button>

              <button
                type="button"
                onClick={() => setLebar(110)}
                className={`p-3.5 rounded-xl border text-xs font-bold transition-all text-center flex flex-col justify-center items-center gap-1 ${
                  lebar === 110
                    ? 'bg-[#E5BA73]/10 border-[#E5BA73] text-[#E5BA73]'
                    : 'bg-black/20 border-white/5 text-[#A3A19E] hover:border-white/10'
                }`}
              >
                <span className="text-sm">Lebar 110 cm</span>
                <span className="text-[11px] font-normal text-[#A3A19E]">Rp 700.000 /m</span>
              </button>
            </div>
          </div>

          {/* Input Panjang Kain */}
          <div className="space-y-2.5">
            <label className="text-[10px] font-bold tracking-widest text-[#E5BA73] uppercase block">
              Panjang Kain Yang Dibeli (Meter)
            </label>
            <div className="relative flex items-center border bg-black/30 border-white/5 rounded-xl">
              <input
                type="number"
                min="0.5"
                step="0.1"
                value={panjang}
                onChange={(e) => setPanjang(parseFloat(e.target.value) || 0)}
                className="w-full bg-transparent px-4 py-3.5 text-sm text-[#F9F6F0] outline-none font-semibold"
                required
              />
              <span className="absolute right-4 text-xs font-bold text-[#A3A19E] pointer-events-none">Meter</span>
            </div>
          </div>

          {/* Ringkasan Subtotal */}
          <div className="p-4 space-y-2 text-xs border bg-black/40 border-white/5 rounded-xl">
            <div className="flex justify-between text-[#A3A19E] text-xs">
              <span>Harga Satuan:</span>
              <span>Rp {hargaPerMeter.toLocaleString('id-ID')} / meter</span>
            </div>
            <div className="flex justify-between font-bold text-[#E5BA73] border-t border-white/5 pt-2.5 mt-1">
              <span className="text-xs">Estimasi Subtotal:</span>
              <span className="text-base font-black">Rp {totalHarga.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-[#E5BA73] text-[#0A1715] hover:bg-[#F9F6F0] font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg"
          >
             Masukkan Keranjang
          </button>
        </form>
      </div>
    </div>
  );
}