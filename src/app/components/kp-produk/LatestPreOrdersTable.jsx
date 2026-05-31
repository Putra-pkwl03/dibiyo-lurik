import React from 'react'

export default function LatestPreOrdersTable({ preOrders }) {
  return (
    <div className="w-full p-3 bg-white sm:p-5 rounded-2xl">
      <span className="inline-block pl-1 mb-4 text-base font-semibold text-black sm:text-lg">
        Pre Order Terbaru
      </span>

      <div className="overflow-x-auto rounded-lg border border-[#F4EAE1]/20 bg-[#F4EAE1] shadow-sm w-full block">
        <table className="w-full text-left border-collapse min-w-[900px]"><thead>
            <tr className="bg-[#1A335A] text-white text-[12px] font-medium">
              <th className="p-3 text-center w-14">No</th>
              <th className="p-3">Id Pre-order</th>
              <th className="p-3">Nama Pelanggan</th>
              <th className="p-3 text-center">Jumlah Pre-Order</th>
              <th className="p-3 text-center">Jenis Pre-Order</th>
              <th className="p-3 text-center">Status Pembayaran</th>
              <th className="p-3 text-center">Tanggal Pemesanan</th>
              <th className="p-3 text-center">Estimasi Selesai</th>
              <th className="p-3 text-center">Status Produksi</th>
            </tr>
          </thead><tbody className="text-sm text-gray-700 divide-y divide-[gray-100]">
            {(!preOrders || preOrders.length === 0) ? (
              <tr>
                <td colSpan="9" className="p-4 italic text-center text-gray-400">
                  Tidak ada data pre-order terbaru
                </td>
              </tr>
            ) : (
              preOrders.slice(0, 5).map((item, index) => {
                const jenis = item.jenisPreOrder || item.jenis_preorder || 'Reguler'
                const statusBayar = item.statusPembayaran || item.status_pembayaran || 'DP'
                const statusProd = item.statusProduksi || item.status_produksi || 'Belum diproses'

                return (
                  <tr key={index} className="transition-colors hover:bg-gray-50/50">
                    <td className="p-3 font-medium text-center text-gray-500">{index + 1}.</td>
                    
                    {/* Menggunakan whitespace-nowrap agar teks panjang/badge tidak patah ke bawah */}
                    <td className="p-3 font-mono text-xs font-semibold text-gray-600 whitespace-nowrap">
                      {item.idPreOrder || item.id_preorder || '-'}
                    </td>
                    <td className="p-3 font-medium text-gray-700 whitespace-nowrap">{item.namaPelanggan || '-'}</td>
                    <td className="p-3 font-semibold text-center text-gray-700 whitespace-nowrap">
                      {item.jumlahPreOrder || item.jumlah_preorder || 0}
                    </td>
                    <td className="p-3 text-center whitespace-nowrap">
                      <span className={`inline-block px-5 py-1 text-xs font-semibold text-white rounded-full min-w-[80px] ${
                        jenis.toLowerCase() === 'custom' ? 'bg-[#4D90FF]' : 'bg-[#B533FF]'
                      }`}>
                        {jenis}
                      </span>
                    </td>
                    <td className="p-3 text-center whitespace-nowrap">
                      <span className={`inline-block px-3 py-0.5 text-xs font-bold text-white rounded-md min-w-[50px] ${
                        statusBayar.toLowerCase() === 'lunas' ? 'bg-[#C68B59]' : 'bg-[#FFAA00]'
                      }`}>
                        {statusBayar}
                      </span>
                    </td>
                    <td className="p-3 text-center text-gray-600 whitespace-nowrap">
                      {item.tanggalPemesanan || item.tanggal_pemesanan || '-'}
                    </td>
                    <td className="p-3 text-center text-gray-600 whitespace-nowrap">
                      {item.estimasiSelesai || item.estimasi_selesai || '-'}
                    </td>
                    <td className="p-3 text-xs font-bold tracking-wide text-center whitespace-nowrap">
                      <span className={
                        statusProd.toLowerCase() === 'belum diproses' ? 'text-red-500' :
                        statusProd.toLowerCase() === 'sedang diproses' ? 'text-emerald-500' :
                        'text-blue-400'
                      }>
                        {statusProd}
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody></table>
      </div>
    </div>
  )
}