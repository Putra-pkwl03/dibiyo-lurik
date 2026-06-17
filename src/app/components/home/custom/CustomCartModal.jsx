"use client";

import React, { useState } from 'react';
import { X, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Fungsi generator gradien lurik tetap dipertahankan
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
  customProperties = { bgColor: '#53593B', patternDensity: 86, stripes: [] } 
}) {
  const [lebar, setLebar] = useState(70);
  const [panjang, setPanjang] = useState(1);
  const [isCrumpling, setIsCrumpling] = useState(false);

  if (!isOpen) return null;

  const { bgColor, patternDensity, stripes } = customProperties;

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

  // Varian animasi crumple and fly dipertahankan
  const modalVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      borderRadius: "16px",
      x: 0,
      y: 0,
      rotate: 0,
      skewX: 0,
      skewY: 0,
      transition: { type: "spring", duration: 0.5 }
    },
    crumpleAndFly: {
      scale: [1, 0.7, 0.4, 0.15, 0],
      borderRadius: ["16px", "24px", "60px", "100px", "100px"],
      skewX: [0, 15, -10, 5, 0],
      skewY: [0, -10, 15, -5, 0],
      rotate: [0, -35, 75, -360, -720], 
      x: [0, 20, -15, 350, 680], 
      y: [0, -10, 30, -160, -380], 
      opacity: [1, 1, 0.9, 0.7, 0],
      transition: {
        duration: 0.9, 
        times: [0, 0.2, 0.5, 0.75, 1],
        ease: [
          [0.36, 0.07, 0.19, 0.97], 
          [0.36, 0.07, 0.19, 0.97],
          [0.42, 0, 0.58, 1],      
          [0.25, 1, 0.5, 1]      
        ]
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (panjang <= 0 || isCrumpling) return;
    
    setIsCrumpling(true);

    setTimeout(() => {
      onConfirm({
        lebar,
        panjang,
        hargaPerMeter,
        totalHarga
      });
      
      window.dispatchEvent(new CustomEvent("updateCartCount", { detail: { itemCount: 1 } }));
      
      setIsCrumpling(false);
      onClose();
    }, 900);
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0D1412]/40 backdrop-blur-sm"
        onClick={() => !isCrumpling && onClose()}
      >
        <motion.div 
          variants={modalVariants}
          initial="hidden"
          animate={isCrumpling ? "crumpleAndFly" : "visible"}
          exit="hidden"
          /* ✨ BACKDROP MODAL: Diubah ke Putih Sutra Bersih dengan border kelabu hangat */
          className="w-full max-w-lg bg-[#FDFCFA] border border-[#EBE7E0] rounded-2xl p-7 relative shadow-2xl text-[#3E3431] font-sans origin-center will-change-transform"
          onClick={(e) => e.stopPropagation()}
        >
          
          {/* Tombol Tutup */}
          <button 
            type="button"
            onClick={onClose}
            disabled={isCrumpling}
            className="absolute top-5 right-5 text-[#706965] hover:text-[#C49A6C] transition-colors disabled:opacity-30"
          >
            <X size={22} />
          </button>

          <div className="mb-6">
            {/* Judul & Ikon menggunakan aksen Cokelat Etnik Gelap */}
            <h3 className="text-xl font-bold text-[#3E3431] tracking-wide flex items-center gap-2">
              <ShoppingBag size={20} className="text-[#C49A6C]" /> Spesifikasi Kain Kustom
            </h3>
            <p className="text-xs text-[#706965] mt-1">
              Tentukan dimensi ukuran kain tenun hasil rancangan Anda.
            </p>
          </div>

          {/* BOX PREVIEW VISUAL: Menggunakan warna background linen lembut (#F5F1E9) */}
          <div className="mb-6 flex items-center gap-5 p-4 bg-[#F5F1E9] rounded-xl border border-[#E2DCD2]">
            <div className="relative flex items-center justify-center w-32 h-32 overflow-hidden border rounded-lg border-[#E2DCD2] bg-white shrink-0 shadow-sm">
              
              {/* Layer 1: Pola Vektor CSS */}
              <div style={miniPatternStyle} className="absolute inset-0 w-full h-full transition-all duration-300" />
              
              {/* Layer 2: Shading Overlay */}
              <img 
                src="/mockups/kain-gantung-mask.png" 
                alt="Tekstur Lipatan" 
                className="absolute inset-0 object-contain w-full h-full pointer-events-none mix-blend-multiply opacity-80" 
              />
              
              {/* Layer 3: Ambient Shadow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.15)_100%)] pointer-events-none" />
            
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-[#3E3431]">Hasil Desain Studio (Live Vektor)</p>
              <p className="text-xs text-[#706965] leading-relaxed">
                Pola anyaman benang Anda ter-render sempurna, siap diproduksi oleh pengrajin menggunakan ATBM (Alat Tenun Bukan Mesin).
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Pilihan Lebar Kain */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-bold tracking-widest text-[#4A3F3B] uppercase block">
                Pilih Lebar Kain
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  disabled={isCrumpling}
                  onClick={() => setLebar(70)}
                  className={`p-3.5 rounded-xl border text-xs font-bold transition-all text-center flex flex-col justify-center items-center gap-1 ${
                    lebar === 70
                      ? 'bg-[#C49A6C]/10 border-[#C49A6C] text-[#B08354] shadow-sm'
                      : 'bg-white border-[#EBE7E0] text-[#706965] hover:border-[#C49A6C]/50'
                  }`}
                >
                  <span className="text-sm text-[#3E3431]">Lebar 70 cm</span>
                  <span className="text-[11px] font-normal text-[#706965]">Rp 500.000 /m</span>
                </button>

                <button
                  type="button"
                  disabled={isCrumpling}
                  onClick={() => setLebar(110)}
                  className={`p-3.5 rounded-xl border text-xs font-bold transition-all text-center flex flex-col justify-center items-center gap-1 ${
                    lebar === 110
                      ? 'bg-[#C49A6C]/10 border-[#C49A6C] text-[#B08354] shadow-sm'
                      : 'bg-white border-[#EBE7E0] text-[#706965] hover:border-[#C49A6C]/50'
                  }`}
                >
                  <span className="text-sm text-[#3E3431]">Lebar 110 cm</span>
                  <span className="text-[11px] font-normal text-[#706965]">Rp 700.000 /m</span>
                </button>
              </div>
            </div>

            {/* Input Panjang Kain */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-bold tracking-widest text-[#4A3F3B] uppercase block">
                Panjang Kain Yang Dibeli (Meter)
              </label>
              <div className="relative flex items-center border bg-white border-[#EBE7E0] rounded-xl focus-within:border-[#C49A6C] transition-all shadow-sm">
                <input
                  type="number"
                  min="0.5"
                  step="0.1"
                  disabled={isCrumpling}
                  value={panjang}
                  onChange={(e) => setPanjang(parseFloat(e.target.value) || 0)}
                  className="w-full bg-transparent px-4 py-3.5 text-sm text-[#3E3431] outline-none font-semibold disabled:opacity-50"
                  required
                />
                <span className="absolute right-4 text-xs font-bold text-[#706965] pointer-events-none">Meter</span>
              </div>
            </div>

            {/* Ringkasan Subtotal */}
            <div className="p-4 space-y-2 text-xs border bg-[#FAF7F2] border-[#EBE7E0] rounded-xl">
              <div className="flex justify-between text-[#706965] text-xs">
                <span>Harga Satuan:</span>
                <span>Rp {hargaPerMeter.toLocaleString('id-ID')} / meter</span>
              </div>
              <div className="flex justify-between font-bold text-[#3E3431] border-t border-[#E2DCD2] pt-2.5 mt-1">
                <span className="text-xs text-[#706965] font-normal">Estimasi Subtotal:</span>
                <span className="text-base font-black text-[#B08354]">Rp {totalHarga.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* Tombol Aksi Utama */}
            <button
              type="submit"
              disabled={isCrumpling || panjang <= 0}
              className="w-full py-4 bg-[#C49A6C] text-white hover:bg-[#A87E53] font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md shadow-[#C49A6C]/10 disabled:bg-[#EBE7E0] disabled:text-[#A3A19E] disabled:cursor-not-allowed disabled:shadow-none"
            >
              {isCrumpling ? "Memasukkan..." : "Masukkan Keranjang"}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}