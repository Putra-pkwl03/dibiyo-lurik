'use client';

// Impor icon Pencil untuk tombol Edit
import { Pencil, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import POTableSkeleton from './POTableSkeleton';

export default function POTable({ data, loading, setSelectedItem, onDeleteSuccess, tipe }) {
  
  const getStatusProduksiClass = (status) => {
    const map = {
      'belum_diproses': 'bg-[#A63636]',
      'sedang_diproses': 'bg-[#E0A21B]',
      'dalam_proses': 'bg-[#E0A21B]',
      'selesai_diproses': 'bg-[#409643]'
    };
    return `${map[status] || 'bg-gray-500'} text-white text-[10px] px-2.5 py-1 rounded-full font-bold tracking-wide inline-block`;
  };

  const getStatusPembayaranClass = (status) => {
    return status?.toLowerCase() === 'lunas'
      ? 'bg-[#1DB793] text-white'
      : 'bg-[#F0A864] text-white';
  };

  return (
    <div className="w-full overflow-x-auto bg-white border-t border-[#E0D3C9] rounded-b-lg overflow-hidden">
      <table className="w-full text-left border-collapse min-w-[900px]">
        <thead>
          <tr className="bg-[#1A335A] text-white text-xs font-bold">
            <th className="px-3 py-3 font-bold rounded-l-md">No.</th>
            <th className="px-3 py-3 font-bold">Id Pre-Order</th>
            <th className="px-4 py-3 font-bold">Nama Pelanggan</th>
            <th className="px-3 py-3 font-bold">Jumlah Pre-Order</th>
            <th className="px-3 py-3 font-bold">Status Produksi</th>
            <th className="px-3 py-3 font-bold">Status Pembayaran</th>
            <th className="px-4 py-3 font-bold">Total Harga</th>
            <th className="px-4 py-3 font-bold text-center rounded-r-md">Aksi</th>
          </tr>
        </thead>
        <tbody className="text-[11px] text-black font-medium">
          {loading ? (
            <POTableSkeleton />
          ) : (
            data.map((item, index) => (
              <tr key={item.id} className="transition-colors border-b border-gray-100 hover:bg-gray-50/80">
                <td className="px-3 py-3.5 text-black font-bold">{index + 1}.</td>
                <td className="py-3.5 px-3 text-[#1A335A] font-bold">
                  {item.id ? item.id.slice(0, 8).toUpperCase() : 'UNKNOWN'}
                </td>
                <td className="px-4 py-3.5 font-medium text-left">{item.nama_customer}</td>
                <td className="px-3 py-3.5 font-bold">
                  {(() => {
                    if (item.items && item.items.length > 0) {
                      return item.items.reduce((sum, i) => sum + (Number(i.jumlah) || 0), 0);
                    }
                    if (item.item_pre_order_custom && item.item_pre_order_custom.length > 0) {
                      return item.item_pre_order_custom.reduce((sum, i) => sum + (Number(i.jumlah) || 0), 0);
                    }
                    return item.jumlah_item || item.jumlah_pre_order || 0;
                  })()} item
                </td>
                <td className="px-3 py-3.5">
                  <span className={getStatusProduksiClass(item.status)}>
                    {item.status ? item.status.replace('_', ' ').toUpperCase() : '-'}
                  </span>
                </td>
                <td className="px-3 py-3.5">
                  <span className={`${getStatusPembayaranClass(item.status_pembayaran)} text-[10px] px-2.5 py-0.5 rounded-md font-bold tracking-wide shadow-sm`}>
                    {item.status_pembayaran ? item.status_pembayaran.toUpperCase() : '-'}
                  </span>
                </td>
                <td className="px-4 py-3.5 font-bold text-gray-700">
                  Rp. {item.total_harga ? item.total_harga.toLocaleString('id-ID') : '0'}
                </td>
                <td className="px-4 py-2 text-center">
                  <div className="flex items-center justify-center">
                    {/* BUTTON ACTION: VERTICAL LAYOUT & BIRU TUA */}
                    <button 
                      type="button"
                      onClick={() => setSelectedItem(item)}
                      className="flex flex-col items-center justify-center bg-[#1A335A] hover:bg-[#122442] text-white w-12 h-12 rounded-lg shadow-sm transition-colors font-bold tracking-wide cursor-pointer"
                      title="Edit Detail / Ubah Status"
                    >
                      {/* Icon di atas */}
                      <Pencil size={13} strokeWidth={2.5} className="mb-0.5" />
                      {/* Teks di bawah */}
                      <span className="text-[9px] uppercase tracking-wider">Edit</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      
      {!loading && data.length === 0 && (
        <p className="p-8 font-medium text-center text-gray-400">Data Pre-Order tidak ditemukan.</p>
      )}
    </div>
  );
}