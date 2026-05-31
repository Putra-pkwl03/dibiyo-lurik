"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, ChevronDown } from "lucide-react";
import Swal from "sweetalert2";

export default function ModalEditGulungan({ isOpen, onClose, onSuccess, currentProduct, currentGulungan }) {
  // Amankan data jika sewaktu-waktu parent mengirimkan dalam bentuk array [ objek ]
  const produkAktif = Array.isArray(currentProduct) ? currentProduct[0] : currentProduct;
  const gulunganAktif = currentGulungan || null;

  // State Input reaktif sesuai field figma mockup
  const [jenisPewarna, setJenisPewarna] = useState("Sintetis");
  const [lebar, setLebar] = useState("110");
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

  // Set nilai awal (Hydration) berdasarkan data gulungan kain yang mau diedit
  useEffect(() => {
    if (produkAktif) {
      setJenisPewarna(produkAktif.jenis_pewarna ? (produkAktif.jenis_pewarna.charAt(0).toUpperCase() + produkAktif.jenis_pewarna.slice(1)) : "Sintetis");
    }
    if (gulunganAktif) {
      setLebar(gulunganAktif.lebar ? gulunganAktif.lebar.toString() : "110");
      setPanjangTotal(gulunganAktif.panjang_total ? gulunganAktif.panjang_total.toString() : "");
      setRakId(gulunganAktif.rak_id || "");
      setHargaPerMeter(gulunganAktif.harga_per_meter || gulunganAktif.harga || "");
    }
  }, [produkAktif, gulunganAktif, isOpen]);

  // Ambil data harga master & data rak secara bersamaan (Parallel Fetching)
  const fetchMasterData = async () => {
    try {
      if (!produkAktif) return;
      setIsLoadingMaster(true);

      const [resHarga, resRak] = await Promise.all([
        fetch("/api/daftar-harga"),
        fetch("/api/rak")
      ]);

      if (resRak.ok) {
        const jsonRak = await resRak.json();
        setListRak(jsonRak.data || []);
      }

      if (resHarga.ok) {
        const jsonHarga = await resHarga.json();
        const rawHarga = jsonHarga.data || jsonHarga || [];

        if (rawHarga.length > 0) {
          const targetPewarna = jenisPewarna.toLowerCase();
          const targetLebar = parseInt(lebar) || 110;
          const targetMotifId = produkAktif.motif_id || produkAktif.motif?.id;

          let matchedPrice = rawHarga.find(p => 
            p.jenis_pewarna?.toLowerCase() === targetPewarna && 
            parseInt(p.lebar) === targetLebar && 
            p.motif?.id === targetMotifId
          );

          if (!matchedPrice) {
            matchedPrice = rawHarga.find(p => 
              p.jenis_pewarna?.toLowerCase() === targetPewarna && 
              parseInt(p.lebar) === targetLebar && 
              p.motif === null
            );
          }

          if (matchedPrice) {
            setHargaPerMeter(matchedPrice.harga_per_meter.toString());
          } else if (!gulunganAktif) {
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
    if (!produkAktif?.id || !gulunganAktif?.id || !panjangTotal || !lebar || !hargaPerMeter) {
      return Swal.fire("Peringatan ⚠️", "Harap isi semua kolom dengan benar.", "warning");
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/gulungan/${gulunganAktif.id}`, {
        method: "PATCH",
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
      if (!res.ok) throw new Error(json.message || "Gagal memperbarui data gulungan.");

      Swal.fire({
        title: "Sukses! 🎉",
        text: "Data gulungan kain berhasil diperbarui.",
        icon: "success",
        timer: 1200,
        showConfirmButton: false,
      });

      onSuccess();
      onClose();
    } catch (err) {
      Swal.fire("Gagal Ubah ❌", err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center bg-[#AE834E87] backdrop-blur-[4px] p-4 cursor-default animate-in fade-in duration-100">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[440px] bg-white shadow-2xl rounded-[24px] z-10 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150 p-6"
      >
        
        {/* Tombol Silang Close */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-5 right-5 z-20 p-1 text-[#A3704C] hover:text-[#8c5f3f] transition-colors rounded-full bg-white/80"
        >
          <X size={22} strokeWidth={2.5} />
        </button>

        {/* Header Modal */}
        <div className="mb-4 pr-6">
          <h3 className="text-[20px] font-bold text-[#A3704C] tracking-tight">Edit Gulungan</h3>
        </div>

        {/* Container Form Ber-Scrollbar Tipis Selaras Desain */}
        <form 
          onSubmit={handleFormSubmit} 
          className="space-y-4 text-xs text-[#5C4033] flex-1 overflow-y-auto pr-2 pb-2
            [&::-webkit-scrollbar]:w-[5px]
            [&::-webkit-scrollbar-track]:bg-transparent 
            [&::-webkit-scrollbar-thumb]:bg-[#A3704C]/35 
            [&::-webkit-scrollbar-thumb]:rounded-full 
            hover:[&::-webkit-scrollbar-thumb]:bg-[#A3704C]/60 
            [scrollbar-width:thin] 
            [scrollbar-color:rgba(163,112,76,0.35)_transparent]"
        >
          
          {/* Gambar Banner Utama */}
          <div className="w-full aspect-[16/8] rounded-[14px] overflow-hidden border border-[#D1C3B7]/40 bg-[#F2EAE4] relative shadow-sm flex items-center justify-center">
            <img
              src={produkAktif?.gambar_url || "https://placehold.co/600x300?text=Gambar+Tidak+Ditemukan"}
              alt="Preview Motif Kain"
              className="object-cover w-full h-full"
            />
          </div>

          {/* Field 1: Jenis Pewarna */}
          <div className="space-y-1.5">
            <label className="block text-[13px] font-bold text-[#A3704C]">Jenis Pewarna</label>
            <div className="w-full px-4 py-2.5 bg-[#F5EBE1] border border-[#D4C5B9] rounded-[10px] text-[#A3704C]/70 font-bold capitalize flex justify-between items-center select-none cursor-not-allowed">
              <span>Pewarna {produkAktif?.jenis_pewarna || "Sintetis"}</span>
              <ChevronDown size={16} className="text-[#A3704C] opacity-40" />
            </div>
          </div>

          {/* Field 2: Lebar Gulungan */}
          <div className="space-y-1.5">
            <label className="block text-[13px] font-bold text-[#A3704C]">Lebar Gulungan</label>
            <input
              type="number"
              required
              placeholder="Masukkan Lebar (cm)"
              value={lebar}
              onChange={(e) => setLebar(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 bg-[#F5EBE1] border border-[#D4C5B9] rounded-[10px] outline-none text-[#A3704C] font-bold placeholder-[#A3704C]/40 focus:border-[#A3704C] transition-colors"
            />
          </div>

          {/* Field 3: Panjang Gulungan */}
          <div className="space-y-1.5">
            <label className="block text-[13px] font-bold text-[#A3704C]">Panjang Gulungan</label>
            <input
              type="number"
              step="0.1"
              required
              placeholder="Masukkan Panjang (m)"
              value={panjangTotal}
              onChange={(e) => setPanjangTotal(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 bg-[#F5EBE1] border border-[#D4C5B9] rounded-[10px] outline-none text-[#A3704C] font-bold placeholder-[#A3704C]/40 focus:border-[#A3704C] transition-colors"
            />
          </div>

          {/* Field 4: Lokasi Rak */}
          <div className="space-y-1.5">
            <label className="block text-[13px] font-bold text-[#A3704C]">Rak</label>
            <div className="relative">
              <select
                value={rakId}
                onChange={(e) => setRakId(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-4 py-2.5 bg-[#F5EBE1] border border-[#D4C5B9] rounded-[10px] outline-none text-[#A3704C] font-bold focus:border-[#A3704C] cursor-pointer appearance-none transition-colors"
              >
                <option value="">Pilih Rak</option>
                {listRak.map((r) => (
                  <option key={r.id} value={r.id}>Rak {r.nama}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute text-[#A3704C] -translate-y-1/2 pointer-events-none right-4 top-1/2 opacity-70" />
            </div>
          </div>

          {/* Field 5: Harga Per Meter */}
          <div className="space-y-1.5">
            <label className="block text-[13px] font-bold text-[#A3704C]">Harga Permeter</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[#A3704C]/60">Rp</span>
              <input
                type="text"
                readOnly
                placeholder="Rp"
                value={isLoadingMaster ? "Memuat..." : hargaPerMeter ? Number(hargaPerMeter).toLocaleString("id-ID") : ""}
                className="w-full pl-10 pr-4 py-2.5 bg-[#F5EBE1] border border-[#D4C5B9] rounded-[10px] outline-none text-[#A3704C] font-bold cursor-not-allowed select-none bg-opacity-80"
              />
            </div>
          </div>

          {/* Action Footer Buttons */}
          <div className="flex justify-end items-center gap-3 pt-4 bg-white sticky bottom-0 left-0 right-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2.5 border border-[#A3704C] text-[#A3704C] bg-white rounded-[10px] text-xs font-bold hover:bg-[#F5EBE1]/40 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !panjangTotal || !lebar || !hargaPerMeter}
              className="bg-[#A3704C] hover:bg-[#8c5f3f] text-white px-6 py-2.5 rounded-[10px] text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : "Simpan"}
            </button>
          </div>
          
        </form>
      </div>
    </div>,
    document.body
  );
}