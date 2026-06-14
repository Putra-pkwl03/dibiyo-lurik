'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { CornerDownLeft, CreditCard, CalendarDays, Package, Calendar, ThumbsUp } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useOrderStore } from '../../../../../../store/useOrderStore';
import Swal from 'sweetalert2';

// Helper format ribuan untuk input nominal
const formatRibuan = (nilai) => {
  if (!nilai) return '';
  return Number(nilai).toLocaleString('id-ID');
};

function FormSkeleton() {
  return (
    <div className="w-full mx-auto text-black font-inter animate-pulse">
      <div className="w-1/4 h-8 mb-4 bg-gray-200 rounded"></div>
      <div className="h-64 bg-gray-200 rounded"></div>
    </div>
  );
}

const BACKDROP_STYLE = { backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)' };

export default function PembayaranPOR() {
  const router = useRouter();
  const { orderData, setOrderData } = useOrderStore();
  
  const [statusBayar, setStatusBayar] = useState(orderData.paymentData?.statusBayar || 'dp');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // State Awal mengadopsi logika backup data store bawaan POR asli (Metode disesuaikan huruf kecil)
  const [formData, setFormData] = useState({
    nominal: orderData.paymentData?.nominal || '',
    metode: orderData.paymentData?.metode || 'cash', 
    diskon: orderData.paymentData?.diskon || 0,
    tgl_selesai: orderData.paymentData?.tgl_selesai || '',
    // catatan: orderData.paymentData?.catatan || ''
  });

  useEffect(() => { setMounted(true); return () => setMounted(false); }, []);

  // LOGIKA ASLI POR: Sinkronisasi Store (Autosave data agar saat kembali ke halaman sebelumnya tidak hilang)
  useEffect(() => {
    if (orderData) {
      setOrderData({
        ...orderData,
        paymentData: { ...formData, statusBayar }
      });
    }
  }, [formData, statusBayar]);

  // Kalkulasi Harga Berdasarkan Item POR asli
  const daftarItems = orderData?.items || [];
  const subTotal = daftarItems.reduce((acc, item) => acc + (Number(item.totalHargaItem) || 0), 0);
  const total = subTotal - (subTotal * (Number(formData.diskon) / 100));

const handleSubmit = async () => {
    // 1. Validasi Data Dasar
    if (!orderData || !orderData.items || orderData.items.length === 0) {
      Swal.fire({ icon: 'error', title: 'Data Kosong', text: 'Detail item tidak ditemukan.', confirmButtonColor: '#EF4444' });
      return;
    }

    // 2. Validasi Form adaptasi dari POC
    if (!formData.tgl_selesai) {
      Swal.fire({ icon: 'warning', title: 'Validasi Gagal', text: 'Silakan tentukan tanggal estimasi produk.', confirmButtonColor: '#1A335A' });
      return;
    }

    if (statusBayar === 'dp') {
      const batasMinimalDP = total * 0.3;
      if (Number(formData.nominal) < batasMinimalDP) {
        Swal.fire({ icon: 'error', title: 'Nominal DP Kurang', text: `Minimal 30% (Rp ${Math.ceil(batasMinimalDP).toLocaleString('id-ID')}).`, confirmButtonColor: '#1A335A' });
        return;
      }
    }

    setLoading(true);

    // LOGIKA ASLI POR: Transformasi struktur item payload bersih sesuai kebutuhan API POR
    const itemsPayload = orderData.items.map(item => ({
      produk_id: item.id, 
      lebar: Number(item.lebar),
      panjang: Number(item.panjang),
      jumlah: Number(item.qty)
    }));

// LOGIKA ASLI POR & BE SENIOR: Susunan payload data untuk Pre-Order Reguler
    const payload = {
      nama_customer: orderData.customer?.nama || 'Pelanggan Biasa',
      kontak_customer: orderData.customer?.telpon || '',
      alamat_customer: orderData.customer?.alamat || '',
      tanggal_selesai: formData.tgl_selesai,
      metode_pembayaran: formData.metode, // Mengirim 'cash' atau 'transfer' (Huruf kecil, lolos constraint)
      
      // KEMBALIKAN KE SINI: Mengirim nilai 'dp' atau 'lunas' (Di bawah 10 karakter, lolos VARCHAR(10))
      status_pembayaran: statusBayar, 
      
      total_dp: Number(formData.nominal),
      diskon: Number(formData.diskon),
      // catatan: formData.catatan || '',
      items: itemsPayload 
    };

    try {
      const res = await fetch('/api/pre-order-reguler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const responseData = await res.json();
      if (!res.ok) throw new Error(responseData.error || 'Terjadi kendala saat menyimpan order');

      // Reset Store sesuai format data POR asli setelah sukses submit
      setOrderData({ customer: { nama: "", telpon: "", tgl: "", alamat: "" }, items: [], paymentData: null });
      setShowSuccess(true);
      
      // Redirect setelah 2 detik ke halaman list PO Reguler
      setTimeout(() => {
        router.push('/dashboard/cs/po/reguler');
      }, 2000);

    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Gagal Menyimpan', text: error.message, confirmButtonColor: '#EF4444' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <FormSkeleton />;

  return (
    <div className="w-full mx-auto text-black font-inter">
      <div className="border-b border-[#D4C5B9] pb-2 mb-4">
        <h1 className="text-2xl font-bold text-black">Pre-Order Reguler</h1>
      </div>

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
              onClick={() => router.push("/dashboard/cs/order/por")} 
              className="flex items-center gap-1.5 bg-[#1A335A] text-white text-sm px-4 py-1.5 rounded-full font-medium transition-all hover:bg-[#25477e]"
            >
              <CornerDownLeft size={14} strokeWidth={2.5} />
              <span>kembali</span>
            </button>
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-[11px] font-bold text-black">Status Pembayaran</label>
            <div className="flex gap-4">
              <button 
                type="button"
                onClick={() => {
                  setStatusBayar('dp');
                  const totalBaru = subTotal - (subTotal * (Number(formData.diskon) / 100));
                  setFormData(prev => ({ ...prev, nominal: String(Math.ceil(totalBaru * 0.3)) }));
                }} 
                className={`flex-1 h-[38px] font-bold rounded-md text-xs transition-all border ${statusBayar === 'dp' ? 'bg-[#1A335A] text-white border-[#1A335A]' : 'bg-[#5AE3ED1C] text-black border-[#1A335A]'}`}
              >
                DP
              </button>
              <button 
                type="button"
                onClick={() => {
                  setStatusBayar('lunas');
                  const totalBaru = subTotal - (subTotal * (Number(formData.diskon) / 100));
                  setFormData(prev => ({ ...prev, nominal: String(Math.round(totalBaru)) }));
                }} 
                className={`flex-1 h-[38px] font-bold rounded-md text-xs transition-all border ${statusBayar === 'lunas' ? 'bg-[#1A335A] text-white border-[#1A335A]' : 'bg-[#5AE3ED1C] text-black border-[#1A335A]'}`}
              >
                Lunas
              </button>
            </div>
          </div>

          {/* Kolom Nominal Dinamis */}
          <div className="flex flex-col space-y-1.5 dynamic-nominal-container">
            <label className={`text-[11px] font-bold transition-all ${
              statusBayar === 'dp'
                ? (Number(formData.nominal) >= Math.ceil(total * 0.3) ? 'text-black' : 'text-stone-400')
                : 'text-black'
            }`}>
              {statusBayar === 'dp' 
                ? `Nominal Pembayaran DP (Minimal 30%: Rp ${Math.ceil(total * 0.3).toLocaleString('id-ID')})` 
                : `Nominal Pembayaran Lunas (Rp ${Math.round(total).toLocaleString('id-ID')})`
              }
            </label>
            <div className="relative flex items-center">
              <span className="absolute text-xs font-bold select-none left-3 text-black/60">Rp</span>
              <input 
                type="text" 
                value={formatRibuan(formData.nominal)} 
                disabled={statusBayar === 'lunas'}
                placeholder={statusBayar === 'dp' ? "Masukkan nominal DP" : "Total Lunas otomatis"} 
                className={`w-full h-[36px] pl-9 pr-3 border border-[#1A335A] rounded-md text-black font-bold outline-none text-xs transition-all
                  ${statusBayar === 'lunas' 
                    ? 'bg-stone-200/80 text-stone-500 border-stone-300 cursor-not-allowed shadow-inner' 
                    : 'bg-[#5AE3ED1C]'}`} 
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/\D/g, '');
                  setFormData({...formData, nominal: rawValue});
                }}
              />
            </div>
          </div>

          <div className="grid items-start grid-cols-1 gap-4 pt-1 md:grid-cols-12">
            <div className="md:col-span-5 flex flex-col space-y-1.5">
              <label className="text-[11px] font-bold text-black">Metode Pembayaran</label>
              <select 
                value={formData.metode} 
                className="w-full h-[36px] px-2 bg-[#5AE3ED1C] border border-[#1A335A] rounded-md text-black font-bold outline-none text-xs cursor-pointer" 
                onChange={(e) => setFormData({...formData, metode: e.target.value})}
              >
                <option value="cash">Cash</option>
                <option value="transfer">Transfer</option>
              </select>
            </div>

            {/* Input Diskon */}
            <div className="md:col-span-3 flex flex-col space-y-1.5">
              <label className="text-[11px] font-bold text-black">Diskon (opsional)</label>
              <div className="relative flex items-center">
                <input 
                  type="text" 
                  inputMode="numeric" 
                  value={formData.diskon} 
                  className="w-full h-[36px] pl-3 pr-7 border border-[#1A335A] rounded-md text-black font-bold outline-none text-xs bg-[#5AE3ED1C]"
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/\D/g, '');
                    const diskonNum = rawValue === '' ? 0 : Number(rawValue);
                    
                    if (diskonNum <= 100) {
                      const totalBaru = subTotal - (subTotal * (diskonNum / 100));
                      setFormData(prev => ({ 
                        ...prev, 
                        diskon: diskonNum,
                        nominal: statusBayar === 'lunas' 
                          ? String(Math.round(totalBaru)) 
                          : String(Math.ceil(totalBaru * 0.3))
                      }));
                    }
                  }} 
                />
                <span className="absolute text-xs font-bold select-none right-3 text-black/60">%</span>
              </div>
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
              <div className="relative flex items-center w-full">
                <Calendar size={14} className="absolute left-3 text-[#1A335A] -translate-y-1/2 pointer-events-none z-10 top-1/2" />
                <DatePicker
                  selected={formData.tgl_selesai ? new Date(formData.tgl_selesai) : null}
                  onChange={(date) => setFormData({...formData, tgl_selesai: date?.toISOString().split('T')[0]})}
                  dateFormat="yyyy-MM-dd"
                  placeholderText="00/00/0000"
                  wrapperClassName="w-full"
                  className="w-full h-[36px] pl-9 pr-3 bg-[#FFE176] border border-[#1A335A] rounded-md text-[#1A335A] font-bold outline-none text-xs placeholder-[#1A335A]/40 pointer-events-auto cursor-pointer"
                />
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
              <input 
                type="text"
                value="Dalam Proses" 
                disabled
                className="w-full h-[36px] px-3 bg-[#A63636] border border-[#1A335A]/40 rounded-md text-white font-bold outline-none text-xs cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Isian Lembar Catatan */}
        {/* <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-black pl-1">Catatan</label>
          <textarea 
            value={formData.catatan} 
            placeholder="Tulis catatan..." 
            className="w-full h-24 p-3 text-xs font-medium text-black border rounded-md outline-none resize-none bg-[#FDFDFD] border-[#1A335A] placeholder-black/40" 
            onChange={(e) => setFormData({...formData, catatan: e.target.value})} 
          />
        </div> */}

        <button 
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full h-[46px] bg-[#F2B600] hover:bg-[#d9a301] disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-md font-bold text-sm transition-colors shadow-md flex items-center justify-center active:scale-[0.99]"
        >
          {loading ? 'Menyimpan Pre Order...' : 'Submit Pre Order Reguler'}
        </button>
      </div>

      {/* Success Modal Custom Portal */}
      {showSuccess && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={BACKDROP_STYLE}>
          <div className="bg-white rounded-[20px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] w-[372px] relative overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex flex-col items-center justify-center px-6 py-12">
              <ThumbsUp size={56} className="text-[#1A335A] mb-5" strokeWidth={1.5} />
              <p className="text-[#000000] text-[18px] font-bold text-center leading-snug">
                Pre Order Reguler Berhasil<br />diTambah
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}