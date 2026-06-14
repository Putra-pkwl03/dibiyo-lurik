'use client';

import React from 'react';

export default function LaporanTable({ data = [], loading }) {
  // Format ke IDR Rupiah konsisten dengan tabel lainnya
  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(number) + ',00';
  };

  return (
    /* Trik Utama: -mx-6 mt-4 untuk meloloskan layout tabel penuh ke ujung kontainer putih */
    <div className="w-auto mt-4 -mx-6 overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            {/* Menggunakan warna biru gelap navy solid (#1e355e) dengan padding tepi pl-6 & pr-6 */}
            <tr className="bg-[#1e355e] text-white text-[13px] font-medium tracking-wide">
              <th className="py-3.5 text-center w-14 pl-6">No.</th>
              <th className="py-3.5 px-4">Tanggal</th>
              <th className="py-3.5 px-4">Id Pesanan</th>
              <th className="py-3.5 px-4">Motif</th>
              <th className="py-3.5 px-4">Kategori</th>
              <th className="py-3.5 px-4 text-center">Jumlah Order</th>
              <th className="py-3.5 px-4 text-center">Lebar</th>
              <th className="py-3.5 px-4 text-center">Panjang</th>
              <th className="py-3.5 text-right pr-6">Total Harga</th>
            </tr>
          </thead>
          <tbody className="text-[13px] divide-y divide-gray-100 text-gray-700">
            {loading ? (
              // Skeleton Loading State yang diselaraskan padding ujungnya
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 pl-6"><div className="w-6 h-4 mx-auto bg-gray-200 rounded"></div></td>
                  <td className="px-4 py-4"><div className="w-20 h-4 bg-gray-200 rounded"></div></td>
                  <td className="px-4 py-4"><div className="w-24 h-4 bg-gray-200 rounded"></div></td>
                  <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-28"></div></td>
                  <td className="px-4 py-4"><div className="w-24 h-4 bg-gray-200 rounded"></div></td>
                  <td className="px-4 py-4"><div className="w-12 h-4 mx-auto bg-gray-200 rounded"></div></td>
                  <td className="px-4 py-4"><div className="w-16 h-6 mx-auto bg-gray-200 rounded-full"></div></td>
                  <td className="px-4 py-4"><div className="w-16 h-4 mx-auto bg-gray-200 rounded"></div></td>
                  <td className="py-4 pr-6"><div className="w-24 h-4 ml-auto bg-gray-200 rounded"></div></td>
                </tr>
              ))
            ) : data.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={9} className="py-12 pl-6 pr-6 font-normal text-center text-gray-400">
                  Tidak ada data order pada periode ini.
                </td>
              </tr>
            ) : (
              // Data State
              data.map((row, index) => (
                <tr key={row.id_pesanan || index} className="transition-colors bg-white hover:bg-gray-50/50">
                  <td className="py-4 pl-6 text-center text-gray-800">{index + 1}.</td>
                  <td className="px-4 py-4 text-gray-600">
                    {row.tanggal ? new Date(row.tanggal).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    }).replace(/\//g, '-') : '-'}
                  </td>
                  <td className="px-4 py-4 font-mono font-semibold text-gray-900">{row.id_pesanan}</td>
                  <td className="px-4 py-4 font-bold text-gray-900">{row.motif}</td>
                  <td className="px-4 py-4 text-gray-800">{row.kategori}</td>
                  <td className="px-4 py-4 font-bold text-center text-gray-900">{row.jumlah_order}</td>
                  <td className="px-4 py-4 text-center">
                    <span
                      className={`inline-block px-3 py-0.5 rounded-full text-[11px] font-semibold text-white ${
                        row.lebar === 110 ? 'bg-[#7685d1]' : 'bg-[#6f2b7f]'
                      }`}
                    >
                      {row.lebar} cm
                    </span>
                  </td>
                  <td className="px-4 py-4 font-medium text-center text-gray-800">
                    {row.panjang} Meter
                  </td>
                  <td className="py-4 pr-6 font-bold text-right text-gray-900">
                    {formatRupiah(row.total_harga || 0)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}