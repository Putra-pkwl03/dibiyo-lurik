// 'use client'

// export const dynamic = 'force-dynamic'; // Konfigurasi route Next.js

// import React, { useEffect, useState } from "react";
// import dynamicImport from "next/dynamic"; 
// import { ShoppingCart } from "lucide-react";
// import { useRouter, useSearchParams } from 'next/navigation';

// import CheckoutSection from "../../../../components/cs/produk/keranjang/CheckoutSection"; 

// // Gunakan nama dynamicImport di sini
// const CartItemDynamic = dynamicImport(() => import("../../../../components/cs/produk/keranjang/CartItem"), { ssr: false });

// export default function KeranjangPage() {
//   const [cartItems, setCartItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const isCheckout = searchParams.has('checkout');

//   useEffect(() => { fetchCart(); }, []);

//   const fetchCart = async () => {
//     try {
//       const res = await fetch("/api/keranjang");
//       const result = await res.json();
//       if (res.ok) {
//         const initializedItems = result.data.map((item) => {
//           // Gunakan panjang_sisa dari API sebagai default awal pemesanan
//           const sisaMaksimal = item.gulungan?.panjang_sisa ?? 0;
//           return {
//             ...item,
//             input_panjang: item.jumlah_order || sisaMaksimal,
//             input_jumlah: 1, // Kunci tetap 1 karena ini sistem potong per gulungan spesifik
//           };
//         });
//         setCartItems(initializedItems);
//       }
//     } catch (err) { 
//       console.error("Gagal memuat keranjang", err); 
//     } finally { 
//       setLoading(false); 
//     }
//   };

//   const handleRemove = (id) => {
//     setCartItems((prev) => {
//       const newItems = prev.filter((item) => item.id !== id);
//       const event = new CustomEvent("updateCartCount", { detail: { count: -1 } });
//       window.dispatchEvent(event);
//       return newItems;
//     });
//   };

//   const updateLocalState = (id, field, value) => {
//     setCartItems((prev) => prev.map((item) => {
//       if (item.id !== id) return item;

//       let validValue = value;
//       if (field === "input_panjang") {
//         const maksPanjang = item.gulungan?.panjang_sisa ?? 0;
//         // Beri batasan: Minimal 1 meter, Maksimal sesuai panjang_sisa gulungan
//         if (value > maksPanjang) validValue = maksPanjang;
//         if (value < 1) validValue = 1;
//       } else if (field === "input_jumlah") {
//         validValue = Math.max(1, value);
//       }

//       return { ...item, [field]: validValue };
//     }));
//   };

//   const groupedItems = cartItems.reduce((acc, item) => {
//     const pId = item.gulungan?.produk?.id;
//     if (!pId) return acc;
//     if (!acc[pId]) acc[pId] = { produk: item.gulungan.produk, items: [] };
//     acc[pId].items.push(item);
//     return acc;
//   }, {});

//   if (isCheckout) {
//     return <CheckoutSection items={cartItems} onBack={() => router.back()} onOrderSuccess={() => setCartItems([])} />;
//   }

//   return (
//     <div className="mx-auto space-y-6">
//       <h1 className="mb-6 text-2xl pb-2 font-bold border-b border-[#8B5E3C] text-[#8B5E3C]">Keranjang</h1>
      
//       {loading ? (
//         <div className="p-6 space-y-6 bg-white border rounded-lg shadow-xl border-stone-200 animate-pulse">
//           {[...Array(2)].map((_, groupIdx) => (
//             <div key={groupIdx} className="pb-6 space-y-4 border-b border-stone-100 last:border-none">
//               <div className="flex items-center gap-4 p-2 border rounded-lg border-stone-200/60 bg-stone-50">
//                 <div className="rounded-lg bg-stone-200 w-38 h-28 shrink-0"></div>
//                 <div className="flex flex-col gap-3 w-full max-w-[200px]">
//                   <div className="space-y-1"><div className="w-1/3 h-2 rounded bg-stone-200"></div><div className="w-3/4 h-4 rounded bg-stone-200"></div></div>
//                   <div className="space-y-1"><div className="w-1/4 h-2 rounded bg-stone-200"></div><div className="w-1/2 h-4 rounded bg-stone-200"></div></div>
//                 </div>
//               </div>
//               <div className="flex items-center justify-between gap-4 p-4 bg-white border border-stone-100 rounded-xl">
//                 <div className="w-1/3 space-y-2"><div className="w-full h-4 rounded bg-stone-200"></div></div>
//                 <div className="rounded-lg h-9 bg-stone-200 w-28"></div>
//               </div>
//             </div>
//           ))}
//         </div>
//       ) : cartItems.length === 0 ? (
//         <p className="text-center text-stone-500">Keranjang kosong.</p>
//       ) : (
//         <div className="p-6 space-y-4 bg-white border rounded-lg shadow-xl">
//           {Object.values(groupedItems).map((group) => (
//             <div key={group.produk.id} className="pb-4 space-y-4 border-b last:border-b-0">
//               {/* Header Informasi Utama Produk */}
//               <div className="flex items-center gap-4 p-2 border rounded-lg bg-[#E3C2AC59] border-[#E3C2AC]/30">
//                 <img 
//                   src={group.produk.gambar_url || '/placeholder-kain.jpg'} 
//                   className="object-cover rounded-lg w-38 h-28" 
//                   alt="produk" 
//                 />
//                 <div className="flex flex-col gap-2">
//                   <div>
//                     <p className="text-[10px] text-stone-400 uppercase">Kode Produk</p>
//                     <p className="text-sm font-bold text-[#8B5E3C]">{group.produk.kode_produk}</p>
//                   </div>
//                   <div className="flex gap-6">
//                     <div>
//                       <p className="text-[10px] text-stone-400 uppercase">Kategori</p>
//                       <p className="text-xs font-bold text-stone-700">{group.produk.kategori?.nama || '-'}</p>
//                     </div>
//                     <div>
//                       <p className="text-[10px] text-stone-400 uppercase">Motif</p>
//                       <p className="text-xs font-bold text-stone-700">{group.produk.motif?.nama || '-'}</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
              
//               {/* List Detail Item Gulungan */}
//               {group.items.map((item) => (
//                 <CartItemDynamic 
//                   key={item.id} 
//                   item={item} 
//                   onRemove={() => handleRemove(item.id)} 
//                   onChange={(f, v) => updateLocalState(item.id, f, v)} 
//                 />
//               ))}
//             </div>
//           ))}
//           <div className="flex justify-end pt-4">
//             <button onClick={() => router.push('?checkout')} className="flex items-center gap-2 px-8 py-3 bg-[#8B5E3C] text-white rounded-lg font-semibold hover:bg-[#724d31] transition-colors">
//               <ShoppingCart size={20} /> Lanjut check-out
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


'use client'

export const dynamic = 'force-dynamic'; // Konfigurasi murni dynamic route Next.js

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic"; // FIX: Gunakan nama standar 'dynamic' agar compiler Turbopack tidak bingung
import { ShoppingCart } from "lucide-react";
import { useRouter, useSearchParams } from 'next/navigation';

import CheckoutSection from "../../../../components/cs/produk/keranjang/CheckoutSection"; 

// FIX: Panggil langsung menggunakan fungsi dynamic bawaan Next.js
const CartItemDynamic = dynamic(() => import("../../../../components/cs/produk/keranjang/CartItem"), { ssr: false });

export default function KeranjangPage() {
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
    <div className="mx-auto space-y-6">
      <h1 className="mb-6 text-2xl pb-2 font-bold border-b border-[#8B5E3C] text-[#8B5E3C]">Keranjang</h1>
      
      {loading ? (
        <div className="p-6 space-y-6 bg-white border rounded-lg shadow-xl border-stone-200 animate-pulse">
          {[...Array(2)].map((_, groupIdx) => (
            <div key={groupIdx} className="pb-6 space-y-4 border-b border-stone-100 last:border-none">
              <div className="flex items-center gap-4 p-2 border rounded-lg border-stone-200/60 bg-stone-50">
                <div className="rounded-lg bg-stone-200 w-38 h-28 shrink-0"></div>
                <div className="flex flex-col gap-3 w-full max-w-[200px]">
                  <div className="space-y-1"><div className="w-1/3 h-2 rounded bg-stone-200"></div><div className="w-3/4 h-4 rounded bg-stone-200"></div></div>
                  <div className="space-y-1"><div className="w-1/4 h-2 rounded bg-stone-200"></div><div className="w-1/2 h-4 rounded bg-stone-200"></div></div>
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
        <div className="p-6 space-y-4 bg-white border rounded-lg shadow-xl">
          {Object.values(groupedItems).map((group) => (
            <div key={group.produk.id} className="pb-4 space-y-4 border-b last:border-b-0">
              <div className="flex items-center gap-4 p-2 border rounded-lg bg-[#E3C2AC59] border-[#E3C2AC]/30">
                <img 
                  src={group.produk.gambar_url || '/placeholder-kain.jpg'} 
                  className="object-cover rounded-lg w-38 h-28" 
                  alt="produk" 
                />
                <div className="flex flex-col gap-2">
                  <div>
                    <p className="text-[10px] text-stone-400 uppercase">Kode Produk</p>
                    <p className="text-sm font-bold text-[#8B5E3C]">{group.produk.kode_produk}</p>
                  </div>
                  <div className="flex gap-6">
                    <div>
                      <p className="text-[10px] text-stone-400 uppercase">Kategori</p>
                      <p className="text-xs font-bold text-stone-700">{group.produk.kategori?.nama || '-'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-stone-400 uppercase">Motif</p>
                      <p className="text-xs font-bold text-stone-700">{group.produk.motif?.nama || '-'}</p>
                    </div>
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
            <button onClick={() => router.push('?checkout')} className="flex items-center gap-2 px-8 py-3 bg-[#8B5E3C] text-white rounded-lg font-semibold hover:bg-[#724d31] transition-colors">
              <ShoppingCart size={20} /> Lanjut check-out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}