// src/app/components/home/Features.jsx
export default function Features() {
  const items = [
    { title: "Pemberdayaan Perajin", desc: "Sistem transaksi digital kami berdampak langsung pada kesejahteraan perajin tenun bukan mesin (ATBM) di desa binaan.", icon: "🧵" },
    { title: "Simulasi Real-Time", desc: "Visualisasikan kombinasi motif secara akurat dan presisi sebelum proses tenun kustom dimulai.", icon: "⚡" },
    { title: "Eco-Conscious", desc: "Hanya menggunakan pewarna alami dari tanaman lokal serta serat organik murni demi menjaga ekosistem bumi.", icon: "🌱" },
    { title: "Digital Artifacts", desc: "Dapatkan sertifikat keaslian digital berbasis blockchain terenkripsi untuk setiap pesanan eksklusif Anda.", icon: "🔒" },
  ]

  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[#E5BA73]/10">
      <div className="max-w-3xl mx-auto mb-16 space-y-3 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-[#F9F6F0]">Mengapa BIYO LURIK?</h2>
        <p className="text-sm text-[#A3A19E] font-light">Filosofi kami adalah memangkas rantai pasokan yang tidak adil sambil merangkul masa depan wirausaha berkelanjutan.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-7">
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
              className={`${colSpanClass} bg-[#1A1917] border border-[#E5BA73]/5 hover:border-[#E5BA73]/20 p-8 rounded-2xl space-y-4 transition-all duration-300 group hover:-translate-y-1 flex flex-col justify-between`}
            >
              <div className="space-y-4">
                <div className="text-2xl bg-[#E5BA73]/5 w-12 h-12 rounded-xl flex items-center justify-center group-hover:bg-[#E5BA73]/10 transition-colors">
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold text-[#F9F6F0]">{feat.title}</h3>
                <p className="text-sm text-[#A3A19E] leading-relaxed font-light">{feat.desc}</p>
              </div>
              
              {/* Tambahan dekorasi ikon kecil di pojok kanan bawah agar persis menyerupai mockup bento grid */}
              <div className="self-end text-[#E5BA73]/20 group-hover:text-[#E5BA73]/40 transition-colors pt-4 md:pt-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}