'use client';

import React from 'react';
import { Search, Calendar, FileText, Loader2 } from 'lucide-react';

export default function LaporanFilterBar({
  search,
  setSearch,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onExport,
  exportLoading,
}) {
  return (
    <div className="w-full pb-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Label Judul Section */}
        <div className="text-base font-medium tracking-wide text-gray-800">
          List Order
        </div>

        {/* Kontainer Filter (Kanan) */}
        <div className="flex flex-wrap items-center flex-1 max-w-4xl gap-3 sm:justify-end">
          
          {/* Input Search Motif/Kategori */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2" size={18} />
            <input
              type="text"
              placeholder="Motif/Kategori"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-[#b2c7d9] bg-[#edf7fa]/40 focus:outline-none focus:border-[#1e355e] text-sm text-gray-700 placeholder-gray-400/80 font-normal"
            />
          </div>

          {/* Input Pilih Tanggal */}
          <div className="flex items-center gap-2 bg-[#edf7fa]/40 border border-[#b2c7d9] rounded-lg px-3 py-2 min-w-[240px]">
            <Calendar className="text-gray-400" size={16} />
            <span className="mr-1 text-xs font-normal text-gray-400">Pilih Tanggal:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-xs font-normal text-gray-700 bg-transparent cursor-pointer focus:outline-none"
            />
            <span className="text-xs font-light text-gray-400">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-xs font-normal text-gray-700 bg-transparent cursor-pointer focus:outline-none"
            />
          </div>

          {/* Button Export */}
          <button
            onClick={onExport}
            disabled={exportLoading}
            className="flex items-center gap-2 px-5 py-2 bg-[#1e355e] hover:bg-[#152644] text-white text-sm font-medium rounded-lg transition-colors shadow-sm disabled:bg-gray-400"
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

      <div className="mt-4 -mx-6 border-b border-gray-200"></div>
    </div>
  );
}