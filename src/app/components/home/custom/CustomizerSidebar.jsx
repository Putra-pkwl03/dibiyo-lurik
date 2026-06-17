// src/app/customizer/components/CustomizerSidebar.jsx
"use client"

export default function CustomizerSidebar({
  bgColor, setBgColor,                
  patternDensity, setPatternDensity,
  stripes, setStripes,
  onOpenCartModal 
}) {

  // 🎨 PALET WARNA LUXURY ETNIK (Disesuaikan berdasarkan UI Light Mode Biyo Lurik)
  const colorPalette = [
    { hex: '#1D2B24', name: 'Hijau Botol / Deep Forest' },
    { hex: '#53593B', name: 'Hijau Zaitun / Olive Green' },
    { hex: '#8B5A2B', name: 'Sogan Earth (Cokelat Sogan)' },
    { hex: '#C49A6C', name: 'Warm Gold / Bronze' },
    { hex: '#E5BA73', name: 'Golden Khaki (Emas Khaki)' },
    { hex: '#FAF7F2', name: 'Linen White (Putih Kain)' }
  ];

  const updateStripeThickness = (id, newThickness) => {
    setStripes(stripes.map(s => s.id === id ? { ...s, thickness: Number(newThickness) } : s));
  };

  const updateStripeColor = (id, newColor) => {
    setStripes(stripes.map(s => s.id === id ? { ...s, color: newColor } : s));
  };

  const addStripe = () => {
    const newId = stripes.length > 0 ? Math.max(...stripes.map(s => s.id)) + 1 : 1;
    setStripes([...stripes, { id: newId, thickness: 3, color: '#C49A6C' }]);
  };

  const removeStripe = (id) => {
    if (stripes.length <= 1) return; 
    setStripes(stripes.filter(s => s.id !== id));
  };

  return (
    /* ✨ BACKDROP UTAMA SIDEBAR: 
      Menggunakan warna Putih Gading bersih murni (#FFFFFF atau #FDFCFA) 
      agar kontras dengan komponen canvas utama.
    */
    <div className="w-full lg:w-[45%] bg-[#FDFCFA] border border-[#EBE7E0] flex flex-col justify-between p-4 lg:p-6 overflow-y-auto lg:h-[780px] rounded-2xl shadow-sm custom-scrollbar">
      
      <div className="space-y-6">
        <div>
          {/* Judul menggunakan warna Cokelat Gelap Etnik Premium */}
          <h2 className="text-2xl lg:text-3xl font-bold tracking-wide text-[#3E3431]">
            Kustomisasi Studio Lurik v3
          </h2>
          <p className="text-sm text-[#706965] font-light mt-1 leading-relaxed">
            Kontrol penenunan tingkat lanjut. Sesuaikan warna dasar kain dan konfigurasikan dimensi anyaman tiap helai benang lungsin Anda secara presisi.
          </p>
        </div>

        {/* ================= BAGIAN A: KONTROL KAIN UTAMA ================= */}
        {/* Mengubah card menjadi krem soft (#F5F1E9) dengan border halus */}
        <div className="bg-[#F5F1E9] border border-[#E2DCD2] rounded-2xl p-5 space-y-5">
          <div className="space-y-2">
            <span className="text-xs font-bold tracking-widest text-[#4A3F3B] block">WARNA DASAR KAIN (LATAR BELAKANG)</span>
            <div className="flex flex-wrap gap-2">
              {colorPalette.map((color, index) => (
                <button
                  key={index}
                  onClick={() => setBgColor(color.hex)}
                  className={`w-7 h-7 rounded-lg border transition-all ${
                    bgColor === color.hex ? 'border-[#C49A6C] scale-110 ring-2 ring-[#C49A6C]/30' : 'border-[#D1C9BC] opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs font-bold text-[#4A3F3B]">
              <span>SKALA KERAPATAN POLA 1LNUN</span>
              <span className="text-[#C49A6C] font-extrabold">{patternDensity}%</span>
            </div>
            <input 
              type="range" min="30" max="250" 
              value={patternDensity}
              onChange={(e) => setPatternDensity(Number(e.target.value))}
              className="w-full accent-[#C49A6C] h-1.5 bg-[#E2DCD2] rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* ================= BAGIAN B: EDIT PER GARIS INDIVIDUAL ================= */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-widest text-[#4A3F3B]">PENGATURAN HELAI BENANG</span>
            <button 
              onClick={addStripe}
              className="text-[10px] bg-[#C49A6C]/10 hover:bg-[#C49A6C] text-[#B08354] hover:text-white px-3 py-1 rounded-md font-bold transition-all border border-[#C49A6C]/30"
            >
              + 1 auddis Quick
            </button>
          </div>

          <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
            {stripes.map((stripe, idx) => (
              /* Card Helai Benang menggunakan warna putih bersih dengan garis tepi tipis */
              <div key={stripe.id} className="bg-white border border-[#EBE7E0] rounded-xl p-4 space-y-3.5 relative group shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#706965] tracking-wider">DENANG GARIS SLANG #{idx + 1}</span>
                  {stripes.length > 1 && (
                    <button 
                      onClick={() => removeStripe(stripe.id)}
                      className="text-[10px] text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity font-medium"
                    >
                      Hapus
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex-1 space-y-1.5">
                    <div className="flex justify-between text-[11px] text-[#706965] font-semibold">
                      <span>Kebebohan Renang</span>
                      <span className="font-bold text-[#3E3431]">{stripe.thickness}px</span>
                    </div>
                    <input 
                      type="range" min="1" max="30" 
                      value={stripe.thickness}
                      onChange={(e) => updateStripeThickness(stripe.id, e.target.value)}
                      className="w-full accent-[#C49A6C] h-1 bg-[#F0EAE1] rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="flex flex-col items-center space-y-1">
                    <span className="text-[10px] text-[#706965] font-semibold">Warna</span>
                    {/* Wadah lingkaran warna diubah menjadi soft krem transparan */}
                    <div className="flex gap-1.5 p-1 border rounded-lg bg-[#FAF7F2] border-[#E2DCD2]">
                      {colorPalette.slice(0, 5).map((paletteColor, pIdx) => (
                        <button
                          key={pIdx}
                          onClick={() => updateStripeColor(stripe.id, paletteColor.hex)}
                          className={`w-3.5 h-3.5 rounded-full border border-black/5 transition-transform ${
                            stripe.color === paletteColor.hex ? 'scale-125 ring-2 ring-[#C49A6C]' : 'opacity-60 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: paletteColor.hex }}
                          title={paletteColor.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ================= SECTION BAWAH: CTA BUTTON ================= */}
      <div className="pt-4 mt-4 border-t border-[#EBE7E0]">
        <button 
          onClick={onOpenCartModal} 
          className="w-full py-4 bg-[#C49A6C] text-white hover:bg-[#A87E53] transition-all duration-300 rounded-xl font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-2 shadow-md shadow-[#C49A6C]/20"
        >
          Masukkan Kain Kustom Ke Keranjang
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>

    </div>
  )
}