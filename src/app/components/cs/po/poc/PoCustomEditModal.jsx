'use client';

import React, { useState, useEffect } from "react";
import { X, User, Box, CreditCard, Calendar, Upload, Plus, Trash2, Minus, ChevronDown } from "lucide-react";
import Swal from "sweetalert2";
import { supabase } from "@/lib/supabaseClient";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// =====================================================
// KONSTANTA STYLE & HELPER
// =====================================================
const LABEL = "block text-black font-medium mb-1";
const INPUT_CYAN = "w-full border border-[#1A335A] bg-[#5AE3ED1C] rounded-lg p-2 focus:outline-none";
const INPUT_WHITE = "w-full border border-[#1A335A] rounded-lg bg-white p-1.5 focus:outline-none";

const formatRibuan = (val) => (Number(String(val).replace(/\D/g, "")) || 0).toLocaleString("id-ID");
const parseRibuan = (str) => Number(String(str).replace(/\D/g, "")) || 0;

const itemKosong = () => ({
  id: Date.now() + Math.random(),
  lebar: "",
  jenis_pewarna: "",
  qty: 1,
  panjang: "",
  harga_per_meter: 0,
  image: null,
  isFromDb: false,
});

export default function PoCustomEditModal({ isOpen, onClose, item, onSuccess }) {
  const [daftarHarga, setDaftarHarga] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- STATE DATA FORM ---
  const [customer, setCustomer] = useState({ nama_customer: "", kontak_customer: "", alamat_customer: "" });
  const [items, setItems] = useState([]);
  const [pembayaran, setPembayaran] = useState({ status_pembayaran: "dp", total_dp: 0, metode_pembayaran: "cash", diskon: 0 });
  const [produksi, setProduksi] = useState({ tanggal_selesai: "", status: "dalam_proses", catatan: "" });

  // Snapshot angka asli dari DB (read-only, tidak pernah diubah effect)
  const [hargaLamaDariDb, setHargaLamaDariDb] = useState(0); // total_harga lama
  const [dpLamaDariDb, setDpLamaDariDb] = useState(0);       // total_dp lama

  // --- Ambil master harga ---
  useEffect(() => {
    if (isOpen) {
      fetch("/api/daftar-harga")
        .then((res) => res.json())
        .then((res) => setDaftarHarga(res.data || []))
        .catch((err) => console.error("Gagal ambil master harga:", err));
    }
  }, [isOpen]);

  // --- Set data awal saat modal dibuka (sekali, dari prop) ---
  useEffect(() => {
    if (!isOpen || !item) return;

    setCustomer({
      nama_customer: item.nama_customer || "",
      kontak_customer: item.kontak_customer || "",
      alamat_customer: item.alamat_customer || "",
    });

    const dbItems = item.item_pre_order_custom || [];
    setItems(
      dbItems.length > 0
        ? dbItems.map((i) => ({
            id: i.id,
            lebar: String(i.lebar || ""),
            jenis_pewarna: i.jenis_pewarna || "",
            qty: Number(i.jumlah || 1),
            panjang: i.panjang || "",
            harga_per_meter: Number(i.harga_per_meter || 0),
            image: i.gambar_custom || null,
            isFromDb: true,
          }))
        : [itemKosong()]
    );

    const rawStatus = (item.status_pembayaran || "dp").toLowerCase();
    setPembayaran({
      status_pembayaran: ["dp", "lunas"].includes(rawStatus) ? rawStatus : "dp",
      total_dp: Number(item.total_dp || 0),
      metode_pembayaran: item.metode_pembayaran?.toLowerCase() || "cash",
      diskon: Number(item.diskon || 0),
    });

    setHargaLamaDariDb(Number(item.total_harga || 0));
    setDpLamaDariDb(Number(item.total_dp || 0));

    setProduksi({
      tanggal_selesai: item.tanggal_selesai || "",
      status: item.status || "dalam_proses",
      catatan: item.catatan || "",
    });
  }, [isOpen, item]);

  if (!isOpen) return null;

  // =====================================================
  // NILAI TURUNAN (derived) — satu sumber kebenaran, tanpa effect
  // =====================================================
  const hitungSubtotalItem = (it) =>
    Number(it.harga_per_meter || 0) * Number(it.panjang || 0) * Number(it.qty || 1);

  const subTotal = items.reduce((acc, curr) => acc + hitungSubtotalItem(curr), 0);
  const nilaiDiskon = subTotal * (Number(pembayaran.diskon || 0) / 100);
  const totalHargaAkhir = Math.max(0, subTotal - nilaiDiskon);
  const minDpRequired = totalHargaAkhir * 0.3;

  const isLunas = pembayaran.status_pembayaran === "lunas";
  const isOriginallyLunas = item?.status_pembayaran?.toLowerCase() === "lunas";
  const isOriginallyDp = item?.status_pembayaran?.toLowerCase() === "dp";
  const hasNewItems = items.some((i) => !i.isFromDb);

  // Kunci tampilan ringkas hanya saat transaksi LUNAS yang belum disentuh (tanpa item baru)
  const showSimpleLunasView = isOriginallyLunas && !hasNewItems;
  // Transaksi DP murni tanpa item baru: DP lama tidak boleh diutak-atik
  const isDpLocked = isOriginallyDp && !hasNewItems;

  // Uang yang SUDAH masuk sebelumnya (read-only dari DB)
  const dibayarSebelumnya = isOriginallyLunas ? hargaLamaDariDb : dpLamaDariDb;
  // "Kekurangan karena item tambahan" = jumlah subtotal item baru saja
  const tagihanItemBaru = items
    .filter((i) => !i.isFromDb)
    .reduce((acc, curr) => acc + hitungSubtotalItem(curr), 0);

  // total_dp final yang akan ditampilkan & disimpan
  //  - Lunas  -> bayar penuh
  //  - DP + ada item baru -> dibayar lama + item baru (item baru langsung dibayar)
  //  - DP tanpa item baru -> nilai DP lama (terkunci)
  const dpFinal = isLunas
    ? totalHargaAkhir
    : hasNewItems
      ? dibayarSebelumnya + tagihanItemBaru
      : pembayaran.total_dp;

  const sisaTagihan = Math.max(0, totalHargaAkhir - dpFinal);
  const isDpInvalid = pembayaran.status_pembayaran === "dp" && (dpFinal < minDpRequired || dpFinal > totalHargaAkhir);

  // Input nominal hanya bisa diketik manual pada DP murni yang belum terkunci & tanpa item baru.
  // (Dalam konteks edit ini praktis selalu terkunci/otomatis — sistem yang menghitung.)
  const inputTerkunci = isLunas || isDpLocked || hasNewItems;

  // =====================================================
  // HANDLERS
  // =====================================================
  const updateItem = (id, field, value) => {
    setItems((prev) =>
      prev.map((prodItem) => {
        if (prodItem.id !== id) return prodItem;
        const updated = { ...prodItem, [field]: value };

        const match = daftarHarga.find(
          (d) =>
            String(d.lebar) === String(updated.lebar) &&
            d.jenis_pewarna?.trim().toLowerCase() === updated.jenis_pewarna?.trim().toLowerCase()
        );
        updated.harga_per_meter = match ? match.harga_per_meter || 0 : 0;

        return updated;
      })
    );
  };

  const handleImageUpload = async (id, e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const fileName = `${Date.now()}_custom.${file.name.split(".").pop()}`;
      const { error } = await supabase.storage.from("produk-custom").upload(fileName, file);
      if (error) throw error;

      const { data } = supabase.storage.from("produk-custom").getPublicUrl(fileName);
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, image: data.publicUrl } : it)));
    } catch (err) {
      Swal.fire("Gagal", err.message, "error");
    }
  };

  const handleUpdateSubmit = async () => {
    if (!customer.nama_customer) return Swal.fire("Peringatan", "Nama customer wajib diisi!", "warning");
    if (totalHargaAkhir <= 0) return Swal.fire("Peringatan", "Total harga harus lebih dari Rp 0.", "warning");

    for (let i = 0; i < items.length; i++) {
      const n = i + 1;
      const lebarNum = Number(items[i].lebar);
      const panjangNum = Number(items[i].panjang);

      if (!items[i].lebar || ![70, 110].includes(lebarNum)) {
        return Swal.fire("Peringatan", `Item ke-${n}: Ukuran lebar kain wajib dipilih (70 atau 110 cm)!`, "warning");
      }
      if (!items[i].panjang || panjangNum <= 0) {
        return Swal.fire("Peringatan", `Item ke-${n}: Panjang kain harus diisi angka lebih dari 0 meter!`, "warning");
      }
    }

    if (pembayaran.status_pembayaran === "dp") {
      if (dpFinal < minDpRequired) {
        return Swal.fire("Akses Ditolak", `Nominal DP minimal 30%: Rp ${Math.ceil(minDpRequired).toLocaleString("id-ID")}`, "error");
      }
      if (dpFinal > totalHargaAkhir) {
        return Swal.fire("Kesalahan Input", "Nominal DP tidak boleh melebihi total harga akhir.", "error");
      }
    }

    setLoading(true);

    try {
      const cleanItems = items.map((i) => ({
        id: i.isFromDb ? i.id : undefined,
        lebar: Number(i.lebar),
        jenis_pewarna: i.jenis_pewarna || null,
        panjang: Number(i.panjang),
        jumlah: Number(i.qty),
        harga_per_meter: Number(i.harga_per_meter),
        subtotal: hitungSubtotalItem(i),
        gambar_custom: i.image,
      }));

      const response = await fetch(`/api/pre-order-custom/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...customer,
          status_pembayaran: pembayaran.status_pembayaran,
          metode_pembayaran: pembayaran.metode_pembayaran,
          diskon: pembayaran.diskon,
          total_dp: dpFinal,
          tanggal_selesai: produksi.tanggal_selesai,
          catatan: produksi.catatan,
          total_harga: totalHargaAkhir,
          items: cleanItems,
        }),
      });

      const json = await response.json();
      if (!response.ok) throw new Error(json.message || "Gagal menyimpan perubahan");

      Swal.fire("Berhasil", "Perubahan berhasil disimpan.", "success");
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#1A335A]/48 backdrop-blur-[2px] flex items-center justify-center z-50 p-4 font-inter">

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: #1A335A transparent; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #1A335A; border-radius: 10px; }
        .react-datepicker-wrapper { width: 100% !important; }
        .react-datepicker { font-family: 'Inter', sans-serif !important; border: 1px solid #1A335A !important; border-radius: 10px !important; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1) !important; overflow: hidden; }
        .react-datepicker__header { background-color: #1A335A !important; border-bottom: 1px solid #1A335A !important; padding: 8px 0 !important; }
        .react-datepicker__current-month, .react-datepicker__day-name { color: white !important; font-weight: 700 !important; }
        .react-datepicker__day-name { color: rgba(255,255,255,0.7) !important; }
        .react-datepicker__navigation-icon::before { border-color: white !important; }
        .react-datepicker__day--selected, .react-datepicker__day--keyboard-selected { background-color: #f2b600 !important; color: white !important; font-weight: bold !important; border-radius: 6px !important; }
        .react-datepicker__day:hover { background-color: #5AE3ED30 !important; border-radius: 6px !important; }
      `}} />

      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-y-auto custom-scrollbar">

        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-sm font-bold text-black tracking-wide">Pre-Order Custom</h2>
          <button onClick={onClose} className="text-[#1A335A] hover:opacity-70 transition-opacity cursor-pointer">
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* SECTION 1: DATA CUSTOMER */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-black border-b pb-1">
              <User size={14} className="text-[#1A335A]" />
              <span>Data Customer</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px]">
              <div>
                <label className={LABEL}>Nama Customer</label>
                <input type="text" value={customer.nama_customer} onChange={(e) => setCustomer({ ...customer, nama_customer: e.target.value })} className={INPUT_CYAN} />
              </div>
              <div>
                <label className={LABEL}>No Telepon</label>
                <input type="text" value={customer.kontak_customer} onChange={(e) => setCustomer({ ...customer, kontak_customer: e.target.value })} className={INPUT_CYAN} />
              </div>
              <div>
                <label className={LABEL}>Tanggal Pre-Order</label>
                <input type="text" value={item?.created_at ? new Date(item.created_at).toLocaleDateString("id-ID") : ""} disabled className={`${INPUT_CYAN} text-gray-500 cursor-not-allowed`} />
              </div>
            </div>
            <div className="text-[11px]">
              <label className={LABEL}>Alamat</label>
              <textarea rows={2} value={customer.alamat_customer} onChange={(e) => setCustomer({ ...customer, alamat_customer: e.target.value })} className={`${INPUT_CYAN} resize-none`} />
            </div>
          </div>

          {/* SECTION 2: DATA PRODUK */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b pb-1">
              <div className="flex items-center gap-2 text-xs font-bold text-black">
                <Box size={14} className="text-[#1A335A]" />
                <span>Data Produk Custom</span>
              </div>
              <button
                type="button"
                onClick={() => setItems((prev) => [...prev, itemKosong()])}
                className="flex items-center gap-1 text-[10px] bg-[#1A335A] text-white px-3 py-1 rounded hover:bg-[#11223C] transition-all cursor-pointer"
              >
                <Plus size={12} /> Tambah Item Baru
              </button>
            </div>

            {items.map((prodItem) => (
              <div key={prodItem.id} className={`flex flex-row items-center gap-4 border rounded-xl p-4 relative group ${prodItem.isFromDb ? "bg-[#5AE3ED1C] border-dashed border-[#1A335A]" : "bg-emerald-50/60 border-dashed border-emerald-400"}`}>

                {/* Badge item baru */}
                {!prodItem.isFromDb && (
                  <span className="absolute -top-2 left-3 bg-emerald-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full shadow-sm uppercase tracking-wide">Item Baru</span>
                )}

                {/* Uploader Box */}
                <div className="w-48 h-20 flex-shrink-0">
                  {prodItem.image ? (
                    <div className="relative w-full h-full rounded-lg border bg-white flex items-center justify-center overflow-hidden">
                      <img src={prodItem.image} alt="Custom item" className="object-cover w-full h-full" />
                      <label className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white cursor-pointer transition-opacity">
                        <Upload size={14} />
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(prodItem.id, e)} className="hidden" />
                      </label>
                    </div>
                  ) : (
                    <label className="w-full h-full border border-dashed border-[#1A335A] rounded-lg bg-white flex flex-col items-center justify-center cursor-pointer text-center p-1">
                      <Upload size={14} className="text-[#1A335A] mb-0.5" />
                      <span className="text-[#1A335A]/60 text-[8.5px] leading-tight px-1">Klik untuk upload gambar</span>
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(prodItem.id, e)} className="hidden" />
                    </label>
                  )}
                </div>

                {/* Fields */}
                <div className="flex flex-1 flex-row items-end gap-3 text-[11px]">
                  <div className="flex-1 min-w-[120px]">
                    <label className={LABEL}>Lebar Kain</label>
                    <select value={prodItem.lebar} onChange={(e) => updateItem(prodItem.id, "lebar", e.target.value)} className={`${INPUT_WHITE} cursor-pointer`}>
                      <option value="">Pilih Lebar</option>
                      {[...new Set(daftarHarga.map((d) => String(d.lebar)))].map((lbl) => (
                        <option key={lbl} value={lbl}>Lebar : {lbl} cm</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center border border-[#1A335A] rounded-md bg-white h-8 overflow-hidden flex-shrink-0">
                    <button type="button" onClick={() => updateItem(prodItem.id, "qty", Math.max(1, prodItem.qty - 1))} className="px-2 text-[#1A335A] hover:bg-gray-100 h-full cursor-pointer"><Minus size={10} strokeWidth={3} /></button>
                    <span className="px-3 font-bold text-gray-800 text-xs min-w-[20px] text-center">{prodItem.qty}</span>
                    <button type="button" onClick={() => updateItem(prodItem.id, "qty", prodItem.qty + 1)} className="px-2 text-[#1A335A] hover:bg-gray-100 h-full cursor-pointer"><Plus size={10} strokeWidth={3} /></button>
                  </div>

                  <div className="flex-1 min-w-[110px]">
                    <label className={LABEL}>Pilih Pewarna</label>
                    <select value={prodItem.jenis_pewarna} onChange={(e) => updateItem(prodItem.id, "jenis_pewarna", e.target.value)} className={`${INPUT_WHITE} capitalize cursor-pointer`}>
                      <option value="">Pilih</option>
                      {[...new Set(daftarHarga.filter((d) => String(d.lebar) === String(prodItem.lebar)).map((o) => o.jenis_pewarna?.trim().toLowerCase()).filter(Boolean))].map((pw) => (
                        <option key={pw} value={pw}>{pw}</option>
                      ))}
                    </select>
                  </div>

                  <div className="w-16 flex-shrink-0">
                    <label className={`${LABEL} text-center`}>Panjang</label>
                    <input type="number" min="0" placeholder="Meter" value={prodItem.panjang || ""} onChange={(e) => updateItem(prodItem.id, "panjang", e.target.value)} className={`${INPUT_WHITE} text-center`} />
                  </div>

                  <div className="w-28 flex-shrink-0">
                    <label className={`${LABEL} text-center`}>Subtotal Harga</label>
                    <div className="w-full border border-[#1A335A]/30 bg-white rounded-md p-1.5 text-center font-bold text-gray-800 text-xs shadow-sm">
                      Rp {hitungSubtotalItem(prodItem).toLocaleString("id-ID")}
                    </div>
                  </div>
                </div>

                {/* Proteksi hapus: item lama transaksi lunas tidak boleh dihapus */}
                {items.length > 1 && (!prodItem.isFromDb || (!isOriginallyLunas && pembayaran.status_pembayaran !== "lunas")) && (
                  <button type="button" onClick={() => setItems((prev) => prev.filter((i) => i.id !== prodItem.id))} className="absolute -top-1.5 -right-1.5 bg-red-100 text-red-600 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm cursor-pointer">
                    <Trash2 size={11} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* SECTION 3: DETAIL PEMBAYARAN */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-black border-b pb-1">
              <CreditCard size={14} className="text-[#1A335A]" />
              <span>Detail Pembayaran</span>
            </div>

            {/* WARNING: ada item baru pada transaksi yang sudah berjalan */}
            {hasNewItems && (isOriginallyLunas || isOriginallyDp) && (
              <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 text-[11px]">
                <span className="font-bold flex items-center gap-1 text-amber-700">⚠️ Penambahan Item Baru</span>
                <p className="text-amber-900 mt-1">
                  {isOriginallyLunas
                    ? <>Transaksi ini sebelumnya sudah <strong>LUNAS</strong> (Rp {dibayarSebelumnya.toLocaleString("id-ID")}). Pembayaran lama dibiarkan, customer cukup membayar harga item baru berikut:</>
                    : <>DP yang sudah dibayar (Rp {dibayarSebelumnya.toLocaleString("id-ID")}) dibiarkan. Karena ada item baru, customer membayar tambahan sebesar harga item baru berikut:</>}
                </p>
                <div className="mt-2 flex items-baseline justify-between bg-white border border-amber-200 rounded-md px-3 py-2">
                  <span className="text-[10px] text-gray-500 font-medium">Tagihan Item Baru</span>
                  <span className="text-sm font-black text-emerald-700">Rp {tagihanItemBaru.toLocaleString("id-ID")}</span>
                </div>
              </div>
            )}

            <div className="bg-[#5AE3ED1C] border border-[#1A335A]/20 rounded-xl p-5 space-y-4 text-[11px]">
              {showSimpleLunasView ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div className="p-3 bg-white border border-[#1A335A]/20 rounded-lg shadow-sm">
                    <span className="block text-black font-medium mb-1">Metode Pembayaran</span>
                    <span className="text-xs font-bold text-gray-800 capitalize">{pembayaran.metode_pembayaran}</span>
                  </div>
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg shadow-sm space-y-1.5">
                    <div className="flex justify-between text-gray-500 text-[10px]">
                      <span>Subtotal: Rp {subTotal.toLocaleString("id-ID")}</span>
                      <span className="text-emerald-700 font-medium">Diskon: {pembayaran.diskon}%</span>
                    </div>
                    <hr className="border-emerald-200" />
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="block text-emerald-600 font-medium text-[9px]">Status</span>
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">LUNAS</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-gray-400 text-[9px]">Total Nilai Kontrak</span>
                        <span className="text-xs font-black text-gray-800">Rp {totalHargaAkhir.toLocaleString("id-ID")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-black font-semibold mb-1">Status Pembayaran</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        disabled={isDpLocked}
                        onClick={() => setPembayaran({ ...pembayaran, status_pembayaran: "dp" })}
                        className={`py-2 rounded-lg font-bold text-center text-xs border transition-all cursor-pointer ${
                          pembayaran.status_pembayaran === "dp" ? "bg-[#1A335A] text-white border-[#1A335A] shadow-sm" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        } ${isDpLocked ? "bg-gray-100 text-gray-700 border-gray-300 !cursor-not-allowed shadow-none" : ""}`}
                      >
                        {isDpLocked ? "DP (Sudah Dibayar)" : "DP (Uang Muka)"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPembayaran({ ...pembayaran, status_pembayaran: "lunas" })}
                        className={`py-2 rounded-lg font-bold text-center text-xs border transition-all cursor-pointer ${
                          isLunas ? "bg-[#1A335A] text-white border-[#1A335A] shadow-sm" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        Lunas
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-black font-semibold mb-1">
                      {isLunas ? "Total Dana Diterima (Lunas)" : "Total Dana yang Telah Diterima"}
                    </label>
                    <div className={`flex rounded-lg border overflow-hidden px-3 py-2.5 items-center bg-white transition-colors ${isDpInvalid ? "border-red-400" : isLunas ? "border-emerald-300 bg-emerald-50/40" : "border-[#1A335A]"}`}>
                      <span className="text-gray-500 text-xs mr-2 font-medium">Rp</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        name="nominal-dp-custom"
                        autoComplete="off"
                        data-lpignore="true"
                        value={formatRibuan(dpFinal)}
                        disabled={inputTerkunci}
                        onChange={(e) => setPembayaran({ ...pembayaran, total_dp: parseRibuan(e.target.value) })}
                        className={`nominal-input w-full bg-transparent focus:outline-none text-sm font-bold tracking-wide ${inputTerkunci ? (isLunas ? "text-emerald-700 cursor-not-allowed" : "text-gray-600 cursor-not-allowed") : "text-gray-900"}`}
                      />
                    </div>

                    {/* Sisa tagihan (status DP) */}
                    {pembayaran.status_pembayaran === "dp" && (
                      <div className="flex justify-between items-center mt-2 bg-red-50 border border-red-200 rounded-lg p-2 text-[10px]">
                        <span className="text-red-700 font-medium">Sisa Tagihan / Kekurangan:</span>
                        <span className="font-black text-red-600 text-xs">Rp {sisaTagihan.toLocaleString("id-ID")}</span>
                      </div>
                    )}

                    {/* Info pelunasan tambahan saat pilih Lunas + ada item baru */}
                    {isLunas && hasNewItems && (
                      <div className="flex justify-between items-center mt-2 bg-emerald-50 border border-emerald-300 rounded-lg p-2 text-[10px]">
                        <span className="text-emerald-800 font-bold flex items-center gap-1">💰 Dibayar saat ini (harga item baru):</span>
                        <span className="font-black text-emerald-700 text-xs bg-white border border-emerald-300 rounded px-2 py-0.5">Rp {tagihanItemBaru.toLocaleString("id-ID")}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-5 relative">
                      <label className="block text-black font-semibold mb-1">Metode Pembayaran</label>
                      <div className="relative">
                        <select value={pembayaran.metode_pembayaran} onChange={(e) => setPembayaran({ ...pembayaran, metode_pembayaran: e.target.value })} className="w-full border border-[#1A335A] bg-white rounded-lg p-2.5 pr-10 focus:outline-none text-gray-700 appearance-none text-xs cursor-pointer">
                          <option value="cash">Cash</option>
                          <option value="transfer">Transfer</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#1A335A]">
                          <ChevronDown size={14} />
                        </div>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-black font-semibold mb-1">Diskon</label>
                      <input type="text" value={pembayaran.diskon ? `${pembayaran.diskon}%` : ""} placeholder="0%" onChange={(e) => setPembayaran({ ...pembayaran, diskon: Number(e.target.value.replace("%", "")) || 0 })} className="w-full border border-[#1A335A] bg-white rounded-lg p-2.5 text-center focus:outline-none font-medium text-xs" />
                    </div>

                    <div className="md:col-span-5">
                      <label className="block text-black font-semibold mb-1">Total Harga</label>
                      <div className="bg-white border border-[#1A335A] rounded-lg p-3 space-y-1.5 text-[11px] shadow-sm">
                        <div className="flex justify-between text-gray-500"><span>Sub Total</span><span className="font-semibold text-gray-700">Rp {subTotal.toLocaleString("id-ID")}</span></div>
                        <div className="flex justify-between text-gray-500"><span>Diskon</span><span className="font-semibold text-gray-700">{pembayaran.diskon || 0}%</span></div>
                        <hr className="border-gray-200" />
                        <div className="flex justify-between text-gray-900 font-bold pt-0.5"><span>Total Kontrak</span><span>Rp {totalHargaAkhir.toLocaleString("id-ID")}</span></div>

                        {hasNewItems && (
                          <>
                            <hr className="border-dashed border-gray-200" />
                            <div className="flex justify-between text-emerald-600 font-medium">
                              <span>Sudah Dibayar</span>
                              <span>- Rp {dibayarSebelumnya.toLocaleString("id-ID")}</span>
                            </div>
                            <div className="flex justify-between text-emerald-700 font-medium">
                              <span>Bayar Item Baru</span>
                              <span>- Rp {tagihanItemBaru.toLocaleString("id-ID")}</span>
                            </div>
                            <div className={`flex justify-between font-bold p-1 rounded ${sisaTagihan > 0 ? "text-red-600 bg-red-50/50" : "text-emerald-700 bg-emerald-50/50"}`}>
                              <span>{sisaTagihan > 0 ? "Sisa Tagihan" : "Lunas"}</span>
                              <span>Rp {sisaTagihan.toLocaleString("id-ID")}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* SECTION 4: ESTIMASI & STATUS PRODUKSI */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[11px]">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-black border-b pb-1">
                <Calendar size={14} className="text-[#1A335A]" />
                <span>Estimasi Produk Jadi</span>
              </div>
              <div>
                <label className={LABEL}>Tanggal Estimasi Selesai</label>
                <div className="relative flex items-center">
                  <Calendar size={14} className="absolute left-3 text-[#A47352] pointer-events-none z-10" />
                  <DatePicker
                    selected={produksi.tanggal_selesai ? new Date(produksi.tanggal_selesai) : null}
                    onChange={(date) => {
                      if (date) {
                        const yyyy = date.getFullYear();
                        const mm = String(date.getMonth() + 1).padStart(2, "0");
                        const dd = String(date.getDate()).padStart(2, "0");
                        setProduksi({ ...produksi, tanggal_selesai: `${yyyy}-${mm}-${dd}` });
                      } else {
                        setProduksi({ ...produksi, tanggal_selesai: "" });
                      }
                    }}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Pilih Tanggal Selesai"
                    className="w-full border border-[#A47352] bg-[#FFE176] rounded-lg py-2 pl-9 pr-3 focus:outline-none font-bold text-black text-xs cursor-pointer text-left"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-black border-b pb-1">
                <Box size={14} className="text-[#1A335A]" />
                <span>Status Produksi</span>
              </div>
              <div>
                <label className={LABEL}>Status Produksi Aktif</label>
                <div className="w-full bg-gray-100 border border-gray-300 text-gray-700 font-bold rounded-lg p-2.5 text-xs capitalize">
                  {produksi.status ? produksi.status.replace(/_/g, " ") : "Belum diproses"}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 5: CATATAN */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-black border-b pb-1">Catatan</label>
            <textarea rows={3} value={produksi.catatan} onChange={(e) => setProduksi({ ...produksi, catatan: e.target.value })} className={`${INPUT_CYAN} text-[11px] resize-none`} placeholder="Tambahkan catatan khusus pengerjaan lurik di sini..." />
          </div>

          {/* SUBMIT */}
          <button type="button" disabled={loading} onClick={handleUpdateSubmit} className="w-full py-3 bg-[#f2b600] hover:bg-[#d9a300] text-white rounded-lg font-bold text-xs transition-all tracking-wide shadow disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
            {loading ? "Menyimpan Perubahan..." : "Simpan"}
          </button>

        </div>
      </div>
    </div>
  );
}