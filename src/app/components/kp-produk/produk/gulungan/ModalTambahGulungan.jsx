"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, ChevronDown } from "lucide-react";
import Swal from "sweetalert2";

export default function PopupTambahGulungan({ isOpen, onClose, onSuccess, currentProduct }) {
  // Amankan data jika sewaktu-waktu parent mengirimkan dalam bentuk array [ objek ]
  const produkAktif = Array.isArray(currentProduct) ? currentProduct[0] : currentProduct;

  // State Input reaktif sesuai field di gambar mockup figma
  const [jenisPewarna, setJenisPewarna] = useState("Sintetis");
  const [lebar, setLebar] = useState("110"); // Default 110 cm sesuai figma
  const [panjangTotal, setPanjangTotal] = useState("");
  const [rakId, setRakId] = useState("");
  const [hargaPerMeter, setHargaPerMeter] = useState("");

  // State data master dari database (Backend)
  const [listRak, setListRak] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingMaster, setIsLoadingMaster] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
      fetchMasterData();
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, lebar, jenisPewarna, produkAktif]);

  // Set nilai awal dari produk terikat
  useEffect(() => {
    if (produkAktif) {
      setJenisPewarna(produkAktif.jenis_pewarna ? (produkAktif.jenis_pewarna.charAt(0).toUpperCase() + produkAktif.jenis_pewarna.slice(1)) : "Sintetis");
      setRakId(produkAktif.rak_id || produkAktif.rak?.id || "");
    }
  }, [produkAktif]);

  // Ambil data harga master & data rak secara bersamaan (Parallel Fetching)
  const fetchMasterData = async () => {
    try {
      if (!produkAktif) return;
      setIsLoadingMaster(true);

      // Jalankan fetch paralel ke endpoint daftar-harga dan rak
      const [resHarga, resRak] = await Promise.all([
        fetch("/api/daftar-harga"),
        fetch("/api/rak")
      ]);

      // ── Parsing Data Rak ──
      if (resRak.ok) {
        const jsonRak = await resRak.json();
        setListRak(jsonRak.data || []);
      }

      // ── Parsing Data Harga Master Otomatis (Mencari 1 Nilai Mutlak) ──
      if (resHarga.ok) {
        const jsonHarga = await resHarga.json();
        const rawHarga = jsonHarga.data || jsonHarga || [];

        if (rawHarga.length > 0) {
          const targetPewarna = jenisPewarna.toLowerCase();
          const targetLebar = parseInt(lebar) || 110;
          const targetMotifId = produkAktif.motif_id || produkAktif.motif?.id;

          // Aturan 1: Cari kecocokan harga spesifik (Pewarna + Lebar + ID Motif kain)
          let matchedPrice = rawHarga.find(p => 
            p.jenis_pewarna?.toLowerCase() === targetPewarna && 
            parseInt(p.lebar) === targetLebar && 
            p.motif?.id === targetMotifId
          );

          // Aturan 2: Jika tidak ada motif spesifik, ambil aturan harga Umum (motif === null)
          if (!matchedPrice) {
            matchedPrice = rawHarga.find(p => 
              p.jenis_pewarna?.toLowerCase() === targetPewarna && 
              parseInt(p.lebar) === targetLebar && 
              p.motif === null
            );
          }

          // Otomatis langsung inject ke state harga tanpa dropdown pembungkus lagi
          if (matchedPrice) {
            setHargaPerMeter(matchedPrice.harga_per_meter.toString());
          } else {
            setHargaPerMeter("");
          }
        }
      }
    } catch (err) {
      console.error("Gagal memuat aturan data master otomatis:", err);
    } finally {
      setIsLoadingMaster(false);
    }
  };

  if (!isOpen || !mounted) return null;

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!produkAktif?.id || !panjangTotal || !lebar || !hargaPerMeter) {
      return Swal.fire("Peringatan ⚠️", "Harap isi semua kolom dengan benar.", "warning");
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/gulungan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          produk_id: produkAktif.id,
          rak_id: rakId || null,
          lebar: parseInt(lebar),
          panjang_total: parseFloat(panjangTotal),
          harga_per_meter: parseInt(hargaPerMeter),
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal menyimpan gulungan baru.");

      Swal.fire({
        title: "Sukses! 🎉",
        text: "Gulungan kain berhasil diinput ke sistem.",
        icon: "success",
        timer: 1200,
        showConfirmButton: false,
      });

      setPanjangTotal("");
      onSuccess();
      onClose();
    } catch (err) {
      Swal.fire("Gagal Simpan ❌", err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center bg-[#ae834e]/53 backdrop-blur-[2px] p-4 cursor-default animate-in fade-in duration-100">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[440px] bg-white shadow-2xl rounded-[24px] z-10 overflow-hidden flex flex-col max-h-[95vh] animate-in fade-in zoom-in-95 duration-150 p-6 space-y-4"
      >
        
        {/* Tombol Silang Close di Sudut Kanan Atas */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-5 right-5 z-20 p-1 text-[#a47352] hover:text-[#8c5f3f] transition-colors rounded-full bg-white/80"
        >
          <X size={24} strokeWidth={2.5} />
        </button>

        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs text-[#5C4033] flex-1 overflow-y-auto pr-1">
          
          <h3 className="text-[20px] font-medium text-[#a47352] tracking-tight mb-2">Tambah Gulungan</h3>

          {/* Gambar Banner Utama Melengkung Sesuai Figma Mockup */}
          <div className="w-full aspect-[16/8] rounded-[14px] overflow-hidden border border-[#D1C3B7]/40 bg-[#F2EAE4] relative shadow-sm flex items-center justify-center">
            <img
              src={produkAktif?.gambar_url || "https://placehold.co/600x300?text=Gambar+Tidak+Ditemukan"}
              alt="Preview Motif Kain"
              className="object-cover w-full h-full"
            />
          </div>

          {/* Field 1: Jenis Pewarna (Non-Aktif / Read-Only Box) */}
          <div className="space-y-1.5">
            <label className="block text-[13px] font-medium text-[#a47352]">Jenis Pewarna</label>
            <div className="w-full px-4 py-2.5 bg-[#F5EBE1] border border-[#D4C5B9] rounded-[12px] text-[#a47352]/70 font-semibold capitalize flex justify-between items-center select-none cursor-not-allowed">
              <span>Pewarna {produkAktif?.jenis_pewarna || "Sintetis"}</span>
              <ChevronDown size={16} className="text-[#a47352] opacity-40" />
            </div>
          </div>

          {/* Field 2: Lebar Gulungan */}
          <div className="space-y-1.5">
            <label className="block text-[13px] font-medium text-[#a47352]">Lebar Gulungan</label>
            <div className="relative">
              <select
                value={lebar}
                onChange={(e) => setLebar(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-4 py-2.5 bg-[#F5EBE1] border border-[#D4C5B9] rounded-[12px] outline-none text-[#a47352] font-semibold focus:border-[#a47352] cursor-pointer appearance-none duration-200"
              >
                <option value="110">110 cm</option>
                <option value="70">70 cm</option>
              </select>
              <ChevronDown size={16} className="absolute text-[#a47352] -translate-y-1/2 pointer-events-none right-4 top-1/2" />
            </div>
          </div>

          {/* Field 3: Panjang Gulungan Input */}
          <div className="space-y-1.5">
            <label className="block text-[13px] font-medium text-[#a47352]">Panjang Gulungan</label>
            <input
              type="number"
              step="0.1"
              required
              placeholder="Masukkan Panjang (m)"
              value={panjangTotal}
              onChange={(e) => setPanjangTotal(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#F5EBE1] border border-[#D4C5B9] rounded-[12px] outline-none text-[#a47352] font-semibold placeholder-[#a47352]/40 focus:border-[#a47352]"
            />
          </div>

          {/* Field 4: Lokasi Rak Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-[13px] font-medium text-[#a47352]">Rak</label>
            <div className="relative">
              <select
                value={rakId}
                onChange={(e) => setRakId(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-4 py-2.5 bg-[#F5EBE1] border border-[#D4C5B9] rounded-[12px] outline-none text-[#a47352] font-semibold focus:border-[#a47352] cursor-pointer appearance-none"
              >
                <option value="">Pilih Rak</option>
                {listRak.map((r) => (
                  <option key={r.id} value={r.id}>Rak {r.nama}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute text-[#a47352] -translate-y-1/2 pointer-events-none right-4 top-1/2" />
            </div>
          </div>

          {/* Field 5: Harga Per Meter (MUTLAK OTOMATIS & READ ONLY) */}
          <div className="space-y-1.5">
            <label className="block text-[13px] font-medium text-[#a47352]">Harga Permeter (Otomatis)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[#a47352]/60">Rp</span>
              <input
                type="text"
                readOnly
                placeholder="Harga terisi otomatis..."
                value={isLoadingMaster ? "Memuat..." : hargaPerMeter ? Number(hargaPerMeter).toLocaleString("id-ID") : "-"}
                className="w-full pl-10 pr-4 py-2.5 bg-[#F5EBE1] border border-[#D4C5B9] rounded-[12px] outline-none text-[#a47352] font-bold cursor-not-allowed select-none bg-opacity-80"
              />
            </div>
          </div>

          {/* Action Footer Button Simpan */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !panjangTotal || !lebar || !hargaPerMeter}
              className="bg-[#A3704C] hover:bg-[#8c5f3f] text-white px-8 py-2.5 rounded-[12px] text-sm font-medium flex items-center gap-2 transition-all shadow-md active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : "Simpan"}
            </button>
          </div>
          
        </form>
      </div>
    </div>,
    document.body
  );
}