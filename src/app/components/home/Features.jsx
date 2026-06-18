// src/app/components/home/Features.jsx
export default function Features() {
  const items = [
    { title: "Pemberdayaan Perajin", desc: "Sistem transaksi digital kami berdampak langsung pada kesejahteraan perajin tenun bukan mesin (ATBM) di desa binaan.", icon: "🧵" },
    { title: "Simulasi Real-Time", desc: "Visualisasikan kombinasi motif secara akurat dan presisi sebelum proses tenun kustom dimulai.", icon: "⚡" },
    { title: "Eco-Conscious", desc: "Hanya menggunakan pewarna alami dari tanaman lokal serta serat organik murni demi menjaga ekosistem bumi.", icon: "🌱" },
    { title: "Sertifikat Eksklusif", desc: "Dapatkan tanda bukti autentik khusus untuk setiap lembar kain premium Anda, memastikan produk yang Anda miliki adalah karya seni asli.", icon: "📜" }  ]

  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[#2D2219]/5">
      
      <div className="max-w-3xl mx-auto mb-16 space-y-4 text-center">
        {/* Font disesuaikan menjadi lebih kokoh dan anggun */}
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#2D2219] font-sans">
          Mengapa DIBYO LURIK?
        </h2>
        <p className="text-base text-[#6E655C]/90 font-normal max-w-2xl mx-auto leading-relaxed">
          Filosofi kami adalah memangkas rantai pasokan yang tidak adil sambil merangkul masa depan wirausaha berkelanjutan.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-7">
        {items.map((feat, idx) => {
          let colSpanClass = ""
          if (idx === 0 || idx === 3) {
            colSpanClass = "md:col-span-4"
          } else {
            colSpanClass = "md:col-span-3"
          }

          return (
            <div 
              key={idx} 
              /* Penyempurnaan Sesuai Referensi Gambar:
                - Menggunakan trik `border-transparent` + `bg-origin-border` untuk menghasilkan outline gradasi gold murni yang tipis dan presisi.
                - Shadow ditingkatkan ke `shadow-xl` dengan tint warna umber/warm-grey (`shadow-[#2D2219]/5`).
                - Background menggunakan warna off-white sutra murni (`bg-[#FBF9F6]`) agar kontras shadow keluar dengan sempurna.
              */
              className={`${colSpanClass} relative bg-[#FBF9F6] border border-transparent bg-clip-padding before:absolute before:inset-0 before:rounded-2xl before:border before:border-[#C59B5F]/30 before:pointer-events-none p-8 rounded-2xl space-y-5 transition-all duration-500 group hover:-translate-y-1.5 shadow-xl shadow-[#2D2219]/5 hover:shadow-2xl hover:shadow-[#C59B5F]/10 flex flex-col justify-between`}
            >
              <div className="relative z-10 space-y-4">
                {/* Lingkaran Ikon Gradasi Emas Mewah:
                  Gradasi linear mengikuti style tombol dan aksen lingkaran kecil pada mockup gambar.
                */}
                <div className="text-xl bg-gradient-to-b from-[#E5C9A3] via-[#C59B5F] to-[#9E7A44] text-white w-12 h-12 rounded-full flex items-center justify-center shadow-md border border-white/40 group-hover:scale-110 transition-transform duration-300">
                  <span className="drop-shadow-sm">{feat.icon}</span>
                </div>
                
                {/* Judul dengan font sans-serif modern yang tebal dan clean */}
                <h3 className="text-xl font-bold text-[#2D2219] tracking-tight font-sans pt-1">
                  {feat.title}
                </h3>
                
                {/* Deskripsi dengan keterbacaan tinggi di atas warna terang */}
                <p className="text-[14px] text-[#5C534A] leading-relaxed font-normal antialiased">
                  {feat.desc}
                </p>
              </div>
              
              {/* Ikon panah pojok kanan bawah menggunakan warna satin gold tipis */}
              <div className="self-end text-[#C59B5F]/50 group-hover:text-[#9E7A44] group-hover:translate-x-1 transition-all duration-300 pt-4 md:pt-0 relative z-10">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}