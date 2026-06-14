'use client';

import React from 'react';
import { Minus, Plus, X, Upload } from 'lucide-react';

export default function ProductItemRow({ 
  item, 
  daftarHarga, 
  updateItem, 
  removeItem, 
  handleImageChange, 
  calculateTotal,
  canRemove 
}) {
  return (
    <div className="relative border border-black bg-[#5AE3ED1C] rounded-[12px] p-4 flex flex-col md:flex-row gap-4 items-center w-full font-inter">
      
      {/* Tombol Hapus */}
      {canRemove && (
        <button 
          type="button"
          onClick={() => removeItem(item.id)} 
          className="absolute text-black transition-colors top-2 right-2 hover:text-rose-600"
        >
          <X size={16} strokeWidth={2.5} />
        </button>
      )}

      {/* Box Upload */}
      <label className="flex flex-col items-center justify-center h-[90px] w-[140px] border border-dashed border-black bg-transparent rounded-[10px] cursor-pointer hover:bg-black/10 overflow-hidden relative flex-shrink-0 transition-colors">
        {item.image ? (
          <img src={item.image} alt="Sketsa" className="object-cover w-full h-full" />
        ) : (
          <div className="flex flex-col items-center justify-center text-black">
            <Upload size={18} strokeWidth={2} />
            <span className="text-[9px] mt-1 text-center font-bold">Upload Photo</span>
          </div>
        )}
        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(item.id, e)} />
      </label>

      {/* Container Input (Menggunakan flex agar lebih fleksibel) */}
      <div className="grid items-end flex-1 w-full grid-cols-2 gap-3 text-black md:grid-cols-5">
        
        {/* Lebar */}
        <div className="flex flex-col space-y-1">
          <label className="text-[10px] font-bold">Lebar Kain</label>
          <select 
            className="h-[34px] w-full px-2 bg-[#F1E9E987] border border-black rounded-[8px] font-bold text-[11px] outline-none cursor-pointer" 
            value={item.lebar} 
            onChange={(e) => updateItem(item.id, "lebar", e.target.value)}
          >
            <option value="">Pilih</option>
            {[...new Set(daftarHarga.map((d) => String(d.lebar)))].map((l) => (
              <option key={l} value={l}>Lebar {l} cm</option>
            ))}
          </select>
        </div>

        {/* Pewarna (unik, difilter berdasarkan lebar) */}
        <div className="flex flex-col space-y-1">
          <label className="text-[10px] font-bold">Pilih Pewarna</label>
          <select 
            className="h-[34px] w-full px-2 bg-[#F1E9E987] border border-black rounded-[8px] font-bold text-[11px] outline-none cursor-pointer" 
            value={item.jenis_pewarna} 
            onChange={(e) => updateItem(item.id, "jenis_pewarna", e.target.value)}
          >
            <option value="">Pilih</option>
            {[...new Set(
              daftarHarga
                .filter((d) => String(d.lebar) === String(item.lebar))
                .map((d) => d.jenis_pewarna)
            )].map((pewarna) => (
              <option key={pewarna} value={pewarna}>{pewarna}</option>
            ))}
          </select>
        </div>

        {/* Jumlah */}
        <div className="flex flex-col space-y-1">
          <label className="text-[10px] font-bold">Jumlah</label>
          <div className="flex items-center border border-black bg-[#F1E9E987] rounded-[8px] h-[34px] w-full overflow-hidden">
            <button type="button" onClick={() => updateItem(item.id, "qty", Math.max(1, item.qty - 1))} className="flex items-center justify-center h-full px-2 font-bold cursor-pointer">
              <Minus size={10} />
            </button>
            <span className="flex-1 text-center font-bold text-[11px]">{item.qty}</span>
            <button type="button" onClick={() => updateItem(item.id, "qty", item.qty + 1)} className="flex items-center justify-center h-full px-2 font-bold cursor-pointer">
              <Plus size={10} />
            </button>
          </div>
        </div>

        {/* Panjang */}
        <div className="flex flex-col space-y-1">
          <label className="text-[10px] font-bold">Panjang (m)</label>
          <input 
            type="number"
            min="0"
            name="panjang-item-poc"
            autoComplete="off"
            data-lpignore="true"
            value={item.panjang} 
            className="h-[34px] w-full px-2 bg-[#F1E9E987] border border-black rounded-[8px] font-bold text-[11px] outline-none" 
            onChange={(e) => updateItem(item.id, "panjang", e.target.value)} 
          />
        </div>

        {/* Harga */}
        <div className="flex flex-col justify-center space-y-1 md:items-center">
          <label className="text-[10px] font-bold">Harga</label>
          <span className="font-black text-[13px] pt-1">
            Rp {calculateTotal(item).toLocaleString('id-ID')}
          </span>
        </div>

      </div>
    </div>
  );
}