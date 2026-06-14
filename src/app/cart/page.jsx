"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import CartItem from '@/app/components/produk/keranjang/CartItem';
import CheckoutSection from '@/app/components/produk/keranjang/CheckoutSection';

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCheckout, setIsCheckout] = useState(false);

  // 1. Ambil data keranjang milik pelanggan dari API
  const fetchKeranjang = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/keranjang');
      if (!res.ok) throw new Error("Gagal memuat data keranjang");
      const result = await res.json();
      
      // Sinkronisasi data field dari API internal ke properti yang dibutuhkan komponen
      const normalizedData = (result.data || []).map(item => ({
        ...item,
        input_panjang: item.input_panjang || item.jumlah_order || item.gulungan?.panjang_sisa || 0
      }));

      setCartItems(normalizedData);
    } catch (err) {
      console.error("Gagal mengambil data keranjang:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeranjang();
  }, []);

  // 2. Fungsi Mengubah Panjang Order Secara Real-time dari Input Box
  const handleQtyChange = async (itemId, field, value) => {
    const updatedItems = cartItems.map(item => {
      if (item.id === itemId) {
        const maxSisa = item.gulungan?.panjang_sisa || 0;
        // Memastikan input tidak minus dan tidak melampaui batas sisa kain di gulungan
        const safeValue = Math.min(maxSisa, Math.max(1, value));
        return { ...item, [field]: safeValue };
      }
      return item;
    });
    setCartItems(updatedItems);

    // Sinkronisasi perubahan kuantitas ke database di latar belakang (PUT)
    const targetItem = updatedItems.find(item => item.id === itemId);
    try {
      await fetch(`/api/keranjang`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: itemId,
          jumlah_order: targetItem.input_panjang
        })
      });
    } catch (err) {
      console.error("Gagal sinkronisasi kuantitas ke database:", err);
    }
  };

  // 3. Fungsi Menghapus Item dari Daftar Keranjang (SUDAH DISINKRONKAN)
  const handleRemoveItem = async (itemId) => {
    const result = await Swal.fire({
      title: 'Keluarkan Kain?',
      text: 'Kain lurik ini akan dihapus dari daftar belanja Anda.',
      icon: 'warning',
      showCancelButton: true,
      background: '#1A1917',
      color: '#F9F6F0',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        // PERBAIKAN UTAMA: ID sekarang dikirim via query string agar klop dengan API Backend
        const res = await fetch(`/api/keranjang?id=${itemId}`, {
          method: 'DELETE',
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || "Gagal menghapus item dari server");
        }

        // Hapus dari memori lokal komponen
        setCartItems(prev => prev.filter(item => item.id !== itemId));

        // Berikan sinyal global ke Navbar untuk mengurangi angka counter badge
        window.dispatchEvent(new CustomEvent("updateCartCount", { detail: { count: -1 } }));

        Swal.fire({
          title: 'Berhasil Dihapus',
          text: 'Keranjang belanja diperbarui.',
          icon: 'success',
          background: '#1A1917',
          color: '#F9F6F0',
          confirmButtonColor: '#E5BA73'
        });
      } catch (err) {
        Swal.fire('Oops!', err.message, 'error');
      }
    }
  };

  // 4. Hitung Total Harga Sementara di Sisi Kanan Screen
  const subTotalSementara = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const meteran = item.input_panjang || 0;
      const harga = item.gulungan?.harga_per_meter || item.gulungan?.harga || 0;
      return acc + (meteran * harga);
    }, 0);
  }, [cartItems]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A1715] text-[#F9F6F0]">
        <Loader2 className="w-10 h-10 animate-spin text-[#E5BA73] mb-4" />
        <p className="text-sm font-light tracking-wide text-[#A3A19E]">Memperhitungkan detail gulungan tenun Anda...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A1715] text-[#F9F6F0] antialiased pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* VIEW KONDISI: JIKA KERANJANG KOSONG */}
        {cartItems.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-16 space-y-6 border border-white/5 bg-[#12110F] rounded-2xl shadow-xl">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-[#E5BA73]/10 text-[#E5BA73]">
                <ShoppingBag size={40} />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-[#E5BA73]">Keranjang Belanja Kosong</h3>
              <p className="text-xs text-[#A3A19E] px-6 font-light leading-relaxed">
                Anda belum memilih kain lurik apa pun dari katalog. Silakan jelajahi koleksi premium ATBM kami.
              </p>
            </div>
            <button
              onClick={() => router.push('/produk')}
              className="px-6 py-2.5 text-xs font-bold rounded-xl text-[#12110F] bg-[#E5BA73] hover:bg-[#f3cb85] transition-all shadow-md"
            >
              Lihat Katalog Kain
            </button>
          </div>
        ) : (
          /* VIEW KONDISI: JIKA ADA ITEM DI DALAM KERANJANG */
          <div className="space-y-8">
            
            {/* Alur Indikator Tahapan Belanja */}
            <div className="flex items-center gap-2 text-[10px] font-bold tracking-wider uppercase text-[#A3A19E]">
              <span className={!isCheckout ? "text-[#E5BA73]" : ""}>1. Daftar Belanja</span>
              <span className="text-white/20">/</span>
              <span className={isCheckout ? "text-[#E5BA73]" : ""}>2. Gerbang Pembayaran Midtrans</span>
            </div>

            {/* SEGMENTASI HALAMAN BERDASARKAN PROSESNYA */}
            {!isCheckout ? (
              // STEP 1: REVIEW DAFTAR PRODUK YANG INGIN DIBELI
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Bagian Kiri: List Item Kain */}
                <div className="space-y-4 lg:col-span-2">
                  <h2 className="text-xl font-bold tracking-tight text-[#E5BA73]">Keranjang Kain Lurik</h2>
                  <div className="space-y-3 bg-[#12110F] p-4 rounded-2xl border border-white/5 shadow-xl">
                    {cartItems.map((item) => (
                      <CartItem 
                        key={item.id}
                        item={item}
                        onChange={(field, value) => handleQtyChange(item.id, field, value)}
                        onRemove={() => handleRemoveItem(item.id)}
                      />
                    ))}
                  </div>
                </div>

                {/* Bagian Kanan: Kalkulator Total & Tombol Lanjut */}
                <div className="h-fit space-y-4 p-5 bg-[#12110F] border border-[#E5BA73]/10 rounded-2xl shadow-xl">
                  <h3 className="text-xs font-bold text-[#E5BA73] tracking-wide uppercase">Ringkasan Pesanan</h3>
                  <div className="pt-2 border-t border-white/5 space-y-3">
                    <div className="flex justify-between text-xs text-[#A3A19E]">
                      <span>Total Gulungan</span>
                      <span className="font-semibold text-white">{cartItems.length} Item</span>
                    </div>
                    <div className="flex justify-between items-baseline pt-2 border-t border-white/5">
                      <span className="text-xs text-[#A3A19E]">Subtotal</span>
                      <span className="text-xl font-black text-[#E5BA73]">Rp {subTotalSementara.toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsCheckout(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 mt-4 text-xs font-bold tracking-wide rounded-xl text-[#12110F] bg-[#E5BA73] hover:bg-[#f3cb85] transition-all shadow-md"
                  >
                    Lanjut ke Check-out <ArrowRight size={14} />
                  </button>
                </div>

              </div>
            ) : (
              // STEP 2: FORM CHECKOUT & INTERAKSI POP-UP DENGAN MIDTRANS SNAP SDK
              <div className="bg-[#12110F] p-6 rounded-2xl border border-white/5 shadow-2xl">
                <CheckoutSection 
                  items={cartItems}
                  onBack={() => setIsCheckout(false)}
                  onOrderSuccess={() => {
                    setCartItems([]);
                    setIsCheckout(false);
                  }}
                />
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}