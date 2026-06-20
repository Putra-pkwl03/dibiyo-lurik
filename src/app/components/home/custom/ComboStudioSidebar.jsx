"use client"

import { useState, useEffect } from 'react' // 🌟 Tambahkan useState & useEffect untuk sinkronisasi warna
import { Shirt, Info, ChevronRight, Plus, Trash2, Sliders, Palette } from 'lucide-react'

export default function ComboStudioSidebar({ 
  combination, 
  onCheckoutCombo,
  bgColor,
  setBgColor,
  patternDensity,
  setPatternDensity,
  stripes,
  setStripes
}) {
  const activeItems = Object.entries(combination).filter(([_, item]) => item !== null);

  // 🌟 STATE LOKAL UNTUK WARNA DASAR (Agar digeser sepuasnya tetap 60fps tanpa lag)
  const [localBgColor, setLocalBgColor] = useState(bgColor);

  // Sinkronisasi jika sewaktu-waktu bgColor diubah dari reset induk
  useEffect(() => {
    setLocalBgColor(bgColor);
  }, [bgColor]);

  // Debounce super tipis khusus untuk input warna dasar kain
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setBgColor(localBgColor);
    }, 40); // 40ms jeda yang tidak kasat mata tapi menyelamatkan performa render canvas
    return () => clearTimeout(timeoutId);
  }, [localBgColor, setBgColor]);

  const availableReferenceColors = stripes.length > 0 ? stripes.map(s => s.color) : ['#E5BA73'];

  const handleThicknessChange = (id, newThickness) => {
    const parsedValue = parseInt(newThickness, 10);
    setStripes(prevStripes => 
      prevStripes.map(s => s.id === id ? { ...s, thickness: isNaN(parsedValue) ? 1 : parsedValue } : s)
    );
  };

  const handleAddStripe = () => {
    if (stripes.length === 0) return;

    const newId = stripes.length > 0 ? Math.max(...stripes.map(s => s.id)) + 1 : 1;
    const lastStripeColor = stripes[stripes.length - 1].color;

    const alternativeColors = availableReferenceColors.filter(color => color !== lastStripeColor);
    const finalPool = alternativeColors.length > 0 ? alternativeColors : availableReferenceColors;

    const randomIndex = Math.floor(Math.random() * finalPool.length);
    const randomReferenceColor = finalPool[randomIndex];

    setStripes([...stripes, { id: newId, thickness: 8, color: randomReferenceColor }]);
  };

  const handleRemoveStripe = (id) => {
    setStripes(stripes.filter(s => s.id !== id));
  };

  return (
    <div className="w-full lg:w-[45%] bg-[#F5F2EB] flex flex-col justify-between p-2 lg:p-6 rounded-2xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold tracking-wide text-[#000000]">
            STUDIO LURIK COMBAIN
          </h2>
          <p className="text-sm text-[#414141] font-light mt-1 leading-relaxed">
            Eksperimen kombinasi struktur pakaian sekaligus modifikasi kerapatan
            benang kain secara langsung (*real-time*).
          </p>
        </div>

        {/* PANEL 2: KONTROL WARNA DASAR & KERAPATAN TENUN */}
        <div className="bg-[#ffffff] border border-white/5 rounded-2xl p-4 space-y-4">
          <span className="text-xs font-bold tracking-widest text-[#E5BA73] flex items-center gap-1.5">
            <Sliders size={14} /> KONTROL DENSITY & BASE
          </span>

          <div className="space-y-4">
            <div className="flex items-center justify-between bg-[#bdb7ac] p-2.5 rounded-xl border border-white/5">
              <label className="text-xs text-[#F9F6F0]/80 font-medium">
                Warna Dasar Kanvas
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-black uppercase font-mono">
                  {localBgColor} 
                </span>
                <input
                  type="color"
                  value={localBgColor} 
                  onChange={(e) => setLocalBgColor(e.target.value)} 
                  className="w-8 h-8 bg-transparent border rounded-lg cursor-pointer border-white/20"
                />
              </div>
            </div>

            <div className="p-3 space-y-2 border bg-[#bdb7ac] rounded-xl border-white/5">
              <div className="flex justify-between text-xs">
                <span className="text-[#F9F6F0]/80 font-medium">
                  Skala Kerapatan Tenun
                </span>
                <span className="text-[#000000] font-bold">
                  {patternDensity}%
                </span>
              </div>
              <input
                type="range"
                min="30"
                max="250"
                value={patternDensity}
                onChange={(e) => setPatternDensity(parseInt(e.target.value, 10))}
                className="w-full accent-[#E5BA73] bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* PANEL 3: EDITOR HELAI BENANG (STRIPES) */}
        <div className="bg-[#ffffff] border border-white/5 rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold tracking-widest text-[#E5BA73] flex items-center gap-1.5">
                <Palette size={14} /> STRUKTUR BENANG EKSTRAKSI
              </span>
              <span className="pl-5 text-xs font-light text-gray-500">
                Hapus benang yg tdak di inginkan
              </span>
            </div>

            <button 
              type="button"
              onClick={handleAddStripe}
              className="text-[10px] font-bold bg-[#aa9e84] hover:bg-[#E5BA73] text-[#ffffff] hover:text-[#0A1715] px-2.5 py-1 rounded-md transition-all flex items-center gap-1 border border-[#E5BA73]/20"
            >
              <Plus size={10} /> Tambah Benang
            </button>
          </div>

          <div className="max-h-[215px] overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
            {stripes.map((stripe, index) => (
              <div key={stripe.id} className="flex items-center gap-3 bg-[#cfcfcf] p-2.5 rounded-xl border border-white/5">
                <div className="text-[10px] text-zinc-500 font-mono w-4">#{index + 1}</div>
                
                <div 
                  className="w-6 h-6 border rounded shadow-sm border-black/10 shrink-0"
                  style={{ backgroundColor: stripe.color }}
                  title={`Warna terekstraksi: ${stripe.color}`}
                />

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

                <button
                  type="button"
                  onClick={() => handleRemoveStripe(stripe.id)}
                  className="p-1 text-red-500 transition-colors hover:text-red-700"
                  title="Hapus baris benang"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}

            {stripes.length === 0 && (
              <p className="text-[11px] text-zinc-500 text-center py-4">
                Tidak ada benang aktif. Klik tambah benang.
              </p>
            )}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-[#E5BA73]/5 border border-[#E5BA73]/10 rounded-xl p-4 flex gap-3">
          <Info className="text-[#E5BA73] shrink-0" size={16} />
          <p className="text-xs text-[#A3A19E] leading-relaxed">
            Geser skala kerapatan untuk memperpadat susunan benang vertikal kain lurik kustom Anda.
          </p>
        </div>
      </div>

      <div className="pt-4 mt-4 border-t border-white/5">
        <button
          type="button"
          onClick={onCheckoutCombo}
          disabled={activeItems.length === 0}
          className="w-full py-4 bg-gradient-to-r from-[#E5BA73] to-[#cfa35c] text-[#0A1715] hover:from-[#F9F6F0] hover:to-[#F9F6F0] disabled:from-zinc-800 disabled:to-zinc-900 disabled:text-zinc-500 disabled:cursor-not-allowed transition-all duration-300 rounded-xl font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-2 shadow-lg"
        >
          {activeItems.length === 0
            ? "LAKUKAN PENGEDITAN "
            : "Masukkan Kain Kustom Ke Keranjang"}
          <ChevronRight size={14} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}