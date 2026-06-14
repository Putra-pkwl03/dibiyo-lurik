'use client';

import React, { useEffect } from 'react'; // Tambah useEffect di sini
import { User, Calendar } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

export default function CustomerForm({ customer, setCustomer }) {

  // --- AUTO SET TANGGAL HARI INI JIKA MASIH KOSONG ---
  useEffect(() => {
    if (!customer?.tgl) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      
      setCustomer(prev => ({ ...prev, tgl: `${yyyy}-${mm}-${dd}` }));
    }
  }, [customer?.tgl, setCustomer]);

  return (
    <div className="bg-[#5AE3ED1C] border border-[#1A335A] rounded-lg p-6 shadow-sm font-inter space-y-5">

      {/* CSS Global untuk DatePicker */}
      <style jsx global>{`
        .react-datepicker-wrapper { width: 100%; }
        .react-datepicker {
          border: 1px solid #1A335A !important;
          background-color: #DBFDFF !important;
          font-family: inherit;
        }
        .react-datepicker__header {
          background-color: #00000069 !important;
          border-bottom: 1px solid #1A335A !important;
        }
        .react-datepicker__day--selected { background-color: #FFD454B5 !important; }
        .react-datepicker__current-month, 
        .react-datepicker__day-name,
        .react-datepicker__day { color: #000 !important; }
      `}</style>

      {/* Judul Sub-bab */}
      <div className="flex items-center gap-2 text-sm font-semibold text-black select-none">
        <User size={18} strokeWidth={2.5} className="opacity-90" />
        <h2 className="text-black">Data Customer</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 text-xs md:grid-cols-3">

        {/* Nama Customer */}
        <div className="space-y-1.5">
          <label className="text-[11px] text-black font-bold tracking-wide">Nama Customer</label>
          <input
            type="text"
            name="nama-customer-poc"
            autoComplete="off"
            data-lpignore="true"
            placeholder="Masukkan Nama"
            value={customer.nama || ''}
            className="w-full h-[38px] px-3 bg-[#F1E9E987] border border-black rounded-[10px] text-black placeholder-black/60 outline-none focus:border-black transition-colors"
            onChange={(e) => setCustomer({ ...customer, nama: e.target.value })}
          />
        </div>

        {/* No Telpon */}
        <div className="space-y-1.5">
          <label className="text-[11px] text-black font-bold tracking-wide">No Telpon</label>
          <input
            type="text"
            name="telpon-customer-poc"
            autoComplete="off"
            data-lpignore="true"
            placeholder="Masukkan No Telpon"
            value={customer.telpon || ''}
            className="w-full h-[38px] px-3 bg-[#F1E9E987] border border-black rounded-[10px] text-black placeholder-black/60 outline-none focus:border-black transition-colors"
            onChange={(e) => setCustomer({ ...customer, telpon: e.target.value })}
          />
        </div>

        {/* Tanggal PO dengan Ikon */}
        <div className="space-y-1.5">
          <label className="text-[11px] text-black font-bold tracking-wide">Tanggal PO</label>
          <div className="relative w-full">
            <DatePicker
              selected={customer.tgl ? new Date(customer.tgl) : null}
              onChange={(date) => {
                if (date) {
                  // Gunakan komponen tanggal lokal (hindari pergeseran UTC/timezone)
                  const yyyy = date.getFullYear();
                  const mm = String(date.getMonth() + 1).padStart(2, '0');
                  const dd = String(date.getDate()).padStart(2, '0');
                  setCustomer({ ...customer, tgl: `${yyyy}-${mm}-${dd}` });
                } else {
                  setCustomer({ ...customer, tgl: "" });
                }
              }}
              dateFormat="yyyy-MM-dd"
              placeholderText="Pilih Tanggal"
              wrapperClassName="w-full"
              className="w-full h-[38px] px-3 bg-[#F1E9E987] border border-black rounded-[10px] text-black font-bold outline-none focus:border-black transition-colors cursor-pointer placeholder-black/60"
            />
            <Calendar
              size={14}
              className="absolute text-black -translate-y-1/2 pointer-events-none right-3 top-1/2"
            />
          </div>
        </div>

        {/* Alamat */}
        <div className="col-span-1 md:col-span-3 space-y-1.5">
          <label className="text-[11px] text-black font-bold tracking-wide">Alamat</label>
          <textarea
            placeholder="Alamat lengkap..."
            value={customer.alamat || ''}
            className="w-full h-[60px] p-3 bg-[#F1E9E987] border border-black rounded-[10px] text-black placeholder-black/60 outline-none focus:border-black transition-colors resize-none"
            onChange={(e) => setCustomer({ ...customer, alamat: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}