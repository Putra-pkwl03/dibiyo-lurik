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
  // Safe Guard jika data produk dari parent belum termuat
  if (!product) return null;

  // Akumulasi total sisa kain dari seluruh gulungan yang tersedia
  const totalStokSisa = product.gulungan?.reduce((acc, curr) => acc + (curr.panjang_sisa || 0), 0) || 0;
  
  // Ambil rentang harga termurah untuk penampilan awal di katalog
  const daftarHarga = product.gulungan?.map(g => g.harga || g.harga_per_meter).filter(Boolean) || [];
  const hargaTermurah = daftarHarga.length > 0 ? Math.min(...daftarHarga) : 0;

  // Normalisasi parsing data objek/string data teks
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
      className="bg-[#1A1917] border border-[#E5BA73]/5 rounded-2xl overflow-hidden shadow-lg group flex flex-col h-full hover:border-[#E5BA73]/20 transition-all duration-300"
    >
      {/* ─── VISUAL GAMBAR PRODUK (SAMA DENGAN CATALOG.JSX) ─── */}
      <div className="w-full aspect-[4/3] bg-[#12110F] relative flex items-center justify-center overflow-hidden">
        {/* Badge Ketersediaan Akumulasi Sisa Meteran */}
        <span className="absolute top-3 left-3 text-[9px] font-bold tracking-widest bg-[#12110F]/80 text-[#E5BA73] px-2 py-1 rounded border border-[#E5BA73]/20 uppercase z-10">
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
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#1E293B] to-[#0F172A]">
            <span className="text-2xl opacity-40">🧵</span>
            <span className="text-[10px] text-[#A3A19E] mt-2 tracking-widest">{kodeProduk}</span>
          </div>
        )}
      </div>

      {/* ─── DETAIL INFORMASI PRODUK ─── */}
      <div className="flex flex-col justify-between flex-1 p-5 space-y-4">
        <div className="space-y-1">
          {/* Sub-Header Metadata (Kategori & Kode Produk Sejajar) */}
          <div className="flex items-center justify-between text-[10px] font-bold tracking-wider uppercase text-[#A3A19E]">
            <span>{namaKategori}</span>
            <span className="font-mono text-[#E5BA73]/70">{kodeProduk}</span>
          </div>

          {/* Judul Utama Kain */}
          <h3 className="font-bold text-base text-[#F9F6F0] line-clamp-1 group-hover:text-[#E5BA73] transition-colors">
            {productTitle}
          </h3>

          {/* Info Harga Per Meter & Jenis Pewarnaan */}
          <div className="flex items-center justify-between pt-1">
            <p className="text-xs text-[#E5BA73] font-semibold">
              {formatRupiah ? formatRupiah(hargaTermurah) : `Rp ${hargaTermurah.toLocaleString("id-ID")}`} 
              <span className="text-[#A3A19E]/60 font-light text-[11px]"> / meter</span>
            </p>
            <span className="text-[10px] text-[#706E6B] capitalize">
              {product.jenis_pewarna ? `${product.jenis_pewarna}` : "ATBM"}
            </span>
          </div>
        </div>

        {/* ─── TOMBOL AKSI UTAMA DI FOOTER ─── */}
        <div className="grid grid-cols-2 gap-2 mt-auto pt-2 border-t border-white/5">
          {/* Button 1: Kombinasi (Padu Padan Desain Ke Store/Page) */}
          <button
            type="button"
            onClick={() => onKombinasiClick && onKombinasiClick(product)}
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white/[0.02] border border-[#A3A19E]/10 hover:border-[#E5BA73]/40 text-[11px] font-bold tracking-wide text-[#A3A19E] hover:text-[#E5BA73] hover:bg-[#E5BA73]/5 rounded-lg transition-all duration-300"
          >
            <Layers size={12} />
            Kombinasi
          </button>

          {/* Button 2: Beli Kain (Membuka Multi-Select Modal dari Parent) */}
          <button
            type="button"
            onClick={() => onBuyClick && onBuyClick(product)}
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-transparent border border-[#E5BA73]/20 hover:border-[#E5BA73] hover:bg-[#E5BA73] text-[11px] font-bold tracking-wide text-[#E5BA73] hover:text-[#12110F] rounded-lg transition-all duration-300"
          >
            <ShoppingBag size={12} />
            Beli Kain
          </button>
        </div>
      </div>
    </motion.div>
  );
}