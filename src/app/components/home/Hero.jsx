"use client"

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      badge: "Digital Innovation for Sustainable Future",
      title: <>Melestarikan <br />Tradisi Melalui <br /><span className="italic text-transparent bg-clip-text bg-gradient-to-r from-[#C59B5F] to-[#9E7A44] font-serif font-normal">Kreativitas Digital</span></>,
      desc: "Kami mengintegrasikan warisan budaya kain lurik jawa dengan teknologi modern, memberdayakan perajin lokal melalui platform kustomisasi digital yang menghidupkan setiap helai benang dalam visi modern Anda.",
      ctaPrimary: { text: "Mulai Mix & Match →", href: "/customizer" },
      ctaSecondary: { text: "Lihat Katalog", href: "#produk" },
      type: "customizer"
    },
    {
      badge: "Premium Textile Collection",
      title: <>Indigo Pedan <br />Classic <span className="italic text-[#C59B5F] font-serif font-normal">Wastra</span></>,
      desc: "Ditenun manual dengan ATBM menggunakan benang katun organik pilihan. Sentuhan warna indigo alami menghasilkan visual garis presisi yang memancarkan aura wibawa, ketenangan, dan kemewahan otentik Nusantara.",
      ctaPrimary: { text: "Beli Kain Ini", href: "#produk" },
      ctaSecondary: { text: "Pelajari Filosofi", href: "#artikel" },
      type: "product",
      image: "/images/indigo-pedan.png",
      bgColor: "from-[#3A4B6E] to-[#25324D]", // Disesuaikan sedikit lebih soft di mode terang
      tag: "BEST SELLER"
    },
    {
      badge: "Eco-Conscious Heritage",
      title: <>Terracotta <br />Heritage <span className="italic text-[#C59B5F] font-serif font-normal">Collection</span></>,
      desc: "Membawa kehangatan tanah liat alami dan warna bumi ke dalam fashion modern. Setiap helai kain diproses menggunakan pewarna nabati ramah lingkungan, mendukung penuh ekosistem industri fashion yang berkelanjutan.",
      ctaPrimary: { text: "Beli Kain Ini", href: "#produk" },
      ctaSecondary: { text: "Pelajari Filosofi", href: "#artikel" },
      type: "product",
      image: "/images/terracotta.png",
      bgColor: "from-[#8C5A3C] to-[#593722]", // Disesuaikan sedikit lebih soft di mode terang
      tag: "100% ORGANIC"
    }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
    }, 7000)
    return () => clearInterval(timer)
  }, [slides.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))
  }

  return (
    <section className="relative pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-12 min-h-[85vh] group">
      
      {/* --- TOMBOL PANAH NAVIGASI KIRI & KANAN (LIGHT MODE) --- */}
      {/* Panah Kiri */}
      <div className="absolute z-30 -translate-y-1/2 left-4 lg:left-0 top-1/2">
        {/* Perubahan: bg-[#1A1917]/80 -> bg-[#EFEBE3]/90, border menggunakan cokelat transparan */}
        <button 
          onClick={prevSlide} 
          className="w-12 h-12 rounded-full border border-[#2D2219]/10 bg-[#EFEBE3]/90 text-[#2D2219] flex items-center justify-center hover:bg-[#2D2219] hover:text-[#F5F2EB] transition-all duration-300 shadow-lg backdrop-blur-sm font-bold"
          aria-label="Previous Slide"
        >
          ←
        </button>
      </div>

      {/* Panah Kanan */}
      <div className="absolute z-30 -translate-y-1/2 right-4 lg:right-0 top-1/2">
        {/* Perubahan: bg-[#1A1917]/80 -> bg-[#EFEBE3]/90, border menggunakan cokelat transparan */}
        <button 
          onClick={nextSlide} 
          className="w-12 h-12 rounded-full border border-[#2D2219]/10 bg-[#EFEBE3]/90 text-[#2D2219] flex items-center justify-center hover:bg-[#2D2219] hover:text-[#F5F2EB] transition-all duration-300 shadow-lg backdrop-blur-sm font-bold"
          aria-label="Next Slide"
        >
          →
        </button>
      </div>


      {/* --- SISI KIRI: DESKRIPSI DINAMIS --- */}
      <div className="flex-1 space-y-6 text-center lg:text-left min-h-[380px] flex flex-col justify-center lg:items-start transition-all duration-500 pl-4 lg:pl-12">
        {/* Perubahan: Badge diubah ke warna krem pekat dengan teks emas gelap */}
        <div className="inline-flex items-center gap-2 bg-[#C59B5F]/10 border border-[#C59B5F]/20 px-3 py-1 rounded-full text-xs font-medium tracking-wider text-[#A67D45] uppercase self-center lg:self-start animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C59B5F] animate-pulse"></span>
          {slides[currentSlide].badge}
        </div>
        
        {/* Perubahan: text-[#F9F6F0] -> text-[#2D2219] */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#2D2219] leading-[1.15] tracking-tight">
          {slides[currentSlide].title}
        </h1>
        
        {/* Perubahan: text-[#A3A19E] -> text-[#6E655C] */}
        <p className="text-base text-[#6E655C] max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
          {slides[currentSlide].desc}
        </p>
        
        <div className="flex flex-col justify-center w-full gap-4 pt-2 sm:flex-row lg:justify-start sm:w-auto">
          {/* Perubahan: Tombol utama menggunakan warna emas baru dengan teks terang bawaan */}
          <Link href={slides[currentSlide].ctaPrimary.href} className="px-6 py-3.5 bg-[#C59B5F] hover:bg-[#A67D45] text-[#F5F2EB] font-bold rounded-full text-sm tracking-wide shadow-md shadow-[#C59B5F]/10 transition-all duration-300 transform hover:-translate-y-0.5 text-center">
            {slides[currentSlide].ctaPrimary.text}
          </Link>
          {/* Perubahan: Tombol sekunder menggunakan border abu-abu gelap dan teks cokelat gelap */}
          <Link href={slides[currentSlide].ctaSecondary.href} className="px-6 py-3.5 bg-transparent border border-[#6E655C]/30 text-[#2D2219] hover:border-[#2D2219] font-medium rounded-full text-sm tracking-wide transition-colors text-center">
            {slides[currentSlide].ctaSecondary.text}
          </Link>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center w-full gap-2 pt-6 lg:justify-start">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              
              className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide === index ? 'w-8 bg-[#C59B5F]' : 'w-2 bg-[#6E655C]/20'}`}
            />
          ))}
        </div>
      </div>


      {/* --- SISI KANAN: VISUAL DINAMIS --- */}
      <div className="flex justify-center flex-1 w-full max-w-lg pr-4 lg:max-w-none lg:justify-end lg:pr-12">
        
        {/* TAMPILAN 1: MOCKUP INTERACTIVE CUSTOMIZER (LIGHT MODE) */}
        {slides[currentSlide].type === "customizer" && (
          /* Perubahan: bg-[#1A1917] -> bg-[#EFEBE3] (abu-krem), border lebih halus */
          <div className="relative w-full aspect-[4/5] max-h-[500px] bg-[#EFEBE3] border border-[#2D2219]/5 rounded-2xl p-4 shadow-xl flex flex-col justify-between animate-fade-in">
            <div className="flex justify-between items-center text-xs text-[#6E655C] border-b border-[#2D2219]/5 pb-3">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-red-400 rounded-full"></span><span className="w-2 h-2 bg-yellow-400 rounded-full"></span><span className="w-2 h-2 bg-green-400 rounded-full"></span></span>
              <span className="font-mono text-[10px] opacity-70">INTERACTIVE PREVIEW v1.0</span>
            </div>
            
            <div className="flex items-center justify-center flex-1 py-6">
              {/* Perubahan: Mengubah siluet tas menjadi terang dengan tekstur garis gelap transparan */}
              <div className="w-56 h-72 bg-gradient-to-b from-[#E5E1D7] to-[#D8D3C5] rounded-t-full shadow-inner border border-[#2D2219]/5 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#2D2219_1px,transparent_1px)] bg-[size:8px] rotate-12"></div>
                <div className="absolute top-10 left-1/2 -translate-x-1/2 w-32 h-20 border-b-2 border-x border-[#2D2219]/10 rounded-b-xl bg-[#EFEBE3]"></div>
              </div>
            </div>

            {/* Perubahan: Kotak bawah menjadi krem bersih */}
            <div className="bg-[#F5F2EB] border border-[#2D2219]/5 p-3 rounded-xl space-y-2">
              <div className="flex justify-between text-[10px] text-[#6E655C]">
                <span>Kombinasi Motif (Pattern Canvas)</span>
                <span className="text-[#C59B5F] font-medium">100% Organic Cotton</span>
              </div>
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded bg-[#C59B5F] border border-white shadow-sm"></div>
                <div className="w-8 h-8 rounded bg-[#8C5A3C] border border-white/50"></div>
                <div className="w-8 h-8 rounded bg-[#3A4B6E] border border-white/50"></div>
                <div className="w-8 h-8 rounded bg-[#56634E] border border-white/50"></div>
              </div>
            </div>
          </div>
        )}

        {/* TAMPILAN 2: REAL PRODUCT FABRIC IMAGE */}
        {slides[currentSlide].type === "product" && (
          /* Perubahan: Pembungkus gambar produk luar disesuaikan dengan border tipis terang */
          <div className="relative w-full aspect-[4/5] max-h-[500px] bg-[#EFEBE3] border border-[#2D2219]/5 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-end group animate-fade-in">
            <div className={`absolute inset-0 bg-gradient-to-b ${slides[currentSlide].bgColor} flex items-center justify-center`}>
              <img 
                src={slides[currentSlide].image} 
                alt="Kain Lurik Biyo" 
                className="object-cover w-full h-full transition-transform opacity-95 group-hover:scale-105 duration-750"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#fff_1px,transparent_1px)] bg-[size:6px]"></div>
            </div>

            {/* Perubahan: Badge Tag produk atas menggunakan paduan kontras baru */}
            <div className="absolute top-4 left-4">
              <span className="text-[10px] font-bold tracking-widest bg-[#F5F2EB]/90 text-[#2D2219] border border-[#2D2219]/5 px-2 py-1 rounded shadow-sm">
                {slides[currentSlide].tag}
              </span>
            </div>

            {/* Perubahan: Kotak deskripsi bawah kain diubah menjadi background terang semi-transparan */}
            <div className="z-10 m-4 p-4 bg-[#F5F2EB]/80 backdrop-blur-md border border-[#2D2219]/5 rounded-xl flex items-center justify-between shadow-md">
              <div>
                <p className="text-[10px] text-[#A67D45] tracking-widest uppercase font-semibold">Premium Wastra</p>
                <h4 className="text-sm font-bold text-[#2D2219] mt-0.5">
                  {slides[currentSlide].ctaPrimary.text}
                </h4>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#C59B5F] flex items-center justify-center text-[#F5F2EB] text-xs font-bold shadow-sm">
                ✓
              </div>
            </div>
          </div>
        )}

      </div>

    </section>
  )
}