"use client";

import React, { useMemo, useState } from 'react';
import { CornerDownLeft, Loader2, CreditCard } from 'lucide-react';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import { useCart } from '../../../context/CartContext'; 
import ModalMidtrans from './ModalMidtrans'; 

const generateLurikGradient = (stripes) => {
  let gradientString = '';
  let currentOffset = 0;
  if (!stripes || stripes.length === 0) return { gradient: 'none', totalWidth: 0 };
  stripes.forEach((stripe) => {
    const startPoint = currentOffset;
    const endPoint = currentOffset + stripe.thickness;
    gradientString += `${stripe.color} ${startPoint}px, ${stripe.color} ${endPoint}px, `;
    gradientString += `transparent ${endPoint}px, transparent ${endPoint + 2}px, `;
    currentOffset = endPoint + 2; 
  });
  return {
    gradient: `linear-gradient(90deg, ${gradientString.slice(0, -2)})`,
    totalWidth: currentOffset
  };
};

export default function CheckoutSection({ items, onBack, onOrderSuccess }) {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [snapToken, setSnapToken] = useState(null);
  const [isLoadingToken, setIsLoadingToken] = useState(false); 
  
  const router = useRouter();
  const { user } = useCart(); 

  const subTotal = useMemo(() => {
    return items.reduce((acc, item) => {
      const panjangDiorder = item.input_panjang || item.gulungan?.panjang_sisa || 0;
      const hargaKain = item.gulungan?.harga_per_meter || item.gulungan?.harga || 0;
      return acc + (panjangDiorder * hargaKain);
    }, 0);
  }, [items]);

  const total = useMemo(() => subTotal, [subTotal]);

  const handleBayarMidtrans = async () => {
    if (items.length === 0) return;

    // LANGSUNG BUKA MODAL DULUAN (Instant Feedback)
    setIsModalOpen(true);
    setIsLoadingToken(true);
    setLoading(true);

    let currentUser = user;

    if (!currentUser) {
      try {
        const profileRes = await fetch('/api/auth/profile');
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          // ✨ PERBAIKAN 1: Tambahkan profileData.data agar cocok dengan respon API profile terbaru
          currentUser = profileData.user || profileData.data || profileData; 
        }
      } catch (error) {
        console.error("Gagal melakukan verifikasi session otomatis:", error);
      }
    }

    if (!currentUser) {
      setIsModalOpen(false);
      setIsLoadingToken(false);
      setLoading(false);
      
      Swal.fire({
        title: 'Autentikasi Diperlukan',
        text: 'Anda harus masuk (login) ke akun Anda terlebih dahulu sebelum dapat melanjutkan transaksi pembayaran aman.',
        icon: 'info',
        background: '#1A1917',
        color: '#F9F6F0',
        showCancelButton: true,
        confirmButtonColor: '#E5BA73',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Masuk Sekarang',
        cancelButtonText: 'Batal'
      }).then((result) => {
        if (result.isConfirmed) {
          router.push('/auth/login');
        }
      });
      return; 
    }

    // Ekstraksi ID User secara aman dari berbagai kemungkinan struktur objek auth/profile Anda
    const targetUserId = currentUser.id || currentUser.user?.id || currentUser.data?.id;

    try {
      // ✨ PERBAIKAN 2: Kirimkan user_id ke dalam body request API Checkout
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items,
          totalNet: total,
          user_id: targetUserId, 
        }),
      });

      const checkoutData = await res.json();
      if (!res.ok) throw new Error(checkoutData.message || "Gagal inisialisasi pembayaran.");

      setSnapToken(checkoutData.token);
    } catch (err) {
      setIsModalOpen(false); 
      Swal.fire({
        title: 'Gagal Memproses Pesanan',
        text: err.message,
        icon: 'error',
        background: '#1A1917',
        color: '#F9F6F0',
        confirmButtonColor: '#E5BA73'
      });
    } finally {
      setIsLoadingToken(false);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans text-[#F9F6F0]">
      
      <div className="flex items-center justify-between pb-4 border-b border-[#E5BA73]/10">
        <h2 className="text-lg font-bold text-[#ba9354] tracking-wide">Ringkasan Pembayaran (Check-out)</h2>
        <button 
          onClick={onBack} 
          disabled={loading}
          className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold transition-all text-[#12110F] rounded-xl bg-[#E5BA73] hover:bg-[#f3cb85] disabled:opacity-50"
        >
          <CornerDownLeft size={14} /> Kembali
        </button>
      </div>

      {/* List Mini Tinjauan Kain */}
      <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
        {items.map((item) => {
          const hargaKain = item.gulungan?.harga_per_meter || item.gulungan?.harga || 0;
          const meteran = item.input_panjang || item.gulungan?.panjang_sisa || 0;
          const isCustomItem = item.isCustom || item.gulungan?.nomor_gulungan === "CUSTOM";
          const kodeProduk = item.kode_produk || item.product?.kode_produk || item.produk?.kode_produk || item.gulungan?.produk?.kode_produk || (isCustomItem ? "Lurik Kustom" : "Lurik Premium");

          let miniVisual;
          if (isCustomItem && item.gulungan?.configurasi) {
            const { bgColor, patternDensity, stripes } = item.gulungan.configurasi;
            const { gradient, totalWidth } = generateLurikGradient(stripes);
            const ukuranKerapatanDinamis = (totalWidth * (patternDensity / 100)) || 20;

            miniVisual = (
              <div className="relative w-full h-full">
                <div style={{ backgroundColor: bgColor, backgroundImage: gradient, backgroundSize: `${ukuranKerapatanDinamis}px 100%`, maskImage: "url('/mockups/kain-gantung-mask.png')", WebkitMaskImage: "url('/mockups/kain-gantung-mask.png')", maskSize: 'contain', WebkitMaskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} className="absolute inset-0 w-full h-full" />
                <img src="/mockups/kain-gantung-mask.png" alt="Shading" className="absolute inset-0 object-contain w-full h-full pointer-events-none mix-blend-multiply opacity-80" />
              </div>
            );
          } else {
            const gambarKain = item.gambar_url || item.product?.gambar_url || item.produk?.gambar_url || item.gulungan?.produk?.gambar_url || item.gulungan?.gambar_url || '/placeholder-kain.jpg';
            miniVisual = <img src={gambarKain} className="object-cover w-full h-full opacity-80" alt="Produk" />;
          }

          return (
            <div key={item.id} className="flex items-center gap-4 p-3 border bg-[#0A1715]/40 border-white/5 rounded-xl shadow-md text-xs">
              <div className="relative w-24 h-24 overflow-hidden border rounded-lg bg-zinc-900 border-white/5 shrink-0">
                {miniVisual}
              </div>
              <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-4">
                <div><p className="text-[12px] text-[#A3A19E]">Kode Kain</p><p className="font-bold text-[#F9F6F0] truncate text-[10px]">{kodeProduk}</p></div>
                <div><p className="text-[12px] text-[#A3A19E]">No Gulungan</p><p className="font-semibold text-[#E5BA73] text-[12px]">{isCustomItem ? "-" : `G-${item.gulungan?.nomor_gulungan || '-'}`}</p></div>
                <div><p className="text-[12px] text-[#A3A19E]">Panjang Potong</p><p className="font-bold text-[#F9F6F0]/90 text-[12px]">{meteran} meter</p></div>
                <div className="text-right"><p className="text-[12px] text-[#A3A19E]">Subtotal</p><p className="font-black text-[#E5BA73] text-[12px]">Rp{(meteran * hargaKain).toLocaleString('id-ID')}</p></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Invoice Box */}
      <div className="p-4 border bg-[#12110F] border-[#E5BA73]/10 rounded-xl shadow-lg space-y-2">
        <div className="flex justify-between text-xs text-[#A3A19E]"><span>Total Sebelum Pembayaran</span><span>Rp {subTotal.toLocaleString('id-ID')}</span></div>
        <div className="flex justify-between pt-3 text-base font-bold border-t border-white/5 text-[#E5BA73]"><span>Total Pembayaran Net</span><span className="text-lg font-black">Rp {total.toLocaleString('id-ID')}</span></div>
      </div>

      <button 
        onClick={handleBayarMidtrans}
        disabled={loading || items.length === 0}
        className="flex items-center justify-center w-full gap-2 py-3.5 text-xs font-bold uppercase tracking-wider transition-all text-[#12110F] bg-[#E5BA73] hover:bg-[#f3cb85] rounded-xl shadow-xl disabled:bg-white/5 disabled:text-white/20"
      >
        {loading ? (
          <><Loader2 className="animate-spin" size={14} /> Membuka Gerbang Pembayaran...</>
        ) : (
          <><CreditCard size={14} /> Lanjut ke Metode Pembayaran Aman</>
        )}
      </button>

      <ModalMidtrans
        isOpen={isModalOpen}
        snapToken={snapToken}
        isLoadingToken={isLoadingToken} 
        onClose={() => setIsModalOpen(false)}
        onSuccess={async (result) => {
          setIsModalOpen(false);
          try {
            await Promise.all(items.map(item => fetch(`/api/keranjang?id=${item.id}`, { method: 'DELETE' })));
          } catch (err) { console.error(err); }
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
            router.push('/produk'); 
          });
        }}
        onPending={() => {
          setIsModalOpen(false);
          Swal.fire({ title: 'Menunggu Pembayaran', text: 'Silakan selesaikan pembayaran sesuai instruksi Virtual Account/QRIS Anda.', icon: 'warning', background: '#1A1917', color: '#F9F6F0', confirmButtonColor: '#E5BA73' });
        }}
        onError={() => {
          setIsModalOpen(false);
          Swal.fire({ title: 'Pembayaran Gagal', text: 'Transaksi dibatalkan atau masa berlaku pembayaran habis.', icon: 'error', background: '#1A1917', color: '#F9F6F0', confirmButtonColor: '#E5BA73' });
        }}
      />
    </div>
  );
}