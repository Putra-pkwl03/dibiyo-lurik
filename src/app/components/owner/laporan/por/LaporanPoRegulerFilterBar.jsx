'use client';

import React, { useRef } from 'react';
import { Calendar, FileText, Loader2 } from 'lucide-react';

export default function LaporanPoRegulerFilterBar({ 
  startDate, setStartDate, endDate, setEndDate, status, setStatus, pembayaran, setPembayaran, onExport, exportLoading 
}) {
  const startDateRef = useRef(null);
  const endDateRef = useRef(null);

  return (
    <div className="w-full pb-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Judul Sub-Section */}
        <div className="text-base font-medium tracking-wide text-gray-800">
          List PO Reguler
        </div>

        <div className="flex flex-wrap items-center justify-end flex-1 max-w-5xl gap-3">
          {/* Filter Status Produksi */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[#b2c7d9] bg-[#edf7fa]/40 focus:outline-none focus:border-[#1e355e] text-xs font-normal text-gray-700 cursor-pointer"
          >
            <option value="">Semua Status Produksi</option>
            <option value="dalam_proses">Dalam Proses</option>
            <option value="sedang_diproses">Sedang Diproses</option>
            <option value="selesai_diproses">Selesai Diproses</option>
          </select>

          {/* Filter Status Pembayaran */}
          <select
            value={pembayaran}
            onChange={(e) => setPembayaran(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[#b2c7d9] bg-[#edf7fa]/40 focus:outline-none focus:border-[#1e355e] text-xs font-normal text-gray-700 cursor-pointer"
          >
            <option value="">Semua Pembayaran</option>
            <option value="dp">DP (Uang Muka)</option>
            <option value="lunas">Lunas</option>
          </select>

          {/* Input Range Tanggal */}
          <div className="flex items-center gap-2 bg-[#edf7fa]/40 border border-[#b2c7d9] rounded-lg px-3 py-1.5">
            <div 
              className="flex items-center gap-1.5 cursor-pointer hover:bg-gray-200/50 p-1 rounded transition-colors"
              onClick={() => startDateRef.current?.showPicker()}
            >
              <Calendar className="text-gray-400 shrink-0" size={16} />
              <input
                ref={startDateRef}
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-xs font-normal bg-transparent cursor-pointer text-gray-700 focus:outline-none w-[105px] [color-scheme:light]"
              />
            </div>

            <span className="text-xs font-light text-gray-400 select-none">s/d</span>

            <div 
              className="flex items-center gap-1.5 cursor-pointer hover:bg-gray-200/50 p-1 rounded transition-colors"
              onClick={() => endDateRef.current?.showPicker()}
            >
              <Calendar className="text-gray-400 shrink-0" size={16} />
              <input
                ref={endDateRef}
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-xs font-normal bg-transparent cursor-pointer text-gray-700 focus:outline-none w-[105px] [color-scheme:light]"
              />
            </div>
          </div>

          {/* Button Export */}
          <button
            onClick={onExport}
            disabled={exportLoading}
            className="flex items-center gap-2 px-5 py-2 bg-[#1e355e] hover:bg-[#152644] text-white text-sm font-medium rounded-lg transition-colors shadow-sm disabled:bg-gray-400 shrink-0"
          >
            {exportLoading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <FileText size={16} className="stroke-[2.5]" />
            )}
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Trik Utama: Garis pemisah full width menembus p-6 menggunakan margin negatif */}
      <div className="mt-4 -mx-6 border-b border-gray-200"></div>
    </div>
  );
}