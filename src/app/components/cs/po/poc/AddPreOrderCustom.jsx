'use client';

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { CornerDownLeft } from "lucide-react";
import { useOrderStore } from "../../../../store/useOrderStore";
import { supabase } from "@/lib/supabaseClient";

// Impor sub-komponen
import CustomerForm from "./CustomerForm";
import ProductItemsList from "./ProductItemsList";

export default function AddPreOrderCustom() {
  const router = useRouter();
  const { orderData, setOrderData } = useOrderStore();

  // Penanda untuk mengetahui apakah user keluar karena klik "Lanjut Pembayaran"
  const isMovingToPayment = useRef(false);

  const [daftarHarga, setDaftarHarga] = useState([]);
  const [customer, setCustomer] = useState(orderData?.customer || {
    nama: "", telpon: "", tgl: "", alamat: "",
  });
  const [items, setItems] = useState(orderData?.items || [
    { id: Date.now(), lebar: "", jenis_pewarna: "", qty: 1, panjang: "", harga_per_meter: 0, image: null },
  ]);

  const isFormValid = () => {
    const customerValid = customer.nama && customer.telpon && customer.tgl && customer.alamat;
    const itemsValid = items.every(item =>
      item.lebar && item.jenis_pewarna && item.panjang > 0 && item.image
    );
    return customerValid && itemsValid;
  };

  useEffect(() => {
    fetch("/api/daftar-harga")
      .then((res) => res.json())
      .then((res) => setDaftarHarga(res.data || []))
      .catch((err) => console.error("Gagal ambil harga:", err));

    // ========================================================
    // CLEANUP EFFECT: Berjalan saat CS meninggalkan halaman ini
    // ========================================================
    return () => {
      if (!isMovingToPayment.current) {
        console.log("🧹 [DEBUG] CS keluar dari form, menghapus cache global store...");
        setOrderData({ customer: null, items: null });
      }
    };
  }, [setOrderData]);

  // ❌ [DIHAPUS] Link sinkronisasi otomatis tiap render via useEffect dibuang 
  // karena memicu bug tipe data fungsi & race condition saat unmount.

  const updateItem = (id, field, value) => {
    setItems((prev) => prev.map((item) => {
      if (item.id !== id) return item;
      let updated = { ...item, [field]: value };

      // Filter opsi berdasarkan lebar kain saat ini
      const options = daftarHarga.filter((d) => String(d.lebar) === String(updated.lebar));

      if (field === 'lebar' && options.length > 0) {
        // AUTO-FILL: ambil jenis pewarna unik pertama yang tersedia
        const uniquePewarna = [...new Set(options.map(o => o.jenis_pewarna))];
        updated.jenis_pewarna = uniquePewarna[0] || "";

        // Cari aturan harga (prioritaskan yang umum/tanpa motif karena ini custom order)
        const foundHarga = options.find((d) =>
          d.jenis_pewarna === updated.jenis_pewarna && (d.motif === null || !d.motif_id)
        ) || options.find((d) => d.jenis_pewarna === updated.jenis_pewarna);

        updated.harga_per_meter = foundHarga ? foundHarga.harga_per_meter : 0;
        updated.produk_id = foundHarga ? (foundHarga.id || foundHarga.produk_id) : null;
      }

      if (field === "jenis_pewarna") {
        const found = options.find((d) =>
          d.jenis_pewarna === value && (d.motif === null || !d.motif_id)
        ) || options.find((d) => d.jenis_pewarna === value);

        updated.harga_per_meter = found ? found.harga_per_meter : 0;
        updated.produk_id = found ? (found.id || found.produk_id) : null;
      }

      updated.totalHargaItem = Number(updated.harga_per_meter) * Number(updated.panjang || 0) * Number(updated.qty || 0);
      return updated;
    }));
  };

  const addItem = () => setItems((prev) => [...prev, { id: Date.now(), lebar: "", jenis_pewarna: "", qty: 1, panjang: "", harga_per_meter: 0, image: null }]);
  const removeItem = (id) => setItems((prev) => (prev.length > 1 ? prev.filter(item => item.id !== id) : prev));
  const calculateTotal = (item) => Number(item.harga_per_meter) * Number(item.panjang || 0) * Number(item.qty || 0);

  // Aksi saat klik tombol lanjut ke pembayaran
  const handleNextPage = () => {
    isMovingToPayment.current = true;
    
    // 🎯 SOLUSI UTAMA: Simpan data dalam bentuk OBJECT MURNI langsung sebelum pindah page
    setOrderData({ customer, items });
    
    router.push("/dashboard/cs/order/poc/pembayaran");
  };

  const handleImageChange = async (id, e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${file.name.split(".").pop()}`;
      const { error: uploadError } = await supabase.storage.from("produk-custom").upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("produk-custom").getPublicUrl(fileName);
      setItems((prev) => prev.map((item) => item.id === id ? { ...item, image: data.publicUrl } : item));
    } catch (err) {
      alert("Gagal upload: " + err.message);
    }
  };

  return (
    <div className="w-full mx-auto bg-[#5AE3ED1C] border rounded-lg p-6 space-y-3 font-inter shadow-sm">

      <div className="flex items-center justify-between">
        <h1 className="text-md font-reguler text-[#1A335A] tracking-wide capitalize">
          Pre Order Custom
        </h1>

        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1.5 bg-[#1A335A] text-white text-sm px-4 py-2 rounded-full font-medium transition-all hover:bg-[#274b84] active:scale-[0.98]"
        >
          <CornerDownLeft size={14} strokeWidth={2.5} />
          <span>kembali</span>
        </button>
      </div>

      {/* Konten Form */}
      <div className="space-y-6">
        <CustomerForm
          customer={customer}
          setCustomer={setCustomer}
        />

        <ProductItemsList
          items={items}
          daftarHarga={daftarHarga}
          updateItem={updateItem}
          removeItem={removeItem}
          addItem={addItem}
          handleImageChange={handleImageChange}
          calculateTotal={calculateTotal}
        />
      </div>

      {/* Tombol Lanjut Pembayaran */}
      <button
        type="button"
        onClick={handleNextPage}
        disabled={!isFormValid()}
        className={`w-full py-4 rounded-[12px] font-bold text-sm transition-all shadow-md 
          ${isFormValid()
            ? "bg-[#F2B600] hover:bg-[#ca9804] text-white active:scale-[0.99]"
            : "bg-stone-300 text-stone-600 cursor-not-allowed"}`}
      >
        Lanjut Pembayaran
      </button>
    </div>
  );
}