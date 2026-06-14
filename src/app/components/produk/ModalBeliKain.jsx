"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Check, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export default function ModalBeliKain({
  isOpen,
  onClose,
  product,
  onConfirm,
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCrumpling, setIsCrumpling] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleSelect = (id, panjangSisa) => {
    if ((panjangSisa ?? 0) <= 0) return;

    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      for (const id of selectedIds) {
        const response = await fetch('/api/keranjang', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gulungan_id: id,
            jumlah_order: 1, 
          }),
        });
        if (!response.ok) throw new Error('Gagal menyimpan item');
      }

      const updateEvent = new CustomEvent("updateCartCount", {
        detail: { count: selectedIds.length }
      });
      window.dispatchEvent(updateEvent);

      // Trigger efek remas kertas
      setIsCrumpling(true);
      
      setTimeout(() => {
        if (onConfirm) onConfirm(selectedIds.length);
        setIsCrumpling(false);
        setSelectedIds([]);
        onClose();
        
        router.refresh(); 
        
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Berhasil dimasukkan ke keranjang',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          background: '#1A1917',
          color: '#F9F6F0',
          iconColor: '#E5BA73'
        });
        
      }, 900);

    } catch (error) {
      console.error("Gagal masuk keranjang:", error);
      setIsCrumpling(false);

      Swal.fire({
        title: 'Gagal!',
        text: 'Terjadi kesalahan saat menambah ke keranjang.',
        icon: 'error',
        background: '#1A1917',
        color: '#F9F6F0',
        confirmButtonColor: '#E5BA73',
        confirmButtonText: 'Coba Lagi'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !mounted || !product) return null;

  const modalVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      borderRadius: "16px",
      x: 0,
      y: 0,
      rotate: 0,
      skewX: 0,
      skewY: 0,
      filter: "blur(0px)",
      transition: { type: "spring", duration: 0.5 }
    },
    crumpleAndFly: {
      scale: [1, 0.7, 0.4, 0.15, 0],
      borderRadius: ["16px", "24px", "60px", "100px", "100px"],
      skewX: [0, 15, -10, 5, 0],
      skewY: [0, -10, 15, -5, 0],
      rotate: [0, -35, 75, -360, -720], 
      x: [0, 20, -15, -350, -680], 
      y: [0, -10, 30, -60, -180], 
      opacity: [1, 1, 0.9, 0.7, 0],
      transition: {
        duration: 0.9, 
        times: [0, 0.2, 0.5, 0.75, 1],
        ease: [
          [0.36, 0.07, 0.19, 0.97], 
          [0.36, 0.07, 0.19, 0.97],
          [0.42, 0, 0.58, 1],       
          [0.25, 1, 0.5, 1]       
        ]
      }
    }
  };

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate={isCrumpling ? "crumpleAndFly" : "visible"}
          exit="hidden"
          className="w-full max-w-4xl text-[#F9F6F0] origin-center bg-[#1A1917] border border-[#E5BA73]/20 shadow-2xl will-change-transform rounded-2xl overflow-hidden font-sans"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#12110F]/50">
            <h3 className="text-base font-bold text-[#E5BA73] tracking-wide">Pilih Gulungan Kain Lurik</h3>
            <button onClick={onClose} className="text-[#A3A19E] transition-colors hover:text-white">
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>

          {/* Product Info Banner dengan Proteksi Object Teks */}
          <div className="p-4 pb-2">
            <div className="flex items-center gap-4 p-3 bg-[#0A1715] rounded-xl border border-[#E5BA73]/10 text-[11px]">
              <img 
                src={product.gambar_url || '/placeholder-kain.jpg'} 
                className="object-cover w-24 border rounded-lg shadow-sm h-14 shrink-0 border-white/5" 
                alt={typeof product.kode_produk === 'object' ? 'Kain' : (product.kode_produk || 'Produk')} 
              />
              <div className="flex flex-col gap-0.5">
                <div>
                  <span className="text-[#A3A19E] font-medium">Kode Produksi: </span>
                  <span className="font-bold text-[#F9F6F0]">
                    {typeof product.kode_produk === 'object' && product.kode_produk !== null
                      ? (product.kode_produk.nama || product.kode_produk.kode || '-') 
                      : (product.kode_produk || '-')}
                  </span>
                </div>
                <div>
                  <span className="text-[#A3A19E] font-medium">Kategori: </span>
                  <span className="font-bold text-[#E5BA73]">
                    {typeof product.kategori === 'object' && product.kategori !== null
                      ? (product.kategori.nama || product.kategori.keterangan || '-') 
                      : (product.kategori || '-')}
                  </span>
                </div>
                <div>
                  <span className="text-[#A3A19E] font-medium">Motif: </span>
                  <span className="font-semibold text-[#F9F6F0]/90">
                    {typeof product.motif === 'object' && product.motif !== null
                      ? (product.motif.nama || product.motif.judul || '-') 
                      : (product.motif || '-')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* List Gulungan */}
          <div className="p-4 pt-2 space-y-3 max-h-[320px] overflow-y-auto chunk-scroll">
            {product.gulungan?.map((g) => {
              const isSelected = selectedIds.includes(g.id);
              const isHabis = (g.panjang_sisa ?? 0) <= 0;

              return (
                <div
                  key={g.id}
                  onClick={() => !isCrumpling && toggleSelect(g.id, g.panjang_sisa)}
                  className={`flex items-center gap-4 p-2.5 border rounded-xl transition-all text-[11px]
                    ${isHabis 
                      ? "bg-white/5 border-white/5 opacity-40 cursor-not-allowed select-none" 
                      : isSelected
                        ? "bg-[#E5BA73]/10 border-[#E5BA73] cursor-pointer shadow-lg shadow-[#E5BA73]/5"
                        : "bg-[#12110F] border-white/5 hover:border-[#E5BA73]/30 cursor-pointer shadow-md"
                    }`}
                >
                  {/* Mini thumbnail */}
                  <img 
                    src={product.gambar_url || '/placeholder-kain.jpg'} 
                    className="object-cover w-12 h-8 border rounded-md shrink-0 border-white/5" 
                    alt="mini-roll" 
                  />

                  {/* Tata Letak Grid 5 Kolom Data */}
                  <div className="grid flex-1 grid-cols-5 font-medium text-left text-[#F9F6F0]/80">
                    <div>
                      <p className="text-[10px] text-[#A3A19E]">No Gulungan</p>
                      <p className={`font-bold mt-0.5 ${isHabis ? "text-[#A3A19E] line-through" : "text-[#F9F6F0]"}`}>
                        {g.nomor_gulungan || '01'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#A3A19E]">Lebar Gulungan</p>
                      <p className="font-bold text-[#F9F6F0] mt-0.5">{g.lebar_kain || g.lebar || '70'} cm</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#A3A19E]">Panjang Total</p>
                      <p className="font-bold text-[#F9F6F0] mt-0.5">{g.panjang_total || '-'} m</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#A3A19E]">Panjang Sisa</p>
                      <p className={`font-bold mt-0.5 ${isHabis ? "text-red-400" : "text-[#E5BA73]"}`}>
                        {isHabis ? "Habis" : `${g.panjang_sisa} m`}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#A3A19E]">Harga Per Meter</p>
                      <p className="font-bold text-[#E5BA73] mt-0.5">
                        Rp {g.harga?.toLocaleString('id-ID') || '0'}
                      </p>
                    </div>
                  </div>

                  {/* Status Checkbox / Lingkaran Centang */}
                  <div className={`flex items-center justify-center w-5 h-5 rounded-full border transition-colors shrink-0
                    ${isHabis 
                      ? "border-white/10 bg-white/5 text-transparent" 
                      : isSelected 
                        ? "bg-[#E5BA73] border-[#E5BA73] text-[#12110F]" 
                        : "border-[#E5BA73]/40 bg-[#12110F] text-transparent"
                    }`}
                  >
                    <Check size={12} strokeWidth={3} className={isSelected && !isHabis ? "block" : "invisible"} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex justify-end px-6 py-3 border-t border-white/5 bg-[#12110F]/50">
            <button
              onClick={handleAddToCart}
              disabled={selectedIds.length === 0 || isLoading || isCrumpling}
              className="flex items-center gap-2 bg-[#E5BA73] hover:bg-[#f3cb85] text-[#12110F] text-xs px-5 py-2.5 rounded-xl font-bold shadow-md transition-colors disabled:bg-white/10 disabled:text-white/40 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-[#12110F] rounded-full border-t-transparent animate-spin" />
              ) : (
                <>
                  <ShoppingCart size={14} />
                  Masukkan Keranjang ({selectedIds.length})
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body,
  );
}