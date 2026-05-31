import { EyeIcon, Trash2 } from 'lucide-react';
import POTableSkeleton from './POTableSkeleton';

export default function POTable({ data, loading, setSelectedItem }) {
  
  // Helper warna untuk Status Produksi
  const getStatusColor = (status) => {
    switch(status) {
      case 'belum_diproses': return 'bg-gray-400';
      case 'dalam_proses': return 'bg-amber-500';
      case 'sedang_diproses': return 'bg-blue-400';
      case 'selesai_diproses': return 'bg-green-500';
      default: return 'bg-gray-400';
    }
  };

  // Helper warna untuk Status Pembayaran (Dibuat dinamis agar lebih informatif)
  const getPaymentStatusColor = (statusPembayaran) => {
    switch(statusPembayaran?.toLowerCase()) {
      case 'belum_bayar': return 'bg-red-500';
      case 'dp': return 'bg-orange-400';
      case 'lunas': return 'bg-green-600';
      default: return 'bg-[#8B5E3C]';
    }
  };

  return (
    /* 
      Menambahkan 'rounded-b-lg' dan 'overflow-hidden' di sini untuk memotong sudut bawah 
      tabel secara presisi mengikuti border container utama 'ManagePOContent'.
    */
    <div className="w-full overflow-x-auto bg-white border-t border-[#E0D3C9] rounded-b-lg overflow-hidden">
      <table className="w-full text-left border-collapse min-w-[900px]">
        <thead>
          <tr className="bg-[#A47352] text-white">
            <th className="w-16 p-4">No.</th>
            <th className="p-4">Id Pre-Order</th>
            <th className="p-4">Nama Pelanggan</th>
            <th className="p-4">Jumlah Pre-Order</th>
            <th className="p-4">Status Produksi</th>
            <th className="p-4">Status Pembayaran</th>
            <th className="p-4">Total Harga</th>
            <th className="w-40 p-4 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E0D3C9]">
          {loading ? (
            <POTableSkeleton />
          ) : (
            data.map((item, index) => (
              <tr key={item.id} className="hover:bg-[#f9f5f2] transition-colors">
                <td className="p-4 text-[#A47352]">{index + 1}.</td>
                <td className="p-4 text-[#A47352] font-mono text-sm">
                  ID {item.id ? item.id.slice(0, 8).toUpperCase() : 'UNKNOWN'}
                </td>
                <td className="p-4 text-[#A47352] font-medium">{item.nama_customer}</td>
                <td className="p-4 text-[#A47352]">{item.jumlah_item || 0} item</td>
                
                {/* Badge Status Produksi */}
                <td className="p-4 text-[#A47352]">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(item.status)}`}>
                    {item.status ? item.status.replace(/_/g, ' ').charAt(0).toUpperCase() + item.status.replace(/_/g, ' ').slice(1) : '-'}
                  </span>
                </td>
                
                {/* Badge Status Pembayaran */}
                <td className="p-4 text-[#A47352]">
                  <span className={`px-3 py-1 text-xs font-semibold text-white rounded-md ${getPaymentStatusColor(item.status_pembayaran)}`}>
                    {item.status_pembayaran ? item.status_pembayaran.toUpperCase() : '-'}
                  </span>
                </td>
                
                <td className="p-4 text-[#A47352]">
                  Rp. {item.total_harga ? item.total_harga.toLocaleString('id-ID') : '0'}
                </td>
                <td className="p-4">
                  <div className="flex justify-center gap-3">
                    <button 
                      type="button"
                      onClick={() => setSelectedItem(item)}
                      className="flex flex-col items-center px-3 py-2 text-xs text-[#0b5df5] bg-[#c7ddfe] rounded-lg hover:bg-blue-100 transition-all duration-200"
                    >
                      <EyeIcon size={18} />
                      <span className="mt-0.5">Detail</span>
                    </button>

                    <button 
                      type="button"
                      className="flex flex-col items-center px-3 py-2 text-xs text-[#EF4444] bg-[#FEE2E2] rounded-lg hover:bg-red-100 transition-all duration-200"
                    >
                      <Trash2 size={18} />
                      <span className="mt-0.5">Hapus</span>
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