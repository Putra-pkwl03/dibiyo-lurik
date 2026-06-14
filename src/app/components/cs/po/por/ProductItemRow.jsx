import React from 'react'

export default function ProductItemRow({ item, index, onUpdateField }) {
  // Ambil gambar_url dari database
  const imageUrl = item.gambar_url || item.produk?.gambar_url || item.motif?.gambar_url

  // Ambil nilai murni pewarna untuk mencocokkan value select
  const currentPewarna = item.jenis_pewarna ? String(item.jenis_pewarna).toLowerCase().trim() : ''

  return (
    <div className="flex flex-col gap-4 p-4 bg-white border shadow-sm border-stone-100 rounded-xl md:flex-row md:items-center">
      
      {/* Gambar Motif */}
      <div className="flex items-center justify-center flex-shrink-0 w-16 h-16 overflow-hidden border rounded-lg border-stone-100 bg-stone-50">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.motif?.nama || item.nama_motif || 'Motif'}
            className="object-cover w-full h-full"
            onError={(e) => {
              e.target.onerror = null 
              e.target.src = 'https://placehold.co/150x150?text=No+Image'
            }}
          />
        ) : (
          <span className="text-[10px] text-stone-400 font-medium">No Image</span>
        )}
      </div>

      {/* Info Ringkas Produk (Kode & Motif) */}
      <div className="flex flex-col justify-center min-w-[120px]">
        <span className="text-[10px] text-stone-400 font-medium">Kode Produksi</span>
        <span className="text-xs font-bold text-stone-800">{item.kode_produk || '-'}</span>
        <span className="text-[10px] text-stone-500 font-medium mt-0.5 truncate max-w-[150px]">
          {item.motif?.nama || '-'}
        </span>
      </div>

      {/* Input Form Fields */}
      <div className="grid flex-1 grid-cols-2 gap-3 text-xs sm:grid-cols-5">
        
        {/* Lebar Kain */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-stone-500">Lebar Kain</label>
          <select
            value={item.lebar || ''}
            onChange={(e) => onUpdateField(index, 'lebar', e.target.value)}
            className="w-full h-8 px-2 text-black bg-[#EBF9FB] rounded-lg outline-none cursor-pointer font-medium text-xs"
          >
            <option value="">Pilih</option>
            <option value="110">Lebar 110 cm</option>
            <option value="70">Lebar 70 cm</option>
          </select>
        </div>

        {/* Jenis Pewarna */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-stone-500">Pewarna</label>
          <select
            value={currentPewarna}
            onChange={(e) => onUpdateField(index, 'jenis_pewarna', e.target.value)}
            className="w-full h-8 px-2 text-black capitalize bg-[#EBF9FB] rounded-lg outline-none cursor-pointer font-medium text-xs"
          >
            {!currentPewarna && <option value="">Pilih Pewarna</option>}
            <option value="sintetis">Sintetis</option>
            <option value="alami">Alami</option>
          </select>
        </div>

        {/* Panjang (Meter) */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-stone-500">Panjang Kain (m)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={item.panjang || ''}
            onChange={(e) => onUpdateField(index, 'panjang', parseFloat(e.target.value) || 0)}
            className="w-full h-8 px-2 text-black bg-[#EBF9FB] rounded-lg outline-none font-medium text-xs"
          />
        </div>

        {/* Qty (Jumlah) */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-stone-500">Harga</label>
          <input
            type="number"
            min="1"
            value={item.jumlah || item.qty || 1}
            onChange={(e) => onUpdateField(index, 'qty', parseInt(e.target.value) || 1)}
            className="w-full h-8 px-2 text-black bg-[#EBF9FB] rounded-lg outline-none font-medium text-xs"
          />
        </div>

        {/* Subtotal */}
        <div className="col-span-2 space-y-1 sm:col-span-1">
          <label className="text-[10px] font-bold text-stone-500">Subtotal</label>
          <div className="flex items-center h-8 text-xs font-bold text-stone-800">
            Rp {(parseFloat(item.totalHargaItem) || parseFloat(item.subtotal) || 0).toLocaleString('id-ID')}
          </div>
        </div>

      </div>

    </div>
  )
}