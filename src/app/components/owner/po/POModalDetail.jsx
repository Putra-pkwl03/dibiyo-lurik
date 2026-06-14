'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Loader2 } from 'lucide-react';


export default function POModalDetail({ item, tipe, onClose, onRefresh }) {
  const [status, setStatus] = useState(item?.status || 'dalam_proses');
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Mengatasi masalah SSR (Server-Side Rendering) Next.js saat memuat react-dom portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Guard clause jika modal tidak sengaja terbuka tanpa data
  if (!item) return null;

  const isAlreadyFinished = item.status === 'selesai_diproses';

  // Helper memformat tanggal standar lokal Indonesia (dd/mm/yyyy)
  const formatTanggal = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  const tanggalSelesaiRaw = item.tanggal_selesai || item.estimasi_selesai || item.estimasi_jadi;
  const tanggalPoRaw = item.tanggal_po || item.created_at;

  // // Handler simpan perubahan status (PATCH ke API)
  // const handleSaveStatus = async () => {
  //   if (status === item.status) {
  //     onClose();
  //     return;
  //   }

  //   setSubmitting(true);
  //   try {
  //     const res = await fetch('/api/po', {
  //       method: 'PATCH',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({
  //         id: item.id,
  //         tipe: tipe,
  //         status: status,
  //       }),
  //     });

  //     const result = await res.json();

  //     if (!res.ok) {
  //       throw new Error(result.error || 'Gagal memperbarui status');
  //     }

  //     Swal.fire({
  //       icon: 'success',
  //       title: 'Berhasil',
  //       text: 'Status produksi berhasil diperbarui!',
  //       confirmButtonColor: '#1A335A',
  //     });

  //     onRefresh();
  //     onClose();
  //   } catch (err) {
  //     Swal.fire({
  //       icon: 'error',
  //       title: 'Gagal',
  //       text: err.message,
  //       confirmButtonColor: '#EF4444',
  //     });
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };

  // Struktur JSX modal utama
  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A335A7A] font-inter backdrop-blur-sm">
      {/* Container Modal */}
      <div className="w-full max-w-5xl overflow-hidden duration-200 bg-white rounded-lg shadow-lg animate-in fade-in zoom-in-95">
        
        {/* HEADER MODAL */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-[#1A335A]">
            Detail Pre-Order {tipe === 'custom' ? 'Custom' : 'Reguler'}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-gray-600"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* BODY MODAL */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-black">
          
          {/* BARIS 1: Data Customer & Detail Pembayaran */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
            
            {/* Box Data Customer */}
            <div className="md:col-span-7 bg-[#FFECA7] border border-black rounded-lg p-4 text-[11px] space-y-3">
              <div className="flex items-center gap-2 font-bold text-[#1A335A] text-xs">
                <span>👤</span> Data Customer
              </div>
              
              <div className="grid grid-cols-3 pt-2 pb-2 border-t border-b border-black">
                <div className="pr-3 border-r border-black">
                  <p className="font-medium text-gray-500">Nama Customer</p>
                  <p className="font-bold mt-0.5 break-words">{item.nama_customer || '-'}</p>
                </div>
                
                <div className="px-3 border-r border-black">
                  <p className="font-medium text-gray-500">No Telpon</p>
                  <p className="font-bold mt-0.5">{item.kontak_customer || '-'}</p>
                </div>
                
                <div className="pl-3">
                  <p className="font-medium text-gray-500">Tanggal Pre-Order</p>
                  <p className="font-bold mt-0.5">{formatTanggal(tanggalPoRaw)}</p>
                </div>
              </div>

              <div>
                <p className="font-medium text-gray-500">Alamat</p>
                <p className="font-semibold mt-0.5 leading-relaxed">
                  {item.alamat_customer || 'Alamat tidak dicantumkan.'}
                </p>
              </div>
            </div>

            {/* Box Detail Pembayaran */}
            <div className="md:col-span-5 bg-[#FFECA7] border border-black rounded-lg p-4 text-[11px] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 font-bold text-[#1A335A] text-xs mb-3">
                  <span>💳</span> Detail Pembayaran
                </div>
                
                <div className="grid grid-cols-2 pt-2 pb-2 border-t border-b border-black">
                  <div className="pr-3 border-r border-black">
                    <p className="font-medium text-gray-500">Status Pembayaran</p>
                    <span className={`inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded-md text-white ${
                      item.status_pembayaran?.toLowerCase() === 'lunas' ? 'bg-[#1DB793]' : 'bg-[#F0A864]'
                    }`}>
                      {item.status_pembayaran?.toUpperCase() || 'DP'}
                    </span>
                  </div>
                  
                  <div className="pl-3">
                    <p className="font-medium text-gray-500">Metode Pembayaran</p>
                    <p className="mt-1 font-bold">{item.metode_pembayaran || 'Cash'}</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-2">
                <p className="font-medium text-gray-500">Total Harga</p>
                <p className="text-sm font-bold text-black mt-0.5">
                  Rp. {item.total_harga?.toLocaleString('id-ID')}
                </p>
              </div>
            </div>

          </div>

          {/* BARIS 2: Data Produk */}
          <div className="p-4 space-y-3 bg-white border border-gray-100 rounded-lg">
            <div className="flex items-center gap-2 font-bold text-[#1A335A] text-xs">
              <span>📦</span> Data Produk Berdampak
            </div>
            
            <div className="bg-[#5AE3ED]/5 border border-gray-100 rounded-lg p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px]">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-gradient-to-br from-red-800 to-amber-900 rounded-lg shadow-inner shrink-0 flex items-center justify-center text-white text-[9px] font-bold overflow-hidden">
                  <div className="w-full h-full opacity-40 bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_50%,#000_50%,#000_75%,transparent_75%,transparent)] bg-[size:8px_8px]"></div>
                </div>
                <div>
                  <p className="font-medium text-gray-400">Kode Produksi / Kategori</p>
                  <p className="font-bold text-gray-700">{item.kode_produksi || (tipe === 'custom' ? 'AKLBL-CUSTOM' : 'AKLBL-REGULER')}</p>
                  <p className="mt-1 font-medium text-gray-400">Keterangan Desain</p>
                  <p className="font-semibold">{tipe === 'custom' ? 'Custom Design / Lurik Klasik' : 'Katalog Kain Reguler'}</p>
                </div>
              </div>

              <div className="grid w-full grid-cols-2 text-left sm:grid-cols-4 gap-x-6 gap-y-2 sm:w-auto sm:text-center">
                <div>
                  <p className="font-medium text-gray-400">Lebar Kain</p>
                  <p className="border border-gray-200 bg-white rounded px-2 py-0.5 font-bold text-gray-700 mt-0.5 inline-block min-w-[70px]">
                    {item.lebar_kain || (item.item_pre_order_custom?.[0]?.lebar ? `${item.item_pre_order_custom[0].lebar} cm` : '110 cm')}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-400">Jumlah PO</p>
                  <p className="border border-gray-200 bg-white rounded px-2 py-0.5 font-bold text-gray-700 mt-0.5 inline-block min-w-[40px]">
                    {tipe === 'custom' 
                      ? (item.item_pre_order_custom?.reduce((s, i) => s + (i.jumlah || 0), 0) || 1)
                      : (item.items?.reduce((s, i) => s + (i.jumlah || 0), 0) || item.jumlah_item || 1)
                    }
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-400">Panjang Kain</p>
                  <p className="border border-gray-200 bg-white rounded px-2 py-0.5 font-bold text-gray-700 mt-0.5 inline-block min-w-[60px]">
                    {item.panjang_kain || (item.item_pre_order_custom?.[0]?.panjang ? `${item.item_pre_order_custom[0].panjang} m` : '-')}
                  </p>
                </div>
                <div className="sm:text-right">
                  <p className="font-medium text-gray-400">Subtotal</p>
                  <p className="border border-gray-200 bg-white rounded px-2 py-0.5 font-bold text-gray-700 mt-0.5 inline-block min-w-[90px] text-right">
                    Rp.{item.total_harga?.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* BARIS 3: Estimasi Produk Jadi & KONTROL INPUT UPDATE STATUS */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
            
            {/* Estimasi Tanggal */}
            <div className="md:col-span-4 bg-[#5AE3ED]/5 border border-gray-100 rounded-lg p-4 text-[11px] space-y-2 flex flex-col justify-between">
              <div className="flex items-center gap-2 font-bold text-[#1A335A] text-xs">
                <span>🕒</span> Estimasi Produk Jadi
              </div>
              <div className="w-full bg-[#F2B600C4] text-black font-bold text-center py-2 rounded-lg tracking-wider text-xs">
                {formatTanggal(tanggalSelesaiRaw)}
              </div>
            </div>

            {/* Input Dropdown Update Status Produksi */}
            <div className="md:col-span-8 bg-[#5AE3ED]/5 border border-gray-100 rounded-lg p-4 text-[11px] space-y-2 flex flex-col justify-between">
              <div className="flex items-center justify-between font-bold text-[#1A335A] text-xs">
                <span className="flex items-center gap-2">⚙️ {isAlreadyFinished ? "Status Produksi Akhir" : "Update Status Produksi"}</span>
                {isAlreadyFinished && <span className="text-[10px] text-red-600 font-medium italic">*Lunas & Terkunci</span>}
              </div>
              
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled
                className="w-full p-2 bg-blue-200 border border-gray-300 rounded-lg font-bold text-xs text-gray-700 focus:ring-2 focus:ring-[#1A335A] focus:outline-none  disabled:cursor-not-allowed"
              >
                {(item.status === 'belum_diproses' || item.status === 'dalam_proses') && (
                  <>
                    <option value={item.status}>Dalam Proses</option>
                    <option value="sedang_diproses">Sedang Diproses</option>
                  </>
                )}

                {item.status === 'sedang_diproses' && (
                  <>
                    <option value="sedang_diproses">Sedang Diproses</option>
                    <option value="selesai_diproses">Selesai Diproses</option>
                  </>
                )}

                {item.status === 'selesai_diproses' && (
                  <option value="selesai_diproses">Selesai Diproses</option>
                )}
              </select>
            </div>

          </div>

          {/* BARIS 4: Catatan Khusus */}
          <div className="bg-[#5AE3ED]/5 border border-gray-100 rounded-lg p-4 text-[11px] space-y-1.5">
            <p className="font-bold text-[#1A335A] text-xs">Catatan Pesanan</p>
            <div className="w-full bg-white border border-gray-200 rounded-lg p-2.5 min-h-[50px] font-medium text-gray-600">
              {item.catatan || 'Tidak ada catatan khusus untuk kustomisasi pesanan ini.'}
            </div>
          </div>

        </div>

        {/* FOOTER MODAL - Menggunakan justify-end untuk meratakan button ke kanan */}
        <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            // disabled={submitting}
            className="px-4 py-2 text-xs font-bold text-gray-100 bg-[#1A335A] border border-gray-300 rounded-lg hover:bg-[#1A335A]"
          >
            Tutup
          </button>
          
          {/* {!isAlreadyFinished && (
            <button
              onClick={handleSaveStatus}
              disabled={submitting}
              className="flex items-center gap-2 px-4 py-2 bg-[#1A335A] hover:bg-[#11223d] text-white rounded-lg text-xs font-bold shadow-sm transition-colors disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save size={13} />
                  Simpan Perubahan
                </>
              )}
            </button>
          )} */}
        </div>

      </div>
    </div>
  );

  // Render menggunakan React DOM Portal jika sudah termuat di client-side
  if (!mounted) return null;

  return createPortal(modalContent, document.body);
}