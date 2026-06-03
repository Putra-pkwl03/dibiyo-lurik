'use client'

import { useState } from 'react'
import { Eye, Edit, Trash2, CheckCircle2 } from 'lucide-react'
import Swal from 'sweetalert2'
import PORegulerDetailModal from './PORegulerDetailModal' 

export default function PORegulerTable({ data, onConfirmReceipt, onEdit, onDelete }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  if (!data || data.length === 0) {
    return <p className="py-8 text-xs font-medium text-center text-gray-400">Data tidak tersedia.</p>;
  }

  const handleOpenDetail = (item) => {
    setSelectedItem(item)
    setIsModalOpen(true)
  }

  const handleCloseDetail = () => {
    setSelectedItem(null)
    setIsModalOpen(false)
  }

  const getStatusProduksiClass = (status) => {
    const map = {
      'dalam_proses': 'bg-[#A63636]',
      'sedang_diproses': 'bg-[#E0A21B]',
      'selesai_diproses': 'bg-[#409643]'
    };
    return `${map[status] || 'bg-gray-400'} text-white text-[10px] px-3 py-1 rounded-full font-bold inline-block`;
  };

  const getStatusPembayaranClass = (status) => {
    return status?.toLowerCase() === 'lunas'
      ? 'bg-[#1DB793] text-white'
      : 'bg-[#F0A864] text-white';
  };

const handleConfirmReceipt = (item) => {
    if (item.status_pembayaran?.toLowerCase() !== 'lunas') {
      return Swal.fire({
        title: 'Gagal Memproses',
        text: 'Pesanan tidak dapat diambil karena pembayaran belum lunas. Silakan lakukan pelunasan via menu Edit terlebih dahulu.',
        icon: 'warning',
        confirmButtonColor: '#1A335A'
      });
    }

    Swal.fire({
      title: 'Konfirmasi Pengambilan',
      text: `Apakah Anda yakin barang untuk customer "${item.nama_customer}" sudah diambil?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#1A335A',
      cancelButtonColor: '#A63636',
      confirmButtonText: 'Ya, Sudah Diambil',
      cancelButtonText: 'Batal',
      fontFamily: 'Inter',
      showLoaderOnConfirm: true, 
      allowOutsideClick: () => !Swal.isLoading(),
      preConfirm: async () => {
        try {
          const res = await fetch(`/api/pre-order-reguler`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              id: item.id, 
              status_pengambilan: 'sudah_diambil' 
            })
          });

          const json = await res.json();
          if (!res.ok) {
            throw new Error(json.error || json.message || 'Gagal memperbarui status.');
          }

          return true; 
        } catch (error) {
          Swal.showValidationMessage(`Error: ${error.message}`);
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        // --- PROSES UPDATE INSTAN DI FRONTEND ---
        // Kita paksa ubah status item saat ini agar UI langsung mengunci tombol tombol aksi
        item.status_pengambilan = 'sudah_diambil';
        
        // (Opsional) Jika di database/backend Anda menggunakan field 'status_penerimaan'
        item.status_penerimaan = 'sudah_diambil'; 

        Swal.fire({
          title: 'Berhasil!',
          text: 'Status penerimaan barang berhasil diperbarui.',
          icon: 'success',
          confirmButtonColor: '#1A335A'
        });
        
        // Memicu callback fungsi parent untuk memperbarui state utama jika diperlukan
        if (onConfirmReceipt) onConfirmReceipt(item.id);
      }
    });
  };

  return (
    <>
      <table className="w-full text-center border-collapse font-inter">
        <thead>
          <tr className="bg-[#1A335A] text-white text-[11px] font-bold">
            <th className="px-3 py-3 font-semibold rounded-l-md">No.</th>
            <th className="px-3 py-3 font-semibold">Id Pre-Order</th>
            <th className="px-4 py-3 font-semibold">Nama Pelanggan</th>
            <th className="px-3 py-3 font-semibold">Jumlah Pre-Order</th>
            <th className="px-3 py-3 font-semibold">Status Produksi</th>
            <th className="px-3 py-3 font-semibold">Status Pembayaran</th>
            <th className="px-4 py-3 font-semibold">Total Harga</th>
            <th className="px-4 py-3 font-semibold rounded-r-md">Aksi</th>
          </tr>
        </thead>
        <tbody className="text-[11px] text-black font-medium">
          {data.map((item, index) => {
            const isSudahDiambil = item.status_pengambilan === 'sudah_diambil';

            return (
              <tr key={item.id} className="transition-colors border-b border-gray-100 hover:bg-gray-50/50">
                <td className="px-3 py-4 font-bold text-black">{index + 1}.</td>
                <td className="px-3 py-4 font-bold text-black">ID {item.id?.slice(0, 8).toUpperCase()}</td>
                <td className="px-4 py-4 font-bold text-left sm:text-center">{item.nama_customer}</td>
                
                <td className="px-3 py-4 font-bold">
                  {item.items && item.items.length > 0 
                    ? item.items.reduce((sum, i) => sum + (Number(i.jumlah) || 0), 0) 
                    : (item.jumlah_pre_order || 0)}
                </td>

                <td className="px-3 py-4">
                  <span className={getStatusProduksiClass(item.status)}>
                    {item.status === 'dalam_proses' ? 'Dalam Process' : 
                     item.status === 'selesai_diproses' ? 'Selesai diproses' : 'Sedang diproses'}
                  </span>
                </td>
                <td className="px-3 py-4">
                  <span className={`${getStatusPembayaranClass(item.status_pembayaran)} text-[10px] px-3 py-1 rounded-full font-bold`}>
                    {item.status_pembayaran?.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-4 font-bold text-black">
                  Rp. {item.total_harga?.toLocaleString('id-ID')},00
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center gap-1">
                    
                    {/* TOMBOL KONFIRMASI PRODUK DITERIMA */}
                    <div className="relative inline-block group">
                      <button 
                        onClick={() => handleConfirmReceipt(item)}
                        disabled={isSudahDiambil}
                        className={`p-2 rounded shadow-sm transition-colors ${
                          isSudahDiambil 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                            : 'bg-[#1A335A] hover:bg-[#11223d] text-white cursor-pointer'
                        }`}
                      >
                        <CheckCircle2 size={14} strokeWidth={2.5} />
                      </button>
                      {/* Tooltip Keterangan */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-stone-900 text-white text-[10px] font-medium py-1 px-2 rounded shadow-md whitespace-nowrap z-30 pointer-events-none">
                        {isSudahDiambil ? "Barang Sudah Diambil" : "Konfirmasi Produk Diterima"}
                        <div className="w-1.5 h-1.5 bg-stone-900 rotate-45 absolute top-full left-1/2 -translate-x-1/2 -mt-0.5"></div>
                      </div>
                    </div>
                    
                    {/* TOMBOL DETAIL MATA */}
                    <button 
                      onClick={() => handleOpenDetail(item)}
                      className="bg-[#F2B600] hover:bg-[#d49f00] text-white p-2 rounded shadow-sm transition-colors cursor-pointer" 
                    >
                      <Eye size={14} strokeWidth={2.5} />
                    </button>

                    {/* TOMBOL EDIT */}
                    <button 
                      onClick={() => onEdit && onEdit(item)}
                      disabled={isSudahDiambil}
                      className={`p-2 rounded shadow-sm transition-colors ${
                        isSudahDiambil 
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                          : 'bg-[#1A335A] hover:bg-[#12243f] text-white cursor-pointer'
                      }`}
                      title={isSudahDiambil ? "Pesanan yang sudah diambil tidak dapat diubah" : ""}
                    >
                      <Edit size={14} strokeWidth={2.5} />
                    </button>

                    {/* TOMBOL HAPUS */}
                    <button 
                      onClick={() => onDelete && onDelete(item)}
                      disabled={isSudahDiambil}
                      className={`p-2 rounded shadow-sm transition-colors ${
                        isSudahDiambil 
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                          : 'bg-[#A63636] hover:bg-[#852a2a] text-white cursor-pointer'
                      }`}
                      title={isSudahDiambil ? "Pesanan yang sudah diambil tidak dapat dihapus" : ""}
                    >
                      <Trash2 size={14} strokeWidth={2.5} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Render Komponen Modal Detail */}
      <PORegulerDetailModal 
        isOpen={isModalOpen}
        onClose={handleCloseDetail}
        item={selectedItem}
      />
    </>
  )
}