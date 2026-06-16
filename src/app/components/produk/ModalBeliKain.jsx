"use client";

import React, { useEffect, useState } from "react";
import { useCart } from "@/app/context/CartContext"; 
import { useRouter } from "next/navigation"; 
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";

const formatRupiah = (angka) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(angka);
};

export default function ModalBeliKain({ isOpen, onClose, product, onConfirm }) {
  const router = useRouter();
  const { addToCart } = useCart();

  // State kuantitas berbentuk pasangan key-value: { [gulunganId]: kuantitas }
  const [selectedRolls, setSelectedRolls] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isCrumpling, setIsCrumpling] = useState(false);

  useEffect(() => {
    if (!isOpen || !product) return;
    setSelectedRolls({}); // Reset pilihan setiap modal dibuka baru
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const productTitle = product.nama ?? "Lurik Premium";
  const gulunganList = product.gulungan ?? [];

  // Toggle pilihan gulungan (jika baru dipilih, set default ke 0 meter)
  const handleToggleRoll = (rollId) => {
    setSelectedRolls(prev => {
      const next = { ...prev };
      if (next[rollId] !== undefined) {
        delete next[rollId];
      } else {
        next[rollId] = 0;
      }
      return next;
    });
  };

  // Ubah kuantitas meteran per Gulungan ID
  const handleUpdateQty = (rollId, amount, maxStock) => {
    setSelectedRolls(prev => ({
      ...prev,
      [rollId]: Math.min(maxStock, Math.max(0, (prev[rollId] ?? 0) + amount))
    }));
  };

  // Kalkulasi total meter dan total harga kumulatif
  const totalQty = Object.values(selectedRolls).reduce((sum, q) => sum + q, 0);
  const totalHarga = gulunganList.reduce((sum, g) => {
    const qty = selectedRolls[g.id] || 0;
    const harga = g.harga_per_meter ?? g.harga ?? product.harga ?? 0;
    return sum + (qty * harga);
  }, 0);

  // Animasi Crumple (Meremas & Terbang)
  const modalVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: { scale: 1, opacity: 1, x: 0, y: 0, rotate: 0, borderRadius: "16px", transition: { type: "spring", duration: 0.5 } },
    crumpleAndFly: {
      scale: [1, 0.7, 0.4, 0.15, 0],
      borderRadius: ["16px", "24px", "60px", "100px", "100px"],
      rotate: [0, -35, 75, -360, -720], 
      x: [0, 20, -15, 350, 680], 
      y: [0, -10, 30, -160, -380], 
      opacity: [1, 1, 0.9, 0.7, 0],
      transition: { duration: 0.9, ease: "easeInOut" }
    }
  };

  // Jalur Aksi: Masukkan ke Keranjang Belanja
  const handleAddToCart = async () => {
    if (totalQty <= 0) return;
    setIsLoading(true);
    try {
      for (const g of gulunganList) {
        const qty = selectedRolls[g.id];
        if (qty && qty > 0 && addToCart) {
          await addToCart(product, g, qty);
        }
      }
      
      window.dispatchEvent(new CustomEvent("updateCartCount", { detail: { itemCount: 1 } }));
      setIsCrumpling(true);
      
      setTimeout(() => {
        if (onConfirm) onConfirm(1);
        setIsCrumpling(false);
        onClose();
        router.refresh();
      }, 900);
    } catch (error) {
      console.error(error);
      Swal.fire({ title: 'Oops!', text: 'Gagal masuk keranjang.', icon: 'error', background: '#1A1917', color: '#F9F6F0' });
    } finally {
      setIsLoading(false);
    }
  };

  // Jalur Aksi: Konsultasi via WhatsApp (Selalu Aktif)
  const handleWhatsAppChat = () => {
    let pesan = "";
    if (totalQty > 0) {
      const rincian = gulunganList
        .filter(g => selectedRolls[g.id] > 0)
        .map(g => `Gulungan No. ${g.nomor_gulungan} (Lebar ${g.lebar_kain ?? g.lebar ?? product.lebar ?? '—'}cm) sepotong ${selectedRolls[g.id]}m`)
        .join(", ");
      pesan = `Halo Biyo Lurik, saya tertarik memesan "${productTitle}" dengan rincian: ${rincian}. Total Estimasi: ${formatRupiah(totalHarga)}`;
    } else {
      pesan = `Halo Biyo Lurik, saya tertarik dengan kain produk "${productTitle}" dan ingin berkonsultasi mengenai ketersediaan gulungannya.`;
    }
    window.open(`https://wa.me/6281234567890?text=${encodeURIComponent(pesan)}`, "_blank");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate={isCrumpling ? "crumpleAndFly" : "visible"}
          exit="hidden"
          className="w-full max-w-2xl text-[#F9F6F0] bg-[#1A1917] border border-[#E5BA73]/25 shadow-2xl rounded-2xl overflow-hidden relative will-change-transform"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5BA73]/10 bg-[#12110F]/50">
            <h3 className="text-sm font-bold text-[#E5BA73] tracking-wide">Pilih Gulungan Kain</h3>
            <button onClick={onClose} disabled={isCrumpling} className="text-[#A3A19E] hover:text-[#E5BA73]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* Banner Info Utama Produk */}
          <div className="p-5 pb-2">
            <div className="flex items-center gap-4 p-4 bg-[#0A1715] rounded-xl border border-[#E5BA73]/10 text-xs">
              <div className="w-14 h-14 rounded-lg bg-[#252220] border border-[#E5BA73]/15 flex items-center justify-center overflow-hidden shrink-0">
                {product.gambar_url ? <img src={product.gambar_url} alt={productTitle} className="object-cover w-full h-full" /> : <span className="text-[#E5BA73]/30 text-xl">◈</span>}
              </div>
              <div>
                <span className="text-[9px] font-bold text-[#E5BA73] uppercase bg-[#E5BA73]/5 px-2 py-0.5 rounded-full border border-[#E5BA73]/10">{product.kategori?.nama ?? product.kategori ?? "Lurik"}</span>
                <h2 className="text-sm font-bold text-[#F9F6F0] mt-0.5">{productTitle}</h2>
                <p className="text-[11px] text-[#706E6B]">Kode: {product.kode_produk?.nama ?? product.kode_produk ?? "—"} · Motif: {product.motif?.nama ?? product.motif ?? "—"}</p>
              </div>
            </div>
          </div>

          {/* Konten Utama dengan Custom Scrollbar Tipis */}
          <div className="p-5 pt-2 space-y-4 max-h-[330px] overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-[#E5BA73]/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
            
            {/* Step 1: Grid Pilihan Gulungan + Info Lebar */}
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-[#706E6B] mb-2">Step 1: Pilih Satu atau Beberapa Gulungan Kain</p>
              <div className="grid grid-cols-3 gap-2">
                {gulunganList.map((g) => {
                  const habis = (g.panjang_sisa ?? 0) <= 0;
                  const isSelected = selectedRolls[g.id] !== undefined;
                  const lebarRoll = g.lebar_kain ?? g.lebar ?? product.lebar ?? "—";
                  return (
                    <button
                      key={g.id}
                      type="button"
                      disabled={habis || isCrumpling}
                      onClick={() => handleToggleRoll(g.id)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold transition-all text-left flex flex-col justify-center min-h-[64px] relative overflow-hidden
                        ${habis ? "border-[#3a3835] text-[#4a4845] bg-white/[0.01] cursor-not-allowed" : isSelected ? "border-[#E5BA73] bg-[#E5BA73]/10 text-[#E5BA73]" : "border-white/5 bg-[#12110F] text-[#A3A19E] hover:border-white/10"}`}
                    >
                      <span className="font-bold">Gulungan {g.nomor_gulungan || '01'}</span>
                      <span className="text-[10px] font-normal opacity-75 mt-0.5">
                        {habis ? "Stok Habis" : `Lebar: ${lebarRoll} cm`}
                      </span>
                      {!habis && <span className="text-[9px] font-normal opacity-50">Sisa: {g.panjang_sisa}m</span>}
                      {isSelected && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E5BA73]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: List Meteran Pembelian Dinamis */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold tracking-widest uppercase text-[#706E6B]">Step 2: Tentukan Panjang Potong (Default 0m)</p>
              
              {Object.keys(selectedRolls).length === 0 ? (
                <div className="text-center py-6 border border-dashed border-white/5 rounded-xl bg-white/[0.01]">
                  <p className="text-xs text-[#706E6B]">Pilih salah satu nomor gulungan di atas untuk mengatur panjang kain</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {gulunganList.filter(g => selectedRolls[g.id] !== undefined).map((g) => {
                    const currentQty = selectedRolls[g.id] ?? 0;
                    const lebarRoll = g.lebar_kain ?? g.lebar ?? product.lebar ?? "—";
                    return (
                      <div key={g.id} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                        <div>
                          <p className="text-xs font-bold text-[#C8C4BC]">Gulungan No. {g.nomor_gulungan} <span className="text-[11px] font-normal text-[#8a8780] ml-1">({lebarRoll} cm)</span></p>
                          <p className="text-[10px] text-[#706E6B]">Batas maksimal: {g.panjang_sisa} meter</p>
                        </div>
                        
                        {/* Selector Meter */}
                        <div className="flex items-center gap-3">
                          <button 
                            type="button" 
                            disabled={currentQty <= 0 || isCrumpling} 
                            onClick={() => handleUpdateQty(g.id, -1, g.panjang_sisa)} 
                            className="w-7 h-7 rounded border border-[#E5BA73]/25 text-[#E5BA73] flex items-center justify-center disabled:opacity-20 text-xs transition-colors hover:bg-[#E5BA73]/5"
                          >
                            −
                          </button>
                          <span className={`text-xs font-bold min-w-[2.5rem] text-center ${currentQty > 0 ? 'text-[#E5BA73]' : 'text-[#706E6B]'}`}>
                            {currentQty} <span className="text-[10px] font-normal opacity-70">m</span>
                          </span>
                          <button 
                            type="button" 
                            disabled={currentQty >= g.panjang_sisa || isCrumpling} 
                            onClick={() => handleUpdateQty(g.id, 1, g.panjang_sisa)} 
                            className="w-7 h-7 rounded border border-[#E5BA73]/25 text-[#E5BA73] flex items-center justify-center disabled:opacity-20 text-xs transition-colors hover:bg-[#E5BA73]/5"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Total Akumulasi Biaya */}
            <div className="flex items-center justify-between bg-[#E5BA73]/5 border border-[#E5BA73]/15 rounded-xl px-4 py-2.5">
              <div>
                <p className="text-[10px] text-[#8a8780] font-medium">Panjang Kumulatif</p>
                <p className="text-xs font-bold text-[#F9F6F0] mt-0.5">{totalQty} meter terpilih</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-[#8a8780] font-medium">Total Estimasi</p>
                <p className="text-base font-bold text-[#E5BA73] mt-0.5">{totalHarga > 0 ? formatRupiah(totalHarga) : "Rp 0"}</p>
              </div>
            </div>

          </div>

          {/* Footer Navigasi & Aksi */}
          <div className="flex gap-2 px-5 py-4 border-t border-white/5 bg-[#12110F]/30">
            {/* Button WhatsApp (Selalu Aktif) */}
            <button
              type="button"
              onClick={handleWhatsAppChat}
              className="flex-1 py-2 rounded-xl border border-white/10 text-xs font-semibold text-[#A3A19E] hover:text-[#E5BA73] bg-white/[0.01] hover:bg-white/[0.03] transition-colors"
            >
              WhatsApp
            </button>

            {/* Button Masukkan Keranjang (Disabled jika total qty masih 0) */}
            <button
              type="button"
              disabled={totalQty <= 0 || isLoading || isCrumpling}
              onClick={handleAddToCart}
              className="flex-[2] py-2 bg-[#E5BA73] text-[#1A1917] text-xs font-bold rounded-xl transition-all disabled:bg-[#2a2825] disabled:text-[#4a4845] disabled:cursor-not-allowed"
            >
              {isLoading ? "Memproses..." : totalQty <= 0 ? "Masukkan Keranjang (0m)" : `Masukkan Keranjang (${totalQty}m)`}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}