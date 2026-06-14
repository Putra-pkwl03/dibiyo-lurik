"use client";

import React, { useMemo, useState } from 'react';
import { CornerDownLeft, Loader2, CreditCard } from 'lucide-react';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import Script from 'next/script';

export default function CheckoutSection({ items, onBack, onOrderSuccess }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 1. Kalkulasi Total Harga Kain Berdasarkan Input Kuantitas Pelanggan
  const subTotal = useMemo(() => {
    return items.reduce((acc, item) => {
      const panjangDiorder = item.input_panjang || item.gulungan?.panjang_sisa || 0;
      const hargaKain = item.gulungan?.harga_per_meter || item.gulungan?.harga || 0;
      return acc + (panjangDiorder * hargaKain);
    }, 0);
  }, [items]);

  const total = useMemo(() => {
    return subTotal; // Sisi pelanggan bersih tanpa manipulasi diskon manual kasir
  }, [subTotal]);

  // 2. Handler Jembatan Pembayaran Midtrans Snap SDK
  const handleBayarMidtrans = async () => {
    if (items.length === 0) return;
    setLoading(true);
    
    try {
      // Minta token transaksi dari API internal secure checkout
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items,
          totalNet: total,
        }),
      });

      const checkoutData = await res.json();
      if (!res.ok) throw new Error(checkoutData.message || "Gagal inisialisasi pembayaran.");

      // Luncurkan Pop-up Midtrans Snap directly di layar pelanggan
      if (window.snap) {
        window.snap.pay(checkoutData.token, {
          onSuccess: async function (result) {
            // PERBAIKAN UTAMA: Bersihkan seluruh item terbayar dari DB secara paralel (Sinkron dengan API baru)
            try {
              await Promise.all(
                items.map(item =>
                  fetch(`/api/keranjang?id=${item.id}`, {
                    method: 'DELETE',
                  })
                )
              );
              console.log("=== SEMUA ITEM DI KERANJANG BERHASIL DIBERSIHKAN ===");
            } catch (err) {
              console.error("Gagal membersihkan keranjang setelah pembayaran:", err);
            }

            // Semburkan sinyal event global untuk mereset counter angka di badge Navbar
            window.dispatchEvent(new CustomEvent("updateCartCount", { detail: { count: -items.length } }));

            Swal.fire({
              title: 'Pembayaran Sukses!',
              text: 'Terima kasih, pesanan kain premium Anda sedang kami proses.',
              icon: 'success',
              background: '#1A1917',
              color: '#F9F6F0',
              confirmButtonColor: '#E5BA73'
            }).then(() => {
              if (onOrderSuccess) onOrderSuccess();
              router.push('/produk'); // Arahkan kembali ke katalog kain
            });
          },
          onPending: function (result) {
            Swal.fire({
              title: 'Menunggu Pembayaran',
              text: 'Silakan selesaikan pembayaran sesuai instruksi Virtual Account/QRIS Anda.',
              icon: 'warning',
              background: '#1A1917',
              color: '#F9F6F0',
              confirmButtonColor: '#E5BA73'
            });
          },
          onError: function (result) {
            Swal.fire({
              title: 'Pembayaran Gagal',
              text: 'Transaksi dibatalkan atau masa berlaku pembayaran habis.',
              icon: 'error',
              background: '#1A1917',
              color: '#F9F6F0',
              confirmButtonColor: '#E5BA73'
            });
          },
          onClose: function () {
            setLoading(false);
          }
        });
      } else {
        throw new Error("Midtrans Snap SDK gagal dimuat. Silakan coba refresh halaman Anda.");
      }

    } catch (err) {
      Swal.fire({
        title: 'Gagal Memproses Pesanan',
        text: err.message,
        icon: 'error',
        background: '#1A1917',
        color: '#F9F6F0',
        confirmButtonColor: '#E5BA73'
      });
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans text-[#F9F6F0]">
      
      {/* Script Midtrans Snap Loader */}
      <Script 
        src="https://app.sandbox.midtrans.com/snap/snap.js" 
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />

      {/* Header Panel Ringkasan */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E5BA73]/10">
        <h2 className="text-lg font-bold text-[#E5BA73] tracking-wide">Ringkasan Pembayaran (Check-out)</h2>
        <button 
          onClick={onBack} 
          disabled={loading}
          className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold transition-all text-[#12110F] rounded-xl bg-[#E5BA73] hover:bg-[#f3cb85] disabled:opacity-50"
        >
          <CornerDownLeft size={14} /> Kembali
        </button>
      </div>

      {/* List Mini Tinjauan Kain */}
      <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
        {items.map((item) => {
          const hargaKain = item.gulungan?.harga_per_meter || item.gulungan?.harga || 0;
          const meteran = item.input_panjang || item.gulungan?.panjang_sisa || 0;
          return (
            <div key={item.id} className="flex items-center gap-4 p-3 border bg-[#0A1715]/40 border-white/5 rounded-xl shadow-md text-xs">
              <div className="w-14 h-14 bg-zinc-900 rounded-lg overflow-hidden border border-white/5 shrink-0">
                <img 
                  src={item.gulungan?.produk?.gambar_url || '/placeholder-kain.jpg'} 
                  className="object-cover w-full h-full opacity-80" 
                  alt={`Produk kain ${item.gulungan?.produk?.kode_produk || ''}`} 
                />
              </div>
              <div className="grid flex-1 grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <p className="text-[9px] text-[#A3A19E] uppercase tracking-wider">Kode Kain</p>
                  <p className="font-bold text-[#F9F6F0] truncate">{item.gulungan?.produk?.kode_produk || 'Lurik Premium'}</p>
                </div>
                <div>
                  <p className="text-[9px] text-[#A3A19E] uppercase tracking-wider">No Gulungan</p>
                  <p className="font-semibold text-[#E5BA73]">G-{item.gulungan?.nomor_gulungan || '-'}</p>
                </div>
                <div>
                  <p className="text-[9px] text-[#A3A19E] uppercase tracking-wider">Panjang Potong</p>
                  <p className="font-bold text-[#F9F6F0]/90">{meteran} meter</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-[#A3A19E] uppercase tracking-wider">Subtotal</p>
                  <p className="font-black text-[#E5BA73]">Rp{(meteran * hargaKain).toLocaleString('id-ID')}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Invoice Box Nominal */}
      <div className="p-4 border bg-[#12110F] border-[#E5BA73]/10 rounded-xl shadow-lg space-y-2">
        <div className="flex justify-between text-xs text-[#A3A19E]">
          <span>Total Sebelum Pembayaran</span>
          <span>Rp {subTotal.toLocaleString('id-ID')}</span>
        </div>
        <div className="flex justify-between pt-3 text-base font-bold border-t border-white/5 text-[#E5BA73]">
          <span>Total Pembayaran Net</span>
          <span className="text-lg font-black">Rp {total.toLocaleString('id-ID')}</span>
        </div>
      </div>

      {/* Button Secure Gateway */}
      <button 
        onClick={handleBayarMidtrans}
        disabled={loading || items.length === 0}
        className="flex items-center justify-center w-full gap-2 py-3.5 text-xs font-bold uppercase tracking-wider transition-all text-[#12110F] bg-[#E5BA73] hover:bg-[#f3cb85] rounded-xl shadow-xl disabled:bg-white/5 disabled:text-white/20 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={14} /> Membuka Gerbang Aman Midtrans...
          </>
        ) : (
          <>
            <CreditCard size={14} /> Lanjut ke Metode Pembayaran Aman
          </>
        )}
      </button>
    </div>
  );
}