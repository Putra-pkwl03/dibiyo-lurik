import React from "react";
import { Box, Plus, Minus, Trash2, Upload } from "lucide-react";

export default function ProductSection({
  items,
  setItems,
  daftarHarga,
  updateItem,
  handleImageUpload,
  hitungSubtotalItem,
  itemKosong,
  isOriginallyLunas,
  statusPembayaran,
  labelStyle,
  inputWhiteStyle,
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b pb-1">
        <div className="flex items-center gap-2 text-xs font-bold text-black">
          <Box size={14} className="text-[#1A335A]" />
          <span>Data Produk Custom</span>
        </div>
        <button
          type="button"
          onClick={() => setItems((prev) => [...prev, itemKosong()])}
          className="flex items-center gap-1 text-[10px] bg-[#1A335A] text-white px-3 py-1 rounded hover:bg-[#11223C] transition-all cursor-pointer"
        >
          <Plus size={12} /> Tambah Item Baru
        </button>
      </div>

      {items.map((prodItem) => (
        <div
          key={prodItem.id}
          className={`flex flex-row items-center gap-4 border rounded-xl p-4 relative group ${
            prodItem.isFromDb ? "bg-[#5AE3ED1C] border-dashed border-[#1A335A]" : "bg-emerald-50/60 border-dashed border-emerald-400"
          }`}
        >
          {/* Badge item baru */}
          {!prodItem.isFromDb && (
            <span className="absolute -top-2 left-3 bg-emerald-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full shadow-sm uppercase tracking-wide">
              Item Baru
            </span>
          )}

          {/* Uploader Box */}
          <div className="w-48 h-20 flex-shrink-0">
            {prodItem.image ? (
              <div className="relative w-full h-full rounded-lg border bg-white flex items-center justify-center overflow-hidden">
                <img src={prodItem.image} alt="Custom item" className="object-cover w-full h-full" />
                <label className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white cursor-pointer transition-opacity">
                  <Upload size={14} />
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(prodItem.id, e)} className="hidden" />
                </label>
              </div>
            ) : (
              <label className="w-full h-full border border-dashed border-[#1A335A] rounded-lg bg-white flex flex-col items-center justify-center cursor-pointer text-center p-1">
                <Upload size={14} className="text-[#1A335A] mb-0.5" />
                <span className="text-[#1A335A]/60 text-[8.5px] leading-tight px-1">Klik untuk upload gambar</span>
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(prodItem.id, e)} className="hidden" />
              </label>
            )}
          </div>

          {/* Fields */}
          <div className="flex flex-1 flex-row items-end gap-3 text-[11px]">
            <div className="flex-1 min-w-[120px]">
              <label className={labelStyle}>Lebar Kain</label>
              <select
                value={prodItem.lebar}
                onChange={(e) => updateItem(prodItem.id, "lebar", e.target.value)}
                className={`${inputWhiteStyle} cursor-pointer`}
              >
                <option value="">Pilih Lebar</option>
                {[...new Set(daftarHarga.map((d) => String(d.lebar)))].map((lbl) => (
                  <option key={lbl} value={lbl}>Lebar : {lbl} cm</option>
                ))}
              </select>
            </div>

            <div className="flex items-center border border-[#1A335A] rounded-md bg-white h-8 overflow-hidden flex-shrink-0">
              <button
                type="button"
                onClick={() => updateItem(prodItem.id, "qty", Math.max(1, prodItem.qty - 1))}
                className="px-2 text-[#1A335A] hover:bg-gray-100 h-full cursor-pointer"
              >
                <Minus size={10} strokeWidth={3} />
              </button>
              <span className="px-3 font-bold text-gray-800 text-xs min-w-[20px] text-center">{prodItem.qty}</span>
              <button
                type="button"
                onClick={() => updateItem(prodItem.id, "qty", prodItem.qty + 1)}
                className="px-2 text-[#1A335A] hover:bg-gray-100 h-full cursor-pointer"
              >
                <Plus size={10} strokeWidth={3} />
              </button>
            </div>

            <div className="flex-1 min-w-[110px]">
              <label className={labelStyle}>Pilih Pewarna</label>
              <select
                value={prodItem.jenis_pewarna}
                onChange={(e) => updateItem(prodItem.id, "jenis_pewarna", e.target.value)}
                className={`${inputWhiteStyle} capitalize cursor-pointer`}
              >
                <option value="">Pilih</option>
                {[...new Set(daftarHarga.filter((d) => String(d.lebar) === String(prodItem.lebar)).map((o) => o.jenis_pewarna?.trim().toLowerCase()).filter(Boolean))].map((pw) => (
                  <option key={pw} value={pw}>{pw}</option>
                ))}
              </select>
            </div>

            <div className="w-16 flex-shrink-0">
              <label className={`${labelStyle} text-center`}>Panjang</label>
              <input
                type="number"
                min="0"
                placeholder="Meter"
                value={prodItem.panjang || ""}
                onChange={(e) => updateItem(prodItem.id, "panjang", e.target.value)}
                className={`${inputWhiteStyle} text-center`}
              />
            </div>

            <div className="w-28 flex-shrink-0">
              <label className={`${labelStyle} text-center`}>Subtotal Harga</label>
              <div className="w-full border border-[#1A335A]/30 bg-white rounded-md p-1.5 text-center font-bold text-gray-800 text-xs shadow-sm">
                Rp {hitungSubtotalItem(prodItem).toLocaleString("id-ID")}
              </div>
            </div>
          </div>

          {/* Proteksi hapus */}
          {items.length > 1 && (!prodItem.isFromDb || (!isOriginallyLunas && statusPembayaran !== "lunas")) && (
            <button
              type="button"
              onClick={() => setItems((prev) => prev.filter((i) => i.id !== prodItem.id))}
              className="absolute -top-1.5 -right-1.5 bg-red-100 text-red-600 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm cursor-pointer"
            >
              <Trash2 size={11} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}