'use client';
import React from 'react';
import { X } from 'lucide-react';

export default function OrderDetailModal({ isOpen, onClose, orderData }) {
  if (!isOpen || !orderData) return null;

  const formattedDate = new Date(orderData.tanggal_order)
    .toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    .replace(/\//g, '-');

  // Menghitung subtotal kotor berdasarkan item_order
  const subTotal = orderData.items?.reduce((acc, item) => {
    const hargaPerMeter = item.harga_per_meter || item.gulungan?.produk?.harga_per_meter || 0;
    return acc + (hargaPerMeter * (item.jumlah_order || 0));
  }, 0) || 0;

  const diskonPersen = orderData.diskon || 0; 
  const nominalDiskon = (subTotal * diskonPersen) / 100;
  const totalAkhir = orderData.total_harga || (subTotal - nominalDiskon);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A335A7A] backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-4xl overflow-hidden text-black bg-white border shadow-2xl rounded-xl border-stone-200 font-inter">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
          <div>
            <h3 className="text-lg font-bold text-stone-900">Order</h3>
            <p className="text-xs font-medium text-stone-500 mt-0.5">
              Tanggal Order : {formattedDate}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors">
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Konten */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Data Produk */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-stone-900">
              <span className="inline-block w-4 h-4 border-2 border-dashed border-stone-950 rounded-xs shrink-0"></span>
              <h4>Data Produk</h4>
            </div>

            <div className="space-y-3">
              {orderData.items?.map((item, index) => {
                const produk = item.gulungan?.produk;
                const hargaM = item.harga_per_meter || 0;
                
                return (
                  <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-lg border border-sky-100 bg-[#5AE3ED0A] shadow-md">
                    
                    {/* Thumbnail Gambar Produk (Menggunakan gambar_url sesuai DB) */}
                    <div className="flex items-center justify-center overflow-hidden border rounded-lg w-28 h-28 bg-stone-200 shrink-0 border-stone-300">
                      {produk?.gambar_url ? (
                        <img 
                          src={produk.gambar_url} 
                          alt="Motif Lurik" 
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <span className="text-[10px] text-stone-500 font-medium">No Image</span>
                      )}
                    </div>

                    {/* Detail Metadata Produk (Sesuai Kolom DB Baru) */}
                    <div className="flex-1 min-w-[140px] text-xs space-y-0.5">
                      <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-tight">Kode Produksi</div>
                      <div className="font-bold text-stone-800">{produk?.kode_produk || '-'}</div>
                      
                      <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-tight mt-1">Kategori</div>
                      <div className="font-medium text-stone-700">{produk?.kategori?.nama || '-'}</div>
                      
                      <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-tight mt-1">Motif</div>
                      <div className="font-bold text-stone-900">{produk?.motif?.nama || '-'}</div>
                    </div>

                    {/* Grid Form Input Readonly */}
                    <div className="grid w-full grid-cols-2 gap-3 text-xs md:grid-cols-4 md:w-auto">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-stone-700">Lebar Kain</label>
                        <div className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded text-center font-medium text-stone-800 min-w-[85px]">
                          Lebar {item.gulungan?.lebar || '-'} cm
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-stone-700">Jumlah Order</label>
                        <div className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded text-center font-medium text-stone-800">
                          {item.jumlah_order || 0}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-stone-700">Panjang pesanan</label>
                        <div className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded text-center font-medium text-stone-800 min-w-[85px]">
                          {item.jumlah_order || 0} meter
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-stone-700">Harga Per Meter</label>
                        <div className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded text-right font-medium text-stone-800 min-w-[105px]">
                          Rp.{hargaM.toLocaleString('id-ID')},00
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          <hr className="border-stone-200" />

          {/* Detail Pembayaran */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-stone-900">
              <span className="inline-block w-4 h-3.5 border-2 border-stone-950 rounded-xs shrink-0"></span>
              <h4>Detail Pembayaran</h4>
            </div>

            <div className="grid items-start grid-cols-1 gap-4 md:grid-cols-3 bg-[#5AE3ED0A] p-4 rounded-lg border border-sky-100 shadow-md">
              <div className="space-y-1.5 text-xs">
                <label className="font-semibold text-stone-700">Metode Pembayaran</label>
                <div className="w-full p-3 font-medium uppercase bg-white border rounded-lg border-stone-300 text-stone-800">
                  {orderData.metode_pembayaran || 'Cash'}
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <label className="font-semibold text-stone-700">Diskon (opsional)</label>
                <div className="w-full p-3 font-medium bg-white border rounded-lg border-stone-300 text-stone-800">
                  {diskonPersen}%
                </div>
              </div>

              <div className="p-4 rounded-xl border border-sky-100 bg-[#5AE3ED0A] text-xs space-y-2">
                <div className="flex items-center justify-between text-stone-600">
                  <span>Sub Total</span>
                  <span className="font-medium text-stone-800">Rp.{subTotal.toLocaleString('id-ID')},00</span>
                </div>
                <div className="flex items-center justify-between text-stone-600">
                  <span>Diskon</span>
                  <span className="font-medium text-stone-800">{diskonPersen}%</span>
                </div>
                <div className="flex items-center justify-between pt-2 font-bold border-t border-stone-300 text-stone-900">
                  <span>Total</span>
                  <span className="text-sky-800">Rp.{totalAkhir.toLocaleString('id-ID')},00</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}