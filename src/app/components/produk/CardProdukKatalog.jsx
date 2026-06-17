"use client";

import React from "react";
import { motion } from "framer-motion";
import { Layers, ShoppingBag } from "lucide-react";

export default function CardProdukKatalog({ 
  product, 
  formatRupiah, 
  onBuyClick, 
  onKombinasiClick 
}) {
  if (!product) return null;

  const totalStokSisa = product.gulungan?.reduce((acc, curr) => acc + (curr.panjang_sisa || 0), 0) || 0;
  const daftarHarga = product.gulungan?.map(g => g.harga || g.harga_per_meter).filter(Boolean) || [];
  const hargaTermurah = daftarHarga.length > 0 ? Math.min(...daftarHarga) : 0;

  const namaKategori = typeof product.kategori === 'object' ? product.kategori?.nama : (product.kategori || "Kain");
  const kodeProduk = typeof product.kode_produk === 'object' ? product.kode_produk?.nama : (product.kode_produk || "-");
  const namaMotif = typeof product.motif === 'object' ? product.motif?.nama : (product.motif || "Polos");
  const productTitle = `Lurik ${namaMotif}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="bg-white border border-[#EBE7E0] rounded-2xl overflow-hidden shadow-sm group flex flex-col h-full hover:border-[#C49A6C]/40 hover:shadow-md transition-all duration-300"
    >
      {/* ─── VISUAL GAMBAR PRODUK ─── */}
      <div className="w-full aspect-[4/3] bg-[#F5F1E9] relative flex items-center justify-center overflow-hidden">
        <span className="absolute top-3 left-3 text-[9px] font-bold tracking-widest bg-[#3E3431]/90 text-[#F5F1E9] px-2 py-1 rounded shadow-sm uppercase z-10">
          {totalStokSisa > 0 ? `Tersedia: ${totalStokSisa} m` : "Stok Habis"}
        </span>

        {product.gambar_url ? (
          <img
            src={product.gambar_url}
            alt={productTitle}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#F5F1E9] to-[#EBE7E0]">
            <span className="text-2xl opacity-60">🧵</span>
            <span className="text-[10px] text-[#706965] mt-2 tracking-widest">{kodeProduk}</span>
          </div>
        )}
      </div>

      {/* ─── DETAIL INFORMASI PRODUK ─── */}
      <div className="flex flex-col justify-between flex-1 p-5 space-y-4">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] font-bold tracking-wider uppercase text-[#706965]">
            <span>{namaKategori}</span>
            <span className="font-mono text-[#B08354]">{kodeProduk}</span>
          </div>

          <h3 className="font-bold text-base text-[#3E3431] line-clamp-1 group-hover:text-[#B08354] transition-colors">
            {productTitle}
          </h3>

          <div className="flex items-center justify-between pt-1">
            <p className="text-sm text-[#B08354] font-bold">
              {formatRupiah ? formatRupiah(hargaTermurah) : `Rp ${hargaTermurah.toLocaleString("id-ID")}`} 
              <span className="text-[#706965]/70 font-light text-[11px]"> / meter</span>
            </p>
            <span className="text-[10px] text-[#706965] font-medium bg-[#F5F1E9] px-2 py-0.5 rounded capitalize">
              {product.jenis_pewarna ? `${product.jenis_pewarna}` : "ATBM"}
            </span>
          </div>
        </div>

        {/* ─── 🛠️ REVISI STYLE TOMBOL: TEGAS, BOLD, DAN PENUH SESUAI REFERENSI ─── */}
        <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-[#EBE7E0]">
          
          {/* Button 1: Kombinasi (Gaya Border Outline Minimalis namun Tegas) */}
          <button
            type="button"
            onClick={() => onKombinasiClick && onKombinasiClick(product)}
            className="flex items-center justify-center gap-1.5 py-3 px-3 bg-white border-2 border-[#3E3431] hover:border-[#C49A6C] text-xs font-extrabold tracking-wide text-[#3E3431] hover:text-[#B08354] hover:bg-[#C49A6C]/5 rounded-xl transition-all duration-300 shadow-sm"
          >
            <Layers size={13} className="stroke-[2.5]" />
            Kombinasi
          </button>

          {/* Button 2: Beli Kain (Gaya Solid Arang Pekat Bold Sesuai Referensi Gambar) */}
          <button
            type="button"
            onClick={() => onBuyClick && onBuyClick(product)}
            className="flex items-center justify-center gap-1.5 py-3 px-3 bg-[#3E3431] border border-transparent hover:bg-[#C49A6C] text-xs font-extrabold tracking-wide text-white rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <ShoppingBag size={13} className="stroke-[2.5]" />
            Beli Kain
          </button>

        </div>
      </div>
    </motion.div>
  );
}