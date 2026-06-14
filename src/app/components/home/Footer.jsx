// src/app/components/home/Footer.jsx
export default function Footer() {
  return (
    <footer className="bg-[#0F0E0D] text-[#A3A19E] text-xs font-light border-t border-[#E5BA73]/10 pt-16 pb-8">
      <div className="grid grid-cols-1 gap-8 px-4 mx-auto mb-12 max-w-7xl sm:px-6 lg:px-8 md:grid-cols-4">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-[#E5BA73] tracking-widest">BIYO LURIK</h3>
          <p className="leading-relaxed">Cultivating Heritage through Digital Craft. Digitalizing the soul of Indonesian textiles.</p>
        </div>
        <div>
          <h4 className="text-xs font-bold text-[#F9F6F0] mb-4 uppercase tracking-wider">Explore</h4>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-[#E5BA73] transition-colors">Home</a></li>
            <li><a href="#customizer" className="hover:text-[#E5BA73] transition-colors">Lurik Customizer</a></li>
            <li><a href="#produk" className="hover:text-[#E5BA73] transition-colors">Product Catalog</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-bold text-[#F9F6F0] mb-4 uppercase tracking-wider">Support</h4>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-[#E5BA73] transition-colors">Shipping Info</a></li>
            <li><a href="#" className="hover:text-[#E5BA73] transition-colors">Terms of Service</a></li>
            <li><a href="#" className="hover:text-[#E5BA73] transition-colors">Privacy Policy</a></li>
          </ul>
        </div>
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-[#F9F6F0] mb-4 uppercase tracking-wider">Keep In Touch</h4>
          <div className="flex gap-2">
            <input type="email" placeholder="Your email address" className="bg-[#1A1917] border border-[#E5BA73]/10 rounded px-3 py-2 text-xs w-full text-white focus:outline-none focus:border-[#E5BA73]" />
            <button className="bg-[#E5BA73] text-[#12110F] px-4 py-2 font-bold rounded hover:bg-[#C29B53] transition-colors">Subscribe</button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[#E5BA73]/5 pt-6 flex flex-col sm:flex-row justify-between text-[10px] text-gray-600">
        <p>© 2026 BIYO LURIK. Cultivating Heritage through Digital Craft.</p>
        <p>Remade to Dark Theme — Powered by AI & Next.js</p>
      </div>
    </footer>
  )
}