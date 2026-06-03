'use client';

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import Swal from "sweetalert2";
import { supabase } from "@/lib/supabaseClient";
import "react-datepicker/dist/react-datepicker.css";

// Import Sub-Komponen Modular
import CustomerSection from "./CustomerSection";
import ProductSection from "./ProductSection";
import PaymentSection from "./PaymentSection";
import ProductionSection from "./ProductionSection";
import SuccessModal from "./SuccessModal";

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
  const [showSuccess, setShowSuccess] = useState(false);

  // --- STATE DATA FORM ---
  const [customer, setCustomer] = useState({ nama_customer: "", kontak_customer: "", alamat_customer: "" });
  const [items, setItems] = useState([]);
  const [pembayaran, setPembayaran] = useState({ status_pembayaran: "dp", total_dp: 0, metode_pembayaran: "cash", diskon: 0 });
  const [produksi, setProduksi] = useState({ tanggal_selesai: "", status: "dalam_proses", catatan: "" });

  const [hargaLamaDariDb, setHargaLamaDariDb] = useState(0); 
  const [dpLamaDariDb, setDpLamaDariDb] = useState(0);      

  // --- Ambil master harga ---
  useEffect(() => {
    if (isOpen) {
      fetch("/api/daftar-harga")
        .then((res) => res.json())
        .then((res) => setDaftarHarga(res.data || []))
        .catch((err) => console.error("Gagal ambil master harga:", err));
    }
  }, [isOpen]);

  // --- Set data awal saat modal dibuka ---
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

  // =====================================================
  // NILAI TURUNAN (derived state)
  // =====================================================
  const hitungSubtotalItem = (it) =>
    Number(it.harga_per_meter || 0) * Number(it.panjang || 0) * Number(it.qty || 1);

  const subTotalLama = items.filter((i) => i.isFromDb).reduce((acc, c) => acc + hitungSubtotalItem(c), 0);
  const subTotalBaru = items.filter((i) => !i.isFromDb).reduce((acc, c) => acc + hitungSubtotalItem(c), 0);
  const subTotal = subTotalLama + subTotalBaru;

  const nilaiDiskon = subTotalLama * (Number(pembayaran.diskon || 0) / 100);
  const totalHargaAkhir = Math.max(0, subTotal - nilaiDiskon);
  const minDpRequired = totalHargaAkhir * 0.3;

  const isLunas = pembayaran.status_pembayaran === "lunas";
  const isOriginallyLunas = item?.status_pembayaran?.toLowerCase() === "lunas";
  const isOriginallyDp = item?.status_pembayaran?.toLowerCase() === "dp";
  const hasNewItems = items.some((i) => !i.isFromDb);

  const isDiskonLocked = isOriginallyLunas;
  const showSimpleLunasView = isOriginallyLunas && !hasNewItems;
  const isDpLocked = isOriginallyDp && !hasNewItems;

  const dibayarSebelumnya = isOriginallyLunas ? hargaLamaDariDb : dpLamaDariDb;
  const tagihanItemBaru = subTotalBaru;
  const minDpItemBaru = tagihanItemBaru * 0.3;

  const bayarSekarang = isLunas
    ? Math.max(0, totalHargaAkhir - dibayarSebelumnya)
    : hasNewItems
      ? (pembayaran.total_dp > 0 ? pembayaran.total_dp : Math.ceil(minDpItemBaru))
      : pembayaran.total_dp;

  const dpFinal = isLunas
    ? totalHargaAkhir
    : hasNewItems
      ? dibayarSebelumnya + bayarSekarang
      : pembayaran.total_dp;

  const sisaTagihan = Math.max(0, totalHargaAkhir - dpFinal);

  const isDpInvalid =
    pembayaran.status_pembayaran === "dp" &&
    (hasNewItems
      ? (bayarSekarang < minDpItemBaru || bayarSekarang > tagihanItemBaru)
      : (dpFinal < minDpRequired || dpFinal > totalHargaAkhir));

  const inputTerkunci = isLunas || (isDpLocked && !hasNewItems) || (!hasNewItems);

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
      if (hasNewItems) {
        if (bayarSekarang < minDpItemBaru) {
          return Swal.fire("Akses Ditolak", `DP item baru minimal 30%: Rp ${Math.ceil(minDpItemBaru).toLocaleString("id-ID")}`, "error");
        }
        if (bayarSekarang > tagihanItemBaru) {
          return Swal.fire("Kesalahan Input", "DP item baru tidak boleh melebihi harga item baru.", "error");
        }
      } else {
        if (dpFinal < minDpRequired) {
          return Swal.fire("Akses Ditolak", `Nominal DP minimal 30%: Rp ${Math.ceil(minDpRequired).toLocaleString("id-ID")}`, "error");
        }
        if (dpFinal > totalHargaAkhir) {
          return Swal.fire("Kesalahan Input", "Nominal DP tidak boleh melebihi total harga akhir.", "error");
        }
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

      setShowSuccess(true);
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // RENDER ONDITIONAL MANAGEMENT
  // =====================================================
  if (!isOpen) return null;

  // Jika sukses, Form utama langsung dilepas/ditutup dan diganti SuccessModal
  if (showSuccess) {
    return (
      <SuccessModal 
        isOpen={showSuccess} 
        onClose={() => { 
          setShowSuccess(false); 
          onClose(); // Menutup modal utama di komponen parent
          if (onSuccess) onSuccess(); // Memperbarui data halaman belakang
        }} 
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-[#1A335A]/48 backdrop-blur-[2px] flex items-center justify-center z-50 p-4 font-inter">
      {/* Datepicker global CSS template injection */}
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
          <CustomerSection 
            customer={customer} 
            setCustomer={setCustomer} 
            createdAt={item?.created_at} 
            labelStyle={LABEL} 
            inputStyle={INPUT_CYAN} 
          />

          {/* SECTION 2: DATA PRODUK */}
          <ProductSection 
            items={items} 
            setItems={setItems} 
            daftarHarga={daftarHarga} 
            updateItem={updateItem} 
            handleImageUpload={handleImageUpload} 
            hitungSubtotalItem={hitungSubtotalItem} 
            itemKosong={itemKosong} 
            isOriginallyLunas={isOriginallyLunas} 
            statusPembayaran={pembayaran.status_pembayaran} 
            labelStyle={LABEL} 
            inputWhiteStyle={INPUT_WHITE} 
          />

          {/* SECTION 3: DETAIL PEMBAYARAN */}
          <PaymentSection 
            pembayaran={pembayaran} 
            setPembayaran={setPembayaran} 
            hasNewItems={hasNewItems} 
            isOriginallyLunas={isOriginallyLunas} 
            isOriginallyDp={isOriginallyDp} 
            dibayarSebelumnya={dibayarSebelumnya} 
            tagihanItemBaru={tagihanItemBaru} 
            minDpItemBaru={minDpItemBaru} 
            showSimpleLunasView={showSimpleLunasView} 
            isDpLocked={isDpLocked} 
            isDiskonLocked={isDiskonLocked} 
            bayarSekarang={bayarSekarang} 
            sisaTagihan={sisaTagihan} 
            isDpInvalid={isDpInvalid} 
            inputTerkunci={inputTerkunci} 
            subTotal={subTotal} 
            nilaiDiskon={nilaiDiskon} 
            subTotalBaru={subTotalBaru} 
            totalHargaAkhir={totalHargaAkhir} 
            formatRibuan={formatRibuan} 
            parseRibuan={parseRibuan} 
          />

          {/* SECTION 4: ESTIMASI & STATUS PRODUKSI */}
          <ProductionSection 
            produksi={produksi} 
            setProduksi={setProduksi} 
            labelStyle={LABEL} 
          />

          {/* SECTION 5: CATATAN */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-black border-b pb-1">Catatan</label>
            <textarea 
              rows={3} 
              value={produksi.catatan} 
              onChange={(e) => setProduksi({ ...produksi, catatan: e.target.value })} 
              className={`${INPUT_CYAN} text-[11px] resize-none`} 
              placeholder="Tambahkan catatan khusus pengerjaan lurik di sini..." 
            />
          </div>

          {/* SUBMIT */}
          <button 
            type="button" 
            disabled={loading} 
            onClick={handleUpdateSubmit} 
            className="w-full py-3 bg-[#f2b600] hover:bg-[#d9a300] text-white rounded-lg font-bold text-xs transition-all tracking-wide shadow disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? "Menyimpan Perubahan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}