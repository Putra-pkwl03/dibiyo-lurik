'use client';

import React, { useMemo, useState } from 'react';
import {  CornerDownLeft, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import qz from 'qz-tray';

export default function CheckoutSection({ items, onBack, onOrderSuccess }) {
  const [diskon, setDiskon] = useState(0);
  const [loading, setLoading] = useState(false);
  const [metodePembayaran, setMetodePembayaran] = useState('cash');
  const router = useRouter();

  const subTotal = useMemo(() => {
    return items.reduce((acc, item) => {
      const panjangDiorder = item.input_panjang || 0;
      const hargaKain = item.gulungan?.harga_per_meter || 0;
      return acc + (panjangDiorder * hargaKain);
    }, 0);
  }, [items]);

  const total = useMemo(() => {
    const discountAmount = subTotal * (diskon / 100);
    return subTotal - discountAmount;
  }, [subTotal, diskon]);

  // =====================================================================
  // FUNGSI UTAMA: ESC/POS DIRECT PRINT VIA QZ TRAY
  // =====================================================================
  const eksekusiCetakStruk = async (orderId) => {
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

      const tglSekarang = new Date().toLocaleDateString('id-ID', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });

      let printData = [
        initPrinter,
        centerAlign,
        boldOn,
        'TOKO DIBIYO LURIK\n',
        boldOff,
        'Jl. Krapyak Wetan No. 201, Sewon, Bantul, DIY\n',
        '------------------------------------------------\n',
        leftAlign,
        `ID Order : ${orderId || 'ORD-NEW'}\n`,
        `Tanggal  : ${tglSekarang}\n`,
        `Kasir    : CS Operational\n`,
        '------------------------------------------------\n',
        boldOn,
        'Item Belanja:\n',
        boldOff
      ];

      items.forEach((item, index) => {
        const kode = item.gulungan?.produk?.kode_produk || 'KODE-UNKNOWN';
        const noGulung = item.gulungan?.nomor_gulungan || '-';
        const panjang = item.input_panjang || 0;
        const hargaKain = item.gulungan?.harga_per_meter || 0;
        const subKain = panjang * hargaKain;

        printData.push(
          ` ${index + 1}. ${kode} (G-${noGulung})\n`,
          `    ${panjang} meter x Rp ${hargaKain.toLocaleString('id-ID')}\n`,
          `    Subtotal : Rp ${subKain.toLocaleString('id-ID')}\n`
        );
      });

      printData.push(
        '------------------------------------------------\n',
        `Subtotal Gross : Rp ${subTotal.toLocaleString('id-ID')}\n`,
        `Diskon         : ${diskon}%\n`,
        boldOn,
        `TOTAL NET      : Rp ${total.toLocaleString('id-ID')}\n`,
        boldOff,
        '------------------------------------------------\n',
        `Metode Bayar   : ${metodePembayaran.toUpperCase()}\n`,
        `Status         : LUNAS (Beli Langsung)\n`,
        '------------------------------------------------\n',
        '\n',
        centerAlign,
        boldOn,
        'Terima Kasih Atas Kunjungan Anda!\n',
        boldOff,
        lineBreak,
        lineBreak,
        lineBreak,
        cutPaper
      );

      await qz.print(config, printData);
      return true;
    } catch (printErr) {
      console.error("Gagal print struk via QZ Tray:", printErr);
      return false;
    }
  };

  const handleBuatPesanan = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metode_pembayaran: metodePembayaran,
          diskon: diskon,
          items: items.map(item => ({
            cart_id: item.id,
            gulungan_id: item.gulungan.id,
            jumlah_order: item.input_panjang
          }))
        }),
      });

      const apiResult = await response.json(); 
      if (!response.ok) throw new Error(apiResult.message);

      try {
        await fetch('/api/keranjang', {
          method: 'DELETE', 
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: items.map(item => item.id) })
        });
      } catch (clearErr) {
        console.error("Gagal otomatis mengosongkan database keranjang:", clearErr);
      }

      const resetBadgeEvent = new CustomEvent("updateCartCount", {
        detail: { count: -items.length } 
      });
      window.dispatchEvent(resetBadgeEvent);

      onOrderSuccess(); 
      router.refresh();

      Swal.fire({
        title: 'Pesanan Berhasil Dibuat',
        text: 'Apakah Anda ingin mencetak struk belanja sekarang?',
        icon: 'success',
        showCancelButton: true,
        confirmButtonText: 'Ya, Cetak Struk',
        cancelButtonText: 'Tidak',
        confirmButtonColor: '#1E3A8A', 
        cancelButtonColor: '#6B7280', 
        allowOutsideClick: false,
        showLoaderOnConfirm: true, 
        preConfirm: async () => {
          const cetakSukses = await eksekusiCetakStruk(apiResult?.data?.id);
          return { cetakSukses };
        }
      }).then((swalResult) => {
        if (swalResult.isConfirmed) {
          const statusCetak = swalResult.value?.cetakSukses;
          
          Swal.fire({
            title: statusCetak ? 'Cetak Berhasil' : 'Gagal Mencetak',
            text: statusCetak 
              ? 'Struk belanja berhasil dikeluarkan oleh printer.' 
              : 'Gagal mengirim data ke printer. Pastikan hardware & aplikasi QZ Tray Anda aktif.',
            icon: statusCetak ? 'success' : 'error',
            confirmButtonColor: '#1E3A8A' 
          }).then(() => {
            router.push('/dashboard/cs/rp/order');
          });
        } else {
          router.push('/dashboard/cs/rp/order');
        }
      });

    } catch (err) {
      Swal.fire({
        title: 'Gagal Memproses Pesanan',
        text: err.message,
        icon: 'error',
        confirmButtonColor: '#1E3A8A'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto space-y-6">
      <h1 className="pb-4 mb-6 text-2xl font-bold text-gray-800 border-b border-blue-100">Keranjang</h1>
      <div className="p-6 bg-white border border-blue-100 rounded-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Check-out</h2>
          <button 
            onClick={onBack} 
            disabled={loading}
            className="flex items-center gap-2 px-4 py-1 text-white transition-colors rounded-full bg-[#1A335A] hover:bg-[#264880] disabled:opacity-50"
          >
            <CornerDownLeft size={16} /> Kembali
          </button>
        </div>

        {/* Data Produk */}
        <div className="mb-6 space-y-4">
          <h3 className="flex items-center gap-2 font-semibold text-gray-700">📦 Detail Kain Diorder</h3>
          {items.map((item) => {
            const hargaKain = item.gulungan?.harga_per_meter || 0;
            const meteran = item.input_panjang || 0;
            return (
              <div key={item.id} className="flex items-center gap-6 p-4 bg-[#5AE3ED]/5  border rounded-lg shadow-sm border-gray-100">
                <img src={item.gulungan?.produk?.gambar_url || '/placeholder-kain.jpg'} className="object-cover w-20 h-20 border rounded border-slate-100" alt="produk" />
                <div className="grid items-center flex-1 grid-cols-5 gap-2 text-sm">
                  <div>
                    <p className="text-[10px] text-gray-700 uppercase">Kode Produk</p>
                    <p className="font-bold text-blue-900">{item.gulungan?.produk?.kode_produk}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-700 uppercase">No Gulungan</p>
                    <p className="font-semibold text-gray-700">G-{item.gulungan?.nomor_gulungan}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-700 uppercase">Lebar</p>
                    <p className="font-medium text-gray-700">{item.gulungan?.lebar} cm</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-700 uppercase">Panjang Potong</p>
                    <p className="font-bold text-blue-600">{meteran} meter</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-700 uppercase">Subtotal Kain</p>
                    <p className="font-bold text-gray-800">Rp{(meteran * hargaKain).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail Pembayaran */}
        <div className="p-6 bg-[#5AE3ED]/5  border rounded-lg shadow-sm border-blue-50">
          <h3 className="mb-4 font-semibold text-gray-700">💳 Detail Pembayaran</h3>
          <div className="grid items-center grid-cols-3 gap-6">
            <label className="flex flex-col text-xs font-semibold text-gray-500">
              Metode Pembayaran
              <select 
                value={metodePembayaran}
                disabled={loading}
                onChange={(e) => setMetodePembayaran(e.target.value)}
                className="p-3 mt-1 font-medium text-gray-800 border rounded-lg bg-gray-50 focus:outline-none focus:border-blue-500 disabled:opacity-60"
              >
                <option value="cash">Cash (Tunai)</option>
                <option value="transfer">Transfer Bank</option>
              </select>
            </label>
            <label className="flex flex-col text-xs font-semibold text-gray-500">
              Diskon (%)
              <input 
                type="number" 
                min="0"
                max="100"
                disabled={loading}
                value={diskon}
                onChange={(e) => setDiskon(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                className="p-3 mt-1 font-bold text-gray-800 border rounded-lg bg-gray-50 focus:outline-none focus:border-blue-500 disabled:opacity-60" 
              />
            </label>
            
            <div className="p-4 rounded-xl bg-sky-50/50 border border-sky-100 text-gray-700 space-y-1.5">
              <div className="flex justify-between text-xs font-medium"><span>Subtotal Gross</span><span>Rp{subTotal.toLocaleString()}</span></div>
              <div className="flex justify-between text-xs font-medium text-red-500"><span>Diskon ({diskon}%)</span><span>-Rp{(subTotal * (diskon/100)).toLocaleString()}</span></div>
              <div className="flex justify-between pt-2 text-base font-bold text-blue-900 border-t border-sky-200/60"><span>Total Net</span><span>Rp{total.toLocaleString()}</span></div>
            </div>
          </div>
        </div>

        {/* Button Utama */}
        <button 
          onClick={handleBuatPesanan}
          disabled={loading}
          className="flex items-center justify-center w-full gap-2 py-4 mt-6 text-lg font-bold text-white transition-colors bg-[#1A335A] rounded-lg shadow-md hover:bg-[#274a83] disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} /> Memproses Stok...
            </>
          ) : (
            'Konfirmasi & Bayar Pesanan'
          )}
        </button>
      </div>
    </div>
  );
}