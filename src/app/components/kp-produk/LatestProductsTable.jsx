import React from 'react'

export default function LatestProductsTable({ products }) {
  return (
    <div className="w-full p-3 bg-white rounded-lg sm:p-5">
      <h3 className="inline-block pl-1 mb-4 text-base text-black font-reguler sm:text-lg">
        Produk Terlaris
      </h3>
      
      <div className="overflow-x-auto rounded-lg border border-[#DDB892]/20 bg-[#FDFDFD] shadow-sm w-full block">
        {/* Memastikan tidak ada baris baru berisi spasi kosong tersembunyi langsung di bawah tag table */}
        <table className="w-full text-left border-collapse min-w-[600px]"><thead>
            <tr className="bg-[#1A335A] text-white text-[12px] font-medium">
              <th className="p-3 text-center w-14">No</th>
              <th className="p-3">Kode Produk</th>
              <th className="p-3">Motif</th>
              <th className="p-3">Kategori</th>
              <th className="p-3 text-center">Lebar</th>
              <th className="p-3 text-center">Jumlah Terjual</th>
            </tr>
          </thead><tbody className="text-[12px] text-gray-700 divide-y divide-gray-100">
            {(!products || products.length === 0) ? (
              <tr>
                <td colSpan="6" className="p-4 italic text-center text-gray-400">
                  Tidak ada data produk terlaris
                </td>
              </tr>
            ) : (
              products.slice(0, 5).map((item, index) => (
                <tr key={index} className="transition-colors hover:bg-gray-50/50">
                  <td className="p-3 font-medium text-center text-gray-500">{index + 1}.</td>
                  <td className="p-3 font-mono text-xs font-semibold text-gray-600 whitespace-nowrap">
                    {item.kodeProduk || item.kode_produk || '-'}
                  </td>
                  <td className="p-3 text-[#8B5E3C] font-medium whitespace-nowrap">{item.motif || '-'}</td>
                  <td className="p-3 text-gray-600 whitespace-nowrap">{item.kategori || '-'}</td>
                  <td className="p-3 text-center whitespace-nowrap">
                    <span className={`inline-block px-5 py-1 text-xs font-semibold text-white rounded-full min-w-[75px] ${
                      String(item.lebar).includes('110') ? 'bg-[#4D90FF]' : 'bg-[#B533FF]'
                    }`}>
                      {item.lebar ? `${item.lebar} ` : '-'}
                    </span>
                  </td>
                  <td className="p-3 font-semibold text-center text-gray-700 whitespace-nowrap">
                    {item.jumlahTerjual || item.jumlah_terjual || 0}
                  </td>
                </tr>
              ))
            )}
          </tbody></table>
      </div>
    </div>
  )
}