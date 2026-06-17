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
      className="bg-[#F5F2EB]/70 border border-[#2D2219]/5 rounded-2xl overflow-hidden shadow-md hover:shadow-xl group flex flex-col h-full transition-all duration-300 transform hover:-translate-y-1"
    >
      {/* ─── VISUAL GAMBAR PRODUK ─── */}
      <div className="w-full aspect-[4/3] bg-[#EFEBE3] relative flex items-center justify-center overflow-hidden">
        <span
          className={`absolute top-3 left-3 text-[9px] font-bold tracking-widest px-2 py-1 rounded shadow-sm uppercase z-10 text-white ${
            totalStokSisa > 0 ? "bg-[#D48C45]" : "bg-[#6E655C]"
          }`}
        >
          {totalStokSisa > 0 ? `Tersedia: ${totalStokSisa} m` : "Stok Habis"}
        </span>

        {product.gambar_url ? (
          <img
            src={product.gambar_url}
            alt={productTitle}
            className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#E5E1D7] to-[#D8D3C5]">
            <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#2D2219_1px,transparent_1px)] bg-[size:6px]"></div>
            <span className="text-2xl opacity-30">🧵</span>
            <span className="text-[10px] text-[#6E655C] mt-2 tracking-widest font-mono">{kodeProduk}</span>
          </div>
        )}
      </div>

      {/* ─── DETAIL INFORMASI PRODUK ─── */}
      <div className="flex flex-col justify-between flex-1 p-5 space-y-4">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] font-bold tracking-wider uppercase text-[#6E655C]">
            <span>{namaKategori}</span>
            <span className="font-mono text-[#A67D45]">{kodeProduk}</span>
          </div>

          <h3 className="font-bold text-base text-[#2D2219] tracking-tight line-clamp-1 group-hover:text-[#A67D45] transition-colors">
            {productTitle}
          </h3>

          <div className="flex items-center justify-between pt-0.5">
            <p className="text-sm text-[#A67D45] font-bold">
              {formatRupiah ? formatRupiah(hargaTermurah) : `Rp ${hargaTermurah.toLocaleString("id-ID")}`}
              <span className="text-[#6E655C]/70 font-light text-xs"> / meter</span>
            </p>
            <span className="text-[10px] font-medium text-[#6E655C] bg-[#2D2219]/5 px-2.5 py-0.5 rounded-md border border-[#2D2219]/5 capitalize">
              {product.jenis_pewarna ? `${product.jenis_pewarna}` : "ATBM"}
            </span>
          </div>
        </div>

        {/* ─── TOMBOL AKSI: KOMBINASI + BELI KAIN ─── */}
        <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-[#2D2219]/10">

          {/* Kombinasi: outline, warna ikut palet home */}
          <button
            type="button"
            onClick={() => onKombinasiClick && onKombinasiClick(product)}
            className="flex items-center justify-center gap-1.5 py-3 px-3 bg-white/50 border-2 border-[#2D2219]/15 hover:border-[#A67D45] text-xs font-bold tracking-wide text-[#2D2219] hover:text-[#A67D45] hover:bg-[#A67D45]/5 rounded-xl transition-all duration-300"
          >
            <Layers size={13} className="stroke-[2.5]" />
            Kombinasi
          </button>

          {/* Beli Kain: solid, warna disamakan dengan tombol Beli di card home */}
          <button
            type="button"
            onClick={() => onBuyClick && onBuyClick(product)}
            className="flex items-center justify-center gap-1.5 py-3 px-3 bg-[#9e6d3c79] hover:bg-[#C59B5F] border border-transparent text-xs font-bold tracking-wide text-white rounded-xl shadow-sm transition-all duration-300"
          >
            <ShoppingBag size={13} className="stroke-[2.5]" />
            Beli
          </button>

        </div>
      </div>
    </motion.div>
  );
}