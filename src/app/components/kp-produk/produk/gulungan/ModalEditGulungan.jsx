"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, ChevronDown } from "lucide-react";
import Swal from "sweetalert2";

export default function ModalEditGulungan({ isOpen, onClose, onSuccess, currentProduct, currentGulungan }) {
  // Amankan data jika sewaktu-waktu parent mengirimkan dalam bentuk array [ objek ]
  const produkAktif = Array.isArray(currentProduct) ? currentProduct[0] : currentProduct;
  const gulunganAktif = currentGulungan || null;

  // State Input reaktif yang sekarang keduanya menggunakan Dropdown Select
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

  // Memicu penarikan ulang harga otomatis setiap kali kombinasi dropdown lebar atau jenis pewarna berubah
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

          // Jalur 1: Cari harga berdasarkan Pewarna + Lebar + Spesifik Motif
          let matchedPrice = rawHarga.find(p => 
            p.jenis_pewarna?.toLowerCase() === targetPewarna && 
            parseInt(p.lebar) === targetLebar && 
            p.motif?.id === targetMotifId
          );

          // Jalur 2: Fallback jika motif id tidak ditemukan, cari harga general (motif global/null)
          if (!matchedPrice) {
            matchedPrice = rawHarga.find(p => 
              p.jenis_pewarna?.toLowerCase() === targetPewarna && 
              parseInt(p.lebar) === targetLebar && 
              p.motif === null
            );
          }

          if (matchedPrice) {
            setHargaPerMeter(matchedPrice.harga_per_meter.toString());
          } else {
            setHargaPerMeter(""); // Kosongkan jika kombinasi di daftar harga master tidak terdaftar
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
          // Jika backend Anda nanti butuh menampung perubahan jenis_pewarna produk, bisa disalurkan ke API produk secara terpisah.
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
    <div className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center bg-[#1A335A50] backdrop-blur-[4px] p-4 cursor-default animate-in fade-in duration-100">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[440px] bg-white shadow-2xl rounded-[24px] z-10 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150 p-6"
      >
        
        {/* Tombol Silang Close */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-5 right-5 z-20 p-1 text-[#1A335A] hover:text-[#11223C] transition-colors rounded-full bg-white/80"
        >
          <X size={22} strokeWidth={2.5} />
        </button>

        {/* Header Modal */}
        <div className="mb-4 pr-6">
          <h3 className="text-[20px] font-bold text-[#1A335A] tracking-tight">Edit Gulungan</h3>
        </div>

        {/* Container Form */}
        <form 
          onSubmit={handleFormSubmit} 
          className="space-y-4 text-xs text-gray-700 flex-1 overflow-y-auto pr-2 pb-2
            [&::-webkit-scrollbar]:w-[5px]
            [&::-webkit-scrollbar-track]:bg-transparent 
            [&::-webkit-scrollbar-thumb]:bg-[#1A335A]/25 
            [&::-webkit-scrollbar-thumb]:rounded-full 
            hover:[&::-webkit-scrollbar-thumb]:bg-[#1A335A]/50 
            [scrollbar-width:thin] 
            [scrollbar-color:rgba(26,51,90,0.25)_transparent]"
        >
          
          {/* Gambar Banner Utama */}
          <div className="w-full aspect-[16/8] rounded-[14px] overflow-hidden border border-[#1A335A1F] bg-[#1A335A14] relative shadow-sm flex items-center justify-center">
            <img
              src={produkAktif?.gambar_url || "https://placehold.co/600x300?text=Gambar+Tidak+Ditemukan"}
              alt="Preview Motif Kain"
              className="object-cover w-full h-full"
            />
          </div>

          {/* Field 1: Jenis Pewarna (Ubah mjd Dropdown Select) */}
          <div className="space-y-1.5">
            <label className="block text-[13px] font-bold text-[#1A335A]">Jenis Pewarna</label>
            <div className="relative">
              <select
                value={jenisPewarna}
                onChange={(e) => setJenisPewarna(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-4 py-2.5 bg-gray-50 border border-[#1A335A1F] rounded-[10px] outline-none text-gray-900 font-bold focus:border-[#1A335A] cursor-pointer appearance-none transition-colors"
              >
                <option value="Alami">Alami</option>
                <option value="Sintetis">Sintetis</option>
              </select>
              <ChevronDown size={16} className="absolute text-[#1A335A] -translate-y-1/2 pointer-events-none right-4 top-1/2 opacity-70" />
            </div>
          </div>

          {/* Field 2: Lebar Gulungan (Ubah mjd Dropdown Select 110 & 70) */}
          <div className="space-y-1.5">
            <label className="block text-[13px] font-bold text-[#1A335A]">Lebar Gulungan</label>
            <div className="relative">
              <select
                value={lebar}
                onChange={(e) => setLebar(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-4 py-2.5 bg-gray-50 border border-[#1A335A1F] rounded-[10px] outline-none text-gray-900 font-bold focus:border-[#1A335A] cursor-pointer appearance-none transition-colors"
              >
                <option value="110">110 cm</option>
                <option value="70">70 cm</option>
              </select>
              <ChevronDown size={16} className="absolute text-[#1A335A] -translate-y-1/2 pointer-events-none right-4 top-1/2 opacity-70" />
            </div>
          </div>

          {/* Field 3: Panjang Gulungan */}
          <div className="space-y-1.5">
            <label className="block text-[13px] font-bold text-[#1A335A]">Panjang Gulungan</label>
            <input
              type="number"
              step="0.1"
              required
              placeholder="Masukkan Panjang (m)"
              value={panjangTotal}
              onChange={(e) => setPanjangTotal(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 bg-gray-50 border border-[#1A335A1F] rounded-[10px] outline-none text-gray-900 font-bold placeholder-gray-400 focus:border-[#1A335A] transition-colors"
            />
          </div>

          {/* Field 4: Lokasi Rak */}
          <div className="space-y-1.5">
            <label className="block text-[13px] font-bold text-[#1A335A]">Rak</label>
            <div className="relative">
              <select
                value={rakId}
                onChange={(e) => setRakId(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-4 py-2.5 bg-gray-50 border border-[#1A335A1F] rounded-[10px] outline-none text-gray-900 font-bold focus:border-[#1A335A] cursor-pointer appearance-none transition-colors"
              >
                <option value="">Pilih Rak</option>
                {listRak.map((r) => (
                  <option key={r.id} value={r.id}>Rak {r.nama}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute text-[#1A335A] -translate-y-1/2 pointer-events-none right-4 top-1/2 opacity-70" />
            </div>
          </div>

          {/* Field 5: Harga Per Meter */}
          <div className="space-y-1.5">
            <label className="block text-[13px] font-bold text-[#1A335A]">Harga Permeter</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">Rp</span>
              <input
                type="text"
                readOnly
                placeholder="Rp"
                value={isLoadingMaster ? "Memuat..." : hargaPerMeter ? Number(hargaPerMeter).toLocaleString("id-ID") : "Kombinasi harga tidak ditemukan"}
                className={`w-full pl-10 pr-4 py-2.5 bg-[#1A335A14] border border-[#1A335A1F] rounded-[10px] outline-none font-bold cursor-not-allowed select-none ${
                  hargaPerMeter ? "text-[#1A335A]" : "text-red-500 text-[11px] italic"
                }`}
              />
            </div>
          </div>

          {/* Action Footer Buttons */}
          <div className="flex justify-end items-center gap-3 pt-4 bg-white sticky bottom-0 left-0 right-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2.5 border border-[#1A335A] text-[#1A335A] bg-white rounded-[10px] text-xs font-bold hover:bg-[#1A335A0D] transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !panjangTotal || !lebar || !hargaPerMeter}
              className="bg-[#1A335A] hover:bg-[#11223C] text-white px-6 py-2.5 rounded-[10px] text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
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