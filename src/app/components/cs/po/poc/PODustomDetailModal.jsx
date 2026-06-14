'use client';

import React, { useState } from 'react';
import { X, Printer, CreditCard, Box, Calendar, FileText, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import qz from 'qz-tray';

export default function PODustomDetailModal({ isOpen, onClose, item }) {
  const [isPrinting, setIsPrinting] = useState(false);

  if (!isOpen || !item) return null;

  // Cek status pembayaran lunas atau bukan
  const isLunas = item.status_pembayaran?.toLowerCase() === 'lunas';

  // SINKRONISASI DATA PRODUK: Diambil sekali agar konsisten di struk & UI modal
  const daftarProduk = Array.isArray(item.item_pre_order_custom) 
    ? item.item_pre_order_custom 
    : [];

  // Helper 1: Format Standar Estimasi Jadi
  const formatEstimasiJadi = (dateString) => {
    if (!dateString) return '00/00/0000';
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

  // Helper 2: Format Tanggal Indonesia
  const formatTanggalIndo = (dateString) => {
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

  // Kalkulasi nilai akumulasi untuk transparansi data billing
  const hitungSubtotalItem = (it) => 
    // Menggunakan fallback rumus: harga_per_meter * panjang * jumlah jika subtotal kosong
    Number(it.subtotal) || (Number(it.harga_per_meter || 0) * Number(it.panjang || 0) * Number(it.jumlah || 1));
  
  const hitungSubtotalKotor = daftarProduk.reduce((acc, curr) => acc + hitungSubtotalItem(curr), 0);
  const totalHargaAkhir = Number(item.total_harga || 0);
  const totalDanaMasuk = Number(item.total_dp || 0);
  const sisaKekurangan = Math.max(0, totalHargaAkhir - totalDanaMasuk);

  const tanggalSelesaiRaw = item.tanggal_selesai || item.estimasi_selesai || item.estimasi_jadi;

  // ==============================================================================
  // FUNGSI CETAK RAW ESC/POS VIA QZ TRAY
  // ==============================================================================
  const handleCetakStrukDirect = async () => {
    setIsPrinting(true);
    try {
      if (!qz.websocket.isActive()) {
        await qz.websocket.connect({ host: 'localhost', keepAlive: true });
      }

      const config = qz.configs.create("POS-80", {
        retries: 0,
        encoding: 'UTF-8'
      });

      const initPrinter = '\x1B\x40';
      const centerAlign = '\x1B\x61\x01';
      const leftAlign = '\x1B\x61\x00';
      const boldOn = '\x1B\x45\x01';
      const boldOff = '\x1B\x45\x00';
      const lineBreak = '\n';
      const cutPaper = '\x1D\x56\x41\x03';

      let printData = [
        initPrinter,
        centerAlign,
        boldOn,
        'TOKO DIBIYO LURIK\n',
        boldOff,
        'Jl. Krapyak Wetan No.rt 06 no 201, Krapyak Wetan, Panggungharjo, Kec. Sewon, Bantul, DIY 55188\n',
        '\n',
        '------------------------------------------------\n', 
        leftAlign,
        `Tanggal PO Custom : ${item.created_at ? formatEstimasiJadi(item.created_at) : '01-05-2026'}\n`,
        `Status            : ${item.status === 'selesai_diproses' ? 'Selesai' : item.status?.replace('_', ' ').toUpperCase() || 'BELUM DIPROSES'}\n`,
        '------------------------------------------------\n',
        boldOn,
        'Customer\n',
        boldOff,
        `Nama              : ${item.nama_customer || '-'}\n`,
        `Telp              : ${item.kontak_customer || '-'}\n`,
        '------------------------------------------------\n',
        boldOn,
        'Produk\n',
        boldOff
      ];

      daftarProduk.forEach((prod, index) => {
        const lebar = prod.lebar ? `${prod.lebar} cm` : '-';
        const panjang = prod.panjang ? `${prod.panjang} m` : '-';
        const jumlah = prod.jumlah || 1;
        const hargaItem = hitungSubtotalItem(prod);

        printData.push(
          ` ${index + 1}. Lurik Custom - ${prod.jenis_pewarna || 'Klasik'} (${jumlah}x)\n`,
          `     L: ${lebar} . P: ${panjang}\n`,
          `     Subtotal : Rp ${hargaItem.toLocaleString('id-ID')}\n`
        );
      });

      printData.push(
        '------------------------------------------------\n',
        boldOn,
        'Detail Pembayaran\n',
        boldOff,
        `Total             : Rp ${totalHargaAkhir.toLocaleString('id-ID')}\n`
      );

      // STRUK KONDISI: Hanya tampilkan baris DP jika status pembayaran BELUM LUNAS
      if (!isLunas) {
        printData.push(`DP / Uang Masuk   : Rp ${totalDanaMasuk.toLocaleString('id-ID')}\n`);
        printData.push(`Sisa Kekurangan   : Rp ${sisaKekurangan.toLocaleString('id-ID')}\n`);
      }

      printData.push(
        `Status            : ${item.status_pembayaran?.toUpperCase() || 'DP'}\n`,
        '------------------------------------------------\n',
        boldOn,
        'Metode Pembayaran\n',
        boldOff,
        `${item.metode_pembayaran || 'Cash'}\n`,
        '------------------------------------------------\n',
        `Estimasi Produk Jadi : ${formatEstimasiJadi(tanggalSelesaiRaw)}\n`,
        '------------------------------------------------\n',
        '\n',
        centerAlign,
        boldOn,
        'Terima Kasih !\n',
        boldOff,
        lineBreak,
        lineBreak,
        lineBreak,
        cutPaper
      );

      await qz.print(config, printData);

      Swal.fire({
        title: 'Berhasil Dicetak',
        text: 'Struk Pre-Order berhasil dikirim ke printer POS-80.',
        icon: 'success',
        confirmButtonColor: '#1A335A',
        didOpen: () => {
          if (document.querySelector('.swal2-container')) {
            document.querySelector('.swal2-container').style.zIndex = '99999';
          }
        }
      });

    } catch (err) {
      console.error("[PRINTER-ERROR]", err);
      Swal.fire({
        title: 'Gagal Mencetak',
        text: 'Pastikan aplikasi QZ Tray aktif di kasir dan printer bernama "POS-80" telah menyala.',
        icon: 'error',
        confirmButtonColor: '#1A335A',
        didOpen: () => {
          if (document.querySelector('.swal2-container')) {
            document.querySelector('.swal2-container').style.zIndex = '99999';
          }
        }
      });
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A335A7A] font-inter backdrop-blur-[3px] print:p-0 print:bg-white print:relative">
      
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #1A335A transparent;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #1A335A;
          border-radius: 10px;
        }
        @media print {
          body * { visibility: hidden; }
          .print-modal-container, .print-modal-container * { visibility: visible; }
          .print-modal-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print { display: none !important; }
        }
      `}} />

      <div className="print-modal-container bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-y-auto custom-scrollbar flex flex-col">
        
        {/* HEADER MODAL */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 print:pb-2">
          <h3 className="text-sm font-bold text-[#1A335A] tracking-wide uppercase">Detail Nota Pre-Order Custom</h3>
          <button 
            onClick={onClose}
            className="text-[#1A335A] hover:opacity-70 transition-opacity cursor-pointer no-print"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* BODY MODAL */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-black custom-scrollbar">
          
          {/* BARIS 1: Data Customer & Detail Pembayaran */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
            {/* Box Data Customer */}
            <div className="md:col-span-7 bg-[#EBF5FA]/40 border border-[#1A335A]/20 rounded-lg p-4 text-[11px] space-y-3">
              <div className="flex items-center gap-2 font-bold text-[#1A335A] text-xs">
                <span>👤</span> Data Customer
              </div>
              
              <div className="grid grid-cols-3 pt-2 pb-2 border-t border-b border-gray-200">
                <div className="pr-3 border-r border-gray-200">
                  <p className="font-medium text-gray-400">Nama Customer</p>
                  <p className="font-bold mt-0.5 text-[#1A335A] break-words">{item.nama_customer || '-'}</p>
                </div>
                <div className="px-3 border-r border-gray-200">
                  <p className="font-medium text-gray-400">No Telpon</p>
                  <p className="font-bold mt-0.5 text-[#1A335A]">{item.kontak_customer || '-'}</p>
                </div>
                <div className="pl-3">
                  <p className="font-medium text-gray-400">Tanggal Pre-Order</p>
                  <p className="font-bold text-gray-800 mt-0.5 text-xs">
                    {item.created_at ? formatTanggalIndo(item.created_at) : formatTanggalIndo(item.tanggal_po)}
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <p className="font-medium text-gray-400">Alamat Kirim</p>
                <p className="font-semibold text-gray-700 mt-0.5 leading-relaxed">
                  {item.alamat_customer || 'Alamat tidak dicantumkan.'}
                </p>
              </div>
            </div>

            {/* Box Detail Pembayaran */}
            <div className="md:col-span-5 bg-[#5AE3ED1C] border border-[#1A335A]/20 rounded-xl p-4 text-[11px] flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center gap-2 font-bold text-[#1A335A] text-xs border-b border-[#1A335A]/10 pb-1.5 mb-2">
                  <CreditCard size={14} /> Keuangan & Metode Pembayaran
                </div>
                
                <div className="grid grid-cols-2 pt-1 pb-1">
                  <div className="pr-3 border-r border-gray-300">
                    <p className="font-medium text-gray-400">Status Pembayaran</p>
                    <span className={`inline-block mt-1 text-[9px] font-black px-2.5 py-0.5 rounded-md text-white uppercase tracking-wider ${
                      isLunas ? 'bg-[#1DB793]' : 'bg-[#F2B600]'
                    }`}>
                      {item.status_pembayaran?.toUpperCase() || 'DP'}
                    </span>
                  </div>
                  <div className="pl-3">
                    <p className="font-medium text-gray-400">Metode Pembayaran</p>
                    <p className="mt-1 text-xs font-bold text-gray-800 capitalize">{item.metode_pembayaran || 'Cash'}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-end justify-between pt-2 border-t border-gray-200">
                <div>
                  <p className="font-medium text-gray-400">Total Nilai Kontrak Kerja</p>
                  <p className="text-sm font-black text-[#1A335A] mt-0.5">
                    Rp {totalHargaAkhir.toLocaleString('id-ID')}
                  </p>
                </div>
                {/* UI KONDISI: Sisa Kurang di bagian atas hanya tampil jika belum lunas */}
                {!isLunas && sisaKekurangan > 0 && (
                  <div className="text-right">
                    <span className="text-[9px] bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded">Sisa Kurang: Rp {sisaKekurangan.toLocaleString('id-ID')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* BARIS 2: DATA PRODUK */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-bold text-[#1A335A] text-xs border-b pb-1">
              <Box size={14} /> Daftar Item Produk Custom ({daftarProduk.length} Item)
            </div>
            
            <div className="space-y-3 max-h-[30vh] overflow-y-auto custom-scrollbar pr-1 print:max-h-none">
              {daftarProduk.length === 0 ? (
                <div className="text-center py-6 text-gray-400 border border-dashed rounded-xl text-[11px]">
                  Tidak ada item produk terlampir.
                </div>
              ) : (
                daftarProduk.map((prodItem, idx) => (
                  <div 
                    key={prodItem.id || idx} 
                    className="bg-[#5AE3ED1C] border border-[#1A335A]/10 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center overflow-hidden bg-white border border-gray-200 rounded-lg shadow-inner w-14 h-14 shrink-0">
                        {prodItem.gambar_custom || prodItem.image ? (
                          <img 
                            src={prodItem.gambar_custom || prodItem.image} 
                            alt="Custom design" 
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center text-[8px] text-gray-400 font-bold p-1 text-center">
                            <span>No Image</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-400">Item Antrean ke-{(idx + 1)}</p>
                        <p className="font-bold text-gray-700 capitalize">
                          Lurik Custom - Pewarna {prodItem.jenis_pewarna || 'Klasik'}
                        </p>
                        <p className="mt-0.5 text-[10px] text-gray-500">
                          Tarif Master: Rp {Number(prodItem.harga_per_meter || 0).toLocaleString('id-ID')}/meter
                        </p>
                      </div>
                    </div>

                    <div className="grid w-full grid-cols-4 gap-4 pt-2 text-left border-t border-gray-200 sm:gap-6 sm:text-center sm:w-auto sm:pt-0 sm:border-t-0">
                      <div>
                        <p className="font-medium text-gray-400">Lebar Kain</p>
                        <p className="font-bold text-gray-700 mt-0.5 text-xs">
                          {prodItem.lebar ? `${prodItem.lebar} cm` : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-400">Qty (Biji)</p>
                        <p className="font-bold text-gray-700 mt-0.5 text-xs">
                          {prodItem.jumlah || prodItem.qty || 1} Pcs
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-400">Panjang</p>
                        <p className="font-bold text-gray-700 mt-0.5 text-xs">
                          {prodItem.panjang ? `${prodItem.panjang} m` : '-'}
                        </p>
                      </div>
                      <div className="text-right sm:text-center">
                        <p className="font-medium text-gray-400">Subtotal</p>
                        <p className="font-black text-gray-800 mt-0.5 text-xs">
                          Rp {hitungSubtotalItem(prodItem).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* BARIS 3: ESTIMASI PRODUK JADI & STATUS PRODUKSI */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
            <div className="md:col-span-5 bg-[#5AE3ED1C] border border-[#1A335A]/10 rounded-xl p-4 text-[11px] space-y-2 flex flex-col justify-between shadow-sm">
              <div className="flex items-center gap-2 font-bold text-[#1A335A] text-xs">
                <Calendar size={13} /> Estimasi Produk Selesai
              </div>
              <div className="w-full bg-[#f2b600] text-white font-black text-center py-2 rounded-lg tracking-wider text-xs shadow-sm">
                {formatTanggalIndo(tanggalSelesaiRaw)}
              </div>
            </div>

            <div className="md:col-span-7 bg-[#5AE3ED1C] border border-[#1A335A]/10 rounded-xl p-4 text-[11px] space-y-2 flex flex-col justify-between shadow-sm">
              <div className="flex items-center gap-2 font-bold text-[#1A335A] text-xs">
                <Box size={13} /> Status Produksi Aktif
              </div>
              <div className={`w-full text-white font-black text-center py-2 rounded-lg text-xs tracking-wider uppercase shadow-sm ${
                item.status === 'selesai_diproses' ? 'bg-[#1DB793]' : item.status === 'dalam_proses' ? 'bg-[#1A335A]' : 'bg-[#A63636]'
              }`}>
                {item.status ? item.status.replace(/_/g, ' ').toUpperCase() : 'BELUM DIPROSES'}
              </div>
            </div>
          </div>

          {/* BARIS 4: RINCIAN BREAKDOWN TRANSAKSI & CATATAN */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
            {/* Catatan Khusus */}
            <div className="md:col-span-6 bg-[#5AE3ED1C] border border-[#1A335A]/10 rounded-xl p-4 text-[11px] space-y-1.5 shadow-sm">
              <p className="font-bold text-[#1A335A] text-xs flex items-center gap-1"><FileText size={13}/> Catatan Khusus Pesanan</p>
              <div className="w-full bg-white border border-gray-200 rounded-lg p-2.5 min-h-[68px] font-medium text-gray-600 leading-relaxed">
                {item.catatan || 'Tidak ada catatan khusus untuk kustomisasi pengerjaan lurik ini.'}
              </div>
            </div>

            {/* Rekap Finansial Rinci (Kanan) */}
            <div className="md:col-span-6 bg-gray-50 border border-gray-200 rounded-xl p-3 text-[11px] space-y-1.5 shadow-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal ({daftarProduk.length} Item)</span>
                <span className="font-semibold text-gray-700">Rp {hitungSubtotalKotor.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Potongan Diskon</span>
                <span className="font-semibold text-gray-700">{item.diskon || 0}%</span>
              </div>
              <hr className="border-gray-200" />
              <div className="flex justify-between font-bold text-gray-800">
                <span>Total Nilai Kontrak</span>
                <span>Rp {totalHargaAkhir.toLocaleString('id-ID')}</span>
              </div>
              
              {/* UI KONDISI BREAKDOWN: Hanya tampil jika status belum lunas (DP) */}
              {!isLunas && (
                <>
                  <div className="flex justify-between font-medium text-emerald-600">
                    <span>Dana yang Telah Diterima (DP/Cash)</span>
                    <span>Rp {totalDanaMasuk.toLocaleString('id-ID')}</span>
                  </div>
                  <hr className="border-gray-200 border-dashed" />
                  <div className={`flex justify-between p-1 rounded font-black ${sisaKekurangan > 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}>
                    <span>Sisa Kekurangan Pembayaran</span>
                    <span>Rp {sisaKekurangan.toLocaleString('id-ID')}</span>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>

        {/* FOOTER MODAL (TOMBOL AKSI) */}
        <div className="sticky bottom-0 z-10 flex justify-end px-6 py-3 border-t border-gray-100 bg-gray-50/50 no-print">
          <button 
            onClick={handleCetakStrukDirect} 
            disabled={isPrinting}
            className="bg-[#1A335A] hover:bg-[#11223d] text-white text-xs px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-60"
          >
            {isPrinting ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Mencetak Struk...</span>
              </>
            ) : (
              <>
                <Printer size={13} />
                <span>Cetak Struk</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}