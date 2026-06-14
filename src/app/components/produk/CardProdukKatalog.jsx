import React, { useState } from 'react'

export default function CardProdukKatalog({
  prod,
  formatRupiah,
  onBuyClick,
  onKombinasiClick,
  isActivePo,
  onTogglePoDropdown,
}) {
  const [imageError, setImageError] = useState(false)

  // Mengambil harga dari gulungan pertama (jika ada) sebagai display
  const hargaDisplay = prod.gulungan?.[0]?.harga || 0
  const productTitle = prod.motif?.nama && prod.kategori?.nama
    ? `${prod.motif.nama} ${prod.kategori.nama}`
    : prod.kode_produk

  return (
    <div className="bg-[#1A1917] border border-[#E5BA73]/10 rounded-2xl overflow-hidden flex flex-col h-full shadow-xl hover:border-[#E5BA73]/30 transition-all duration-300 group">
      
      {/* Image Area */}
      <div className="w-full aspect-[4/3] bg-[#12110F] relative flex items-center justify-center overflow-hidden">
        <span className="absolute top-3 left-3 text-[10px] font-bold tracking-wider bg-[#0A1715]/90 text-[#E5BA73] px-2.5 py-1 rounded border border-[#E5BA73]/20 uppercase z-10 select-none">
          {prod.jenis_pewarna || 'Sintetis'}
        </span>
        
        {prod.gambar_url && !imageError ? (
          <img 
            src={prod.gambar_url} 
            alt={productTitle}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-white/5 to-transparent p-6 select-none">
            <span className="text-3xl opacity-40">🧵</span>
            <span className="text-[11px] text-[#A3A19E] mt-2 font-mono">{prod.kode_produk}</span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-6 flex flex-col flex-1 justify-between space-y-4">
        <div>
          <span className="text-[11px] uppercase tracking-widest text-[#E5BA73]/60 font-medium">
            {prod.kategori?.nama || "Uncategorized"}
          </span>
          <h3 className="font-bold text-lg text-[#F9F6F0] mt-0.5 line-clamp-1">
            {productTitle}
          </h3>
          
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
            <div>
              <p className="text-xs text-[#A3A19E]">Harga Per Meter</p>
              <p className="text-sm text-[#E5BA73] font-bold mt-0.5">
                {formatRupiah(hargaDisplay)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#A3A19E]">Total Stok</p>
              <p className="text-xs font-semibold text-[#F9F6F0] bg-white/5 px-2 py-1 rounded mt-0.5 inline-block">
                {prod.stok || 0} m
              </p>
            </div>
          </div>
        </div>

        {/* Actions Area */}
        <div className="space-y-2 pt-2">
          <div className="grid grid-cols-2 gap-2">
            {/* Tombol Beli */}
            <button
              onClick={() => onBuyClick(prod)}
              disabled={!prod.stok || prod.stok <= 0}
              className="py-2.5 bg-[#E5BA73] text-[#12110F] text-xs font-bold rounded-lg hover:bg-[#f3cb85] disabled:bg-white/10 disabled:text-white/40 transition-colors duration-200"
            >
              {!prod.stok || prod.stok <= 0 ? 'Habis' : 'Beli Langsung'}
            </button>

            {/* Dropdown Pre Order */}
            <div className="relative">
              <button
                onClick={onTogglePoDropdown}
                className="w-full h-full py-2.5 bg-transparent border border-[#E5BA73]/20 text-[#E5BA73] text-xs font-semibold rounded-lg hover:bg-[#E5BA73]/5 flex items-center justify-center gap-1 transition-colors duration-200"
              >
                Pre-Order
                <span className="text-[9px]">▼</span>
              </button>

              {isActivePo && (
                <div className="absolute right-0 bottom-full mb-1 w-40 bg-[#1A1917] border border-[#E5BA73]/20 rounded-lg shadow-2xl z-20 overflow-hidden">
                  <button
                    onClick={() => { alert('Membuka form Pre-Order Reguler...'); onTogglePoDropdown(); }}
                    className="w-full text-left px-4 py-2.5 text-xs text-[#F9F6F0] hover:bg-[#E5BA73] hover:text-[#12110F] transition-colors"
                  >
                    PO Reguler
                  </button>
                  <button
                    onClick={() => { alert('Membuka form Pre-Order Custom...'); onTogglePoDropdown(); }}
                    className="w-full text-left px-4 py-2.5 text-xs text-[#F9F6F0] hover:bg-[#E5BA73] hover:text-[#12110F] transition-colors"
                  >
                    PO Custom
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Tombol Kombinasi (Mix & Match) */}
          <button
            onClick={() => onKombinasiClick(prod)}
            className="w-full py-2 bg-[#0A1715] border border-[#A3A19E]/30 text-[#A3A19E] text-xs font-medium rounded-lg hover:border-[#E5BA73] hover:text-[#E5BA73] flex items-center justify-center gap-1.5 transition-all duration-200"
          >
            <span>👚</span> Mix & Match Kombinasi
          </button>
        </div>

      </div>
    </div>
  )
}