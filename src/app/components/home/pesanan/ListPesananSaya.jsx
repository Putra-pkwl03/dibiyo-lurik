import React from "react";

export default function ListPesananSaya({ pesanan }) {
  
  // 1. FILTER UTAMA: Loloskan transaksi yang sudah berhasil dibayar maupun yang masih pending
  const transaksiValid = pesanan.filter((tx) => {
    const s = tx.status_transaksi?.toLowerCase();
    return s === "settlement" || s === "success" || s === "capture" || s === "pending";
  });

  // Jika setelah difilter benar-benar tidak ada riwayat transaksi sama sekali
  if (transaksiValid.length === 0) {
    return (
      <div className="bg-[#ffffff] border border-dashed border-gray-300 rounded-2xl p-12 text-center">
        <h3 className="text-lg font-serif font-bold text-black">Belum Ada Riwayat Pesanan</h3>
        <p className="text-sm text-[#6a5848] mt-2">
          Seluruh riwayat pesanan Anda akan muncul di sini.
        </p>
      </div>
    );
  }

  // Format mata uang Rupiah
  const formatRupiah = (angka) => {
    const nominal = Number(angka) || 0;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(nominal);
  };

  // Format tanggal lokal Indonesia
  const formatTanggal = (isoString) => {
    if (!isoString) return "-";
    return new Date(isoString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // ✨ SINKRONISASI: Menampilkan Tombol Informasi Status Tanpa Kolom Resi
  const renderStatusPengirimanButton = (statusPengiriman) => {
    const status = statusPengiriman?.toLowerCase();

    // JIKA STATUS: DIKIRIM
    if (status === "dikirim") {
      return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full justify-between bg-blue-50 border border-blue-200 p-3.5 rounded-xl">
          <div className="flex items-center gap-2.5 text-blue-700">
            <span className="flex h-2.5 w-2.5 rounded-full bg-blue-600 animate-pulse" />
            <p className="text-xs font-semibold">
              Status: <span className="uppercase font-bold text-blue-900">Pesanan Dikirim</span>
            </p>
          </div>
          <span className="text-[11px] text-blue-600 font-medium italic">
            Pesanan Anda sedang dalam perjalanan oleh kurir
          </span>
        </div>
      );
    }

    // JIKA STATUS: BATAL
    if (status === "batal") {
      return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full justify-between bg-red-50 border border-red-200 p-3.5 rounded-xl">
          <div className="flex items-center gap-2.5 text-red-700">
            <span className="flex h-2.5 w-2.5 rounded-full bg-red-600" />
            <p className="text-xs font-semibold">
              Status: <span className="uppercase font-bold text-red-900">Pengiriman Dibatalkan</span>
            </p>
          </div>
        </div>
      );
    }

    // JIKA STATUS DEFAULT: DIPROSES
    return (
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full justify-between bg-amber-50 border border-amber-200 p-3.5 rounded-xl">
        <div className="flex items-center gap-2.5 text-[#917c4b]">
          <span className="flex h-2.5 w-2.5 rounded-full bg-[#d9a05b] animate-pulse" />
          <p className="text-xs font-semibold">
            Status: <span className="uppercase font-bold text-black">Sedang Diproses (Tenun ATBM)</span>
          </p>
        </div>
        <button 
          disabled
          className="bg-[#2D2219] text-white text-[10px] font-bold tracking-widest px-4 py-1.5 rounded-lg opacity-90"
        >
          DALAM ANTREAN PRODUKSI
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {transaksiValid.map((tx) => {
        // Cek apakah transaksi ini bermutu pending / belum dibayar
        const isPending = tx.status_transaksi?.toLowerCase() === "pending";

        return (
          <div 
            key={tx.order_id} 
            className="bg-[#ffffff] border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Top Bar Card */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs text-[#6a5848]">ID Transaksi / Order ID</p>
                <p className="text-sm font-mono font-bold text-black">{tx.order_id}</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs text-[#6a5848]">Tanggal Pembelian</p>
                <p className="text-sm font-semibold text-black">{formatTanggal(tx.created_at)}</p>
              </div>
            </div>

            {/* CONTAINER BUTTON INFORMASI: Menyesuaikan status pembayaran */}
            <div className="mx-6 mt-4">
              {isPending ? (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full justify-between bg-red-50 border border-red-200 p-3.5 rounded-xl">
                  <div className="flex items-center gap-2.5 text-red-700">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-red-600 animate-pulse" />
                    <p className="text-xs font-semibold">
                      Status: <span className="uppercase font-bold text-red-900">Menunggu Pembayaran</span>
                    </p>
                  </div>
                  <span className="text-[11px] text-red-600 font-medium italic">
                    Silakan selesaikan invoice Anda melalui Midtrans Snap
                  </span>
                </div>
              ) : (
                // ✨ SINKRONISASI: Hanya mengirimkan status_pengiriman saja
                renderStatusPengirimanButton(tx.status_pengiriman)
              )}
            </div>

            {/* Body Isi Item Transaksi */}
            <div className="p-6 space-y-4">
              {Array.isArray(tx.items_transaksi) && tx.items_transaksi.length > 0 ? (
                tx.items_transaksi.map((item, idx) => {
                  const namaProduk = item.name || item.nama || item.produk?.kode_produk || "Kain Lurik Eksklusif";
                  const kuantitas = item.quantity || item.jumlah_order || 1;
                  const hargaItem = item.price || item.harga || 0;

                  return (
                    <div key={idx} className="flex items-start justify-between border-b border-gray-50 pb-3 last:border-b-0 last:pb-0">
                      <div>
                        <h4 className="text-sm font-bold text-black">{namaProduk}</h4>
                        <p className="text-xs text-[#6a5848] mt-0.5">Jumlah kuantitas: {kuantitas} Pcs / Gulung / Meter</p>
                      </div>
                      <p className="text-sm font-medium text-black">{formatRupiah(hargaItem)}</p>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-gray-400 italic">Detail produk tidak terlampir</p>
              )}
            </div>

            {/* Footer Card Ringkasan Total */}
            <div className="bg-[#917c4b]/5 px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-black">Status Pembayaran:</span>
                {isPending ? (
                  <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Belum Dibayar
                  </span>
                ) : (
                  <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Berhasil
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <div className="text-right">
                  <span className="text-xs text-[#6a5848] block">Total Pembayaran</span>
                  <span className="text-base font-serif font-black text-[#d9a05b]">
                    {formatRupiah(tx.total_nominal)}
                  </span>
                </div>
              </div>
            </div>

          </div>
        );
      })}
    </div>
  );
}