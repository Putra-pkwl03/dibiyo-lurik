"use client";

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext'; 
import CartItem from '../components/produk/keranjang/CartItem';
import CheckoutSection from '../components/produk/keranjang/CheckoutSection'; // Menggunakan jalur relatif yang aman bagi Turbopack

export default function CartPage() {
  const router = useRouter();
  const [isCheckout, setIsCheckout] = useState(false);
  
  // Menggunakan global state dari Provider yang menghandle otomatis Guest vs Login
  const { cartItems, updateQty, removeFromCart, loading, totalHarga } = useCart();

  // Handle Perubahan kuantitas meteran kain
  const handleQtyChange = (itemId, field, value) => {
    if (field === 'input_panjang') {
      updateQty(itemId, Number(value));
    }
  };

  // Hitung total panjang meter kain real-time
  const totalPanjangMeter = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (item.input_panjang || item.gulungan?.panjang_sisa || 0), 0);
  }, [cartItems]);

  // ====================================================================
  // SKELETON LOADING UI (Disetarakan dengan Layout Halaman Utama)
  // ====================================================================
  if (loading) {
    return (
      <main className="min-h-screen bg-[#ffffff] text-[#8e8675] pt-28 pb-16 px-2 sm:px-4 lg:px-6">
        <div className="mx-auto space-y-8 max-w-7xl animate-pulse">
          {/* Breadcrumb Skeleton */}
          <div className="w-40 h-3 rounded bg-white/10"></div>
          
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Bagian Kiri: List Item Skeleton */}
            <div className="space-y-4 lg:col-span-2">
              <div className="w-48 h-6 mb-4 rounded bg-white/10"></div>
              <div className="space-y-3 bg-[#F5F2EB] p-4 rounded-2xl border border-white/5">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-[#0A1715]/60 p-3 rounded-xl flex flex-col sm:flex-row items-center gap-4 border border-white/5">
                    {/* Kotak Gambar */}
                    <div className="w-full h-24 rounded-lg sm:w-28 bg-white/5 shrink-0"></div>
                    {/* Baris data dummy */}
                    <div className="grid flex-1 w-full grid-cols-2 gap-4 md:grid-cols-6">
                      <div className="space-y-2"><div className="w-12 h-3 rounded bg-white/5"></div><div className="w-16 h-4 rounded bg-white/10"></div></div>
                      <div className="space-y-2"><div className="w-12 h-3 rounded bg-white/5"></div><div className="h-4 rounded bg-white/10 w-14"></div></div>
                      <div className="space-y-2"><div className="w-12 h-3 rounded bg-white/5"></div><div className="w-10 h-4 rounded bg-white/10"></div></div>
                      <div className="space-y-2"><div className="w-12 h-3 rounded bg-white/5"></div><div className="w-20 h-4 rounded bg-white/10"></div></div>
                      <div className="space-y-2"><div className="w-20 rounded h-7 bg-white/5"></div></div>
                      <div className="space-y-2"><div className="w-12 h-3 rounded bg-white/5"></div><div className="w-24 h-4 rounded bg-white/10"></div></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bagian Kanan: Summary Card Skeleton */}
            <div className="h-fit space-y-5 p-5 bg-[#F5F2EB] border border-white/5 rounded-2xl">
              <div className="h-4 rounded bg-white/10 w-28"></div>
              <div className="pt-4 space-y-4 border-t border-white/5">
                <div className="flex justify-between"><div className="w-16 h-3 rounded bg-white/5"></div><div className="w-12 h-3 rounded bg-white/10"></div></div>
                <div className="flex justify-between"><div className="w-20 h-3 rounded bg-white/5"></div><div className="w-10 h-3 rounded bg-white/10"></div></div>
                <div className="flex justify-between pt-4 border-t border-white/5"><div className="h-4 rounded bg-white/5 w-14"></div><div className="h-5 rounded bg-white/10 w-28"></div></div>
              </div>
              <div className="w-full h-10 mt-4 bg-white/5 rounded-xl"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ====================================================================
  // HALAMAN KETIKA DATA SUDAH SIAP LOAD
  // ====================================================================
  return (
    <main className="min-h-screen bg-[#ffffff] text-[#f5d9a2] antialiased pt-28 pb-16 px-2 sm:px-4 lg:px-6">
      <div className="p-6 mx-auto max-w-7xl">
        
        {cartItems.length === 0 ? (
          <div className="max-w-xl mx-auto text-center py-16 space-y-6 border border-white/5 bg-[#F5F2EB] rounded-2xl shadow-xl">
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
              See Catalog
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center gap-2 text-[10px] font-bold tracking-wider uppercase text-[#A3A19E]">
              <span className={!isCheckout ? "text-[#E5BA73]" : ""}>1. Daftar Belanja</span>
              <span className="text-white/20">/</span>
              <span className={isCheckout ? "text-[#E5BA73]" : ""}>2. Gerbang Pembayaran</span>
            </div>

            {!isCheckout ? (
              <div className="grid grid-cols-1 gap-2 lg:grid-cols-3">
                
                {/* Bagian Kiri */}
                <div className="space-y-4 lg:col-span-2">
                  <div className="space-y-3 bg-[#F5F2EB] p-4 rounded-2xl border border-white/5 shadow-xl">
                    {cartItems.map((item) => (
                      <CartItem 
                        key={item.id}
                        item={item}
                        onChange={(field, value) => handleQtyChange(item.id, field, value)}
                        onRemove={() => removeFromCart(item.id)}
                      />
                    ))}
                  </div>
                </div>

                {/* Bagian Rangkuman Kanan */}
                <div className="h-fit space-y-4 p-5 bg-[#F5F2EB] border border-[#E5BA73]/10 rounded-2xl shadow-xl">
                  <h3 className="text-xs font-bold text-[#E5BA73] tracking-wide uppercase">Ringkasan Pesanan</h3>
                  <div className="pt-2 space-y-3 border-t border-white/5">
                    <div className="flex justify-between text-xs text-[#A3A19E]">
                      <span>Total Panjang</span>
                      <span className="font-semibold text-black">{totalPanjangMeter} Meter</span>
                    </div>
                    <div className="flex justify-between text-xs text-[#A3A19E]">
                      <span>Jumlah Jenis Kain</span>
                      <span className="font-semibold text-black">{cartItems.length} Item</span>
                    </div>
                    <div className="flex items-baseline justify-between pt-2 border-t border-white/5">
                      <span className="text-xs text-[#5e5d5b]">Subtotal</span>
                      <span className="text-xl font-black text-[#E5BA73]">Rp {totalHarga.toLocaleString('id-ID')}</span>
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
              <div className="bg-[#F5F2EB] p-6 rounded-2xl border border-white/5 shadow-2xl">
                <CheckoutSection 
                  items={cartItems}
                  onBack={() => setIsCheckout(false)}
                  onOrderSuccess={() => {
                    setIsCheckout(false);
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}