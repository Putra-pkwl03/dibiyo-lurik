import React from "react";

export default function ListPesananSaya({ pesanan }) {
  
  // 1. FILTER UTAMA: Loloskan transaksi yang sudah berhasil dibayar (settlement/success/berhasil) maupun yang masih pending
  const transaksiValid = pesanan.filter((tx) => {
    const s = tx.status_transaksi?.toLowerCase();
    return s === "settlement" || s === "success" || s === "capture" || s === "pending" || s === "berhasil";
  });

  // Jika setelah difilter benar-benar tidak ada riwayat transaksi sama sekali
  if (transaksiValid.length === 0) {
    return (
      <div className="bg-[#ffffff] border border-dashed border-gray-300 rounded-2xl p-12 text-center">
        <h3 className="font-serif text-lg font-bold text-black">Belum Ada Riwayat Pesanan</h3>
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

  // ✨ SINKRONISASI: Menampilkan Banner Informasi Status Berdasarkan Aturan Constraint DB Baru
  const renderStatusPengirimanButton = (statusPengiriman) => {
    const status = statusPengiriman?.toLowerCase();

    // JIKA STATUS: PESANAN BISA DIAMBIL DI TOKO SEKARANG
    if (status === "pesanan bisa diambil di toko sekarang") {
      return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full justify-between bg-blue-50 border border-blue-200 p-3.5 rounded-xl">
          <div className="flex items-center gap-2.5 text-blue-700">
            <span className="flex h-2.5 w-2.5 rounded-full bg-blue-600延 animate-pulse" />
            <p className="text-xs font-semibold">
              Status: <span className="font-bold text-blue-900 uppercase">Bisa Diambil Di Toko</span>
            </p>
          </div>
          <span className="text-[11px] text-blue-600 font-medium italic">
            Kain siap! Silakan ambil langsung di Griya Kain Lurik Dibiyo.
          </span>
        </div>
      );
    }

    // JIKA STATUS: PESANAN DI TERIMA
    if (status === "pesanan di terima") {
      return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full justify-between bg-green-50 border border-green-200 p-3.5 rounded-xl">
          <div className="flex items-center gap-2.5 text-green-700">
            <span className="flex h-2.5 w-2.5 rounded-full bg-green-600" />
            <p className="text-xs font-semibold">
              Status: <span className="font-bold text-green-900 uppercase">Pesanan Diterima</span>
            </p>
          </div>
          <span className="text-[11px] text-green-600 font-medium italic">
            Selesai • Terima kasih telah melestarikan tenun ATBM tradisional.
          </span>
        </div>
      );
    }

    // JIKA STATUS DEFAULT / PESANAN DI PROSES
    return (
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full justify-between bg-amber-50 border border-amber-200 p-3.5 rounded-xl">
        <div className="flex items-center gap-2.5 text-[#917c4b]">
          <span className="flex h-2.5 w-2.5 rounded-full bg-[#d9a05b] animate-pulse" />
          <p className="text-xs font-semibold">
            Status: <span className="font-bold text-black uppercase">Pesanan Di Proses (Tenun ATBM)</span>
          </p>
        </div>
        <button 
          disabled
          className="bg-[#2D2219] text-white text-[10px] font-bold tracking-widest px-4 py-1.5 rounded-lg opacity-90 font-sans"
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
            <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-gray-100 bg-gray-50">
              <div>
                <p className="text-xs text-[#6a5848]">ID Transaksi / Order ID</p>
                <p className="font-mono text-sm font-bold text-black">{tx.order_id}</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs text-[#6a5848]">Tanggal Pembelian</p>
                <p className="text-sm font-semibold text-black">{formatTanggal(tx.created_at)}</p>
              </div>
            </div>

            {/* CONTAINER BANNER INFORMASI: Menyesuaikan status pembayaran */}
            <div className="mx-6 mt-4">
              {isPending ? (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full justify-between bg-red-50 border border-red-200 p-3.5 rounded-xl">
                  <div className="flex items-center gap-2.5 text-red-700">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-red-600 animate-pulse" />
                    <p className="text-xs font-semibold">
                      Status: <span className="font-bold text-red-900 uppercase">Menunggu Pembayaran</span>
                    </p>
                  </div>
                  <span className="text-[11px] text-red-600 font-medium italic">
                    Silakan selesaikan invoice Anda melalui Midtrans Snap
                  </span>
                </div>
              ) : (
                // SINKRONISASI VALUE STATUS PENGIRIMAN
                renderStatusPengirimanButton(tx.status_pengiriman)
              )}
            </div>

            {/* Body Isi Item Transaksi */}
            <div className="p-6 space-y-4">
              {Array.isArray(tx.items_transaksi) && tx.items_transaksi.length > 0 ? (
  tx.items_transaksi.map((item, idx) => {
    const namaProduk = item.name || item.nama || "Kain Lurik";
    const kuantitas = item.quantity || 1;
    const hargaItem = item.price || 0;

    // 🌟 PERBAIKAN LOGIKA DETEKSI TERAKHIR & PALING AMAN:
const isCustom = 
  item.is_custom !== undefined 
    ? item.is_custom === true  // Jika transaksi baru, murni ikuti true/false dari database
    : (item.image_url === null && !item.name?.includes("(G-")); // Jika transaksi lama, pakai fallback nama
    const konfig = item.konfigurasi;

    return (
      <div key={idx} className="flex items-center justify-between gap-4 pb-3 border-b border-gray-50 last:border-b-0 last:pb-0">
        <div className="flex items-center gap-4">
          
         {/* 🖼️ DYNAMIC BOX PREVIEW */}
<div className="relative flex items-center justify-center w-16 h-16 overflow-hidden border rounded-xl bg-neutral-100 border-neutral-200/60 shrink-0">
  
  {isCustom ? (
    /* 🌟 JIKA PRODUK CUSTOM */
    konfig?.stripes ? (() => {
      // 1. Rekonstruksi gradient string persis seperti generator checkout
      let gradientString = '';
      let currentOffset = 0;
      
      konfig.stripes.forEach((stripe) => {
        const thickness = Number(stripe.thickness) || 0;
        const startPoint = currentOffset;
        const endPoint = currentOffset + thickness;
        
        gradientString += `${stripe.color} ${startPoint}px, ${stripe.color} ${endPoint}px, `;
        gradientString += `transparent ${endPoint}px, transparent ${endPoint + 2}px, `;
        currentOffset = endPoint + 2; 
      });
      
      const cleanGradient = gradientString.trim().replace(/,$/, '');
      const dynamicGradient = `linear-gradient(90deg, ${cleanGradient})`;
      const ukuranKerapatanDinamis = (currentOffset * ((konfig.patternDensity || konfig.configuration?.patternDensity || 100) / 100)) || 20;

      return (
        <div className="relative w-full h-full">
          {/* Layer Pola Kain Warna Diberi Masking Shading */}
          <div 
            style={{ 
              backgroundColor: konfig.bgColor || '#1A1917', 
              backgroundImage: dynamicGradient, 
              backgroundSize: `${ukuranKerapatanDinamis}px 100%`,
              maskImage: "url('/mockups/kain-gantung-mask.png')", 
              WebkitMaskImage: "url('/mockups/kain-gantung-mask.png')", 
              maskSize: 'cover', 
              WebkitMaskSize: 'cover'
            }} 
            className="absolute inset-0 w-full h-full" 
          />
          {/* Layer Bayangan Tekstur Kain Realistis */}
          <img 
            src="/mockups/kain-gantung-mask.png" 
            alt="Shading" 
            className="absolute inset-0 object-cover w-full h-full pointer-events-none mix-blend-multiply opacity-60" 
          />
        </div>
      );
    })() : (
      /* Fallback Pattern untuk Transaksi Lama */
      <div 
        className="w-full h-full" 
        style={{
          backgroundImage: 'repeating-linear-gradient(90deg, #2D2219, #2D2219 4px, #d9a05b 4px, #d9a05b 8px, #6a5848 8px, #6a5848 12px)'
        }}
      />
    )
  ) : (
    /* 🖼️ JIKA PRODUK REGULER */
    <img 
      src={item.image_url || "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=150&auto=format&fit=crop"} 
      alt={namaProduk}
      className="object-cover w-full h-full"
      onError={(e) => {
        e.target.src = "https://placehold.co/150x150?text=Kain+Lurik"; 
      }}
    />
  )}
</div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-black">{namaProduk}</h4>
              {isCustom && (
                <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded uppercase font-mono">
                  Custom
                </span>
              )}
            </div>
            <p className="text-xs text-[#6a5848] mt-0.5">Jumlah kuantitas: {kuantitas} Pcs / Gulung / Meter</p>
          </div>
        </div>
        
        <p className="text-sm font-medium text-black shrink-0">{formatRupiah(hargaItem)}</p>
      </div>
    );
  })
) : (
  <p className="text-xs italic text-gray-400">Detail produk tidak terlampir</p>
)}
            </div>

            {/* Footer Card Ringkasan Total */}
            <div className="bg-[#917c4b]/5 px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-black">Status Pembayaran:</span>
                {isPending ? (
                  <span className="px-3 py-1 text-xs font-bold tracking-wider uppercase rounded-full bg-amber-100 text-amber-800">
                    Belum Dibayar
                  </span>
                ) : (
                  <span className="px-3 py-1 text-xs font-bold tracking-wider text-green-800 uppercase bg-green-100 rounded-full">
                    Berhasil
                  </span>
                )}
              </div>
              
              <div className="flex items-center justify-between w-full gap-4 sm:w-auto sm:justify-end">
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