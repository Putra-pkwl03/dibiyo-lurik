// src/app/components/home/CTA.jsx
import Link from 'next/link'

export default function CTA() {
  return (
    <section id="customizer" className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div className="bg-[#E5BA73] text-[#12110F] rounded-2xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-xl">
        {/* Garis Abstrak background khas motif lurik */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#12110F_2px,transparent_2px)] bg-[size:12px]"></div>
        
        <div className="relative z-10 max-w-xl space-y-3">
          <h2 className="text-3xl font-black leading-tight tracking-tight">Mulai Desain Warisan Anda</h2>
          <p className="text-sm text-[#12110F]/80 leading-relaxed font-medium">
            Jelajahi batas kemungkinan motif tenun tradisional yang mencerminkan identitas kultural dan modernitas dalam satu sapuan kanvas digital.
          </p>
        </div>

        <div className="z-10 shrink-0">
          <Link href="#customizer-tool" className="px-6 py-3.5 bg-[#12110F] text-[#E5BA73] hover:bg-[#1A1917] font-bold rounded-xl text-sm tracking-wider shadow-lg transition-all duration-300 block text-center">
            Launch Customizer
          </Link>
        </div>
      </div>
    </section>
  )
}