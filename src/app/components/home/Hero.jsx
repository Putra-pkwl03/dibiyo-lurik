"use client"

import Link from 'next/link'
import { useState } from 'react'

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      badge: "Digital Innovation for Sustainable Future",
      title: <>Melestarikan <br />Tradisi Melalui <br /><span className="italic text-transparent bg-clip-text bg-gradient-to-r from-[#C59B5F] to-[#9E7A44] font-serif font-normal">Kreativitas Digital</span></>,
      desc: "Kami mengintegrasikan warisan budaya kain lurik jawa dengan teknologi modern, memberdayakan perajin lokal melalui platform kustomisasi digital yang menghidupkan setiap helai benang dalam visi modern Anda.",
      ctaPrimary: { text: "Mulai Mix & Match →", href: "/customizer" },
      ctaSecondary: { text: "Lihat Katalog", href: "#produk" },
      video: "/videos/customizer-preview.mp4"
    },
    {
      badge: "Premium Textile Collection",
      title: <>Proses Sekir <br /><span className="italic text-transparent bg-clip-text bg-gradient-to-r from-[#C59B5F] to-[#9E7A44] font-serif font-normal">Lurik</span></>,
      desc: "Ditenun manual dengan ATBM menggunakan benang katun organik pilihan. Sentuhan warna indigo alami menghasilkan visual garis presisi yang memancarkan aura wibawa, ketenangan, dan kemewahan otentik Nusantara.",
      ctaPrimary: { text: "Jelajahi Produk", href: "/produk" }, 
      ctaSecondary: { text: "Pelajari Filosofi", href: "/sejarah" },
      video: "/videos/indigo-preview.mp4"
    },
    {
      badge: "Eco-Conscious Heritage",
      title: <>Proses Tenun <br /><span className="italic text-transparent bg-clip-text bg-gradient-to-r from-[#C59B5F] to-[#9E7A44] font-serif font-normal">Lurik</span></>,
      desc: "Membawa kehangatan tanah liat alami dan warna bumi ke dalam fashion modern. Setiap helai kain diproses menggunakan pewarna nabati ramah lingkungan, mendukung penuh ekosistem industri fashion yang berkelanjutan.",
      ctaPrimary: { text: "Jelajahi Produk", href: "/produk" }, 
      ctaSecondary: { text: "Pelajari Filosofi", href: "/sejarah" },
      video: "/videos/terracotta-preview.mp4"
    }
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))
  }

  const handleCtaClick = (e, href) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const targetId = href.replace('#', '');
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  };

  return (
    <section className="relative pt-32 pb-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-12 min-h-[85vh] group select-none">
      
      {/* --- TOMBOL PANAH NAVIGASI KIRI & KANAN --- */}
      <div className="absolute z-30 -translate-y-1/2 left-4 lg:left-0 top-1/2">
        <button 
          onClick={prevSlide} 
          className="w-12 h-12 rounded-full border border-[#2D2219]/10 bg-white/90 text-[#2D2219] flex items-center justify-center hover:bg-[#2D2219] hover:text-white transition-all duration-300 shadow-md backdrop-blur-sm font-bold"
          aria-label="Previous Slide"
        >
          ←
        </button>
      </div>

      <div className="absolute z-30 -translate-y-1/2 right-4 top-1/2 lg:right-0">
        <button 
          onClick={nextSlide} 
          className="w-12 h-12 rounded-full border border-[#2D2219]/10 bg-white/90 text-[#2D2219] flex items-center justify-center hover:bg-[#2D2219] hover:text-white transition-all duration-300 shadow-md backdrop-blur-sm font-bold"
          aria-label="Next Slide"
        >
          →
        </button>
      </div>

      {/* --- SISI KIRI: DESKRIPSI DINAMIS --- */}
      <div className="flex-1 space-y-6 text-center lg:text-left min-h-[380px] flex flex-col justify-center lg:items-start transition-all duration-500 pl-4 lg:pl-12">
        <div className="inline-flex items-center gap-2 bg-[#C59B5F]/10 border border-[#C59B5F]/20 px-3 py-1 rounded-full text-xs font-medium tracking-wider text-[#A67D45] uppercase self-center lg:self-start animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C59B5F] animate-pulse"></span>
          {slides[currentSlide].badge}
        </div>
        
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#2D2219] leading-[1.15] tracking-tight">
          {slides[currentSlide].title}
        </h1>
        
        <p className="text-base text-[#6E655C] max-w-xl mx-auto lg:mx-0 leading-relaxed font-light opacity-90">
          {slides[currentSlide].desc}
        </p>
        
        <div className="flex flex-col justify-center w-full gap-4 pt-2 sm:flex-row lg:justify-start sm:w-auto">
          <Link 
            href={slides[currentSlide].ctaPrimary.href} 
            onClick={(e) => handleCtaClick(e, slides[currentSlide].ctaPrimary.href)}
            className="px-6 py-3.5 bg-[#C59B5F] hover:bg-[#A67D45] text-white font-bold rounded-full text-sm tracking-wide shadow-lg shadow-[#C59B5F]/20 transition-all duration-300 transform hover:-translate-y-0.5 text-center"
          >
            {slides[currentSlide].ctaPrimary.text}
          </Link>
          <Link 
            href={slides[currentSlide].ctaSecondary.href} 
            onClick={(e) => handleCtaClick(e, slides[currentSlide].ctaSecondary.href)}
            className="px-6 py-3.5 bg-transparent border border-[#6E655C]/40 text-[#2D2219] hover:border-[#2D2219] font-medium rounded-full text-sm tracking-wide transition-colors text-center"
          >
            {slides[currentSlide].ctaSecondary.text}
          </Link>
        </div>

        {/* Kumpulan Indikator Bulat */}
        <div className="flex justify-center w-full gap-2 pt-6 lg:justify-start">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide === index ? 'w-8 bg-[#C59B5F]' : 'w-2 bg-[#6E655C]/20'}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* --- SISI KANAN: VISUAL VIDEO KONTEN DINAMIS (FIX NO BLACK SCREEN) --- */}
      <div className="flex justify-center flex-1 w-full max-w-lg pr-4 lg:max-w-none lg:justify-end lg:pr-12">
        <div className="relative w-full aspect-[4/5] max-h-[520px] bg-[#EFEBE3] border border-[#2D2219]/5 rounded-[32px] overflow-hidden shadow-2xl flex flex-col justify-between transition-all duration-500">
          
          {/* Bagian Header Kecil Atas Mockup Browser */}
          <div className="flex justify-between items-center text-xs text-[#6E655C] border-b border-[#2D2219]/5 pb-3 pt-4 px-5 bg-[#EFEBE3] z-10">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-red-400 rounded-full shadow-sm"></span>
              <span className="w-2 h-2 bg-yellow-400 rounded-full shadow-sm"></span>
              <span className="w-2 h-2 bg-green-400 rounded-full shadow-sm"></span>
            </span>
            <span className="font-mono text-[9px] tracking-widest opacity-60">LIVE VIDEO CONTENT</span>
          </div>
          
          {/* Area Player Video - Diperbaiki agar selalu Full Screen di dalam frame */}
          <div className="relative flex-1 w-full h-full bg-[#1A1613] overflow-hidden">
            <video
              key={currentSlide}
              src={slides[currentSlide].video}
              autoPlay
              muted
              playsInline
              onEnded={nextSlide}
              /* Menggunakan absolute inset-0 untuk mengunci video agar terpotong sempurna memenuhi wadah */
              className="absolute inset-0 object-cover w-full h-full transition-opacity duration-500"
            />
            <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#fff_1px,transparent_1px)] bg-[size:10px] pointer-events-none"></div>
            <div className="absolute inset-x-0 bottom-0 h-10 pointer-events-none bg-gradient-to-t from-black/10 to-transparent"></div>
          </div>

          {/* Kotak Info Palette Bawah */}
          <div className="bg-[#F5F2EB] border-t border-[#2D2219]/5 p-4 rounded-b-[32px] space-y-2.5 z-10">
            <div className="flex justify-between text-[10px] tracking-wide text-[#6E655C]">
              <span>Katalog Tekstil Premium</span>
              <span className="text-[#C59B5F] font-semibold">Atmanegara Lurik Heritage</span>
            </div>
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#C59B5F] border border-white shadow-sm transition-transform hover:scale-105 duration-300"></div>
              <div className="w-8 h-8 rounded-lg bg-[#8C5A3C] border border-white/50 transition-transform hover:scale-105 duration-300"></div>
              <div className="w-8 h-8 rounded-lg bg-[#3A4B6E] border border-white/50 transition-transform hover:scale-105 duration-300"></div>
              <div className="w-8 h-8 rounded-lg bg-[#56634E] border border-white/50 transition-transform hover:scale-105 duration-300"></div>
            </div>
          </div>

        </div>
      </div>

    </section>
  )
}