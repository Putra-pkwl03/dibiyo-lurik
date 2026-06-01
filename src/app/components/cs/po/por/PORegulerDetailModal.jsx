'use client'

import React, { useState } from 'react'
import { X, Printer, Loader2 } from 'lucide-react'
import Swal from 'sweetalert2'
import qz from 'qz-tray'

export default function PORegulerDetailModal({ isOpen, onClose, item }) {
  const [isPrinting, setIsPrinting] = useState(false)

  if (!isOpen || !item) return null

  // Helper formatting tanggal lokal (DD/MM/YYYY)
  const formatTanggalLokal = (dateString) => {
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

  const getStatusProduksiLabel = (status) => {
    const map = {
      'belum_diproses': { text: 'Belum diproses', cls: 'bg-[#A63636]' },
      'sedang_diproses': { text: 'Sedang diproses', cls: 'bg-[#E0A21B]' },
      'dalam_proses': { text: 'Sedang diproses', cls: 'bg-[#E0A21B]' },
      'selesai_diproses': { text: 'Selesai diproses', cls: 'bg-[#409643]' }
    }
    return map[status] || { text: status ? status.replace('_', ' ').toUpperCase() : '-', cls: 'bg-gray-500' }
  }

  const statusProd = getStatusProduksiLabel(item.status)
  const daftarProduk = Array.isArray(item.items) ? item.items : []

  // ==============================================================================
  // FUNGSI CETAK RAW ESC/POS VIA QZ TRAY (PRE-ORDER REGULER)
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

      // 1. Header & Data Utama Pesanan
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
        `Tanggal PO Reguler : ${formatTanggalLokal(item.created_at)}\n`,
        `Status Produksi    : ${statusProd.text}\n`,
        '------------------------------------------------\n',
        boldOn,
        'Customer\n',
        boldOff,
        `Nama              : ${item.nama_customer || '-'}\n`,
        `Telp              : ${item.kontak_customer || '-'}\n`,
        '------------------------------------------------\n',
        boldOn,
        'Daftar Produk (Reguler)\n',
        boldOff
      ];

      // 2. Looping Dinamis Komponen Barang di Keranjang PO
      daftarProduk.forEach((prod, index) => {
        const kode = prod.produk?.kode_produk || 'AKLBL-003';
        const lebar = prod.lebar || 70;
        const panjang = prod.panjang || 0;
        const qty = prod.jumlah || 1;
        const subtotal = prod.subtotal || 0;

        printData.push(
          ` ${index + 1}. ${kode} (${qty}x)\n`,
          `    Lebar: ${lebar}cm . Panjang: ${panjang}m\n`,
          `    Subtotal : Rp ${Number(subtotal).toLocaleString('id-ID')}\n`
        );
      });

      // 3. Footer Pembayaran & Perhitungan Biaya
      printData.push(
        '------------------------------------------------\n',
        boldOn,
        'Detail Pembayaran\n',
        boldOff,
        `Nominal DP        : Rp ${item.total_dp?.toLocaleString('id-ID') || '0'}\n`,
        `Diskon            : ${item.diskon ? `${item.diskon}%` : '0%'}\n`,
        `Total Akhir       : Rp ${item.total_harga?.toLocaleString('id-ID') || '0'}\n`,
        `Status            : ${item.status_pembayaran?.toUpperCase() || 'DP'}\n`,
        `Metode            : ${item.metode_pembayaran || 'Cash'}\n`,
        '------------------------------------------------\n',
        `Estimasi Produk Jadi : ${formatTanggalLokal(item.tanggal_selesai)}\n`,
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
        text: 'Struk Pre-Order Reguler berhasil dikirim ke printer POS-80.',
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A335A7A] font-inter backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-[#1A335A]">Pre-Order Reguler</h3>
          <button 
            onClick={onClose} 
            className="p-1 text-gray-400 transition-colors rounded-lg hover:text-black bg-gray-50"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto text-[11px] text-black custom-scrollbar">

          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            
            <div className="md:col-span-3 bg-[#FFECA7]/40 border border-[#FFEBAA] rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-1.5 font-bold text-sm text-amber-900 pb-1.5">
                <span className="text-xs">👤</span> Data Customer
              </div>
              
              <div className="grid grid-cols-3 pt-2 pb-2 border-t border-b border-amber-900/30">
                <div className="pr-3 border-r border-amber-900/30">
                  <p className="text-gray-400 text-[10px]">Nama Customer</p>
                  <p className="font-bold mt-0.5 break-words text-gray-800">{item.nama_customer || '-'}</p>
                </div>
                
                <div className="px-3 border-r border-amber-900/30">
                  <p className="text-gray-400 text-[10px]">No Telpon</p>
                  <p className="font-bold mt-0.5 text-gray-800">{item.kontak_customer || '-'}</p>
                </div>
                
                <div className="pl-3">
                  <p className="text-gray-400 text-[10px]">Tanggal Pre-Order</p>
                  <p className="font-bold mt-0.5 text-gray-800">
                    {formatTanggalLokal(item.created_at)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-gray-400 text-[10px]">Alamat</p>
                <p className="font-medium mt-0.5 leading-relaxed text-gray-700">{item.alamat_customer || '-'}</p>
              </div>
            </div>
            
            <div className="md:col-span-2 bg-[#FFECA7]/40 border border-[#FFEBAA] rounded-lg p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 font-bold text-sm text-amber-900 pb-1.5 mb-3">
                  <span>💳</span> Detail Pembayaran
                </div>
                
                <div className="grid grid-cols-3 pt-2 pb-2 mb-3 border-t border-b border-amber-900/30">
                  <div className="pr-3 border-r border-amber-900/30">
                    <p className="text-gray-400 text-[10px]">Status Bayar</p>
                    <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-md mt-1 text-white ${
                      item.status_pembayaran?.toLowerCase() === 'lunas' ? 'bg-[#1DB793]' : 'bg-[#F0A864]'
                    }`}>
                      {item.status_pembayaran?.toUpperCase() || 'DP'}
                    </span>
                  </div>
                  
                  <div className="px-3 border-r border-amber-900/30">
                    <p className="text-gray-400 text-[10px]">Nominal DP</p>
                    <p className="mt-1 font-bold text-gray-800">Rp.{item.total_dp?.toLocaleString('id-ID') || '0'}</p>
                  </div>
                  
                  <div className="pl-3">
                    <p className="text-gray-400 text-[10px]">Metode</p>
                    <p className="mt-1 font-bold text-gray-800">{item.metode_pembayaran || 'Cash'}</p>
                  </div>
                </div>
              </div>

              {/* Grid Diskon & Total Harga */}
              <div className="grid grid-cols-2">
                <div className="pr-3 border-r border-amber-900/30">
                  <p className="text-gray-400 text-[10px]">Diskon</p>
                  <p className="font-bold mt-0.5 text-gray-800">{item.diskon ? `${item.diskon}%` : '0%'}</p>
                </div>
                <div className="pl-3">
                  <p className="text-gray-400 text-[10px]">Total Harga</p>
                  <p className="font-bold text-amber-950 mt-0.5 text-xs">Rp.{item.total_harga?.toLocaleString('id-ID')}</p>
                </div>
              </div>
            </div>

          </div>

          {/* Bagian Tengah: Data Produk */}
          <div className="p-4 space-y-3 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center gap-1.5 font-bold text-gray-700 border-b border-gray-100 pb-2">
              <span>📦</span> Data Produk ({daftarProduk.length} Item)
            </div>

            {/* List Loop Item Pre Order */}
            <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1 custom-scrollbar">
              {daftarProduk.length > 0 ? (
                daftarProduk.map((prod, idx) => (
                  <div key={idx} className="flex flex-col justify-between gap-4 p-3 rounded-lg sm:flex-row sm:items-center bg-[#5AE3ED]/5 border border-gray-100">
                    
                    {/* Info Thumbnail Gambar & Detail Kode Produk */}
                    <div className="flex items-center gap-3 min-w-[200px]">
                      <div className="relative flex items-center justify-center w-12 h-12 overflow-hidden bg-gray-100 border border-gray-200 rounded-md shrink-0">
                        {prod.produk?.gambar_url ? (
                          <img 
                            src={prod.produk.gambar_url} 
                            alt={prod.produk.kode_produk || 'Produk'} 
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <span className="text-[9px] font-bold text-gray-400">No Image</span>
                        )}
                      </div>
                      <div>
                        <p className="text-gray-400 text-[9px]">Kode Produksi</p>
                        <p className="font-bold text-gray-800">{prod.produk?.kode_produk || 'AKLBL-003'}</p>
                        <p className="text-gray-500 text-[10px]">Kategori: Reguler</p>
                      </div>
                    </div>

                    {/* Atribut Detail Lebar, Jumlah, Panjang, Harga */}
                    <div className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-4">
                      <div>
                        <p className="text-gray-400 text-[9px]">Lebar Kain</p>
                        <div className="px-3 py-1 mt-1 font-bold text-center text-gray-700 bg-white border border-gray-200 rounded">
                          Lebar {prod.lebar || 70} cm
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-400 text-[9px]">Jumlah PO</p>
                        <div className="px-3 py-1 mt-1 font-bold text-center text-gray-700 bg-white border border-gray-200 rounded">
                          {prod.jumlah || 1}
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-400 text-[9px]">Panjang Kain</p>
                        <div className="px-3 py-1 mt-1 font-bold text-center text-gray-700 bg-white border border-gray-200 rounded">
                          {prod.panjang || 0} m
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-400 text-[9px]">Harga</p>
                        <div className="mt-1 px-2 py-1 bg-[#5AE3ED1C] border border-gray-200 rounded text-center font-bold text-gray-700">
                          Rp.{Number(prod.subtotal || 0).toLocaleString('id-ID')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-4 text-center text-gray-400">Tidak ada item detail produk.</p>
              )}
            </div>
          </div>

          {/* Baris Bawah: Estimasi Jadi & Status Produksi */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            <div className="p-4 bg-[#5AE3ED]/5 border border-gray-100 rounded-lg md:col-span-2">
              <p className="font-bold text-gray-700 border-b border-gray-100 pb-1.5 mb-2">🕒 Estimasi Produk Jadi</p>
              <div className="bg-[#F2B600] text-white font-bold text-center py-2 rounded-md tracking-wider">
                {formatTanggalLokal(item.tanggal_selesai)}
              </div>
            </div>

            <div className="p-4 bg-[#5AE3ED]/5 border border-gray-100 rounded-lg md:col-span-3">
              <p className="font-bold text-gray-700 border-b border-gray-100 pb-1.5 mb-2">⚙️ Status Produksi</p>
              <div className={`${statusProd.cls} text-white font-bold text-center py-2 rounded-md`}>
                {statusProd.text}
              </div>
            </div>
          </div>

        </div>

        {/* Footer Cetak Struk */}
        <div className="flex justify-end px-6 py-3 border-t border-gray-100 rounded-b-lg bg-gray-50">
          <button 
            onClick={handleCetakStrukDirect}
            disabled={isPrinting}
            className="flex items-center gap-2 bg-[#1A335A] hover:bg-[#11223d] text-white font-bold px-4 py-2.5 rounded-md text-[11px] shadow transition-all disabled:opacity-60"
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