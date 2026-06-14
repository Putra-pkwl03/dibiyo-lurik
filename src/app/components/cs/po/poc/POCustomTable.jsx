'use client'

import { useState } from 'react'
import { Eye, Edit, Trash2, CheckCircle2 } from 'lucide-react'
import Swal from 'sweetalert2'
import PODustomDetailModal from './PODustomDetailModal'
import PoCustomEditModal from './PoCustomEditModal'
import PoCustomHapus from './PoCustomHapus'

export default function POCustomTable({ data, onConfirmReceipt, onEdit, onDelete, onSuccess }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  if (!data || !Array.isArray(data)) {
    return <p className="py-4 text-xs text-center text-gray-400">Data tidak tersedia.</p>;
  }

  const handleOpenDetail = (item) => {
    setSelectedItem(item)
    setIsModalOpen(true)
  }


  const handleOpenEdit = (item) => {
    setSelectedItem(item)
    setIsEditOpen(true)
    if (onEdit) onEdit(item)
  }

  const handleOpenDelete = (item) => {
    setSelectedItem(item)
    setIsDeleteOpen(true)
    if (onDelete) onDelete(item)
  }

  const formatWhatsAppNumber = (phone) => {
    if (!phone) return '';
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.slice(1);
    }
    return cleaned;
  };

  const getStatusProduksiClass = (status) => {
    const map = {
      'sedang_diproses': 'bg-[#A63636]',
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

  const handleConfirmReceipt = (item) => {
    Swal.fire({
      title: 'Konfirmasi Pengambilan',
      text: `Apakah Anda yakin barang custom untuk customer "${item.nama_customer}" sudah diambil?`,
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
          const res = await fetch('/api/pre-order-custom', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: item.id })
          });

          const json = await res.json();

          if (!res.ok) {
            throw new Error(json.error || 'Gagal memperbarui status penerimaan.');
          }

          return true;
        } catch (error) {
          Swal.showValidationMessage(`Error: ${error.message}`);
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Berhasil!',
          text: 'Status pengambilan barang custom berhasil dikonfirmasi.',
          icon: 'success',
          confirmButtonColor: '#1A335A'
        });

        if (onConfirmReceipt) onConfirmReceipt(item.id); 
      }
    });
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-center border-collapse text-[11px] font-inter">

        {/* HEADER */}
        <thead>
          <tr className="bg-[#1A335A] text-white text-xs font-bold">
            <th className="px-3 py-3 font-bold rounded-l-lg">No.</th>
            <th className="px-3 py-3 font-bold">Id Pre-Order</th>
            <th className="px-4 py-3 font-bold">Nama Pelanggan</th>
            <th className="px-4 py-3 font-bold">Kontak</th>
            <th className="px-3 py-3 font-bold">Status Prosedur</th>
            <th className="px-3 py-3 font-bold">Status Pembayaran</th>
            <th className="px-4 py-3 font-bold">Total Harga</th>
            <th className="px-4 py-3 font-bold rounded-r-lg">Aksi</th>
          </tr>
        </thead>

        {/* BODY */}
        <tbody className="text-[11px] text-black">
          {data.map((item, index) => {
            const waFormatted = formatWhatsAppNumber(item.kontak_customer);

            const waMessage = encodeURIComponent(
              `Halo Bapak/Ibu ${item.nama_customer},\n\nKami dari Dibiyo Lurik ingin menginformasikan terkait pesanan Pre-Order Custom Anda dengan ID #POC-${item.id.slice(0, 8).toUpperCase()}.\n\n${
                item.status === 'selesai_diproses'
                  ? `Pesanan Anda telah selesai diproses dan sudah siap untuk otomatis diambil.\n\nSilakan datang ke Dibiyo Lurik untuk melakukan pengambilan pesanan sesuai jadwal yang telah ditentukan.`
                  : item.status === 'sedang_diproses'
                  ? `Saat ini pesanan Anda sedang dalam tahap proses produksi oleh tim kami.\n\nMohon menunggu dengan sabar hingga proses produksi selesai. Kami akan segera menghubungi Anda kembali setelah pesanan siap.`
                  : `Pesanan Anda saat ini masih dalam tahap antrian dan proses pengerjaan.\n\nTim kami sedang mempersiapkan proses produksi pesanan Anda. Mohon menunggu informasi selanjutnya dari kami.`
              }\n\nStatus Pembayaran:\n${
                item.status_pembayaran === 'lunas'
                  ? 'Pembayaran Anda telah kami terima sepenuhnya.'
                  : item.status_pembayaran === 'dp'
                  ? 'Pembayaran uang muka (DP) telah kami terima.'
                  : 'Pembayaran pesanan masih menunggu konfirmasi.'
              }\n\nTotal tagihan pesanan:\nRp ${item.total_harga?.toLocaleString('id-ID')}\n\nTerima kasih telah mempercayakan pesanan Anda kepada Dibiyo Lurik.`
            );

            return (
              <tr
                key={item.id}
                className="transition-colors border-b border-gray-100 hover:bg-gray-50/80"
              >
                {/* NO */}
                <td className="px-3 py-3.5 text-black font-bold">{index + 1}.</td>

                {/* ID */}
                <td className="py-3.5 px-3 text-[#1A335A] font-bold">
                  {item.id.slice(0, 8).toUpperCase()}
                </td>

                {/* NAMA */}
                <td className="px-4 py-3.5 font-medium">{item.nama_customer}</td>

                {/* WHATSAPP */}
                <td className="px-4 py-3.5">
                  {waFormatted ? (
                    <a
                      href={`https://wa.me/${waFormatted}?text=${waMessage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#25D366] hover:text-[#1ebd53] font-bold transition-colors"
                      title="Chat via WhatsApp"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.503-5.713-1.458L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.428 1.98 13.96 .951 11.343.951c-5.44 0-9.866 4.372-9.87 9.8c-.001 1.701.453 3.361 1.314 4.814L1.706 22.28l4.941-1.293z"/>
                      </svg>
                      {item.kontak_customer}
                    </a>
                  ) : (
                    <span className="italic text-gray-400">Tidak ada kontak</span>
                  )}
                </td>

                {/* STATUS PRODUKSI */}
                <td className="px-3 py-3.5">
                  <span className={getStatusProduksiClass(item.status)}>
                    {item.status?.replace('_', ' ').toUpperCase()}
                  </span>
                </td>

                {/* STATUS PEMBAYARAN */}
                <td className="px-3 py-3.5">
                  <span className={`${getStatusPembayaranClass(item.status_pembayaran)} text-[10px] px-2.5 py-0.5 rounded-md font-bold tracking-wide shadow-sm`}>
                    {item.status_pembayaran?.toUpperCase()}
                  </span>
                </td>

                {/* TOTAL */}
                <td className="px-4 py-3.5 font-bold text-gray-700">
                  Rp {item.total_harga?.toLocaleString('id-ID')}
                </td>

                {/* AKSI */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-center gap-1.5">
                    
                    {/* TOMBOL KONFIRMASI PRODUK DITERIMA */}
                    <div className="relative inline-block group">
                      <button 
                        onClick={() => handleConfirmReceipt(item)}
                        className="bg-[#1A335A] hover:bg-[#11223d] text-white p-2.5 rounded-md shadow-sm transition-colors"
                      >
                        <CheckCircle2 size={13} strokeWidth={2.5} />
                      </button>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-stone-900 text-white text-[10px] font-medium py-1 px-2 rounded shadow-md whitespace-nowrap z-30 pointer-events-none">
                        Konfirmasi Produk Diterima
                        <div className="w-1.5 h-1.5 bg-stone-900 rotate-45 absolute top-full left-1/2 -translate-x-1/2 -mt-0.5"></div>
                      </div>
                    </div>

                    {/* EYE BUTTON */}
                    <button 
                      onClick={() => handleOpenDetail(item)}
                      className="bg-[#F2B600] hover:bg-[#d4a001] text-white p-2.5 rounded-md shadow-sm transition-colors"
                    >
                      <Eye size={13} strokeWidth={2.5} />
                    </button>

                    {/* EDIT BUTTON */}
                    <button 
                      onClick={() => handleOpenEdit(item)}
                      className="bg-[#043088] hover:bg-[#032466] text-white p-2.5 rounded-md shadow-sm transition-colors"
                    >
                      <Edit size={13} strokeWidth={2.5} />
                    </button>

                    {/* DELETE BUTTON */}
                    <button 
                      onClick={() => handleOpenDelete(item)}
                      className="bg-[#A63636] hover:bg-[#852b2b] text-white p-2.5 rounded-md shadow-sm transition-colors"
                    >
                      <Trash2 size={13} strokeWidth={2.5} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* RENDER MODAL DETAIL */}
      <PODustomDetailModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={selectedItem}
      />

      {/* RENDER MODAL EDIT */}
      <PoCustomEditModal 
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        item={selectedItem}
        onSuccess={onSuccess}
      />

      {/* RENDER MODAL HAPUS */}
      <PoCustomHapus 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        item={selectedItem}
      />
    </div>
  )
}