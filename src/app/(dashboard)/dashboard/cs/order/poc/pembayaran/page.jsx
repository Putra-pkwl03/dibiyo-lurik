'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CornerDownLeft, CreditCard, CalendarDays, Package, Calendar } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useOrderStore } from '../../../../../../store/useOrderStore';
import Swal from 'sweetalert2';

export default function PembayaranPO() {
  const router = useRouter();
  const { orderData, setOrderData } = useOrderStore();
  const [statusBayar, setStatusBayar] = useState(orderData.paymentData?.statusBayar || 'dp');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    nominal: orderData.paymentData?.nominal || '',
    metode: orderData.paymentData?.metode || 'Cash',
    diskon: orderData.paymentData?.diskon || 0,
    tgl_selesai: orderData.paymentData?.tgl_selesai || '',
    catatan: orderData.paymentData?.catatan || ''
  });

  const subTotal = orderData.items.reduce((acc, item) => acc + (Number(item.totalHargaItem || 0)), 0);
  const total = subTotal - (subTotal * (Number(formData.diskon) / 100));

  // Menangani perubahan default nilai nominal saat status bayar berpindah
  useEffect(() => {
    if (statusBayar === 'lunas') {
      setFormData(prev => ({ ...prev, nominal: total.toString() }));
    } else if (statusBayar === 'dp') {
      // Default awal diset ke 50%, tapi diskon tidak di-nol-kan paksa lagi agar tetap hidup
      const dp50 = total * 0.5;
      setFormData(prev => ({ ...prev, nominal: dp50.toString() }));
    }
  }, [statusBayar, total]);

  const handleSubmit = async () => {
    if (!formData.tgl_selesai) {
      Swal.fire({
        icon: 'warning',
        title: 'Validasi Gagal',
        text: 'Silakan tentukan tanggal estimasi produk jadi terlebih dahulu.',
        confirmButtonColor: '#A47352'
      });
      return;
    }

    // VALIDASI BARU: Cek nominal DP minimal 30% dari total belanja bersih
    if (statusBayar === 'dp') {
      const batasMinimalDP = total * 0.3;
      if (Number(formData.nominal) < batasMinimalDP) {
        Swal.fire({
          icon: 'error',
          title: 'Nominal DP Kurang',
          text: `Nominal DP tidak boleh kurang dari 30% total harga (Minimal Rp ${Math.ceil(batasMinimalDP).toLocaleString('id-ID')}).`,
          confirmButtonColor: '#A47352'
        });
        return;
      }
    }

    setLoading(true);

    const payload = {
      nama_customer: orderData.customer?.nama || 'Pelanggan Biasa',
      kontak_customer: orderData.customer?.telpon || '',
      alamat_customer: orderData.customer?.alamat || '',
      total_harga: total,
      status_pembayaran: statusBayar,
      status: 'dalam_proses',
      catatan: formData.catatan,
      tanggal_selesai: formData.tgl_selesai, 
      metode_pembayaran: formData.metode,
      nominal_bayar: Number(formData.nominal),
      diskon: Number(formData.diskon),
      items: orderData.items 
    };

    try {
      const res = await fetch('/api/pre-order-custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const responseData = await res.json();

      if (!res.ok) throw new Error(responseData.error || 'Terjadi kendala saat menyimpan order');

      await Swal.fire({
        icon: 'success',
        title: 'Transaksi Berhasil',
        text: 'Data Pre-Order berhasil disimpan ke sistem.',
        confirmButtonColor: '#10B981'
      });

      router.push('/dashboard/cs/po/custom'); 

    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan',
        text: error.message,
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto text-black font-inter">
      {/* Judul Utama Atas Halaman */}
      <div className="border-b border-[#D4C5B9] pb-2 mb-4">
        <h1 className="text-2xl font-bold text-black">Pre-Order Custom</h1>
      </div>

      {/* Main Container Card */}
      <div className="bg-[#5AE3ED1C] rounded-md p-6 space-y-6 shadow-sm">
        
        {/* Kontainer Utama 1: Detail Pembayaran */}
        <div className="bg-[#FDFDFD] border border-[#1A335A]/20 rounded-md p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-black select-none">
              <CreditCard size={18} strokeWidth={2.5} />
              <h2>Detail Pembayaran</h2>
            </div>
            <button 
              type="button"
              onClick={() => router.back()} 
              className="flex items-center gap-1.5 bg-[#1A335A] text-white text-sm px-4 py-1.5 rounded-full font-medium transition-all hover:bg-[#25477e]"
            >
              <CornerDownLeft size={14} strokeWidth={2.5} />
              <span>kembali</span>
            </button>
          </div>

          {/* Baris Pilihan Status Pembayaran */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-[11px] font-bold text-black">Setatus Pembayaran</label>
            <div className="flex gap-4">
              <button 
                type="button"
                onClick={() => setStatusBayar('dp')} 
                className={`flex-1 h-[38px] font-bold rounded-md text-xs transition-all border ${statusBayar === 'dp' ? 'bg-[#1A335A] text-white border-[#1A335A]' : 'bg-[#5AE3ED1C] text-black border-[#1A335A]'}`}
              >
                DP
              </button>
              <button 
                type="button"
                onClick={() => setStatusBayar('lunas')} 
                className={`flex-1 h-[38px] font-bold rounded-md text-xs transition-all border ${statusBayar === 'lunas' ? 'bg-[#1A335A] text-white border-[#1A335A]' : 'bg-[#5AE3ED1C] text-black border-[#1A335A]'}`}
              >
                Lunas
              </button>
            </div>
          </div>

          {/* PERUBAHAN: Input Nominal Bisa Diketik Manual secara Bebas */}
          {statusBayar === 'dp' && (
            <div className="flex flex-col space-y-1.5 animate-fade-in">
              <label className="text-[11px] font-bold text-black">Nominal Pembayaran DP (Minimal 30%)</label>
              <input 
                type="number" 
                value={formData.nominal} 
                placeholder="Masukkan nominal DP" 
                className="w-full h-[36px] px-3 border border-[#1A335A] rounded-md text-black font-bold outline-none text-xs bg-[#5AE3ED1C]" 
                disabled={false} 
                onChange={(e) => setFormData({...formData, nominal: e.target.value})}
              />
            </div>
          )}

          {/* Baris Tiga Kolom Horizontal Sejajar */}
          <div className="grid items-start grid-cols-1 gap-4 pt-1 md:grid-cols-12">
            <div className="md:col-span-5 flex flex-col space-y-1.5">
              <label className="text-[11px] font-bold text-black">Metode Pembayaran</label>
              <select 
                value={formData.metode} 
                className="w-full h-[36px] px-2 bg-[#5AE3ED1C] border border-[#1A335A] rounded-md text-black font-bold outline-none text-xs cursor-pointer" 
                onChange={(e) => setFormData({...formData, metode: e.target.value})}
              >
                <option value="Cash">Cash</option>
                <option value="Transfer">Transfer</option>
              </select>
            </div>

            {/* PERUBAHAN: Input Diskon Sekarang Selalu Aktif Terbuka di Kedua Mode Status */}
            <div className="md:col-span-3 flex flex-col space-y-1.5">
              <label className="text-[11px] font-bold text-black">Diskon (opsional)</label>
              <input 
                type="number" 
                value={formData.diskon} 
                placeholder="10%" 
                className="w-full h-[36px] px-3 border border-[#1A335A] rounded-md text-black font-bold outline-none text-xs bg-[#5AE3ED1C]"
                onChange={(e) => setFormData({...formData, diskon: e.target.value})} 
              />
            </div>
            
            <div className="md:col-span-4 flex flex-col space-y-1.5 w-full">
              <label className="text-[11px] font-bold text-black">Total Harga</label>
              <div className="bg-[#5AE3ED1C] border border-[#1A335A]/30 p-3 rounded-md text-black text-[11px] font-bold flex flex-col gap-1.5 shadow-inner">
                <div className="flex justify-between"><span>Sub Total</span> <span>Rp.{subTotal.toLocaleString('id-ID')},00</span></div>
                <div className="flex justify-between"><span>Diskon</span> <span>{formData.diskon}%</span></div>
                <div className="flex justify-between font-black text-xs border-t border-[#1A335A]/30 pt-1.5 mt-0.5">
                  <span>Total</span> <span>Rp.{total.toLocaleString('id-ID')},00</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grid Estimasi Selesai & Status Produksi */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="bg-[#FDFDFD] border border-[#1A335A]/20 rounded-md p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-black select-none">
              <CalendarDays size={18} strokeWidth={2.5} /> 
              <h3>Estimasi Produk Jadi</h3>
            </div>
            <div className="flex flex-col space-y-1.5 bg-[#5AE3ED1C] border border-[#5AE3ED1C] p-3 rounded-md">
              <label className="text-[10px] font-bold text-black">Tanggal Estimasi Selesai</label>
              <div className="relative w-full">
                <DatePicker
                  selected={formData.tgl_selesai ? new Date(formData.tgl_selesai) : null}
                  onChange={(date) => setFormData({...formData, tgl_selesai: date?.toISOString().split('T')[0]})}
                  dateFormat="yyyy-MM-dd"
                  placeholderText="00/00/0000"
                  wrapperClassName="w-full"
                  className="w-full h-[36px] px-3 bg-[#FFE176] border border-[#1A335A] rounded-md text-black font-bold outline-none text-xs placeholder-black/40 cursor-pointer"
                />
                <Calendar size={14} className="absolute text-black -translate-y-1/2 pointer-events-none right-3 top-1/2" />
              </div>
            </div>
          </div>

          <div className="bg-[#FDFDFD] border border-[#1A335A]/20 rounded-md p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-black select-none">
              <Package size={18} strokeWidth={2.5} /> 
              <h3>Status Produksi</h3>
            </div>
            <div className="flex flex-col space-y-1.5 bg-[#5AE3ED1C] border border-[#5AE3ED1C] p-3 rounded-md">
              <label className="text-[10px] font-bold text-black">Status Produksi</label>
              <select 
                value="dalam_proses" 
                disabled
                className="w-full h-[36px] px-3 bg-[#A63636] border border-[#1A335A]/40 rounded-md text-white font-bold outline-none text-xs cursor-not-allowed"
              >
                <option value="dalam_proses">Dalam Proses</option>
              </select>
            </div>
          </div>
        </div>

        {/* Isian Lembar Catatan Tambahan */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-black pl-1">Catatan</label>
          <textarea 
            value={formData.catatan} 
            placeholder="Tulis catatan..." 
            className="w-full h-24 p-3 text-xs font-medium text-black border rounded-md outline-none resize-none bg-[#FDFDFD] border-[#1A335A] placeholder-black/40" 
            onChange={(e) => setFormData({...formData, catatan: e.target.value})} 
          />
        </div>

        <button 
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full h-[46px] bg-[#F2B600] hover:bg-[#d9a301] disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-md font-bold text-sm transition-colors shadow-md flex items-center justify-center active:scale-[0.99]"
        >
          {loading ? 'Menyimpan Pre Order...' : 'Submit Pre Order Custom'}
        </button>

      </div>

      <style jsx global>{`
        .react-datepicker-wrapper { width: 100%; }
        .react-datepicker { border: 1px solid #A47352 !important; background: #F5EBE1 !important; font-family: inherit; }
        .react-datepicker__header { background: #E3C2AC !important; border-bottom: 1px solid #A47352 !important; }
        .react-datepicker__day--selected { background: #FFE176 !important; color: white !important; }
        .react-datepicker__current-month, .react-datepicker__day-name, .react-datepicker__day { color: #A47352 !important; font-weight: 600; }
        .react-datepicker__input-container input { color: #A47352 !important; font-weight: bold; }
        .react-datepicker__input-container input::placeholder { color: rgba(164, 115, 82, 0.4) !important; }
      `}</style>
    </div>
  );
}