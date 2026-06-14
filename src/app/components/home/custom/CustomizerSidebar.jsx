// src/app/customizer/components/CustomizerSidebar.jsx
"use client"

export default function CustomizerSidebar({
  bgColor, setBgColor,                
  patternDensity, setPatternDensity,
  stripes, setStripes                 
}) {

  const colorPalette = [
    { hex: '#2B4C7E', name: 'Deep Indigo (Nila Tua)' },
    { hex: '#8B5A2B', name: 'Sogan Earth (Cokelat Sogan)' },
    { hex: '#E5BA73', name: 'Golden Khaki (Emas Khaki)' },
    { hex: '#F9F6F0', name: 'Off White (Putih Tulang)' },
    { hex: '#1A2926', name: 'Teal Shadow (Hijau Gelap)' },
    { hex: '#12110F', name: 'Deep Charcoal (Arang Hitam)' }
  ];

  // Handler mengubah ketebalan spesifik satu garis berdasarkan ID-nya
  const updateStripeThickness = (id, newThickness) => {
    setStripes(stripes.map(s => s.id === id ? { ...s, thickness: Number(newThickness) } : s));
  };

  // Handler mengubah warna spesifik satu garis berdasarkan ID-nya
  const updateStripeColor = (id, newColor) => {
    setStripes(stripes.map(s => s.id === id ? { ...s, color: newColor } : s));
  };

  // Tambah baris benang baru ke dalam susunan kain
  const addStripe = () => {
    const newId = stripes.length > 0 ? Math.max(...stripes.map(s => s.id)) + 1 : 1;
    setStripes([...stripes, { id: newId, thickness: 3, color: '#E5BA73' }]);
  };

  // Hapus baris benang dari susunan kain
  const removeStripe = (id) => {
    if (stripes.length <= 1) return; 
    setStripes(stripes.filter(s => s.id !== id));
  };

  return (
    <div className="w-full lg:w-[45%] bg-[#0A1715] flex flex-col justify-between p-2 lg:p-6 overflow-y-auto lg:h-[780px] custom-scrollbar">
      
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold tracking-wide text-[#E5BA73]">
            Kustomisasi Studio Lurik v2
          </h2>
          <p className="text-sm text-[#A3A19E] font-light mt-1 leading-relaxed">
            Kontrol penenunan tingkat lanjut. Sesuaikan warna dasar kain dan konfigurasikan dimensi anyaman tiap helai benang lungsin Anda secara presisi.
          </p>
        </div>

        {/* ================= BAGIAN A: KONTROL KAIN UTAMA ================= */}
        <div className="bg-[#12110F] border border-white/5 rounded-2xl p-4 space-y-4">
          
          {/* 1. EDIT WARNA BACKGROUND */}
          <div className="space-y-2">
            <span className="text-xs font-bold tracking-widest text-[#E5BA73] block">WARNA DASAR KAIN (LATAR BELAKANG)</span>
            <div className="flex flex-wrap gap-2">
              {colorPalette.map((color, index) => (
                <button
                  key={index}
                  onClick={() => setBgColor(color.hex)}
                  className={`w-7 h-7 rounded-lg border transition-all ${
                    bgColor === color.hex ? 'border-[#E5BA73] scale-110 ring-2 ring-[#E5BA73]/30' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* 2. UKURAN REPEAT KAIN (ZOOOMING / KERAPATAN) */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs font-bold text-[#A3A19E]">
              <span>SKALA KERAPATAN POLA TENUN</span>
              <span className="text-[#E5BA73]">{patternDensity}%</span>
            </div>
            <input 
              type="range" min="30" max="250" 
              value={patternDensity}
              onChange={(e) => setPatternDensity(Number(e.target.value))}
              className="w-full accent-[#E5BA73] h-1 bg-white/10 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* ================= BAGIAN B: EDIT PER GARIS INDIVIDUAL ================= */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-widest text-[#E5BA73]">PENGATURAN HELAI BENANG</span>
            <button 
              onClick={addStripe}
              className="text-[10px] bg-[#E5BA73]/10 hover:bg-[#E5BA73] text-[#E5BA73] hover:text-[#0A1715] px-2.5 py-1 rounded-md font-bold transition-all border border-[#E5BA73]/20"
            >
              + Tambah Garis
            </button>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {stripes.map((stripe, idx) => (
              <div key={stripe.id} className="bg-[#12110F] border border-white/5 rounded-xl p-3.5 space-y-3 relative group">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#A3A19E]">BENANG GARIS SILANG #{idx + 1}</span>
                  {stripes.length > 1 && (
                    <button 
                      onClick={() => removeStripe(stripe.id)}
                      className="text-[10px] text-red-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Hapus
                    </button>
                  )}
                </div>

                {/* Kontrol Ketebalan Garis Tertentu */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between text-[10px] text-[#A3A19E]/70 font-semibold">
                      <span>Ketebalan Benang</span>
                      <span>{stripe.thickness}px</span>
                    </div>
                    <input 
                      type="range" min="1" max="30" 
                      value={stripe.thickness}
                      onChange={(e) => updateStripeThickness(stripe.id, e.target.value)}
                      className="w-full accent-[#E5BA73] h-1 bg-white/5 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Kontrol Warna Garis Tertentu */}
                  <div className="flex flex-col items-center space-y-1">
                    <span className="text-[9px] text-[#A3A19E]/70 font-semibold">Warna</span>
                    <div className="flex gap-1 p-1 border rounded-lg bg-black/40 border-white/5">
                      {colorPalette.slice(0, 4).map((paletteColor, pIdx) => (
                        <button
                          key={pIdx}
                          onClick={() => updateStripeColor(stripe.id, paletteColor.hex)}
                          className={`w-4 h-4 rounded-full transition-transform ${
                            stripe.color === paletteColor.hex ? 'scale-125 ring-1 ring-white' : 'opacity-50 hover:opacity-100'
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

      {/* Section Bawah: CTA */}
      <div className="pt-4 mt-4 border-t border-white/5">
        <button className="w-full py-4 bg-[#E5BA73] text-[#0A1715] hover:bg-[#F9F6F0] transition-all duration-300 rounded-xl font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-2 shadow-lg shadow-[#E5BA73]/5">
          Masukkan Kain Kustom Ke Keranjang
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>

    </div>
  )
}