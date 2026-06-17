"use client"

import { useState } from 'react'
import CustomizerCanvas from '../components/home/custom/CustomizerCanvas' 
import CustomizerSidebar from '../components/home/custom/CustomizerSidebar'
import CustomCartModal from '../components/home/custom/CustomCartModal'
import { useCart } from '../context/CartContext' 
import Swal from 'sweetalert2'

export default function CustomizerPage() {
  const { addToCart } = useCart(); 

  const [stripeThickness, setStripeThickness] = useState(4)
  const [activeColor, setActiveColor] = useState('gold')
  const [previewMode, setPreviewMode] = useState('fabric')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // 🎨 PENYESUAIAN STATE DEFAULT SESUAI GAMBAR UI (Light Mode & Palet Tenun)
  // Berdasarkan gambar: latar belakang kain dominan hijau zaitun/lumut dengan garis emas & cokelat
  const DEFAULT_BG_COLOR = '#53593B' // Hijau Zaitun/Lumut Tua (Olive Green)
  const DEFAULT_DENSITY = 86        // Sesuai nilai slider di gambar: 86%
  const DEFAULT_STRIPES = [
    { id: 1, thickness: 4, color: '#E5BA73' }, // Denang Garis Slang #1 (Emas/Gold)
    { id: 2, thickness: 2, color: '#4A3429' }, // Renang Garis Slang #2 (Cokelat Tua)
    { id: 3, thickness: 6, color: '#2C3E50' }, // Denang Garis Slang #3 (Navy/Gelap)
  ]

  const [bgColor, setBgColor] = useState(DEFAULT_BG_COLOR)
  const [patternDensity, setPatternDensity] = useState(DEFAULT_DENSITY)
  const [stripes, setStripes] = useState(DEFAULT_STRIPES)

  const handleResetAll = () => {
    setBgColor(DEFAULT_BG_COLOR)
    setPatternDensity(DEFAULT_DENSITY)
    setStripes(DEFAULT_STRIPES)
    setPreviewMode('fabric') 
    setStripeThickness(4)
    setActiveColor('gold')
  }

  const handleAddToCartConfirm = (specs) => {
    setIsModalOpen(false);

    const productData = {
      kode_produk: "Lurik Desain Kustom",
      gambar_url: '/placeholder-kain.jpg',
      isCustom: true 
    };

    const gulunganData = {
      id: `CUSTOM-${Date.now()}`,
      nomor_gulungan: "CUSTOM",
      lebar: specs.lebar,
      panjang_sisa: 999, 
      harga_per_meter: specs.hargaPerMeter,
      harga: specs.hargaPerMeter,
      configurasi: { 
        bgColor,
        patternDensity,
        stripes
      }
    };

    const qty = specs.panjang; 

    if (addToCart) {
      addToCart(productData, gulunganData, qty);
      
      // Mengubah tema SweetAlert2 menjadi Light Mode Premium (Krem & Cokelat)
      Swal.fire({
        title: 'Berhasil!',
        text: 'Kain tenun kustom Anda sukses dimasukkan ke dalam keranjang.',
        icon: 'success',
        background: '#F9F6F0',       // Background krem terang
        color: '#3E3431',            // Teks cokelat gelap tulen
        confirmButtonColor: '#C49A6C' // Tombol warna emas/bronze hangat
      });
    }
  }

  return (
    /* ✨ PERUBAHAN LIGHT MODE UTAMA (DISELARASKAN DENGAN GAMBAR):
      - bg-[#FAF7F2]: Warna background putih gading/krem kain sutra yang bersih.
      - text-[#3E3431]: Warna teks cokelat gelap/charcoal hangat, bukan hitam pekat, agar terlihat estetik dan premium.
    */
    <main className="min-h-screen bg-[#FAF7F2] text-[#3E3431] pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-stretch gap-10 p-6 mx-auto max-w-7xl lg:flex-row">
        
        <CustomizerCanvas 
          bgColor={bgColor}
          patternDensity={patternDensity}
          stripes={stripes}
          previewMode={previewMode}
          setPreviewMode={setPreviewMode}
          onReset={handleResetAll} 
        />
        
        <CustomizerSidebar 
          bgColor={bgColor}
          setBgColor={setBgColor}
          patternDensity={patternDensity}
          setPatternDensity={setPatternDensity}
          stripes={stripes}
          setStripes={setStripes}
          onOpenCartModal={() => setIsModalOpen(true)} 
        />
      </div>

      <CustomCartModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleAddToCartConfirm}
        customProperties={{
          bgColor,
          patternDensity,
          stripes
        }}
      />
    </main>
  )
}