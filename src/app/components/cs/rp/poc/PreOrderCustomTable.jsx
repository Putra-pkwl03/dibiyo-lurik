'use client';
import React, { useState } from 'react';
import { Eye } from 'lucide-react';
import PODustomDetailModal from './PODustomDetailModal'; 

export default function PreOrderCustomTable({ data }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomPO, setSelectedCustomPO] = useState(null);

  const handleOpenModal = (item) => {
    setSelectedCustomPO(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedCustomPO(null);
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="w-full overflow-x-auto rounded-sm">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-[#1A335A] text-white text-xs tracking-wider">
            <tr>
              <th className="px-4 py-3.5 font-medium text-center w-12">No.</th>
              <th className="px-6 py-3.5 font-medium">Tanggal</th>
              <th className="px-6 py-3.5 font-medium">Id Pre-Order</th>
              <th className="px-6 py-3.5 font-medium">Nama Pelanggan</th>
              <th className="px-6 py-3.5 font-medium">Nomor Telepon</th>
              <th className="px-6 py-3.5 font-medium text-center">Jumlah PO</th>
              <th className="px-6 py-3.5 font-medium">Total Harga</th>
              <th className="px-4 py-3.5 font-medium text-center w-24">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-stone-200 text-stone-800">
            {data.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center text-stone-400">
                  Tidak ada data pre-order custom ditemukan.
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={item.id} className="transition-colors hover:bg-stone-50/60">
                  <td className="px-4 py-4 font-normal text-center">
                    {index + 1}.
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(item.created_at).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    }).replace(/\//g, '-')}
                  </td>
                  <td className="px-6 py-4 font-normal text-stone-600 whitespace-nowrap">
                    {item.id ? `ID ${item.id.slice(0, 8).toUpperCase()}` : '-'}
                  </td>
                  <td className="px-6 py-4 font-normal">{item.nama_customer || '-'}</td>
                  <td className="px-6 py-4 font-normal text-stone-600">{item.kontak_customer || '-'}</td>
                  <td className="px-6 py-4 font-normal text-center">
                    {item.item_pre_order_custom?.length || item.jumlah_po || 1}
                  </td>
                  <td className="px-6 py-4 font-normal whitespace-nowrap">
                    Rp. {item.total_harga?.toLocaleString('id-ID') || 0},00
                  </td>
                  <td className="px-3 py-3 text-center align-middle">
                    <button 
                      onClick={() => handleOpenModal(item)}
                      className="inline-flex flex-col items-center justify-center gap-1 bg-[#F2B600] text-white px-2 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#d6a100] transition-colors shadow-sm mx-auto min-w-[50px]"
                    >
                      <span>Detail</span>
                      <Eye size={14} strokeWidth={3} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Komponen Modal Detail Custom */}
      <PODustomDetailModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        item={selectedCustomPO}
      />
    </>
  );
}