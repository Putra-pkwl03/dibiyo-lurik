import React from 'react'

export default function LatestPreOrdersTable({ preOrders }) {
  // Helper untuk merapikan tampilan tanggal ISO menjadi format DD-MM-YYYY
  const formatTanggal = (isoString) => {
    if (!isoString) return '-'
    try {
      return new Date(isoString).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).replace(/\//g, '-')
    } catch (e) {
      return '-'
    }
  }

  return (
    <div className="w-full p-3 bg-white sm:p-5 rounded-2xl">
      <span className="inline-block pl-1 mb-4 text-base font-medium text-black sm:text-lg">
        Pre Order Terbaru
      </span>

      <div className="overflow-x-auto rounded-lg border border-[#F4EAE1]/20 bg-white shadow-sm w-full block">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-[#1A335A] text-white text-[12px] font-medium tracking-wide">
              <th className="p-3 text-center w-14">No</th>
              <th className="p-3">Id Pre-order</th>
              <th className="p-3">Nama Pelanggan</th>
              <th className="p-3 text-center">Jumlah Pre-Order</th>
              <th className="p-3 text-center">Jenis Pre-Order</th>
              <th className="p-3 text-center">Status Pembayaran</th>
              <th className="p-3 text-center">Tanggal Pemesanan</th>
              <th className="p-3 text-center">Status Produksi</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
            {(!preOrders || preOrders.length === 0) ? (
              <tr>
                <td colSpan="8" className="p-8 italic text-center text-gray-400">
                  Tidak ada data pre-order terbaru
                </td>
              </tr>
            ) : (
              preOrders.slice(0, 5).map((item, index) => {
                // Penyesuaian nama variabel dengan payload JSON dari API
                const idPreorder = item.id_preorder || '-'
                const namaPelanggan = item.nama_pelanggan || '-'
                const qty = item.qty ?? '-'
                const jenis = item.jenis || 'Reguler'
                const statusBayar = item.status_pembayaran || 'DP'
                const statusOrder = item.status_order || 'Belum diproses'

                return (
                  <tr key={index} className="transition-colors bg-white hover:bg-gray-50/50">
                    <td className="p-3 font-medium text-center text-gray-400">{index + 1}.</td>
                    
                    <td className="p-3 font-mono text-xs font-semibold text-gray-900 whitespace-nowrap">
                      {idPreorder}
                    </td>
                    <td className="p-3 font-medium text-gray-800 whitespace-nowrap">
                      {namaPelanggan}
                    </td>
                    <td className="p-3 font-bold text-center text-gray-800 whitespace-nowrap">
                      {qty}
                    </td>
                    <td className="p-3 text-center whitespace-nowrap">
                      <span className={`inline-block px-4 py-0.5 text-[11px] font-semibold text-white rounded-full min-w-[75px] ${
                        jenis.toLowerCase() === 'custom' ? 'bg-[#6f2b7f]' : 'bg-[#7685d1]'
                      }`}>
                        {jenis}
                      </span>
                    </td>
                    <td className="p-3 text-center whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-0.5 text-[11px] font-bold text-white rounded-xl min-w-[50px] ${
                        statusBayar.toLowerCase() === 'lunas' ? 'bg-emerald-600' : 'bg-amber-500'
                      }`}>
                        {statusBayar}
                      </span>
                    </td>
                    <td className="p-3 text-center text-gray-600 whitespace-nowrap">
                      {formatTanggal(item.tanggal_pemesanan)}
                    </td>
                    <td className="p-3 text-xs font-bold tracking-wide text-center whitespace-nowrap">
                      <span className={`inline-block px-3 py-1 rounded-full ${
                        statusOrder === 'Selesai' ? 'bg-blue-50 text-blue-600' :
                        statusOrder === 'Sedang Diproses' ? 'bg-emerald-50 text-emerald-600' :
                        statusOrder === 'Dalam Proses' ? 'bg-purple-50 text-purple-600' :
                        'bg-gray-50 text-gray-500'
                      }`}>
                        {statusOrder}
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}