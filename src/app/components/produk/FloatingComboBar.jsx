"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2, X } from "lucide-react";
import { useComboStore } from "@/app/store/useComboStore";

export default function FloatingComboBar() {
  const router = useRouter();
  const { combination, clearSlot } = useComboStore();

  // Konversi objek kombinasi menjadi array aktif yang hanya berisi produk terisi
  const selectedItems = Object.entries(combination)
    .filter(([_, item]) => item !== null)
    .map(([slot, item]) => ({ slot, ...item }));

  const hasItems = selectedItems.length > 0;

  return (
    <AnimatePresence>
      {hasItems && (
        <motion.div
          initial={{ x: -120, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 140, damping: 18 }}
          className="fixed top-24 left-6 z-[999] w-full max-w-[240px] pointer-events-auto"
        >
          {/* RAMPING: Mengubah padding ke p-3 dan gap ke gap-2.5 untuk memangkas tinggi container */}
          <div className="bg-[#12110F]/95 backdrop-blur-xl border border-[#E5BA73]/30 rounded-xl p-3 flex flex-col gap-2.5 shadow-2xl shadow-black/95">
            
            {/* RAMPING: Mengurangi jarak vertikal teks header ke list item */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] text-[#E5BA73] font-bold tracking-wider uppercase">
                Customizer Container
              </span>

              {/* RAMPING: Mengurangi padding penampung menjadi p-1.5 */}
              <div className="flex flex-wrap items-center gap-2 bg-[#1A1917] p-1.5 rounded-lg border border-white/5 min-h-[60px]">
                {selectedItems.map((item) => (
                  <div
                    key={item.slot}
                    className="w-11 h-11 rounded-lg border border-[#E5BA73]/30 bg-[#12110F] relative shadow-md overflow-visible"
                  >
                    {/* Nilai Gambar Produk */}
                    <img
                      src={item.gambar_url}
                      className="object-cover w-full h-full rounded-lg"
                      alt="Selected Lurik"
                    />
                    
                    {/* Tombol Silang Penghapus Item */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearSlot(item.slot);
                      }}
                      className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 shadow-md transition-transform active:scale-75 z-10"
                    >
                      <X size={8} strokeWidth={3} />
                    </button>
                  </div>
                ))}
              </div>
            </div>


<button
  type="button"
  onClick={() => router.push("/customizer?mode=combo")}
  className="flex items-center justify-center gap-2 w-full py-2 bg-gradient-to-r from-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 border border-white/10 text-[#F9F6F0] text-[11px] font-bold rounded-lg transition-all active:scale-95"
>
  <Wand2 size={11} className="text-[#E5BA73]" />
  Pindahkan ke Studio Desain
</button>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}