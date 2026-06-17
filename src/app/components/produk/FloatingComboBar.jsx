"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2, X } from "lucide-react";
import { useComboStore } from "@/app/store/useComboStore";

export default function FloatingComboBar() {
  const router = useRouter();
  const { combination, clearSlot } = useComboStore();

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
          className="fixed top-24 left-6 z-[999] w-full max-w-[320px] pointer-events-auto"
        >
          <div className="bg-white border-2 border-[#D48C45]/30 rounded-2xl p-5 flex flex-col gap-4 shadow-[0_14px_40px_rgba(45,34,25,0.3)]">

            <div className="flex flex-col gap-2.5">
              <span className="text-xs text-[#A67D45] font-bold tracking-wider uppercase">
                Kain Dipilih untuk Kombinasi
              </span>

              <div className="grid grid-cols-3 gap-3 bg-[#F5F2EB] p-3 rounded-xl border border-[#2D2219]/5">
                {selectedItems.map((item) => (
                  <div
                    key={item.slot}
                    className="relative aspect-square rounded-xl border border-[#2D2219]/10 bg-white shadow-sm overflow-visible"
                  >
                    <img
                      src={item.gambar_url}
                      className="object-cover w-full h-full rounded-xl"
                      alt="Selected Lurik"
                    />

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearSlot(item.slot);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-md transition-transform active:scale-75 z-10"
                    >
                      <X size={11} strokeWidth={3} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push("/customizer?mode=combo")}
              className="flex items-center justify-center gap-2.5 w-full py-3.5 bg-[#C59B5F] hover:bg-[#9e6d3c] text-white text-sm font-bold rounded-xl shadow-sm transition-all duration-300 active:scale-95"
            >
              <Wand2 size={16} className="text-white" />
              Pindahkan ke Studio Desain
            </button>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}