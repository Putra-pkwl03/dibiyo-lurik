// src/app/components/home/CTA.jsx
import Link from 'next/link'

export default function CTA() {
  return (
    <section id="customizer" className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
      {/* Perubahan besar pada container:
        - bg-[#E5BA73] -> Diubah ke gradasi emas bumi lembut dari mockup hiasan lurik bawah
        - text-[#12110F] -> text-[#2D2219] (Cokelat gelap khas)
      */}
      <div className="bg-gradient-to-r from-[#E5E1D7] via-[#D4B285] to-[#B08953] text-[#2D2219] rounded-2xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-lg border border-[#C59B5F]/20">
        
        {/* Garis Abstrak background khas motif lurik (Disesuaikan opacity-nya agar vertikal estetik seperti mockup) */}
        <div className="absolute inset-0 opacity-[0.15] bg-[linear-gradient(to_right,#2D2219_2px,transparent_2px)] bg-[size:10px]"></div>
        
        <div className="relative z-10 max-w-xl space-y-3">
          {/* Perubahan: Font weight disesuaikan dan warna text cokelat pekat */}
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-[#2D2219]">
            Mulai Desain Warisan Anda
          </h2>
          <p className="text-sm text-[#2D2219]/90 leading-relaxed font-medium">
            Jelajahi batas kemungkinan motif tenun tradisional yang mencerminkan identitas kultural dan modernitas dalam satu sapuan kanvas digital.
          </p>
        </div>

        <div className="z-10 shrink-0 w-full md:w-auto">
          {/* Perubahan Tombol:
            - bg-[#12110F] -> bg-[#2D2219] (Tombol cokelat gelap padat)
            - text-[#E5BA73] -> text-[#F5F2EB] (Teks krem terang bersih)
          */}
          <Link 
            href="/customizer" 
            className="px-6 py-3.5 bg-[#2D2219] text-[#F5F2EB] hover:bg-[#1A110B] font-bold rounded-xl text-sm tracking-wider shadow-md hover:shadow-xl transition-all duration-300 block text-center transform hover:-translate-y-0.5"
          >
            Launch Customizer
          </Link>
        </div>
      </div>
    </section>
  )
}