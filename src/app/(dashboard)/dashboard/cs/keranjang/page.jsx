
'use client'

import React, { useEffect, useState, Suspense } from "react";
import nextDynamic from "next/dynamic"; 
import { ShoppingCart } from "lucide-react";
import { useRouter, useSearchParams } from 'next/navigation';
import CheckoutSection from "../../../../components/cs/produk/keranjang/CheckoutSection"; 

const CartItemDynamic = nextDynamic(() => import("../../../../components/cs/produk/keranjang/CartItem"), { ssr: false });

function KeranjangContent() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams(); 
  const isCheckout = searchParams.has('checkout');

  useEffect(() => { fetchCart(); }, []);

  const fetchCart = async () => {
    try {
      const res = await fetch("/api/keranjang");
      const result = await res.json();
      if (res.ok) {
        const initializedItems = result.data.map((item) => {
          const sisaMaksimal = item.gulungan?.panjang_sisa ?? 0;
          return {
            ...item,
            input_panjang: item.jumlah_order || sisaMaksimal,
            input_jumlah: 1, 
          };
        });
        setCartItems(initializedItems);
      }
    } catch (err) { 
      console.error("Gagal memuat keranjang", err); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleRemove = (id) => {
    setCartItems((prev) => {
      const newItems = prev.filter((item) => item.id !== id);
      const event = new CustomEvent("updateCartCount", { detail: { count: -1 } });
      window.dispatchEvent(event);
      return newItems;
    });
  };

  const updateLocalState = (id, field, value) => {
    setCartItems((prev) => prev.map((item) => {
      if (item.id !== id) return item;

      let validValue = value;
      if (field === "input_panjang") {
        const maksPanjang = item.gulungan?.panjang_sisa ?? 0;
        if (value > maksPanjang) validValue = maksPanjang;
        if (value < 1) validValue = 1;
      } else if (field === "input_jumlah") {
        validValue = Math.max(1, value);
      }

      return { ...item, [field]: validValue };
    }));
  };

  const groupedItems = cartItems.reduce((acc, item) => {
    const pId = item.gulungan?.produk?.id;
    if (!pId) return acc;
    if (!acc[pId]) acc[pId] = { produk: item.gulungan.produk, items: [] };
    acc[pId].items.push(item);
    return acc;
  }, {});

  if (isCheckout) {
    return <CheckoutSection items={cartItems} onBack={() => router.back()} onOrderSuccess={() => setCartItems([])} />;
  }

return (
    <div className="space-y-6 font-inter">
      <div className="overflow-x-visible">
        <h2 className="px-4 pb-2 sm:pb-5 -mx-4 text-lg sm:text-[24px] font-medium tracking-wide border-b border-gray-500 text-stone-800 sm:-mx-6 sm:px-6">
          Keranjang
        </h2>
      </div>
      {loading ? (
        <div className="p-6 space-y-6 bg-white border rounded-lg shadow-xl border-stone-200 animate-pulse">
          {[...Array(2)].map((_, groupIdx) => (
            <div key={groupIdx} className="pb-6 space-y-4 border-b border-stone-100 last:border-none">
              <div className="flex items-center gap-4 p-2 border rounded-lg border-stone-200/60 bg-stone-50">
                <div className="rounded-lg bg-stone-200 w-38 h-28 shrink-0"></div>
                <div className="flex flex-col gap-3 w-full max-w-[200px]">
                  <div className="space-y-1"><div className="w-1/3 h-2 rounded bg-stone-200">
                  </div><div className="w-3/4 h-4 rounded bg-stone-200"></div></div>
                  <div className="space-y-1"><div className="w-1/4 h-2 rounded bg-stone-200">
                  </div><div className="w-1/2 h-4 rounded bg-stone-200"></div></div>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 p-4 bg-white border border-stone-100 rounded-xl">
                <div className="w-1/3 space-y-2"><div className="w-full h-4 rounded bg-stone-200"></div></div>
                <div className="rounded-lg h-9 bg-stone-200 w-28"></div>
              </div>
            </div>
          ))}
        </div>
      ) : cartItems.length === 0 ? (
        <p className="text-center text-stone-500">Keranjang kosong.</p>
      ) : (
        <div className="p-4 space-y-4 bg-white border rounded-lg shadow-xl">
  {Object.values(groupedItems).map((group) => (
    <div key={group.produk.id} className="pb-4 space-y-4 border-b last:border-b-0">
      
      {/* Banner Utama Produk */}
      <div className="flex items-center gap-4 p-2 bg-[#FCEBB3] rounded-lg border border-[#FBE395]">
        <img 
          src={group.produk.gambar_url || '/placeholder-kain.jpg'} 
          className="object-cover w-48 border rounded-md shadow-sm h-28 shrink-0 border-black/10" 
          alt="produk" 
        />
        
        {/* Kontainer Teks: Label di atas, value di bawah */}
        <div className="flex flex-col gap-1 text-[11px]">
          <div>
            <p className="font-medium leading-tight text-gray-400">Kode Produksi</p>
            <p className="font-bold text-gray-800">{group.produk.kode_produk}</p>
          </div>
          
          <div>
            <p className="font-medium leading-tight text-gray-400">Kategori</p>
            <p className="font-bold text-gray-800">{group.produk.kategori?.nama || 'Merah Series'}</p>
          </div>
          
          <div>
            <p className="font-medium leading-tight text-gray-400">Motif</p>
            <p className="font-semibold text-gray-700">{group.produk.motif?.nama || 'Jambu Dersono'}</p>
          </div>
        </div>
      </div>
              
              {group.items.map((item) => (
                <CartItemDynamic 
                  key={item.id} 
                  item={item} 
                  onRemove={() => handleRemove(item.id)} 
                  onChange={(f, v) => updateLocalState(item.id, f, v)} 
                />
              ))}
            </div>
          ))}
          <div className="flex justify-end pt-4">
            <button onClick={() => router.push('?checkout')} className="flex items-center gap-2 px-8 py-3 bg-[#1A335A] text-white rounded-lg font-semibold hover:bg-[#274a83] transition-colors">
              <ShoppingCart size={20} /> Lanjut check-out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function KeranjangPage() {
  return (
    <Suspense fallback={<div className="p-6 text-stone-500">Memuat Keranjang...</div>}>
      <KeranjangContent />
    </Suspense>
  );
}