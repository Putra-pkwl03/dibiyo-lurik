// src/app/components/home/catalog/ModalDetail.jsx
// file ini maish sementara lakukan penyesuain disini untuk detail suatu produk
"use client"

export default function ModalDetail({ isOpen, onClose, product }) {

  if (!isOpen || !product) return null

  const productTitle = product.motif?.nama && product.kategori?.nama
    ? `${product.motif.nama} ${product.kategori.nama}`
    : product.kode_produk || "Kain Lurik Premium"

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose} 
    >
      <div 
        className="bg-[#1A1917] border border-[#E5BA73]/25 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl relative p-6 space-y-6 animate-scale-up"
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Tombol Close Pojok Kanan Atas */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[#A3A19E] hover:text-[#E5BA73] transition-colors p-1"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

        {/* Konten Placeholder Tampilan Modal */}
        <div className="py-8 space-y-3 text-center">
          <span className="text-xs font-bold tracking-widest text-[#E5BA73] uppercase bg-[#E5BA73]/5 px-3 py-1 rounded-full border border-[#E5BA73]/10">
            Detail Produk
          </span>
          <h2 className="text-2xl font-bold text-[#F9F6F0]">{productTitle}</h2>
          <p className="text-sm text-[#A3A19E] font-light max-w-md mx-auto">
            [ Tampilan detail spesifikasi kain, pilihan gulungan, stok, dan formulir pembelian/pembagian pesanan akan diisi lebih lanjut disini ]
          </p>
        </div>

        {/* Action Button Bawah */}
        <div className="flex justify-end pt-4 border-t border-[#E5BA73]/10">
          <button 
            onClick={onClose}
            className="px-5 py-2 bg-transparent border border-[#A3A19E]/20 text-xs font-semibold tracking-wider text-[#A3A19E] hover:text-[#E5BA73] hover:border-[#E5BA73] rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  )
}