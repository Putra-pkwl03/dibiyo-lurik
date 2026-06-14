"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, CornerDownLeft, X, User, Calendar } from "lucide-react";
import { useOrderStore } from "../../../../../store/useOrderStore";
import ProductSelectionModal from "../../../../../components/cs/produk/ProductSelectionModal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Helper dapatkan tanggal hari ini format YYYY-MM-DD
const getTodayDate = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export default function AddPreOrderReguler() {
  const router = useRouter();
  const { orderData, setOrderData } = useOrderStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [daftarHarga, setDaftarHarga] = useState([]);

  // Auto-set tanggal hari ini jika data customer baru diinisialisasi
  const [customer, setCustomer] = useState({
    nama: orderData?.customer?.nama || "",
    telpon: orderData?.customer?.telpon || "",
    tgl: orderData?.customer?.tgl || getTodayDate(),
    alamat: orderData?.customer?.alamat || "",
  });

  // Sinkronisasi data customer ke Zustand
  useEffect(() => {
    setOrderData({ ...orderData, customer });
  }, [customer]);

  // ENGINE UTAMA: Fungsi pencari harga cerdas berdasarkan master data API
  const hitungHargaItem = (lebar, jenisPewarna, itemData) => {
    if (!lebar || !jenisPewarna || daftarHarga.length === 0) return 0;

    // Standardisasi input pewarna agar sinkron dengan enum DB ('sintetis' / 'alami')
    let targetPewarna = String(jenisPewarna).trim().toLowerCase();
    if (targetPewarna === "alam") targetPewarna = "alami";

    // Ambil ID motif dari berbagai kemungkinan struktur payload produk/modal
    const currentMotifId = itemData.motif_id || itemData.motif?.id || itemData.id_motif || itemData.id;

    // Langkah 1: Cari harga spesifik untuk motif + lebar + jenis pewarna ini
    let match = daftarHarga.find((d) => {
      const matchLebar = String(d.lebar) === String(lebar);
      const matchPewarna = String(d.jenis_pewarna).trim().toLowerCase() === targetPewarna;
      const apiMotifId = d.motif?.id || null;

      return matchLebar && matchPewarna && apiMotifId && String(apiMotifId) === String(currentMotifId);
    });

    // Langkah 2: Jika tidak ada harga spesifik motif, ambil harga global (motif_id di DB nilainya null)
    if (!match) {
      match = daftarHarga.find((d) => {
        const matchLebar = String(d.lebar) === String(lebar);
        const matchPewarna = String(d.jenis_pewarna).trim().toLowerCase() === targetPewarna;
        const apiMotifId = d.motif?.id || null;

        return matchLebar && matchPewarna && !apiMotifId;
      });
    }

    return match ? parseFloat(match.harga_per_meter) || 0 : 0;
  };

  // Ambil data master daftar harga dari backend saat komponen dimuat
  useEffect(() => {
    fetch("/api/daftar-harga")
      .then((res) => res.json())
      .then((res) => {
        const dataHarga = res.data || [];
        setDaftarHarga(dataHarga);
      })
      .catch((err) => console.error("Gagal ambil daftar harga:", err));
  }, []);

  // Trigger kalkulasi ulang setiap kali daftar master harga berhasil dimuat atau item berubah
  useEffect(() => {
    if (daftarHarga.length > 0 && orderData?.items?.length > 0) {
      // Cek apakah ada item yang harganya masih salah/belum terhitung
      const needUpdate = orderData.items.some((item) => {
        const tepatHarga = hitungHargaItem(item.lebar, item.jenis_pewarna, item);
        const totalSeharusnya = tepatHarga * (parseFloat(item.panjang) || 0) * (parseInt(item.qty) || 1);
        return item.harga !== tepatHarga || item.totalHargaItem !== totalSeharusnya;
      });

      if (needUpdate) {
        const updatedItems = orderData.items.map((item) => {
          const hargaMurni = hitungHargaItem(item.lebar, item.jenis_pewarna, item);
          const panjang = parseFloat(item.panjang) || 0;
          const qty = parseInt(item.qty) || 1;
          return {
            ...item,
            harga: hargaMurni,
            totalHargaItem: hargaMurni * panjang * qty
          };
        });
        setOrderData({ ...orderData, items: updatedItems });
      }
    }
  }, [daftarHarga, orderData?.items]);

  const updateProductField = (index, field, value) => {
    const newItems = [...(orderData.items || [])];
    if (!newItems[index]) return;

    // Update field dasar
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Hitung ulang harga satuan & total harga secara real-time
    const item = newItems[index];
    const hargaMurni = hitungHargaItem(item.lebar, item.jenis_pewarna, item);
    const panjang = parseFloat(item.panjang) || 0;
    const qty = parseInt(item.qty) || 1;

    newItems[index].harga = hargaMurni;
    newItems[index].totalHargaItem = hargaMurni * panjang * qty;

    setOrderData({ ...orderData, items: newItems });
  };

  const handleAddItems = (newSelectedProducts) => {
    const currentItems = orderData.items || [];
    const newItems = [
      ...currentItems,
      ...newSelectedProducts.map((p) => {
        const defaultPewarna = p.jenis_pewarna || "";
        const defaultLebar = p.lebar || "";
        const hargaMurni = hitungHargaItem(defaultLebar, defaultPewarna, p);

        return {
          ...p,
          lebar: defaultLebar,
          jenis_pewarna: defaultPewarna,
          qty: 1,
          panjang: 0,
          harga: hargaMurni,
          totalHargaItem: 0,
        };
      }),
    ];
    setOrderData({ ...orderData, items: newItems });
  };

  const removeItem = (index) => {
    if ((orderData.items || []).length > 1) {
      const newItems = orderData.items.filter((_, i) => i !== index);
      setOrderData({ ...orderData, items: newItems });
    } else {
      alert("Minimal harus ada satu item dalam order.");
    }
  };

  if (!orderData?.items || orderData.items.length === 0) {
    return (
      <div className="p-10 text-center text-black">
        <p className="mb-4">Data produk belanjaan masih kosong.</p>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-[#1A335A] text-white rounded-lg text-sm"
        >
          + Pilih Produk Utama
        </button>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto space-y-6">
      {/* Inject Kustomisasi Tema Datepicker Navy, Cyan & Gold secara Global */}
      <style jsx global>{`
        .react-datepicker-wrapper {
          width: 100%;
        }
        .react-datepicker {
          border: 1px solid #1A335A !important;
          background: #FDFDFD !important;
          font-family: inherit;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border-radius: 8px !important;
        }
        .react-datepicker__header {
          background: #1A335A !important;
          border-bottom: 1px solid #1A335A !important;
          border-top-left-radius: 7px !important;
          border-top-right-radius: 7px !important;
          padding-top: 10px !important;
        }
        .react-datepicker__current-month,
        .react-datepicker__day-name {
          color: #FFFFFF !important;
          font-weight: 600;
        }
        .react-datepicker__day {
          color: #1A335A !important;
          font-weight: 600;
        }
        .react-datepicker__day:hover {
          background-color: rgba(90, 227, 237, 0.25) !important;
          color: #1A335A !important;
          border-radius: 4px;
        }
        .react-datepicker__day--selected {
          background: #F2B600 !important;
          color: #FFFFFF !important;
          border-radius: 4px !important;
        }
        .react-datepicker__day--keyboard-selected {
          background: rgba(90, 227, 237, 0.4) !important;
          color: #1A335A !important;
        }
      `}</style>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-800">Pre-Order Reguler</h1>
      </div>

      {/* Container Data Customer */}
      <div className="relative bg-[#5AE3ED1C] border border-[#1A335A] rounded-lg p-6 shadow-sm font-inter space-y-5">
        <button
          onClick={() => router.push("/dashboard/cs/order")}
          className="absolute flex items-center gap-2 px-3 py-1 text-sm font-medium transition-all bg-[#1A335A] border border-[#1A335A] rounded-xl top-4 right-4 text-[#f7efe9] hover:bg-[#264982]"
        >
          <CornerDownLeft size={16} /> kembali
        </button>

        <div className="flex items-center gap-2 text-sm font-semibold text-black select-none">
          <User size={18} strokeWidth={2.5} className="opacity-90" />
          <h2 className="text-black">Data Customer</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 text-xs md:grid-cols-3">
          {/* Nama Customer */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-black font-bold tracking-wide">Nama Customer</label>
            <input
              type="text"
              name="nama-customer-por"
              autoComplete="off"
              data-lpignore="true"
              placeholder="Masukkan Nama"
              value={customer.nama}
              className="w-full h-[38px] px-3 bg-[#F1E9E987] border border-[#1A335A] rounded-[10px] text-black placeholder-black/60 outline-none focus:border-[#1A335A] transition-colors"
              onChange={(e) => setCustomer({ ...customer, nama: e.target.value })}
            />
          </div>

          {/* No Telpon */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-black font-bold tracking-wide">No Telpon</label>
            <input
              type="text"
              name="telpon-customer-por"
              autoComplete="off"
              data-lpignore="true"
              placeholder="Masukkan No Telpon"
              value={customer.telpon}
              className="w-full h-[38px] px-3 bg-[#F1E9E987] border border-[#1A335A] rounded-[10px] text-black placeholder-black/60 outline-none focus:border-[#1A335A] transition-colors"
              onChange={(e) => {
                // Regex untuk memfilter hanya angka saja
                const hanyaAngka = e.target.value.replace(/[^0-9]/g, "");
                setCustomer({ ...customer, telpon: hanyaAngka });
              }}
            />
          </div>

          {/* Tanggal Pre-Order dengan React Datepicker */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-black font-bold tracking-wide">Tanggal Pre-Order Reguler</label>
            <div className="relative w-full">
              <DatePicker
                selected={customer.tgl ? new Date(customer.tgl) : null}
                onChange={(date) => {
                  if (date) {
                    const yyyy = date.getFullYear();
                    const mm = String(date.getMonth() + 1).padStart(2, '0');
                    const dd = String(date.getDate()).padStart(2, '0');
                    setCustomer({ ...customer, tgl: `${yyyy}-${mm}-${dd}` });
                  } else {
                    setCustomer({ ...customer, tgl: "" });
                  }
                }}
                dateFormat="yyyy-MM-dd"
                placeholderText="Pilih Tanggal"
                wrapperClassName="w-full"
                className="w-full h-[38px] px-3 bg-[#F1E9E987] border border-[#1A335A] rounded-[10px] text-black font-bold outline-none focus:border-[#1A335A] transition-colors cursor-pointer placeholder-black/60"
              />
              <Calendar
                size={14}
                className="absolute text-black -translate-y-1/2 pointer-events-none right-3 top-1/2"
              />
            </div>
          </div>

          {/* Alamat */}
          <div className="col-span-1 md:col-span-3 space-y-1.5">
            <label className="text-[11px] text-black font-bold tracking-wide">Alamat</label>
            <textarea
              placeholder="Alamat lengkap..."
              value={customer.alamat}
              className="w-full h-[60px] p-3 bg-[#F1E9E987] border border-[#1A335A] rounded-[10px] text-black placeholder-black/60 outline-none focus:border-[#1A335A] transition-colors resize-none"
              onChange={(e) => setCustomer({ ...customer, alamat: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Data List Produk */}
      <div className="p-6 bg-[#5AE3ED1C] border shadow-sm rounded-lg mt-3">
        <h2 className="mb-4 font-semibold text-stone-700">Data Produk</h2>
        {orderData.items.map((item, index) => (
          <div
            key={index}
            className="relative flex flex-col md:flex-row items-center gap-4 p-4 mb-4 bg-[#F1E9E987] border border-[#1A335A] rounded-xl"
          >
            <button
              onClick={() => removeItem(index)}
              className="absolute text-black transition-colors top-2 right-2 hover:text-red-600"
            >
              <X size={16} />
            </button>

            <img
              src={item.gambar_url || "/placeholder-cloth.png"}
              className="object-cover w-32 h-32 border rounded-lg border-stone-300"
              alt="produk"
            />

            <div className="flex flex-col items-center flex-1 gap-6 md:flex-row">
              <div className="flex flex-col gap-2 min-w-[150px]">
                <div>
                  <p className="text-xs text-gray-500">Kode Produksi</p>
                  <p className="text-sm font-bold text-black">{item.kode_produk}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Kategori</p>
                  <p className="text-sm font-semibold text-black">{item.kategori?.nama || item.nama_kategori || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Motif</p>
                  <p className="text-sm font-semibold text-black">{item.motif?.nama || item.nama_motif || "-"}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center flex-1 gap-4 border-t md:border-t-0 md:border-l border-[#1A335A]/20 pt-4 md:pt-0 md:pl-4">
                
                {/* Select Lebar Kain */}
                <div className="w-32">
                  <p className="text-xs text-black">Lebar Kain</p>
                  <select
                    className="w-full p-2 bg-[#5AE3ED1C] text-black rounded-md border-b border-[#1A335A] outline-none text-sm cursor-pointer font-semibold"
                    value={item.lebar || ""}
                    onChange={(e) => updateProductField(index, "lebar", e.target.value)}
                  >
                    <option value="">Pilih Lebar</option>
                    <option value="70">70 cm</option>
                    <option value="110">110 cm</option>
                  </select>
                </div>

                {/* Select Jenis Pewarna (Sinkron dengan DB Option) */}
                <div className="w-32">
                  <p className="text-xs text-black">Jenis Pewarna</p>
                  <select
                    className="w-full p-2 bg-[#5AE3ED1C] text-black rounded-md border-b border-[#1A335A] outline-none text-sm cursor-pointer font-semibold"
                    value={item.jenis_pewarna || ""}
                    onChange={(e) => updateProductField(index, "jenis_pewarna", e.target.value)}
                  >
                    <option value="">Pilih Jenis</option>
                    <option value="alami">Alam</option>
                    <option value="sintetis">Sintetis</option>
                  </select>
                </div>

                {/* Jumlah Qty Order */}
                <div>
                  <p className="text-xs text-black">Jumlah Order</p>
                  <div className="flex items-center bg-[#5AE3ED1C] text-black rounded-md border border-[#1A335A] w-24">
                    {/* Tombol Minus */}
                    <button 
                      onClick={() => updateProductField(index, "qty", Math.max(1, (parseInt(item.qty) || 0) - 1))} 
                      className="px-2 py-2.5"
                    >
                      <Minus size={12} />
                    </button>
                    
                    {/* Input Qty (Bisa Diketik & Nggak Ngunci Angka 0) */}
                    <input
                      type="number"
                      min="0"
                      placeholder="1"
                      value={item.qty === 0 ? "" : item.qty}
                      className="w-full bg-transparent text-xs text-center font-bold outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      onChange={(e) => {
                        const val = e.target.value;
                        // Jika kosong set ke 0 agar placeholder '1' aktif, jika diisi parse ke integer
                        updateProductField(index, "qty", val === "" ? 0 : parseInt(val) || 0);
                      }}
                    />

                    {/* Tombol Plus */}
                    <button 
                      onClick={() => updateProductField(index, "qty", (parseInt(item.qty) || 0) + 1)} 
                      className="px-2 py-2"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>

                {/* Input Panjang (m) */}
                <div className="w-24">
                  <p className="text-xs text-black">Panjang (m)</p>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="0"
                    value={item.panjang === 0 ? "" : item.panjang}
                    className="w-full p-1.5 border bg-[#5AE3ED1C] text-black rounded-md border-[#1A335A] text-sm font-semibold"
                    onChange={(e) => {
                      const val = e.target.value;
                      // Jika kosong set ke 0, jika diinput parse ke float
                      updateProductField(index, "panjang", val === "" ? 0 : parseFloat(val) || 0);
                    }}
                  />
                </div>

                {/* Output Display Total Harga Otomatis */}
                <div className="flex-1 min-w-[120px]">
                  <p className="text-xs text-black">Total Harga</p>
                  <div className="w-full p-2 border bg-[#5AE3ED1C] text-black rounded-md border-[#1A335A] text-xs font-bold h-[38px] flex items-center">
                    Rp {(item.totalHargaItem || 0).toLocaleString("id-ID")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tombol Aksi Bawah */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full py-4 border-2 border-dashed border-[#1A335A]/50 rounded-xl text-[#1A335A] font-semibold hover:bg-[#1A335A]/10 transition-all"
      >
        + Tambah Item
      </button>

      <button
        onClick={() => router.push("/dashboard/cs/order/por/pembayaran")}
        className="w-full py-4 bg-[#F2B600] text-white rounded-xl font-bold text-lg hover:bg-[#d7a201]"
      >
        Lanjut Pembayaran
      </button>

      <ProductSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddItems={handleAddItems}
      />
    </div>
  );
}