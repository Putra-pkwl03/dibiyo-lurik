"use client";

import {
  Shirt,
  Info,
  Plus,
  Trash2,
  Sliders,
  Palette,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion"; // 👈 Impor Framer Motion

export default function CustomizerSidebar({
  bgColor,
  setBgColor,
  patternDensity,
  setPatternDensity,
  stripes,
  setStripes,
  onOpenCartModal,
}) {
  const colorPalette = [
    { hex: "#1D2B24", name: "Hijau Botol / Deep Forest" },
    { hex: "#53593B", name: "Hijau Zaitun / Olive Green" },
    { hex: "#8B5A2B", name: "Sogan Earth (Cokelat Sogan)" },
    { hex: "#C49A6C", name: "Warm Gold / Bronze" },
    { hex: "#E5BA73", name: "Golden Khaki (Emas Khaki)" },
    { hex: "#FAF7F2", name: "Linen White (Putih Kain)" },
  ];

  const handleStripeColorChange = (id, newColor) => {
    setStripes(
      stripes.map((s) => (s.id === id ? { ...s, color: newColor } : s)),
    );
  };

  const handleThicknessChange = (id, newThickness) => {
    const parsedValue = parseInt(newThickness, 10);
    setStripes(
      stripes.map((s) =>
        s.id === id
          ? { ...s, thickness: isNaN(parsedValue) ? 1 : parsedValue }
          : s,
      ),
    );
  };

  const addStripe = () => {
    const newId =
      stripes.length > 0 ? Math.max(...stripes.map((s) => s.id)) + 1 : 1;
    setStripes([...stripes, { id: newId, thickness: 8, color: "#E5BA73" }]);
  };

  const removeStripe = (id) => {
    if (stripes.length <= 1) return;
    setStripes(stripes.filter((s) => s.id !== id));
  };

  // 💡 KONFIGURASI ANIMASI DATANG DARI KANAN KAKU
  const rightAnimation = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
    exit: { opacity: 0, x: 30 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={rightAnimation}
      className="w-full lg:w-[38%] bg-[#F5F2EB] border border-[#EBE7E0] flex flex-col justify-between p-4 lg:p-6 rounded-2xl shadow-sm"
    >
      <div className="space-y-6">
        {/* HEADER */}
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold tracking-wide text-[#3E3431]">
            STUDIO LURIK CUSTOM
          </h2>
          <p className="text-sm text-[#706965] font-light mt-1 leading-relaxed">
            Kontrol penenunan tingkat lanjut. Sesuaikan warna dasar kain dan
            konfigurasikan dimensi anyaman tiap helai benang lungsin Anda secara
            presisi.
          </p>
        </div>

        {/* ================= BAGIAN A: KONTROL KAIN UTAMA ================= */}
        <div className="bg-[#ffffff] border border-white/5 rounded-2xl p-4 space-y-4">
          <span className="text-xs font-bold tracking-widest text-[#E5BA73] flex items-center gap-1.5">
            <Sliders size={14} /> KONTROL DENSITY & BASE
          </span>

          <div className="space-y-4">
            <div className="p-3 space-y-3 border bg-black/20 rounded-xl border-white/5">
              <div className="flex items-center justify-between">
                <label className="text-xs text-[#000000] font-medium">
                  Warna Dasar Kanvas
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-black uppercase font-mono">
                    {bgColor}
                  </span>
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-8 h-8 bg-transparent border rounded-lg cursor-pointer border-white/20"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                {colorPalette.map((color, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setBgColor(color.hex)}
                    className={`w-6 h-6 rounded-md border transition-all ${
                      bgColor.toLowerCase() === color.hex.toLowerCase()
                        ? "border-[#E5BA73] scale-110 ring-2 ring-[#E5BA73]/30"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div className="p-3 space-y-2 border bg-black/20 rounded-xl border-white/5">
              <div className="flex justify-between text-xs">
                <span className="text-[#1c1c1c] font-medium">
                  Skala Kerapatan Pola Tenun
                </span>
                <span className="text-[#303030] font-bold">
                  {patternDensity}%
                </span>
              </div>
              <input
                type="range"
                min="30"
                max="250"
                value={patternDensity}
                onChange={(e) =>
                  setPatternDensity(parseInt(e.target.value, 10))
                }
                className="w-full accent-[#ffffff] bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* ================= BAGIAN B: EDIT PER HELAI BENANG (STRIPES) ================= */}
        <div className="bg-[#ffffff] border border-white rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-widest text-[#E5BA73] flex items-center gap-1.5">
              <Palette size={14} /> STRUKTUR BENANG KUSTOM
            </span>

            <button
              type="button"
              onClick={addStripe}
              className="text-[10px] font-bold bg-[#aa9e84] hover:bg-[#E5BA73] text-[#ffffff] hover:text-[#0A1715] px-2.5 py-1 rounded-md transition-all flex items-center gap-1 border border-[#E5BA73]/20"
            >
              <Plus size={10} /> Tambah Garis
            </button>
          </div>

          <div className="max-h-[230px] overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
            {stripes.map((stripe, index) => (
              <div
                key={stripe.id}
                className="flex items-center gap-3 bg-[#cfcfcf] p-2.5 rounded-xl border border-white/5 group transition-all"
              >
                <div className="text-[10px] text-black font-mono w-4">
                  #{index + 1}
                </div>

                <div className="flex items-center shrink-0">
                  <input
                    type="color"
                    value={stripe.color}
                    onChange={(e) =>
                      handleStripeColorChange(stripe.id, e.target.value)
                    }
                    className="bg-transparent border rounded-lg cursor-pointer w-7 h-7 border-white/10"
                    title="Sesuaikan warna RGB benang"
                  />
                </div>

                <div className="flex items-center flex-1 gap-2">
                  <input
                    type="range"
                    min="1"
                    max="40"
                    value={stripe.thickness}
                    onChange={(e) =>
                      handleThicknessChange(stripe.id, e.target.value)
                    }
                    className="w-full h-1 rounded-lg appearance-none cursor-pointer accent-zinc-400 bg-zinc-800"
                  />
                  <span className="text-[10px] font-mono font-bold text-black w-7 text-right">
                    {stripe.thickness}px
                  </span>
                </div>

                {stripes.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => removeStripe(stripe.id)}
                    className="p-1 transition-colors text-red-500 hover:text-red-700"
                    title="Hapus baris benang"
                  >
                    <Trash2 size={12} />
                  </button>
                ) : (
                  <div className="w-5" />
                )}
              </div>
            ))}

            {stripes.length === 0 && (
              <p className="text-[11px] text-zinc-500 text-center py-4">
                Tidak ada benang aktif. Klik tambah benang.
              </p>
            )}
          </div>
        </div>

        {/* TIPS INFO */}
        <div className="bg-[#E5BA73]/5 border border-[#E5BA73]/10 rounded-xl p-4 flex gap-3">
          <Info className="text-[#E5BA73] shrink-0" size={16} />
          <p className="text-xs text-[#A3A19E] leading-relaxed">
            Gunakan kotak warna untuk memilih spektrum warna RGB secara bebas,
            atau sesuaikan ketebalan piksel untuk merancang ritme jalinan lurik
            kreasi Anda sendiri.
          </p>
        </div>
      </div>
      <div className="pt-4 mt-4 border-t border-white/5">
        <button
          type="button"
          onClick={onOpenCartModal}
          className="w-full py-4 bg-gradient-to-r from-[#E5BA73] to-[#cfa35c] text-[#0A1715] hover:from-[#F9F6F0] hover:to-[#F9F6F0] transition-all duration-300 rounded-xl font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-2 shadow-lg shadow-[#E5BA73]/5"
        >
          Masukkan Kain Kustom Ke Keranjang
          <ChevronRight size={14} strokeWidth={2.5} />
        </button>
      </div>
    </motion.div>
  );
}
