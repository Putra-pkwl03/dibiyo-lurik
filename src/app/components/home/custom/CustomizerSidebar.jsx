"use client"

import { Shirt, Info, Plus, Trash2, Sliders, Palette, ChevronRight } from 'lucide-react'

export default function CustomizerSidebar({
  bgColor, 
  setBgColor,                 
  patternDensity, 
  setPatternDensity,
  stripes, 
  setStripes,
  onOpenCartModal 
}) {

  // Palet Warna Referensi untuk jalan pintas (Shortcut Click)
  const colorPalette = [
    { hex: '#2B4C7E', name: 'Deep Indigo (Nila Tua)' },
    { hex: '#8B5A2B', name: 'Sogan Earth (Cokelat Sogan)' },
    { hex: '#E5BA73', name: 'Golden Khaki (Emas Khaki)' },
    { hex: '#F9F6F0', name: 'Off White (Putih Tulang)' },
    { hex: '#1A2926', name: 'Teal Shadow (Hijau Gelap)' },
    { hex: '#12110F', name: 'Deep Charcoal (Arang Hitam)' }
  ];

  const handleStripeColorChange = (id, newColor) => {
    setStripes(stripes.map(s => s.id === id ? { ...s, color: newColor } : s));
  };

  const handleThicknessChange = (id, newThickness) => {
    const parsedValue = parseInt(newThickness, 10);
    setStripes(stripes.map(s => s.id === id ? { ...s, thickness: isNaN(parsedValue) ? 1 : parsedValue } : s));
  };

  const addStripe = () => {
    const newId = stripes.length > 0 ? Math.max(...stripes.map(s => s.id)) + 1 : 1;
    setStripes([...stripes, { id: newId, thickness: 8, color: '#E5BA73' }]);
  };

  const removeStripe = (id) => {
    if (stripes.length <= 1) return; 
    setStripes(stripes.filter(s => s.id !== id));
  };

  return (
    <div className="w-full lg:w-[45%] bg-[#0A1715] flex flex-col justify-between p-2 lg:p-6 lg:h-[750px] overflow-y-auto custom-scrollbar">
      
      <div className="space-y-6">
        {/* HEADER */}
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold tracking-wide text-[#E5BA73]">
            Studio Lurik Customizer
          </h2>
          <p className="text-sm text-[#A3A19E] font-light mt-1 leading-relaxed">
            Kontrol penenunan tingkat lanjut. Sesuaikan warna dasar kain dan konfigurasikan dimensi anyaman tiap helai benang lungsin Anda secara presisi.
          </p>
        </div>

        {/* ================= BAGIAN A: KONTROL KAIN UTAMA ================= */}
        <div className="bg-[#12110F] border border-white/5 rounded-2xl p-4 space-y-4">
          <span className="text-xs font-bold tracking-widest text-[#E5BA73] flex items-center gap-1.5">
            <Sliders size={14} /> KONTROL DENSITY & BASE
          </span>

          <div className="space-y-4">
            {/* Input Warna Dasar dengan Custom Picker & Quick Palette */}
            <div className="p-3 space-y-3 border bg-black/20 rounded-xl border-white/5">
              <div className="flex items-center justify-between">
                <label className="text-xs text-[#F9F6F0]/80 font-medium">Warna Dasar Kanvas</label>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-zinc-400 uppercase font-mono">{bgColor}</span>
                  <input 
                    type="color" 
                    value={bgColor} 
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-8 h-8 bg-transparent border rounded-lg cursor-pointer border-white/20"
                  />
                </div>
              </div>
              
              {/* Shortcut Pilihan Palet */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                {colorPalette.map((color, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setBgColor(color.hex)}
                    className={`w-6 h-6 rounded-md border transition-all ${
                      bgColor.toLowerCase() === color.hex.toLowerCase() 
                        ? 'border-[#E5BA73] scale-110 ring-2 ring-[#E5BA73]/30' 
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Skala Kerapatan */}
            <div className="p-3 space-y-2 border bg-black/20 rounded-xl border-white/5">
              <div className="flex justify-between text-xs">
                <span className="text-[#F9F6F0]/80 font-medium">Skala Kerapatan Pola Tenun</span>
                <span className="text-[#E5BA73] font-bold">{patternDensity}%</span>
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

        {/* ================= BAGIAN B: EDIT PER HELAI BENANG (STRIPES) ================= */}
        <div className="bg-[#12110F] border border-white/5 rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-widest text-[#E5BA73] flex items-center gap-1.5">
              <Palette size={14} /> STRUKTUR BENANG KUSTOM
            </span>
            <button 
              type="button"
              onClick={addStripe}
              className="text-[10px] font-bold bg-[#E5BA73]/10 hover:bg-[#E5BA73] text-[#E5BA73] hover:text-[#0A1715] px-2.5 py-1 rounded-md transition-all flex items-center gap-1 border border-[#E5BA73]/20"
            >
              <Plus size={10} /> Tambah Garis
            </button>
          </div>

          {/* List Helai Benang dibuat Horizontal melintang agar hemat ruang dan presisi */}
          <div className="max-h-[250px] overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
            {stripes.map((stripe, index) => (
              <div key={stripe.id} className="flex items-center gap-3 bg-black/40 p-2.5 rounded-xl border border-white/5 group transition-all">
                <div className="text-[10px] text-zinc-500 font-mono w-4">#{index + 1}</div>
                
                {/* Custom Color Picker RGB bebas untuk masing-masing benang */}
                <div className="flex items-center shrink-0">
                  <input 
                    type="color" 
                    value={stripe.color} 
                    onChange={(e) => handleStripeColorChange(stripe.id, e.target.value)}
                    className="bg-transparent border rounded-lg cursor-pointer w-7 h-7 border-white/10"
                    title="Sesuaikan warna RGB benang"
                  />
                </div>

                {/* Slider Ketebalan Benang */}
                <div className="flex items-center flex-1 gap-2">
                  <input 
                    type="range" 
                    min="1" 
                    max="40" 
                    value={stripe.thickness} 
                    onChange={(e) => handleThicknessChange(stripe.id, e.target.value)}
                    className="w-full h-1 rounded-lg appearance-none cursor-pointer accent-zinc-400 bg-zinc-800"
                  />
                  <span className="text-[10px] font-mono font-bold text-zinc-400 w-7 text-right">{stripe.thickness}px</span>
                </div>

                {/* Tombol Hapus Terkondisi */}
                {stripes.length > 1 ? (
                  <button 
                    type="button"
                    onClick={() => removeStripe(stripe.id)}
                    className="p-1 transition-colors text-zinc-500 hover:text-red-400"
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
              <p className="text-[11px] text-zinc-500 text-center py-4">Tidak ada benang aktif. Klik tambah benang.</p>
            )}
          </div>
        </div>

        {/* TIPS INFO */}
        <div className="bg-[#E5BA73]/5 border border-[#E5BA73]/10 rounded-xl p-4 flex gap-3">
          <Info className="text-[#E5BA73] shrink-0" size={16} />
          <p className="text-xs text-[#A3A19E] leading-relaxed">
            Gunakan kotak warna untuk memilih spektrum warna RGB secara bebas, atau sesuaikan ketebalan piksel untuk merancang ritme jalinan lurik kreasi Anda sendiri.
          </p>
        </div>
      </div>

      {/* FOOTER ACTION BUTTON */}
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

    </div>
  )
}