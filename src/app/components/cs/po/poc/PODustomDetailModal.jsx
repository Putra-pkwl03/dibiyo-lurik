'use client'

import React, { useState } from 'react'
import { X, Printer, Loader2 } from 'lucide-react'
import Swal from 'sweetalert2'
import qz from 'qz-tray'

export default function PODustomDetailModal({ isOpen, onClose, item }) {
  const [isPrinting, setIsPrinting] = useState(false)

  if (!isOpen || !item) return null

  const daftarProduk = Array.isArray(item.item_pre_order_custom) && item.item_pre_order_custom.length > 0
    ? item.item_pre_order_custom
    : (item.detail_produk || item.items || []);

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

  // ==============================================================================
  // FUNGSI CETAK RAW ESC/POS VIA QZ TRAY (MULTI-ITEM SUPPORTED)
  // ==============================================================================
  const handleCetakStrukDirect = async () => {
    setIsPrinting(true)
    try {
      if (!qz.websocket.isActive()) {
        await qz.websocket.connect({ host: 'localhost', keepAlive: true })
      }

      const config = qz.configs.create("POS-80", {
        retries: 0,
        encoding: 'UTF-8'
      })

      const initPrinter = '\x1B\x40';
      const centerAlign = '\x1B\x61\x01';
      const leftAlign = '\x1B\x61\x00';
      const boldOn = '\x1B\x45\x01';
      const boldOff = '\x1B\x45\x00';
      const lineBreak = '\n';
      const cutPaper = '\x1D\x56\x41\x03';

      // 1. Bagian Atas Struk (Header & Customer)
      let printData = [
        initPrinter,
        centerAlign,
        boldOn,
        'TOKO DIBIYO LURIK\n',
        boldOff,
        'Jl. Krapyak Wetan No.rt 06 no 201, Krapyak Wetan, Panggungharjo, Kec. Sewon, Kabupaten Bantul, Daerah Istimewa Yogyakarta 55188\n',
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

      // 2. Loop Dinamis Data Produk ke dalam Struk (Disesuaikan Propertinya)
      daftarProduk.forEach((prod, index) => {
        const lebar = prod.lebar_kain || (prod.lebar ? `${prod.lebar} cm` : '-');
        const panjang = prod.panjang_kain || (prod.panjang ? `${prod.panjang} m` : '-');
        const jumlah = prod.jumlah_po || prod.jumlah || 1;
        const hargaItem = prod.subtotal || prod.harga || 0;

        printData.push(
          ` ${index + 1}. ${prod.kode_produksi || 'AKLBL-CUSTOM'} (${jumlah}x)\n`,
          `    L: ${lebar} . P: ${panjang}\n`,
          `    Subtotal : Rp ${hargaItem.toLocaleString('id-ID')}\n`
        );
      });

      // 3. Bagian Bawah Struk (Total & Pembayaran)
      printData.push(
        '------------------------------------------------\n',
        boldOn,
        'Detail Pembayaran\n',
        boldOff,
        `Total             : Rp ${item.total_harga?.toLocaleString('id-ID') || '0'}\n`,
        `Status            : ${item.status_pembayaran?.toUpperCase() || 'LUNAS'}\n`,
        '------------------------------------------------\n',
        boldOn,
        'Metode Pembayaran\n',
        boldOff,
        `${item.metode_pembayaran || 'Cash'}\n`,
        '------------------------------------------------\n',
        `Estimasi Produk Jadi : ${formatEstimasiJadi(item.tanggal_selesai || item.tanggal_po)}\n`,
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

      await qz.print(config, printData)

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
      console.error("[PRINTER-ERROR]", err)
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
      })
    } finally {
      setIsPrinting(false)
    }
  }
  // ==============================================================================

  const tanggalSelesaiRaw = item.tanggal_selesai || item.tanggal_po;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A335A7A] font-inter backdrop-blur-sm">
      <div className="w-full max-w-5xl overflow-hidden bg-white rounded-lg shadow-lg animate-in fade-in zoom-in-95">
        
        {/* HEADER MODAL */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-[#1A335A]">Pre-Order Custom</h3>
          <button onClick={onClose} className="text-gray-400 transition-colors hover:text-gray-600">
            <X size={18} strokeWidth={2.5} />
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
                  <p className="font-bold mt-0.5 text-[#1A335A]">
                    {item.created_at ? formatEstimasiJadi(item.created_at) : '01/05/2026'}
                  </p>
                </div>
              </div>

              <div>
                <p className="font-medium text-gray-400">Alamat</p>
                <p className="font-semibold mt-0.5 text-gray-700 leading-relaxed">
                  {item.alamat_customer || '-'}
                </p>
              </div>
            </div>

            {/* Box Detail Pembayaran */}
            <div className="md:col-span-5 bg-[#EBF5FA]/40 border border-[#1A335A]/20 rounded-lg p-4 text-[11px] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 font-bold text-[#1A335A] text-xs mb-3">
                  <span>💳</span> Detail Pembayaran
                </div>
                
                <div className="grid grid-cols-2 pt-2 pb-2 border-t border-b border-gray-200">
                  <div className="pr-3 border-r border-gray-200">
                    <p className="font-medium text-gray-400">Status Pembayaran</p>
                    <span className={`inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded-md text-white ${
                      item.status_pembayaran?.toLowerCase() === 'lunas' ? 'bg-[#1DB793]' : 'bg-[#F0A864]'
                    }`}>
                      {item.status_pembayaran?.toUpperCase() || 'LUNAS'}
                    </span>
                  </div>
                  <div className="pl-3">
                    <p className="font-medium text-gray-400">Metode Pembayaran</p>
                    <p className="mt-1 font-bold text-[#1A335A]">{item.metode_pembayaran || 'Cash'}</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-2">
                <p className="font-medium text-gray-400">Total Harga</p>
                <p className="text-sm font-bold text-[#1A335A] mt-0.5">
                  Rp. {item.total_harga?.toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          </div>

          {/* BARIS 2: Data Produk */}
          <div className="p-4 space-y-3 bg-white border border-gray-100 rounded-lg">
            <div className="flex items-center gap-2 font-bold text-[#1A335A] text-xs">
              <span>📦</span> Data Produk ({daftarProduk.length} Item)
            </div>
            
            {daftarProduk.length === 0 ? (
              <p className="py-4 text-center text-gray-400">Tidak ada item kustom di pesanan ini.</p>
            ) : (
              daftarProduk.map((prod, index) => {
                // Handle fallback data property kustom dari json backend
                const lebarKain = prod.lebar_kain || (prod.lebar ? `${prod.lebar} cm` : '-');
                const panjangKain = prod.panjang_kain || (prod.panjang ? `${prod.panjang} m` : '-');
                const jumlahPo = prod.jumlah_po || prod.jumlah || 1;
                const hargaSubtotal = prod.subtotal || prod.harga || 0;

                return (
                  <div key={index} className="bg-[#1A335A]/5 border border-gray-100 rounded-lg p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px] mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-gradient-to-br from-[#1A335A] to-[#2c4e82] rounded-lg shadow-inner shrink-0 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                        {prod.gambar_custom ? (
                          <img src={prod.gambar_custom} alt="Custom" className="object-cover w-full h-full" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-400">Kode Produksi</p>
                        <p className="font-bold text-gray-700">{prod.kode_produksi || 'AKLBL-CUSTOM'}</p>
                        <p className="mt-1 font-medium text-gray-400">Harga per Meter</p>
                        <p className="font-semibold text-gray-700">
                          {prod.harga_per_meter ? `Rp ${prod.harga_per_meter.toLocaleString('id-ID')}` : '-'}
                        </p>
                      </div>
                    </div>

                    <div className="grid w-full grid-cols-2 text-left sm:grid-cols-4 gap-x-6 gap-y-2 sm:w-auto sm:text-center">
                      <div>
                        <p className="font-medium text-gray-400">Lebar Kain</p>
                        <p className="border border-gray-200 bg-white rounded px-2 py-0.5 font-bold text-gray-700 mt-0.5 inline-block min-w-[70px]">
                          {lebarKain}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-400">Jumlah PO</p>
                        <p className="border border-gray-200 bg-white rounded px-2 py-0.5 font-bold text-gray-700 mt-0.5 inline-block min-w-[40px]">
                          {jumlahPo}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-400">Panjang Kain</p>
                        <p className="border border-gray-200 bg-white rounded px-2 py-0.5 font-bold text-gray-700 mt-0.5 inline-block min-w-[60px]">
                          {panjangKain}
                        </p>
                      </div>
                      <div className="sm:text-right">
                        <p className="font-medium text-gray-400">Subtotal</p>
                        <p className="border border-gray-200 bg-white rounded px-2 py-0.5 font-bold text-gray-700 mt-0.5 inline-block min-w-[90px] text-right">
                          Rp.{hargaSubtotal.toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* BARIS 3: Estimasi Produk Jadi & Status Produksi */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
            <div className="md:col-span-5 bg-[#1A335A]/5 border border-gray-100 rounded-lg p-4 text-[11px] space-y-2 flex flex-col justify-between">
              <div className="flex items-center gap-2 font-bold text-[#1A335A] text-xs">
                <span>🕒</span> Estimasi Produk Jadi
              </div>
              <div className="w-full bg-[#F2B600] text-white font-bold text-center py-1.5 rounded-lg tracking-wider text-xs shadow-xs">
                {formatEstimasiJadi(tanggalSelesaiRaw)}
              </div>
            </div>

            <div className="md:col-span-7 bg-[#1A335A]/5 border border-gray-100 rounded-lg p-4 text-[11px] space-y-2 flex flex-col justify-between">
              <div className="flex items-center gap-2 font-bold text-[#1A335A] text-xs">
                <span>⚙️</span> Status Produksi
              </div>
              <div className={`w-full text-white font-bold text-center py-1.5 rounded-lg text-xs tracking-wide ${
                item.status === 'selesai_diproses' ? 'bg-[#409643]' : item.status === 'dalam_proses' ? 'bg-[#F2B600]' : 'bg-[#A63636]'
              }`}>
                {item.status?.replace('_', ' ').toUpperCase() || 'BELUM DIPROSES'}
              </div>
            </div>
          </div>

          {/* BARIS 4: Catatan Khusus */}
          <div className="bg-[#1A335A]/5 border border-gray-100 rounded-lg p-4 text-[11px] space-y-1.5">
            <p className="font-bold text-[#1A335A] text-xs">Catatan</p>
            <div className="w-full bg-white border border-gray-200 rounded-lg p-2.5 min-h-[50px] font-medium text-gray-600">
              {item.catatan || 'Tidak ada catatan khusus untuk kustomisasi pesanan ini.'}
            </div>
          </div>

        </div>

        {/* FOOTER MODAL */}
        <div className="flex justify-end px-6 py-3 border-t border-gray-100 bg-gray-50/50">
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
  )
}