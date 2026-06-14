'use client';

import React from 'react';

export default function LaporanPoTable({ data = [], loading }) {
  // Helper badge status produksi
  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'SELESAI_DIPROSES':
      case 'SELESAI':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'SEDANG_DIPROSES':
      case 'DIPROSES':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'DIAMBIL':
      case 'DALAM_PROSES':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'PENDING':
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  // Helper badge status pembayaran
  const getPaymentBadge = (pembayaran) => {
    switch (pembayaran?.toUpperCase()) {
      case 'LUNAS':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'DP':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'BELUM_BAYAR':
      default:
        return 'bg-rose-50 text-rose-700 border-rose-200';
    }
  };

  // Format ke IDR Rupiah
  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(number) + ',00';
  };

  return (
    /* Trik Utama: -mx-6 membuat area tabel memanjang penuh dari ujung ke ujung kotak putih */
    <div className="w-auto mt-4 -mx-6 overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            {/* Header diubah menjadi biru gelap Navy solid */}
            <tr className="bg-[#1e355e] text-white text-[13px] font-medium tracking-wide">
              <th className="py-3.5 text-center w-14 pl-6">No.</th>
              <th className="py-3.5 px-4">Tanggal Buat</th>
              <th className="py-3.5 px-4">ID POC</th>
              <th className="py-3.5 px-4">Nama Customer</th>
              <th className="py-3.5 px-4 text-center">Status Produksi</th>
              <th className="py-3.5 px-4 text-center">Status Bayar</th>
              <th className="py-3.5 text-right pr-6">Total Harga</th>
            </tr>
          </thead>
          <tbody className="text-[13px] divide-y divide-gray-100 text-gray-700">
            {loading ? (
              // Skeleton Loading
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 pl-6"><div className="w-6 h-4 mx-auto bg-gray-200 rounded"></div></td>
                  <td className="px-4 py-4"><div className="w-24 h-4 bg-gray-200 rounded"></div></td>
                  <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-28"></div></td>
                  <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-36"></div></td>
                  <td className="px-4 py-4"><div className="w-20 h-6 mx-auto bg-gray-200 rounded-full"></div></td>
                  <td className="px-4 py-4"><div className="w-20 h-6 mx-auto bg-gray-200 rounded-full"></div></td>
                  <td className="py-4 pr-6"><div className="w-24 h-4 ml-auto bg-gray-200 rounded"></div></td>
                </tr>
              ))
            ) : data.length === 0 ? (
              // Tampilan Data Kosong
              <tr>
                <td colSpan="7" className="py-12 pl-6 pr-6 font-normal text-center text-gray-400">
                  Tidak ada data Pre-Order Custom pada periode atau filter ini.
                </td>
              </tr>
            ) : (
              // Tampilan Data Asli
              data.map((row, index) => {
                const formattedDate = new Date(row.created_at).toLocaleDateString('id-ID', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                }).replace(/\//g, '-');

                return (
                  <tr key={row.id || index} className="transition-colors bg-white hover:bg-gray-50/50">
                    <td className="py-4 pl-6 text-center text-gray-800">
                      {index + 1}.
                    </td>
                    <td className="px-4 py-4 text-gray-600">
                      {formattedDate}
                    </td>
                    <td className="px-4 py-4 font-mono text-sm font-semibold text-gray-900">
                      {row.id}
                    </td>
                    <td className="px-4 py-4 text-gray-800">
                      {row.nama_customer}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 text-[11px] font-semibold border rounded-full ${getStatusBadge(row.status)}`}>
                        {row.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 text-[11px] font-semibold border rounded-full ${getPaymentBadge(row.status_pembayaran)}`}>
                        {row.status_pembayaran?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 pr-6 font-bold text-right text-gray-900">
                      {formatRupiah(row.total_harga || 0)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}