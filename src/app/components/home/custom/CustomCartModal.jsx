"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const generateLurikGradient = (stripes) => {
  let gradientString = "";
  let currentOffset = 0;

  stripes.forEach((stripe) => {
    const startPoint = currentOffset;
    const endPoint = currentOffset + stripe.thickness;
    gradientString += `${stripe.color} ${startPoint}px, ${stripe.color} ${endPoint}px, `;
    gradientString += `transparent ${endPoint}px, transparent ${endPoint + 2}px, `;
    currentOffset = endPoint + 2;
  });

  return {
    gradient: gradientString
      ? `linear-gradient(90deg, ${gradientString.slice(0, -2)})`
      : "none",
    totalWidth: currentOffset,
  };
};

export default function CustomCartModal({
  isOpen,
  onClose,
  onConfirm,
  customProperties = { bgColor: "#53593B", patternDensity: 86, stripes: [] },
}) {
  const [lebar, setLebar] = useState(70);
  const [panjang, setPanjang] = useState(1);
  const [isCrumpling, setIsCrumpling] = useState(false);

  // Batas maksimal panjang pemesanan kain kustom (bisa disesuaikan)
  const MAKSIMAL_PANJANG_KUSTOM = 100;

  // Ref penampung timer komponen untuk fitur hold
  const timerRef = useRef(null);
  const intervalRef = useRef(null);

  // Reset kuantitas panjang saat modal dibuka kembali
  useEffect(() => {
    if (isOpen) {
      setPanjang(1);
    }
  }, [isOpen]);

  // Bersihkan interval/timer saat komponen unmount
  useEffect(() => {
    return () => hentikanAksi();
  }, []);

  if (!isOpen) return null;

  const { bgColor, patternDensity, stripes } = customProperties;
  const { gradient, totalWidth } = generateLurikGradient(stripes);
  const ukuranKerapatanDinamis = totalWidth * (patternDensity / 100) || 20;

  const miniPatternStyle = {
    backgroundColor: bgColor,
    backgroundImage: gradient,
    backgroundSize: `${ukuranKerapatanDinamis}px 100%`,
    maskImage: "url('/mockups/kain-gantung-mask.png')",
    WebkitMaskImage: "url('/mockups/kain-gantung-mask.png')",
    maskSize: "contain",
    WebkitMaskSize: "contain",
    maskRepeat: "no-repeat",
    maskPosition: "center",
  };

  const hargaPerMeter = lebar === 70 ? 500000 : 700000;
  const totalHarga = panjang * hargaPerMeter;

  // ─── LOGIKA AUTO-LOOP METERAN SAAT DIHOLD (SAMA SEPERTI MODAL DETAIL) ───
  const eksekusiKuantitas = (tipe) => {
    setPanjang((currentPanjang) => {
      if (tipe === "tambah") {
        return Math.min(MAKSIMAL_PANJANG_KUSTOM, currentPanjang + 1);
      } else if (tipe === "kurang") {
        return Math.max(1, currentPanjang - 1);
      }
      return currentPanjang;
    });
  };

  const hentikanAksi = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const mulaiAksi = (tipe) => {
    if (isCrumpling) return;

    eksekusiKuantitas(tipe);

    timerRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        eksekusiKuantitas(tipe);
      }, 80);
    }, 400);
  };

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
      transition: { type: "spring", duration: 0.5 },
    },
    crumpleAndFly: {
      scale: [1, 0.7, 0.4, 0.15, 0],
      borderRadius: ["16px", "24px", "60px", "100px", "100px"],
      skewX: [0, 15, -10, 5, 0],
      skewY: [0, -10, 15, -5, 0],
      rotate: [0, -35, 75, -360, -720],
      x: [0, 20, -15, 350, 680],
      y: [0, -10, 30, -160, -380],
      opacity: [1, 1, 0.9, 0.7, 0],
      transition: {
        duration: 0.9,
        times: [0, 0.2, 0.5, 0.75, 1],
        ease: [
          [0.36, 0.07, 0.19, 0.97],
          [0.36, 0.07, 0.19, 0.97],
          [0.42, 0, 0.58, 1],
          [0.25, 1, 0.5, 1],
        ],
      },
    },
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (panjang <= 0 || isCrumpling) return;

    setIsCrumpling(true);

    setTimeout(() => {
      onConfirm({
        lebar,
        panjang,
        hargaPerMeter,
        totalHarga,
      });

      window.dispatchEvent(
        new CustomEvent("updateCartCount", { detail: { itemCount: 1 } }),
      );

      setIsCrumpling(false);
      onClose();
    }, 900);
  };

  const handleWhatsAppClick = () => {
    if (panjang <= 0) return;

    const formatRupiah = (angka) =>
      new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(angka);

    const pesan = encodeURIComponent(
      `Halo Dibyo Lurik, saya ingin memesan "Kain Kustom" hasil rancangan saya dengan spesifikasi berikut:\n\n` +
        `- Lebar Kain: ${lebar} cm\n` +
        `- Panjang: ${panjang} meter\n` +
        `- Estimasi Subtotal: ${formatRupiah(totalHarga)}\n\n` +
        `Mohon informasi lebih lanjut untuk proses produksinya. Terima kasih!`,
    );

    window.open(`https://wa.me/6289692721400?text=${pesan}`, "_blank");
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0D1412]/40 backdrop-blur-sm"
        onClick={() => !isCrumpling && onClose()}
      >
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate={isCrumpling ? "crumpleAndFly" : "visible"}
          exit="hidden"
          className="w-full max-w-4xl bg-[#FDFCFA] border border-[#EBE7E0] rounded-2xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row max-h-[90vh] text-[#3E3431] font-sans origin-center will-change-transform"
          onClick={(e) => e.stopPropagation()}
        >
          {/* KOLOM KIRI: VISUAL PRATINJAU KAIN */}
          <div className="w-full md:w-5/12 bg-[#F5F1E9] md:border-r border-b md:border-b-0 border-[#E2DCD2] min-h-[280px] md:min-h-full p-6 flex items-center justify-center">
            <div className="relative w-full max-w-xs overflow-hidden border rounded-xl border-[#E2DCD2] bg-white shadow-sm aspect-square">
              <div
                style={miniPatternStyle}
                className="absolute inset-0 w-full h-full transition-all duration-300"
              />
              <img
                src="/mockups/kain-gantung-mask.png"
                alt="Tekstur Lipatan"
                className="absolute inset-0 object-contain w-full h-full pointer-events-none mix-blend-multiply opacity-80"
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.15)_100%)] pointer-events-none" />
            </div>
          </div>

          {/* KOLOM KANAN: HEADER + FORM */}
          <div className="w-full md:w-7/12 flex flex-col overflow-y-auto">
            {/* Header Internal */}
            <div className="p-6 border-b border-[#EBE7E0] flex justify-between items-start">
              <div>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-[#C49A6C] uppercase bg-[#C49A6C]/10 px-3 py-1 rounded-full border border-[#C49A6C]/20 w-fit">
                  <ShoppingBag size={11} /> Kain Kustom
                </span>
                <h2 className="text-xl font-bold text-[#3E3431] mt-2 tracking-wide">
                  Spesifikasi Kain Kustom
                </h2>
                <p className="text-xs text-[#706965] mt-1">
                  Tentukan dimensi ukuran kain tenun hasil rancangan Anda.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={isCrumpling}
                className="text-[#706965] hover:text-[#C49A6C] transition-colors disabled:opacity-30"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1">
              <div className="p-5 space-y-6">
                {/* Pilihan Lebar Kain */}
                <div className="space-y-2.5">
                  <label className="text-[10px] font-bold tracking-widest text-[#4A3F3B] uppercase block">
                    Pilih Lebar Kain
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      disabled={isCrumpling}
                      onClick={() => setLebar(70)}
                      className={`p-3.5 rounded-xl border text-xs font-bold transition-all text-center flex flex-col justify-center items-center gap-1 ${
                        lebar === 70
                          ? "bg-[#C49A6C]/10 border-[#C49A6C] text-[#B08354] shadow-sm"
                          : "bg-white border-[#EBE7E0] text-[#706965] hover:border-[#C49A6C]/50"
                      }`}
                    >
                      <span className="text-sm text-[#3E3431]">
                        Lebar 70 cm
                      </span>
                      <span className="text-[11px] font-normal text-[#706965]">
                        Rp 500.000 /m
                      </span>
                    </button>

                    <button
                      type="button"
                      disabled={isCrumpling}
                      onClick={() => setLebar(110)}
                      className={`p-3.5 rounded-xl border text-xs font-bold transition-all text-center flex flex-col justify-center items-center gap-1 ${
                        lebar === 110
                          ? "bg-[#C49A6C]/10 border-[#C49A6C] text-[#B08354] shadow-sm"
                          : "bg-white border-[#EBE7E0] text-[#706965] hover:border-[#C49A6C]/50"
                      }`}
                    >
                      <span className="text-sm text-[#3E3431]">
                        Lebar 110 cm
                      </span>
                      <span className="text-[11px] font-normal text-[#706965]">
                        Rp 700.000 /m
                      </span>
                    </button>
                  </div>
                </div>

                {/* Input Panjang Kain (Telah disesuaikan menjadi counter tombol) */}
                <div className="space-y-2.5">
                  <label className="text-[10px] font-bold tracking-widest text-[#4A3F3B] uppercase block">
                    Panjang Kain Yang Dibeli (Meter)
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={panjang <= 1 || isCrumpling}
                      onPointerDown={() => mulaiAksi("kurang")}
                      onPointerUp={hentikanAksi}
                      onPointerLeave={hentikanAksi}
                      className="w-9 h-9 rounded-lg border border-[#C49A6C]/30 text-[#C49A6C] text-xl flex items-center justify-center hover:bg-[#C49A6C]/10 transition-colors disabled:opacity-30 select-none touch-none"
                    >
                      −
                    </button>

                    <span className="text-base font-semibold text-[#3E3431] min-w-[2.5rem] text-center select-none">
                      {panjang}{" "}
                      <span className="text-xs font-normal text-[#706965]">
                        m
                      </span>
                    </span>

                    <button
                      type="button"
                      disabled={
                        panjang >= MAKSIMAL_PANJANG_KUSTOM || isCrumpling
                      }
                      onPointerDown={() => mulaiAksi("tambah")}
                      onPointerUp={hentikanAksi}
                      onPointerLeave={hentikanAksi}
                      className={`w-9 h-9 rounded-lg border text-xl flex items-center justify-center transition-colors select-none touch-none
                        ${
                          panjang >= MAKSIMAL_PANJANG_KUSTOM
                            ? "border-[#EBE7E0] text-[#A3A19E] cursor-not-allowed"
                            : "border-[#C49A6C]/30 text-[#C49A6C] hover:bg-[#C49A6C]/10"
                        }`}
                    >
                      +
                    </button>

                    <span className="text-xs text-[#706965] ml-1">
                      maksimal pembelian {MAKSIMAL_PANJANG_KUSTOM} meter
                    </span>
                  </div>
                </div>

                {/* Ringkasan Subtotal */}
                <div className="p-4 space-y-2 text-xs border bg-[#FAF7F2] border-[#EBE7E0] rounded-xl">
                  <div className="flex justify-between text-[#706965] text-xs">
                    <span>Harga Satuan:</span>
                    <span>
                      Rp {hargaPerMeter.toLocaleString("id-ID")} / meter
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-[#3E3431] border-t border-[#E2DCD2] pt-2.5 mt-1">
                    <span className="text-xs text-[#706965] font-normal">
                      Estimasi Subtotal:
                    </span>
                    <span className="text-base font-black text-[#B08354]">
                      Rp {totalHarga.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tombol Aksi Utama */}
              <div className="flex gap-3 px-5 pb-5 mt-auto">
                <button
                  type="button"
                  disabled={isCrumpling || panjang <= 0}
                  onClick={handleWhatsAppClick}
                  className="flex-1 py-4 bg-white border border-[#EBE7E0] text-[#706965] hover:text-[#C49A6C] hover:border-[#C49A6C] font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  WhatsApp
                </button>

                <button
                  type="submit"
                  disabled={isCrumpling || panjang <= 0}
                  className="flex-[2] py-4 bg-[#C49A6C] text-white hover:bg-[#A87E53] font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md shadow-[#C49A6C]/10 disabled:bg-[#EBE7E0] disabled:text-[#A3A19E] disabled:cursor-not-allowed disabled:shadow-none"
                >
                  {isCrumpling ? "Memasukkan..." : "Masukkan Keranjang"}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
