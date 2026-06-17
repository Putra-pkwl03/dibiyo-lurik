"use client"

import { useState, useEffect } from 'react' 
import { useSearchParams } from 'next/navigation' 
import Link from 'next/link' 
import CustomizerCanvas from '../components/home/custom/CustomizerCanvas' 
import CustomizerSidebar from '../components/home/custom/CustomizerSidebar'
import ComboStudioSidebar from '../components/home/custom/ComboStudioSidebar' 
import CustomCartModal from '../components/home/custom/CustomCartModal'
import ComboStudioCanvas from '../components/home/custom/ComboStudioCanvas'

import { useCart } from '../context/CartContext' 
import { useComboStore } from '@/app/store/useComboStore'
import { X, Wand2, Layers, Plus } from 'lucide-react'
import Swal from 'sweetalert2'

export default function CustomizerPage() {
  const { addToCart } = useCart(); 
  const { combination, clearSlot } = useComboStore();
  
  const searchParams = useSearchParams();
  const [studioMode, setStudioMode] = useState('custom')

  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'combo') {
      setStudioMode('combo');
    }
  }, [searchParams]); 

  const [previewMode, setPreviewMode] = useState('fabric')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const DEFAULT_BG_COLOR = '#53593B' 
  const DEFAULT_DENSITY = 86        
  const DEFAULT_STRIPES = [
    { id: 1, thickness: 4, color: '#E5BA73' }, 
    { id: 2, thickness: 2, color: '#4A3429' }, 
    { id: 3, thickness: 6, color: '#2C3E50' }, 
  ]

  // ==========================================
  // 1. STATE KHUSUS UNTUK MODE CUSTOM
  // ==========================================
  const [customBgColor, setCustomBgColor] = useState(DEFAULT_BG_COLOR)
  const [customPatternDensity, setCustomPatternDensity] = useState(DEFAULT_DENSITY)
  const [customStripes, setCustomStripes] = useState(DEFAULT_STRIPES)

  // ==========================================
  // 2. STATE KHUSUS UNTUK MODE COMBO (PADU PADAN)
  // ==========================================
  const [comboBgColor, setComboBgColor] = useState(DEFAULT_BG_COLOR)
  const [comboPatternDensity, setComboPatternDensity] = useState(DEFAULT_DENSITY)
  const [comboStripes, setComboStripes] = useState(DEFAULT_STRIPES)

  // Menentukan state mana yang aktif & dikirim ke sidebar berdasarkan studioMode
  const activeBgColor = studioMode === 'custom' ? customBgColor : comboBgColor;
  const activePatternDensity = studioMode === 'custom' ? customPatternDensity : comboPatternDensity;
  const activeStripes = studioMode === 'custom' ? customStripes : comboStripes;

  const setActiveBgColor = studioMode === 'custom' ? setCustomBgColor : setComboBgColor;
  const setActivePatternDensity = studioMode === 'custom' ? setCustomPatternDensity : setComboPatternDensity;
  const setActiveStripes = studioMode === 'custom' ? setCustomStripes : setComboStripes;

  // Definisikan struktur slot statis (selalu berurutan: Badan, Lengan, Aksen)
  const slotsConfig = [
    { key: 'badan', label: 'Gambar 1 (Badan)' },
    { key: 'lengan', label: 'Gambar 2 (Lengan)' },
    { key: 'aksen', label: 'Gambar 3 (Aksen)' },
  ];

  const referenceItems = Object.entries(combination)
    .filter(([_, item]) => item !== null)
    .map(([slot, item]) => ({ slot, ...item }));

  // LOGIKA RESET YANG DIPERBAIKI
  const handleResetAll = () => {
    if (studioMode === 'custom') {
      setCustomBgColor(DEFAULT_BG_COLOR)
      setCustomPatternDensity(DEFAULT_DENSITY)
      setCustomStripes(DEFAULT_STRIPES)
      setPreviewMode('fabric') 
    } else {
      setComboBgColor(DEFAULT_BG_COLOR)
      setComboPatternDensity(DEFAULT_DENSITY)
      setComboStripes(DEFAULT_STRIPES)
    }
  }

  const handleAddToCartConfirm = (specs) => {
    setIsModalOpen(false);
    const productData = {
      kode_produk: studioMode === 'combo' ? "Lurik Hasil Padu Padan" : "Lurik Desain Kustom",
      gambar_url: '/placeholder-kain.jpg',
      isCustom: true 
    };
    
    const gulunganData = {
      id: `CUSTOM-${Date.now()}`,
      nomor_gulungan: studioMode === 'combo' ? "COMBO-STUDIO" : "CUSTOM",
      lebar: specs.lebar,
      panjang_sisa: 999, 
      harga_per_meter: specs.hargaPerMeter,
      harga: specs.hargaPerMeter,
      configurasi: { 
        bgColor: activeBgColor, 
        patternDensity: activePatternDensity, 
        stripes: activeStripes 
      }
    };
    
    const qty = specs.panjang; 
    if (addToCart) addToCart(productData, gulunganData, qty);
  }

  return (
    <main className="min-h-screen bg-[#ffffff] text-[#000000] pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      
      {/* FITUR PEMILIH MODE STUDIO STUDIO v2 */}
      <div className="flex justify-center mx-auto mb-8 max-w-7xl">
        <div className="bg-[#dcbb85] border border-white/5 rounded-xl p-1.5 flex gap-2">
          <button
            onClick={() => setStudioMode('custom')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              studioMode === 'custom' 
                ? 'bg-[#F5F2EB] text-[#0A1715] shadow-lg shadow-[#E5BA73]/10' 
                : 'text-[#ffffff] hover:text-[#000000]'
            }`}
          >
            <Wand2 size={13} />
            STUDIO LURIK CUSTOM
          </button>
          
          <button
            onClick={() => setStudioMode('combo')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              studioMode === 'combo' 
                ? 'bg-[#F5F2EB] text-[#0A1715] shadow-lg shadow-[#E5BA73]/10' 
                : 'text-[#ffffff] hover:text-[#000000]'
            }`}
          >
            <Layers size={13} />
             STUDIO LURIK COMBAIN ({referenceItems.length})
          </button>
        </div>

      </div>

      {/* Rincian Kain Referensi Pasangan Padu Padan dengan Slot Tetap Berjumlah 3 */}
      {studioMode === 'combo' && (
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
            <div className="flex flex-wrap items-center justify-center gap-4">
              
              {slotsConfig.map((slotInfo, index) => {
                const item = combination[slotInfo.key];

                if (item) {
                  return (
                    <div 
                      key={slotInfo.key} 
                      className="flex flex-col items-center gap-2 bg-[#d5caa8] border border-white/10 rounded-xl p-2.5 relative min-w-[120px]"
                    >
                      <button 
                        type="button" 
                        onClick={() => clearSlot(slotInfo.key)} 
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/40 text-zinc-400 hover:text-red-400 transition-colors z-10"
                      >
                        <X size={12} />
                      </button>

                      <div className="w-24 h-24 rounded-md overflow-hidden border border-[#E5BA73]/30 shrink-0">
                        <img src={item.gambar_url} alt={slotInfo.key} className="object-cover w-full h-full" />
                      </div>
                      
                      <div className="flex flex-col items-center mt-1 text-center">
                        <span className="text-[9px] font-extrabold uppercase tracking-wide text-[#ffffff]">
                          Gambar {index + 1}
                        </span>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <Link
                      href="/produk"
                      key={slotInfo.key}
                      className="flex flex-col items-center justify-center gap-2 bg-[#bdb7ac] hover:bg-[#12110F]/60 border border-dashed border-white/10 hover:border-[#E5BA73]/40 rounded-xl p-2.5 w-[120px] h-[164px] transition-all group"
                    >
                      <div className="w-24 h-24 rounded-md border border-dashed border-white/5 flex items-center justify-center bg-black/20 group-hover:bg-[#E5BA73]/5 group-hover:border-[#E5BA73]/20 transition-all shrink-0">
                        <Plus className="text-zinc-600 group-hover:text-[#E5BA73] transition-colors" size={24} />
                      </div>
                      
                      <div className="flex flex-col items-center text-center">
                        <span className="text-[9px] font-bold uppercase tracking-wide text-[#dfdddd] group-hover:text-[#E5BA73]/80 transition-colors">
                          Tambah Kain
                        </span>
                      </div>
                    </Link>
                  );
                }
              })}

            </div>
          </div>
        </div>
      )}

      {/* KONDISI SWAP KANVAS & RE-USE SIDEBAR KONTROL */}
      <div className="flex flex-col items-stretch gap-10 p-6 mx-auto max-w-7xl lg:flex-row">
        {studioMode === 'custom' ? (
          <>
            <CustomizerCanvas 
              bgColor={customBgColor} 
              patternDensity={customPatternDensity} 
              stripes={customStripes}
              previewMode={previewMode} 
              setPreviewMode={setPreviewMode} 
              onReset={handleResetAll} 
            />
            <CustomizerSidebar 
              bgColor={activeBgColor} 
              setBgColor={setActiveBgColor} 
              patternDensity={activePatternDensity} 
              setPatternDensity={setActivePatternDensity}
              stripes={activeStripes} 
              setStripes={setActiveStripes} 
              onOpenCartModal={() => setIsModalOpen(true)} // Mengaktifkan tombol modal kustom
            />
          </>
        ) : (
          <>
            <ComboStudioCanvas 
              combination={combination}
              bgColor={comboBgColor}
              setBgColor={setComboBgColor}
              patternDensity={comboPatternDensity}
              stripes={comboStripes}
              setStripes={setComboStripes}
              onReset={handleResetAll} // Ditambahkan prop onReset di sini
            />
            <ComboStudioSidebar 
              combination={combination}
              bgColor={activeBgColor}
              setBgColor={setActiveBgColor}
              patternDensity={activePatternDensity}
              setPatternDensity={setActivePatternDensity}
              stripes={activeStripes}
              setStripes={setActiveStripes}
              onCheckoutCombo={() => setIsModalOpen(true)} // Tombol Masuk Keranjang dihubungkan ke Modal Ukuran
            />
          </>
        )}
      </div>

      {/* MODAL SPESIFIKASI UKURAN */}
      <CustomCartModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onConfirm={handleAddToCartConfirm} 

      />
    </main>
  )
}