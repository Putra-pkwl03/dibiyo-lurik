'use client';

import React from "react";
import { Box, Plus, Minus, Trash2, Upload } from "lucide-react";

export default function ProductItemsSection({
  items,
  setItems,
  daftarHarga,
  updateItem,
  handleImageUpload,
  hitungSubtotalItem,
  itemKosong,
  isOriginallyLunas,
  pembayaran
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-1 border-b">
        <div className="flex items-center gap-2 text-xs font-bold text-black">
          <Box size={14} className="text-[#1A335A]" />
          <span>Data Produk Custom</span>
        </div>
        {/* Tombol Tambah Item Baru Sudah Dihapus dari Sini */}
      </div>

      {items.map((prodItem) => (
        <div
          key={prodItem.id}
          className={`flex flex-row items-center gap-4 border rounded-xl p-4 relative group transition-all ${
            prodItem.isFromDb
              ? "bg-[#5AE3ED1C]/40 border-dashed border-[#1A335A]/40"
              : "bg-emerald-50/40 border-dashed border-emerald-300"
          }`}
        >
          {/* Badge item baru */}
          {!prodItem.isFromDb && (
            <span className="absolute -top-2 left-3 bg-emerald-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full shadow-sm uppercase tracking-wide">
              Item Baru
            </span>
          )}

          {/* Uploader Box */}
          <div className="w-48 h-20 flex-shrink-0 text-[11px]">
            {prodItem.image ? (
              <div className="relative flex items-center justify-center w-full h-full overflow-hidden bg-white border rounded-lg shadow-sm border-stone-200">
                <img src={prodItem.image} alt="Custom item" className="object-cover w-full h-full" />
                <label className="absolute inset-0 flex items-center justify-center text-white transition-opacity opacity-0 cursor-pointer bg-black/40 group-hover:opacity-100">
                  <Upload size={14} />
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(prodItem.id, e)} className="hidden" />
                </label>
              </div>
            ) : (
              <label className="w-full h-full border border-dashed border-stone-300 rounded-lg bg-white flex flex-col items-center justify-center cursor-pointer text-center p-1 hover:border-[#1A335A] transition-colors shadow-sm">
                <Upload size={14} className="text-[#1A335A] mb-0.5" />
                <span className="text-[#1A335A]/70 text-[8.5px] font-semibold leading-tight px-1">Klik untuk upload gambar</span>
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(prodItem.id, e)} className="hidden" />
              </label>
            )}
          </div>

          {/* Fields Inputs */}
          <div className="flex flex-1 flex-row items-end gap-3 text-[11px]">
            <div className="flex-1 min-w-[120px]">
              <label className="block mb-1 font-medium text-black">Lebar Kain</label>
              <select
                value={prodItem.lebar}
                onChange={(e) => updateItem(prodItem.id, "lebar", e.target.value)}
                className="w-full border border-[#1A335A]/20 rounded-lg bg-[#EBF9FB] p-1.5 focus:outline-none font-medium cursor-pointer"
              >
                <option value="">Pilih Lebar</option>
                {[...new Set(daftarHarga.map((d) => String(d.lebar)))].map((lbl) => (
                  <option key={lbl} value={lbl}>Lebar : {lbl} cm</option>
                ))}
              </select>
            </div>

            <div className="flex items-center flex-shrink-0 h-8 overflow-hidden bg-white border rounded-lg shadow-sm border-stone-300">
              <button
                type="button"
                onClick={() => updateItem(prodItem.id, "qty", Math.max(1, prodItem.qty - 1))}
                className="px-2 text-[#1A335A] hover:bg-stone-50 h-full cursor-pointer"
              >
                <Minus size={10} strokeWidth={3} />
              </button>
              <span className="px-2 font-bold text-gray-800 text-xs min-w-[20px] text-center">{prodItem.qty}</span>
              <button
                type="button"
                onClick={() => updateItem(prodItem.id, "qty", prodItem.qty + 1)}
                className="px-2 text-[#1A335A] hover:bg-stone-50 h-full cursor-pointer"
              >
                <Plus size={10} strokeWidth={3} />
              </button>
            </div>

            <div className="flex-1 min-w-[110px]">
              <label className="block mb-1 font-medium text-black">Pilih Pewarna</label>
              <select
                value={prodItem.jenis_pewarna}
                onChange={(e) => updateItem(prodItem.id, "jenis_pewarna", e.target.value)}
                className="w-full border border-[#1A335A]/20 rounded-lg bg-[#EBF9FB] p-1.5 focus:outline-none font-medium capitalize cursor-pointer"
              >
                <option value="">Pilih</option>
                {[...new Set(daftarHarga.filter((d) => String(d.lebar) === String(prodItem.lebar)).map((o) => o.jenis_pewarna?.trim().toLowerCase()).filter(Boolean))].map((pw) => (
                  <option key={pw} value={pw}>{pw}</option>
                ))}
              </select>
            </div>

            <div className="flex-shrink-0 w-16">
              <label className="block mb-1 font-medium text-center text-black">Panjang</label>
              <input
                type="number"
                min="0"
                placeholder="Meter"
                value={prodItem.panjang || ""}
                onChange={(e) => updateItem(prodItem.id, "panjang", e.target.value)}
                className="w-full border border-[#1A335A]/20 rounded-lg bg-[#EBF9FB] p-1.5 focus:outline-none font-bold text-center text-stone-800"
              />
            </div>

            <div className="flex-shrink-0 w-28">
              <label className="block mb-1 font-medium text-center text-black">Subtotal Harga</label>
              <div className="w-full border border-[#1A335A]/20 bg-white rounded-lg p-1.5 text-center font-bold text-[#1A335A] text-xs shadow-sm">
                Rp {hitungSubtotalItem(prodItem).toLocaleString("id-ID")}
              </div>
            </div>
          </div>

          {/* Tombol Hapus Row Item */}
          {items.length > 1 && (!prodItem.isFromDb || (!isOriginallyLunas && pembayaran.status_pembayaran !== "lunas")) && (
            <button
              type="button"
              onClick={() => setItems((prev) => prev.filter((i) => i.id !== prodItem.id))}
              className="absolute -top-1.5 -right-1.5 bg-red-50 text-red-600 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity border border-red-200 shadow-md cursor-pointer hover:bg-red-100"
            >
              <Trash2 size={11} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}