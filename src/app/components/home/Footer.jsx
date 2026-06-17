// src/app/components/home/Footer.jsx
export default function Footer() {
  return (
    /* Perubahan besar pada kontainer dasar:
      - bg-[#F4F1EA] -> bg-[#231E1B] (Warna cokelat tua pekat bertekstur hangat sesuai baris kedua mockup)
      - text-[#5C534A] -> text-[#A3A19E] (Teks abu-abu lembut agar nyaman dibaca di latar gelap)
      - Border atas menggunakan warna keemasan redup tipis
    */
    <footer className="bg-[#231E1B] text-[#A3A19E] text-xs font-light relative pt-20 pb-0 overflow-hidden">
      
      {/* Efek Garis Halus Tekstur Kain Premium (Opsional, memperkuat kesan tekstur seperti gambar) */}
      <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#fff_1px,transparent_1px)] bg-[size:8px] pointer-events-none"></div>

      <div className="grid grid-cols-1 gap-12 px-4 mx-auto mb-16 max-w-7xl sm:px-6 lg:px-8 md:grid-cols-4 relative z-10">
        
        {/* Kolom Identitas Brand */}
        <div className="space-y-4">
          {/* Warna judul brand menggunakan Emas Premium Muted */}
          <h3 className="text-sm font-bold text-[#E5BA73] tracking-widest font-sans">
            BIYO LURIK
          </h3>
          <p className="leading-relaxed text-[#A3A19E]/80 antialiased">
            Cultivating Heritage through Digital Craft. Digitalizing the soul of Indonesian textiles.
          </p>
        </div>
        
        {/* Kolom Navigasi Explore */}
        <div>
          <h4 className="text-xs font-bold text-[#F9F6F0] mb-4 uppercase tracking-wider font-sans">
            Explore
          </h4>
          <ul className="space-y-2.5">
            <li><a href="#" className="hover:text-[#E5BA73] transition-colors duration-200">Home</a></li>
            <li><a href="#customizer" className="hover:text-[#E5BA73] transition-colors duration-200">Lurik Customizer</a></li>
            <li><a href="#produk" className="hover:text-[#E5BA73] transition-colors duration-200">Product Catalog</a></li>
          </ul>
        </div>
        
        {/* Kolom Navigasi Support */}
        <div>
          <h4 className="text-xs font-bold text-[#F9F6F0] mb-4 uppercase tracking-wider font-sans">
            Support
          </h4>
          <ul className="space-y-2.5">
            <li><a href="#" className="hover:text-[#E5BA73] transition-colors duration-200">Shipping Info</a></li>
            <li><a href="#" className="hover:text-[#E5BA73] transition-colors duration-200">Terms of Service</a></li>
            <li><a href="#" className="hover:text-[#E5BA73] transition-colors duration-200">Privacy Policy</a></li>
          </ul>
        </div>
        
        {/* Kolom Newsletter (Keep In Touch) */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-[#F9F6F0] mb-4 uppercase tracking-wider font-sans">
            Keep In Touch
          </h4>
          <div className="flex gap-2">
            {/* Input Form:
              - Diubah menjadi cokelat gelap transparan pekat (`bg-[#1A1614]`) dengan border senada mockup
            */}
            <input 
              type="email" 
              placeholder="Your email address" 
              className="bg-[#1A1614] border border-[#E5BA73]/10 rounded-xl px-3.5 py-2.5 text-xs w-full text-[#F9F6F0] placeholder-[#A3A19E]/40 focus:outline-none focus:border-[#E5BA73]/40 transition-all" 
            />
            {/* Tombol Subscribe:
              - Menggunakan warna aksen emas hangat pastel murni (`bg-[#E5BA73]`) dengan teks gelap kontras
            */}
            <button className="bg-[#E5BA73] text-[#12110F] px-4 py-2.5 text-xs font-bold rounded-xl hover:bg-[#D4B285] shadow-sm transition-all duration-300 shrink-0">
              Subscribe
            </button>
          </div>
        </div>
      </div>
      
      {/* Baris Hak Cipta Bawah (Bottom Bar):
        - Menggunakan warna hitam arang murni pekat (`bg-[#0F0E0D]`) persis seperti lapisan terbawah di gambar referensi
      */}
      <div className="bg-[#0F0E0D] py-6 border-t border-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between gap-4 text-[11px] text-[#A3A19E]/40">
          <p>© 2026 BIYO LURIK. Cultivating Heritage through Digital Craft.</p>
          <p className="tracking-wide">Remade to Dark Theme — Powered by AI & Next.js</p>
        </div>
      </div>

    </footer>
  )
}