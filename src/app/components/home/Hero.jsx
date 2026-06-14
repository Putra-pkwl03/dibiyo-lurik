// src/app/components/home/Hero.jsx
"use client"

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      badge: "Digital Innovation for Sustainable Future",
      title: <>Melestarikan <br />Tradisi Melalui <br /><span className="italic text-transparent bg-clip-text bg-gradient-to-r from-[#E5BA73] to-[#C29B53] font-serif font-normal">Kreativitas Digital</span></>,
      desc: "Kami mengintegrasikan warisan budaya kain lurik jawa dengan teknologi modern, memberdayakan perajin lokal melalui platform kustomisasi digital yang menghidupkan setiap helai benang dalam visi modern Anda.",
      ctaPrimary: { text: "Mulai Mix & Match →", href: "#customizer" },
      ctaSecondary: { text: "Lihat Katalog", href: "#produk" },
      type: "customizer"
    },
    {
      badge: "Premium Textile Collection",
      title: <>Indigo Pedan <br />Classic <span className="italic text-[#E5BA73] font-serif font-normal">Wastra</span></>,
      desc: "Ditenun manual dengan ATBM menggunakan benang katun organik pilihan. Sentuhan warna indigo alami menghasilkan visual garis presisi yang memancarkan aura wibawa, ketenangan, dan kemewahan otentik Nusantara.",
      ctaPrimary: { text: "Beli Kain Ini", href: "#produk" },
      ctaSecondary: { text: "Pelajari Filosofi", href: "#artikel" },
      type: "product",
      image: "/images/indigo-pedan.png",
      bgColor: "from-[#2B3A4F] to-[#121924]",
      tag: "BEST SELLER"
    },
    {
      badge: "Eco-Conscious Heritage",
      title: <>Terracotta <br />Heritage <span className="italic text-[#E5BA73] font-serif font-normal">Collection</span></>,
      desc: "Membawa kehangatan tanah liat alami dan warna bumi ke dalam fashion modern. Setiap helai kain diproses menggunakan pewarna nabati ramah lingkungan, mendukung penuh ekosistem industri fashion yang berkelanjutan.",
      ctaPrimary: { text: "Beli Kain Ini", href: "#produk" },
      ctaSecondary: { text: "Pelajari Filosofi", href: "#artikel" },
      type: "product",
      image: "/images/terracotta.png",
      bgColor: "from-[#6E422A] to-[#361E12]",
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
    // Menambahkan class 'group' pada section utama untuk kontrol hover panah
    <section className="relative pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-12 min-h-[85vh] group">
      
      {/* --- TOMBOL PANAH NAVIGASI KIRI & KANAN (TERPISAH) --- */}
      {/* Panah Kiri */}
      <div className="absolute z-30 -translate-y-1/2 left-4 lg:left-0 top-1/2">
        <button 
          onClick={prevSlide} 
          className="w-12 h-12 rounded-full border border-[#E5BA73]/20 bg-[#1A1917]/80 text-[#E5BA73] flex items-center justify-center hover:bg-[#E5BA73] hover:text-[#12110F] transition-all duration-300 shadow-xl backdrop-blur-sm"
          aria-label="Previous Slide"
        >
          ←
        </button>
      </div>

      {/* Panah Kanan */}
      <div className="absolute z-30 -translate-y-1/2 right-4 lg:right-0 top-1/2">
        <button 
          onClick={nextSlide} 
          className="w-12 h-12 rounded-full border border-[#E5BA73]/20 bg-[#1A1917]/80 text-[#E5BA73] flex items-center justify-center hover:bg-[#E5BA73] hover:text-[#12110F] transition-all duration-300 shadow-xl backdrop-blur-sm"
          aria-label="Next Slide"
        >
          →
        </button>
      </div>


      {/* --- SISI KIRI: DESKRIPSI DINAMIS --- */}
      <div className="flex-1 space-y-6 text-center lg:text-left min-h-[380px] flex flex-col justify-center lg:items-start transition-all duration-500 pl-4 lg:pl-12">
        <div className="inline-flex items-center gap-2 bg-[#E5BA73]/10 border border-[#E5BA73]/30 px-3 py-1 rounded-full text-xs font-medium tracking-wider text-[#E5BA73] uppercase self-center lg:self-start animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E5BA73] animate-pulse"></span>
          {slides[currentSlide].badge}
        </div>
        
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#F9F6F0] leading-[1.15] tracking-tight">
          {slides[currentSlide].title}
        </h1>
        
        <p className="text-base text-[#A3A19E] max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
          {slides[currentSlide].desc}
        </p>
        
        <div className="flex flex-col justify-center w-full gap-4 pt-2 sm:flex-row lg:justify-start sm:w-auto">
          <Link href={slides[currentSlide].ctaPrimary.href} className="px-6 py-3.5 bg-[#E5BA73] hover:bg-[#C29B53] text-[#12110F] font-bold rounded-full text-sm tracking-wide shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 text-center">
            {slides[currentSlide].ctaPrimary.text}
          </Link>
          <Link href={slides[currentSlide].ctaSecondary.href} className="px-6 py-3.5 bg-transparent border border-[#A3A19E]/40 text-[#F9F6F0] hover:border-[#F9F6F0] font-medium rounded-full text-sm tracking-wide transition-colors text-center">
            {slides[currentSlide].ctaSecondary.text}
          </Link>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center w-full gap-2 pt-6 lg:justify-start">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide === index ? 'w-8 bg-[#E5BA73]' : 'w-2 bg-[#A3A19E]/30'}`}
            />
          ))}
        </div>
      </div>


      {/* --- SISI KANAN: VISUAL DINAMIS --- */}
      <div className="flex justify-center flex-1 w-full max-w-lg pr-4 lg:max-w-none lg:justify-end lg:pr-12">
        
        {/* TAMPILAN 1: MOCKUP INTERACTIVE CUSTOMIZER */}
        {slides[currentSlide].type === "customizer" && (
          <div className="relative w-full aspect-[4/5] max-h-[500px] bg-[#1A1917] border border-[#E5BA73]/20 rounded-2xl p-4 shadow-2xl flex flex-col justify-between animate-fade-in">
            <div className="flex justify-between items-center text-xs text-[#A3A19E] border-b border-[#E5BA73]/10 pb-3">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-red-500 rounded-full"></span><span className="w-2 h-2 bg-yellow-500 rounded-full"></span><span className="w-2 h-2 bg-green-500 rounded-full"></span></span>
              <span>INTERACTIVE PREVIEW v1.0</span>
            </div>
            
            <div className="flex items-center justify-center flex-1 py-6">
              <div className="w-56 h-72 bg-gradient-to-b from-[#2A2925] to-[#12110F] rounded-t-full shadow-inner border border-[#E5BA73]/5 relative overflow-hidden">
                <div className="absolute inset-0 opacity-40 bg-[linear-gradient(to_right,#E5BA73_1px,transparent_1px)] bg-[size:8px] rotate-12"></div>
                <div className="absolute top-10 left-1/2 -translate-x-1/2 w-32 h-20 border-b-4 border-x border-[#E5BA73]/40 rounded-b-xl bg-[#1A1917]"></div>
              </div>
            </div>

            <div className="bg-[#12110F] border border-[#E5BA73]/10 p-3 rounded-xl space-y-2">
              <div className="flex justify-between text-[10px] text-[#A3A19E]">
                <span>Kombinasi Motif (Pattern Canvas)</span>
                <span className="text-[#E5BA73]">100% Organic Cotton</span>
              </div>
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded bg-[#E5BA73] border border-white/20"></div>
                <div className="w-8 h-8 rounded bg-[#7A4B31] border border-white/10"></div>
                <div className="w-8 h-8 rounded bg-[#3A4B6E] border border-white/10"></div>
                <div className="w-8 h-8 rounded bg-[#5A6351] border border-white/10"></div>
              </div>
            </div>
          </div>
        )}

        {/* TAMPILAN 2: REAL PRODUCT FABRIC IMAGE */}
        {slides[currentSlide].type === "product" && (
          <div className="relative w-full aspect-[4/5] max-h-[500px] bg-[#1A1917] border border-[#E5BA73]/20 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-end group animate-fade-in">
            <div className={`absolute inset-0 bg-gradient-to-b ${slides[currentSlide].bgColor} flex items-center justify-center`}>
              <img 
                src={slides[currentSlide].image} 
                alt="Kain Lurik Biyo" 
                className="object-cover w-full h-full transition-transform opacity-90 group-hover:scale-105 duration-750"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#fff_1px,transparent_1px)] bg-[size:6px]"></div>
            </div>

            <div className="absolute top-4 left-4">
              <span className="text-[10px] font-bold tracking-widest bg-[#12110F]/80 text-[#E5BA73] border border-[#E5BA73]/30 px-2 py-1 rounded">
                {slides[currentSlide].tag}
              </span>
            </div>

            <div className="z-10 m-4 p-4 bg-[#12110F]/70 backdrop-blur-md border border-white/10 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-[10px] text-[#E5BA73] tracking-widest uppercase font-semibold">Premium Wastra</p>
                <h4 className="text-sm font-bold text-white mt-0.5">
                {slides[currentSlide].ctaPrimary.text}
                </h4>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#E5BA73] flex items-center justify-center text-[#12110F] text-xs font-bold">
                ✓
              </div>
            </div>
          </div>
        )}

      </div>

    </section>
  )
}